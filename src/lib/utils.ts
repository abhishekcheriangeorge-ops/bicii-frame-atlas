import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { roundToStepCents } from "./domain/pricing";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format integer SGD cents as display currency. */
export function formatSgd(cents: number, opts?: { whole?: boolean }): string {
  const dollars = cents / 100;
  if (opts?.whole) {
    return `S$${Math.round(dollars).toLocaleString("en-SG")}`;
  }
  return `S$${dollars.toLocaleString("en-SG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function roundPriceCents(
  cents: number,
  step: 1000 | 5000 = 1000,
): number {
  return roundToStepCents(cents, step);
}
