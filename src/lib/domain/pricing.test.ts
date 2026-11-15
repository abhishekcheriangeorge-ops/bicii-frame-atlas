import { describe, expect, it } from "vitest";
import {
  classBandConflict,
  computeCostFloor,
  grossMarginAtPrice,
  labourCostCents,
  sumPreparedCost,
} from "./pricing";
import { evaluateInspection, canMarkAvailableForBuild } from "./checklist";
import { CHECKLIST } from "./checklist";

describe("pricing (PRD acceptance)", () => {
  it("Giant Yukon worked example: prepared cost 21250 → floor 35417 at 40%", () => {
    const prepared = sumPreparedCost({
      acquisitionCents: 8000,
      labourCents: labourCostCents(3.5, 2500),
      materialsCents: 2500,
      overheadCents: 2000,
    });
    expect(prepared).toBe(21250);
    expect(computeCostFloor({ preparedCostCents: prepared, targetGrossMargin: 0.4 })).toBe(
      35417,
    );
  });

  it("aluminium white-label: cost 12000 → floor 20000 at 40%", () => {
    const prepared = sumPreparedCost({
      acquisitionCents: 4000,
      labourCents: labourCostCents(2, 2500),
      materialsCents: 1500,
      overheadCents: 1500,
    });
    expect(prepared).toBe(12000);
    expect(computeCostFloor({ preparedCostCents: prepared, targetGrossMargin: 0.4 })).toBe(
      20000,
    );
  });

  it("rejects margin + fee >= 1", () => {
    expect(() =>
      computeCostFloor({
        preparedCostCents: 10000,
        targetGrossMargin: 0.6,
        sellingFeeRate: 0.5,
      }),
    ).toThrow(/Invalid margin/);
  });

  it("flags F2 conflict when floor exceeds band max", () => {
    const r = classBandConflict({ costFloorCents: 52000, valueClass: "F2" });
    expect(r.conflict).toBe(true);
  });

  it("computes margin at retail correctly (not markup)", () => {
    // At S$500 retail vs S$212.50 cost → 57.5%
    expect(grossMarginAtPrice(21250, 50000)).toBeCloseTo(0.575, 5);
  });
});

describe("inspection safety gate", () => {
  const allPass = CHECKLIST.map((c) => ({
    checkId: c.checkId,
    result: "pass" as const,
  }));

  it("PASS_VISUAL when complete with no concerns", () => {
    const r = evaluateInspection({ items: allPass, forkIncluded: true });
    expect(r.outcome).toBe("PASS_VISUAL");
    expect(r.complete).toBe(true);
  });

  it("HOLD when structural weld concern", () => {
    const items = allPass.map((i) =>
      i.checkId === "st_joints" ? { ...i, result: "concern" as const } : i,
    );
    const r = evaluateInspection({ items, forkIncluded: true });
    expect(r.outcome).toBe("HOLD");
    expect(r.criticalFlags).toContain("st_joints");
  });

  it("blocks available_for_build without approvals", () => {
    expect(
      canMarkAvailableForBuild({
        inspectionOutcome: "PASS_VISUAL",
        unresolvedCriticalFlags: [],
        preparationReleased: true,
        safetyApproved: false,
        priceApproved: true,
      }),
    ).toBe(false);
  });

  it("blocks available_for_build on HOLD", () => {
    expect(
      canMarkAvailableForBuild({
        inspectionOutcome: "HOLD",
        unresolvedCriticalFlags: ["st_joints"],
        preparationReleased: true,
        safetyApproved: true,
        priceApproved: true,
      }),
    ).toBe(false);
  });
});
