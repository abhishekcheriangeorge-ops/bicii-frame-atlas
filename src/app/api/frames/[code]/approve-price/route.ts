import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { canApprovePrice, getStaffContext } from "@/lib/auth";
import { sql, sqlOne } from "@/lib/db";
import { preparedCostCents, writeAudit } from "@/lib/frames";
import {
  classBandConflict,
  computeCostFloor,
  roundToStepCents,
} from "@/lib/domain/pricing";
import { VALUE_CLASS_BANDS_CENTS, type ValueClass } from "@/lib/domain/types";

const Body = z.object({
  approved_price_sgd: z.number().positive(),
  value_class: z.enum(["F1", "F2", "F3", "F4", "F5"]),
  rationale: z.string().min(3),
  allow_below_floor: z.boolean().optional(),
});

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  const staff = await getStaffContext(request);
  if (!staff.verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!canApprovePrice(staff.role)) {
    return NextResponse.json(
      { error: "Only reviewer/admin can approve price" },
      { status: 403 },
    );
  }

  const { code } = await ctx.params;
  const frame = await sqlOne<{
    id: string;
    inspection_status: string;
    current_status: string;
  }>(
    `select id, inspection_status, current_status from frames where frame_code = $1`,
    [code],
  );
  if (!frame) {
    return NextResponse.json({ error: "Frame not found" }, { status: 404 });
  }
  if (
    frame.inspection_status !== "PASS_VISUAL" ||
    frame.current_status === "hold" ||
    frame.current_status === "rejected"
  ) {
    return NextResponse.json(
      {
        error:
          "Cannot approve price while inspection is not PASS_VISUAL or frame is on HOLD/REJECT",
      },
      { status: 409 },
    );
  }

  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const cost = await preparedCostCents(frame.id);
  const floor = computeCostFloor({
    preparedCostCents: cost,
    targetGrossMargin: 0.4,
  });
  const priceCents = Math.round(parsed.data.approved_price_sgd * 100);
  const conflict = classBandConflict({
    costFloorCents: floor,
    valueClass: parsed.data.value_class,
  });

  if (priceCents < floor && !parsed.data.allow_below_floor) {
    return NextResponse.json(
      {
        error: `Price below cost floor (${(floor / 100).toFixed(2)} SGD). Set allow_below_floor with rationale.`,
      },
      { status: 409 },
    );
  }

  const ver = await sqlOne<{ v: number }>(
    `select coalesce(max(version),0)+1 as v from pricing_versions where frame_id = $1`,
    [frame.id],
  );
  const band = VALUE_CLASS_BANDS_CENTS[parsed.data.value_class as ValueClass];

  await sql(
    `insert into pricing_versions (
      frame_id, version, inputs_snapshot, prepared_cost_cents, cost_floor_cents,
      target_margin, selling_fee_rate, suggested_class, class_band_min_cents,
      class_band_max_cents, suggested_price_cents, approved_price_cents,
      pricing_conflict, conflict_notes, override_rationale, approved_by, approved_at
    ) values (
      $1,$2,$3::jsonb,$4,$5,0.4,0,$6,$7,$8,$9,$10,$11,$12,$13,$14,now()
    )`,
    [
      frame.id,
      ver?.v ?? 1,
      JSON.stringify({ approved_by: staff.sub }),
      cost,
      floor,
      parsed.data.value_class,
      band.min,
      band.max,
      roundToStepCents(priceCents),
      priceCents,
      conflict.conflict,
      conflict.message ?? null,
      parsed.data.rationale,
      staff.sub,
    ],
  );

  const prep = await sqlOne<{ released_for_pricing: boolean }>(
    `select released_for_pricing from preservation_work_orders
     where frame_id = $1 order by created_at desc limit 1`,
    [frame.id],
  );
  // Listing can proceed after price approval + PASS_VISUAL.
  // available_for_build also needs an explicit preparation release (PRD invariant).
  const availableForBuild = prep?.released_for_pricing === true;

  await sql(
    `update frames set
      value_class = $2,
      current_approved_price_cents = $3,
      current_status = 'approved',
      listing_eligible = true,
      available_for_build = $5,
      updated_by = $4,
      updated_at = now()
     where id = $1`,
    [
      frame.id,
      parsed.data.value_class,
      priceCents,
      staff.sub,
      availableForBuild,
    ],
  );

  await writeAudit({
    actorSub: staff.sub,
    actorName: staff.name,
    entityType: "pricing",
    entityId: frame.id,
    action: "price_approved",
    after: {
      priceCents,
      value_class: parsed.data.value_class,
      conflict: conflict.conflict,
    },
  });

  return NextResponse.json({
    message: conflict.conflict
      ? "Approved with pricing conflict flag retained"
      : "Price approved; listing eligible",
    pricing_conflict: conflict.conflict,
  });
}
