-- Append-only audit. Approvals and evidence are not hard-deleted.

create table audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_sub text,
  actor_name text,
  entity_type text not null,
  entity_id text not null,
  action text not null,
  before_summary jsonb,
  after_summary jsonb,
  correlation_id text,
  created_at timestamptz not null default now(),
  constraint audit_events_action_present check (length(btrim(action)) > 0),
  constraint audit_events_entity_present check (
    length(btrim(entity_type)) > 0 and length(btrim(entity_id)) > 0
  )
);

create index audit_entity_idx on audit_events (entity_type, entity_id, created_at desc);
create index audit_created_idx on audit_events (created_at desc);
create index audit_correlation_idx on audit_events (correlation_id)
  where correlation_id is not null;

comment on table audit_events is
  'Append-only history. Updates and deletes are rejected. Actor text is the auth subject; there is no Supabase auth schema.';
