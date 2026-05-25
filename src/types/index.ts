export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  winRate: number;
  totalTrades: number;
  profitFactor: number;
  rank: number;
  isPublic: boolean;
}

export interface Method {
  id: string;
  name: string;
  description: string;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  avgR: number;
  isPublic: boolean;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  createdAt: string;
  strategiesCount: number;
  tags?: string[];
  timeframes?: string[];
}

export interface Strategy {
  id: string;
  methodId: string;
  name: string;
  description: string;
  rules: string[];
  winRate: number;
  totalTrades: number;
  avgR: number;
  createdAt: string;
  concepts?: string[];
  sessions?: string[];
  triggerEntry?: string;
  slRule?: string;
  tpRule?: string;
}

export interface TradingSession {
  id: string;
  name: string;
  date: string;
  status: 'active' | 'completed';
  startBalance: number;
  endBalance: number;
  totalTrades: number;
  winRate: number;
  netProfit: number;
  notes: string;
  createdAt: string;
  methodId?: string;
  strategyId?: string;
  instrument?: string;
  periodStart?: string;
  periodEnd?: string;
}

export interface Trade {
  id: string;
  sessionId: string;
  methodId: string;
  methodName: string;
  strategyId: string;
  strategyName: string;
  pair: string;
  type: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  size?: number; // lot size or position size
  rr: number; // Risk-to-Reward ratio
  pnl: number;
  result: 'win' | 'loss' | 'breakeven';
  entryImage?: string;
  exitImage?: string;
  notes?: string;
  createdAt: string;
  mood?: string;
  session?: string;
  timeframeTrigger?: string;
  conceptsChecked?: string[];
  closes?: { price: number; percentage: number; notes?: string }[];
}

export interface DashboardStats {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  netProfit: number;
  avgR: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  equityCurve: { date: string; balance: number }[];
  pairDistribution: { pair: string; count: number; winRate: number }[];
  methodDistribution: { methodName: string; count: number; winRate: number }[];
  typeDistribution: { type: 'long' | 'short'; count: number; winRate: number }[];
}
