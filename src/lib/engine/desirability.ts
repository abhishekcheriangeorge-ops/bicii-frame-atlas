import {
  Confidence,
  DEFAULT_DESIRABILITY_THRESHOLDS,
  DIMENSION_MAX,
  type Confidence as ConfidenceId,
  type DesirabilityDimension,
  type ValueClass,
} from "../domain/types";

export type DimensionScoreInput = {
  dimension: DesirabilityDimension;
  points: number | null;
  insufficientEvidence: boolean;
  confidence: ConfidenceId;
  evidence?: string;
  /** Positive points on a guess are discarded. Unknown is not stored as a confident zero. */
  guessed?: boolean;
};

export type ScoreThresholds = Record<ValueClass, [number, number]>;

const CLASS_ORDER: readonly ValueClass[] = ["F1", "F2", "F3", "F4", "F5"];

export function valueClassForScore(
  total: number,
  thresholds: ScoreThresholds = DEFAULT_DESIRABILITY_THRESHOLDS,
): ValueClass | null {
  if (!Number.isInteger(total)) return null;
  for (const valueClass of CLASS_ORDER) {
    const band = thresholds[valueClass];
    if (!band) continue;
    const [min, max] = band;
    if (total >= min && total <= max) return valueClass;
  }
  return null;
}

/** Compat helper. Out-of-range scores do not invent a class. */
export function scoreToClass(
  total: number,
  thresholds: ScoreThresholds = DEFAULT_DESIRABILITY_THRESHOLDS,
): ValueClass {
  return valueClassForScore(total, thresholds) ?? "F1";
}

export type DimensionAssessment = {
  dimension: DesirabilityDimension;
  max: number;
  submittedPoints: number | null;
  awardedPoints: number;
  counted: boolean;
  confidence: ConfidenceId;
  insufficientEvidence: boolean;
  guessed: boolean;
};

export type DesirabilityAssessment = {
  total: number | null;
  earnedPoints: number;
  incomplete: boolean;
  insufficientEvidence: boolean;
  proposedClass: ValueClass | null;
  possibleClasses: ValueClass[];
  scoreRange: { min: number; max: number };
  dimensionTotals: Record<DesirabilityDimension, number | null>;
  dimensions: DimensionAssessment[];
  confidence: ConfidenceId;
  requiresManualReview: boolean;
  warnings: string[];
};

function classesOverlapping(
  min: number,
  max: number,
  thresholds: ScoreThresholds,
): ValueClass[] {
  return CLASS_ORDER.filter((valueClass) => {
    const [bandMin, bandMax] = thresholds[valueClass];
    return max >= bandMin && min <= bandMax;
  });
}

function weakestConfidence(
  values: readonly ConfidenceId[],
  insufficient: boolean,
): ConfidenceId {
  if (insufficient || values.includes(Confidence.UNKNOWN)) return Confidence.UNKNOWN;
  if (values.includes(Confidence.PROVISIONAL)) return Confidence.PROVISIONAL;
  if (values.includes(Confidence.LIKELY)) return Confidence.LIKELY;
  return Confidence.CONFIRMED;
}

/**
 * Six-dimension rubric, 0–100.
 * A guess never contributes points. Insufficient evidence withholds that
 * dimension and opens a score range for manual review instead of treating
 * unknown as a confident zero.
 */
export function computeDesirability(
  scores: readonly DimensionScoreInput[],
  thresholds: ScoreThresholds = DEFAULT_DESIRABILITY_THRESHOLDS,
): DesirabilityAssessment {
  const warnings: string[] = [];
  const dimensionTotals = {} as Record<DesirabilityDimension, number | null>;
  const dimensions: DimensionAssessment[] = [];
  let earned = 0;
  let withheldMax = 0;
  let incomplete = false;

  const seen = new Set<DesirabilityDimension>();
  for (const row of scores) {
    if (seen.has(row.dimension)) {
      warnings.push(`Duplicate score ignored for ${row.dimension}`);
    }
    seen.add(row.dimension);
  }

  for (const dimension of Object.keys(DIMENSION_MAX) as DesirabilityDimension[]) {
    const max = DIMENSION_MAX[dimension];
    const row = scores.find((score) => score.dimension === dimension);
    const guessed = row?.guessed === true;
    const confidence = row?.confidence ?? Confidence.UNKNOWN;
    const missing = !row || row.points === null;
    const withhold =
      missing ||
      row.insufficientEvidence ||
      guessed ||
      confidence === Confidence.UNKNOWN;

    let awarded = 0;
    if (!withhold && row && row.points !== null) {
      const clamped = Math.max(0, Math.min(max, Math.round(row.points)));
      if (!Number.isInteger(row.points) || row.points !== clamped) {
        warnings.push(`${dimension} clamped to an integer from 0 to ${max}`);
      }
      awarded = clamped;
    }

    if (guessed && row && (row.points ?? 0) > 0) {
      warnings.push(`No points awarded for guessed ${dimension}`);
    }
    if (withhold) {
      incomplete = true;
      withheldMax += max;
      dimensionTotals[dimension] = null;
      if (!guessed) warnings.push(`Insufficient evidence for ${dimension}`);
      if (confidence === Confidence.UNKNOWN && row && !guessed) {
        warnings.push(`Unknown confidence — no points awarded for ${dimension}`);
      }
    } else {
      dimensionTotals[dimension] = awarded;
      earned += awarded;
    }

    dimensions.push({
      dimension,
      max,
      submittedPoints: row?.points ?? null,
      awardedPoints: awarded,
      counted: !withhold,
      confidence,
      insufficientEvidence: withhold,
      guessed,
    });
  }

  const scoreRange = { min: earned, max: earned + withheldMax };
  const proposedClass = incomplete
    ? null
    : valueClassForScore(earned, thresholds);
  if (!incomplete && proposedClass == null) {
    warnings.push("Score does not fall in a configured value-class band");
    incomplete = true;
  }

  return {
    total: incomplete ? null : earned,
    earnedPoints: earned,
    incomplete,
    insufficientEvidence: incomplete,
    proposedClass: incomplete ? null : proposedClass,
    possibleClasses: classesOverlapping(
      scoreRange.min,
      scoreRange.max,
      thresholds,
    ),
    scoreRange,
    dimensionTotals,
    dimensions,
    confidence: weakestConfidence(
      dimensions.map((dimension) => dimension.confidence),
      incomplete,
    ),
    requiresManualReview: incomplete,
    warnings,
  };
}

export type ClassAssignment = {
  valueClass: ValueClass;
  reviewerId: string;
  rationale: string;
  assignedAt: string;
};

export type ClassAssignmentResult = {
  approvedClass: ValueClass;
  calculatedClass: ValueClass | null;
  calculatedTotal: number | null;
  reviewerId: string;
  rationale: string;
  assignedAt: string;
  /** The rubric score is unchanged by a reviewer override. */
  scoreUnchanged: true;
};

export function assignValueClass(
  assessment: Pick<DesirabilityAssessment, "total" | "proposedClass">,
  assignment: ClassAssignment,
): { ok: true; value: ClassAssignmentResult } | { ok: false; error: string } {
  if (!assignment.reviewerId.trim()) {
    return { ok: false, error: "A reviewer identity is required" };
  }
  if (!assignment.rationale.trim()) {
    return { ok: false, error: "A written reason is required to assign a value class" };
  }
  if (!assignment.assignedAt.trim()) {
    return { ok: false, error: "An assignment timestamp is required" };
  }
  return {
    ok: true,
    value: {
      approvedClass: assignment.valueClass,
      calculatedClass: assessment.proposedClass,
      calculatedTotal: assessment.total,
      reviewerId: assignment.reviewerId.trim(),
      rationale: assignment.rationale.trim(),
      assignedAt: assignment.assignedAt,
      scoreUnchanged: true,
    },
  };
}
