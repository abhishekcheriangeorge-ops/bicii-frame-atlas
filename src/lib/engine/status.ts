import type { LifecycleStatus } from "../domain/types";
import { availableForBuild, type BuildAvailabilityInput } from "./inspection";

/**
 * Server-side lifecycle map. UI controls may only offer these edges.
 * Entering approved / listed / reserved / allocated_to_build also requires
 * the build-availability gate in `assertTransition`.
 */
export const LIFECYCLE_TRANSITIONS: Record<
  LifecycleStatus,
  readonly LifecycleStatus[]
> = {
  intake_draft: ["identified", "archived"],
  identified: ["inspection_pending", "archived"],
  inspection_pending: ["hold", "rejected", "inspection_passed"],
  hold: ["inspection_pending", "rejected", "archived"],
  rejected: ["archived", "inspection_pending"],
  inspection_passed: ["preparation_planned", "hold"],
  preparation_planned: ["preparation_in_progress", "hold"],
  preparation_in_progress: [
    "ready_for_pricing",
    "hold",
    "preparation_planned",
  ],
  ready_for_pricing: ["pricing_review", "hold"],
  pricing_review: ["approved", "ready_for_pricing", "preparation_planned", "hold"],
  approved: ["listed", "reserved", "allocated_to_build", "archived", "hold"],
  listed: ["reserved", "sold", "allocated_to_build", "approved", "hold"],
  reserved: ["listed", "sold", "allocated_to_build", "approved", "hold"],
  allocated_to_build: ["sold", "archived", "hold"],
  sold: ["archived"],
  archived: [],
};

const RELEASE_STATUSES: ReadonlySet<LifecycleStatus> = new Set([
  "approved",
  "listed",
  "reserved",
  "allocated_to_build",
]);

const REINSPECTION_SOURCES: ReadonlySet<LifecycleStatus> = new Set([
  "inspection_passed",
  "preparation_planned",
  "preparation_in_progress",
  "ready_for_pricing",
  "pricing_review",
  "approved",
  "listed",
  "reserved",
  "allocated_to_build",
]);

export type TransitionGate = BuildAvailabilityInput & {
  approvalBlocked: boolean;
  priceApproverId?: string | null;
  preparerId?: string | null;
  adminOverride?: { adminId: string; reason: string } | null;
};

export function canTransition(
  from: LifecycleStatus,
  to: LifecycleStatus,
): boolean {
  return LIFECYCLE_TRANSITIONS[from].includes(to);
}

export function nextStatuses(from: LifecycleStatus): readonly LifecycleStatus[] {
  return LIFECYCLE_TRANSITIONS[from];
}

export function evaluateTransition(
  from: LifecycleStatus,
  to: LifecycleStatus,
  gate?: TransitionGate,
): { ok: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!canTransition(from, to)) {
    errors.push(`Invalid lifecycle transition: ${from} → ${to}`);
  }
  if (RELEASE_STATUSES.has(to)) {
    if (!gate) {
      errors.push(`Safety gate is required to enter ${to}`);
    } else if (
      gate.approvalBlocked ||
      gate.reinspectionRequired === true ||
      !availableForBuild(gate)
    ) {
      errors.push(
        "Cannot approve, list, reserve, or allocate a frame that is not available for build",
      );
    }
  }
  if (to === "approved" && gate) {
    if (!gate.priceApproverId?.trim()) {
      errors.push("A price approver is required");
    }
    if (
      gate.preparerId &&
      gate.priceApproverId &&
      gate.preparerId === gate.priceApproverId &&
      (!gate.adminOverride?.adminId.trim() || !gate.adminOverride.reason.trim())
    ) {
      errors.push(
        "The preparer cannot approve their own price unless an admin override is logged",
      );
    }
  }
  return { ok: errors.length === 0, errors };
}

export function assertTransition(
  from: LifecycleStatus,
  to: LifecycleStatus,
  gate?: TransitionGate,
): void {
  const result = evaluateTransition(from, to, gate);
  if (!result.ok) {
    throw new Error(result.errors.join("; "));
  }
}

/** A new structural finding pulls the frame back to hold and clears listing. */
export function invalidateApprovalOnHold(status: LifecycleStatus): {
  nextStatus: LifecycleStatus;
  clearListing: boolean;
} {
  if (REINSPECTION_SOURCES.has(status)) {
    return { nextStatus: "hold", clearListing: true };
  }
  if (status === "sold" || status === "archived" || status === "rejected") {
    return { nextStatus: status, clearListing: true };
  }
  return { nextStatus: status, clearListing: true };
}

export function listingEligible(
  status: LifecycleStatus,
  gate: TransitionGate,
): boolean {
  if (status !== "listed" && status !== "approved") return false;
  if (gate.approvalBlocked || gate.reinspectionRequired === true) return false;
  if (!gate.priceApproverId?.trim()) return false;
  if (
    gate.preparerId &&
    gate.preparerId === gate.priceApproverId &&
    (!gate.adminOverride?.adminId.trim() || !gate.adminOverride.reason.trim())
  ) {
    return false;
  }
  return availableForBuild(gate);
}
