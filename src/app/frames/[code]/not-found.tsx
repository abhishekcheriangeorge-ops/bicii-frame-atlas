import { PageHeading } from "@/components/page-heading";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";

export default function FrameNotFound() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeading
        kicker="Frame record"
        title="No frame for this code"
        lede="This code is not in the atlas. Inspection, preservation class, and value class are all unrecorded."
      />
      <Banner tone="hold" title="Not on the build bench">
        An unknown code is not a pass and not a listing. Intake a draft when
        the frame is physically in the workshop.
      </Banner>
      <div className="grid gap-3 sm:grid-cols-2">
        <Button href="/frames/new">Start intake</Button>
        <Button href="/frames" variant="secondary">
          Back to inventory
        </Button>
      </div>
    </div>
  );
}
