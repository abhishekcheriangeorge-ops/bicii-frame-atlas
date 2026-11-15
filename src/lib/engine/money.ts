import { BASIS_POINTS_SCALE, type BasisPoints, type Cents } from "../domain/types";

export class PricingValidationError extends Error {
  readonly code:
    | "NON_INTEGER_CENTS"
    | "NEGATIVE_AMOUNT"
    | "INFEASIBLE_RATE"
    | "NON_FINITE_RATE"
    | "RATE_OUT_OF_RANGE"
    | "NON_INTEGER_BASIS_POINTS"
    | "INVALID_STEP";

  constructor(code: PricingValidationError["code"], message: string) {
    super(message);
    this.name = "PricingValidationError";
    this.code = code;
  }
}

export function assertNonNegativeCents(value: number, label: string): Cents {
  if (!Number.isInteger(value)) {
    throw new PricingValidationError(
      "NON_INTEGER_CENTS",
      `${label} must be an integer number of cents`,
    );
  }
  if (value < 0) {
    throw new PricingValidationError(
      "NEGATIVE_AMOUNT",
      `${label} cannot be negative`,
    );
  }
  return value;
}

/** Half-up division for non-negative magnitudes. Denominator must be positive. */
export function divRoundHalfUp(numerator: bigint, denominator: bigint): number {
  if (denominator <= BigInt(0)) {
    throw new PricingValidationError(
      "INVALID_STEP",
      "Divisor must be a positive integer",
    );
  }
  const negative = numerator < BigInt(0);
  const magnitude = negative ? -numerator : numerator;
  const quotient = magnitude / denominator;
  const remainder = magnitude % denominator;
  const rounded = remainder * BigInt(2) >= denominator ? quotient + BigInt(1) : quotient;
  const signed = negative ? -rounded : rounded;
  if (signed > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new PricingValidationError(
      "NON_INTEGER_CENTS",
      "Amount exceeds the safe integer range for cents",
    );
  }
  return Number(signed);
}

/**
 * Convert a decimal rate such as 0.4 into basis points.
 * Rejects values that are not an exact 0.01% step so later math stays integral.
 */
export function rateToBasisPoints(rate: number): BasisPoints {
  if (!Number.isFinite(rate)) {
    throw new PricingValidationError(
      "NON_FINITE_RATE",
      "Rate must be a finite number",
    );
  }
  const scaled = rate * BASIS_POINTS_SCALE;
  const bps = Math.round(scaled);
  if (Math.abs(scaled - bps) > 1e-4) {
    throw new PricingValidationError(
      "NON_INTEGER_BASIS_POINTS",
      "Rate must be an exact multiple of 0.01%",
    );
  }
  if (!Number.isInteger(bps) || bps < 0 || bps > BASIS_POINTS_SCALE) {
    throw new PricingValidationError(
      "RATE_OUT_OF_RANGE",
      "Rate must be between 0 and 1 inclusive",
    );
  }
  return bps;
}

export function assertBasisPoints(value: number, label: string): BasisPoints {
  if (!Number.isInteger(value) || value < 0 || value > BASIS_POINTS_SCALE) {
    throw new PricingValidationError(
      "RATE_OUT_OF_RANGE",
      `${label} must be an integer basis-point rate from 0 to 10000`,
    );
  }
  return value;
}

export function assertFeasibleMargin(marginBps: number, feeBps: number): number {
  const margin = assertBasisPoints(marginBps, "target gross margin");
  const fee = assertBasisPoints(feeBps, "selling fee rate");
  if (margin + fee >= BASIS_POINTS_SCALE) {
    throw new PricingValidationError(
      "INFEASIBLE_RATE",
      "Invalid margin/fee: target_gross_margin + selling_fee_rate must be < 1",
    );
  }
  return BASIS_POINTS_SCALE - margin - fee;
}

/** Percent string from an integer ratio, up to 4 decimal places, trailing zeros removed. */
export function formatExactPercent(
  numerator: number,
  denominator: number,
): string {
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
    throw new PricingValidationError(
      "NON_INTEGER_CENTS",
      "Percent ratio must use integers",
    );
  }
  if (denominator === 0) return "—";
  const sign = numerator < 0 !== denominator < 0 ? "-" : "";
  const n = BigInt(Math.abs(numerator));
  const d = BigInt(Math.abs(denominator));
  const scaled = n * BigInt(100) * BigInt(10_000);
  const digits = divRoundHalfUp(scaled, d);
  const negativeResult = sign === "-";
  const absDigits = Math.abs(digits);
  const whole = Math.floor(absDigits / 10_000);
  const frac = String(absDigits % 10_000)
    .padStart(4, "0")
    .replace(/0+$/, "");
  const body = frac.length > 0 ? `${whole}.${frac}` : String(whole);
  return `${negativeResult ? "-" : ""}${body}%`;
}
