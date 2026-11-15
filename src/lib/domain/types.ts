/**
 * BICII Frame Atlas domain vocabulary.
 *
 * Three axes stay separate:
 * - inspection outcome is structural readiness
 * - preservation class is work effort
 * - value class is historical/commercial position
 *
 * Money amounts in this domain are integer SGD cents. Rates that enter
 * pricing are integer basis points (10_000 = 100%) once they reach the engine.
 */

export const InspectionOutcome = {
  DRAFT: "DRAFT",
  PASS_VISUAL: "PASS_VISUAL",
  HOLD: "HOLD",
  REJECT: "REJECT",
} as const;
export type InspectionOutcome =
  (typeof InspectionOutcome)[keyof typeof InspectionOutcome];

export const PreservationClass = {
  P1: "P1",
  P2: "P2",
  P3: "P3",
  P4: "P4",
} as const;
export type PreservationClass =
  (typeof PreservationClass)[keyof typeof PreservationClass];

export const ValueClass = {
  F1: "F1",
  F2: "F2",
  F3: "F3",
  F4: "F4",
  F5: "F5",
} as const;
export type ValueClass = (typeof ValueClass)[keyof typeof ValueClass];

export const LifecycleStatus = {
  INTAKE_DRAFT: "intake_draft",
  IDENTIFIED: "identified",
  INSPECTION_PENDING: "inspection_pending",
  HOLD: "hold",
  REJECTED: "rejected",
  INSPECTION_PASSED: "inspection_passed",
  PREPARATION_PLANNED: "preparation_planned",
  PREPARATION_IN_PROGRESS: "preparation_in_progress",
  READY_FOR_PRICING: "ready_for_pricing",
  PRICING_REVIEW: "pricing_review",
  APPROVED: "approved",
  LISTED: "listed",
  RESERVED: "reserved",
  ALLOCATED_TO_BUILD: "allocated_to_build",
  SOLD: "sold",
  ARCHIVED: "archived",
} as const;
export type LifecycleStatus =
  (typeof LifecycleStatus)[keyof typeof LifecycleStatus];

export const CosmeticCondition = {
  ORIGINAL_EXCELLENT: "original_excellent",
  ORIGINAL_WORN_PATINA: "original_worn_patina",
  ORIGINAL_HEAVY_COSMETIC_WEAR: "original_heavy_cosmetic_wear",
  RETOUCHED_CONSERVED: "retouched_conserved",
  REPAINTED_REFINISHED: "repainted_refinished",
  UNKNOWN: "unknown",
} as const;
export type CosmeticCondition =
  (typeof CosmeticCondition)[keyof typeof CosmeticCondition];

export const Material = {
  STEEL: "steel",
  ALUMINIUM: "aluminium",
  CARBON: "carbon",
  TITANIUM: "titanium",
  OTHER: "other",
  UNKNOWN: "unknown",
} as const;
export type Material = (typeof Material)[keyof typeof Material];

export const Confidence = {
  CONFIRMED: "confirmed",
  LIKELY: "likely",
  PROVISIONAL: "provisional",
  UNKNOWN: "unknown",
} as const;
export type Confidence = (typeof Confidence)[keyof typeof Confidence];

export const ChecklistItemResult = {
  PASS: "pass",
  CONCERN: "concern",
  NOT_APPLICABLE: "not_applicable",
  NOT_INSPECTED: "not_inspected",
} as const;
export type ChecklistItemResult =
  (typeof ChecklistItemResult)[keyof typeof ChecklistItemResult];

/** Existing name used by the inspection UI and stored rows. */
export type ChecklistResult = ChecklistItemResult;

export const ChecklistGroup = {
  IDENTIFICATION: "identification",
  STRUCTURE: "structure",
  COMPATIBILITY: "compatibility",
} as const;
export type ChecklistGroup =
  (typeof ChecklistGroup)[keyof typeof ChecklistGroup];

export const DesirabilityDimension = {
  MAKER_PROVENANCE: "maker_provenance",
  MODEL_RELEVANCE: "model_relevance",
  CONSTRUCTION_INTEREST: "construction_interest",
  SCARCITY: "scarcity",
  BUYER_DEMAND: "buyer_demand",
  PROVENANCE_COMPLETENESS: "provenance_completeness",
} as const;
export type DesirabilityDimension =
  (typeof DesirabilityDimension)[keyof typeof DesirabilityDimension];

export const Role = {
  ADMIN: "admin",
  REVIEWER: "reviewer",
  MECHANIC: "mechanic",
  VIEWER: "viewer",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const InspectionMethod = {
  VISUAL_MECHANICAL: "visual_mechanical",
} as const;
export type InspectionMethod =
  (typeof InspectionMethod)[keyof typeof InspectionMethod];

export const PhotoCategory = {
  DRIVE_SIDE: "drive_side",
  NON_DRIVE_SIDE: "non_drive_side",
  HEAD_TUBE: "head_tube",
  BOTTOM_BRACKET: "bottom_bracket",
  SEAT_CLUSTER: "seat_cluster",
  REAR_DROPOUTS: "rear_dropouts",
  SERIAL: "serial",
  DAMAGE_OR_TREATMENT: "damage_or_treatment",
  FORK: "fork",
  OTHER: "other",
} as const;
export type PhotoCategory = (typeof PhotoCategory)[keyof typeof PhotoCategory];

export const PhotoVisibility = {
  INTERNAL: "internal",
  PUBLIC: "public",
} as const;
export type PhotoVisibility =
  (typeof PhotoVisibility)[keyof typeof PhotoVisibility];

export const CostCategory = {
  ACQUISITION: "acquisition",
  FREIGHT: "freight",
  LABOR: "labor",
  MATERIALS: "materials",
  OVERHEAD: "overhead",
  EXTERNAL: "external",
} as const;
export type CostCategory = (typeof CostCategory)[keyof typeof CostCategory];

export const ComparableKind = {
  ASKING: "asking",
  SOLD: "sold",
} as const;
export type ComparableKind =
  (typeof ComparableKind)[keyof typeof ComparableKind];

export const ForkInclusion = {
  BARE_FRAME: "bare_frame",
  MATCHING_FORK: "matching_fork",
  NON_MATCHING_FORK: "non_matching_fork",
  UNKNOWN: "unknown",
} as const;
export type ForkInclusion = (typeof ForkInclusion)[keyof typeof ForkInclusion];

export const ForkOriginality = {
  ORIGINAL: "original",
  PERIOD: "period",
  REPLACEMENT: "replacement",
  UNKNOWN: "unknown",
  NOT_INCLUDED: "not_included",
} as const;
export type ForkOriginality =
  (typeof ForkOriginality)[keyof typeof ForkOriginality];

export const AcquisitionSourceType = {
  COLLECTOR: "collector",
  LISTING: "listing",
  DONATION: "donation",
  TRADE: "trade",
  SHOP_STOCK: "shop_stock",
  CUSTOMER_OWNED: "customer_owned",
  UNKNOWN: "unknown",
} as const;
export type AcquisitionSourceType =
  (typeof AcquisitionSourceType)[keyof typeof AcquisitionSourceType];

export const OwnershipStatus = {
  PURCHASED: "purchased",
  CONSIGNED: "consigned",
  CUSTOMER_OWNED: "customer_owned",
  UNKNOWN: "unknown",
} as const;
export type OwnershipStatus =
  (typeof OwnershipStatus)[keyof typeof OwnershipStatus];

export const PreservationTaskType = {
  STRIP: "strip",
  CLEAN_DEGREASE: "clean_degrease",
  CORROSION_REMOVAL: "corrosion_removal",
  RUST_CONVERTER: "rust_converter",
  EXTERIOR_PROTECTION: "exterior_protection",
  INTERNAL_STEEL_PROTECTION: "internal_steel_protection",
  PAINT_TOUCH_UP: "paint_touch_up",
  POLISH: "polish",
  COSMETIC_KINTSUGI: "cosmetic_kintsugi",
  SPECIALIST_SERVICE: "specialist_service",
  READY_TO_BUILD: "ready_to_build",
  OTHER: "other",
} as const;
export type PreservationTaskType =
  (typeof PreservationTaskType)[keyof typeof PreservationTaskType];

export const PreservationTaskStatus = {
  PLANNED: "planned",
  IN_PROGRESS: "in_progress",
  DONE: "done",
  BLOCKED: "blocked",
  SKIPPED: "skipped",
} as const;
export type PreservationTaskStatus =
  (typeof PreservationTaskStatus)[keyof typeof PreservationTaskStatus];

export const NdtMethod = {
  X_RAY: "x_ray",
  ULTRASOUND: "ultrasound",
  DYE_PENETRANT: "dye_penetrant",
  OTHER: "other",
} as const;
export type NdtMethod = (typeof NdtMethod)[keyof typeof NdtMethod];

export const TaxDisplay = {
  EXCLUSIVE: "exclusive",
  INCLUSIVE: "inclusive",
} as const;
export type TaxDisplay = (typeof TaxDisplay)[keyof typeof TaxDisplay];

export const RoundingStep = {
  SGD_10: 1_000,
  SGD_50: 5_000,
} as const;
export type RoundingStep = (typeof RoundingStep)[keyof typeof RoundingStep];

/** Future build-package eligibility. Not a safety result. */
export const BuildCompatibility = {
  COMPATIBLE: "compatible",
  INCOMPATIBLE: "incompatible",
  REQUIRES_REVIEW: "requires_review",
} as const;
export type BuildCompatibility =
  (typeof BuildCompatibility)[keyof typeof BuildCompatibility];

/** Integer SGD cents. Runtime checks reject fractional values. */
export type Cents = number;

/** Integer basis points. 4_000 = 40%. 10_000 = 100%. */
export type BasisPoints = number;

export type CriticalFlag = {
  id: string;
  summary: string;
  unresolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
  rationale?: string;
};

export type NondestructiveTestRecord = {
  method: NdtMethod;
  performed: true;
  serviceRecordId: string;
  approvedBy: string;
  performedAt: string;
};

export type TaxDisplayConfig = {
  gstRegistered: boolean;
  /** Ignored by margin math. Singapore 9% is 900. */
  gstRateBps: BasisPoints;
  retailDisplay: TaxDisplay;
};

export type ItemResolution = {
  resolvedBy: string;
  resolvedAt: string;
  rationale: string;
};

export type ReviewerApproval = {
  reviewerId: string;
  approvedAt: string;
  rationale?: string;
};

export const VALUE_CLASS_LABELS: Record<ValueClass, string> = {
  F1: "Found Gems",
  F2: "Everyday Classics",
  F3: "Heritage",
  F4: "Sought After",
  F5: "Collector",
};

/** Guide bands in whole SGD. Not a safety or preservation scale. */
export const VALUE_CLASS_BANDS_SGD: Record<
  ValueClass,
  { min: number; max: number | null; label: string }
> = {
  F1: { min: 200, max: 349, label: VALUE_CLASS_LABELS.F1 },
  F2: { min: 350, max: 499, label: VALUE_CLASS_LABELS.F2 },
  F3: { min: 500, max: 699, label: VALUE_CLASS_LABELS.F3 },
  F4: { min: 700, max: 999, label: VALUE_CLASS_LABELS.F4 },
  F5: { min: 1000, max: null, label: VALUE_CLASS_LABELS.F5 },
};

/** Same bands in integer cents. F2 max is S$499.00 = 49900. */
export const VALUE_CLASS_BANDS_CENTS: Record<
  ValueClass,
  { min: number; max: number | null }
> = {
  F1: { min: 20_000, max: 34_900 },
  F2: { min: 35_000, max: 49_900 },
  F3: { min: 50_000, max: 69_900 },
  F4: { min: 70_000, max: 99_900 },
  F5: { min: 100_000, max: null },
};

/**
 * Score → value class. A configurable starting hypothesis, not market science.
 * Inclusive bounds. F1 = 0–19 … F5 = 80–100.
 */
export const DEFAULT_DESIRABILITY_THRESHOLDS: Record<
  ValueClass,
  [number, number]
> = {
  F1: [0, 19],
  F2: [20, 39],
  F3: [40, 59],
  F4: [60, 79],
  F5: [80, 100],
};

export const DIMENSION_MAX: Record<DesirabilityDimension, number> = {
  maker_provenance: 15,
  model_relevance: 20,
  construction_interest: 20,
  scarcity: 15,
  buyer_demand: 20,
  provenance_completeness: 10,
};

export const DIMENSION_GUIDE: Record<DesirabilityDimension, string> = {
  maker_provenance:
    "Quality of evidence about the actual maker, including credible white-label attribution",
  model_relevance: "Was this frame or model notable, distinctive, or influential?",
  construction_interest:
    "Verified tubing, construction, or design interest — not a generic material bias",
  scarcity: "Local and regional supply, original configuration, verified availability",
  buyer_demand:
    "Comparable sales where possible; asking prices stay labelled as asking",
  provenance_completeness:
    "Original fork, paint, markings, and credible records — not an invented backstory",
};

export const PRESERVATION_GUIDE: Record<
  PreservationClass,
  { label: string; hours: string }
> = {
  P1: { label: "Light", hours: "1–2 hours" },
  P2: { label: "Standard", hours: "2–4 hours" },
  P3: { label: "Extensive", hours: "4–7 hours" },
  P4: { label: "Specialist", hours: "Individually scoped" },
};

export const VISUAL_INSPECTION_PASS_PREFIX =
  "Passed BICII’s documented visual/mechanical inspection on ";

export const BASIS_POINTS_SCALE = 10_000;
