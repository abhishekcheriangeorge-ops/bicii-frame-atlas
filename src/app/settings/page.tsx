import type { Metadata } from "next";
import Link from "next/link";
import { sqlOne } from "@/lib/db";
import { formatSgd } from "@/lib/utils";
import {
  PRESERVATION_GUIDE,
  VALUE_CLASS_BANDS_SGD,
  type PreservationClass,
  type ValueClass,
} from "@/lib/domain/types";
import { PageHeading } from "@/components/page-heading";
import { Banner } from "@/components/ui/banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata: Metadata = { title: "Settings" };

export const dynamic = "force-dynamic";

const VALUE_ORDER: ValueClass[] = ["F1", "F2", "F3", "F4", "F5"];
const PREP_ORDER: PreservationClass[] = ["P1", "P2", "P3", "P4"];

export default async function SettingsPage() {
  const settings = await sqlOne<{
    labour_rate_cents: number;
    target_gross_margin: string | number;
    selling_fee_rate: string | number;
    allocated_overhead_cents: number;
    gst_registered: boolean;
    gst_inclusive_display: boolean;
  }>(`select * from app_settings where id = 'default'`);

  const labour = formatSgd(settings?.labour_rate_cents ?? 2500);
  const margin = `${Number(settings?.target_gross_margin ?? 0.4) * 100}%`;
  const fee = `${Number(settings?.selling_fee_rate ?? 0) * 100}%`;
  const overhead = formatSgd(settings?.allocated_overhead_cents ?? 2000);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeading
        kicker="Workshop"
        title="Settings"
        lede="Defaults for labour, margin, and tax display. A later change is a new settings version. It does not rewrite a price that a reviewer already approved."
      />

      <Banner tone="brass" title="Calibration still open">
        These figures are the atlas defaults, including the worked examples in
        the brief. Confirm shop labour rates, target margin, overhead, and
        whether BICII is GST-registered before treating a number as policy.
        Cross-check value class with the{" "}
        <Link href="/market" className="underline underline-offset-2">
          SG market comps
        </Link>{" "}
        and{" "}
        <Link href="/brands" className="underline underline-offset-2">
          brand landscape
        </Link>
        .
      </Banner>

      <Card>
        <CardHeader>
          <CardTitle>Labour, margin, overhead</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Readout id="labour" label="Internal labour rate (SGD / hour)" value={labour} />
          <Readout id="margin" label="Target gross margin" value={margin} />
          <Readout id="fee" label="Selling fee rate" value={fee} />
          <Readout id="overhead" label="Allocated overhead per frame" value={overhead} />
          <p className="text-sm leading-relaxed text-muted">
            Margin here is gross margin on the frame price before a channel
            fee. Markup is a different sum. GST stays outside the margin math
            until registration is confirmed.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>GST display</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Readout
            id="gst-registered"
            label="GST registered"
            value={settings?.gst_registered ? "Yes" : "No — not assumed"}
          />
          <Readout
            id="gst-display"
            label="Retail price display"
            value={
              settings?.gst_inclusive_display
                ? "GST-inclusive flag is on"
                : "GST-exclusive flag is on"
            }
          />
          <p className="text-sm leading-relaxed text-muted">
            Registration and the customer-facing tax display are separate
            switches. The inclusive flag does not mean BICII is registered.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Value class bands</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted">
            Starting guide for a prepared frame or frameset, in SGD. A
            hypothesis to calibrate after 15–20 real BICII frames. The label is
            value class.
          </p>
          <table className="mt-3 w-full text-left text-sm">
            <caption className="sr-only">
              Value class guide prices in Singapore dollars
            </caption>
            <thead>
              <tr className="border-b border-steel-line text-steel">
                <th scope="col" className="py-2 font-medium">
                  Class
                </th>
                <th scope="col" className="py-2 font-medium">
                  Name
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Guide
                </th>
              </tr>
            </thead>
            <tbody>
              {VALUE_ORDER.map((code) => {
                const band = VALUE_CLASS_BANDS_SGD[code];
                const range =
                  band.max == null
                    ? `S$${band.min.toLocaleString("en-SG")}+`
                    : `S$${band.min}–${band.max}`;
                return (
                  <tr key={code} className="border-b border-steel-line last:border-b-0">
                    <th scope="row" className="py-3 font-mono font-medium">
                      {code}
                    </th>
                    <td className="py-3">{band.label}</td>
                    <td className="py-3 text-right font-mono tabular-nums">{range}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preservation class</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted">
            P-class plans the work. Actual hours on the job set the cost. A
            higher P-class is more effort, not a lower structural result.
          </p>
          <ul className="mt-3 divide-y divide-steel-line border-y border-steel-line">
            {PREP_ORDER.map((code) => {
              const item = PRESERVATION_GUIDE[code];
              return (
                <li key={code} className="flex items-baseline justify-between gap-4 py-3">
                  <span>
                    <span className="font-mono font-medium">{code}</span>
                    <span className="text-muted"> · {item.label}</span>
                  </span>
                  <span className="text-right text-sm">{item.hours}</span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm leading-relaxed">
            <li>
              <span className="font-medium">Viewer</span>
              <span className="text-muted">
                {" "}
                — reads approved records. Seller details and acquisition cost
                stay hidden.
              </span>
            </li>
            <li>
              <span className="font-medium">Mechanic</span>
              <span className="text-muted">
                {" "}
                — intake, inspection, and work logs. Can propose a value class
                and a price. Cannot approve their own unresolved HOLD.
              </span>
            </li>
            <li>
              <span className="font-medium">Reviewer</span>
              <span className="text-muted">
                {" "}
                — safety release and price approval, as two steps.
              </span>
            </li>
            <li>
              <span className="font-medium">Admin</span>
              <span className="text-muted">
                {" "}
                — roles, settings, and audited overrides. Past evidence stays
                on the record.
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Banner tone="note" title="Inspection method">
        Frame Atlas records visual/mechanical inspection. Specialist assessment
        is a separate, documented step when a material or a repair needs it. ISO
        4210 and UCI stickers are model claims for new designs — they are not a
        pass of the frame on the stand, and they do not write the value class.
      </Banner>

      <p className="text-sm leading-relaxed">
        <Link href="/brands" className="text-brass-deep underline">
          Brand landscape notes
        </Link>
        {" · "}
        <Link href="/market" className="text-brass-deep underline">
          SG market comps
        </Link>
      </p>
      <p className="text-xs leading-relaxed text-muted">
        Research letter rubric (S–F) lives in{" "}
        <code>docs/frame-evaluation-grading-rubric.md</code>. Letter{" "}
        <code>F</code> is a structural fail disposition — not value class{" "}
        <code>F1</code>.
      </p>
    </div>
  );
}

function Readout({
  id,
  label,
  value,
}: {
  id: string;
  label: string;
  value: string;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} readOnly />
    </div>
  );
}
