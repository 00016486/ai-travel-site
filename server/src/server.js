const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

[
  path.join(__dirname, "..", ".env"),
  path.join(__dirname, "..", "..", "client", ".env"),
  path.join(__dirname, "..", "..", "admin-panel", ".env")
].forEach((envPath) => {
  dotenv.config({ path: envPath, override: false });
});

const app = express();
const DEFAULT_PORT = 8888;
const PORT = Number(process.env.PORT) || DEFAULT_PORT;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN || "http://localhost:5173";

// CORS – allow configured origins + any localhost port in dev
app.use(
  cors({
    origin: (origin, callback) => {
      // Server-to-server / curl / Postman: no Origin header
      if (!origin) {
        return callback(null, true);
      }

      const allowed = [FRONTEND_ORIGIN, ADMIN_ORIGIN];

      // Exact match with configured frontends
      if (allowed.includes(origin)) {
        return callback(null, true);
      }

      // Any localhost port (useful during dev: 3000, 5173, 5175, etc.)
      if (origin.startsWith("http://localhost:")) {
        return callback(null, true);
      }

      // Everything else is blocked
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
  })
);
app.use(express.json());

// In‑memory storage (users, reviews, payments, cards, contacts – demo / dev only)
const users = [];
const reviews = [];
const payments = [];
const contacts = [];
const userEvents = [];
const paymentCards = [];
const PRO_GENERATION_LIMIT = 25;

function createId(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function createToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function recordUserEvent(userId, type, message) {
  userEvents.push({
    id: createId("e"),
    userId,
    type,
    message,
    createdAt: new Date().toISOString()
  });
}

function auth(requiredRole = null) {
  return (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing token" });
    }
    const token = header.slice(7);
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (requiredRole && payload.role !== requiredRole) {
        return res.status(403).json({ error: "Forbidden" });
      }
      req.user = payload;
      next();
    } catch {
      return res.status(401).json({ error: "Invalid token" });
    }
  };
}

function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    req.user = null;
    return next();
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    req.user = null;
    return next();
  }
}

function getUserById(userId) {
  return users.find((u) => u.id === userId) || null;
}

function isProActive(user) {
  if (!user || user.proTier !== "PRO" || !user.proActivatedAt || !user.proExpiresAt) return false;
  const now = new Date();
  return new Date(user.proActivatedAt) <= now && now <= new Date(user.proExpiresAt);
}

function getProStatusPayload(user) {
  const used = Number(user?.proGenerationsUsed || 0);
  const active = isProActive(user);
  return {
    active,
    tier: user?.proTier || null,
    generationsUsed: used,
    generationsLimit: PRO_GENERATION_LIMIT,
    generationsLeft: Math.max(0, PRO_GENERATION_LIMIT - used),
    proActivatedAt: user?.proActivatedAt || null,
    proExpiresAt: user?.proExpiresAt || null
  };
}

function incrementProGenerationAndMaybeDisable(user) {
  if (!user || !isProActive(user)) return;
  user.proGenerationsUsed = Number(user.proGenerationsUsed || 0) + 1;
  if (user.proGenerationsUsed >= PRO_GENERATION_LIMIT) {
    user.proTier = null;
    user.proActivatedAt = null;
    user.proExpiresAt = null;
    recordUserEvent(user.id, "subscription_finished", `PRO auto-disabled after ${PRO_GENERATION_LIMIT} generated tours`);
  }
}

function ensureAdminSeed() {
  const admin = users.find((u) => u.role === "ADMIN");
  if (admin) return;
  const id = createId("u");
  const passwordHash = bcrypt.hashSync("admin111", 10);
  users.push({
    id,
    email: "admin@tourly.local",
    passwordHash,
    name: "Super Admin",
    role: "ADMIN",
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
    proTier: null,
    proActivatedAt: null,
    proExpiresAt: null,
    proGenerationsUsed: 0
  });
}

function seedDemoData() {
  if (reviews.length > 0) return;

  const admin = users.find((u) => u.role === "ADMIN");
  /* tours are in SQLite - demoTours removed */



  // Seed reviews (use slug as tourId to match DB tours)
  reviews.push(
      {
        id: createId("r"),
        tourId: "classic-heritage",
        name: "Laylo & Aziz",
        from: "Toshkent · Family",
        rating: 5,
        comment:
          "Classic Heritage turi bolalar bilan sayohat uchun juda mos bo‘ldi, hamma kunlar balanslangan.",
        createdAt: new Date().toISOString()
      },
      {
        id: createId("r"),
        tourId: "silk-road",
        name: "Anna",
        from: "Moskva · Solo",
        rating: 5,
        comment:
          "Ipak Yo‘li Premium marshruti juda boy dasturga ega, gidlar va logistika a‘lo darajada.",
        createdAt: new Date().toISOString()
      },
      {
        id: createId("r"),
        tourId: "culture-craft",
        name: "Omar & Sofia",
        from: "Dubai · Honeymoon",
        rating: 5,
        comment:
          "Culture & Craft marshruti hunarmandchilik va gastronomiya bo‘yicha juda boy dastur bo‘ldi.",
        createdAt: new Date().toISOString()
      }
    );

  // Seed demo users only; payments stay empty until real purchases happen
  if (payments.length === 0) {
    const baseDate = new Date();

    function addDemoUser({ email, name, monthsAgo, proMonths }) {
      const id = createId("u");
      const createdAt = new Date(
        baseDate.getFullYear(),
        baseDate.getMonth() - monthsAgo,
        baseDate.getDate()
      ).toISOString();

      const proActivatedAt =
        proMonths > 0
          ? new Date(
              baseDate.getFullYear(),
              baseDate.getMonth() - Math.max(monthsAgo - 1, 0),
              baseDate.getDate()
            ).toISOString()
          : null;

      const proExpiresAt =
        proMonths > 0
          ? new Date(
              baseDate.getFullYear(),
              baseDate.getMonth() + Math.max(proMonths - 1, 0),
              baseDate.getDate()
            ).toISOString()
          : null;

      const user = {
        id,
        email,
        passwordHash: bcrypt.hashSync("demo1234", 10),
        name,
        role: "USER",
        createdAt,
        lastLoginAt: createdAt,
        proTier: proMonths > 0 ? "PRO" : null,
        proActivatedAt,
        proExpiresAt,
        proGenerationsUsed: 0
      };
      users.push(user);

      if (proMonths > 0) {
        recordUserEvent(
          id,
          "subscription_started",
          `User started PRO plan (${proMonths} months)`
        );
      }
    }

    addDemoUser({
      email: "laylo@example.com",
      name: "Laylo",
      monthsAgo: 2,
      proMonths: 3
    });
    addDemoUser({
      email: "anna@example.com",
      name: "Anna",
      monthsAgo: 4,
      proMonths: 1
    });
    addDemoUser({
      email: "omar.sofia@example.com",
      name: "Omar & Sofia",
      monthsAgo: 1,
      proMonths: 0
    });
  }
}

// ---------- Auth ----------

app.post("/api/auth/register", (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(409).json({ error: "Email already in use" });
  }
  const id = createId("u");
  const passwordHash = bcrypt.hashSync(password, 10);
  const user = {
    id,
    email,
    passwordHash,
    name: name || null,
    role: "USER",
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
    proTier: null,
    proActivatedAt: null,
    proExpiresAt: null,
    proGenerationsUsed: 0
  };
  users.push(user);
  recordUserEvent(id, "registered", "User created an account");
  const token = createToken(user);
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }
  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const ok = bcrypt.compareSync(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = createToken(user);
  user.lastLoginAt = new Date().toISOString();
  recordUserEvent(user.id, "login", "User signed in");
  res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, role: user.role }
  });
});

// ---------- Authenticated user: payment card (demo, in‑memory) ----------

app.get("/api/me/payment-card", auth(), (req, res) => {
  const card = paymentCards.find((c) => c.userId === req.user.sub) || null;
  res.json(card);
});

app.post("/api/me/payment-card", auth(), (req, res) => {
  const { name, expiry, last4, masked, brand = "demo" } = req.body || {};
  if (!name || !expiry || !last4 || !masked) {
    return res
      .status(400)
      .json({ error: "name, expiry, last4 and masked are required" });
  }
  let card = paymentCards.find((c) => c.userId === req.user.sub);
  const now = new Date().toISOString();
  if (!card) {
    card = {
      id: createId("card"),
      userId: req.user.sub,
      name,
      expiry,
      last4,
      masked,
      brand,
      createdAt: now,
      updatedAt: now
    };
    paymentCards.push(card);
  } else {
    card.name = name;
    card.expiry = expiry;
    card.last4 = last4;
    card.masked = masked;
    card.brand = brand;
    card.updatedAt = now;
  }
  res.json(card);
});

app.delete("/api/me/payment-card", auth(), (req, res) => {
  const index = paymentCards.findIndex((c) => c.userId === req.user.sub);
  if (index !== -1) {
    paymentCards.splice(index, 1);
  }
  res.status(204).end();
});

app.get("/api/me/pro-status", auth(), (req, res) => {
  const user = getUserById(req.user.sub);
  if (!user) return res.status(404).json({ error: "User not found" });
  return res.json(getProStatusPayload(user));
});

app.post("/api/me/pro/activate", auth(), (req, res) => {
  const user = getUserById(req.user.sub);
  if (!user) return res.status(404).json({ error: "User not found" });
  const now = new Date();
  user.proTier = "PRO";
  user.proActivatedAt = now.toISOString();
  user.proExpiresAt = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()).toISOString();
  user.proGenerationsUsed = 0;
  recordUserEvent(user.id, "subscription_started", "User activated PRO plan");
  return res.json(getProStatusPayload(user));
});

// ---------- Tours & reviews – public ----------

app.get("/api/tours", (_req, res) => {
  res.json(db.getAllTours());
});

// All reviews across tours (used by public client homepage)
app.get("/api/reviews", (_req, res) => {
  res.json(reviews);
});

app.get("/api/tours/:slug", (req, res) => {
  const tour = db.getTourWithDetailsBySlug(req.params.slug);
  if (!tour) return res.status(404).json({ error: "Tour not found" });
  const tourReviews = reviews.filter((r) => r.tourId === tour.id);
  res.json({ ...tour, reviews: tourReviews });
});

app.post("/api/tours/:slug/reviews", (req, res) => {
  const tour = db.getTourBySlug(req.params.slug);
  if (!tour) return res.status(404).json({ error: "Tour not found" });

  const { name, from, rating, comment } = req.body;
  if (!rating || !comment) {
    return res.status(400).json({ error: "rating and comment are required" });
  }

  const review = {
    id: createId("r"),
    tourId: tour.id,
    name: name || "Guest",
    from: from || null,
    rating: Math.max(1, Math.min(5, Number(rating))),
    comment,
    createdAt: new Date().toISOString()
  };

  reviews.push(review);
  res.status(201).json(review);
});

// ---------- Public: contact form ----------

app.post("/api/contact", (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "message is required" });
  }
  if (!email && !phone) {
    return res.status(400).json({ error: "email or phone required" });
  }

  const entry = {
    id: createId("c"),
    name: name || null,
    email: email || null,
    phone: phone || null,
    subject: subject || null,
    message,
    createdAt: new Date().toISOString()
  };

  contacts.push(entry);
  res.status(201).json({ ok: true });
});

// ---------- Admin: tours CRUD ----------

app.get("/api/admin/tours", auth("ADMIN"), (_req, res) => {
  res.json(db.getAllTours(false));
});

app.get("/api/admin/tours/:id", auth("ADMIN"), (req, res) => {
  const tour = db.getTourById(req.params.id) || db.getTourBySlug(req.params.id, false);
  if (!tour) return res.status(404).json({ error: "Tour not found" });
  const full = db.getTourWithDetailsBySlug(tour.slug, false);
  res.json(full || tour);
});

app.post("/api/admin/tours", auth("ADMIN"), (req, res) => {
  const {
    title,
    slug,
    description,
    heroImageUrl,
    days,
    priceFromUsd,
    isPublished = true,
    tour_details: tourDetails
  } = req.body;
  if (!title || !slug || !description) {
    return res.status(400).json({ error: "title, slug, description required" });
  }
  if (db.getTourBySlug(slug, false)) {
    return res.status(409).json({ error: "Slug already exists" });
  }
  const id = slug;
  const tour = {
    id,
    slug,
    title,
    description,
    heroImageUrl: heroImageUrl || "",
    days: days || 1,
    priceFromUsd: priceFromUsd || 0,
    isPublished: !!isPublished,
    createdAt: new Date().toISOString()
  };
  db.insertTour(tour);
  if (tourDetails) {
    db.upsertTourDetails(id, tourDetails);
  }
  const full = db.getTourWithDetailsBySlug(slug, false);
  res.status(201).json(full || tour);
});

app.put("/api/admin/tours/:id", auth("ADMIN"), (req, res) => {
  const existing = db.getTourById(req.params.id);
  if (!existing) return res.status(404).json({ error: "Tour not found" });
  const payload = req.body;
  const updates = {
    title: payload.title,
    slug: payload.slug,
    description: payload.description,
    heroImageUrl: payload.heroImageUrl,
    days: payload.days,
    priceFromUsd: payload.priceFromUsd,
    isPublished: payload.isPublished
  };
  const tour = db.updateTour(req.params.id, updates);
  if (payload.tour_details) {
    db.upsertTourDetails(req.params.id, payload.tour_details);
  }
  res.json(db.getTourWithDetailsBySlug(tour.slug, false) || tour);
});

app.delete("/api/admin/tours/:id", auth("ADMIN"), (req, res) => {
  if (!db.deleteTour(req.params.id)) return res.status(404).json({ error: "Tour not found" });
  res.status(204).end();
});

// ---------- Admin: reviews CRUD ----------

app.get("/api/admin/reviews", auth("ADMIN"), (_req, res) => {
  res.json(reviews);
});

app.post("/api/admin/reviews", auth("ADMIN"), (req, res) => {
  const { tourId, name, from, rating, comment } = req.body;
  if (!tourId || !rating || !comment) {
    return res.status(400).json({ error: "tourId, rating, comment required" });
  }
  const tour = db.getTourById(tourId);
  if (!tour) {
    return res.status(404).json({ error: "Tour not found" });
  }

  const review = {
    id: createId("r"),
    tourId,
    name: name || "Guest",
    from: from || null,
    rating: Math.max(1, Math.min(5, Number(rating))),
    comment,
    createdAt: new Date().toISOString()
  };

  reviews.push(review);
  res.status(201).json(review);
});

app.put("/api/admin/reviews/:id", auth("ADMIN"), (req, res) => {
  const review = reviews.find((r) => r.id === req.params.id);
  if (!review) return res.status(404).json({ error: "Review not found" });

  const payload = req.body;
  Object.assign(review, {
    name: payload.name ?? review.name,
    from: payload.from ?? review.from,
    rating:
      payload.rating === undefined
        ? review.rating
        : Math.max(1, Math.min(5, Number(payload.rating))),
    comment: payload.comment ?? review.comment
  });

  res.json(review);
});

app.delete("/api/admin/reviews/:id", auth("ADMIN"), (req, res) => {
  const index = reviews.findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Review not found" });
  reviews.splice(index, 1);
  res.status(204).end();
});

// ---------- Admin: contacts ----------

app.get("/api/admin/contacts", auth("ADMIN"), (_req, res) => {
  const sorted = [...contacts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  res.json(sorted);
});

// ---------- Admin: stats ----------

app.get("/api/admin/stats", auth("ADMIN"), (_req, res) => {
  const userCount = users.length;
  const tourCount = db.getAllTours(false).length;
  const totalRevenue = payments
    .filter((p) => p.status === "SUCCESS")
    .reduce((sum, p) => sum + (p.amountUsd || 0), 0);
  const proToursOpened = users.reduce(
    (sum, u) => sum + Number(u.proGenerationsUsed || 0),
    0
  );
  res.json({ userCount, tourCount, totalRevenue, proToursOpened, payments });
});

// ---------- Admin: users & PRO overview ----------

app.get("/api/admin/users", auth("ADMIN"), (_req, res) => {
  const result = users.map((u) => {
    const userPayments = payments.filter((p) => p.userId === u.id);
    const successful = userPayments.filter((p) => p.status === "SUCCESS");
    const failed = userPayments.filter((p) => p.status === "FAILED");

    let proStatus = "none";
    const now = new Date();
    if (u.proTier && u.proActivatedAt && u.proExpiresAt) {
      const start = new Date(u.proActivatedAt);
      const end = new Date(u.proExpiresAt);
      if (start <= now && end >= now) {
        proStatus = "active";
      } else if (end < now) {
        proStatus = "expired";
      }
    }

    const events = userEvents
      .filter((e) => e.userId === u.id)
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 8);

    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      lastLoginAt: u.lastLoginAt || null,
      proTier: u.proTier,
      proActivatedAt: u.proActivatedAt,
      proExpiresAt: u.proExpiresAt,
      proGenerationsUsed: Number(u.proGenerationsUsed || 0),
      proToursOpened: Number(u.proGenerationsUsed || 0),
      proStatus,
      totalPayments: userPayments.length,
      successfulPayments: successful.length,
      failedPayments: failed.length,
      events
    };
  });

  res.json(result);
});

// ---------- AI: GROQ chat + tour/image generation ----------

const GROQ_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
const PEXELS_SEARCH_URL = "https://api.pexels.com/v1/search";
const TRANSPORT_MODES = ["train", "metro", "taxi", "car", "flight"];

function getGroqApiKey() {
  return (process.env.GROQ_API_KEY || "").trim();
}

function hasGroqApiKey() {
  return getGroqApiKey().length > 0;
}

function slugify(input) {
  return String(input)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function safeJsonParse(maybeJson) {
  if (typeof maybeJson !== "string") return null;
  try {
    return JSON.parse(maybeJson);
  } catch {
    // Try to extract the first {...} block if model added preamble
    const start = maybeJson.indexOf("{");
    const end = maybeJson.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(maybeJson.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function redactSecrets(text) {
  return String(text || "").replace(/gsk_[^\s"']+/g, "gsk_***").replace(/sk-[^\s"']+/g, "sk-***");
}

function imageIdentityKey(url) {
  try {
    const u = new URL(String(url || ""));
    return `${u.origin}${u.pathname}`;
  } catch {
    return String(url || "").split("?")[0];
  }
}

function getPexelsApiKey() {
  const candidates = [
    process.env.PEXELS_API_KEY,
    process.env.NEXT_PUBLIC_PEXELS_API_KEY,
    process.env.VITE_PEXELS_API_KEY
  ];
  for (const value of candidates) {
    const normalized = String(value || "").trim();
    if (normalized) return normalized;
  }
  return null;
}

const PEXELS_SAFE_FALLBACKS = [
  "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",
  "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg",
  "https://images.pexels.com/photos/21014/pexels-photo.jpg",
  "https://images.pexels.com/photos/175773/pexels-photo-175773.jpeg",
  "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg",
  "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg"
];

const REGION_IMAGE_KEYWORDS = {
  samarkand: ["samarkand", "registan"],
  bukhara: ["bukhara", "buxoro", "poi kalon", "ark"],
  khiva: ["khiva", "xiva", "itchan kala", "ichan qala"],
  tashkent: ["tashkent", "toshkent", "hazrati imam", "chorsu"],
  fergana: ["fergana", "fargona", "kokand", "rishtan", "margilan"],
  nukus: ["nukus", "savitsky", "karakalpakstan"],
  andijan: ["andijan", "andijon"],
  namangan: ["namangan"],
  jizzakh: ["jizzakh", "jizzax", "zaamin", "zomin"],
  navoi: ["navoi", "sarmishsoy", "rabati malik"],
  karshi: ["karshi", "qarshi", "shahrisabz"],
  termez: ["termez", "termiz", "fayoztepa"]
};

const INTEREST_IMAGE_KEYWORDS = {
  history: ["historical", "heritage", "architecture", "landmark", "old city"],
  nature: ["nature", "mountain", "lake", "park", "landscape"],
  gastronomy: ["food", "cuisine", "restaurant", "market", "dish"],
  family: ["family", "kids", "friendly", "park"],
  adventure: ["adventure", "hiking", "trekking", "desert", "jeep"],
  art: ["art", "museum", "gallery", "craft"],
  relax: ["relax", "spa", "resort", "wellness"]
};

function normalizeTokens(values = []) {
  return Array.from(
    new Set(
      (Array.isArray(values) ? values : [])
        .map((v) => normalizeUzbekPlaceNames(String(v || "").toLowerCase().trim()))
        .filter(Boolean)
    )
  );
}

function buildImageSearchContext(selectedRegions = [], selectedInterests = []) {
  const locationKeywords = normalizeTokens(
    selectedRegions.flatMap((id) => REGION_IMAGE_KEYWORDS[String(id || "").toLowerCase()] || [id])
  );
  const themeKeywords = normalizeTokens(
    selectedInterests.flatMap((id) => INTEREST_IMAGE_KEYWORDS[String(id || "").toLowerCase()] || [id])
  );
  return { locationKeywords, themeKeywords };
}

async function fetchPexelsPhotosByQuery(
  query,
  { perPage = 5, orientation = "landscape", requiredLocationKeywords = [] } = {}
) {
  const apiKey = getPexelsApiKey();
  if (!apiKey) return [];

  const original = String(query || "").trim();
  const q = normalizeUzbekPlaceNames(original);
  if (!q) return [];

  // Build keywords from both original and normalized query for alt-text matching
  const STOP_WORDS = new Set(["travel", "landmark", "tourism", "uzbekistan", "architecture", "photography", "photo", "image"]);
  const keywords = Array.from(
    new Set([...original.toLowerCase().split(/\s+/), ...q.toLowerCase().split(/\s+/)])
  ).filter((w) => w.length > 3 && !STOP_WORDS.has(w));

  const params = new URLSearchParams({
    query: q,
    per_page: String(Math.max(1, Math.min(20, perPage * 3))), // fetch more so we can filter
    orientation,
    size: "large"
  });

  try {
    const resp = await fetch(`${PEXELS_SEARCH_URL}?${params.toString()}`, {
      headers: { Authorization: apiKey }
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    const photos = Array.isArray(data?.photos) ? data.photos : [];

    // Filter: keep only photos whose alt text OR Pexels page URL contains at least one query keyword.
    // The Pexels page URL slug (e.g. /photo/registan-samarkand-12345/) reliably contains place names.
    const requiredLocations = normalizeTokens(requiredLocationKeywords);
    const matched = photos.filter((p) => {
      const alt = (p?.alt || "").toLowerCase();
      const pageUrl = (p?.url || "").toLowerCase();
      const hasQuerySignal =
        keywords.length === 0 || keywords.some((kw) => alt.includes(kw) || pageUrl.includes(kw));
      const hasLocationSignal =
        requiredLocations.length === 0 ||
        requiredLocations.some((kw) => alt.includes(kw) || pageUrl.includes(kw));
      return hasQuerySignal && hasLocationSignal;
    });

    // No fallback to unrelated photos — strict city-keyword matching only.
    return matched
      .map((p) => p?.src?.large2x || p?.src?.large || p?.src?.medium || p?.src?.original || null)
      .filter(Boolean)
      .slice(0, perPage);
  } catch {
    return [];
  }
}

function buildPexelsSearchPrompt(baseQuery, keys = []) {
  const normalizedBase = normalizeUzbekPlaceNames(String(baseQuery || "").trim());
  const normalizedKeys = Array.isArray(keys)
    ? keys
        .map((k) => normalizeUzbekPlaceNames(String(k || "").trim().toLowerCase()))
        .filter(Boolean)
    : [];
  const defaults = ["uzbekistan"];
  const tokens = Array.from(
    new Set([normalizedBase, ...normalizedKeys, ...defaults].filter(Boolean))
  );
  return tokens.join(" ");
}

async function resolvePexelsImageUrls(
  query,
  { count = 6, keys = [], requiredLocationKeywords = [] } = {}
) {
  const prompt = buildPexelsSearchPrompt(query, keys);
  if (!prompt) return [];
  if (!getPexelsApiKey()) {
    return PEXELS_SAFE_FALLBACKS.slice(0, Math.max(1, Math.min(count, 6)));
  }

  const collected = [];
  const collectedKeys = new Set();
  const candidates = Array.from(
    new Set([
      prompt,
      `${prompt} ancient landmarks`,
      `${prompt} historical places`,
      `${prompt} travel photography`
    ])
  );

  for (const candidate of candidates) {
    if (collected.length >= count) break;
    const found = await fetchPexelsPhotosByQuery(candidate, {
      perPage: Math.max(8, count * 2),
      orientation: "landscape",
      requiredLocationKeywords
    });
    for (const url of found) {
      const key = imageIdentityKey(url);
      if (!collectedKeys.has(key)) {
        collectedKeys.add(key);
        collected.push(url);
      }
      if (collected.length >= count) break;
    }
  }

  if (collected.length > 0) return collected.slice(0, count);
  return PEXELS_SAFE_FALLBACKS.slice(0, Math.max(1, Math.min(count, 6)));
}

function normalizeUzbekPlaceNames(query) {
  const map = {
    samarqand: "samarkand",
    buxoro: "bukhara",
    xiva: "khiva",
    toshkent: "tashkent",
    urganch: "urgench",
    qoqon: "kokand"
  };
  return String(query || "")
    .split(/\s+/)
    .map((word) => map[word.toLowerCase()] || word)
    .join(" ")
    .trim();
}

// Dedicated Pexels search endpoint
app.get("/api/pexels/search", async (req, res) => {
  const query = String(req.query.query || "").trim();
  const requested = Number(req.query.count || req.query.per_page || 6);
  const count = Math.max(1, Math.min(6, Number.isFinite(requested) ? requested : 6));
  const keys = String(req.query.keys || "")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
  if (!query) {
    return res.status(400).json({ error: "query is required" });
  }
  try {
    const resolvedQuery = buildPexelsSearchPrompt(query, keys);
    const collected = await resolvePexelsImageUrls(query, { count, keys });

    return res.json({
      query: resolvedQuery,
      count: collected.length,
      results: collected.slice(0, count),
      source: "pexels"
    });
  } catch (e) {
    return res.status(500).json({ error: String(e?.message || e) });
  }
});

function buildPollinationsImageUrl(prompt, opts = {}) {
  const { width = 1024, height = 1024, seed, model = "flux", enhance = true } = opts;
  const params = new URLSearchParams();
  params.set("width", String(width));
  params.set("height", String(height));
  params.set("model", model);
  params.set("enhance", enhance ? "true" : "false");
  if (typeof seed === "number") params.set("seed", String(seed));
  // Pollinations endpoint is safe to use directly as an <img src>.
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params.toString()}`;
}

async function groqChatCompletion({ model, messages, temperature = 0.4, maxTokens = 800, responseFormatJson }) {
  const apiKey = getGroqApiKey();
  if (!apiKey) throw new Error("GROQ_API_KEY is not configured");

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function fetchWithRetries(url, options, maxAttempts = 3) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        clearTimeout(timeout);
        return response;
      } catch (err) {
        clearTimeout(timeout);
        lastError = err;
        if (attempt < maxAttempts) {
          await sleep(250 * attempt);
          continue;
        }
      }
    }
    throw lastError || new Error("GROQ request failed");
  }

  const buildBody = (withJsonFormat) => {
    const body = { model: model || GROQ_MODEL, messages, temperature, max_tokens: maxTokens };
    if (withJsonFormat && responseFormatJson) {
      body.response_format = { type: "json_object" };
    }
    return body;
  };

  async function doRequest(withJsonFormat) {
    const resp = await fetchWithRetries(GROQ_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(buildBody(withJsonFormat))
    }, 3);

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      if (
        responseFormatJson &&
        withJsonFormat &&
        resp.status === 400 &&
        String(text).toLowerCase().includes("response_format")
      ) {
        return { __retryWithoutJsonFormat: true };
      }
      throw new Error(`GROQ API failed: ${resp.status} ${redactSecrets(text)}`.trim());
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("GROQ response missing content");
    return { content: String(content) };
  }

  if (responseFormatJson) {
    const first = await doRequest(true);
    if (first && first.__retryWithoutJsonFormat) {
      const second = await doRequest(false);
      return second.content;
    }
    return first.content;
  }

  const only = await doRequest(false);
  return only.content;
}

function detectTitleLang(text) {
  const s = String(text || "");
  if (/[а-яё]/i.test(s)) return "ru";
  if (/[ʻ’]/.test(s) || /(sh|ch|o'|g'|q)/i.test(s)) return "uz";
  return "en";
}

async function generateAiSessionTitle({ historyText, fallbackTitle }) {
  if (!hasGroqApiKey()) return fallbackTitle;
  const model = GROQ_MODEL;
  const lang = detectTitleLang(historyText);
  const system = `You generate concise chat titles for travel planning sessions.
Rules:
- Output only title text, no quotes, no markdown.
- 2 to 5 words, max 40 characters.
- Specific and human-friendly.
- Avoid generic titles like "New Trip".`;
  const user = `Language: ${lang}
Conversation summary:
${historyText}

Return one short title.`;
  try {
    const raw = await groqChatCompletion({
      model,
      temperature: 0.2,
      maxTokens: 20,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });
    const title = String(raw || "")
      .replace(/[\r\n]+/g, " ")
      .replace(/^["'`]+|["'`]+$/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 40);
    return title || fallbackTitle;
  } catch {
    return fallbackTitle;
  }
}

function localizedRecordSame(value) {
  const s = String(value ?? "");
  return { uz: s, ru: s, en: s };
}

// Translate a batch of short text fields into uz/ru/en in one Groq call.
// Returns an object keyed by the same keys as `texts`.
async function translateSummaryFields(texts, sourceLang = "en") {
  const keys = Object.keys(texts).filter((k) => texts[k]);
  if (keys.length === 0) return {};

  const inputJson = JSON.stringify(Object.fromEntries(keys.map((k) => [k, texts[k]])));
  const prompt = `You are a translation assistant. Translate the following JSON values into Uzbek (uz), Russian (ru), and English (en).
Return ONLY valid JSON with this structure: { "fieldName": { "uz": "...", "ru": "...", "en": "..." }, ... }
Do not add any extra text or markdown. Input:
${inputJson}`;

  try {
    const raw = await groqChatCompletion({
      model: GROQ_MODEL,
      temperature: 0.1,
      maxTokens: 800,
      responseFormatJson: true,
      messages: [{ role: "user", content: prompt }]
    });
    const parsed = safeJsonParse(raw);
    if (!parsed) return {};
    const result = {};
    for (const k of keys) {
      if (parsed[k] && typeof parsed[k] === "object") {
        result[k] = {
          uz: String(parsed[k].uz || texts[k]),
          ru: String(parsed[k].ru || texts[k]),
          en: String(parsed[k].en || texts[k])
        };
      }
    }
    return result;
  } catch {
    return {};
  }
}

function extractIntentFlags(text) {
  const t = String(text || "").trim().toLowerCase();
  const wantsImage =
    /^\/image\b/.test(t) ||
    t.includes("text-to-image") ||
    t.includes("rasm") ||
    t.includes("image") ||
    t.includes("generate image") ||
    t.includes("img ");

  const wantsTour =
    /^\/tour\b/.test(t) ||
    t.includes("tur generate") ||
    t.includes("tur yarat") ||
    t.includes("tur yaratish") ||
    t.includes("tour generate") ||
    t.includes("generate tour") ||
    t.includes("маршрут") && (t.includes("генер") || t.includes("сделай") || t.includes("создай")) ||
    (t.includes("itinerary") || t.includes("kunma") || t.includes("kunma-kun")) ||
    t.includes("tour yarat") ||
    (t.includes("маршрут") && (t.includes("сдел") || t.includes("сгенер") || t.includes("созд"))) ||
    t.includes("маршрут сдел") ||
    t.includes("itiner");

  return { wantsImage, wantsTour };
}

const DESTINATION_QUERY_MAP = [
  { key: "bukhara", aliases: ["buxoro", "bukhara", "бухара"], query: "Bukhara old city Uzbekistan" },
  { key: "samarkand", aliases: ["samarqand", "samarkand", "самарканд"], query: "Samarkand registan Uzbekistan" },
  { key: "khiva", aliases: ["xiva", "khiva", "хива"], query: "Khiva old town Uzbekistan" },
  { key: "tashkent", aliases: ["toshkent", "tashkent", "ташкент"], query: "Tashkent Uzbekistan city travel" }
];

function detectDestinationQuery(text) {
  const normalized = String(text || "").toLowerCase();
  const found = DESTINATION_QUERY_MAP.find((item) => item.aliases.some((alias) => normalized.includes(alias)));
  return found ? found.query : null;
}

async function generateTourAndSave({
  lang,
  selectedRegions,
  selectedInterests,
  selectedDuration,
  selectedDays = null,
  budgetUsd,
  userMessage,
  history = [],
  tierId = "standard",
  imageMode = "pexels" // pexels | pollinations | mixed
}) {
  // Adaptive pricing model: account for selected options and user context.
  const regionCount = Array.isArray(selectedRegions) ? selectedRegions.length : 0;
  const interestCount = Array.isArray(selectedInterests) ? selectedInterests.length : 0;
  const normalizedHistory = Array.isArray(history)
    ? history
        .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.text === "string")
        .map((m) => ({ role: m.role, text: String(m.text).trim() }))
        .filter((m) => m.text.length > 0)
    : [];
  const fullContextText = [...normalizedHistory.map((m) => m.text), String(userMessage || "")]
    .join(" ")
    .toLowerCase();
  const luxurySignal = /(lux|premium|vip|5\*|five star|люкс|роскош|премиум)/.test(fullContextText) ? 1.08 : 1;
  const baseDayPrice = Math.round(
    115 *
      (1 + Math.min(0.45, regionCount * 0.06)) *
      (1 + Math.min(0.35, interestCount * 0.045)) *
      luxurySignal
  );
  const tierMultiplier = (id) => (id === "economy" ? 0.85 : id === "premium" ? 1.35 : 1);

  const normalizedSelectedDays =
    typeof selectedDays === "number" && Number.isFinite(selectedDays)
      ? Math.max(1, Math.min(14, Math.round(selectedDays)))
      : null;

  // Also try to extract budget directly from userMessage text as a fallback
  // in case the client didn't parse it (e.g. "хочу тур на 1200 долларов").
  let rawBudgetFromMessage = null;
  if (userMessage) {
    const bm =
      String(userMessage).match(/(\d{2,6})\s*(?:dollar|доллар|usd|\$)/i) ||
      String(userMessage).match(/\$\s*(\d{2,6})/i) ||
      String(userMessage).match(/(\d{2,6})\s*\$/i);
    if (bm) rawBudgetFromMessage = parseInt(bm[1], 10);
  }

  // Also scan full chat history for budget mentions
  let rawBudgetFromHistory = null;
  for (const m of normalizedHistory) {
    const bm =
      String(m.text).match(/(\d{2,6})\s*(?:dollar|доллар|usd|\$)/i) ||
      String(m.text).match(/\$\s*(\d{2,6})/i) ||
      String(m.text).match(/(\d{2,6})\s*\$/i);
    if (bm) rawBudgetFromHistory = parseInt(bm[1], 10);
  }

  // Priority: explicit param > user message > chat history
  const normalizedBudget =
    (typeof budgetUsd === "number" && budgetUsd > 0 ? budgetUsd : null) ??
    rawBudgetFromMessage ??
    rawBudgetFromHistory ??
    null;

  const estimateTierPrice = (days, tier) => Math.round(days * baseDayPrice * tierMultiplier(tier));
  const estimateTierBundle = (days) => {
    const economy = estimateTierPrice(days, "economy");
    const standardRaw = estimateTierPrice(days, "standard");
    const standard = Math.max(standardRaw, economy + 60);
    const premiumRaw = estimateTierPrice(days, "premium");
    const premium = Math.max(premiumRaw, standard + 100);
    return { economy, standard, premium };
  };

  // When a budget is available, build day candidates that MAXIMIZE the tour value
  // (most days + highest tier) while staying within budget.
  // When no budget: respect the wizard duration selection.
  const buildDayCandidates = () => {
    if (normalizedSelectedDays) {
      // User explicitly said "X days" in chat → honour it
      return [normalizedSelectedDays, Math.max(1, normalizedSelectedDays - 1)];
    }
    if (normalizedBudget) {
      // Budget-driven: try from 14 days down so we pick the most days that fit
      return Array.from({ length: 14 }, (_, i) => 14 - i); // [14, 13, ..., 1]
    }
    return selectedDuration === "medium"
      ? [6, 4]
      : selectedDuration === "long"
        ? [8, 6, 4]
        : selectedDuration === "short"
          ? [4]
          : [6, 4];
  };
  const dayCandidates = buildDayCandidates();

  // When a budget is given, always try premium → standard → economy
  // so we maximise quality instead of picking the cheapest fit.
  const preferred = String(tierId || "standard").toLowerCase();
  const tierCandidates = normalizedBudget
    ? ["premium", "standard", "economy"]
    : preferred === "premium"
      ? ["premium", "standard", "economy"]
      : preferred === "standard"
        ? ["standard", "economy", "premium"]
        : ["economy", "standard", "premium"];

  let dayCount = dayCandidates[0];
  let chosenTierId = preferred;
  let chosenPriceFromUsd = estimateTierBundle(dayCount)[chosenTierId] ?? estimateTierPrice(dayCount, chosenTierId);

  if (normalizedBudget) {
    let found = false;
    for (const d of dayCandidates) {
      for (const candTier of tierCandidates) {
        const estimated = estimateTierBundle(d)[candTier] ?? estimateTierPrice(d, candTier);
        if (estimated <= normalizedBudget) {
          dayCount = d;
          chosenTierId = candTier;
          chosenPriceFromUsd = estimated;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      // Budget too low for any candidate — use cheapest possible
      dayCount = 1;
      chosenTierId = "economy";
      chosenPriceFromUsd = estimateTierBundle(1).economy;
    }
  } else {
    chosenTierId = preferred;
    chosenPriceFromUsd = estimateTierBundle(dayCount)[chosenTierId] ?? estimateTierPrice(dayCount, chosenTierId);
  }

  const priceFromUsd = chosenPriceFromUsd;
  tierId = chosenTierId;

  const model = GROQ_MODEL;
  const regionsText = (selectedRegions || []).join(", ");
  const interestsText = (selectedInterests || []).join(", ");
  const compactHistoryText = normalizedHistory
    .slice(-24)
    .map((m, i) => `${i + 1}. ${m.role.toUpperCase()}: ${m.text}`)
    .join("\n");

  const planningInstruction = `Create an Uzbekistan travel tour plan for ${dayCount} days.
User language: ${lang}.
Selected regions (ids): ${regionsText || "(none)"}.
Selected interests (ids): ${interestsText || "(none)"}.
Duration choice (ids): ${selectedDuration || "(none)"}.
Exact day limit: ${normalizedSelectedDays ?? "(not provided)"}.
User budget (USD): ${typeof normalizedBudget === "number" ? normalizedBudget : "(not provided)"}.
Computed tour price: $${priceFromUsd} (MUST NOT exceed user budget).
Selected package tier: ${String(tierId || "standard").toLowerCase()}.

IMPORTANT: The tour MUST be realistic and achievable within $${normalizedBudget || priceFromUsd}.
- If budget is low, use budget hotels, shared transport, and affordable restaurants.
- If budget is high, include premium hotels, private transport, and fine dining.
- Always justify the price through the quality of accommodation, transport and activities chosen.

CRITICAL OVERRIDE RULE: The chat messages and the latest user message are the PRIMARY source of truth. If the user mentions destinations, duration, budget, interests or any preferences in chat that differ from the wizard selections above (Selected regions / interests / duration), the CHAT ALWAYS wins — ignore the wizard fields for those parameters and use what the user explicitly said.

Full chat history (read carefully to extract all user preferences):
${compactHistoryText || "(no prior chat history)"}

Latest user message (highest priority):
${userMessage || "(empty)"}`.trim();

  const tierLabel = String(tierId || "standard").toLowerCase();
  const diningGuide =
    tierLabel === "economy"
      ? "Budget eateries, local chaikhanas, street food stalls — keep meal costs $3–8 per person."
      : tierLabel === "premium"
        ? "Upscale restaurants, rooftop dining, hotel restaurants — $20–50 per person."
        : "Mid-range local restaurants and popular cafes — $8–18 per person.";

  const system = `You are Tourly.UZ AI — a detail-oriented travel planner for Uzbekistan.
Return ONLY valid JSON (no markdown, no extra text, no comments).
Rules:
- Itinerary: max 3 attractions per day, each with real, specific details.
- Dining: exactly 2-3 options per day matching the tier (${diningGuide}).
- Tips: short (1-2 sentences), practical insider info (opening hours, entry fee, dress code, best time to visit).
- Descriptions: informative but concise — 2-3 sentences per attraction.
- Use transport ONLY from: ${TRANSPORT_MODES.join(", ")}.
- Image queries: short English keywords for photo search (no URLs).
- "route" must list ALL cities in order separated by " → " (e.g. "Toshkent → Samarkand → Buxoro"). Never write just one city.
- "transport" must be a short human-readable phrase (e.g. "Poezd va taksi" / "Поезд и такси" / "Train and taxi") — NEVER write raw codes like "train|taxi|car".
- Write ALL text fields (title, subtitle, route, focus, transport, spotlight, logistics from/to/note, itinerary overview, attraction names/descriptions/tips, dining names/descriptions) in the user language: ${lang}.`;

  const user = `${planningInstruction}

Return JSON in this EXACT shape (no extra keys):
{
  "title": string,
  "subtitle": string,
  "route": string,
  "focus": string,
  "transport": string,
  "spotlight": string,
  "logistics": [
    { "from": string, "to": string, "transport": "train|metro|taxi|car|flight", "duration": string, "note": string|null }
  ],
  "itinerary": [
    {
      "dayNumber": number,
      "city": string,
      "overview": string,
      "dayImageQueries": string[],
      "dining": [
        {
          "name": string,
          "type": "breakfast|lunch|dinner|cafe|street_food",
          "description": string,
          "priceRange": "$|$$|$$$"
        }
      ],
      "attractions": [
        {
          "name": string,
          "description": string,
          "tip": string,
          "category": "mosque|museum|bazaar|fortress|park|viewpoint|palace|mausoleum|caravanserai|restaurant|other",
          "imageQuery": string
        }
      ]
    }
  ]
}`;

  const raw = await groqChatCompletion({
    model,
    temperature: 0.35,
    maxTokens: 3000,
    responseFormatJson: true,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ]
  });

  const plan = safeJsonParse(raw);
  if (!plan?.itinerary?.length) throw new Error("Failed to parse generated tour JSON");

  const title = String(plan.title || "AI Generated Tour");
  const slugBase = slugify(title) || "ai-tour";
  let slug = slugBase;
  let counter = 2;
  while (db.getTourBySlug(slug, false)) {
    slug = `${slugBase}-${counter++}`;
  }

  // Translate summary text fields into all three languages in one AI call
  const textsToTranslate = {
    subtitle: plan.subtitle || "",
    route: plan.route || "",
    focus: plan.focus || "",
    transport: plan.transport || "",
    spotlight: plan.spotlight || ""
  };
  const translations = await translateSummaryFields(textsToTranslate, lang);

  const summary = {
    title: localizedRecordSame(title),
    subtitle: translations.subtitle || localizedRecordSame(plan.subtitle || ""),
    route: translations.route || localizedRecordSame(plan.route || ""),
    focus: translations.focus || localizedRecordSame(plan.focus || ""),
    transport: translations.transport || localizedRecordSame(plan.transport || ""),
    spotlight: translations.spotlight || localizedRecordSame(plan.spotlight || "")
  };

  const logistics = Array.isArray(plan.logistics)
    ? plan.logistics.map((seg) => ({
        from: localizedRecordSame(seg.from || ""),
        to: localizedRecordSame(seg.to || ""),
        transport: TRANSPORT_MODES.includes(seg.transport) ? seg.transport : "car",
        duration: String(seg.duration || ""),
        ...(seg.note ? { note: localizedRecordSame(seg.note) } : {})
      }))
    : [];

  const imageSearchContext = buildImageSearchContext(selectedRegions, selectedInterests);

  const usedImageKeys = new Set();
  async function pickUniqueImage(query, keys = []) {
    const urls = await resolvePexelsImageUrls(query, {
      count: 8,
      keys: [...imageSearchContext.themeKeywords, ...keys],
      requiredLocationKeywords: imageSearchContext.locationKeywords
    });
    for (const url of urls) {
      const key = imageIdentityKey(url);
      if (!usedImageKeys.has(key)) {
        usedImageKeys.add(key);
        return url;
      }
    }
    if (urls[0]) {
      usedImageKeys.add(imageIdentityKey(urls[0]));
      return urls[0];
    }
    return null;
  }

  const itinerary = await Promise.all(plan.itinerary.map(async (day) => {
    const dayCity = String(day.city || "");
    const normalizedDayCity = normalizeUzbekPlaceNames(dayCity);
    const dayImageQueries =
      Array.isArray(day.dayImageQueries) && day.dayImageQueries.length > 0
        ? day.dayImageQueries.slice(0, 2).map((q) => `${normalizeUzbekPlaceNames(q)} ${normalizedDayCity}`).filter(Boolean)
        : [`${normalizedDayCity} Uzbekistan`];
    let dayImages = [];
    for (const query of dayImageQueries) {
      const imageUrl = await pickUniqueImage(query, [dayCity, "uzbekistan"]);
      if (imageUrl && !dayImages.includes(imageUrl)) dayImages.push(imageUrl);
      if (dayImages.length >= 2) break;
    }
    if (dayImages.length === 0) {
      const fallbackDayImage = await pickUniqueImage(`${normalizedDayCity} Uzbekistan`, [dayCity, "historical"]);
      dayImages = fallbackDayImage ? [fallbackDayImage] : [];
    }

    // Dining options
    const dining = Array.isArray(day.dining)
      ? day.dining.slice(0, 3).map((d) => ({
          name: localizedRecordSame(String(d.name || "")),
          type: String(d.type || "lunch"),
          description: localizedRecordSame(String(d.description || "")),
          priceRange: ["$", "$$", "$$$"].includes(d.priceRange) ? d.priceRange : "$$"
        }))
      : [];

    const attractions = Array.isArray(day.attractions)
      ? await Promise.all(day.attractions.slice(0, 3).map(async (a) => {
          const imgQuery = String(a.imageQuery || a.name || dayCity);
          // Keep query specific to the attraction + city (no generic "Uzbekistan travel")
          const normalizedCity = normalizeUzbekPlaceNames(dayCity);
          const pexelsPrompt = `${normalizeUzbekPlaceNames(imgQuery)} ${normalizedCity}`;
          const imageUrl = imageMode === "pollinations"
            ? buildPollinationsImageUrl(`${imgQuery} travel photography in Uzbekistan`, { width: 1024, height: 768 })
            : await pickUniqueImage(pexelsPrompt, [dayCity, "uzbekistan"]);
          return {
            name: localizedRecordSame(a.name || ""),
            description: localizedRecordSame(a.description || ""),
            tip: a.tip ? localizedRecordSame(String(a.tip)) : undefined,
            category: String(a.category || "other"),
            image: imageUrl
          };
        }))
      : [];

    return {
      dayNumber: Number(day.dayNumber || 0),
      city: localizedRecordSame(dayCity),
      overview: day.overview ? localizedRecordSame(String(day.overview)) : undefined,
      images: dayImages,
      dining,
      attractions
    };
  }));

  const heroQuery = `${summary.title[lang]} Uzbekistan travel ${summary.focus[lang]}`.trim();
  const heroImageUrl =
    imageMode === "pollinations"
      ? buildPollinationsImageUrl(`${heroQuery} cinematic travel poster`, { width: 1600, height: 900, seed: 42, model: "flux" })
      : await pickUniqueImage(`${heroQuery} realistic travel`, ["uzbekistan"]);

  db.insertTour({
    id: slug,
    slug,
    title,
    description: String(plan.subtitle || plan.focus || ""),
    heroImageUrl,
    days: dayCount,
    priceFromUsd,
    classType: tierId ? tierId.toUpperCase() : "STANDARD",
    isPublished: true,
    createdAt: new Date().toISOString()
  });

  db.upsertTourDetails(slug, {
    summary,
    logistics,
    itinerary
  });

  const previewPool = [
    heroImageUrl,
    ...itinerary.flatMap((day) => day.images || []),
    ...itinerary.flatMap((day) => (day.attractions || []).map((a) => a.image).filter(Boolean))
  ].filter(Boolean);
  const previewSeen = new Set();
  const previewImageUrls = [];
  for (const url of previewPool) {
    const key = imageIdentityKey(url);
    if (previewSeen.has(key)) continue;
    previewSeen.add(key);
    previewImageUrls.push(url);
    if (previewImageUrls.length >= 6) break;
  }

  return {
    slug,
    tour: {
      slug,
      title,
      heroImageUrl,
      days: dayCount,
      priceFromUsd
    },
    imageUrls: previewImageUrls
  };
}

app.get("/api/ai/auth/status", (_req, res) => {
  res.json({ hasServerKey: hasGroqApiKey() });
});

app.post("/api/ai/tours/generate", optionalAuth, async (req, res) => {
  if (!hasGroqApiKey()) return res.status(503).json({ error: "AI service is not configured" });

  const {
    lang = "uz",
    selectedRegions = [],
    selectedInterests = [],
    selectedDuration = null,
    selectedDays = null,
    budgetUsd = null,
    userMessage = "",
    history = [],
    tierId = "standard",
    imageMode = "pexels"
  } = req.body || {};

  try {
    const result = await generateTourAndSave({
      lang,
      selectedRegions,
      selectedInterests,
      selectedDuration,
      selectedDays: typeof selectedDays === "number" ? selectedDays : null,
      budgetUsd: typeof budgetUsd === "number" ? budgetUsd : null,
      userMessage,
      history,
      tierId,
      imageMode
    });
    if (req.user?.sub) {
      const user = getUserById(req.user.sub);
      if (user) {
        incrementProGenerationAndMaybeDisable(user);
      }
    }
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

function buildTripBuilderContextBlock({
  lang,
  step,
  selectedRegions,
  selectedInterests,
  selectedDuration,
  selectedDays,
  budgetUsd,
  tierId,
  imageMode
}) {
  const regions = Array.isArray(selectedRegions) ? selectedRegions.join(", ") : "";
  const interests = Array.isArray(selectedInterests) ? selectedInterests.join(", ") : "";
  const budgetLine =
    typeof budgetUsd === "number" && budgetUsd > 0 ? `$${budgetUsd}` : "(not set)";
  const daysLine =
    typeof selectedDays === "number" && Number.isFinite(selectedDays) ? String(selectedDays) : "(not set)";
  const parts = [];
  if (regions) parts.push(`Regions: ${regions}`);
  if (interests) parts.push(`Interests: ${interests}`);
  if (selectedDuration) parts.push(`Duration: ${selectedDuration}${daysLine !== "(not set)" ? ` (${daysLine}d)` : ""}`);
  if (budgetLine !== "(not set)") parts.push(`Budget: ${budgetLine}`);
  if (tierId && tierId !== "standard") parts.push(`Tier: ${tierId}`);
  return parts.length ? `Context: ${parts.join(" | ")}` : "";
}

app.post("/api/ai/chat", optionalAuth, async (req, res) => {
  const {
    message,
    userMessage: userMessageAlias,
    lang = "uz",
    step = 1,
    selectedRegions = [],
    selectedInterests = [],
    selectedDuration = null,
    selectedDays = null,
    history = [],
    budgetUsd = null,
    tierId = "standard",
    imageMode = "pexels"
  } = req.body || {};

  const text = String(message || userMessageAlias || "").trim();
  if (!text) return res.status(400).json({ error: "message is required" });

  const { wantsImage, wantsTour } = extractIntentFlags(text);

  // text-to-image: Pexels API
  if (wantsImage && !wantsTour) {
    const cleaned = text.replace(/^\/image\b/i, "").trim();
    const context = [
      selectedRegions?.length ? `regions: ${selectedRegions.join(", ")}` : null,
      selectedInterests?.length ? `interests: ${selectedInterests.join(", ")}` : null,
      selectedDuration ? `duration: ${selectedDuration}` : null
    ]
      .filter(Boolean)
      .join("; ");

    const prompt = `${cleaned || "Uzbekistan travel"} ${context}`.trim();
    const imageContext = buildImageSearchContext(selectedRegions, selectedInterests);
    const imageUrls = await resolvePexelsImageUrls(`${prompt} realistic travel photography`, {
      count: 6,
      keys: ["uzbekistan", ...imageContext.themeKeywords, ...selectedRegions],
      requiredLocationKeywords: imageContext.locationKeywords
    });

    const reply =
      lang === "ru"
        ? "Вот сгенерированные изображения по вашему запросу."
        : lang === "en"
          ? "Here are the generated images for your request."
          : "So‘rovingiz bo‘yicha generatsiya qilingan rasmlar mana:";

    return res.json({ reply, imageUrls });
  }

  // tour generation: GROQ AI + itinerary/images stored in DB
  if (wantsTour) {
    if (!hasGroqApiKey()) return res.status(503).json({ error: "AI service is not configured" });

    // Extract budget from user message text if not provided by client
    let resolvedBudget = typeof budgetUsd === "number" && budgetUsd > 0 ? budgetUsd : null;
    if (!resolvedBudget) {
      const allText = [text, ...Array.isArray(history) ? history.map((m) => String(m.text || "")) : []].join(" ");
      const bm =
        allText.match(/(\d{2,6})\s*(?:dollar|доллар|usd|\$)/i) ||
        allText.match(/\$\s*(\d{2,6})/i) ||
        allText.match(/(\d{2,6})\s*\$/i);
      if (bm) resolvedBudget = parseInt(bm[1], 10);
    }

    try {
      const result = await generateTourAndSave({
        lang,
        selectedRegions,
        selectedInterests,
        selectedDuration,
        selectedDays: typeof selectedDays === "number" ? selectedDays : null,
        budgetUsd: resolvedBudget,
        userMessage: text,
        history,
        tierId: String(tierId || "standard").toLowerCase(),
        imageMode
      });
      if (req.user?.sub) {
        const user = getUserById(req.user.sub);
        if (user) {
          incrementProGenerationAndMaybeDisable(user);
        }
      }
      const reply =
        lang === "ru"
          ? `Отлично, я собрал для вас маршрут "${result.tour.title}"! Открываю тур — посмотрите, что получилось 😊`
          : lang === "en"
            ? `Your trip "${result.tour.title}" is ready! Let me open it for you now 😊`
            : `"${result.tour.title}" turini tayyorladim! Hozir ochib ko'rsataman 😊`;
      return res.json({ reply, tour: result.tour, imageUrls: result.imageUrls });
    } catch (e) {
      return res.status(500).json({ error: String(e?.message || e) });
    }
  }

  // default: text-to-text chat via GROQ
  if (!hasGroqApiKey()) return res.status(503).json({ error: "AI service is not configured" });

  const model = GROQ_MODEL;
  // Pick up budget from message text if client didn't send it
  let chatBudget = typeof budgetUsd === "number" && budgetUsd > 0 ? budgetUsd : null;
  if (!chatBudget) {
    const bm =
      text.match(/(\d{2,6})\s*(?:dollar|доллар|usd|\$)/i) ||
      text.match(/\$\s*(\d{2,6})/i) ||
      text.match(/(\d{2,6})\s*\$/i);
    if (bm) chatBudget = parseInt(bm[1], 10);
  }
  const budgetContext = chatBudget
    ? `\nUser budget: $${chatBudget} (ALREADY PROVIDED — never ask again).`
    : "";
  const tierContext = tierId && tierId !== "standard" ? `\nSelected tier: ${tierId}.` : "";
  const tripContext = buildTripBuilderContextBlock({
    lang,
    step,
    selectedRegions,
    selectedInterests,
    selectedDuration,
    selectedDays,
    budgetUsd,
    tierId,
    imageMode
  });

  const system = `You are the Tourly.UZ AI — a sharp, friendly Uzbekistan travel assistant.
Reply in ${lang === "uz" ? "Uzbek" : lang === "ru" ? "Russian" : "English"}.${tripContext ? "\n" + tripContext : ""}${budgetContext}${tierContext}
PRIORITY RULE: The user's chat messages are the single source of truth. If the user mentions destinations, duration, budget, interests or any travel detail in chat that differs from or contradicts the Context above, ALWAYS go with what the user says in chat — treat the wizard selections as background hints only and override them completely whenever the user's words say otherwise.
Rules: MAX 2 short sentences. Be warm and natural like a friend. Ask ONE question at a time (destination→interests→duration→budget). Never list itineraries or prices. Once user has shared enough, suggest picking a package (Start/Standard/Premium).`;

  const mappedHistory = Array.isArray(history)
    ? history
        .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.text === "string")
        .map((m) => ({ role: m.role, content: m.text }))
    : [];
  const lastHistory = mappedHistory[mappedHistory.length - 1];
  const shouldAppendUserText =
    !(lastHistory && lastHistory.role === "user" && String(lastHistory.content || "").trim() === text);

  try {
    const raw = await groqChatCompletion({
      model,
      temperature: 0.4,
      maxTokens: 80,
      messages: [
        { role: "system", content: system },
        ...mappedHistory.slice(-6),
        ...(shouldAppendUserText ? [{ role: "user", content: text }] : [])
      ]
    });
    const destinationQuery = detectDestinationQuery(text);
    const imageContext = buildImageSearchContext(selectedRegions, selectedInterests);
    const imageUrls = destinationQuery
      ? await resolvePexelsImageUrls(`${destinationQuery} realistic travel photography`, {
          count: 6,
          keys: ["uzbekistan", ...imageContext.themeKeywords, ...selectedRegions],
          requiredLocationKeywords: imageContext.locationKeywords
        })
      : [];
    res.json({ reply: raw, ...(imageUrls.length > 0 ? { imageUrls } : {}) });
  } catch (e) {
    res.status(500).json({ error: String(e?.message || e) });
  }
});

// ---------- Chat history (auth required) ----------

app.get("/api/chat/sessions", auth(), (req, res) => {
  const sessions = db.listChatSessionsByUser(req.user.sub);
  res.json(sessions);
});

app.post("/api/chat/sessions", auth(), (req, res) => {
  const { title } = req.body || {};
  // Auto-number: "New Trip 1", "New Trip 2", ...
  const sessionCount = db.countUserSessions(req.user.sub);
  const sessionNumber = sessionCount + 1;
  const sessionTitle = (title && title !== "New Trip")
    ? title
    : `New Trip ${sessionNumber}`;

  const session = db.createChatSession({
    id: createId("cs"),
    userId: req.user.sub,
    title: sessionTitle,
    sessionNumber,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  res.status(201).json(session);
});

// Update session title and/or tour_slug
app.patch("/api/chat/sessions/:sessionId", auth(), (req, res) => {
  const { tourSlug, title } = req.body || {};
  const session = db.getChatSessionById(req.params.sessionId, req.user.sub);
  if (!session) return res.status(404).json({ error: "Session not found" });

  if (tourSlug) {
    db.updateChatSessionTourSlug(req.params.sessionId, req.user.sub, tourSlug);
  }
  if (title) {
    db.updateChatSessionTitle(req.params.sessionId, req.user.sub, title);
  }

  const updated = db.getChatSessionById(req.params.sessionId, req.user.sub);
  res.json(updated);
});

app.get("/api/chat/sessions/:sessionId/messages", auth(), (req, res) => {
  const messages = db.listChatMessagesBySession(req.params.sessionId, req.user.sub);
  if (!messages) return res.status(404).json({ error: "Session not found" });
  res.json(messages);
});

app.post("/api/chat/sessions/:sessionId/messages", auth(), async (req, res) => {
  const { role, text } = req.body || {};
  if (!role || !text) return res.status(400).json({ error: "role and text are required" });
  if (role !== "user" && role !== "assistant") {
    return res.status(400).json({ error: "role must be user or assistant" });
  }

  const session = db.getChatSessionById(req.params.sessionId, req.user.sub);
  if (!session) return res.status(404).json({ error: "Session not found" });

  const message = db.addChatMessage({
    id: createId("cm"),
    sessionId: req.params.sessionId,
    role,
    text
  });
  db.touchChatSession(req.params.sessionId, req.user.sub);

  // AI-driven session title for history sidebar.
  if (role === "user") {
    const currentTitle = String(session.title || "").trim();
    const shouldRetitle =
      !currentTitle ||
      currentTitle === "New Trip" ||
      /^New Trip \d+$/.test(currentTitle) ||
      /^\d{2,5}$/.test(currentTitle);

    if (shouldRetitle) {
      const timeline = db.listChatMessagesBySession(req.params.sessionId, req.user.sub) || [];
      const compact = timeline
        .slice(-10)
        .map((m) => `${m.role.toUpperCase()}: ${String(m.text || "").trim()}`)
        .join("\n");
      const normalized = String(text).replace(/\s+/g, " ").trim();
      const fallbackTitle = normalized.length > 40 ? `${normalized.slice(0, 40).trim()}...` : normalized || "New Trip";
      const aiTitle = await generateAiSessionTitle({
        historyText: compact || normalized,
        fallbackTitle
      });
      if (aiTitle) db.updateChatSessionTitle(req.params.sessionId, req.user.sub, aiTitle);
    }
  }

  res.status(201).json(message);
});

// ---------- Health ----------

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

ensureAdminSeed();
seedDemoData();

function startServer(preferredPort) {
  const server = app.listen(preferredPort, () => {
    console.log(`Server listening on http://localhost:${preferredPort}`);
  });

  server.on("error", (error) => {
    if (error.code !== "EADDRINUSE") {
      throw error;
    }

    const nextPort = preferredPort + 1;
    console.warn(`Port ${preferredPort} is busy, retrying on ${nextPort}...`);
    startServer(nextPort);
  });
}

startServer(PORT);

