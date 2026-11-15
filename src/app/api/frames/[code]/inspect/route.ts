import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStaffContext, canApproveSafety } from "@/lib/auth";
import { sql, sqlOne } from "@/lib/db";
import { writeAudit } from "@/lib/frames";
import { CHECKLIST, evaluateInspection } from "@/lib/domain/checklist";

const Body = z.object({
  forkIncluded: z.boolean(),
  forceReject: z.boolean().optional(),
  items: z.array(
    z.object({
      checkId: z.string(),
      result: z.enum(["pass", "concern", "not_applicable", "not_inspected"]),
      notes: z.string().optional(),
    }),
  ),
});

export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  const staff = await getStaffContext(request);
  if (!staff.verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (staff.role === "viewer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { code } = await ctx.params;
  const frame = await sqlOne<{ id: string; current_status: string }>(
    `select id, current_status from frames where frame_code = $1`,
    [code],
  );
  if (!frame) {
    return NextResponse.json({ error: "Frame not found" }, { status: 404 });
  }

  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const evaluation = evaluateInspection({
    items: parsed.data.items,
    forkIncluded: parsed.data.forkIncluded,
  });

  let outcome = parsed.data.forceReject ? "REJECT" : evaluation.outcome;
  if (parsed.data.forceReject && !canApproveSafety(staff.role)) {
    return NextResponse.json(
      { error: "Only reviewer/admin can force REJECT" },
      { status: 403 },
    );
  }

  const ver = await sqlOne<{ v: number }>(
    `select coalesce(max(version),0)+1 as v from inspections where frame_id = $1`,
    [frame.id],
  );
  const version = ver?.v ?? 1;

  const ins = await sql<{ id: string }>(
    `insert into inspections (
      frame_id, version, inspector_sub, inspector_name, outcome, notes, critical_flags
    ) values ($1,$2,$3,$4,$5,$6,$7::jsonb) returning id`,
    [
      frame.id,
      version,
      staff.sub,
      staff.name,
      outcome,
      evaluation.blockers.join("; ") || null,
      JSON.stringify(evaluation.criticalFlags),
    ],
  );
  const inspectionId = ins[0]?.id;
  if (!inspectionId) {
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }

  for (const def of CHECKLIST) {
    const item = parsed.data.items.find((i) => i.checkId === def.checkId);
    if (!item) continue;
    await sql(
      `insert into inspection_items (
        inspection_id, category, check_id, label, result, is_structural, is_mandatory, notes
      ) values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        inspectionId,
        def.category,
        def.checkId,
        def.label,
        item.result,
        def.structural,
        def.mandatory,
        item.notes ?? null,
      ],
    );
  }

  let nextStatus = frame.current_status;
  let listing = false;
  let build = false;
  if (outcome === "HOLD") {
    nextStatus = "hold";
  } else if (outcome === "REJECT") {
    nextStatus = "rejected";
  } else if (outcome === "PASS_VISUAL") {
    nextStatus = "inspection_passed";
  } else {
    nextStatus = "inspection_pending";
  }

  await sql(
    `update frames set
      inspection_status = $2,
      current_status = $3,
      listing_eligible = $4,
      available_for_build = $5,
      updated_by = $6,
      updated_at = now()
     where id = $1`,
    [frame.id, outcome, nextStatus, listing, build, staff.sub],
  );

  await writeAudit({
    actorSub: staff.sub,
    actorName: staff.name,
    entityType: "inspection",
    entityId: inspectionId,
    action: "inspection_recorded",
    after: { outcome, blockers: evaluation.blockers },
  });

  return NextResponse.json({
    outcome,
    blockers: evaluation.blockers,
    criticalFlags: evaluation.criticalFlags,
  });
}
