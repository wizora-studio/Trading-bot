import { CONFIDENCE_THRESHOLDS as T } from "@/config/thresholds";
import { Dec, sum } from "./decimal";

type DecT = Dec;

export type ConfidenceLevel = "INSUFFICIENT_DATA" | "LOW" | "MODERATE" | "HIGH";

export interface ConfidenceInfo {
  level: ConfidenceLevel;
  n: number;
  mean: DecT | null;
  standardError: DecT | null;
  /** 95% confidence interval of the mean. */
  ciLow: DecT | null;
  ciHigh: DecT | null;
  /** True when the interval contains zero: the data cannot tell a positive edge from a negative one. */
  ciIncludesZero: boolean;
}

/** Level from sample size alone. */
export function levelFromSize(n: number): ConfidenceLevel {
  if (n < T.INSUFFICIENT_BELOW) return "INSUFFICIENT_DATA";
  if (n < T.LOW_BELOW) return "LOW";
  if (n < T.MODERATE_BELOW) return "MODERATE";
  return "HIGH";
}

/**
 * Confidence of an average (e.g., average R or average $ per trade), using BOTH sample size
 * and the width of the 95% confidence interval.
 * Rule: the level comes from sample size; if the interval includes zero, a HIGH level is lowered to MODERATE,
 * because we cannot even be sure of the sign of the edge.
 */
export function confidenceOfMean(values: DecT[]): ConfidenceInfo {
  const n = values.length;
  const base = levelFromSize(n);
  if (n < 2) {
    return { level: base, n, mean: n === 1 ? values[0]! : null, standardError: null, ciLow: null, ciHigh: null, ciIncludesZero: true };
  }
  const mean = sum(values).div(n);
  const variance = sum(values.map((v) => v.minus(mean).pow(2))).div(n - 1);
  const se = variance.sqrt().div(new Dec(n).sqrt());
  const half = se.times(T.Z_95);
  const ciLow = mean.minus(half);
  const ciHigh = mean.plus(half);
  const ciIncludesZero = ciLow.lte(0) && ciHigh.gte(0);
  const level: ConfidenceLevel = base === "HIGH" && ciIncludesZero ? "MODERATE" : base;
  return { level, n, mean, standardError: se, ciLow, ciHigh, ciIncludesZero };
}
