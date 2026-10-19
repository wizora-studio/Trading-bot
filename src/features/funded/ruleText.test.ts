import { describe, expect, it } from "vitest";
import { parseRuleText } from "./ruleText";

describe("free-text rule intake (deterministic draft)", () => {
  it("example from the spec", () => {
    const r = parseRuleText("daily loss 5%, max loss 10% trailing, consistency 30%, minimum 3 trading days");
    expect(r.rules.dailyLoss?.pct).toBe("5");
    expect(r.rules.maxLoss).toMatchObject({ pct: "10", type: "EOD_TRAILING" });
    expect(r.status.maxLoss).toBe("AMBIGUOUS"); // EOD or intraday trailing? → question
    expect(r.rules.consistency?.maxPct).toBe("30");
    expect(r.status.consistency).toBe("AMBIGUOUS");
    expect(r.rules.minTradingDays).toBe(3);
    expect(r.questions).toEqual(expect.arrayContaining(["startingBalance", "profitTargetPct", "dailyLoss", "maxLoss", "consistency", "newsRule"]));
  });

  it("messy Roman Urdu + English", () => {
    const r = parseRuleText("Mera 10k ka account hai. Target 8% hai, rozana loss 5% pichle din ke balance se, kul loss 10% static. Kam az kam 4 din trade karna hai. News par trading nahi. Weekend hold nahi kar sakte.");
    expect(r.rules.startingBalance).toBe("10000");
    expect(r.rules.profitTargetPct).toBe("8");
    expect(r.rules.dailyLoss).toMatchObject({ pct: "5", base: "DAY_START_BALANCE" });
    expect(r.status.dailyLoss).toBe("ASSUMED");
    expect(r.rules.maxLoss).toMatchObject({ pct: "10", type: "STATIC" });
    expect(r.status.maxLoss).toBe("CLEAR");
    expect(r.rules.minTradingDays).toBe(4);
    expect(r.status.newsRule).toBe("CLEAR");
    expect(r.status.weekendRule).toBe("CLEAR");
  });

  it("pasted rules page with EOD trailing that locks", () => {
    const r = parseRuleText("Account size: $50,000. Profit Target: 6%. Maximum Loss: 4% end-of-day trailing drawdown, stops trailing at the initial balance. EAs are not allowed. Commissions count toward drawdown.");
    expect(r.rules.startingBalance).toBe("50000");
    expect(r.rules.maxLoss).toMatchObject({ pct: "4", type: "EOD_TRAILING", lockAtStartingBalance: true });
    expect(r.status.maxLoss).toBe("CLEAR");
    expect(r.rules.eaAllowed).toBe("NO");
    expect(r.rules.costsIncluded).toBe(true);
    expect(r.status.dailyLoss).toBe("MISSING");
  });

  it("empty text → everything missing, nothing guessed", () => {
    const r = parseRuleText("");
    expect(r.rules).toEqual({});
    expect(r.questions).toHaveLength(10);
  });
});
