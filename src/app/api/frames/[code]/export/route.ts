import { NextResponse } from "next/server";
import { sqlOne } from "@/lib/db";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ code: string }> },
) {
  const { code } = await ctx.params;
  const frame = await sqlOne<{
    frame_code: string;
    brand_text: string | null;
    model_text: string | null;
    estimated_year_from: number | null;
    estimated_year_to: number | null;
    year_confidence: string;
    material: string;
    fork_included: boolean;
    inspection_status: string;
    preservation_class: string | null;
    value_class: string | null;
    current_approved_price_cents: number | null;
    listing_eligible: boolean;
    sample_tag: boolean;
    public_story: string | null;
  }>(`select * from frames where frame_code = $1`, [code]);

  if (!frame) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const payload = {
    frame_code: frame.frame_code,
    identity: {
      brand: frame.brand_text,
      model: frame.model_text,
      year_from: frame.estimated_year_from,
      year_to: frame.estimated_year_to,
      confidence: frame.year_confidence,
    },
    material: frame.material,
    fork_included: frame.fork_included,
    inspection: {
      method: "visual_mechanical",
      outcome: frame.inspection_status,
    },
    preservation: {
      class: frame.preservation_class,
    },
    valuation: {
      class: frame.value_class,
      approved_price_sgd:
        frame.current_approved_price_cents != null
          ? frame.current_approved_price_cents / 100
          : null,
      approved: frame.current_approved_price_cents != null,
    },
    listing_eligible: frame.listing_eligible,
    sample_tag: frame.sample_tag,
    notes: frame.public_story,
  };

  return NextResponse.json(payload, {
    headers: {
      "content-disposition": `attachment; filename="${frame.frame_code}.json"`,
    },
  });
}
