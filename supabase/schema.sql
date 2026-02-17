-- ============================================================================
-- Sovereign Alignment Atlas — Complete Supabase PostgreSQL Schema
-- ============================================================================

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

CREATE TYPE entity_type AS ENUM ('swf', 'national_champion');

CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TYPE deal_type AS ENUM (
  'acquisition',
  'minority_stake',
  'joint_venture',
  'debt_financing',
  'ipo_investment',
  'real_estate',
  'infrastructure',
  'venture_capital',
  'merger',
  'divestiture'
);

CREATE TYPE deal_status AS ENUM (
  'announced',
  'pending',
  'completed',
  'cancelled',
  'rumored'
);

CREATE TYPE relationship_type AS ENUM (
  'subsidiary',
  'investor',
  'partner',
  'board_overlap',
  'government_link',
  'supply_chain',
  'joint_venture',
  'competitor'
);

CREATE TYPE event_type AS ENUM (
  'news',
  'policy',
  'deal',
  'leadership_change',
  'sanction',
  'regulation',
  'earnings'
);

CREATE TYPE alert_type AS ENUM (
  'new_investment',
  'leadership_change',
  'risk_change',
  'new_relationship',
  'news_mention',
  'regulatory_action'
);

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- --------------------------------------------------------------------------
-- countries — Reference table
-- --------------------------------------------------------------------------
CREATE TABLE countries (
  code       text PRIMARY KEY,
  name       text NOT NULL,
  region     text,
  flag_emoji text,
  lat        numeric,
  lng        numeric
);

-- --------------------------------------------------------------------------
-- entities — Both SWFs and national champions
-- --------------------------------------------------------------------------
CREATE TABLE entities (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   text NOT NULL,
  full_name              text,
  type                   entity_type NOT NULL,
  country_code           text REFERENCES countries(code),
  description            text,
  founded_year           integer,
  website                text,
  logo_url               text,
  aum_billions           numeric,
  funding_source         text,
  revenue_billions       numeric,
  employee_count         integer,
  publicly_traded        boolean DEFAULT false,
  stock_ticker           text,
  sector                 text,
  government_affiliation text,
  risk_level             risk_level DEFAULT 'medium',
  strategic_significance integer CHECK (strategic_significance >= 1 AND strategic_significance <= 5),
  metadata               jsonb DEFAULT '{}',
  tags                   text[] DEFAULT '{}',
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

-- --------------------------------------------------------------------------
-- investments
-- --------------------------------------------------------------------------
CREATE TABLE investments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_entity_id  uuid NOT NULL REFERENCES entities(id),
  target_name         text NOT NULL,
  target_entity_id    uuid REFERENCES entities(id),
  target_country_code text REFERENCES countries(code),
  target_sector       text,
  deal_type           deal_type,
  status              deal_status DEFAULT 'announced',
  amount_millions     numeric,
  stake_percentage    numeric,
  currency            text DEFAULT 'USD',
  announced_date      date,
  completed_date      date,
  description         text,
  strategic_rationale text,
  source_url          text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- --------------------------------------------------------------------------
-- relationships
-- --------------------------------------------------------------------------
CREATE TABLE relationships (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_a_id       uuid NOT NULL REFERENCES entities(id),
  entity_b_id       uuid NOT NULL REFERENCES entities(id),
  relationship_type relationship_type NOT NULL,
  description       text,
  strength          integer CHECK (strength >= 1 AND strength <= 5),
  is_active         boolean DEFAULT true,
  source_url        text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  UNIQUE (entity_a_id, entity_b_id, relationship_type)
);

-- --------------------------------------------------------------------------
-- people
-- --------------------------------------------------------------------------
CREATE TABLE people (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name                   text NOT NULL,
  title                  text,
  nationality            text,
  bio                    text,
  is_government_official boolean DEFAULT false,
  created_at             timestamptz DEFAULT now(),
  updated_at             timestamptz DEFAULT now()
);

-- --------------------------------------------------------------------------
-- people_entities — junction
-- --------------------------------------------------------------------------
CREATE TABLE people_entities (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id  uuid NOT NULL REFERENCES people(id),
  entity_id  uuid NOT NULL REFERENCES entities(id),
  role       text,
  start_date date,
  end_date   date,
  is_current boolean DEFAULT true,
  UNIQUE (person_id, entity_id, role)
);

-- --------------------------------------------------------------------------
-- events
-- --------------------------------------------------------------------------
CREATE TABLE events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id    uuid REFERENCES entities(id),
  title        text NOT NULL,
  description  text,
  event_type   event_type NOT NULL,
  event_date   date NOT NULL,
  significance integer CHECK (significance >= 1 AND significance <= 5),
  source_url   text,
  source_name  text,
  is_automated boolean DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

-- --------------------------------------------------------------------------
-- event_entities — junction for events involving multiple entities
-- --------------------------------------------------------------------------
CREATE TABLE event_entities (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id  uuid NOT NULL REFERENCES events(id),
  entity_id uuid NOT NULL REFERENCES entities(id),
  UNIQUE (event_id, entity_id)
);

-- --------------------------------------------------------------------------
-- alerts
-- --------------------------------------------------------------------------
CREATE TABLE alerts (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id),
  entity_id  uuid REFERENCES entities(id),
  alert_type alert_type NOT NULL,
  conditions jsonb DEFAULT '{}',
  is_active  boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- --------------------------------------------------------------------------
-- notifications
-- --------------------------------------------------------------------------
CREATE TABLE notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id),
  alert_id   uuid REFERENCES alerts(id),
  title      text NOT NULL,
  message    text,
  link_url   text,
  is_read    boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- --------------------------------------------------------------------------
-- notes
-- --------------------------------------------------------------------------
CREATE TABLE notes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id),
  entity_id  uuid NOT NULL REFERENCES entities(id),
  content    text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================

-- entities
CREATE INDEX idx_entities_type         ON entities(type);
CREATE INDEX idx_entities_country_code ON entities(country_code);
CREATE INDEX idx_entities_risk_level   ON entities(risk_level);

-- investments
CREATE INDEX idx_investments_investor_entity_id ON investments(investor_entity_id);
CREATE INDEX idx_investments_target_entity_id   ON investments(target_entity_id);
CREATE INDEX idx_investments_announced_date     ON investments(announced_date);

-- relationships
CREATE INDEX idx_relationships_entity_a_id ON relationships(entity_a_id);
CREATE INDEX idx_relationships_entity_b_id ON relationships(entity_b_id);

-- events
CREATE INDEX idx_events_entity_id  ON events(entity_id);
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_event_type ON events(event_type);

-- alerts
CREATE INDEX idx_alerts_user_id ON alerts(user_id);

-- notifications
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ============================================================================
-- 4. VIEWS
-- ============================================================================

-- --------------------------------------------------------------------------
-- entity_summary — entities joined with countries, plus aggregated counts
-- --------------------------------------------------------------------------
CREATE VIEW entity_summary AS
SELECT
  e.id,
  e.name,
  e.full_name,
  e.type,
  e.country_code,
  c.name          AS country_name,
  c.region        AS country_region,
  c.flag_emoji,
  e.description,
  e.founded_year,
  e.website,
  e.logo_url,
  e.aum_billions,
  e.funding_source,
  e.revenue_billions,
  e.employee_count,
  e.publicly_traded,
  e.stock_ticker,
  e.sector,
  e.government_affiliation,
  e.risk_level,
  e.strategic_significance,
  e.metadata,
  e.tags,
  e.created_at,
  e.updated_at,
  (SELECT count(*) FROM investments i WHERE i.investor_entity_id = e.id OR i.target_entity_id = e.id) AS investment_count,
  (SELECT count(*) FROM events ev WHERE ev.entity_id = e.id) AS event_count,
  (SELECT count(*) FROM relationships r WHERE r.entity_a_id = e.id OR r.entity_b_id = e.id) AS relationship_count
FROM entities e
LEFT JOIN countries c ON c.code = e.country_code;

-- --------------------------------------------------------------------------
-- recent_activity — UNION of events and investments, ordered by date
-- --------------------------------------------------------------------------
CREATE VIEW recent_activity AS
(
  SELECT
    ev.id,
    'event'::text      AS activity_type,
    ev.title,
    ev.description,
    ev.event_date      AS activity_date,
    ev.entity_id,
    e.name             AS entity_name,
    ev.source_url,
    ev.created_at
  FROM events ev
  LEFT JOIN entities e ON e.id = ev.entity_id

  UNION ALL

  SELECT
    inv.id,
    'investment'::text  AS activity_type,
    inv.target_name     AS title,
    inv.description,
    inv.announced_date  AS activity_date,
    inv.investor_entity_id AS entity_id,
    e.name              AS entity_name,
    inv.source_url,
    inv.created_at
  FROM investments inv
  LEFT JOIN entities e ON e.id = inv.investor_entity_id
)
ORDER BY activity_date DESC NULLS LAST
LIMIT 50;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE countries        ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities         ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships    ENABLE ROW LEVEL SECURITY;
ALTER TABLE people           ENABLE ROW LEVEL SECURITY;
ALTER TABLE people_entities  ENABLE ROW LEVEL SECURITY;
ALTER TABLE events           ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_entities   ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications    ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes            ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- Public data tables — all authenticated users can SELECT/INSERT/UPDATE/DELETE
-- --------------------------------------------------------------------------

-- countries
CREATE POLICY "Authenticated users can select countries"
  ON countries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert countries"
  ON countries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update countries"
  ON countries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete countries"
  ON countries FOR DELETE TO authenticated USING (true);

-- entities
CREATE POLICY "Authenticated users can select entities"
  ON entities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert entities"
  ON entities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update entities"
  ON entities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete entities"
  ON entities FOR DELETE TO authenticated USING (true);

-- investments
CREATE POLICY "Authenticated users can select investments"
  ON investments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert investments"
  ON investments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update investments"
  ON investments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete investments"
  ON investments FOR DELETE TO authenticated USING (true);

-- relationships
CREATE POLICY "Authenticated users can select relationships"
  ON relationships FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert relationships"
  ON relationships FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update relationships"
  ON relationships FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete relationships"
  ON relationships FOR DELETE TO authenticated USING (true);

-- people
CREATE POLICY "Authenticated users can select people"
  ON people FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert people"
  ON people FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update people"
  ON people FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete people"
  ON people FOR DELETE TO authenticated USING (true);

-- people_entities
CREATE POLICY "Authenticated users can select people_entities"
  ON people_entities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert people_entities"
  ON people_entities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update people_entities"
  ON people_entities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete people_entities"
  ON people_entities FOR DELETE TO authenticated USING (true);

-- events
CREATE POLICY "Authenticated users can select events"
  ON events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert events"
  ON events FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update events"
  ON events FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete events"
  ON events FOR DELETE TO authenticated USING (true);

-- event_entities
CREATE POLICY "Authenticated users can select event_entities"
  ON event_entities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert event_entities"
  ON event_entities FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update event_entities"
  ON event_entities FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users can delete event_entities"
  ON event_entities FOR DELETE TO authenticated USING (true);

-- --------------------------------------------------------------------------
-- User-owned tables — users can only manage their own rows
-- --------------------------------------------------------------------------

-- alerts
CREATE POLICY "Users can select own alerts"
  ON alerts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own alerts"
  ON alerts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own alerts"
  ON alerts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own alerts"
  ON alerts FOR DELETE TO authenticated USING (user_id = auth.uid());

-- notifications
CREATE POLICY "Users can select own notifications"
  ON notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own notifications"
  ON notifications FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own notifications"
  ON notifications FOR DELETE TO authenticated USING (user_id = auth.uid());

-- notes
CREATE POLICY "Users can select own notes"
  ON notes FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own notes"
  ON notes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own notes"
  ON notes FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own notes"
  ON notes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- ============================================================================
-- 6. UPDATED_AT TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_entities_updated_at
  BEFORE UPDATE ON entities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_investments_updated_at
  BEFORE UPDATE ON investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_relationships_updated_at
  BEFORE UPDATE ON relationships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_people_updated_at
  BEFORE UPDATE ON people
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. SEED DATA — Countries
-- ============================================================================

INSERT INTO countries (code, name, region, flag_emoji, lat, lng) VALUES
  ('AE', 'United Arab Emirates',  'gulf_states',    '🇦🇪', 23.4241,  53.8478),
  ('SA', 'Saudi Arabia',          'gulf_states',    '🇸🇦', 23.8859,  45.0792),
  ('QA', 'Qatar',                 'gulf_states',    '🇶🇦', 25.3548,  51.1839),
  ('KW', 'Kuwait',                'gulf_states',    '🇰🇼', 29.3117,  47.4818),
  ('BH', 'Bahrain',               'gulf_states',    '🇧🇭', 26.0667,  50.5577),
  ('OM', 'Oman',                  'gulf_states',    '🇴🇲', 21.4735,  55.9754),
  ('BN', 'Brunei',                'southeast_asia', '🇧🇳',  4.9431, 114.9425),
  ('SG', 'Singapore',             'southeast_asia', '🇸🇬',  1.3521, 103.8198),
  ('MY', 'Malaysia',              'southeast_asia', '🇲🇾',  4.2105, 101.9758),
  ('PH', 'Philippines',           'southeast_asia', '🇵🇭', 12.8797, 121.7740),
  ('VN', 'Vietnam',               'southeast_asia', '🇻🇳', 14.0583, 108.2772),
  ('ID', 'Indonesia',             'southeast_asia', '🇮🇩', -0.7893, 113.9213),
  ('HK', 'Hong Kong',             'east_asia',      '🇭🇰', 22.3193, 114.1694),
  ('KR', 'South Korea',           'east_asia',      '🇰🇷', 35.9078, 127.7669),
  ('JP', 'Japan',                 'east_asia',      '🇯🇵', 36.2048, 138.2529),
  ('CN', 'China',                 'east_asia',      '🇨🇳', 35.8617, 104.1954),
  ('US', 'United States',         'americas',       '🇺🇸', 37.0902, -95.7129),
  ('GB', 'United Kingdom',        'europe',         '🇬🇧', 55.3781,  -3.4360),
  ('DE', 'Germany',               'europe',         '🇩🇪', 51.1657,  10.4515),
  ('FR', 'France',                'europe',         '🇫🇷', 46.2276,   2.2137),
  ('IN', 'India',                 'other',          '🇮🇳', 20.5937,  78.9629),
  ('BR', 'Brazil',                'americas',       '🇧🇷',-14.2350, -51.9253),
  ('AU', 'Australia',             'other',          '🇦🇺',-25.2744, 133.7751),
  ('IL', 'Israel',                'other',          '🇮🇱', 31.0461,  34.8516),
  ('TR', 'Turkey',                'other',          '🇹🇷', 38.9637,  35.2433),
  ('NO', 'Norway',                'europe',         '🇳🇴', 60.4720,   8.4689);

-- ============================================================================
-- 8. SEED DATA — SWFs (entities)
-- ============================================================================

INSERT INTO entities (name, full_name, type, country_code, founded_year, aum_billions, sector, funding_source, government_affiliation, risk_level, strategic_significance) VALUES
  -- Gulf States
  ('KIA',            'Kuwait Investment Authority',             'swf', 'KW', 1953,  969, 'Diversified',                          'Oil revenue',                    'Kuwait Ministry of Finance',                                     'low', 5),
  ('ADIA',           'Abu Dhabi Investment Authority',          'swf', 'AE', 1976,  993, 'Diversified',                          'Oil revenue',                    'Abu Dhabi ruling family',                                        'low', 5),
  ('ADQ',            'ADQ',                                    'swf', 'AE', 2018,  157, 'Infrastructure/Energy/Healthcare',      'Government capital',             'Abu Dhabi government',                                           'low', 4),
  ('Mubadala',       'Mubadala Investment Company',             'swf', 'AE', 2002,  302, 'Technology/Energy/Aerospace',           'Government capital',             'Abu Dhabi government',                                           'low', 5),
  ('ICD',            'Investment Corporation of Dubai',         'swf', 'AE', 2006,  340, 'Diversified',                          'Government capital',             'Dubai ruling family',                                            'low', 5),
  ('EIA',            'Emirates Investment Authority',           'swf', 'AE', 2007,   87, 'Diversified',                          'Federal reserves',               'UAE federal government',                                         'low', 3),
  ('Mumtalakat',     'Bahrain Mumtalakat Holding Company',      'swf', 'BH', 2006,   18, 'Diversified',                          'Government capital',             'Kingdom of Bahrain',                                             'low', 2),
  ('PIF',            'Public Investment Fund',                  'swf', 'SA', 1971,  930, 'Diversified',                          'Oil revenue / Government capital','Crown Prince / Council of Economic and Development Affairs',    'low', 5),
  ('Sanabil',        'Sanabil Investments',                     'swf', 'SA', 2009,   72, 'Technology/Venture Capital',            'PIF allocation',                 'PIF subsidiary / Saudi government',                              'low', 3),
  ('QIA',            'Qatar Investment Authority',              'swf', 'QA', 2005,  510, 'Diversified',                          'Oil and gas revenue',            'Qatar ruling family',                                            'low', 5),
  ('OIA',            'Oman Investment Authority',               'swf', 'OM', 2020,   42, 'Diversified',                          'Oil revenue / Government capital','Sultanate of Oman',                                              'low', 3),

  -- East Asia
  ('HKMA LTGP',     'HKMA Long-Term Growth Portfolio',         'swf', 'HK', 2009,   52, 'Long-term growth / PE',                'Foreign exchange reserves',       'Hong Kong Monetary Authority',                                   'low', 3),
  ('HK Growth Portfolio', 'Hong Kong Growth Portfolio',         'swf', 'HK', 2022,    4, 'Strategic industries / Tech',           'Government capital',             'Hong Kong SAR Government',                                       'low', 2),
  ('KVIC',           'Korea Venture Investment Corporation',    'swf', 'KR', 2004,   12, 'Venture Capital / Startups',            'Government capital',             'Korean Ministry of SMEs and Startups',                           'low', 3),
  ('JIC',            'Japan Investment Corporation',            'swf', 'JP', 2022,   22, 'Industry consolidation / Strategic sectors','Government capital',          'Japanese government',                                            'low', 3),

  -- Southeast Asia
  ('Temasek',        'Temasek Holdings',                       'swf', 'SG', 1974,  389, 'Diversified',                          'Government capital',             'Government of Singapore / Ministry of Finance',                  'low', 5),
  ('GIC',            'GIC Private Limited',                    'swf', 'SG', 1981,  770, 'Diversified',                          'Foreign exchange reserves',       'Government of Singapore',                                        'low', 5),
  ('Khazanah',       'Khazanah Nasional Berhad',               'swf', 'MY', 1993,   35, 'Strategic industries / GLCs',           'Government capital',             'Malaysian government',                                           'low', 3),
  ('BIA',            'Brunei Investment Agency',                'swf', 'BN', 1983,   60, 'Diversified',                          'Oil and gas revenue',            'Sultan of Brunei / Ministry of Finance',                         'low', 3),
  ('MIF',            'Maharlika Investment Fund',               'swf', 'PH', 2023,    3, 'Infrastructure/Strategic sectors',      'Government capital',             'Philippine government',                                          'low', 2),
  ('SCIC',           'State Capital Investment Corporation',    'swf', 'VN', 2005,    8, 'State enterprise management',           'State enterprise dividends',     'Vietnamese government / Ministry of Finance',                    'low', 2),
  ('INA',            'Indonesia Investment Authority',          'swf', 'ID', 2021,    6, 'Infrastructure/Healthcare/Tech',        'Government capital',             'Indonesian government',                                          'low', 2);

-- ============================================================================
-- 9. SEED DATA — Relationships
-- ============================================================================

INSERT INTO relationships (entity_a_id, entity_b_id, relationship_type, description, strength) VALUES
  (
    (SELECT id FROM entities WHERE name = 'ADIA'),
    (SELECT id FROM entities WHERE name = 'Mubadala'),
    'government_link',
    'Both Abu Dhabi sovereign entities under ruling family',
    4
  ),
  (
    (SELECT id FROM entities WHERE name = 'ADIA'),
    (SELECT id FROM entities WHERE name = 'ADQ'),
    'government_link',
    'Abu Dhabi sovereign entities',
    3
  ),
  (
    (SELECT id FROM entities WHERE name = 'ADIA'),
    (SELECT id FROM entities WHERE name = 'EIA'),
    'government_link',
    'UAE sovereign entities',
    2
  ),
  (
    (SELECT id FROM entities WHERE name = 'Mubadala'),
    (SELECT id FROM entities WHERE name = 'ADQ'),
    'government_link',
    'Abu Dhabi sovereign entities, overlapping mandates',
    3
  ),
  (
    (SELECT id FROM entities WHERE name = 'ICD'),
    (SELECT id FROM entities WHERE name = 'EIA'),
    'government_link',
    'UAE sovereign entities — Dubai and federal',
    2
  ),
  (
    (SELECT id FROM entities WHERE name = 'PIF'),
    (SELECT id FROM entities WHERE name = 'Sanabil'),
    'subsidiary',
    'Sanabil operates as PIF subsidiary',
    5
  ),
  (
    (SELECT id FROM entities WHERE name = 'PIF'),
    (SELECT id FROM entities WHERE name = 'QIA'),
    'partner',
    'Multiple co-investment agreements',
    3
  ),
  (
    (SELECT id FROM entities WHERE name = 'Temasek'),
    (SELECT id FROM entities WHERE name = 'GIC'),
    'government_link',
    'Both Singapore sovereign entities under Ministry of Finance',
    4
  ),
  (
    (SELECT id FROM entities WHERE name = 'KIA'),
    (SELECT id FROM entities WHERE name = 'QIA'),
    'partner',
    'Gulf cooperation co-investments',
    2
  );
