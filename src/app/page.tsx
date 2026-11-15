import { dashboardCounts, listFrames } from "@/lib/frames";
import { PageHeading } from "@/components/page-heading";
import { FrameLink } from "@/components/frame-link";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import {
  InspectionBadge,
  LifecycleBadge,
  PreservationBadge,
  ValueClassBadge,
} from "@/components/status-badge";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const counts = await dashboardCounts();
  const recent = await listFrames();
  const by = counts.byStatus;

  const tally = [
    { label: "Frames on record", value: counts.total, tone: "default" as const },
    {
      label: "Intake drafts",
      value: by.intake_draft ?? 0,
      tone: "default" as const,
    },
    {
      label: "Waiting on visual/mechanical inspection",
      value: (by.inspection_pending ?? 0) + (by.identified ?? 0),
      tone: "default" as const,
    },
    { label: "Safety HOLD", value: counts.hold, tone: "hold" as const },
    { label: "Rejected", value: by.rejected ?? 0, tone: "default" as const },
    {
      label: "Preparation planned or in progress",
      value: (by.preparation_planned ?? 0) + (by.preparation_in_progress ?? 0),
      tone: "default" as const,
    },
    {
      label: "Pricing review",
      value: (by.ready_for_pricing ?? 0) + (by.pricing_review ?? 0),
      tone: "default" as const,
    },
    { label: "Approved", value: by.approved ?? 0, tone: "default" as const },
  ];

  return (
    <div className="space-y-8">
      <PageHeading
        kicker="Workshop bench"
        title="Today on the bench"
        lede="Structural readiness, preservation effort, and value class are three records. A frame can sit in a high value class and still be blocked from the build bench."
      />

      <Banner tone="brass" title="Three separate axes">
        Inspection outcome, preservation class, and value class stay on their
        own lines. The inspection method on record is visual/mechanical. A pass
        is BICII&apos;s documented checklist on a date. Hidden defects can remain,
        and reinspection follows new damage or long storage.
      </Banner>

      {counts.hold > 0 ? (
        <Banner tone="hold" title={`${counts.hold} on safety HOLD`}>
          HOLD blocks build-ready and listing. Changing the value class does not
          clear a structural concern. Open the HOLD queue to work the record.
        </Banner>
      ) : null}

      <section aria-labelledby="tally-title">
        <h2 id="tally-title" className="font-display text-2xl text-ink">
          Bench tally
        </h2>
        <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted">
          Counts from the local frame record. Rows tagged SAMPLE are fictional
          workshop examples for the atlas, not a shop inspection and not a
          certification.
        </p>
        <ul className="mt-3 border-y border-steel-line">
          {tally.map((row) => (
            <li
              key={row.label}
              className="flex items-baseline justify-between gap-4 border-b border-steel-line py-3 last:border-b-0"
            >
              <span
                className={row.tone === "hold" ? "font-medium text-hold" : "text-ink"}
              >
                {row.label}
              </span>
              <span
                className={cn(
                  "font-mono text-2xl tabular-nums",
                  row.tone === "hold" ? "text-hold" : "text-ink",
                )}
              >
                {row.value}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="marks-title">
        <h2 id="marks-title" className="font-display text-2xl text-ink">
          How to read a record
        </h2>
        <p className="mt-1 text-sm text-muted">
          Mark key only. These badges are not attached to a frame.
        </p>
        <ul className="mt-4 space-y-4">
          <li className="flex flex-wrap items-center gap-3">
            <InspectionBadge status="PASS_VISUAL" />
            <p className="max-w-prose text-sm leading-relaxed text-ink">
              Visual/mechanical checklist finished with no unresolved concern.
            </p>
          </li>
          <li className="flex flex-wrap items-center gap-3">
            <InspectionBadge status="HOLD" />
            <p className="max-w-prose text-sm leading-relaxed text-ink">
              Suspected structural problem, missing evidence, or specialist
              review. The frame stays off build-ready and listing.
            </p>
          </li>
          <li className="flex flex-wrap items-center gap-3">
            <InspectionBadge status="REJECT" />
            <p className="max-w-prose text-sm leading-relaxed text-ink">
              Unsafe or not suitable. Archive for parts or display where that
              applies.
            </p>
          </li>
          <li className="flex flex-wrap items-center gap-3">
            <PreservationBadge pClass="P2" />
            <p className="max-w-prose text-sm leading-relaxed text-ink">
              Preservation class plans hours and tasks. A collectible frame can
              be P1 Light. A common frame can be P3 Extensive.
            </p>
          </li>
          <li className="flex flex-wrap items-center gap-3">
            <ValueClassBadge valueClass="F3" />
            <p className="max-w-prose text-sm leading-relaxed text-ink">
              Value class is the market-position guide: Found Gems through
              Collector. It is the historical and commercial record.
            </p>
          </li>
          <li className="flex flex-wrap items-center gap-3">
            <LifecycleBadge status="pricing_review" />
            <p className="max-w-prose text-sm leading-relaxed text-ink">
              Lifecycle is where the frame sits in the workshop flow.
            </p>
          </li>
        </ul>
      </section>

      <section className="space-y-3" aria-labelledby="recent-title">
        <div className="flex items-end justify-between gap-3">
          <h2 id="recent-title" className="font-display text-2xl text-ink">
            Recent frames
          </h2>
          <Button href="/frames" variant="ghost" className="px-2">
            Inventory
          </Button>
        </div>
        {recent.length === 0 ? (
          <p className="max-w-prose text-base leading-relaxed text-muted">
            No frames on the bench. Intake starts a draft. Inspection,
            preservation class, and value class are filled on later steps, each
            on its own line.
          </p>
        ) : (
          <ul className="space-y-3">
            {recent.slice(0, 6).map((frame) => (
              <li key={frame.id}>
                <FrameLink frame={frame} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button href="/frames/new">Start intake</Button>
        <Button href="/review" variant="secondary">
          Open review queue
        </Button>
      </div>
    </div>
  );
}
