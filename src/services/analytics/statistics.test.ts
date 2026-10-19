import { describe, expect, it } from "vitest";
import {
  benjaminiHochberg,
  bonferroni,
  chanceOfFalseAlarm,
  drawdownDistribution,
  maxDrawdownOf,
  meanTest,
  normalTwoSidedP,
  runsTest,
  seededRandom,
  tCritical,
  tTwoSidedP,
} from "./statistics";

describe("distributions (reference values from standard tables)", () => {
  it("t critical values for 95%", () => {
    expect(tCritical(4)).toBeCloseTo(2.776, 3);
    expect(tCritical(9)).toBeCloseTo(2.262, 3);
    expect(tCritical(29)).toBeCloseTo(2.045, 3);
    expect(tCritical(99)).toBeCloseTo(1.984, 3);
  });
  it("t p-values", () => {
    expect(tTwoSidedP(2.262157, 9)).toBeCloseTo(0.05, 4);
    expect(tTwoSidedP(1.5, 4)).toBeCloseTo(0.208, 3);
    expect(tTwoSidedP(0, 10)).toBeCloseTo(1, 6);
  });
  it("normal p-values", () => {
    expect(normalTwoSidedP(1.96)).toBeCloseTo(0.05, 3);
    expect(normalTwoSidedP(2.5)).toBeCloseTo(0.0124, 4);
    expect(normalTwoSidedP(0)).toBeCloseTo(1, 6);
  });
});

/** The numbers printed in docs/handbook/07-statistical-reliability.md. */
describe("handbook module 7 numbers", () => {
  // 10 trades in R: mean 0.5, same hidden edge, wide spread
  const small = [2, -1, -1, 3, -1, 2, -1, 1.5, -1, 1.5];
  it("10 trades: positive average, but the interval spans zero", () => {
    const r = meanTest(small)!;
    expect(r.mean).toBeCloseTo(0.5, 6);
    expect(r.sd).toBeCloseTo(1.6, 1);
    expect(r.p).toBeGreaterThan(0.3);
    expect(r.ciLow).toBeLessThan(0);
    expect(r.ciHigh).toBeGreaterThan(1);
  });
  it("same average and spread with 100 trades gives a clear result", () => {
    const big = Array.from({ length: 10 }, () => small).flat();
    const r = meanTest(big)!;
    expect(r.mean).toBeCloseTo(0.5, 6);
    expect(r.p).toBeLessThan(0.01);
    expect(r.ciLow).toBeGreaterThan(0.15);
  });
  it("effect size does not depend on n; p does", () => {
    const a = meanTest(small)!;
    const b = meanTest(Array.from({ length: 10 }, () => small).flat())!;
    expect(a.effectSize).toBeCloseTo(b.effectSize, 1);
    expect(b.p).toBeLessThan(a.p);
  });
  it("degenerate input returns null", () => {
    expect(meanTest([1, 2])).toBeNull();
    expect(meanTest([1, 1, 1, 1])).toBeNull();
  });
  it("runs test: perfectly alternating and long streaks are flagged, mixed is not", () => {
    const alt = Array.from({ length: 40 }, (_, i) => i % 2 === 0);
    const r1 = runsTest(alt)!;
    expect(r1.runs).toBe(40);
    expect(r1.z).toBeGreaterThan(5);
    const blocks = [...Array(20).fill(true), ...Array(20).fill(false)] as boolean[];
    const r2 = runsTest(blocks)!;
    expect(r2.runs).toBe(2);
    expect(r2.z).toBeLessThan(-5);
    expect(r2.p).toBeLessThan(0.001);
    const mixed = [true, true, false, true, false, false, true, false, true, true, false, false, true, false, true, false, false, true, true, false];
    const r3 = runsTest(mixed)!;
    expect(r3.p).toBeGreaterThan(0.05);
  });
  it("runs test needs 10 wins and 10 losses", () => {
    expect(runsTest([true, false, true, false])).toBeNull();
  });
  it("seeded random is reproducible", () => {
    const a = seededRandom(7);
    const b = seededRandom(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });
  it("max drawdown helper", () => {
    expect(maxDrawdownOf([300, -200, -400, 100, 500, -250, 350], 10000)).toBe(600);
  });
  it("shuffle keeps the total; distribution is reproducible and ordered", () => {
    const pnls = [300, -200, -400, 100, 500, -250, 350, -100, 200, -300, 150, -50];
    const a = drawdownDistribution(pnls, 10000, "shuffle", 500, 1)!;
    const b = drawdownDistribution(pnls, 10000, "shuffle", 500, 1)!;
    expect(a).toEqual(b);
    expect(a.p50).toBeLessThanOrEqual(a.p90);
    expect(a.p90).toBeLessThanOrEqual(a.p95);
    expect(a.shareAtLeastObserved).toBeGreaterThan(0);
    expect(a.shareAtLeastObserved).toBeLessThanOrEqual(1);
    const boot = drawdownDistribution(pnls, 10000, "bootstrap", 500, 1)!;
    expect(boot.iterations).toBe(500);
  });
  it("needs at least 10 trades", () => {
    expect(drawdownDistribution([1, 2, 3], 100, "shuffle")).toBeNull();
  });
  it("50 filters at 5%: a false alarm is almost certain", () => {
    expect(chanceOfFalseAlarm(1)).toBeCloseTo(0.05, 6);
    expect(chanceOfFalseAlarm(10)).toBeCloseTo(0.401, 3);
    expect(chanceOfFalseAlarm(20)).toBeCloseTo(0.642, 3);
    expect(chanceOfFalseAlarm(50)).toBeCloseTo(0.923, 3);
  });
  it("Bonferroni and Benjamini–Hochberg on 10 p-values", () => {
    const p = [0.001, 0.008, 0.012, 0.03, 0.04, 0.2, 0.35, 0.5, 0.7, 0.9];
    expect(p.filter((x) => x <= 0.05)).toHaveLength(5);
    expect(bonferroni(p).filter(Boolean)).toHaveLength(1); // 0.05 / 10 = 0.005
    expect(benjaminiHochberg(p).filter(Boolean)).toHaveLength(3); // 0.012 ≤ 3/10 × 0.05 = 0.015, 0.03 > 0.02
    expect(benjaminiHochberg(p).slice(0, 4)).toEqual([true, true, true, false]);
  });
});
