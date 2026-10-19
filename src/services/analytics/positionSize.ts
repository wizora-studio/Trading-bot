import { Dec, d } from "./decimal";
import type { InstrumentSpec } from "./instruments";

type DecT = Dec;

export interface PositionSizeInput {
  balance: string;
  /** Either a percent (e.g., "0.5") or a fixed money amount. */
  riskMode: "PERCENT" | "MONEY";
  riskValue: string;
  entry: string;
  stopLoss: string;
  spec: InstrumentSpec;
  /**
   * How many account-currency units one unit of the quote currency is worth.
   * USD account + EURUSD → 1. USD account + USDJPY → 1 ÷ USDJPY price (e.g., 1/150).
   * Leave empty to derive it automatically for USDxxx pairs from the entry price.
   */
  quoteToAccountRate?: string;
  accountCurrency?: string;
  lotStep?: string;
  /** Optional cap from funded rules, e.g., the room left today. */
  maxRiskAmount?: string | null;
}

export interface PositionSizeResult {
  riskAmount: DecT;
  stopDistance: DecT;
  stopDistancePips: DecT;
  pipValuePerLot: DecT;
  /** Rounded DOWN to the lot step so risk never exceeds the plan. */
  lots: DecT;
  units: DecT;
  actualRisk: DecT;
  cappedByRule: boolean;
  rateUsed: DecT;
  warnings: string[];
}

/**
 * Fixed-fractional position sizing (Risk Model R1).
 * Lots = risk money ÷ (stop distance in pips × pip value per lot in account currency).
 * Example: $10,000 × 0.5% = $50; EURUSD stop 20 pips; $10 per pip per lot → 0.25 lots.
 */
export function positionSize(input: PositionSizeInput): PositionSizeResult {
  const warnings: string[] = [];
  const balance = d(input.balance);
  let riskAmount = input.riskMode === "PERCENT" ? balance.times(d(input.riskValue)).div(100) : d(input.riskValue);
  let cappedByRule = false;
  if (input.maxRiskAmount) {
    const cap = d(input.maxRiskAmount);
    if (cap.lt(riskAmount)) {
      riskAmount = cap.lt(0) ? new Dec(0) : cap;
      cappedByRule = true;
    }
  }
  const entry = d(input.entry);
  const stop = d(input.stopLoss);
  const stopDistance = entry.minus(stop).abs();
  const pip = d(input.spec.pipSize);
  const stopDistancePips = pip.gt(0) ? stopDistance.div(pip) : new Dec(0);

  const accountCurrency = input.accountCurrency ?? "USD";
  let rate: DecT;
  if (input.quoteToAccountRate && input.quoteToAccountRate.trim() !== "") {
    rate = d(input.quoteToAccountRate);
  } else if (input.spec.quoteCurrency === accountCurrency) {
    rate = new Dec(1);
  } else if (input.spec.canonical.startsWith(accountCurrency) && entry.gt(0)) {
    rate = new Dec(1).div(entry);
    warnings.push("RATE_FROM_ENTRY_PRICE");
  } else {
    rate = new Dec(1);
    warnings.push("RATE_UNKNOWN_ASSUMED_1");
  }

  const pipValuePerLot = d(input.spec.contractSize).times(pip).times(rate);
  const step = d(input.lotStep ?? "0.01");
  let lots = new Dec(0);
  if (stopDistance.gt(0) && pipValuePerLot.gt(0)) {
    // Remove tiny division leftovers (e.g., 0.29999999… from 1 ÷ 150) before rounding DOWN to the lot step.
    const raw = riskAmount.div(stopDistancePips.times(pipValuePerLot)).toDecimalPlaces(12);
    lots = raw.div(step).floor().times(step);
  } else {
    warnings.push("STOP_DISTANCE_ZERO");
  }
  if (lots.isZero() && stopDistance.gt(0)) warnings.push("BELOW_MIN_LOT");
  const actualRisk = lots.times(stopDistancePips).times(pipValuePerLot);
  return {
    riskAmount,
    stopDistance,
    stopDistancePips,
    pipValuePerLot,
    lots,
    units: lots.times(d(input.spec.contractSize)),
    actualRisk,
    cappedByRule,
    rateUsed: rate,
    warnings,
  };
}
