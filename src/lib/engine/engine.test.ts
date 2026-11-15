import { describe, expect, it } from "vitest";
import { CHECKLIST } from "../domain/checklist";
import type { ChecklistItemInput } from "../domain/inspection";
import type { DesirabilityDimension } from "../domain/types";
import {
  assessBuildAvailability,
  availableForBuild,
  canMarkAvailableForBuild,
  evaluateInspection,
  inspectionLanguageViolations,
  visualInspectionPassStatement,
} from "./inspection";
import {
  assignValueClass,
  computeDesirability,
  valueClassForScore,
  type DimensionScoreInput,
} from "./desirability";
import {
  assessRetailPrice,
  classBandConflict,
  computeCostFloor,
  grossMarginBreakdown,
  labourCentsFromMinutes,
  labourCostCents,
  lockPricingSnapshot,
  minimumPriceAfterFeeCents,
  minimumPriceBeforeSalesFeesCents,
  preparedCostCents,
  recomputeUnlockedProposal,
  roundToNearestFiftyDollars,
  roundToNearestTenDollars,
  roundUpToTenDollars,
  splitComparables,
  forkComparabilityNote,
  sumPreparedCost,
  buildPriceWorksheet,
} from "./pricing";
import {
  assertTransition,
  canTransition,
  evaluateTransition,
  invalidateApprovalOnHold,
  LIFECYCLE_TRANSITIONS,
  listingEligible,
} from "./status";

function allPass(overrides: Record<string, ChecklistItemInput["result"]> = {}): ChecklistItemInput[] {
  return CHECKLIST.map((item) => ({
    checkId: item.checkId,
    result: overrides[item.checkId] ?? "pass",
  }));
}

const cleanRelease = {
  preparationReleased: true,
  reviewerApproved: true,
  reinspectionRequired: false,
} as const;

describe("pricing acceptance", () => {
  it("costs 21250 cents at 40% margin to a 35417 cent floor", () => {
    expect(minimumPriceBeforeSalesFeesCents(21250, 4000)).toBe(35417);
    expect(
      computeCostFloor({ preparedCostCents: 21250, targetGrossMargin: 0.4 }),
    ).toBe(35417);
  });

  it("costs 12000 cents at 40% margin to a 20000 cent floor", () => {
    expect(minimumPriceBeforeSalesFeesCents(12000, 4000)).toBe(20000);
    expect(
      computeCostFloor({ preparedCostCents: 12000, targetGrossMargin: 0.4 }),
    ).toBe(20000);
  });

  it("builds the Yukon and white-label examples from integer labour", () => {
    const yukon = sumPreparedCost({
      acquisitionCents: 8000,
      labourCents: labourCostCents(3.5, 2500),
      materialsCents: 2500,
      overheadCents: 2000,
    });
    expect(labourCentsFromMinutes(210, 2500)).toBe(8750);
    expect(yukon).toBe(21250);
    expect(minimumPriceBeforeSalesFeesCents(yukon, 4000)).toBe(35417);

    const whiteLabel = preparedCostCents({
      acquisitionCents: 4000,
      labourCents: labourCostCents(2, 2500),
      materialsCents: 1500,
      overheadCents: 1500,
    });
    expect(whiteLabel).toBe(12000);
    expect(minimumPriceBeforeSalesFeesCents(whiteLabel, 4000)).toBe(20000);
  });

  it("applies the fee-aware divisor and rejects margin + fee >= 1", () => {
    expect(minimumPriceAfterFeeCents(10_000, 4000, 1000)).toBe(20_000);
    expect(
      computeCostFloor({
        preparedCostCents: 7000,
        targetGrossMargin: 0.1,
        sellingFeeRate: 0.2,
      }),
    ).toBe(10_000);
    expect(() => minimumPriceAfterFeeCents(10_000, 6000, 4000)).toThrow(
      /Invalid margin/,
    );
    expect(() =>
      computeCostFloor({
        preparedCostCents: 10_000,
        targetGrossMargin: 0.6,
        sellingFeeRate: 0.5,
      }),
    ).toThrow(/Invalid margin/);
    expect(() => minimumPriceBeforeSalesFeesCents(10_000, 10_000)).toThrow(
      /Invalid margin/,
    );
  });

  it("rejects fractional cents", () => {
    expect(() => minimumPriceBeforeSalesFeesCents(21250.4, 4000)).toThrow(
      /integer number of cents/,
    );
  });

  it("rounds to S$10 and S$50 with half-up ties", () => {
    expect(roundToNearestTenDollars(35417)).toBe(35_000);
    expect(roundToNearestFiftyDollars(35417)).toBe(35_000);
    expect(roundToNearestTenDollars(21_500)).toBe(22_000);
    expect(roundUpToTenDollars(35417)).toBe(36_000);
    expect(roundUpToTenDollars(35_000)).toBe(35_000);
  });

  it("flags an F2 conflict when the floor exceeds 49900 cents and does not relabel the class", () => {
    expect(
      classBandConflict({ costFloorCents: 49_900, valueClass: "F2" }).conflict,
    ).toBe(false);
    const conflict = classBandConflict({
      costFloorCents: 49_901,
      valueClass: "F2",
    });
    expect(conflict.conflict).toBe(true);
    expect(conflict.valueClass).toBe("F2");
    expect(conflict.reclassified).toBe(false);
    expect(
      classBandConflict({ costFloorCents: 52_000, valueClass: "F2" }).conflict,
    ).toBe(true);
  });

  it("reports margin rather than markup at the worked retail prices", () => {
    const at500 = grossMarginBreakdown(21250, 50_000);
    const at400 = grossMarginBreakdown(21250, 40_000);
    expect(at500.marginPercent).toBe("57.5%");
    expect(at400.marginPercent).toBe("46.875%");
    expect(at500.markupPercent).not.toBe(at500.marginPercent);
  });

  it("keeps GST out of the margin floor", () => {
    const withoutTax = buildPriceWorksheet({
      costs: {
        acquisitionCents: 8000,
        labourCents: 8750,
        materialsCents: 2500,
        overheadCents: 2000,
      },
      targetGrossMarginBps: 4000,
      valueClass: "F2",
    });
    const withTax = buildPriceWorksheet({
      costs: {
        acquisitionCents: 8000,
        labourCents: 8750,
        materialsCents: 2500,
        overheadCents: 2000,
      },
      targetGrossMarginBps: 4000,
      valueClass: "F2",
      tax: { gstRegistered: true, gstRateBps: 900, retailDisplay: "inclusive" },
    });
    expect(withoutTax.minimumPriceBeforeSalesFeesCents).toBe(35417);
    expect(withTax.minimumPriceBeforeSalesFeesCents).toBe(35417);
    expect(withTax.exGstFloorCents).toBe(35417);
    expect(withTax.retailDisplayCents).toBeGreaterThan(35417);
  });

  it("does not rewrite a locked approval when labour is recomputed", () => {
    const locked = lockPricingSnapshot({
      preparedCostCents: 21250,
      costFloorCents: 35417,
      targetGrossMarginBps: 4000,
      sellingFeeBps: 0,
      valueClass: "F2",
      approvedPriceCents: 50_000,
    });
    const next = recomputeUnlockedProposal(locked, {
      acquisitionCents: 8000,
      labourCents: labourCostCents(4, 2500),
      materialsCents: 2500,
      overheadCents: 2000,
    });
    expect(next.locked).toBe(locked);
    expect(locked.preparedCostCents).toBe(21250);
    expect(locked.approvedPriceCents).toBe(50_000);
    expect(next.proposalPreparedCostCents).toBe(22_500);
    expect(next.proposalFloorCents).not.toBe(locked.costFloorCents);
  });

  it("requires justification for a below-floor price and keeps the warning", () => {
    const denied = assessRetailPrice({
      preparedCostCents: 21250,
      costFloorCents: 35417,
      retailCents: 30_000,
    });
    expect(denied.allowed).toBe(false);
    const allowed = assessRetailPrice({
      preparedCostCents: 21250,
      costFloorCents: 35417,
      retailCents: 30_000,
      belowFloorJustification: "Educational build for the Saturday workshop",
      authorisedBy: "mgr-1",
    });
    expect(allowed.allowed).toBe(true);
    expect(allowed.belowFloor).toBe(true);
    expect(allowed.warnings.length).toBeGreaterThan(0);
    expect(allowed.grossProfitCents).toBeLessThan(0);
  });

  it("keeps asking and sold comparables apart and flags fork mismatch", () => {
    const split = splitComparables([
      { kind: "asking" as const, id: "a" },
      { kind: "sold" as const, id: "s" },
    ]);
    expect(split.asking.map((row) => row.id)).toEqual(["a"]);
    expect(split.sold.map((row) => row.id)).toEqual(["s"]);
    expect(forkComparabilityNote(true, false)).toMatch(/not like-for-like/);
    expect(forkComparabilityNote(true, true)).toBeNull();
  });
});

describe("inspection safety gate", () => {
  it("passes a completed visual checklist", () => {
    const result = evaluateInspection({
      items: allPass(),
      forkIncluded: true,
    });
    expect(result.outcome).toBe("PASS_VISUAL");
    expect(result.complete).toBe(true);
    expect(result.approvalBlocked).toBe(false);
    expect(result.method).toBe("visual_mechanical");
  });

  it("blocks approval when a weld is marked concern", () => {
    const assessment = assessBuildAvailability({
      items: allPass({ st_joints: "concern" }),
      forkIncluded: true,
      declaredOutcome: "PASS_VISUAL",
      ...cleanRelease,
      valueClass: "F5",
      preservationClass: "P1",
    });
    expect(assessment.outcome).toBe("HOLD");
    expect(assessment.criticalFlags).toContain("st_joints");
    expect(assessment.approvalBlocked).toBe(true);
    expect(assessment.availableForBuild).toBe(false);
    expect(assessment.listingEligible).toBe(false);
    expect(assessment.valueClass).toBe("F5");
    expect(assessment.preservationClass).toBe("P1");
    expect(
      listingEligible("approved", {
        inspectionOutcome: assessment.outcome,
        unresolvedCriticalFlags: assessment.unresolvedCriticalFlags,
        preparationReleased: true,
        reviewerApproved: true,
        approvalBlocked: true,
        priceApproverId: "rev-1",
      }),
    ).toBe(false);
  });

  it("blocks approval when a mandatory item is not inspected", () => {
    const headTube = assessBuildAvailability({
      items: allPass({ st_head_dt: "not_inspected" }),
      forkIncluded: true,
      declaredOutcome: "PASS_VISUAL",
      ...cleanRelease,
    });
    expect(headTube.approvalBlocked).toBe(true);
    expect(headTube.outcome).not.toBe("PASS_VISUAL");
    expect(headTube.availableForBuild).toBe(false);

    const fork = assessBuildAvailability({
      items: allPass({ st_fork: "not_inspected" }),
      forkIncluded: true,
      ...cleanRelease,
    });
    expect(fork.approvalBlocked).toBe(true);
    expect(fork.availableForBuild).toBe(false);
  });

  it("allows a documented resolution and a not-applicable fork", () => {
    const resolved = assessBuildAvailability({
      items: allPass().map((item) =>
        item.checkId === "st_joints"
          ? {
              ...item,
              result: "concern" as const,
              resolution: {
                resolvedBy: "rev-1",
                resolvedAt: "2026-11-16",
                rationale: "Paint line only. No metal separation under the loupe.",
              },
            }
          : item,
      ),
      forkIncluded: false,
      ...cleanRelease,
    });
    const bareFork = assessBuildAvailability({
      items: allPass({ st_fork: "not_applicable" }),
      forkIncluded: false,
      ...cleanRelease,
    });
    expect(resolved.outcome).toBe("PASS_VISUAL");
    expect(resolved.availableForBuild).toBe(true);
    expect(bareFork.availableForBuild).toBe(true);
    expect(
      assessBuildAvailability({
        items: allPass({ st_fork: "not_inspected" }),
        forkIncluded: false,
        ...cleanRelease,
      }).approvalBlocked,
    ).toBe(true);
  });

  it("requires every availability condition and ignores market class on reject", () => {
    const pass = assessBuildAvailability({
      items: allPass(),
      forkIncluded: true,
      declaredOutcome: "PASS_VISUAL",
      ...cleanRelease,
    });
    expect(pass.availableForBuild).toBe(true);

    expect(
      availableForBuild({
        inspectionOutcome: "PASS_VISUAL",
        unresolvedCriticalFlags: [],
        preparationReleased: false,
        reviewerApproved: true,
      }),
    ).toBe(false);
    expect(
      availableForBuild({
        inspectionOutcome: "PASS_VISUAL",
        unresolvedCriticalFlags: [],
        preparationReleased: true,
        reviewerApproved: false,
      }),
    ).toBe(false);
    expect(
      availableForBuild({
        inspectionOutcome: "HOLD",
        unresolvedCriticalFlags: [],
        preparationReleased: true,
        reviewerApproved: true,
      }),
    ).toBe(false);
    expect(
      availableForBuild({
        inspectionOutcome: "PASS_VISUAL",
        unresolvedCriticalFlags: ["st_joints"],
        preparationReleased: true,
        reviewerApproved: true,
      }),
    ).toBe(false);

    const rejected = assessBuildAvailability({
      items: allPass(),
      forkIncluded: true,
      declaredOutcome: "REJECT",
      ...cleanRelease,
      valueClass: "F5",
    });
    expect(rejected.outcome).toBe("REJECT");
    expect(rejected.availableForBuild).toBe(false);
    expect(rejected.valueClass).toBe("F5");
  });

  it("keeps the legacy build flag strict about price approval", () => {
    expect(
      canMarkAvailableForBuild({
        inspectionOutcome: "PASS_VISUAL",
        unresolvedCriticalFlags: [],
        preparationReleased: true,
        safetyApproved: false,
        priceApproved: true,
      }),
    ).toBe(false);
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

  it("uses the visual-inspection phrase and refuses an unrecorded x-ray claim", () => {
    expect(visualInspectionPassStatement("2026-11-16")).toBe(
      "Passed BICII’s documented visual/mechanical inspection on 2026-11-16",
    );
    expect(
      inspectionLanguageViolations("This frame was x-ray cleared", null),
    ).toContain("x-ray");
    expect(
      inspectionLanguageViolations("This frame was x-rayed", {
        method: "x_ray",
        performed: true,
        serviceRecordId: "lab-14",
        approvedBy: "rev-1",
        performedAt: "2026-11-16",
      }),
    ).toEqual([]);
    expect(
      inspectionLanguageViolations("Certified safe and crack-free guaranteed", null),
    ).toEqual(["crack-free guaranteed", "certified safe"]);
  });
});

describe("desirability rubric", () => {
  const dimensions = Object.keys({
    maker_provenance: 15,
    model_relevance: 20,
    construction_interest: 20,
    scarcity: 15,
    buyer_demand: 20,
    provenance_completeness: 10,
  }) as DesirabilityDimension[];

  function scores(
    points: number | Partial<Record<DesirabilityDimension, number | null>>,
    extra?: Partial<DimensionScoreInput>,
  ): DimensionScoreInput[] {
    return dimensions.map((dimension) => {
      const value =
        typeof points === "number" ? points : (points[dimension] ?? 0);
      return {
        dimension,
        points: value,
        insufficientEvidence: false,
        confidence: "confirmed" as const,
        evidence: "Recorded comparable or maker document",
        ...extra,
      };
    });
  }

  it("maps 0–19 through 80–100 onto F1–F5", () => {
    expect(valueClassForScore(0)).toBe("F1");
    expect(valueClassForScore(19)).toBe("F1");
    expect(valueClassForScore(20)).toBe("F2");
    expect(valueClassForScore(39)).toBe("F2");
    expect(valueClassForScore(40)).toBe("F3");
    expect(valueClassForScore(59)).toBe("F3");
    expect(valueClassForScore(60)).toBe("F4");
    expect(valueClassForScore(79)).toBe("F4");
    expect(valueClassForScore(80)).toBe("F5");
    expect(valueClassForScore(100)).toBe("F5");
  });

  it("honours a replacement threshold map", () => {
    const custom = {
      F1: [0, 49] as [number, number],
      F2: [50, 59],
      F3: [60, 69],
      F4: [70, 79],
      F5: [80, 100],
    };
    expect(valueClassForScore(70, custom)).toBe("F4");
    expect(valueClassForScore(70)).toBe("F4");
    expect(valueClassForScore(49, custom)).toBe("F1");
  });

  it("does not award points for a guess and does not treat that as a confident zero", () => {
    const result = computeDesirability(
      scores({
        maker_provenance: 15,
        model_relevance: 20,
        construction_interest: 20,
        scarcity: 15,
        buyer_demand: 20,
        provenance_completeness: 10,
      }).map((row) =>
        row.dimension === "maker_provenance"
          ? { ...row, guessed: true, confidence: "unknown" as const }
          : row,
      ),
    );
    const maker = result.dimensions.find(
      (row) => row.dimension === "maker_provenance",
    );
    expect(maker?.awardedPoints).toBe(0);
    expect(maker?.counted).toBe(false);
    expect(result.earnedPoints).toBe(85);
    expect(result.total).toBeNull();
    expect(result.proposedClass).toBeNull();
    expect(result.requiresManualReview).toBe(true);
    expect(result.scoreRange).toEqual({ min: 85, max: 100 });
  });

  it("lets a confirmed low maker score sit beside high construction points", () => {
    const result = computeDesirability(
      scores({
        maker_provenance: 0,
        model_relevance: 10,
        construction_interest: 20,
        scarcity: 8,
        buyer_demand: 10,
        provenance_completeness: 4,
      }),
    );
    expect(result.incomplete).toBe(false);
    expect(result.total).toBe(52);
    expect(result.proposedClass).toBe("F3");
  });

  it("keeps the calculated score when a reviewer assigns a different class", () => {
    const assessment = computeDesirability(scores(0));
    expect(assessment.proposedClass).toBe("F1");
    const denied = assignValueClass(assessment, {
      valueClass: "F4",
      reviewerId: " ",
      rationale: "Because I said so",
      assignedAt: "2026-11-16",
    });
    expect(denied.ok).toBe(false);
    const assigned = assignValueClass(assessment, {
      valueClass: "F4",
      reviewerId: "rev-1",
      rationale: "Local sold comps sit in Sought After despite the low rubric score",
      assignedAt: "2026-11-16",
    });
    expect(assigned.ok).toBe(true);
    if (assigned.ok) {
      expect(assigned.value.approvedClass).toBe("F4");
      expect(assigned.value.calculatedTotal).toBe(0);
      expect(assigned.value.scoreUnchanged).toBe(true);
    }
  });
});

describe("lifecycle transitions", () => {
  it("covers every status and refuses jumps to approved", () => {
    expect(Object.keys(LIFECYCLE_TRANSITIONS)).toHaveLength(16);
    expect(canTransition("pricing_review", "approved")).toBe(true);
    expect(canTransition("hold", "approved")).toBe(false);
    expect(canTransition("rejected", "approved")).toBe(false);
    expect(canTransition("intake_draft", "approved")).toBe(false);
    expect(canTransition("pricing_review", "preparation_planned")).toBe(true);
    expect(canTransition("approved", "approved")).toBe(false);
  });

  it("refuses to approve a frame with an open weld concern", () => {
    const assessment = assessBuildAvailability({
      items: allPass({ st_joints: "concern" }),
      forkIncluded: true,
      declaredOutcome: "PASS_VISUAL",
      ...cleanRelease,
    });
    const result = evaluateTransition("pricing_review", "approved", {
      inspectionOutcome: assessment.outcome,
      unresolvedCriticalFlags: assessment.unresolvedCriticalFlags,
      preparationReleased: true,
      reviewerApproved: true,
      approvalBlocked: assessment.approvalBlocked,
      priceApproverId: "rev-1",
      preparerId: "mech-1",
    });
    expect(result.ok).toBe(false);
    expect(() =>
      assertTransition("pricing_review", "approved", {
        inspectionOutcome: "PASS_VISUAL",
        unresolvedCriticalFlags: [],
        preparationReleased: true,
        reviewerApproved: true,
        approvalBlocked: false,
        preparerId: "mech-1",
        priceApproverId: "mech-1",
      }),
    ).toThrow(/admin override/);
  });

  it("approves only through the gate and clears listing on reinspection", () => {
    expect(() => assertTransition("pricing_review", "approved")).toThrow(
      /Safety gate/,
    );
    assertTransition("pricing_review", "approved", {
      inspectionOutcome: "PASS_VISUAL",
      unresolvedCriticalFlags: [],
      preparationReleased: true,
      reviewerApproved: true,
      approvalBlocked: false,
      priceApproverId: "rev-1",
      preparerId: "mech-1",
    });
    expect(invalidateApprovalOnHold("listed")).toEqual({
      nextStatus: "hold",
      clearListing: true,
    });
    expect(invalidateApprovalOnHold("sold").nextStatus).toBe("sold");
    expect(
      listingEligible("listed", {
        inspectionOutcome: "PASS_VISUAL",
        unresolvedCriticalFlags: ["st_joints"],
        preparationReleased: true,
        reviewerApproved: true,
        approvalBlocked: true,
        priceApproverId: "rev-1",
      }),
    ).toBe(false);
  });
});
