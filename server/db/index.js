const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "tourly.db");
const db = new Database(DB_PATH);

function runSchema() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);

  // Remove retired tours from DB (details first — FK to chat not on tours; tour_details refs tours)
  for (const id of ["desert-art", "weekend-samarkand", "luxury-cities"]) {
    try {
      db.prepare("DELETE FROM tour_details WHERE tour_id = ?").run(id);
      db.prepare("DELETE FROM tours WHERE id = ?").run(id);
    } catch {
      /* ignore */
    }
  }

  // Fix broken carousel images for classic-heritage in existing DB rows
  try {
    db.prepare(
      `UPDATE tour_details
       SET itinerary_json = REPLACE(
         REPLACE(
           REPLACE(
             REPLACE(
               REPLACE(itinerary_json,
                 'https://uzbekistan.travel/storage/app/media/places/xazrati_imam_complex/thumb_131_1140_0_0_0_auto.jpg',
                 '/classic-heritage-tashkent.png'
               ),
               'https://uzbekistan.travel/storage/app/media/places/bibi_khanym_mosque/bibi-khanum-samarkand.jpg',
               '/classic-heritage-samarkand.png'
             ),
             'https://www.afisha.uz/uploads/media/2024/07/ae465a3e0772936e23b895d095087de8.jpg',
             '/classic-heritage-tashkent-2.png'
           ),
           '/classic-heritage-samarkand.png',
           '/classic-heritage-samarkand-2.png'
         ),
         '/classic-heritage-tashkent.png',
         '/classic-heritage-tashkent-2.png'
       )
       WHERE tour_id = 'classic-heritage'`
    ).run();
  } catch {
    /* ignore */
  }

  // Fix remaining broken Tashkent image in other seeded tours (e.g. silk-road)
  try {
    db.prepare(
      `UPDATE tour_details
       SET itinerary_json = REPLACE(
         itinerary_json,
         'https://uzbekistan.travel/storage/app/media/places/xazrati_imam_complex/thumb_131_1140_0_0_0_auto.jpg',
         '/classic-heritage-tashkent-2.png'
       )`
    ).run();
  } catch {
    /* ignore */
  }

  // Apply curated image replacements for silk-road carousel slots (3/5, 4/5, 5/5)
  try {
    db.prepare(
      `UPDATE tour_details
       SET itinerary_json = REPLACE(
         REPLACE(
           REPLACE(itinerary_json,
             'https://uzbekistan.travel/storage/app/media/places/amir_temur_square/thumb_133_1140_0_0_0_auto.jpg',
             '/silk-road-tashkent-3.png'
           ),
           'https://uzbekistan.travel/storage/app/media/places/registan_square/registan-samarkand.jpg',
           '/silk-road-samarkand-4.png'
         ),
         'https://uzbekistan.travel/storage/app/media/places/shahi_zinda/shahi-zinda-samarkand.jpg',
         '/silk-road-samarkand-5.png'
       )
       WHERE tour_id = 'silk-road'`
    ).run();
  } catch {
    /* ignore */
  }

  // Apply curated replacements for culture-craft blank Samarkand slides (4/5, 5/5)
  try {
    db.prepare(
      `UPDATE tour_details
       SET itinerary_json = REPLACE(
         REPLACE(itinerary_json,
           'https://uzbekistan.travel/storage/app/media/places/registan_square/registan-samarkand.jpg',
           '/culture-craft-samarkand-4.png'
         ),
         'https://uzbekistan.travel/storage/app/media/places/shahi_zinda/shahi-zinda-samarkand.jpg',
         '/culture-craft-samarkand-5.png'
       )
       WHERE tour_id = 'culture-craft'`
    ).run();
  } catch {
    /* ignore */
  }

  // Migrations: add new columns to existing tables safely
  const migrations = [
    "ALTER TABLE chat_sessions ADD COLUMN tour_slug TEXT DEFAULT NULL",
    "ALTER TABLE chat_sessions ADD COLUMN session_number INTEGER DEFAULT NULL"
  ];
  for (const sql of migrations) {
    try { db.exec(sql); } catch { /* column already exists */ }
  }
}

function rowToTour(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    heroImageUrl: row.hero_image_url || "",
    image: row.hero_image_url || "",
    days: row.days,
    priceFromUsd: row.price_from_usd,
    classType: row.class_type,
    isPublished: !!row.is_published,
    createdAt: row.created_at
  };
}

function getAllTours(publishedOnly = true) {
  const stmt = publishedOnly
    ? db.prepare("SELECT * FROM tours WHERE is_published = 1 ORDER BY created_at ASC")
    : db.prepare("SELECT * FROM tours ORDER BY created_at ASC");
  return stmt.all().map(rowToTour);
}

function getTourBySlug(slug, publishedOnly = true) {
  const stmt = publishedOnly
    ? db.prepare("SELECT * FROM tours WHERE slug = ? AND is_published = 1")
    : db.prepare("SELECT * FROM tours WHERE slug = ?");
  const row = stmt.get(slug);
  return row ? rowToTour(row) : null;
}

function getTourById(id) {
  const row = db.prepare("SELECT * FROM tours WHERE id = ?").get(id);
  return row ? rowToTour(row) : null;
}

function getTourWithDetailsBySlug(slug, publishedOnly = true) {
  const tour = getTourBySlug(slug, publishedOnly);
  if (!tour) return null;

  const detailRow = db
    .prepare("SELECT summary_json, logistics_json, itinerary_json FROM tour_details WHERE tour_id = ?")
    .get(tour.id);

  const tour_details = detailRow
    ? {
        summary: detailRow.summary_json ? JSON.parse(detailRow.summary_json) : null,
        logistics: detailRow.logistics_json ? JSON.parse(detailRow.logistics_json) : null,
        itinerary: detailRow.itinerary_json ? JSON.parse(detailRow.itinerary_json) : null
      }
    : null;

  return { ...tour, tour_details };
}

function insertTour(tour) {
  const stmt = db.prepare(`
    INSERT INTO tours (id, slug, title, description, hero_image_url, days, price_from_usd, class_type, is_published, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    tour.id,
    tour.slug,
    tour.title,
    tour.description,
    tour.heroImageUrl || tour.hero_image_url || "",
    tour.days || 1,
    tour.priceFromUsd ?? tour.price_from_usd ?? 0,
    tour.classType || tour.class_type || "STANDARD",
    tour.isPublished !== false ? 1 : 0,
    tour.createdAt || new Date().toISOString()
  );
}

function updateTour(id, updates) {
  const tour = getTourById(id);
  if (!tour) return null;

  const stmt = db.prepare(`
    UPDATE tours SET
      slug = COALESCE(?, slug),
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      hero_image_url = COALESCE(?, hero_image_url),
      days = COALESCE(?, days),
      price_from_usd = COALESCE(?, price_from_usd),
      class_type = COALESCE(?, class_type),
      is_published = CASE WHEN ? IS NULL THEN is_published ELSE ? END
    WHERE id = ?
  `);
  stmt.run(
    updates.slug ?? null,
    updates.title ?? null,
    updates.description ?? null,
    updates.heroImageUrl ?? updates.hero_image_url ?? null,
    updates.days ?? null,
    updates.priceFromUsd ?? updates.price_from_usd ?? null,
    updates.classType ?? updates.class_type ?? null,
    updates.isPublished === undefined ? null : updates.isPublished ? 1 : 0,
    updates.isPublished === undefined ? null : updates.isPublished ? 1 : 0,
    id
  );
  return getTourById(id);
}

function deleteTour(id) {
  const stmt = db.prepare("DELETE FROM tours WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
}

function upsertTourDetails(tourId, detail) {
  const summary = detail?.summary ? JSON.stringify(detail.summary) : null;
  const logistics = detail?.logistics ? JSON.stringify(detail.logistics) : null;
  const itinerary = detail?.itinerary ? JSON.stringify(detail.itinerary) : null;

  const stmt = db.prepare(`
    INSERT INTO tour_details (tour_id, summary_json, logistics_json, itinerary_json)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(tour_id) DO UPDATE SET
      summary_json = excluded.summary_json,
      logistics_json = excluded.logistics_json,
      itinerary_json = excluded.itinerary_json
  `);
  stmt.run(tourId, summary, logistics, itinerary);
}

function createChatSession({ id, userId, title, createdAt, updatedAt, sessionNumber }) {
  const now = new Date().toISOString();
  const session = {
    id,
    userId,
    title: title || "New Trip",
    sessionNumber: sessionNumber ?? null,
    tourSlug: null,
    createdAt: createdAt || now,
    updatedAt: updatedAt || now
  };
  db.prepare(
    `INSERT INTO chat_sessions (id, user_id, title, session_number, tour_slug, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).run(session.id, session.userId, session.title, session.sessionNumber, session.tourSlug, session.createdAt, session.updatedAt);
  return session;
}

function updateChatSessionTourSlug(sessionId, userId, tourSlug) {
  db.prepare(
    `UPDATE chat_sessions SET tour_slug = ?, updated_at = ? WHERE id = ? AND user_id = ?`
  ).run(tourSlug, new Date().toISOString(), sessionId, userId);
}

function countUserSessions(userId) {
  const row = db.prepare(`SELECT COUNT(*) as c FROM chat_sessions WHERE user_id = ?`).get(userId);
  return row?.c ?? 0;
}

function updateChatSessionTitle(sessionId, userId, title) {
  db.prepare(`UPDATE chat_sessions SET title = ?, updated_at = ? WHERE id = ? AND user_id = ?`).run(
    title,
    new Date().toISOString(),
    sessionId,
    userId
  );
}

function touchChatSession(sessionId, userId) {
  db.prepare(`UPDATE chat_sessions SET updated_at = ? WHERE id = ? AND user_id = ?`).run(
    new Date().toISOString(),
    sessionId,
    userId
  );
}

function listChatSessionsByUser(userId) {
  const rows = db
    .prepare(
      `SELECT id, user_id, title, session_number, tour_slug, created_at, updated_at
       FROM chat_sessions
       WHERE user_id = ?
       ORDER BY datetime(updated_at) DESC`
    )
    .all(userId);
  return rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    title: r.title,
    sessionNumber: r.session_number ?? null,
    tourSlug: r.tour_slug ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }));
}

function getChatSessionById(sessionId, userId) {
  const r = db
    .prepare(
      `SELECT id, user_id, title, session_number, tour_slug, created_at, updated_at
       FROM chat_sessions
       WHERE id = ? AND user_id = ?`
    )
    .get(sessionId, userId);
  if (!r) return null;
  return {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    sessionNumber: r.session_number ?? null,
    tourSlug: r.tour_slug ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  };
}

function addChatMessage({ id, sessionId, role, text, createdAt }) {
  const msg = {
    id,
    sessionId,
    role,
    text,
    createdAt: createdAt || new Date().toISOString()
  };
  db.prepare(
    `INSERT INTO chat_messages (id, session_id, role, text, created_at) VALUES (?, ?, ?, ?, ?)`
  ).run(msg.id, msg.sessionId, msg.role, msg.text, msg.createdAt);
  return msg;
}

function listChatMessagesBySession(sessionId, userId) {
  const session = getChatSessionById(sessionId, userId);
  if (!session) return null;
  const rows = db
    .prepare(
      `SELECT id, session_id, role, text, created_at
       FROM chat_messages
       WHERE session_id = ?
       ORDER BY datetime(created_at) ASC`
    )
    .all(sessionId);
  return rows.map((r) => ({
    id: r.id,
    sessionId: r.session_id,
    role: r.role,
    text: r.text,
    createdAt: r.created_at
  }));
}

// Seed tours (from original demo data)
const SEED_TOURS = [
  {
    id: "classic-heritage",
    slug: "classic-heritage",
    title: "Classic Heritage",
    description: "Toshkent, Samarqand va Buxoro bo'ylab 6 kunlik klassik meros marshruti.",
    heroImageUrl: "https://i.pinimg.com/1200x/d1/29/82/d129822a2e000bff87a006931a840348.jpg",
    days: 6,
    priceFromUsd: 460,
    classType: "STANDARD",
    isPublished: true
  },
  {
    id: "silk-road",
    slug: "silk-road",
    title: "Silk Road Premium",
    description: "Toshkent–Samarqand–Buxoro–Xiva yo'nalishida 8 kunlik premium tur.",
    heroImageUrl: "https://i.pinimg.com/736x/99/03/2c/99032c67ee35c657d5b8b01a07e9203e.jpg",
    days: 8,
    priceFromUsd: 680,
    classType: "STANDARD",
    isPublished: true
  },
  {
    id: "culture-craft",
    slug: "culture-craft",
    title: "Culture & Craft",
    description: "Farg'ona vodiysi va Samarqand bo'ylab hunarmandchilik va gastronomiya.",
    heroImageUrl: "https://i.pinimg.com/1200x/52/48/19/5248199fd953810fe631d0e5dd0e1148.jpg",
    days: 5,
    priceFromUsd: 390,
    classType: "STANDARD",
    isPublished: true
  },
  {
    id: "fergana-discovery",
    slug: "fergana-discovery",
    title: "Fergana Valley Discovery",
    description: "Rishton, Qo'qon va Marg'ilonni o'z ichiga olgan 4 kunlik vodiya safari.",
    heroImageUrl: "https://www.advantour.com/img/kyrgyzstan/nature/kyrgyzstan-nature-gorges-canyons-valleys-fergana-valley.jpg",
    days: 4,
    priceFromUsd: 310,
    classType: "STANDARD",
    isPublished: true
  },
  {
    id: "mountain-retreat",
    slug: "mountain-retreat",
    title: "Mountain & Nature Retreat",
    description: "Chimyon va tog'li hududlarda ekoturizmga yo'naltirilgan 3 kunlik tur.",
    heroImageUrl: "https://images.wallpaperscraft.ru/image/single/gory_ozero_tsvety_204278_1920x1080.jpg",
    days: 3,
    priceFromUsd: 280,
    classType: "STANDARD",
    isPublished: true
  },
  {
    id: "budget-uzbekistan",
    slug: "budget-uzbekistan",
    title: "Budget Uzbekistan",
    description: "Byudjet variantlar bilan 5 kunlik klassik yo'nalishlar.",
    heroImageUrl: "https://static2.realting.com/uploads/images/a5a/02d87cdb6e7a1d5e07612b667cd81.webp",
    days: 5,
    priceFromUsd: 320,
    classType: "STANDARD",
    isPublished: true
  },
  {
    id: "family-escape",
    slug: "family-escape",
    title: "Family Uzbekistan Escape",
    description: "Bolali oilalar uchun moslashtirilgan, sokin tempdagi 6 kunlik tur.",
    heroImageUrl: "https://media.istockphoto.com/id/982881616/ru/photo/family-travel.jpg",
    days: 6,
    priceFromUsd: 430,
    classType: "STANDARD",
    isPublished: true
  }
];

function seedTours() {
  const count = db.prepare("SELECT COUNT(*) as c FROM tours").get().c;
  if (count > 0) return;

  const now = new Date().toISOString();
  for (const t of SEED_TOURS) {
    insertTour({ ...t, createdAt: now });
  }

  // Seed tour_details for tours with full detail (from client tour-detail-data structure)
  const seedDetails = require("./seed-details");
  seedDetails(db);
}

runSchema();
seedTours();

module.exports = {
  db,
  getAllTours,
  getTourBySlug,
  getTourById,
  getTourWithDetailsBySlug,
  insertTour,
  updateTour,
  deleteTour,
  upsertTourDetails,
  createChatSession,
  updateChatSessionTitle,
  updateChatSessionTourSlug,
  countUserSessions,
  touchChatSession,
  listChatSessionsByUser,
  getChatSessionById,
  addChatMessage,
  listChatMessagesBySession
};
