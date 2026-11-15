import Link from "next/link";
import {
  InspectionBadge,
  LifecycleBadge,
  PreservationBadge,
  ValueClassBadge,
} from "@/components/status-badge";
import type { FrameRow } from "@/lib/frames";

export function FrameLink({ frame }: { frame: FrameRow }) {
  const name = [frame.brand_text, frame.model_text].filter(Boolean).join(" ");
  return (
    <Link
      href={`/frames/${frame.frame_code}`}
      className="block border border-steel-line bg-paper-raised px-4 py-4 hover:border-brass-deep"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs tracking-wide text-brass-deep">
            {frame.frame_code}
            {frame.sample_tag ? " · SAMPLE" : ""}
          </p>
          <p className="font-display text-xl leading-tight text-ink">
            {name || "Unidentified frame"}
          </p>
          <p className="mt-1 text-sm text-muted">
            {frame.material}
            {frame.frame_size_label ? ` · ${frame.frame_size_label}` : ""}
            {frame.fork_included ? " · fork included" : " · frame only"}
          </p>
        </div>
        <div className="flex max-w-full flex-wrap gap-2">
          <InspectionBadge status={frame.inspection_status} />
          <PreservationBadge pClass={frame.preservation_class} />
          <ValueClassBadge valueClass={frame.value_class} />
          <LifecycleBadge status={frame.current_status} />
        </div>
      </div>
    </Link>
  );
}
