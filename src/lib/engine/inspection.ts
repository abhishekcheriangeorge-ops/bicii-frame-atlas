import {
  ChecklistGroup,
  InspectionMethod,
  InspectionOutcome,
  VISUAL_INSPECTION_PASS_PREFIX,
  type ChecklistGroup as ChecklistGroupId,
  type ChecklistResult,
  type InspectionOutcome as InspectionOutcomeId,
  type ItemResolution,
  type Material,
  type NondestructiveTestRecord,
  type PreservationClass,
  type ValueClass,
} from "../domain/types";

export type ChecklistDef = {
  checkId: string;
  category: ChecklistGroupId;
  label: string;
  /** A concern here forces HOLD until a reviewer resolves it in writing. */
  structural: boolean;
  /** `not_inspected` blocks approval whenever this item applies. */
  mandatory: boolean;
  help?: string;
};

export const CHECKLIST_GROUPS: readonly {
  id: ChecklistGroupId;
  title: string;
  purpose: string;
}[] = [
  {
    id: ChecklistGroup.IDENTIFICATION,
    title: "Identification and provenance",
    purpose:
      "Record what is known, how it is known, and what is unknown. Unknown is a valid result. A badge is not a grade.",
  },
  {
    id: ChecklistGroup.STRUCTURE,
    title: "Frame structure, visually inspected",
    purpose:
      "Visual and mechanical checks only. A concern holds the frame. This pass does not claim the absence of hidden defects.",
  },
  {
    id: ChecklistGroup.COMPATIBILITY,
    title: "Compatibility and serviceability",
    purpose:
      "Standards and measurements. A catalogue lookup never overrides a measurement taken on this frame.",
  },
];

export const CHECKLIST: ChecklistDef[] = [
  {
    checkId: "id_maker",
    category: "identification",
    label: "Manufacturer / maker identified with confidence noted",
    structural: false,
    mandatory: true,
  },
  {
    checkId: "id_model_era",
    category: "identification",
    label: "Model and estimated era recorded (unknown allowed)",
    structural: false,
    mandatory: true,
  },
  {
    checkId: "id_material",
    category: "identification",
    label: "Material assessed with how-determined note",
    structural: false,
    mandatory: true,
  },
  {
    checkId: "id_serial",
    category: "identification",
    label: "Serial / stamp photographed or marked not present",
    structural: false,
    mandatory: true,
  },
  {
    checkId: "id_included",
    category: "identification",
    label: "Included parts documented (fork / headset / BB)",
    structural: false,
    mandatory: true,
  },
  {
    checkId: "st_joints",
    category: "structure",
    label: "Visible joints / welds / lugs / brazes — no cracks or suspect lines",
    structural: true,
    mandatory: true,
    help: "Includes head-tube welds and other visible joints. A concern blocks approval until it is resolved in writing.",
  },
  {
    checkId: "st_head_dt",
    category: "structure",
    label: "Head tube and down tube junction visually sound",
    structural: true,
    mandatory: true,
  },
  {
    checkId: "st_seat_bb",
    category: "structure",
    label: "Seat cluster and bottom bracket shell visually sound",
    structural: true,
    mandatory: true,
  },
  {
    checkId: "st_rear",
    category: "structure",
    label: "Rear triangle / dropouts visually sound",
    structural: true,
    mandatory: true,
  },
  {
    checkId: "st_dents",
    category: "structure",
    label: "No concerning dents, bends, kinks or prior repairs left unresolved",
    structural: true,
    mandatory: true,
  },
  {
    checkId: "st_corrosion",
    category: "structure",
    label: "Corrosion / blistering assessed; no severe unresolved internal risk",
    structural: true,
    mandatory: true,
  },
  {
    checkId: "st_fork",
    category: "structure",
    label: "Fork steerer / crown / dropouts (or N/A if fork not included)",
    structural: true,
    mandatory: true,
    help: "If a fork is included, a not_inspected steerer blocks approval. If it is not included, mark not_applicable.",
  },
  {
    checkId: "st_mods",
    category: "structure",
    label: "Non-original structural modifications reviewed",
    structural: true,
    mandatory: true,
  },
  {
    checkId: "st_carbon",
    category: "structure",
    label: "Carbon-specific damage check (or N/A for non-carbon)",
    structural: true,
    mandatory: true,
    help: "A carbon concern requires specialist review. Visual checks alone are not treated as sufficient.",
  },
  {
    checkId: "co_headset",
    category: "compatibility",
    label: "Headset / steerer standard noted or measured",
    structural: false,
    mandatory: true,
  },
  {
    checkId: "co_bb",
    category: "compatibility",
    label: "Bottom bracket shell type / width noted or measured",
    structural: false,
    mandatory: true,
  },
  {
    checkId: "co_old",
    category: "compatibility",
    label: "Rear spacing (OLD) / axle standard noted or measured",
    structural: false,
    mandatory: true,
  },
  {
    checkId: "co_brakes",
    category: "compatibility",
    label: "Brake mount type and reach assessed",
    structural: false,
    mandatory: true,
  },
  {
    checkId: "co_seatpost",
    category: "compatibility",
    label: "Seatpost diameter / clamp condition assessed",
    structural: false,
    mandatory: true,
  },
  {
    checkId: "co_size",
    category: "compatibility",
    label: "Frame size label recorded (measured where available)",
    structural: false,
    mandatory: true,
  },
];

export type ChecklistItemInput = {
  checkId: string;
  result: ChecklistResult;
  notes?: string;
  resolution?: ItemResolution;
};

export type ExplicitCriticalFlag = {
  id: string;
  unresolved: boolean;
  summary?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  rationale?: string;
};

export function checklistForGroup(group: ChecklistGroupId): ChecklistDef[] {
  return CHECKLIST.filter((item) => item.category === group);
}

export function resolutionIsDocumented(
  resolution: ItemResolution | undefined,
): boolean {
  if (!resolution) return false;
  return (
    resolution.resolvedBy.trim().length > 0 &&
    resolution.resolvedAt.trim().length > 0 &&
    resolution.rationale.trim().length > 0
  );
}

function explicitFlagUnresolved(flag: ExplicitCriticalFlag): boolean {
  if (flag.unresolved) return true;
  return (
    !flag.resolvedBy?.trim() ||
    !flag.resolvedAt?.trim() ||
    !flag.rationale?.trim()
  );
}

export type InspectionEvaluation = {
  outcome: "DRAFT" | "PASS_VISUAL" | "HOLD";
  blockers: string[];
  criticalFlags: string[];
  complete: boolean;
  /** Structural concerns and mandatory `not_inspected` items block approval. */
  approvalBlocked: boolean;
  method: typeof InspectionMethod.VISUAL_MECHANICAL;
};

export function evaluateInspection(params: {
  items: readonly ChecklistItemInput[];
  forkIncluded: boolean;
}): InspectionEvaluation {
  const byId = new Map(params.items.map((item) => [item.checkId, item]));
  const blockers: string[] = [];
  const criticalFlags: string[] = [];
  let complete = true;
  let approvalBlocked = false;

  for (const def of CHECKLIST) {
    const item = byId.get(def.checkId);
    if (!item) {
      complete = false;
      approvalBlocked = true;
      blockers.push(`Missing checklist item: ${def.label}`);
      continue;
    }

    if (def.checkId === "st_fork" && !params.forkIncluded) {
      if (item.result === "not_inspected") {
        complete = false;
        approvalBlocked = true;
        blockers.push(
          "Fork not included — mark steerer check as not_applicable",
        );
      }
      if (item.result === "concern" && !resolutionIsDocumented(item.resolution)) {
        criticalFlags.push(def.checkId);
        approvalBlocked = true;
        blockers.push(`Structural concern: ${def.label}`);
      }
      continue;
    }

    if (def.mandatory && item.result === "not_inspected") {
      complete = false;
      approvalBlocked = true;
      blockers.push(`Mandatory item not inspected: ${def.label}`);
    }

    const concernOpen =
      item.result === "concern" && !resolutionIsDocumented(item.resolution);

    if (def.structural && concernOpen) {
      criticalFlags.push(def.checkId);
      approvalBlocked = true;
      blockers.push(`Structural concern: ${def.label}`);
    }

    if (def.checkId === "st_carbon" && concernOpen) {
      criticalFlags.push("carbon_specialist_required");
      approvalBlocked = true;
      blockers.push("Carbon concern requires specialist assessment");
    }
  }

  let outcome: InspectionEvaluation["outcome"];
  if (criticalFlags.length > 0) outcome = "HOLD";
  else if (!complete) outcome = "DRAFT";
  else if (blockers.length > 0) outcome = "HOLD";
  else outcome = "PASS_VISUAL";

  return {
    outcome,
    blockers,
    criticalFlags,
    complete,
    approvalBlocked,
    method: InspectionMethod.VISUAL_MECHANICAL,
  };
}

export type BuildAvailabilityInput = {
  inspectionOutcome: InspectionOutcomeId | string;
  unresolvedCriticalFlags: readonly string[];
  preparationReleased: boolean;
  reviewerApproved: boolean;
  reinspectionRequired?: boolean;
};

/**
 * available_for_build is true only for PASS_VISUAL, with no unresolved
 * critical flag, preparation released, and reviewer approval.
 * Value class and preservation class are not inputs.
 */
export function availableForBuild(input: BuildAvailabilityInput): boolean {
  return (
    input.inspectionOutcome === InspectionOutcome.PASS_VISUAL &&
    input.unresolvedCriticalFlags.length === 0 &&
    input.preparationReleased &&
    input.reviewerApproved &&
    input.reinspectionRequired !== true
  );
}

export function canMarkAvailableForBuild(params: {
  inspectionOutcome: string;
  unresolvedCriticalFlags: readonly string[];
  preparationReleased: boolean;
  safetyApproved: boolean;
  priceApproved: boolean;
}): boolean {
  return (
    availableForBuild({
      inspectionOutcome: params.inspectionOutcome,
      unresolvedCriticalFlags: params.unresolvedCriticalFlags,
      preparationReleased: params.preparationReleased,
      reviewerApproved: params.safetyApproved,
    }) && params.priceApproved
  );
}

const OUTCOME_SEVERITY: Record<InspectionOutcomeId, number> = {
  PASS_VISUAL: 0,
  DRAFT: 1,
  HOLD: 2,
  REJECT: 3,
};

function stricterOutcome(
  left: InspectionOutcomeId,
  right: InspectionOutcomeId,
): InspectionOutcomeId {
  return OUTCOME_SEVERITY[left] >= OUTCOME_SEVERITY[right] ? left : right;
}

export type BuildAssessment = {
  outcome: InspectionOutcomeId;
  blockers: string[];
  criticalFlags: string[];
  unresolvedCriticalFlags: string[];
  complete: boolean;
  approvalBlocked: boolean;
  availableForBuild: boolean;
  listingEligible: boolean;
  method: typeof InspectionMethod.VISUAL_MECHANICAL;
  /** Echoed so callers can see they did not affect the safety result. */
  preservationClass: PreservationClass | null;
  valueClass: ValueClass | null;
};

export function assessBuildAvailability(input: {
  items: readonly ChecklistItemInput[];
  forkIncluded: boolean;
  declaredOutcome?: InspectionOutcomeId;
  preparationReleased: boolean;
  reviewerApproved: boolean;
  reinspectionRequired?: boolean;
  explicitCriticalFlags?: readonly ExplicitCriticalFlag[];
  /** Accepted and ignored. A market class cannot clear a structural concern. */
  valueClass?: ValueClass | null;
  /** Accepted and ignored. Preservation effort is not a safety result. */
  preservationClass?: PreservationClass | null;
  material?: Material | null;
}): BuildAssessment {
  void input.material;
  const evaluation = evaluateInspection({
    items: input.items,
    forkIncluded: input.forkIncluded,
  });
  const explicitUnresolved = (input.explicitCriticalFlags ?? []).filter(
    explicitFlagUnresolved,
  );
  const unresolvedCriticalFlags = [
    ...evaluation.criticalFlags,
    ...explicitUnresolved.map((flag) => flag.id),
  ];

  let outcome: InspectionOutcomeId = evaluation.outcome;
  if (explicitUnresolved.length > 0) {
    outcome = stricterOutcome(outcome, InspectionOutcome.HOLD);
  }
  if (input.declaredOutcome === InspectionOutcome.REJECT) {
    outcome = InspectionOutcome.REJECT;
  } else if (input.declaredOutcome === InspectionOutcome.HOLD) {
    outcome = stricterOutcome(outcome, InspectionOutcome.HOLD);
  } else if (
    input.declaredOutcome === InspectionOutcome.DRAFT &&
    outcome === InspectionOutcome.PASS_VISUAL
  ) {
    outcome = InspectionOutcome.DRAFT;
  } else if (input.declaredOutcome === InspectionOutcome.PASS_VISUAL) {
    outcome = stricterOutcome(outcome, InspectionOutcome.PASS_VISUAL);
  }

  const approvalBlocked =
    evaluation.approvalBlocked ||
    explicitUnresolved.length > 0 ||
    outcome === InspectionOutcome.HOLD ||
    outcome === InspectionOutcome.REJECT;

  const available = availableForBuild({
    inspectionOutcome: outcome,
    unresolvedCriticalFlags,
    preparationReleased: input.preparationReleased,
    reviewerApproved: input.reviewerApproved,
    reinspectionRequired: input.reinspectionRequired,
  });

  return {
    outcome,
    blockers: evaluation.blockers,
    criticalFlags: evaluation.criticalFlags,
    unresolvedCriticalFlags,
    complete: evaluation.complete,
    approvalBlocked,
    availableForBuild: available,
    listingEligible: available && !approvalBlocked,
    method: InspectionMethod.VISUAL_MECHANICAL,
    preservationClass: input.preservationClass ?? null,
    valueClass: input.valueClass ?? null,
  };
}

export function visualInspectionPassStatement(isoDate: string): string {
  return `${VISUAL_INSPECTION_PASS_PREFIX}${isoDate}`;
}

const BANNED_WITHOUT_NDT: ReadonlyArray<{ pattern: RegExp; label: string }> = [
  { pattern: /x-ray/i, label: "x-ray" },
  { pattern: /ultrasound/i, label: "ultrasound" },
  { pattern: /crack-free guaranteed/i, label: "crack-free guaranteed" },
  { pattern: /certified safe/i, label: "certified safe" },
];

/** Public copy may name a lab method only when that service was recorded and approved. */
export function inspectionLanguageViolations(
  text: string,
  ndt: NondestructiveTestRecord | null,
): string[] {
  const violations: string[] = [];
  for (const rule of BANNED_WITHOUT_NDT) {
    if (!rule.pattern.test(text)) continue;
    const ndtCovers =
      ndt?.performed === true &&
      ndt.serviceRecordId.trim().length > 0 &&
      ndt.approvedBy.trim().length > 0 &&
      ((rule.label === "x-ray" && ndt.method === "x_ray") ||
        (rule.label === "ultrasound" && ndt.method === "ultrasound"));
    if (!ndtCovers) violations.push(rule.label);
  }
  return violations;
}
