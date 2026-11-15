import type { Metadata } from "next";
import { listFrames } from "@/lib/frames";
import { PageHeading } from "@/components/page-heading";
import { FrameLink } from "@/components/frame-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FieldHint, Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { LIFECYCLE_LABEL, lifecycleLabel } from "@/components/status-badge";

export const metadata: Metadata = { title: "Inventory" };

export const dynamic = "force-dynamic";

export default async function FramesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const frames = await listFrames({ q: sp.q, status: sp.status });
  const filtered = Boolean(sp.q || sp.status);

  return (
    <div className="space-y-6">
      <PageHeading
        kicker="Floor"
        title="Frame inventory"
        lede="Search by frame code, maker, or model. Lifecycle is the filter. Inspection, preservation class, and value class stay visible on each row and are not one grade."
      />

      <Card>
        <CardContent>
          <form action="/frames" className="grid gap-4">
            <div>
              <Label htmlFor="q">Search</Label>
              <Input
                id="q"
                name="q"
                defaultValue={sp.q ?? ""}
                placeholder="BICII-F code, maker, model"
                autoComplete="off"
              />
              <FieldHint>Serial search stays role-restricted in a later pass.</FieldHint>
            </div>
            <div>
              <Label htmlFor="status">Lifecycle status</Label>
              <Select id="status" name="status" defaultValue={sp.status ?? ""}>
                <option value="">All lifecycle statuses</option>
                {Object.entries(LIFECYCLE_LABEL).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="submit">Apply filter</Button>
              <Button href="/frames" variant="secondary">
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {frames.length} {frames.length === 1 ? "frame" : "frames"}
          {filtered ? " in this filter" : " on record"}
        </p>
        <Button href="/frames/new">New intake</Button>
      </div>

      {frames.length === 0 ? (
        <p className="max-w-prose border border-dashed border-steel-line bg-paper-raised px-4 py-5 text-base leading-relaxed text-ink">
          {filtered
            ? `No frames match ${filterSummary(sp.q, sp.status)}. The filter did not hide a frame that failed to load.`
            : "No frames on the floor yet. Intake opens a draft. The visual/mechanical inspection, the preservation class, and the value class are recorded later, each on its own line."}
        </p>
      ) : (
        <ul className="space-y-3">
          {frames.map((frame) => (
            <li key={frame.id}>
              <FrameLink frame={frame} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function filterSummary(q?: string, status?: string) {
  const parts = [
    q ? `“${q}”` : null,
    status ? lifecycleLabel(status) : null,
  ].filter(Boolean);
  return parts.join(" · ");
}
