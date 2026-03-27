CREATE TABLE IF NOT EXISTS sessions_open (
  storage_id      BIGINT PRIMARY KEY,
  dropper         TEXT NOT NULL,
  reward_amount   NUMERIC(78,0) NOT NULL,
  reward_token    TEXT NOT NULL,
  space_geohash5  TEXT NOT NULL,
  region          TEXT NOT NULL,
  storage_type    TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sessions_region_time  ON sessions_open(region, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_geohash5     ON sessions_open(space_geohash5);
