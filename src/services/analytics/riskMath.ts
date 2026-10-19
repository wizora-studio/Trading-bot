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
