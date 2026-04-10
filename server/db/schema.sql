-- tours: base tour data
CREATE TABLE IF NOT EXISTS tours (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  hero_image_url TEXT DEFAULT '',
  days INTEGER DEFAULT 1,
  price_from_usd INTEGER DEFAULT 0,
  class_type TEXT DEFAULT 'STANDARD',
  is_published INTEGER DEFAULT 1,
  created_at TEXT NOT NULL
);
-- tour_details: extended data (summary, logistics, itinerary)
CREATE TABLE IF NOT EXISTS tour_details (
  tour_id TEXT PRIMARY KEY REFERENCES tours(id) ON DELETE CASCADE,
  summary_json TEXT,
  logistics_json TEXT,
  itinerary_json TEXT
);
-- Index for slug lookup
CREATE INDEX IF NOT EXISTS idx_tours_slug ON tours(slug);
CREATE INDEX IF NOT EXISTS idx_tours_published ON tours(is_published);
-- user chat sessions
CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user ON chat_sessions(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id, created_at ASC);
