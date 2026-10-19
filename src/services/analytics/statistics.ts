/**
 * Statistical reliability helpers (Phase 1, Module 7). Plain numbers (not money): these describe how
 * trustworthy a result is, they never feed money math. All functions are deterministic; resampling uses a seeded generator.
 */

// ---------- distributions ----------

function logGamma(x: number): number {
  const c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (const cj of c) ser += cj / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

/** Continued fraction for the incomplete beta function (Lentz's method). */
function betaCf(a: number, b: number, x: number): number {
  const TINY = 1e-300;
  let c = 1;
  let dd = 1 - ((a + b) * x) / (a + 1);
  if (Math.abs(dd) < TINY) dd = TINY;
  dd = 1 / dd;
  let h = dd;
  for (let m = 1; m <= 300; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((a + m2 - 1) * (a + m2));
    dd = 1 + aa * dd;
    if (Math.abs(dd) < TINY) dd = TINY;
    c = 1 + aa / c;
    if (Math.abs(c) < TINY) c = TINY;
    dd = 1 / dd;
    h *= dd * c;
    aa = (-(a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1));
    dd = 1 + aa * dd;
    if (Math.abs(dd) < TINY) dd = TINY;
    c = 1 + aa / c;
    if (Math.abs(c) < TINY) c = TINY;
    dd = 1 / dd;
    const del = dd * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-14) break;
  }
  return h;
}

/** Regularized incomplete beta function I_x(a, b). */
function incompleteBeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (bt * betaCf(a, b, x)) / a : 1 - (bt * betaCf(b, a, 1 - x)) / b;
}

/** Two-sided p-value of Student's t with `df` degrees of freedom. */
export function tTwoSidedP(t: number, df: number): number {
  return incompleteBeta(df / (df + t * t), df / 2, 0.5);
}

/** Two-sided critical t for a confidence level (e.g. 0.95), by bisection. */
export function tCritical(df: number, level = 0.95): number {
  const alpha = 1 - level;
  let lo = 0;
  let hi = 1000;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (tTwoSidedP(mid, df) > alpha) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Two-sided p-value of a standard normal z (complementary error function, Numerical Recipes erfc). */
export function normalTwoSidedP(z: number): number {
  const x = Math.abs(z) / Math.SQRT2;
  const t = 1 / (1 + 0.5 * x);
  const poly = -1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277))))))));
  const erfc = t * Math.exp(-x * x + poly);
  return erfc;
}

// ---------- mean R: t-test, interval, effect size ----------

export interface MeanTest {
  n: number;
  mean: number;
  sd: number;
  se: number;
  t: number;
  df: number;
  /** Two-sided p-value against the null "true mean = 0". What it does NOT say: the chance the edge is real. */
  p: number;
  ciLow: number;
  ciHigh: number;
  /** Mean ÷ standard deviation (Cohen's d for one sample): how big the effect is, regardless of n. */
  effectSize: number;
}

/** One-sample t-test of the mean against zero, with a 95% t-interval. Null for n < 3 or zero spread. */
export function meanTest(values: number[], level = 0.95): MeanTest | null {
  const n = values.length;
  if (n < 3) return null;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const sd = Math.sqrt(values.reduce((a, v) => a + (v - mean) ** 2, 0) / (n - 1));
  if (sd === 0) return null;
  const se = sd / Math.sqrt(n);
  const t = mean / se;
  const df = n - 1;
  const crit = tCritical(df, level);
  return { n, mean, sd, se, t, df, p: tTwoSidedP(t, df), ciLow: mean - crit * se, ciHigh: mean + crit * se, effectSize: mean / sd };
}

// ---------- runs test (do wins and losses cluster?) ----------

export interface RunsTest {
  runs: number;
  wins: number;
  losses: number;
  expectedRuns: number;
  /** Negative z = fewer runs than chance (clustering of streaks); positive = more alternating than chance. */
  z: number;
  p: number;
}

/**
 * Wald–Wolfowitz runs test on a win/loss sequence (true = win). Normal approximation:
 * only meaningful with at least 10 wins and 10 losses; otherwise returns null.
 */
export function runsTest(wins: boolean[]): RunsTest | null {
  const n1 = wins.filter(Boolean).length;
  const n2 = wins.length - n1;
  if (n1 < 10 || n2 < 10) return null;
  let runs = 1;
  for (let i = 1; i < wins.length; i++) if (wins[i] !== wins[i - 1]) runs++;
  const n = n1 + n2;
  const expected = (2 * n1 * n2) / n + 1;
  const variance = (2 * n1 * n2 * (2 * n1 * n2 - n)) / (n * n * (n - 1));
  const z = (runs - expected) / Math.sqrt(variance);
  return { runs, wins: n1, losses: n2, expectedRuns: expected, z, p: normalTwoSidedP(z) };
}

// ---------- resampling ----------

/** Small deterministic random generator (mulberry32) so results can be reproduced from a seed. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Largest peak-to-trough fall of a series of results added to a starting balance. */
export function maxDrawdownOf(pnls: number[], startBalance: number): number {
  let bal = startBalance;
  let peak = bal;
  let dd = 0;
  for (const p of pnls) {
    bal += p;
    if (bal > peak) peak = bal;
    if (peak - bal > dd) dd = peak - bal;
  }
  return dd;
}

export interface DrawdownDistribution {
  iterations: number;
  /** The max drawdown actually seen in the real order. */
  observed: number;
  p50: number;
  p90: number;
  p95: number;
  /** Share of simulated orders whose drawdown was at least as large as the observed one. */
  shareAtLeastObserved: number;
}

export type ResampleMode = "shuffle" | "bootstrap";

/**
 * Re-order the SAME trades ("shuffle") or draw trades with replacement ("bootstrap") many times and
 * measure the max drawdown each time. Shows how much of the observed drawdown was luck of ordering.
 * It assumes trades are independent and the future looks like the past, so treat it as a rough range.
 */
export function drawdownDistribution(pnls: number[], startBalance: number, mode: ResampleMode, iterations = 2000, seed = 12345): DrawdownDistribution | null {
  if (pnls.length < 10) return null;
  const rnd = seededRandom(seed);
  const observed = maxDrawdownOf(pnls, startBalance);
  const results: number[] = [];
  for (let i = 0; i < iterations; i++) {
    let sample: number[];
    if (mode === "bootstrap") sample = pnls.map(() => pnls[Math.floor(rnd() * pnls.length)] as number);
    else {
      sample = pnls.slice();
      for (let j = sample.length - 1; j > 0; j--) {
        const k = Math.floor(rnd() * (j + 1));
        [sample[j], sample[k]] = [sample[k] as number, sample[j] as number];
      }
    }
    results.push(maxDrawdownOf(sample, startBalance));
  }
  results.sort((a, b) => a - b);
  const at = (q: number) => results[Math.min(results.length - 1, Math.floor(q * results.length))] as number;
  return { iterations, observed, p50: at(0.5), p90: at(0.9), p95: at(0.95), shareAtLeastObserved: results.filter((r) => r >= observed).length / results.length };
}

// ---------- many tests at once ----------

/** Bonferroni: a result is significant only if p ≤ alpha ÷ m (m = number of tests). Strict; protects against any false alarm. */
export function bonferroni(pValues: number[], alpha = 0.05): boolean[] {
  const m = pValues.length;
  return pValues.map((p) => p <= alpha / m);
}

/**
 * Benjamini–Hochberg: controls the expected share of false discoveries at `q`.
 * Sort p ascending; find the largest rank k with p(k) ≤ k ÷ m × q; everything up to k is a discovery.
 */
export function benjaminiHochberg(pValues: number[], q = 0.05): boolean[] {
  const m = pValues.length;
  const order = pValues.map((p, i) => ({ p, i })).sort((a, b) => a.p - b.p);
  let cutoff = -1;
  order.forEach((o, idx) => {
    if (o.p <= ((idx + 1) / m) * q) cutoff = idx;
  });
  const out = new Array<boolean>(m).fill(false);
  for (let idx = 0; idx <= cutoff; idx++) out[(order[idx] as { i: number }).i] = true;
  return out;
}

/** Chance of at least one false alarm among `m` independent tests at level `alpha`: 1 − (1 − alpha)^m. */
export function chanceOfFalseAlarm(m: number, alpha = 0.05): number {
  return 1 - (1 - alpha) ** m;
}
