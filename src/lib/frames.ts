import { sql, sqlOne } from "./db";

export type FrameRow = {
  id: string;
  frame_code: string;
  brand_text: string | null;
  model_text: string | null;
  material: string;
  frame_size_label: string | null;
  fork_included: boolean;
  current_status: string;
  inspection_status: string;
  preservation_class: string | null;
  value_class: string | null;
  current_approved_price_cents: number | null;
  acquisition_cost_cents: number;
  cosmetic_condition: string;
  sample_tag: boolean;
  listing_eligible: boolean;
  available_for_build: boolean;
  public_story: string | null;
  estimated_year_from: number | null;
  estimated_year_to: number | null;
  year_confidence: string;
  updated_at: string;
};

export async function listFrames(filters?: {
  status?: string;
  q?: string;
}): Promise<FrameRow[]> {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (filters?.status) {
    params.push(filters.status);
    clauses.push(`current_status = $${params.length}`);
  }
  if (filters?.q) {
    params.push(`%${filters.q}%`);
    clauses.push(
      `(frame_code ilike $${params.length} or brand_text ilike $${params.length} or model_text ilike $${params.length})`,
    );
  }
  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  return sql<FrameRow>(
    `select * from frames ${where} order by updated_at desc`,
    params,
  );
}

export async function getFrameByCode(code: string): Promise<FrameRow | null> {
  return sqlOne<FrameRow>(`select * from frames where frame_code = $1`, [code]);
}

export async function dashboardCounts() {
  const rows = await sql<{
    current_status: string;
    inspection_status: string;
    n: number;
  }>(
    `select current_status, inspection_status, count(*)::int as n from frames group by 1, 2`,
  );
  const byStatus: Record<string, number> = {};
  let hold = 0;
  let total = 0;
  for (const r of rows) {
    byStatus[r.current_status] = (byStatus[r.current_status] ?? 0) + r.n;
    total += r.n;
    if (r.inspection_status === "HOLD" || r.current_status === "hold") {
      hold += r.n;
    }
  }
  return { byStatus, hold, total };
}

export async function nextFrameCode(): Promise<string> {
  const rows = await sql<{ next_value: number }>(
    `update frame_code_seq set next_value = next_value + 1 where id = 1 returning next_value - 1 as next_value`,
  );
  const n = rows[0]?.next_value ?? 1;
  return `BICII-F-${String(n).padStart(6, "0")}`;
}

export async function preparedCostCents(frameId: string): Promise<number> {
  const rows = await sql<{ sum: number }>(
    `select coalesce(sum(amount_cents),0)::int as sum from cost_items where frame_id = $1 and include_in_cost_basis = true`,
    [frameId],
  );
  return rows[0]?.sum ?? 0;
}

export async function writeAudit(params: {
  actorSub?: string;
  actorName?: string;
  entityType: string;
  entityId: string;
  action: string;
  before?: unknown;
  after?: unknown;
}) {
  await sql(
    `insert into audit_events (actor_sub, actor_name, entity_type, entity_id, action, before_summary, after_summary)
     values ($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb)`,
    [
      params.actorSub ?? null,
      params.actorName ?? null,
      params.entityType,
      params.entityId,
      params.action,
      JSON.stringify(params.before ?? null),
      JSON.stringify(params.after ?? null),
    ],
  );
}
