import { Dec, d } from "./decimal";

/**
 * Probability theory helpers from Phase 1, Module 3. Information only — never used to set risk automatically.
 */

/** Exact probability of at least one run of `k` losses in `n` trades, with loss probability `q` (dynamic programming, no simulation). */
export function probabilityOfLossRun(n: number, k: number, q: number): number {
  if (k <= 0) return 1;
  let dp = new Array<number>(k).fill(0);
  dp[0] = 1;
  let hit = 0;
  for (let i = 0; i < n; i++) {
    const next = new Array<number>(k).fill(0);
    for (let r = 0; r < k; r++) {
      const pr = dp[r] ?? 0;
      if (pr === 0) continue;
      next[0] = (next[0] ?? 0) + pr * (1 - q);
      if (r + 1 === k) hit += pr * q;
      else next[r + 1] = (next[r + 1] ?? 0) + pr * q;
    }
    dp = next;
  }
  return hit;
}

/**
 * Chance of reaching +`target` units before −`limit` units in a fair ±1 random walk (zero edge):
 * limit ÷ (limit + target). Example: limit 10, target 8 → 10 ÷ 18 = 55.6%.
 */
export function fairWalkTargetFirst(limitUnits: number, targetUnits: number): Dec {
  return d(limitUnits).div(d(limitUnits).plus(targetUnits));
}

export interface KellyResult {
  /** Full Kelly fraction f* = W − (1 − W) ÷ R. Null when it is not positive (no edge). */
  fullKelly: Dec | null;
  quarterKelly: Dec | null;
  expectancyR: Dec;
  hasEdge: boolean;
}

/** Kelly criterion (theory). `winRate` as a share (0.5), `payoff` = average win ÷ average loss. */
export function kelly(winRate: string, payoff: string): KellyResult {
  const w = d(winRate);
  const r = d(payoff);
  const expectancyR = w.times(r).minus(new Dec(1).minus(w));
  if (r.lte(0) || expectancyR.lte(0)) return { fullKelly: null, quarterKelly: null, expectancyR, hasEdge: false };
  const f = w.minus(new Dec(1).minus(w).div(r));
  return { fullKelly: f, quarterKelly: f.div(4), expectancyR, hasEdge: true };
}

/** Breakeven win rate for a reward-to-risk ratio: 1 ÷ (1 + RRR). Costs are ignored, so the real breakeven is a little higher. */
export function breakevenWinRate(rrr: string): Dec {
  const r = d(rrr);
  if (r.lte(0)) throw new Error("RRR must be above zero");
  return new Dec(1).div(r.plus(1));
}

/** Expectancy per trade = win share × average win − loss share × average loss (average loss as a positive number). */
export function expectancyFromRates(winRate: string, avgWin: string, avgLoss: string): Dec {
  const w = d(winRate);
  return w.times(avgWin).minus(new Dec(1).minus(w).times(avgLoss));
}

/** Standard error of an average: std ÷ √n. It shrinks slowly: 4× more trades only halves it. Null for n < 1. */
export function standardError(std: string, n: number): Dec | null {
  if (n < 1) return null;
  return d(std).div(new Dec(n).sqrt());
}

export interface ChallengeOdds {
  /** Chance the target is reached before the loss limit. */
  pass: number;
  /** Chance the loss limit is reached first. */
  fail: number;
  /** Chance still undecided after `maxTrades` (≈ 0 for realistic inputs). */
  undecided: number;
}

/**
 * Exact odds for a repeated bet with integer outcomes in "units" (e.g. 1 unit = 1% of the account):
 * win `winUnits` with probability `p`, otherwise lose `lossUnits`, until balance ≥ +target or ≤ −limit.
 * Dynamic programming over the balance, no simulation. Ignores costs, daily limits and time limits.
 * Teaching tool for Module 5: the true win rate is never known exactly in real life.
 */
export function challengeOdds(
  p: number,
  winUnits: number,
  lossUnits: number,
  targetUnits: number,
  limitUnits: number,
  maxTrades = 100000,
): ChallengeOdds {
  let dist = new Map<number, number>([[0, 1]]);
  let pass = 0;
  let fail = 0;
  let left = 1;
  for (let i = 0; i < maxTrades && left > 1e-12; i++) {
    const next = new Map<number, number>();
    for (const [s, pr] of dist) {
      for (const [delta, q] of [
        [winUnits, p],
        [-lossUnits, 1 - p],
      ] as const) {
        const t = s + delta;
        const mass = pr * q;
        if (t >= targetUnits) pass += mass;
        else if (t <= -limitUnits) fail += mass;
        else next.set(t, (next.get(t) ?? 0) + mass);
      }
    }
    dist = next;
    left = 0;
    for (const v of dist.values()) left += v;
  }
  return { pass, fail, undecided: left };
}

/** Average money spent on challenge fees before one pass, if each attempt passes with probability `passProb` (geometric: fee ÷ p). Null when p is not above zero. */
export function expectedFeesToPass(fee: string, passProb: number): Dec | null {
  if (!(passProb > 0) || passProb > 1) return null;
  return d(fee).div(passProb);
}

/** Trader's share of a profit under a profit split given as a percentage (80 → 80%). */
export function profitSplitShare(profit: string, splitPct: string): Dec {
  return d(profit).times(d(splitPct)).div(100);
}
