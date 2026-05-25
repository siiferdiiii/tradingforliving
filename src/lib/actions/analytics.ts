"use server";

import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/actions/auth";

export type DashboardStats = {
  totalTrades: number;
  winRate: number;
  avgR: number;
  profitFactor: number;
  bestStrategy: { name: string; winRate: number } | null;
};

export type EquityPoint = {
  index: number;
  date: string;
  cumulativeR: number;
  result: string;
  actualR: number;
};

export type ConceptStat = {
  conceptId: string;
  conceptName: string;
  totalTrades: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  avgR: number;
};

export type TimeframeStat = {
  timeframe: string;
  totalTrades: number;
  winCount: number;
  winRate: number;
  avgR: number;
};

export type SessionBreakdownStat = {
  session: string;
  totalTrades: number;
  winCount: number;
  winRate: number;
  avgR: number;
};

export type MethodStat = {
  methodId: string;
  methodName: string;
  totalTrades: number;
  winRate: number;
  avgR: number;
};

export type AnalyticsFilters = {
  methodId?: string;
  strategyId?: string;
  sessionId?: string;
  dateFrom?: Date;
  dateTo?: Date;
};

function buildTradeWhereClause(userId: string, filters?: AnalyticsFilters) {
  return {
    backtestSession: {
      userId,
      ...(filters?.methodId && { methodId: filters.methodId }),
      ...(filters?.strategyId && { strategyId: filters.strategyId }),
      ...(filters?.sessionId && { id: filters.sessionId }),
    },
    ...(filters?.dateFrom && { tradeDate: { gte: filters.dateFrom } }),
    ...(filters?.dateTo && { tradeDate: { lte: filters.dateTo } }),
  };
}

/**
 * Dashboard overview stats
 */
export async function getDashboardStats(
  filters?: AnalyticsFilters
): Promise<DashboardStats> {
  const user = await getSession();
  if (!user) {
    return { totalTrades: 0, winRate: 0, avgR: 0, profitFactor: 0, bestStrategy: null };
  }

  const where = buildTradeWhereClause(user.id, filters);

  const trades = await prisma.trade.findMany({
    where,
    select: { result: true, actualR: true },
  });

  const totalTrades = trades.length;
  if (totalTrades === 0) {
    return { totalTrades: 0, winRate: 0, avgR: 0, profitFactor: 0, bestStrategy: null };
  }

  const wins = trades.filter((t) => t.result === "WIN" || t.result === "PARTIAL").length;
  const winRate = Math.round((wins / totalTrades) * 1000) / 10;

  const totalR = trades.reduce((sum, t) => sum + Number(t.actualR), 0);
  const avgR = Math.round((totalR / totalTrades) * 100) / 100;

  const positiveR = trades
    .filter((t) => Number(t.actualR) > 0)
    .reduce((sum, t) => sum + Number(t.actualR), 0);
  const negativeR = Math.abs(
    trades
      .filter((t) => Number(t.actualR) < 0)
      .reduce((sum, t) => sum + Number(t.actualR), 0)
  );
  const profitFactor = negativeR === 0 ? positiveR : Math.round((positiveR / negativeR) * 100) / 100;

  // Best strategy by win rate (min 5 trades)
  const strategies = await prisma.strategy.findMany({
    where: { method: { userId: user.id } },
    select: {
      id: true,
      name: true,
      backtestSessions: {
        select: {
          trades: {
            where,
            select: { result: true },
          },
        },
      },
    },
  });

  let bestStrategy: DashboardStats["bestStrategy"] = null;
  let bestWinRate = -1;

  for (const strategy of strategies) {
    const stratTrades = strategy.backtestSessions.flatMap((s) => s.trades);
    if (stratTrades.length < 5) continue;
    const stratWins = stratTrades.filter(
      (t) => t.result === "WIN" || t.result === "PARTIAL"
    ).length;
    const stratWinRate = (stratWins / stratTrades.length) * 100;
    if (stratWinRate > bestWinRate) {
      bestWinRate = stratWinRate;
      bestStrategy = {
        name: strategy.name,
        winRate: Math.round(stratWinRate * 10) / 10,
      };
    }
  }

  return { totalTrades, winRate, avgR, profitFactor, bestStrategy };
}

/**
 * Equity curve: cumulative R over time
 */
export async function getEquityCurveData(
  filters?: AnalyticsFilters
): Promise<EquityPoint[]> {
  const user = await getSession();
  if (!user) return [];

  const trades = await prisma.trade.findMany({
    where: buildTradeWhereClause(user.id, filters),
    select: { tradeDate: true, result: true, actualR: true },
    orderBy: { tradeDate: "asc" },
  });

  let cumulative = 0;
  return trades.map((t, i) => {
    cumulative += Number(t.actualR);
    return {
      index: i + 1,
      date: t.tradeDate.toISOString().slice(0, 10),
      cumulativeR: Math.round(cumulative * 100) / 100,
      result: t.result,
      actualR: Number(t.actualR),
    };
  });
}

/**
 * Concept breakdown: win rate & avg R per concept
 */
export async function getConceptBreakdown(
  filters?: AnalyticsFilters
): Promise<ConceptStat[]> {
  const user = await getSession();
  if (!user) return [];

  const concepts = await prisma.strategyConcept.findMany({
    where: { strategy: { method: { userId: user.id } } },
    select: {
      id: true,
      name: true,
      tradeConcepts: {
        where: {
          isPresent: true,
          trade: buildTradeWhereClause(user.id, filters),
        },
        select: {
          trade: { select: { result: true, actualR: true } },
        },
      },
    },
  });

  return concepts
    .map((c) => {
      const trades = c.tradeConcepts.map((tc) => tc.trade);
      const total = trades.length;
      if (total === 0) return null;
      const wins = trades.filter(
        (t) => t.result === "WIN" || t.result === "PARTIAL"
      ).length;
      const losses = trades.filter((t) => t.result === "LOSS").length;
      const avgR =
        Math.round(
          (trades.reduce((s, t) => s + Number(t.actualR), 0) / total) * 100
        ) / 100;
      return {
        conceptId: c.id,
        conceptName: c.name,
        totalTrades: total,
        winCount: wins,
        lossCount: losses,
        winRate: Math.round((wins / total) * 1000) / 10,
        avgR,
      };
    })
    .filter(Boolean) as ConceptStat[];
}

/**
 * Timeframe breakdown: win rate & avg R per trigger timeframe
 */
export async function getTimeframeBreakdown(
  filters?: AnalyticsFilters
): Promise<TimeframeStat[]> {
  const user = await getSession();
  if (!user) return [];

  const trades = await prisma.trade.findMany({
    where: buildTradeWhereClause(user.id, filters),
    select: { timeframeTrigger: true, result: true, actualR: true },
  });

  const map = new Map<string, { wins: number; total: number; totalR: number }>();
  for (const t of trades) {
    const tf = t.timeframeTrigger;
    if (!map.has(tf)) map.set(tf, { wins: 0, total: 0, totalR: 0 });
    const entry = map.get(tf)!;
    entry.total++;
    entry.totalR += Number(t.actualR);
    if (t.result === "WIN" || t.result === "PARTIAL") entry.wins++;
  }

  return Array.from(map.entries()).map(([tf, stats]) => ({
    timeframe: tf,
    totalTrades: stats.total,
    winCount: stats.wins,
    winRate: Math.round((stats.wins / stats.total) * 1000) / 10,
    avgR: Math.round((stats.totalR / stats.total) * 100) / 100,
  }));
}

/**
 * Session breakdown: win rate & avg R per trading session (ASIA, LONDON, etc.)
 */
export async function getSessionBreakdown(
  filters?: AnalyticsFilters
): Promise<SessionBreakdownStat[]> {
  const user = await getSession();
  if (!user) return [];

  const trades = await prisma.trade.findMany({
    where: buildTradeWhereClause(user.id, filters),
    select: { session: true, result: true, actualR: true },
  });

  const map = new Map<string, { wins: number; total: number; totalR: number }>();
  for (const t of trades) {
    const s = t.session;
    if (!map.has(s)) map.set(s, { wins: 0, total: 0, totalR: 0 });
    const entry = map.get(s)!;
    entry.total++;
    entry.totalR += Number(t.actualR);
    if (t.result === "WIN" || t.result === "PARTIAL") entry.wins++;
  }

  return Array.from(map.entries()).map(([session, stats]) => ({
    session,
    totalTrades: stats.total,
    winCount: stats.wins,
    winRate: Math.round((stats.wins / stats.total) * 1000) / 10,
    avgR: Math.round((stats.totalR / stats.total) * 100) / 100,
  }));
}

/**
 * Method breakdown: win rate & avg R per method
 */
export async function getMethodBreakdown(): Promise<MethodStat[]> {
  const user = await getSession();
  if (!user) return [];

  const methods = await prisma.method.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      name: true,
      backtestSessions: {
        select: {
          trades: {
            select: { result: true, actualR: true },
          },
        },
      },
    },
  });

  return methods
    .map((m) => {
      const trades = m.backtestSessions.flatMap((s) => s.trades);
      if (trades.length === 0) return null;
      const wins = trades.filter(
        (t) => t.result === "WIN" || t.result === "PARTIAL"
      ).length;
      const totalR = trades.reduce((s, t) => s + Number(t.actualR), 0);
      return {
        methodId: m.id,
        methodName: m.name,
        totalTrades: trades.length,
        winRate: Math.round((wins / trades.length) * 1000) / 10,
        avgR: Math.round((totalR / trades.length) * 100) / 100,
      };
    })
    .filter(Boolean) as MethodStat[];
}

/**
 * R distribution: array of actual R values for histogram
 */
export async function getRDistribution(
  filters?: AnalyticsFilters
): Promise<number[]> {
  const user = await getSession();
  if (!user) return [];

  const trades = await prisma.trade.findMany({
    where: buildTradeWhereClause(user.id, filters),
    select: { actualR: true },
    orderBy: { tradeDate: "asc" },
  });

  return trades.map((t) => Number(t.actualR));
}
