-- ═══════════════════════════════════════════════════════════
-- PRESY — Supabase / PostgreSQL Schema
-- Analytics-ready: unique groups, alcohol preferences, conversion
-- ═══════════════════════════════════════════════════════════

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── ENUM Types ───────────────────────────────────────────

CREATE TYPE drink_type AS ENUM (
  'vodka',
  'gin',
  'whiskey',
  'rum',
  'tequila',
  'beer',
  'wine',
  'redbull',
  'soda',
  'lemon',
  'ice',
  'mixer',
  'other'
);

-- ─── parties ──────────────────────────────────────────────
-- Tracks unique group instances (one row = one Presy session)

CREATE TABLE parties (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_name      TEXT NOT NULL,
  host_id         UUID,                          -- Supabase auth.users.id (host only logs in)
  receipt_total   NUMERIC(10, 2) DEFAULT 0.00,
  target_venue_clicked BOOLEAN NOT NULL DEFAULT FALSE,  -- NOCT conversion flag
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_parties_created_at ON parties (created_at DESC);
CREATE INDEX idx_parties_host_id ON parties (host_id);
CREATE INDEX idx_parties_venue_clicked ON parties (target_venue_clicked) WHERE target_venue_clicked = TRUE;

COMMENT ON TABLE parties IS 'Unique Presy group sessions — core unit for investor metrics';
COMMENT ON COLUMN parties.target_venue_clicked IS 'TRUE when guest taps NOCT Book Tickets CTA';

-- ─── party_guests ─────────────────────────────────────────
-- Anonymous guests mapped via LocalStorage UUID

CREATE TABLE party_guests (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id            UUID NOT NULL REFERENCES parties (id) ON DELETE CASCADE,
  guest_name          TEXT NOT NULL,
  local_storage_uuid  TEXT NOT NULL,               -- crypto.randomUUID() from browser
  has_paid_status     BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (party_id, local_storage_uuid)
);

CREATE INDEX idx_party_guests_party_id ON party_guests (party_id);
CREATE INDEX idx_party_guests_local_storage ON party_guests (local_storage_uuid);
CREATE INDEX idx_party_guests_paid ON party_guests (party_id, has_paid_status);

COMMENT ON TABLE party_guests IS 'Anonymous participants per party — linked via LocalStorage UUID';

-- ─── consumption_logs ─────────────────────────────────────
-- Core data asset: what, where (party), how much

CREATE TABLE consumption_logs (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id                    UUID NOT NULL REFERENCES parties (id) ON DELETE CASCADE,
  guest_id_or_anonymous_name  TEXT NOT NULL,       -- FK to party_guests.id OR plain name fallback
  drink_type                  drink_type NOT NULL,
  quantity                    INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  unit_price                  NUMERIC(10, 2),      -- snapshot at time of log
  logged_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consumption_party_id ON consumption_logs (party_id);
CREATE INDEX idx_consumption_drink_type ON consumption_logs (drink_type);
CREATE INDEX idx_consumption_party_drink ON consumption_logs (party_id, drink_type);

COMMENT ON TABLE consumption_logs IS 'Per-item alcohol consumption — enables preference & volume analytics';

-- ─── Auto-update updated_at ───────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_parties_updated_at
  BEFORE UPDATE ON parties
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

-- ═══════════════════════════════════════════════════════════
-- INVESTOR ANALYTICS QUERIES (reference)
-- ═══════════════════════════════════════════════════════════

-- 1) Total unique groups
-- SELECT COUNT(*) AS total_unique_groups FROM parties;

-- 2) Average group size
-- SELECT ROUND(AVG(guest_count), 2) AS avg_group_size
-- FROM (
--   SELECT party_id, COUNT(*) AS guest_count
--   FROM party_guests
--   GROUP BY party_id
-- ) sub;

-- 3) Dominant alcohol types (global)
-- SELECT drink_type, SUM(quantity) AS total_units
-- FROM consumption_logs
-- GROUP BY drink_type
-- ORDER BY total_units DESC;

-- 4) NOCT conversion rate
-- SELECT
--   COUNT(*) FILTER (WHERE target_venue_clicked) AS conversions,
--   COUNT(*) AS total_parties,
--   ROUND(100.0 * COUNT(*) FILTER (WHERE target_venue_clicked) / NULLIF(COUNT(*), 0), 2) AS conversion_pct
-- FROM parties;

-- 5) Alcohol preferences by party (data package export)
-- SELECT
--   p.id AS party_id,
--   p.party_name,
--   p.created_at,
--   cl.drink_type,
--   SUM(cl.quantity) AS total_quantity
-- FROM parties p
-- JOIN consumption_logs cl ON cl.party_id = p.id
-- GROUP BY p.id, p.party_name, p.created_at, cl.drink_type
-- ORDER BY p.created_at DESC, total_quantity DESC;
