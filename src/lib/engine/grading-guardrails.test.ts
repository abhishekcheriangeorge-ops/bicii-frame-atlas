import { describe, expect, it } from "vitest";
import { BRANDS, BRAND_SEED_POLICY } from "@/data/brands";
import { CHECKLIST, evaluateInspection } from "@/lib/domain/checklist";
import type { ChecklistItemInput } from "@/lib/domain/inspection";
import { availableForBuild, canMarkAvailableForBuild } from "./inspection";
import { computeDesirability } from "./desirability";
import { PRESERVATION_GUIDE, VALUE_CLASS_BANDS_SGD } from "@/lib/domain/types";

function allPass(
  overrides: Record<string, ChecklistItemInput["result"]> = {},
): ChecklistItemInput[] {
  return CHECKLIST.map((item) => ({
    checkId: item.checkId,
    result: overrides[item.checkId] ?? "pass",
  }));
}

describe("grading guardrails", () => {
  it("brand seed never auto-grades safety or value", () => {
    expect(BRAND_SEED_POLICY.autoGrading).toBe(false);
    expect(BRAND_SEED_POLICY.autoSafety).toBe(false);
    expect(BRAND_SEED_POLICY.autoValueClass).toBe(false);
    for (const brand of BRANDS) {
      expect(brand).not.toHaveProperty("inspectionOutcome");
      expect(brand).not.toHaveProperty("valueClass");
      expect(brand).not.toHaveProperty("preservationClass");
    }
  });

  it("pretty cosmetics with a structural concern cannot PASS_VISUAL", () => {
    const evaluation = evaluateInspection({
      items: allPass({ st_joints: "concern" }),
      forkIncluded: true,
    });
    expect(evaluation.outcome).toBe("HOLD");
    expect(evaluation.outcome).not.toBe("PASS_VISUAL");
  });

  it("prestige brand name does not appear in inspection outcome logic", () => {
    const colnago = BRANDS.find((b) => b.name === "Colnago");
    expect(colnago?.counterfeitRisk).toBe("high");
    const evaluation = evaluateInspection({
      items: allPass({ st_carbon: "not_inspected" }),
      forkIncluded: true,
    });
    // Mandatory carbon check left open blocks approval regardless of badge.
    expect(evaluation.outcome).not.toBe("PASS_VISUAL");
  });

  it("P-class labels and F-class bands are distinct vocabularies", () => {
    expect(Object.keys(PRESERVATION_GUIDE).sort()).toEqual([
      "P1",
      "P2",
      "P3",
      "P4",
    ]);
    expect(Object.keys(VALUE_CLASS_BANDS_SGD).sort()).toEqual([
      "F1",
      "F2",
      "F3",
      "F4",
      "F5",
    ]);
  });

  it("F5 desirability does not make a frame build-ready without PASS_VISUAL", () => {
    expect(
      canMarkAvailableForBuild({
        inspectionOutcome: "DRAFT",
        unresolvedCriticalFlags: [],
        preparationReleased: true,
        safetyApproved: true,
        priceApproved: true,
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
        unresolvedCriticalFlags: [],
        preparationReleased: true,
        reviewerApproved: true,
      }),
    ).toBe(true);
  });

  it("incomplete desirability evidence does not invent a value class", () => {
    const assessment = computeDesirability([
      {
        dimension: "maker_provenance",
        points: 15,
        insufficientEvidence: false,
        confidence: "confirmed",
      },
      {
        dimension: "buyer_demand",
        points: 18,
        insufficientEvidence: true,
        confidence: "unknown",
      },
    ]);
    expect(assessment.proposedClass).toBeNull();
    expect(assessment.requiresManualReview).toBe(true);
    expect(assessment.total).toBeNull();
  });
});
