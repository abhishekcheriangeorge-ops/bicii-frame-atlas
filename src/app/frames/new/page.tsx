import type { Metadata } from "next";
import { PageHeading } from "@/components/page-heading";
import { IntakeForm } from "./intake-form";

export const metadata: Metadata = { title: "Intake" };

export default function NewFramePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeading
        kicker="New frame"
        title="Intake"
        lede="Log the source, the identity you can actually support, and what arrived with the frame. Unknown is an expected answer. A saved draft does not record an inspection outcome, a preservation class, or a value class."
      />
      <IntakeForm />
    </div>
  );
}
