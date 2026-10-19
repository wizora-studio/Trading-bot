import type { Trade } from "@/domain/types";
import { d, type Dec, sum } from "./decimal";
import { type ConfidenceInfo, confidenceOfMean } from "./confidence";
import { holdingMs, tradeCosts, tradeNet, tradeR } from "./trade";

export interface CoreMetrics {
  n: number;
  wins: number;
  losses: number;
  breakevens: number;
  winRate: Dec | null;
  lossRate: Dec | null;
  breakevenRate: Dec | null;
  netPnl: Dec;
  grossProfit: Dec;
  grossLoss: Dec;
  /** Sum of gross P&L of trades that were positive before costs. */
  grossProfitBeforeCosts: Dec;
  totalCosts: Dec;
  costsPctOfGrossProfit: Dec | null;
  avgWin: Dec | null;
  avgLoss: Dec | null;
  payoffRatio: Dec | null;
  expectancy: Dec | null;
  profitFactor: Dec | null;
  avgR: Dec | null;
  rCount: number;
  avgRWinners: Dec | null;
  avgRLosers: Dec | null;
  largestWin: Dec | null;
  largestLoss: Dec | null;
  /** Share of total net profit that came from the single best trade (and the best 3). */
  top1Share: Dec | null;
  top3Share: Dec | null;
  maxConsecutiveWins: number;
  maxConsecutiveLosses: number;
  avgHoldingMs: number | null;
  avgHoldingWinnersMs: number | null;
  avgHoldingLosersMs: number | null;
  longCount: number;
  shortCount: number;
  expectancyConfidence: ConfidenceInfo;
  rConfidence: ConfidenceInfo;
}

export type Outcome = "WIN" | "LOSS" | "BREAKEVEN";

/** Classifies a trade by net P&L with a breakeven tolerance (|net| < tolerance → breakeven). */
export function outcomeOf(net: Dec, tolerance: Dec): Outcome {
  if (net.abs().lt(tolerance)) return "BREAKEVEN";
  return net.gt(0) ? "WIN" : "LOSS";
}

/** Sorts trades by close time (oldest first). Ties keep their original order. */
export function byCloseTime(trades: Trade[]): Trade[] {
  return [...trades].sort((a, b) => a.closeTime.localeCompare(b.closeTime));
}

const avg = (xs: Dec[]): Dec | null => (xs.length ? sum(xs).div(xs.length) : null);
const avgNum = (xs: number[]): number | null => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

/**
 * Computes all core performance metrics from closed trades.
 * Formulas (see docs/handbook): win rate = wins ÷ n; expectancy = net ÷ n;
 * profit factor = gross profit ÷ gross loss (null when there are no losses);
 * payoff = average win ÷ average loss.
 */
export function computeMetrics(trades: Trade[], options: { breakevenTolerance: string; accountCurrency?: string }): CoreMetrics {
  const tol = d(options.breakevenTolerance);
  const sorted = byCloseTime(trades);
  const nets = sorted.map(tradeNet);
  const outcomes = nets.map((n) => outcomeOf(n, tol));
  const n = sorted.length;

  const winNets = nets.filter((_, i) => outcomes[i] === "WIN");
  const lossNets = nets.filter((_, i) => outcomes[i] === "LOSS");
  const wins = winNets.length;
  const losses = lossNets.length;
  const breakevens = n - wins - losses;

  const grossProfit = sum(winNets);
  const grossLoss = sum(lossNets).abs();
  const netPnl = sum(nets);
  const totalCosts = sum(sorted.map(tradeCosts));
  const grossProfitBeforeCosts = sum(sorted.map((t) => d(t.grossPnl)).filter((g) => g.gt(0)));

  const avgWin = avg(winNets);
  const avgLossSigned = avg(lossNets);
  const avgLoss = avgLossSigned ? avgLossSigned.abs() : null;

  const rs = sorted.map((t) => tradeR(t, options.accountCurrency));
  const rValues = rs.filter((r): r is Dec => r !== null);
  const rWin = rs.filter((r, i): r is Dec => r !== null && outcomes[i] === "WIN");
  const rLoss = rs.filter((r, i): r is Dec => r !== null && outcomes[i] === "LOSS");

  let maxW = 0;
  let maxL = 0;
  let curW = 0;
  let curL = 0;
  for (const o of outcomes) {
    if (o === "WIN") {
      curW += 1;
      curL = 0;
    } else if (o === "LOSS") {
      curL += 1;
      curW = 0;
    } else {
      curW = 0;
      curL = 0;
    }
    maxW = Math.max(maxW, curW);
    maxL = Math.max(maxL, curL);
  }

  const sortedNets = [...nets].sort((a, b) => b.comparedTo(a));
  const top = (k: number) => (netPnl.gt(0) ? sum(sortedNets.slice(0, k).filter((x) => x.gt(0))).div(netPnl) : null);

  const holds = sorted.map(holdingMs);
  const holdsWhere = (want: Outcome) =>
    holds.filter((h, i): h is number => h !== null && outcomes[i] === want);

  return {
    n,
    wins,
    losses,
    breakevens,
    winRate: n ? d(wins).div(n) : null,
    lossRate: n ? d(losses).div(n) : null,
    breakevenRate: n ? d(breakevens).div(n) : null,
    netPnl,
    grossProfit,
    grossLoss,
    grossProfitBeforeCosts,
    totalCosts,
    costsPctOfGrossProfit: grossProfitBeforeCosts.gt(0) ? totalCosts.div(grossProfitBeforeCosts) : null,
    avgWin,
    avgLoss,
    payoffRatio: avgWin && avgLoss && avgLoss.gt(0) ? avgWin.div(avgLoss) : null,
    expectancy: n ? netPnl.div(n) : null,
    profitFactor: grossLoss.gt(0) ? grossProfit.div(grossLoss) : null,
    avgR: avg(rValues),
    rCount: rValues.length,
    avgRWinners: avg(rWin),
    avgRLosers: avg(rLoss),
    largestWin: winNets.length ? winNets.reduce((a, b) => (b.gt(a) ? b : a)) : null,
    largestLoss: lossNets.length ? lossNets.reduce((a, b) => (b.lt(a) ? b : a)) : null,
    top1Share: top(1),
    top3Share: top(3),
    maxConsecutiveWins: maxW,
    maxConsecutiveLosses: maxL,
    avgHoldingMs: avgNum(holds.filter((h): h is number => h !== null)),
    avgHoldingWinnersMs: avgNum(holdsWhere("WIN")),
    avgHoldingLosersMs: avgNum(holdsWhere("LOSS")),
    longCount: sorted.filter((t) => t.side === "LONG").length,
    shortCount: sorted.filter((t) => t.side === "SHORT").length,
    expectancyConfidence: confidenceOfMean(nets),
    rConfidence: confidenceOfMean(rValues),
  };
}
