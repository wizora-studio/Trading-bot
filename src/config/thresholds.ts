/**
 * Statistical Confidence Framework — the single source of truth (Master Prompt, Phase 5).
 * Every badge, strategy comparison, and AI text must use these constants. Change them only here.
 */
export const CONFIDENCE_THRESHOLDS = {
  /** Fewer trades than this: we do not draw any conclusion. */
  INSUFFICIENT_BELOW: 10,
  /** From 10 up to (not including) this: LOW confidence. */
  LOW_BELOW: 30,
  /** From 30 up to (not including) this: MODERATE confidence. */
  MODERATE_BELOW: 100,
  /** z-value for a 95% confidence interval. */
  Z_95: 1.96,
} as const;

/** Minimum trades in a segment (session, weekday, rule) before it is shown as a finding. */
export const MIN_SEGMENT_SIZE = 10;

/** Default breakeven tolerance in account money: |net| below this counts as breakeven. */
export const DEFAULT_BREAKEVEN_TOLERANCE = "1";

/** A funded-rule meter turns into a warning when less than this share of the limit is left. */
export const RULE_WARNING_REMAINING_SHARE = 0.3;

/** Engine version stamped on every computed snapshot so old results can be reproduced. */
export const ENGINE_VERSION = "1.0.0";
