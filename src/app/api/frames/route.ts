import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStaffContext } from "@/lib/auth";
import { sql } from "@/lib/db";
import { nextFrameCode, writeAudit } from "@/lib/frames";

const Body = z.object({
  brand_text: z.string().min(1),
  model_text: z.string().optional().nullable(),
  material: z.enum([
    "steel",
    "aluminium",
    "carbon",
    "titanium",
    "other",
    "unknown",
  ]),
  frame_size_label: z.string().optional().nullable(),
  fork_included: z.boolean().default(false),
  acquisition_cost_sgd: z.number().min(0).default(0),
  acquisition_source_type: z.string().optional().nullable(),
  estimated_year_from: z.number().int().optional().nullable(),
  estimated_year_to: z.number().int().optional().nullable(),
  year_confidence: z
    .enum(["confirmed", "likely", "provisional", "unknown"])
    .default("unknown"),
  notes: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  const staff = await getStaffContext(request);
  if (!staff.verified) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (staff.role === "viewer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const parsed = Body.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }
  const b = parsed.data;
  const code = await nextFrameCode();
  const costCents = Math.round(b.acquisition_cost_sgd * 100);

  const rows = await sql<{ id: string; frame_code: string }>(
    `insert into frames (
      frame_code, brand_text, model_text, material, frame_size_label,
      fork_included, fork_originality, acquisition_source_type,
      acquisition_cost_cents, estimated_year_from, estimated_year_to,
      year_confidence, public_story, current_status, inspection_status,
      frame_only_or_frameset, created_by, updated_by
    ) values (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'intake_draft','DRAFT',$14,$15,$15
    ) returning id, frame_code`,
    [
      code,
      b.brand_text,
      b.model_text ?? null,
      b.material,
      b.frame_size_label ?? null,
      b.fork_included,
      b.fork_included ? "unknown" : "not_applicable",
      b.acquisition_source_type ?? "other",
      costCents,
      b.estimated_year_from ?? null,
      b.estimated_year_to ?? null,
      b.year_confidence,
      b.notes ?? null,
      b.fork_included ? "frameset" : "frame_only",
      staff.sub,
    ],
  );

  const frame = rows[0];
  if (!frame) {
    return NextResponse.json({ error: "Insert failed" }, { status: 500 });
  }

  if (costCents > 0) {
    await sql(
      `insert into cost_items (frame_id, category, amount_cents, source, created_by)
       values ($1,'acquisition',$2,'intake',$3)`,
      [frame.id, costCents, staff.sub],
    );
  }

  await writeAudit({
    actorSub: staff.sub,
    actorName: staff.name,
    entityType: "frame",
    entityId: frame.id,
    action: "intake_created",
    after: { frame_code: code, brand: b.brand_text },
  });

  return NextResponse.json({ frame_code: frame.frame_code, id: frame.id });
}
