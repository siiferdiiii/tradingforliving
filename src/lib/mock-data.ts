import { Method, Strategy, TradingSession, Trade, UserProfile, DashboardStats } from "@/types";

// Base Mock Data
export const MOCK_PROFILE: UserProfile = {
  id: "user-1",
  username: "trader_legend",
  displayName: "Alex Rivera",
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
  bio: "Full-time price action trader focusing on Forex majors and Gold. Aiming for consistent compounding.",
  winRate: 64.2,
  totalTrades: 126,
  profitFactor: 2.45,
  rank: 12,
  isPublic: true
};

export const MOCK_METHODS: Method[] = [
  {
    id: "m-1",
    name: "SMC (Smart Money Concepts)",
    description: "Trading based on market structure, order blocks, liquidity sweeps, and fair value gaps (FVG) in high-volume killzones.",
    winRate: 68.4,
    profitFactor: 2.8,
    totalTrades: 76,
    avgR: 3.2,
    isPublic: true,
    creatorId: "user-1",
    creatorName: "Alex Rivera",
    creatorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    createdAt: "2026-01-15T08:00:00Z",
    strategiesCount: 3
  },
  {
    id: "m-2",
    name: "ICT Silver Bullet",
    description: "Specific time-based setup that triggers during NY and London killzones, aiming for a 10-15 pip run using FVG.",
    winRate: 59.1,
    profitFactor: 1.9,
    totalTrades: 44,
    avgR: 2.1,
    isPublic: true,
    creatorId: "user-1",
    creatorName: "Alex Rivera",
    creatorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    createdAt: "2026-02-10T12:00:00Z",
    strategiesCount: 2
  },
  {
    id: "m-3",
    name: "Trend Reversal divergence",
    description: "Identifying exhaustion points at key support/resistance using RSI divergences combined with engulfing candles.",
    winRate: 50.0,
    profitFactor: 1.4,
    totalTrades: 26,
    avgR: 2.5,
    isPublic: false,
    creatorId: "user-1",
    creatorName: "Alex Rivera",
    creatorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    createdAt: "2026-03-01T15:30:00Z",
    strategiesCount: 1
  }
];

export const MOCK_STRATEGIES: Strategy[] = [
  // SMC Strategies
  {
    id: "s-1-1",
    methodId: "m-1",
    name: "Order Block Refinement",
    description: "Refining H4 order blocks to M15 and entering with a market structure shift (MSS) on the M1/M5 chart.",
    rules: [
      "Identify H4 key level / bias",
      "Wait for sweep of liquidity in London or NY session",
      "Look for M15 Order Block tap",
      "Enter on M1 market structure shift with displacement",
      "Set stop loss behind swing high/low, target 3R-5R"
    ],
    winRate: 71.1,
    totalTrades: 38,
    avgR: 3.5,
    createdAt: "2026-01-16T09:00:00Z"
  },
  {
    id: "s-1-2",
    methodId: "m-1",
    name: "FVG Mitigation entry",
    description: "Trading displacement legs directly by placing limit orders at the 50% equilibrium of the Fair Value Gap.",
    rules: [
      "Find strong impulse move breaking structure",
      "Mark FVG on M5 or M15 timeframe",
      "Place limit order at 50% (consequent encroachment) of the FVG",
      "Stop loss below/above the candle before FVG",
      "Target nearest liquidity pool (previous session high/low)"
    ],
    winRate: 65.8,
    totalTrades: 38,
    avgR: 2.9,
    createdAt: "2026-01-20T10:00:00Z"
  },
  // ICT Silver Bullet Strategies
  {
    id: "s-2-1",
    methodId: "m-2",
    name: "NY AM Silver Bullet (10:00 - 11:00 AM)",
    description: "Trading the silver bullet window between 10 AM and 11 AM EST. Look for liquidity sweeps and FVG.",
    rules: [
      "Wait until 10:00 AM EST precisely",
      "Look for liquidity sweep of NY AM session high/low",
      "Wait for first displacement FVG in opposite direction",
      "Enter on FVG tap, target 10-15 pips",
      "Close position before 11:00 AM EST"
    ],
    winRate: 61.5,
    totalTrades: 26,
    avgR: 2.2,
    createdAt: "2026-02-11T13:00:00Z"
  },
  {
    id: "s-2-2",
    methodId: "m-2",
    name: "London Open Silver Bullet (3:00 - 4:00 AM)",
    description: "Trading the London session silver bullet window. Highly volatile but high reward setups.",
    rules: [
      "Wait until 3:00 AM EST",
      "Look for Asia session high/low sweep",
      "Identify M5 displacement FVG in direction of bias",
      "Enter at FVG, stop above/below swing",
      "Target 2R minimum"
    ],
    winRate: 55.6,
    totalTrades: 18,
    avgR: 2.0,
    createdAt: "2026-02-12T04:00:00Z"
  },
  // Trend Reversal
  {
    id: "s-3-1",
    methodId: "m-3",
    name: "RSI Divergence + Engulfing",
    description: "Bullish or bearish divergence on H1 chart in oversold/overbought zone, entered on engulfing candle.",
    rules: [
      "Find RSI divergence on H1 timeframe at support/resistance",
      "Wait for M15 engulfing reversal candle structure",
      "Enter at close of engulfing candle",
      "Stop loss 5 pips below swing low",
      "Target 1:2 Risk to Reward"
    ],
    winRate: 50.0,
    totalTrades: 26,
    avgR: 2.5,
    createdAt: "2026-03-02T16:00:00Z"
  }
];

export const MOCK_SESSIONS: TradingSession[] = [
  {
    id: "sess-1",
    name: "Mei 2026 - Forex Scaling Session",
    date: "2026-05-01",
    status: "active",
    startBalance: 10000,
    endBalance: 11450,
    totalTrades: 15,
    winRate: 66.7,
    netProfit: 1450,
    notes: "Fokus pada disiplin SMC dan ICT Silver Bullet. Menghindari overtrade di sesi Asia.",
    createdAt: "2026-05-01T08:00:00Z"
  },
  {
    id: "sess-2",
    name: "April 2026 - Challenge A100k Phase 1",
    date: "2026-04-01",
    status: "completed",
    startBalance: 100000,
    endBalance: 108250,
    totalTrades: 32,
    winRate: 62.5,
    netProfit: 8250,
    notes: "Lolos Challenge Akun Evaluasi 100k VercelProp. Winrate solid, profit factor sangat baik di 2.3.",
    createdAt: "2026-04-01T08:00:00Z"
  },
  {
    id: "sess-3",
    name: "Maret 2026 - BTC Daily Compounding",
    date: "2026-03-01",
    status: "completed",
    startBalance: 5000,
    endBalance: 5620,
    totalTrades: 20,
    winRate: 55.0,
    netProfit: 620,
    notes: "Mencoba scalping BTC di akhir pekan menggunakan SMC M1. Hasil lumayan tapi melelahkan secara psikologis.",
    createdAt: "2026-03-01T09:00:00Z"
  }
];

export const MOCK_TRADES: Trade[] = [
  // Trades for Session 1 (Active)
  {
    id: "t-1",
    sessionId: "sess-1",
    methodId: "m-1",
    methodName: "SMC (Smart Money Concepts)",
    strategyId: "s-1-1",
    strategyName: "Order Block Refinement",
    pair: "EURUSD",
    type: "long",
    entryPrice: 1.08520,
    exitPrice: 1.08880,
    stopLoss: 1.08410,
    takeProfit: 1.08900,
    size: 2.0,
    rr: 3.27,
    pnl: 720,
    result: "win",
    entryImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&h=400&q=80",
    exitImage: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&h=400&q=80",
    notes: "Perfect tap of M15 Order Block inside London Killzone. Clean market structure shift on M1. Trade held for 2 hours.",
    createdAt: "2026-05-02T09:15:00Z"
  },
  {
    id: "t-2",
    sessionId: "sess-1",
    methodId: "m-1",
    methodName: "SMC (Smart Money Concepts)",
    strategyId: "s-1-2",
    strategyName: "FVG Mitigation entry",
    pair: "GBPUSD",
    type: "short",
    entryPrice: 1.25450,
    exitPrice: 1.25620,
    stopLoss: 1.25600,
    takeProfit: 1.25000,
    size: 1.5,
    rr: 3.0,
    pnl: -255,
    result: "loss",
    entryImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&h=400&q=80",
    notes: "Limit order was hit but price continued running, sweeping the high before reversing. Should have placed stop loss wider.",
    createdAt: "2026-05-05T14:30:00Z"
  },
  {
    id: "t-3",
    sessionId: "sess-1",
    methodId: "m-2",
    methodName: "ICT Silver Bullet",
    strategyId: "s-2-1",
    strategyName: "NY AM Silver Bullet (10:00 - 11:00 AM)",
    pair: "GOLD (XAUUSD)",
    type: "long",
    entryPrice: 2320.50,
    exitPrice: 2332.00,
    stopLoss: 2315.50,
    takeProfit: 2335.00,
    size: 0.5,
    rr: 2.3,
    pnl: 575,
    result: "win",
    entryImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&h=400&q=80",
    notes: "Silver bullet window trade. Sweep of NY PM low, displacement back up. Perfect execution.",
    createdAt: "2026-05-12T15:10:00Z"
  },
  {
    id: "t-4",
    sessionId: "sess-1",
    methodId: "m-2",
    methodName: "ICT Silver Bullet",
    strategyId: "s-2-1",
    strategyName: "NY AM Silver Bullet (10:00 - 11:00 AM)",
    pair: "EURUSD",
    type: "long",
    entryPrice: 1.09120,
    exitPrice: 1.09120,
    stopLoss: 1.08980,
    takeProfit: 1.09500,
    size: 2.5,
    rr: 2.7,
    pnl: 0,
    result: "breakeven",
    notes: "Moved stop loss to entry after 1.5R. Price reversed shortly after and stopped me out. Good risk management.",
    createdAt: "2026-05-15T15:20:00Z"
  },
  {
    id: "t-5",
    sessionId: "sess-1",
    methodId: "m-1",
    methodName: "SMC (Smart Money Concepts)",
    strategyId: "s-1-1",
    strategyName: "Order Block Refinement",
    pair: "USDJPY",
    type: "short",
    entryPrice: 155.800,
    exitPrice: 155.450,
    stopLoss: 156.000,
    takeProfit: 155.000,
    size: 2.0,
    rr: 4.0,
    pnl: 700,
    result: "win",
    notes: "H4 bearish trend in play. tapping M15 order block, quick drop. Partial profit taken and let the rest run.",
    createdAt: "2026-05-20T07:45:00Z"
  },
  {
    id: "t-6",
    sessionId: "sess-1",
    methodId: "m-3",
    methodName: "Trend Reversal divergence",
    strategyId: "s-3-1",
    strategyName: "RSI Divergence + Engulfing",
    pair: "GBPUSD",
    type: "long",
    entryPrice: 1.26200,
    exitPrice: 1.26000,
    stopLoss: 1.26000,
    takeProfit: 1.26600,
    size: 1.5,
    rr: 2.0,
    pnl: -300,
    result: "loss",
    notes: "RSI divergence on H1, but trend was too strong down. Stopped out immediately. Counter-trend trading is risky.",
    createdAt: "2026-05-22T13:10:00Z"
  },
  {
    id: "t-7",
    sessionId: "sess-1",
    methodId: "m-1",
    methodName: "SMC (Smart Money Concepts)",
    strategyId: "s-1-2",
    strategyName: "FVG Mitigation entry",
    pair: "EURUSD",
    type: "long",
    entryPrice: 1.08800,
    exitPrice: 1.08810,
    stopLoss: 1.08650,
    takeProfit: 1.09200,
    size: 2.0,
    rr: 2.67,
    pnl: 20,
    result: "breakeven",
    notes: "Quick scratch before the news release. Wise decision as news wiped out the FVG.",
    createdAt: "2026-05-24T12:00:00Z"
  }
];

export const MOCK_LEADERBOARD: UserProfile[] = [
  { id: "u-1", username: "trader_legend", displayName: "Alex Rivera", avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80", bio: "Forex pricing action wizard", winRate: 64.2, totalTrades: 126, profitFactor: 2.45, rank: 1, isPublic: true },
  { id: "u-2", username: "smart_money_girl", displayName: "Sarah Chen", avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80", bio: "SMC practitioner / Funded trader", winRate: 61.8, totalTrades: 94, profitFactor: 2.21, rank: 2, isPublic: true },
  { id: "u-3", username: "ict_disciple", displayName: "Michael Vance", avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80", bio: "ICT is my religion. Scalper.", winRate: 58.5, totalTrades: 210, profitFactor: 1.95, rank: 3, isPublic: true },
  { id: "u-4", username: "crypto_whale", displayName: "Devon Miller", avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80", bio: "BTC and ETH swing trader. Long term compounder.", winRate: 52.3, totalTrades: 88, profitFactor: 1.82, rank: 4, isPublic: true },
  { id: "u-5", username: "risk_manager", displayName: "Jessica Taylor", avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&h=150&q=80", bio: "R:R is everything. Capital preservation first.", winRate: 50.2, totalTrades: 154, profitFactor: 1.68, rank: 5, isPublic: true }
];

// Helper to manage custom local data (Simulate Database with LocalStorage)
export class DatabaseManager {
  private static isClient = typeof window !== 'undefined';

  private static get<T>(key: string, fallback: T): T {
    if (!this.isClient) return fallback;
    const item = localStorage.getItem(`tradelog_${key}`);
    return item ? JSON.parse(item) : fallback;
  }

  private static set(key: string, value: any): void {
    if (!this.isClient) return;
    localStorage.setItem(`tradelog_${key}`, JSON.stringify(value));
  }

  static getProfile(): UserProfile {
    return this.get("profile", MOCK_PROFILE);
  }

  static saveProfile(profile: UserProfile): void {
    this.set("profile", profile);
  }

  static getMethods(): Method[] {
    return this.get("methods", MOCK_METHODS);
  }

  static saveMethods(methods: Method[]): void {
    this.set("methods", methods);
  }

  static getStrategies(): Strategy[] {
    return this.get("strategies", MOCK_STRATEGIES);
  }

  static saveStrategies(strategies: Strategy[]): void {
    this.set("strategies", strategies);
  }

  static getSessions(): TradingSession[] {
    return this.get("sessions", MOCK_SESSIONS);
  }

  static saveSessions(sessions: TradingSession[]): void {
    this.set("sessions", sessions);
  }

  static getTrades(): Trade[] {
    return this.get("trades", MOCK_TRADES);
  }

  static saveTrades(trades: Trade[]): void {
    this.set("trades", trades);
  }

  // Dashboard Stats Calculations
  static getStats(): DashboardStats {
    const trades = this.getTrades();
    const sessions = this.getSessions();
    const activeSession = sessions.find(s => s.status === 'active') || sessions[0];
    
    const startBalance = activeSession ? activeSession.startBalance : 10000;
    
    // Total stats
    const totalTrades = trades.length;
    const wins = trades.filter(t => t.result === 'win');
    const losses = trades.filter(t => t.result === 'loss');
    
    const winRate = totalTrades > 0 ? (wins.length / totalTrades) * 100 : 0;
    
    const totalWinAmount = wins.reduce((sum, t) => sum + Math.abs(t.pnl), 0);
    const totalLossAmount = losses.reduce((sum, t) => sum + Math.abs(t.pnl), 0);
    
    const profitFactor = totalLossAmount > 0 ? totalWinAmount / totalLossAmount : totalWinAmount > 0 ? 99.9 : 0;
    const netProfit = trades.reduce((sum, t) => sum + t.pnl, 0);
    const avgR = totalTrades > 0 ? trades.reduce((sum, t) => sum + t.rr, 0) / totalTrades : 0;

    // Equity Curve
    let currentBalance = startBalance;
    const equityCurve = [{ date: "Start", balance: startBalance }];
    
    // Sort trades chronologically
    const sortedTrades = [...trades].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    sortedTrades.forEach(trade => {
      currentBalance += trade.pnl;
      const dateStr = new Date(trade.createdAt).toLocaleDateString("id-ID", { day: '2-digit', month: 'short' });
      equityCurve.push({ date: dateStr, balance: currentBalance });
    });

    // Consecutive wins/losses
    let maxWins = 0;
    let maxLosses = 0;
    let currWins = 0;
    let currLosses = 0;
    
    sortedTrades.forEach(t => {
      if (t.result === 'win') {
        currWins++;
        currLosses = 0;
        maxWins = Math.max(maxWins, currWins);
      } else if (t.result === 'loss') {
        currLosses++;
        currWins = 0;
        maxLosses = Math.max(maxLosses, currLosses);
      } else {
        // breakeven doesn't break streaks according to some, but let's reset to keep it simple
        currWins = 0;
        currLosses = 0;
      }
    });

    // Pair distribution
    const pairsMap: Record<string, { count: number; wins: number }> = {};
    trades.forEach(t => {
      if (!pairsMap[t.pair]) pairsMap[t.pair] = { count: 0, wins: 0 };
      pairsMap[t.pair].count++;
      if (t.result === 'win') pairsMap[t.pair].wins++;
    });
    const pairDistribution = Object.entries(pairsMap).map(([pair, data]) => ({
      pair,
      count: data.count,
      winRate: (data.wins / data.count) * 100
    })).sort((a, b) => b.count - a.count);

    // Method distribution
    const methodsMap: Record<string, { count: number; wins: number }> = {};
    trades.forEach(t => {
      if (!methodsMap[t.methodName]) methodsMap[t.methodName] = { count: 0, wins: 0 };
      methodsMap[t.methodName].count++;
      if (t.result === 'win') methodsMap[t.methodName].wins++;
    });
    const methodDistribution = Object.entries(methodsMap).map(([methodName, data]) => ({
      methodName,
      count: data.count,
      winRate: (data.wins / data.count) * 100
    })).sort((a, b) => b.count - a.count);

    // Type distribution (long/short)
    let longCount = 0;
    let longWins = 0;
    let shortCount = 0;
    let shortWins = 0;
    
    trades.forEach(t => {
      if (t.type === 'long') {
        longCount++;
        if (t.result === 'win') longWins++;
      } else {
        shortCount++;
        if (t.result === 'win') shortWins++;
      }
    });

    const typeDistribution = [
      { type: 'long' as const, count: longCount, winRate: longCount > 0 ? (longWins / longCount) * 100 : 0 },
      { type: 'short' as const, count: shortCount, winRate: shortCount > 0 ? (shortWins / shortCount) * 100 : 0 }
    ];

    return {
      totalTrades,
      winRate: parseFloat(winRate.toFixed(1)),
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      netProfit,
      avgR: parseFloat(avgR.toFixed(2)),
      consecutiveWins: maxWins,
      consecutiveLosses: maxLosses,
      equityCurve,
      pairDistribution,
      methodDistribution,
      typeDistribution
    };
  }
}
