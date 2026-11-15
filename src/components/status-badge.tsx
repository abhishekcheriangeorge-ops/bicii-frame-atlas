import { cn } from "@/lib/utils";
import {
  PRESERVATION_GUIDE,
  VALUE_CLASS_BANDS_SGD,
  type LifecycleStatus,
  type PreservationClass,
  type ValueClass,
} from "@/lib/domain/types";

const INSPECTION = {
  DRAFT: {
    code: "DRAFT",
    sub: "Incomplete",
    className: "border-steel bg-transparent text-ink",
    label:
      "Inspection draft. Intake or the visual/mechanical checklist is incomplete.",
  },
  PASS_VISUAL: {
    code: "PASS",
    sub: "Visual",
    className: "border-pass bg-pass text-paper",
    label:
      "Inspection PASS. Passed BICII's documented visual/mechanical inspection. A dated observation. Hidden defects can remain.",
  },
  HOLD: {
    code: "HOLD",
    sub: "Blocked",
    className: "border-hold bg-hold text-paper",
    label:
      "Inspection HOLD. Unresolved safety concern, missing evidence, or specialist review. Build-ready and listing stay blocked.",
  },
  REJECT: {
    code: "REJECT",
    sub: "No build",
    className: "border-reject bg-reject text-paper",
    label:
      "Inspection REJECT. Unsafe or not suitable for a complete bike build. Value class does not reverse a reject.",
  },
} as const;

export const LIFECYCLE_LABEL: Record<LifecycleStatus, string> = {
  intake_draft: "Intake draft",
  identified: "Identified",
  inspection_pending: "Inspection pending",
  hold: "On hold",
  rejected: "Rejected",
  inspection_passed: "Inspection passed",
  preparation_planned: "Preparation planned",
  preparation_in_progress: "Preparation in progress",
  ready_for_pricing: "Ready for pricing",
  pricing_review: "Pricing review",
  approved: "Approved",
  listed: "Listed",
  reserved: "Reserved",
  allocated_to_build: "Allocated to build",
  sold: "Sold",
  archived: "Archived",
};

export function lifecycleLabel(status: string): string {
  if (status in LIFECYCLE_LABEL) {
    return LIFECYCLE_LABEL[status as LifecycleStatus];
  }
  return status.replaceAll("_", " ");
}

export function InspectionBadge({ status }: { status: string }) {
  const meta = INSPECTION[status as keyof typeof INSPECTION] ?? {
    code: status,
    sub: "Recorded",
    className: "border-steel bg-steel-wash text-ink",
    label: `Inspection status ${status}`,
  };
  return (
    <span
      aria-label={meta.label}
      className={cn(
        "inline-flex min-h-11 min-w-16 flex-col items-center justify-center border-2 px-2 py-1 text-center leading-none",
        meta.className,
      )}
    >
      <span className="font-mono text-sm font-semibold tracking-wide">
        {meta.code}
      </span>
      <span className="mt-1 text-[0.65rem] tracking-wide uppercase">
        {meta.sub}
      </span>
    </span>
  );
}

export function PreservationBadge({ pClass }: { pClass: string | null }) {
  if (!pClass || !(pClass in PRESERVATION_GUIDE)) {
    return (
      <span
        aria-label="Preservation class is not set. It plans the work and is separate from inspection and value class."
        className="inline-flex min-h-11 items-center border border-dashed border-steel bg-paper-raised px-2.5 text-sm text-muted"
      >
        Preservation class unset
      </span>
    );
  }
  const code = pClass as PreservationClass;
  const meta = PRESERVATION_GUIDE[code];
  return (
    <span
      aria-label={`Preservation class ${code}, ${meta.label}, planning range ${meta.hours}. This plans the work.`}
      className="inline-flex min-h-11 items-stretch border border-brass-deep/30 border-l-4 border-l-brass-deep bg-brass-wash text-ink"
    >
      <span className="flex items-center px-2 font-mono text-[0.65rem] tracking-wider text-brass-deep uppercase">
        Preservation
      </span>
      <span className="flex items-center border-l border-brass-deep/20 px-2 text-sm font-medium">
        {code} · {meta.label}
      </span>
    </span>
  );
}

export function ValueClassBadge({ valueClass }: { valueClass: string | null }) {
  if (!valueClass || !(valueClass in VALUE_CLASS_BANDS_SGD)) {
    return (
      <span
        aria-label="Value class is not set. Value class is the market-position guide."
        className="inline-flex min-h-11 items-center border border-dashed border-steel bg-paper px-2.5 text-sm text-muted"
      >
        Value class unset
      </span>
    );
  }
  const code = valueClass as ValueClass;
  const meta = VALUE_CLASS_BANDS_SGD[code];
  const range =
    meta.max == null
      ? `S$${meta.min.toLocaleString("en-SG")}+`
      : `S$${meta.min}–${meta.max}`;
  return (
    <span
      aria-label={`Value class ${code}, ${meta.label}, guide ${range}. Historical and commercial position.`}
      className="inline-flex min-h-11 items-stretch border border-dashed border-steel bg-paper-raised text-ink"
    >
      <span className="flex items-center px-2 font-mono text-[0.65rem] tracking-wider text-steel uppercase">
        Value class
      </span>
      <span className="flex items-center px-2 text-sm font-medium">
        {code} · {meta.label}
      </span>
    </span>
  );
}

export function LifecycleBadge({ status }: { status: string }) {
  const label = lifecycleLabel(status);
  return (
    <span
      aria-label={`Lifecycle status: ${label}`}
      className="inline-flex min-h-9 items-baseline gap-1.5 bg-steel-wash px-2.5 py-1 text-sm"
    >
      <span className="font-mono text-[0.65rem] tracking-wider text-steel uppercase">
        Lifecycle
      </span>
      <span className="font-medium text-ink">{label}</span>
    </span>
  );
}

type StatusBadgeProps =
  | { kind: "inspection"; status: string }
  | { kind: "preservation"; code: string | null }
  | { kind: "value"; code: string | null }
  | { kind: "lifecycle"; status: string };

export function StatusBadge(props: StatusBadgeProps) {
  if (props.kind === "inspection") {
    return <InspectionBadge status={props.status} />;
  }
  if (props.kind === "preservation") {
    return <PreservationBadge pClass={props.code} />;
  }
  if (props.kind === "value") {
    return <ValueClassBadge valueClass={props.code} />;
  }
  return <LifecycleBadge status={props.status} />;
}
