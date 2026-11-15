import { notFound } from "next/navigation";
import { getFrameByCode } from "@/lib/frames";
import { VALUE_CLASS_BANDS_SGD, type ValueClass } from "@/lib/domain/types";
import { formatSgd } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DossierPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const frame = await getFrameByCode(code);
  if (!frame) notFound();

  const band = frame.value_class
    ? VALUE_CLASS_BANDS_SGD[frame.value_class as ValueClass]
    : null;

  return (
    <article className="mx-auto max-w-2xl space-y-6 rounded-lg border border-[var(--steel)]/35 bg-[var(--paper)] p-6 print:border-0">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--brass-deep)]">
          BICII Frame Atlas · public-safe dossier
        </p>
        <h1 className="font-display mt-2 text-3xl">
          {[frame.brand_text, frame.model_text].filter(Boolean).join(" ")}
        </h1>
        <p className="text-sm text-[var(--muted)]">{frame.frame_code}</p>
        {frame.sample_tag ? (
          <p className="mt-2 text-sm font-semibold text-[var(--hold)]">
            SAMPLE / FICTIONAL RECORD — not a real inspected frame.
          </p>
        ) : null}
      </header>

      <section className="space-y-2 text-sm leading-relaxed">
        <p>
          <strong>Material:</strong> {frame.material}
        </p>
        <p>
          <strong>Size:</strong> {frame.frame_size_label ?? "not recorded"}
        </p>
        <p>
          <strong>Fork:</strong>{" "}
          {frame.fork_included ? "included" : "frame only"}
        </p>
        <p>
          <strong>Inspection:</strong>{" "}
          {frame.inspection_status === "PASS_VISUAL"
            ? `Passed BICII’s documented visual/mechanical inspection (dated record on file). This is not an X-ray, ultrasound, or permanent guarantee.`
            : `Status ${frame.inspection_status} — not presented as build-ready.`}
        </p>
        <p>
          <strong>Preservation class:</strong>{" "}
          {frame.preservation_class ?? "not set"} (work effort, not a quality
          score)
        </p>
        <p>
          <strong>Value class:</strong>{" "}
          {frame.value_class
            ? `${frame.value_class}${band ? ` · ${band.label}` : ""}`
            : "not set"}{" "}
          — market positioning guide only.
        </p>
        <p>
          <strong>Approved retail:</strong>{" "}
          {frame.current_approved_price_cents != null
            ? formatSgd(frame.current_approved_price_cents, { whole: true })
            : "not approved"}
        </p>
      </section>

      {frame.public_story ? (
        <section>
          <h2 className="font-display text-xl">Story</h2>
          <p className="mt-2 text-sm leading-relaxed">{frame.public_story}</p>
        </section>
      ) : null}

      <footer className="border-t border-[var(--steel)]/30 pt-4 text-xs text-[var(--muted)]">
        Internal acquisition cost, seller identity and labour rates are omitted
        from this public-safe sheet. Across every future build package BICII
        installs new consumables; package eligibility depends on measured
        standards, not stickers alone.
      </footer>
    </article>
  );
}
