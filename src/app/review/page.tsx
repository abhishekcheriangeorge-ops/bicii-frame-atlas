import type { Metadata } from "next";
import { listFrames, type FrameRow } from "@/lib/frames";
import { PageHeading } from "@/components/page-heading";
import { FrameLink } from "@/components/frame-link";
import { Banner } from "@/components/ui/banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Review" };

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const frames = await listFrames();
  const safety = frames.filter(needsSafetyRelease);
  const pricing = frames.filter(needsPriceApproval);

  return (
    <div className="space-y-6">
      <PageHeading
        kicker="Sign-off"
        title="Review queue"
        lede="Safety release and price approval are different sign-offs. A preparer does not clear their own unresolved HOLD. Suggested prices still need a person."
      />

      <Banner tone="hold" title="Safety gate">
        HOLD and REJECT stay off build-ready and listing. Value class is the
        market-position guide and does not clear either outcome. A recorded
        pass is BICII&apos;s documented visual/mechanical inspection on a date.
      </Banner>

      <Card>
        <CardHeader>
          <CardTitle>Safety release</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed text-muted">
            Inspection pending, HOLD, and REJECT. Work the checklist and the
            evidence before anyone talks about a retail price.
          </p>
          <Queue frames={safety} empty="No frames are waiting on a safety release." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing approval</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed text-muted">
            Ready for pricing or already in pricing review, and only when
            inspection is not HOLD or REJECT. Approval locks a price version.
            It does not certify the frame.
          </p>
          <Queue
            frames={pricing}
            empty="No frames are waiting on a price. Cost floor, value class, and market evidence meet on the frame record."
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Queue({ frames, empty }: { frames: FrameRow[]; empty: string }) {
  if (frames.length === 0) {
    return <p className="text-base leading-relaxed text-ink">{empty}</p>;
  }
  return (
    <ul className="space-y-3">
      {frames.map((frame) => (
        <li key={frame.id}>
          <FrameLink frame={frame} />
        </li>
      ))}
    </ul>
  );
}

function needsSafetyRelease(frame: FrameRow) {
  return (
    frame.inspection_status === "HOLD" ||
    frame.inspection_status === "REJECT" ||
    frame.current_status === "hold" ||
    frame.current_status === "rejected" ||
    frame.current_status === "inspection_pending"
  );
}

function needsPriceApproval(frame: FrameRow) {
  const inPricing =
    frame.current_status === "pricing_review" ||
    frame.current_status === "ready_for_pricing";
  const blocked =
    frame.inspection_status === "HOLD" ||
    frame.inspection_status === "REJECT" ||
    frame.current_status === "hold" ||
    frame.current_status === "rejected";
  return inPricing && !blocked;
}
