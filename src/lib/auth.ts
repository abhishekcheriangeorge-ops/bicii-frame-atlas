import type { NextRequest } from "next/server";
import { getIdentity } from "../../cursor/identity";

export type StaffRole = "admin" | "reviewer" | "mechanic" | "viewer";

/** Map Cursor identity to workshop role. Local/dev defaults to admin. */
export async function getStaffContext(request: Request | NextRequest) {
  const identity = await getIdentity(request);
  if (!identity.verified) {
    return { verified: false as const, reason: identity.reason };
  }

  const email = identity.email.toLowerCase();
  let role: StaffRole = "mechanic";
  if (identity.appVisibility === "team" && identity.teamRole === "admin") {
    role = "admin";
  } else if (email.includes("reviewer")) {
    role = "reviewer";
  } else if (email.includes("viewer")) {
    role = "viewer";
  } else if (identity.simulated) {
    role = "admin";
  }

  return {
    verified: true as const,
    sub: identity.sub,
    email: identity.email,
    name: identity.name || identity.email || "Staff",
    role,
    simulated: identity.simulated === true,
  };
}

export function canApproveSafety(role: StaffRole) {
  return role === "admin" || role === "reviewer";
}

export function canApprovePrice(role: StaffRole) {
  return role === "admin" || role === "reviewer";
}

export function canSeeAcquisitionCost(role: StaffRole) {
  return role === "admin" || role === "reviewer";
}

export function canSeeSellerPii(role: StaffRole) {
  return role === "admin" || role === "reviewer";
}
