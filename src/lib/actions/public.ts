"use server";

import { prisma } from "@/lib/db/prisma";
import { calculateConsistencyScore } from "@/lib/utils/rr-calculator";

export type LeaderboardEntry = {
  rank: number;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  totalTrades: number;
  winRate: number;
  avgR: number;
  consistencyScore: number;
};

export type PublicMethod = {
  id: string;
  name: string;
  description: string | null;
  tags: string[];
  timeframes: string[];
  authorUsername: string;
  authorDisplayName: string;
  strategyCount: number;
  totalTrades: number;
  winRate: number;
  avgR: number;
  createdAt: Date;
};

export type LeaderboardFilters = {
  instrument?: string;
  sortBy?: "consistencyScore" | "winRate" | "avgR" | "totalTrades";
  page?: number;
};

export type PublicMethodFilters = {
  search?: string;
  tags?: string[];
  sortBy?: "newest" | "winRate" | "trades";
  page?: number;
};

const PAGE_SIZE = 20;

/**
 * Get leaderboard sorted by consistency score
 * Min 30 trades required. Formula: winRate × log₁₀(totalTrades) × avgR
 */
export async function getLeaderboard(
  filters?: LeaderboardFilters
): Promise<LeaderboardEntry[]> {
  const page = filters?.page ?? 1;
  const offset = (page - 1) * PAGE_SIZE;

  // Fetch all users with their trades
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      profile: { select: { displayName: true, avatarUrl: true } },
      backtestSessions: {
        select: {
          trades: {
            where: filters?.instrument
              ? { backtestSession: { instrument: filters.instrument.toUpperCase() } }
              : undefined,
            select: { result: true, actualR: true },
          },
        },
      },
    },
  });

  const entries: LeaderboardEntry[] = [];

  for (const user of users) {
    const trades = user.backtestSessions.flatMap((s) => s.trades);
    const totalTrades = trades.length;

    if (totalTrades < 30) continue;

    const wins = trades.filter(
      (t) => t.result === "WIN" || t.result === "PARTIAL"
    ).length;
    const winRateRatio = wins / totalTrades;
    const winRate = Math.round(winRateRatio * 1000) / 10;

    const totalR = trades.reduce((s, t) => s + Number(t.actualR), 0);
    const avgR = Math.round((totalR / totalTrades) * 100) / 100;

    const consistencyScore = calculateConsistencyScore(winRateRatio, totalTrades, avgR);

    entries.push({
      rank: 0, // assigned below
      username: user.username,
      displayName: user.profile?.displayName ?? user.username,
      avatarUrl: user.profile?.avatarUrl ?? null,
      totalTrades,
      winRate,
      avgR,
      consistencyScore,
    });
  }

  // Sort
  const sortBy = filters?.sortBy ?? "consistencyScore";
  entries.sort((a, b) => b[sortBy] - a[sortBy]);

  // Assign ranks
  entries.forEach((e, i) => {
    e.rank = i + 1;
  });

  return entries.slice(offset, offset + PAGE_SIZE);
}

/**
 * Get public methods library with stats
 */
export async function getPublicMethods(
  filters?: PublicMethodFilters
): Promise<PublicMethod[]> {
  const page = filters?.page ?? 1;
  const offset = (page - 1) * PAGE_SIZE;

  const methods = await prisma.method.findMany({
    where: {
      isPublic: true,
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
      ...(filters?.tags && filters.tags.length > 0 && {
        tags: { hasSome: filters.tags },
      }),
    },
    include: {
      user: {
        select: {
          username: true,
          profile: { select: { displayName: true } },
        },
      },
      timeframes: true,
      _count: { select: { strategies: true } },
      backtestSessions: {
        select: {
          trades: { select: { result: true, actualR: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: PAGE_SIZE,
  });

  const result: PublicMethod[] = methods.map((m) => {
    const trades = m.backtestSessions.flatMap((s) => s.trades);
    const total = trades.length;
    const wins = trades.filter(
      (t) => t.result === "WIN" || t.result === "PARTIAL"
    ).length;
    const winRate = total > 0 ? Math.round((wins / total) * 1000) / 10 : 0;
    const avgR =
      total > 0
        ? Math.round(
            (trades.reduce((s, t) => s + Number(t.actualR), 0) / total) * 100
          ) / 100
        : 0;

    return {
      id: m.id,
      name: m.name,
      description: m.description,
      tags: m.tags,
      timeframes: m.timeframes.map((tf) => tf.timeframe),
      authorUsername: m.user.username,
      authorDisplayName: m.user.profile?.displayName ?? m.user.username,
      strategyCount: m._count.strategies,
      totalTrades: total,
      winRate,
      avgR,
      createdAt: m.createdAt,
    };
  });

  // Sort by requested field
  if (filters?.sortBy === "winRate") result.sort((a, b) => b.winRate - a.winRate);
  else if (filters?.sortBy === "trades") result.sort((a, b) => b.totalTrades - a.totalTrades);

  return result;
}

/**
 * Get a public profile by username
 */
export async function getPublicProfileByUsername(username: string) {
  const dbUser = await prisma.user.findUnique({
    where: { username },
    include: {
      profile: true,
      methods: {
        where: { isPublic: true },
        include: {
          timeframes: true,
          _count: { select: { strategies: true } },
        },
      },
      _count: { select: { methods: true, backtestSessions: true } },
    },
  });

  if (!dbUser) return null;

  const trades = await prisma.trade.findMany({
    where: { backtestSession: { userId: dbUser.id } },
    select: { result: true, actualR: true },
  });

  const totalTrades = trades.length;
  const wins = trades.filter(
    (t) => t.result === "WIN" || t.result === "PARTIAL"
  ).length;
  const winRateRatio = totalTrades > 0 ? wins / totalTrades : 0;
  const winRate = Math.round(winRateRatio * 1000) / 10;
  const totalR = trades.reduce((s, t) => s + Number(t.actualR), 0);
  const avgR = totalTrades > 0 ? Math.round((totalR / totalTrades) * 100) / 100 : 0;
  const consistencyScore = calculateConsistencyScore(winRateRatio, totalTrades, avgR);

  return {
    username: dbUser.username,
    displayName: dbUser.profile?.displayName ?? dbUser.username,
    bio: dbUser.profile?.bio ?? null,
    avatarUrl: dbUser.profile?.avatarUrl ?? null,
    publicMethods: dbUser.methods,
    stats: {
      totalTrades,
      winRate,
      avgR,
      consistencyScore,
      totalMethods: dbUser._count.methods,
      totalSessions: dbUser._count.backtestSessions,
    },
  };
}

/**
 * Get aggregate platform stats for landing page
 */
export async function getPlatformStats() {
  const [totalUsers, totalTrades, totalMethods] = await Promise.all([
    prisma.user.count(),
    prisma.trade.count(),
    prisma.method.count({ where: { isPublic: true } }),
  ]);

  return { totalUsers, totalTrades, totalMethods };
}
