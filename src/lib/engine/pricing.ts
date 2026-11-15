import {
  BASIS_POINTS_SCALE,
  RoundingStep,
  VALUE_CLASS_BANDS_CENTS,
  type BasisPoints,
  type Cents,
  type ComparableKind,
  type CostCategory,
  type TaxDisplayConfig,
  type ValueClass,
} from "../domain/types";
import {
  assertFeasibleMargin,
  assertNonNegativeCents,
  divRoundHalfUp,
  formatExactPercent,
  PricingValidationError,
  rateToBasisPoints,
} from "./money";

export { PricingValidationError, formatExactPercent, rateToBasisPoints };

export type CostInputs = {
  acquisitionCents: number;
  freightCents?: number;
  labourCents: number;
  materialsCents: number;
  externalCents?: number;
  overheadCents: number;
};

export type PriceFloorInput = {
  preparedCostCents: number;
  /** Decimal rate, e.g. 0.4 for 40%. Converted to basis points before division. */
  targetGrossMargin: number;
  sellingFeeRate?: number;
};

export type ValueClassBandCents = {
  min: number;
  max: number | null;
};

const COST_LABELS: Record<keyof CostInputs, CostCategory> = {
  acquisitionCents: "acquisition",
  freightCents: "freight",
  labourCents: "labor",
  materialsCents: "materials",
  externalCents: "external",
  overheadCents: "overhead",
};

function costParts(input: CostInputs): Array<{ category: CostCategory; cents: Cents }> {
  const raw: Array<[keyof CostInputs, number]> = [
    ["acquisitionCents", input.acquisitionCents],
    ["freightCents", input.freightCents ?? 0],
    ["labourCents", input.labourCents],
    ["materialsCents", input.materialsCents],
    ["externalCents", input.externalCents ?? 0],
    ["overheadCents", input.overheadCents],
  ];
  return raw.map(([key, amount]) => ({
    category: COST_LABELS[key],
    cents: assertNonNegativeCents(amount, key),
  }));
}

/** acquisition + freight + labour + materials + external services + overhead. */
export function preparedCostCents(input: CostInputs): Cents {
  return costParts(input).reduce((sum, part) => sum + part.cents, 0);
}

export function sumPreparedCost(input: CostInputs): Cents {
  return preparedCostCents({
    acquisitionCents: Math.max(0, input.acquisitionCents),
    freightCents: Math.max(0, input.freightCents ?? 0),
    labourCents: Math.max(0, input.labourCents),
    materialsCents: Math.max(0, input.materialsCents),
    externalCents: Math.max(0, input.externalCents ?? 0),
    overheadCents: Math.max(0, input.overheadCents),
  });
}

/**
 * Labour cost from decimal hours. Hours must be a 0.01 step so the product
 * stays in integer cents (3.5 h × S$25 = 8750 cents).
 */
export function labourCostCents(hours: number, rateCentsPerHour: number): Cents {
  const rate = assertNonNegativeCents(rateCentsPerHour, "labour rate");
  if (!Number.isFinite(hours) || hours < 0) {
    throw new PricingValidationError(
      "NEGATIVE_AMOUNT",
      "Labour hours must be a non-negative finite number",
    );
  }
  const centihoursFloat = hours * 100;
  const centihours = Math.round(centihoursFloat);
  if (Math.abs(centihoursFloat - centihours) > 1e-6) {
    throw new PricingValidationError(
      "NON_INTEGER_CENTS",
      "Labour hours must be an exact 0.01 hour step",
    );
  }
  return divRoundHalfUp(BigInt(centihours) * BigInt(rate), BigInt(100));
}

export function labourCentsFromMinutes(
  minutes: number,
  rateCentsPerHour: number,
): Cents {
  const mins = assertNonNegativeCents(minutes, "labour minutes");
  const rate = assertNonNegativeCents(rateCentsPerHour, "labour rate");
  return divRoundHalfUp(BigInt(mins) * BigInt(rate), BigInt(60));
}

/**
 * minimum_price_after_fee = prepared_cost / (1 - margin - fee)
 * in integer cents, rounded half-up.
 * Valid only when margin + fee < 1.
 */
export function minimumPriceAfterFeeCents(
  preparedCost: number,
  targetGrossMarginBps: BasisPoints,
  sellingFeeBps: BasisPoints = 0,
): Cents {
  const cost = assertNonNegativeCents(preparedCost, "prepared cost");
  const denominator = assertFeasibleMargin(targetGrossMarginBps, sellingFeeBps);
  return divRoundHalfUp(
    BigInt(cost) * BigInt(BASIS_POINTS_SCALE),
    BigInt(denominator),
  );
}

/** minimum_price_before_sales_fees = prepared_cost / (1 - target_gross_margin) */
export function minimumPriceBeforeSalesFeesCents(
  preparedCost: number,
  targetGrossMarginBps: BasisPoints,
): Cents {
  return minimumPriceAfterFeeCents(preparedCost, targetGrossMarginBps, 0);
}

/** Decimal-rate wrapper kept for the price worksheet and existing callers. */
export function computeCostFloor(input: PriceFloorInput): Cents {
  const marginBps = rateToBasisPoints(input.targetGrossMargin);
  const feeBps = rateToBasisPoints(input.sellingFeeRate ?? 0);
  return minimumPriceAfterFeeCents(
    input.preparedCostCents,
    marginBps,
    feeBps,
  );
}

export function roundCentsToStep(
  cents: number,
  stepCents: number,
  mode: "nearest" | "up" | "down" = "nearest",
): Cents {
  const amount = assertNonNegativeCents(cents, "amount");
  if (!Number.isInteger(stepCents) || stepCents <= 0) {
    throw new PricingValidationError(
      "INVALID_STEP",
      "Rounding step must be a positive integer number of cents",
    );
  }
  const value = BigInt(amount);
  const step = BigInt(stepCents);
  if (mode === "down") return Number((value / step) * step);
  if (mode === "up") return Number(((value + step - BigInt(1)) / step) * step);
  const quotient = value / step;
  const remainder = value % step;
  const rounded = remainder * BigInt(2) >= step ? quotient + BigInt(1) : quotient;
  return Number(rounded * step);
}

export function roundToNearestTenDollars(cents: number): Cents {
  return roundCentsToStep(cents, RoundingStep.SGD_10, "nearest");
}

export function roundToNearestFiftyDollars(cents: number): Cents {
  return roundCentsToStep(cents, RoundingStep.SGD_50, "nearest");
}

export function roundUpToTenDollars(cents: number): Cents {
  return roundCentsToStep(cents, RoundingStep.SGD_10, "up");
}

export function roundUpToFiftyDollars(cents: number): Cents {
  return roundCentsToStep(cents, RoundingStep.SGD_50, "up");
}

export function roundToStepCents(
  cents: number,
  step: 1000 | 5000 = 1000,
): Cents {
  return roundCentsToStep(cents, step, "nearest");
}

export type PricingConflict = {
  conflict: boolean;
  message?: string;
  valueClass: ValueClass;
  /** A cost-floor clash never promotes the frame into a higher class. */
  reclassified: false;
  bandMaxCents: number | null;
};

export function classBandConflict(
  params: {
    costFloorCents: number;
    valueClass: ValueClass;
  },
  bands: Record<ValueClass, ValueClassBandCents> = VALUE_CLASS_BANDS_CENTS,
): PricingConflict {
  const floor = assertNonNegativeCents(params.costFloorCents, "cost floor");
  const band = bands[params.valueClass];
  const base = {
    valueClass: params.valueClass,
    reclassified: false as const,
    bandMaxCents: band.max,
  };
  if (band.max !== null && floor > band.max) {
    const maxDollars = Math.floor(band.max / 100);
    return {
      ...base,
      conflict: true,
      message: `Cost floor exceeds ${params.valueClass} band maximum (S$${maxDollars}). This is a buying or preparation decision and does not change the value class.`,
    };
  }
  return { ...base, conflict: false };
}

export function grossMarginAtPrice(
  preparedCostCents: number,
  retailCents: number,
): number {
  const cost = assertNonNegativeCents(preparedCostCents, "prepared cost");
  const retail = assertNonNegativeCents(retailCents, "retail price");
  if (retail <= 0) return 0;
  return (retail - cost) / retail;
}

export type MarginBreakdown = {
  grossProfitCents: number;
  /** profit / retail. This is margin, not markup. */
  marginNumerator: number;
  marginDenominator: number;
  marginPercent: string;
  /** profit / cost. Kept separate so markup is not labelled as margin. */
  markupNumerator: number;
  markupDenominator: number;
  markupPercent: string;
};

export function grossMarginBreakdown(
  preparedCostCents: number,
  retailCents: number,
): MarginBreakdown {
  const cost = assertNonNegativeCents(preparedCostCents, "prepared cost");
  const retail = assertNonNegativeCents(retailCents, "retail price");
  const profit = retail - cost;
  return {
    grossProfitCents: profit,
    marginNumerator: profit,
    marginDenominator: retail,
    marginPercent: retail === 0 ? "—" : formatExactPercent(profit, retail),
    markupNumerator: profit,
    markupDenominator: cost,
    markupPercent: cost === 0 ? "—" : formatExactPercent(profit, cost),
  };
}

export type RetailPriceAssessment = {
  belowFloor: boolean;
  allowed: boolean;
  errors: string[];
  warnings: string[];
  grossProfitCents: number;
  marginPercent: string;
};

export function assessRetailPrice(input: {
  preparedCostCents: number;
  costFloorCents: number;
  retailCents: number;
  belowFloorJustification?: string;
  authorisedBy?: string;
}): RetailPriceAssessment {
  const cost = assertNonNegativeCents(input.preparedCostCents, "prepared cost");
  const floor = assertNonNegativeCents(input.costFloorCents, "cost floor");
  const retail = assertNonNegativeCents(input.retailCents, "retail price");
  const margin = grossMarginBreakdown(cost, retail);
  const belowFloor = retail < floor;
  const errors: string[] = [];
  const warnings: string[] = [];
  if (belowFloor) {
    const reason = input.belowFloorJustification?.trim() ?? "";
    const authoriser = input.authorisedBy?.trim() ?? "";
    if (!reason || !authoriser) {
      errors.push(
        "Below-floor pricing requires an authorised approver and a written justification",
      );
    } else {
      warnings.push(
        `Below cost floor by ${floor - retail} cents. Gross margin ${margin.marginPercent} stays visible.`,
      );
    }
  }
  if (margin.grossProfitCents < 0) {
    warnings.push("Retail price is below prepared cost");
  }
  return {
    belowFloor,
    allowed: errors.length === 0,
    errors,
    warnings,
    grossProfitCents: margin.grossProfitCents,
    marginPercent: margin.marginPercent,
  };
}

export function suggestPriceInBand(params: {
  costFloorCents: number;
  valueClass: ValueClass;
  marketMinCents?: number | null;
  marketMaxCents?: number | null;
  step?: 1000 | 5000;
}): { suggestedCents: number; rationale: string } {
  const band = VALUE_CLASS_BANDS_CENTS[params.valueClass];
  const step = params.step ?? RoundingStep.SGD_10;
  const floor = assertNonNegativeCents(params.costFloorCents, "cost floor");
  let low = Math.max(floor, band.min);
  let high = band.max ?? Math.max(low + 20_000, floor + 20_000);

  if (params.marketMinCents != null) {
    low = Math.max(low, assertNonNegativeCents(params.marketMinCents, "market min"));
  }
  if (params.marketMaxCents != null) {
    high = Math.min(
      high,
      assertNonNegativeCents(params.marketMaxCents, "market max"),
    );
  }
  if (high < low) {
    return {
      suggestedCents: roundToStepCents(floor, step),
      rationale:
        "Market evidence sits below the cost floor. Suggest the floor and keep the commercial conflict visible. Do not raise the value class to hide it.",
    };
  }
  const mid = divRoundHalfUp(BigInt(low + high), BigInt(2));
  return {
    suggestedCents: roundToStepCents(mid, step),
    rationale:
      "Midpoint of the reasoned interval where cost floor, value-class band, and comparables overlap",
  };
}

export type PriceWorksheet = {
  lines: Array<{ category: CostCategory; cents: Cents }>;
  preparedCostCents: Cents;
  marginBasis: "before_sales_fees" | "after_fee";
  targetGrossMarginBps: BasisPoints;
  sellingFeeBps: BasisPoints;
  minimumPriceBeforeSalesFeesCents: Cents | null;
  minimumPriceAfterFeeCents: Cents | null;
  infeasibleRate: boolean;
  infeasibleMessage: string | null;
  valueClass: ValueClass;
  bandMinCents: number;
  bandMaxCents: number | null;
  pricingConflict: boolean;
  conflictMessage: string | null;
  /** GST display is applied after the floor. It is not part of the margin divisor. */
  exGstFloorCents: Cents | null;
  gstDisplayCents: Cents | null;
  retailDisplayCents: Cents | null;
  rounded: {
    nearest10: Cents | null;
    nearest50: Cents | null;
    up10: Cents | null;
    up50: Cents | null;
  };
};

export function gstOnTop(exGstCents: number, gstRateBps: number): Cents {
  const base = assertNonNegativeCents(exGstCents, "ex-GST amount");
  if (!Number.isInteger(gstRateBps) || gstRateBps < 0) {
    throw new PricingValidationError(
      "RATE_OUT_OF_RANGE",
      "GST rate must be a non-negative integer number of basis points",
    );
  }
  return divRoundHalfUp(BigInt(base) * BigInt(gstRateBps), BigInt(BASIS_POINTS_SCALE));
}

export function buildPriceWorksheet(input: {
  costs: CostInputs;
  targetGrossMarginBps: BasisPoints;
  sellingFeeBps?: BasisPoints;
  valueClass: ValueClass;
  tax?: TaxDisplayConfig;
}): PriceWorksheet {
  const lines = costParts(input.costs);
  const prepared = lines.reduce((sum, line) => sum + line.cents, 0);
  const fee = input.sellingFeeBps ?? 0;
  const band = VALUE_CLASS_BANDS_CENTS[input.valueClass];
  let before: Cents | null = null;
  let after: Cents | null = null;
  let infeasibleRate = false;
  let infeasibleMessage: string | null = null;
  try {
    before = minimumPriceBeforeSalesFeesCents(prepared, input.targetGrossMarginBps);
    after = minimumPriceAfterFeeCents(prepared, input.targetGrossMarginBps, fee);
  } catch (error) {
    if (
      error instanceof PricingValidationError &&
      error.code === "INFEASIBLE_RATE"
    ) {
      infeasibleRate = true;
      infeasibleMessage = error.message;
    } else {
      throw error;
    }
  }
  const floor = fee > 0 ? after : before;
  const conflict =
    floor == null
      ? null
      : classBandConflict({
          costFloorCents: floor,
          valueClass: input.valueClass,
        });
  const tax = input.tax;
  const chargeGst =
    tax?.gstRegistered === true &&
    tax.retailDisplay === "inclusive" &&
    tax.gstRateBps > 0 &&
    floor != null;
  const gstDisplayCents = chargeGst && floor != null ? gstOnTop(floor, tax.gstRateBps) : 0;
  return {
    lines,
    preparedCostCents: prepared,
    marginBasis: fee > 0 ? "after_fee" : "before_sales_fees",
    targetGrossMarginBps: input.targetGrossMarginBps,
    sellingFeeBps: fee,
    minimumPriceBeforeSalesFeesCents: before,
    minimumPriceAfterFeeCents: after,
    infeasibleRate,
    infeasibleMessage,
    valueClass: input.valueClass,
    bandMinCents: band.min,
    bandMaxCents: band.max,
    pricingConflict: conflict?.conflict ?? false,
    conflictMessage: conflict?.message ?? null,
    exGstFloorCents: floor,
    gstDisplayCents: floor == null ? null : gstDisplayCents,
    retailDisplayCents: floor == null ? null : floor + gstDisplayCents,
    rounded: {
      nearest10: floor == null ? null : roundToNearestTenDollars(floor),
      nearest50: floor == null ? null : roundToNearestFiftyDollars(floor),
      up10: floor == null ? null : roundUpToTenDollars(floor),
      up50: floor == null ? null : roundUpToFiftyDollars(floor),
    },
  };
}

export type PricingSnapshot = {
  readonly preparedCostCents: Cents;
  readonly costFloorCents: Cents;
  readonly targetGrossMarginBps: BasisPoints;
  readonly sellingFeeBps: BasisPoints;
  readonly valueClass: ValueClass;
  readonly approvedPriceCents: Cents | null;
  readonly locked: true;
};

export function lockPricingSnapshot(
  snapshot: Omit<PricingSnapshot, "locked">,
): PricingSnapshot {
  return Object.freeze({
    preparedCostCents: assertNonNegativeCents(
      snapshot.preparedCostCents,
      "prepared cost",
    ),
    costFloorCents: assertNonNegativeCents(snapshot.costFloorCents, "cost floor"),
    targetGrossMarginBps: snapshot.targetGrossMarginBps,
    sellingFeeBps: snapshot.sellingFeeBps,
    valueClass: snapshot.valueClass,
    approvedPriceCents:
      snapshot.approvedPriceCents == null
        ? null
        : assertNonNegativeCents(snapshot.approvedPriceCents, "approved price"),
    locked: true,
  });
}

/**
 * A labour-rate change builds a new proposal. The locked approval object is
 * returned unchanged and is not rewritten.
 */
export function recomputeUnlockedProposal(
  locked: PricingSnapshot,
  costs: CostInputs,
  targetGrossMarginBps: BasisPoints = locked.targetGrossMarginBps,
  sellingFeeBps: BasisPoints = locked.sellingFeeBps,
): {
  locked: PricingSnapshot;
  proposalPreparedCostCents: Cents;
  proposalFloorCents: Cents;
} {
  const proposalPreparedCostCents = preparedCostCents(costs);
  const proposalFloorCents = minimumPriceAfterFeeCents(
    proposalPreparedCostCents,
    targetGrossMarginBps,
    sellingFeeBps,
  );
  return { locked, proposalPreparedCostCents, proposalFloorCents };
}

export type MarketComparable = {
  kind: ComparableKind;
  amountCents: number;
  currency: string;
  forkIncluded: boolean | null;
};

export function splitComparables<T extends { kind: ComparableKind }>(
  comps: readonly T[],
): { asking: T[]; sold: T[] } {
  return {
    asking: comps.filter((comp) => comp.kind === "asking"),
    sold: comps.filter((comp) => comp.kind === "sold"),
  };
}

export function forkComparabilityNote(
  frameForkIncluded: boolean,
  compForkIncluded: boolean | null,
): string | null {
  if (compForkIncluded == null) {
    return "Comparable does not state whether a fork is included — not like-for-like.";
  }
  if (compForkIncluded === frameForkIncluded) return null;
  return frameForkIncluded
    ? "Comparable is a bare frame and this record includes a fork — not like-for-like."
    : "Comparable includes a fork and this record is a bare frame — not like-for-like.";
}
