import Link from "next/link";
import { notFound } from "next/navigation";
import {
  InspectionBadge,
  LifecycleBadge,
  PreservationBadge,
  ValueClassBadge,
} from "@/components/status-badge";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { getFrameByCode, preparedCostCents } from "@/lib/frames";
import { sql } from "@/lib/db";
import { formatSgd } from "@/lib/utils";
import {
  computeCostFloor,
  classBandConflict,
  suggestPriceInBand,
} from "@/lib/domain/pricing";
import { VALUE_CLASS_BANDS_SGD, type ValueClass } from "@/lib/domain/types";
import {
  compsToMarketRangeCents,
  matchMarketComps,
} from "@/data/sg-market-comps";
import { PriceActions } from "./price-actions";
import { InspectionPanel } from "./inspection-panel";

export const dynamic = "force-dynamic";

export default async function FrameDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const frame = await getFrameByCode(code);
  if (!frame) notFound();

  const cost = await preparedCostCents(frame.id);
  let floor = 0;
  let floorError: string | null = null;
  try {
    floor = computeCostFloor({ preparedCostCents: cost, targetGrossMargin: 0.4 });
  } catch (e) {
    floorError = e instanceof Error ? e.message : "Floor error";
  }

  const conflict =
    frame.value_class && floor
      ? classBandConflict({
          costFloorCents: floor,
          valueClass: frame.value_class as ValueClass,
        })
      : { conflict: false };

  const inspections = await sql<{
    id: string;
    outcome: string;
    performed_at: string;
    inspector_name: string;
    notes: string | null;
    critical_flags: unknown;
  }>(
    `select id, outcome, performed_at, inspector_name, notes, critical_flags
     from inspections where frame_id = $1 order by version desc`,
    [frame.id],
  );

  const costs = await sql<{ category: string; amount_cents: number; source: string | null }>(
    `select category, amount_cents, source from cost_items where frame_id = $1 order by created_at`,
    [frame.id],
  );

  const band = frame.value_class
    ? VALUE_CLASS_BANDS_SGD[frame.value_class as ValueClass]
    : null;

  const refComps = matchMarketComps({
    brand: frame.brand_text,
    model: frame.model_text,
    material: frame.material,
    limit: 4,
  });
  const marketRange = compsToMarketRangeCents(refComps);
  const suggested =
    frame.value_class && floor && !floorError
      ? suggestPriceInBand({
          costFloorCents: floor,
          valueClass: frame.value_class as ValueClass,
          marketMinCents: marketRange?.minCents,
          marketMaxCents: marketRange?.maxCents,
        })
      : null;

  const dbComps = await sql<{
    maker_model: string;
    amount_cents: number;
    listing_or_sold: string;
    platform: string | null;
    notes: string | null;
  }>(
    `select maker_model, amount_cents, listing_or_sold, platform, notes
     from market_comps where frame_id = $1 order by observed_date desc nulls last`,
    [frame.id],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/frames"
            className="inline-flex min-h-12 items-center text-sm font-medium text-brass-deep underline"
          >
            Inventory
          </Link>
          <div className="mt-2 font-mono text-xs tracking-wide text-brass-deep">
            {frame.frame_code}
            {frame.sample_tag ? " · SAMPLE / FICTIONAL" : ""}
          </div>
          <h1 className="font-display text-3xl">
            {[frame.brand_text, frame.model_text].filter(Boolean).join(" ") ||
              "Unidentified frame"}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {frame.material}
            {frame.frame_size_label ? ` · ${frame.frame_size_label}` : ""}
            {frame.fork_included ? " · fork included" : " · frame only"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <InspectionBadge status={frame.inspection_status} />
          <PreservationBadge pClass={frame.preservation_class} />
          <ValueClassBadge valueClass={frame.value_class} />
          <LifecycleBadge status={frame.current_status} />
        </div>
      </div>

      {frame.inspection_status === "HOLD" || frame.current_status === "hold" ? (
        <Banner tone="hold" title="Safety HOLD">
          This frame stays off build-ready and listing until the concern is
          resolved and a later visual/mechanical inspection is recorded. Value
          class does not clear a HOLD.
        </Banner>
      ) : null}
      {frame.inspection_status === "REJECT" || frame.current_status === "rejected" ? (
        <Banner tone="hold" title="Rejected">
          This frame is not available for a complete bike build. A value class
          change does not reverse a reject.
        </Banner>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-[var(--steel)]/35 bg-[var(--paper)]/90 p-4">
          <h3 className="font-display text-xl">Identity</h3>
          <dl className="mt-3 space-y-2 text-sm">
            <Row k="Year range" v={yearLabel(frame)} />
            <Row k="Year confidence" v={frame.year_confidence} />
            <Row k="Cosmetic condition" v={frame.cosmetic_condition} />
            <Row
              k="Listing eligible"
              v={frame.listing_eligible ? "yes" : "no"}
            />
            <Row
              k="Available for build"
              v={frame.available_for_build ? "yes" : "no"}
            />
          </dl>
          {frame.public_story ? (
            <p className="mt-4 border-t border-[var(--steel)]/25 pt-3 text-sm leading-relaxed">
              {frame.public_story}
            </p>
          ) : null}
        </div>

        <div className="rounded-lg border border-[var(--steel)]/35 bg-[var(--paper)]/90 p-4">
          <h3 className="font-display text-xl">Cost & price worksheet</h3>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Margin basis: gross margin on retail before sales fees (default 40%).
            GST display is configurable in settings.
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {costs.map((c, i) => (
              <li key={i} className="flex justify-between gap-3">
                <span>
                  {c.category}
                  {c.source ? ` · ${c.source}` : ""}
                </span>
                <span>{formatSgd(c.amount_cents)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1 border-t border-[var(--steel)]/25 pt-3 text-sm">
            <div className="flex justify-between font-medium">
              <span>Prepared cost</span>
              <span>{formatSgd(cost)}</span>
            </div>
            <div className="flex justify-between">
              <span>Cost floor (40% margin)</span>
              <span>{floorError ? floorError : formatSgd(floor)}</span>
            </div>
            {band ? (
              <div className="flex justify-between">
                <span>Value class band ({frame.value_class})</span>
                <span>
                  S${band.min}
                  {band.max ? `–${band.max}` : "+"}
                </span>
              </div>
            ) : null}
            {marketRange ? (
              <div className="flex justify-between">
                <span>SG ref comps band</span>
                <span>
                  {formatSgd(marketRange.minCents)}–
                  {formatSgd(marketRange.maxCents)}
                </span>
              </div>
            ) : null}
            {suggested ? (
              <div className="flex justify-between">
                <span>Suggested (floor ∩ class ∩ comps)</span>
                <span>{formatSgd(suggested.suggestedCents)}</span>
              </div>
            ) : null}
            {frame.current_approved_price_cents != null ? (
              <div className="flex justify-between font-semibold text-[var(--pass-ink)]">
                <span>Approved retail</span>
                <span>{formatSgd(frame.current_approved_price_cents)}</span>
              </div>
            ) : null}
          </div>
          {suggested ? (
            <p className="mt-2 text-xs text-[var(--muted)]">
              {suggested.rationale}. Reference comps are SAMPLE research bands —
              attach sold comps before treating as evidence.
            </p>
          ) : null}
          {conflict.conflict && "message" in conflict && conflict.message ? (
            <p className="mt-3 rounded-md border border-[var(--hold)] bg-[var(--hold)]/10 px-3 py-2 text-sm text-[var(--hold)]">
              {conflict.message}
            </p>
          ) : null}
          <PriceActions
            frameCode={frame.frame_code}
            inspectionStatus={frame.inspection_status}
            currentStatus={frame.current_status}
            costFloorCents={floor}
            valueClass={frame.value_class}
          />
        </div>
      </section>

      {(refComps.length > 0 || dbComps.length > 0) && (
        <section className="rounded-lg border border-[var(--steel)]/35 bg-[var(--paper)]/90 p-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h3 className="font-display text-xl">Market evidence</h3>
            <Link
              href="/market"
              className="text-sm text-[var(--brass-deep)] underline-offset-2 hover:underline"
            >
              Browse SG comps →
            </Link>
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Value class is market positioning, not safety. Prefer sold comps
            over asks.
          </p>
          {dbComps.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm">
              {dbComps.map((c, i) => (
                <li
                  key={i}
                  className="flex flex-wrap justify-between gap-2 border-b border-[var(--steel)]/20 pb-2"
                >
                  <span>
                    {c.maker_model}
                    <span className="text-[var(--muted)]">
                      {" "}
                      · {c.listing_or_sold}
                      {c.platform ? ` · ${c.platform}` : ""}
                    </span>
                  </span>
                  <span className="font-medium">{formatSgd(c.amount_cents)}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {refComps.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm">
              {refComps.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap justify-between gap-2 border-b border-[var(--steel)]/20 pb-2 last:border-0"
                >
                  <span>
                    {c.brand} {c.model} ({c.year})
                    <span className="text-[var(--muted)]">
                      {" "}
                      · SAMPLE ref · {c.liquidity}
                    </span>
                  </span>
                  <span className="font-medium">
                    S${c.estimatedMarketSgdLow.toLocaleString()}–
                    {c.estimatedMarketSgdHigh.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      )}

      <InspectionPanel
        frameCode={frame.frame_code}
        forkIncluded={frame.fork_included}
        inspectionStatus={frame.inspection_status}
      />

      <section className="rounded-lg border border-[var(--steel)]/35 bg-[var(--paper)]/90 p-4">
        <h3 className="font-display text-xl">Inspection history</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          Method on record: visual/mechanical. A pass is that checklist on the
          date below. Hidden defects can remain.
        </p>
        <div className="mt-3 space-y-3">
          {inspections.map((ins) => (
            <div
              key={ins.id}
              className="rounded-md border border-[var(--steel)]/25 p-3 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <InspectionBadge status={ins.outcome} />
                <span>
                  {ins.inspector_name} ·{" "}
                  {new Date(ins.performed_at).toLocaleString("en-SG", {
                    timeZone: "Asia/Singapore",
                  })}{" "}
                  SGT
                </span>
              </div>
              {ins.notes ? <p className="mt-2">{ins.notes}</p> : null}
            </div>
          ))}
          {inspections.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No inspections yet.</p>
          ) : null}
        </div>
      </section>

      <div className="flex flex-wrap gap-2">
        <Link href={`/api/frames/${frame.frame_code}/export`}>
          <Button variant="secondary">Export public-safe JSON</Button>
        </Link>
        <Link href={`/frames/${frame.frame_code}/dossier`}>
          <Button variant="secondary">Listing dossier</Button>
        </Link>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-[var(--muted)]">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}

function yearLabel(frame: {
  estimated_year_from: number | null;
  estimated_year_to: number | null;
  year_confidence: string;
}) {
  if (!frame.estimated_year_from) return `unknown (${frame.year_confidence})`;
  if (
    frame.estimated_year_to &&
    frame.estimated_year_to !== frame.estimated_year_from
  ) {
    return `${frame.estimated_year_from}–${frame.estimated_year_to} (${frame.year_confidence})`;
  }
  return `${frame.estimated_year_from} (${frame.year_confidence})`;
}
