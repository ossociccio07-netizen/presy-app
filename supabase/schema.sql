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

-- ─── profiles ─────────────────────────────────────────────
-- Profilo utente sincronizzato con auth.users (persistenza sessione + UI reattiva)

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username        TEXT NOT NULL,
  email           TEXT,
  display_name    TEXT,
  avatar_url      TEXT,
  phone_number    TEXT,
  participated    INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_username ON profiles (username);
CREATE INDEX idx_profiles_phone ON profiles (phone_number) WHERE phone_number IS NOT NULL;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_all ON profiles
  FOR SELECT USING (true);

CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id);

COMMENT ON TABLE profiles IS 'User profile row — source of truth for PresyEngine currentUser';

-- ─── presy_parties ────────────────────────────────────────
-- Pre-serate esplorabili (source of truth per Explore / Chat / Profilo)

CREATE TABLE presy_parties (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  citta             TEXT,
  provincia         TEXT,
  data              DATE,
  orario            TEXT,
  geoloc            TEXT NOT NULL,
  club              TEXT NOT NULL,
  ticket_link       TEXT DEFAULT '',
  privacy           TEXT NOT NULL DEFAULT 'PUBLIC',
  creator_username  TEXT NOT NULL,
  host_id           UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  participants      UUID[] NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_presy_parties_privacy ON presy_parties (privacy);
CREATE INDEX idx_presy_parties_data ON presy_parties (data DESC);
CREATE INDEX idx_presy_parties_provincia ON presy_parties (provincia);

CREATE TRIGGER trg_presy_parties_updated_at
  BEFORE UPDATE ON presy_parties
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

ALTER TABLE presy_parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY presy_parties_select ON presy_parties
  FOR SELECT USING (true);

CREATE POLICY presy_parties_insert ON presy_parties
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY presy_parties_update ON presy_parties
  FOR UPDATE USING (
    auth.uid() = host_id
    OR auth.uid() = ANY (participants)
    OR (privacy = 'PUBLIC' AND auth.role() = 'authenticated')
  );

CREATE POLICY presy_parties_delete ON presy_parties
  FOR DELETE USING (auth.uid() = host_id);

COMMENT ON TABLE presy_parties IS 'Presy pre-party events — fetched live by renderExplore/renderChat/renderProfile';

-- ─── chat_messages ────────────────────────────────────────

CREATE TABLE chat_messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id          TEXT NOT NULL,
  sender_username  TEXT NOT NULL,
  sender_id        UUID REFERENCES auth.users (id) ON DELETE SET NULL,
  text             TEXT DEFAULT '',
  media_type       TEXT,
  media_url        TEXT,
  is_request       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_room ON chat_messages (room_id, created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY chat_messages_select ON chat_messages
  FOR SELECT USING (true);

CREATE POLICY chat_messages_insert ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY chat_messages_delete ON chat_messages
  FOR DELETE USING (auth.uid() = sender_id);

COMMENT ON TABLE chat_messages IS 'Chat room messages — fetched live by renderChat';

-- ─── party_shopping_items ─────────────────────────────────
-- Lista spesa collaborativa per stanza (real-time sync)

CREATE TABLE party_shopping_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id        TEXT NOT NULL,
  catalog_id      TEXT,
  item_name       TEXT NOT NULL,
  unit_price      NUMERIC(10, 2) NOT NULL DEFAULT 0,
  quantity        INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  is_custom       BOOLEAN NOT NULL DEFAULT FALSE,
  is_approved     BOOLEAN NOT NULL DEFAULT TRUE,
  added_by        TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shopping_party_id ON party_shopping_items (party_id);
CREATE INDEX idx_shopping_pending ON party_shopping_items (is_approved) WHERE is_approved = FALSE;
CREATE UNIQUE INDEX idx_shopping_party_catalog ON party_shopping_items (party_id, catalog_id)
  WHERE catalog_id IS NOT NULL;

CREATE TRIGGER trg_shopping_updated_at
  BEFORE UPDATE ON party_shopping_items
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE party_shopping_items IS 'Collaborative shopping list rows per party room';

-- Abilita Realtime in Supabase Dashboard: Database → Replication → party_shopping_items

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
