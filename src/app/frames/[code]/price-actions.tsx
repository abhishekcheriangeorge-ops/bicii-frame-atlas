"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { VALUE_CLASS_BANDS_SGD, type ValueClass } from "@/lib/domain/types";

export function PriceActions({
  frameCode,
  inspectionStatus,
  currentStatus,
  costFloorCents,
  valueClass,
}: {
  frameCode: string;
  inspectionStatus: string;
  currentStatus: string;
  costFloorCents: number;
  valueClass: string | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [price, setPrice] = useState(
    Math.max(Math.round(costFloorCents / 100), 200),
  );
  const [cls, setCls] = useState(valueClass ?? "F2");
  const [msg, setMsg] = useState<string | null>(null);

  const blocked =
    inspectionStatus === "HOLD" ||
    inspectionStatus === "REJECT" ||
    inspectionStatus === "DRAFT" ||
    currentStatus === "hold" ||
    currentStatus === "rejected";

  function approve() {
    setMsg(null);
    start(async () => {
      const res = await fetch(`/api/frames/${frameCode}/approve-price`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          approved_price_sgd: price,
          value_class: cls,
          rationale: "Reviewer approval from Frame Atlas worksheet",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error ?? "Approval failed");
        return;
      }
      setMsg(data.message ?? "Approved");
      router.refresh();
    });
  }

  return (
    <div className="mt-4 space-y-3 border-t border-[var(--steel)]/25 pt-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`${frameCode}-price`}>Proposed retail (SGD)</Label>
          <Input
            id={`${frameCode}-price`}
            type="number"
            inputMode="decimal"
            min={0}
            step={1}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </div>
        <div>
          <Label htmlFor={`${frameCode}-class`}>Value class</Label>
          <Select
            id={`${frameCode}-class`}
            value={cls}
            onChange={(e) => setCls(e.target.value)}
          >
            {(Object.keys(VALUE_CLASS_BANDS_SGD) as ValueClass[]).map((code) => (
              <option key={code} value={code}>
                {code} · {VALUE_CLASS_BANDS_SGD[code].label}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <Button
        type="button"
        className="w-full whitespace-normal sm:w-auto"
        disabled={pending || blocked}
        onClick={approve}
      >
        {blocked
          ? "Blocked until a visual/mechanical pass"
          : pending
            ? "Saving…"
            : "Approve price"}
      </Button>
      {msg ? <p className="text-sm text-[var(--muted)]">{msg}</p> : null}
    </div>
  );
}
