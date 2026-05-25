/**
 * R:R (Risk:Reward) Calculation Engine
 * Implements the full calculation logic from PRD_Backend.md §7
 */

export interface TradeCloseInput {
  closePrice: number;
  percentage: number;
  notes?: string;
}

export interface RRInput {
  entryPrice: number;
  slPrice: number;
  tpPrice: number;
  result: "WIN" | "LOSS" | "BREAKEVEN" | "PARTIAL";
  closes: TradeCloseInput[];
}

export interface RRResult {
  riskPips: number;
  rewardPips: number;
  rrTarget: number;
  actualR: number;
}

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Infer trade direction: 1 = long (entry > SL), -1 = short (entry < SL)
 */
function inferDirection(entryPrice: number, slPrice: number): 1 | -1 {
  return entryPrice > slPrice ? 1 : -1;
}

/**
 * Calculate weighted R for partial/multi-close trades.
 * Formula: Σ (percentage/100 × (closePrice - entryPrice) / riskPips × direction)
 */
function calculateWeightedR(
  closes: TradeCloseInput[],
  entryPrice: number,
  riskPips: number,
  direction: 1 | -1
): number {
  if (closes.length === 0 || riskPips === 0) return 0;

  let weightedR = 0;
  for (const close of closes) {
    const percentage = close.percentage / 100;
    const priceDiff = (close.closePrice - entryPrice) * direction;
    const closeR = priceDiff / riskPips;
    weightedR += percentage * closeR;
  }

  return weightedR;
}

/**
 * Calculate actual R based on trade result and close data.
 */
function calculateActualR(input: RRInput, riskPips: number): number {
  if (riskPips === 0) return 0;

  const { entryPrice, tpPrice, result, closes } = input;
  const direction = inferDirection(entryPrice, input.slPrice);

  switch (result) {
    case "WIN": {
      if (closes.length === 0) {
        // Full TP hit → actual R = rrTarget
        return Math.abs(tpPrice - entryPrice) / riskPips;
      }
      // Weighted average from partial closes
      return calculateWeightedR(closes, entryPrice, riskPips, direction);
    }

    case "LOSS": {
      // Full SL hit → actual R = -1
      return -1;
    }

    case "BREAKEVEN": {
      return 0;
    }

    case "PARTIAL": {
      // Mixed partial closes (positive or negative)
      return calculateWeightedR(closes, entryPrice, riskPips, direction);
    }

    default:
      return 0;
  }
}

/**
 * Main R:R calculator — entry point for Server Actions.
 *
 * @example
 * // Full WIN (Long): Entry 1.08500, SL 1.08350, TP 1.08950
 * // riskPips = 0.00150, rewardPips = 0.00450, rrTarget = 3.00, actualR = 3.00
 *
 * @example
 * // LOSS: actualR = -1.00
 *
 * @example
 * // PARTIAL with 2 closes at 50% each:
 * // Close1: 1.08650 (50%) → 1.00R, Close2: 1.08800 (50%) → 2.00R
 * // actualR = 0.5 × 1.00 + 0.5 × 2.00 = 1.50R
 */
export function calculateRR(input: RRInput): RRResult {
  const entryPrice = Number(input.entryPrice);
  const slPrice = Number(input.slPrice);
  const tpPrice = Number(input.tpPrice);

  const riskPips = Math.abs(entryPrice - slPrice);
  const rewardPips = Math.abs(tpPrice - entryPrice);
  const rrTarget = riskPips > 0 ? rewardPips / riskPips : 0;

  const rrInput: RRInput = {
    ...input,
    entryPrice,
    slPrice,
    tpPrice,
    closes: input.closes.map((c) => ({
      ...c,
      closePrice: Number(c.closePrice),
      percentage: Number(c.percentage),
    })),
  };

  const actualR = calculateActualR(rrInput, riskPips);

  return {
    riskPips: round(riskPips, 5),
    rewardPips: round(rewardPips, 5),
    rrTarget: round(rrTarget, 2),
    actualR: round(actualR, 2),
  };
}

/**
 * Calculate consistency score for leaderboard.
 * Formula: winRate × log₁₀(totalTrades) × avgR
 * Minimum 30 trades required.
 */
export function calculateConsistencyScore(
  winRate: number,
  totalTrades: number,
  avgR: number
): number {
  if (totalTrades < 30) return 0;
  return round(winRate * Math.log10(totalTrades) * avgR, 4);
}
