"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FieldHint, Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: "source", label: "Source" },
  { id: "identity", label: "Identity" },
  { id: "fork", label: "Fork" },
  { id: "notes", label: "Notes" },
] as const;

const SOURCES = [
  ["unknown", "Unknown"],
  ["collector", "Collector"],
  ["online_listing", "Online listing"],
  ["trade_in", "Trade-in"],
  ["donation", "Donation"],
  ["consignment", "Consignment"],
  ["other", "Other"],
] as const;

export function IntakeForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < STEPS.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    const form = event.currentTarget;
    const fd = new FormData(form);
    const brand = textOr(fd.get("brand_text"), "Unknown");
    setError(null);
    start(async () => {
      const res = await fetch("/api/frames", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          brand_text: brand,
          model_text: emptyToNull(fd.get("model_text")),
          material: fd.get("material") || "unknown",
          frame_size_label: emptyToNull(fd.get("frame_size_label")),
          fork_included: fd.get("fork_included") === "on",
          acquisition_cost_sgd: moneyOrZero(fd.get("acquisition_cost_sgd")),
          acquisition_source_type: fd.get("acquisition_source_type") || "unknown",
          estimated_year_from: emptyToInt(fd.get("estimated_year_from")),
          estimated_year_to: emptyToInt(fd.get("estimated_year_to")),
          year_confidence: fd.get("year_confidence") || "unknown",
          notes: emptyToNull(fd.get("notes")),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "The draft was not saved.");
        return;
      }
      router.push(`/frames/${data.frame_code}`);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardContent className="space-y-5">
        <ol aria-label="Intake steps" className="grid grid-cols-4 gap-1">
          {STEPS.map((item, index) => {
            const current = index === step;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-current={current ? "step" : undefined}
                  onClick={() => setStep(index)}
                  className={cn(
                    "flex min-h-12 w-full flex-col items-center justify-center border px-1 text-xs font-medium",
                    current
                      ? "border-brass-deep bg-brass-wash text-ink"
                      : "border-steel-line bg-paper text-steel",
                  )}
                >
                  <span className="font-mono">{index + 1}</span>
                  {item.label}
                </button>
              </li>
            );
          })}
        </ol>

        <form onSubmit={onSubmit} className="space-y-5">
          <fieldset hidden={step !== 0} className="space-y-4">
            <legend className="font-display text-2xl text-ink">Source</legend>
            <p className="text-sm leading-relaxed text-muted">
              Seller identity stays on the internal record. Leave cost blank
              when it is unknown.
            </p>
            <div>
              <Label htmlFor="acquisition_source_type">Acquisition source</Label>
              <Select
                id="acquisition_source_type"
                name="acquisition_source_type"
                defaultValue="unknown"
              >
                {SOURCES.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="acquisition_cost_sgd">Acquisition cost (SGD)</Label>
              <Input
                id="acquisition_cost_sgd"
                name="acquisition_cost_sgd"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="Unknown"
              />
              <FieldHint>Whole dollars or cents. Blank stays off the cost sheet until you know it.</FieldHint>
            </div>
          </fieldset>

          <fieldset hidden={step !== 1} className="space-y-4">
            <legend className="font-display text-2xl text-ink">Identity</legend>
            <p className="text-sm leading-relaxed text-muted">
              Paint or a serial alone does not identify the maker, model, or
              year. Record how the name is known, and leave the year empty when
              it is unknown.
            </p>
            <div>
              <Label htmlFor="brand_text">Manufacturer</Label>
              <Input
                id="brand_text"
                name="brand_text"
                placeholder="Unknown"
                autoComplete="off"
              />
              <FieldHint>Blank is stored as Unknown.</FieldHint>
            </div>
            <div>
              <Label htmlFor="model_text">Model</Label>
              <Input
                id="model_text"
                name="model_text"
                placeholder="Unknown"
                autoComplete="off"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="material">Material</Label>
                <Select id="material" name="material" defaultValue="unknown">
                  {["unknown", "steel", "aluminium", "carbon", "titanium", "other"].map(
                    (material) => (
                      <option key={material} value={material}>
                        {material}
                      </option>
                    ),
                  )}
                </Select>
              </div>
              <div>
                <Label htmlFor="frame_size_label">Size label</Label>
                <Input
                  id="frame_size_label"
                  name="frame_size_label"
                  placeholder='54 cm / 18"'
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="estimated_year_from">Year from</Label>
                <Input
                  id="estimated_year_from"
                  name="estimated_year_from"
                  inputMode="numeric"
                  placeholder="Unknown"
                />
              </div>
              <div>
                <Label htmlFor="estimated_year_to">Year to</Label>
                <Input
                  id="estimated_year_to"
                  name="estimated_year_to"
                  inputMode="numeric"
                  placeholder="Unknown"
                />
              </div>
              <div>
                <Label htmlFor="year_confidence">Year confidence</Label>
                <Select id="year_confidence" name="year_confidence" defaultValue="unknown">
                  {["unknown", "provisional", "likely", "confirmed"].map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </fieldset>

          <fieldset hidden={step !== 2} className="space-y-4">
            <legend className="font-display text-2xl text-ink">Fork and parts</legend>
            <p className="text-sm leading-relaxed text-muted">
              A frameset and a bare frame are different records. Say so here.
              Fork assessment waits until inspection, and only if a fork arrived.
            </p>
            <label className="flex min-h-12 items-center gap-3 border border-steel-line bg-paper px-3 text-base">
              <input
                name="fork_included"
                type="checkbox"
                className="size-5 accent-brass-deep"
              />
              Fork included with this frame
            </label>
            <FieldHint>
              Leave unchecked for a bare frame. Matching and non-matching forks
              can be separated on the frame record after intake.
            </FieldHint>
          </fieldset>

          <fieldset hidden={step !== 3} className="space-y-4">
            <legend className="font-display text-2xl text-ink">Notes and save</legend>
            <Banner tone="brass" title="Draft only">
              Saving issues a BICII-F code and leaves inspection at draft.
              Preservation class and value class stay unset. Photos join the
              record in the intake phase that stores images.
            </Banner>
            <div>
              <Label htmlFor="notes">Intake notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="What you can see today. Skip guesses about tubing or year."
              />
            </div>
          </fieldset>

          {error ? (
            <Banner tone="hold" title="Draft not saved">
              {error}
            </Banner>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              disabled={step === 0 || pending}
              onClick={() => setStep((current) => Math.max(0, current - 1))}
            >
              Back
            </Button>
            <Button type="submit" disabled={pending}>
              {step < STEPS.length - 1
                ? "Next"
                : pending
                  ? "Saving…"
                  : "Save intake draft"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function emptyToNull(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

function textOr(value: FormDataEntryValue | null, fallback: string) {
  return emptyToNull(value) ?? fallback;
}

function emptyToInt(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

function moneyOrZero(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}
