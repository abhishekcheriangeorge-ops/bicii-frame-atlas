"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CHECKLIST } from "@/lib/domain/checklist";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

type Result = "pass" | "concern" | "not_applicable" | "not_inspected";

export function InspectionPanel({
  frameCode,
  forkIncluded,
  inspectionStatus,
}: {
  frameCode: string;
  forkIncluded: boolean;
  inspectionStatus: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const initial = useMemo(() => {
    const m: Record<string, Result> = {};
    for (const c of CHECKLIST) {
      if (c.checkId === "st_fork" && !forkIncluded) m[c.checkId] = "not_applicable";
      else if (c.checkId === "st_carbon") m[c.checkId] = "not_applicable";
      else m[c.checkId] = "not_inspected";
    }
    return m;
  }, [forkIncluded]);
  const [results, setResults] = useState(initial);

  function submit(finalOutcome?: "REJECT") {
    setMessage(null);
    start(async () => {
      const res = await fetch(`/api/frames/${frameCode}/inspect`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          forkIncluded,
          forceReject: finalOutcome === "REJECT",
          items: Object.entries(results).map(([checkId, result]) => ({
            checkId,
            result,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Inspection failed");
        return;
      }
      setMessage(
        `Recorded ${data.outcome}. ${data.blockers?.length ? data.blockers.join(" · ") : "No blockers."}`,
      );
      router.refresh();
    });
  }

  return (
    <section className="rounded-lg border border-[var(--steel)]/35 bg-[var(--paper)]/90 p-4">
      <h3 className="font-display text-xl">Run visual / mechanical checklist</h3>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Current inspection status: <strong>{inspectionStatus}</strong>. A
        structural concern places the frame on HOLD. A mandatory item left
        not inspected blocks approval. The method is visual/mechanical.
      </p>
      <div className="mt-4 space-y-3">
        {CHECKLIST.map((item) => (
          <div
            key={item.checkId}
            className="space-y-2 border border-steel-line bg-paper p-3"
          >
            <div>
              <div className="text-sm font-medium">{item.label}</div>
              <div className="text-xs text-[var(--muted)]">
                {item.category}
                {item.structural ? " · structural" : ""}
                {item.mandatory ? " · mandatory" : ""}
              </div>
            </div>
            <Select
              aria-label={`Result for ${item.label}`}
              value={results[item.checkId]}
              onChange={(e) =>
                setResults((prev) => ({
                  ...prev,
                  [item.checkId]: e.target.value as Result,
                }))
              }
            >
              <option value="pass">Pass</option>
              <option value="concern">Concern</option>
              <option value="not_applicable">Not applicable</option>
              <option value="not_inspected">Not inspected</option>
            </Select>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" disabled={pending} onClick={() => submit()}>
          {pending ? "Saving…" : "Save inspection decision"}
        </Button>
        <Button
          type="button"
          variant="danger"
          disabled={pending}
          onClick={() => submit("REJECT")}
        >
          Reject frame
        </Button>
      </div>
      {message ? (
        <p className="mt-3 rounded-md bg-[var(--paper-2)] px-3 py-2 text-sm">
          {message}
        </p>
      ) : null}
    </section>
  );
}
