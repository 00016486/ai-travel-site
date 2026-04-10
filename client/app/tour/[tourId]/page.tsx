"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { LANG_STORAGE_KEY, MainNavbar, NavItemId, LangCode } from "@/components/main-navbar";
import { readyTours, travelAgencies, type TravelAgency } from "@/lib/travel-data";
import { tourDetailData, transportModeLabel, type DayPlan, type DayDining, type TourDetail, type TransportMode, type AttractionCategory } from "@/lib/tour-detail-data";
import { getJsonOrNull } from "@/lib/api";
import { getMyProStatus } from "@/lib/ai";

const AUTH_KEY = "tourly_auth";
const PAYMENT_KEY = "tourly_has_payment_card";
const PRO_KEY = "tourly_pro_enabled";

type ApiTour = {
  id: string;
  slug: string;
  title: string;
  description: string;
  heroImageUrl?: string;
  days: number;
  priceFromUsd: number;
  tour_details?: {
    summary?: { title?: Record<LangCode, string>; subtitle?: Record<LangCode, string>; route?: Record<LangCode, string>; focus?: Record<LangCode, string>; transport?: Record<LangCode, string>; spotlight?: Record<LangCode, string> };
    logistics?: Array<{ from: Record<LangCode, string>; to: Record<LangCode, string>; transport: string; duration: string; note?: Record<LangCode, string> }>;
    itinerary?: DayPlan[];
  };
};

function normalizeTransportMode(mode: string): TransportMode {
  if (mode === "train" || mode === "metro" || mode === "taxi" || mode === "car" || mode === "flight") return mode;
  return "car";
}

function apiTourToBaseAndCopy(api: ApiTour): { baseTour: { id: string; title: string; days: number; image: string; priceFromUsd: number }; copy: TourDetail } {
  const baseTour = { id: api.slug, title: api.title, days: api.days, image: api.heroImageUrl || "", priceFromUsd: api.priceFromUsd };
  const s = api.tour_details?.summary ?? {};
  const copy: TourDetail = {
    id: api.slug,
    title: s.title ?? { uz: api.title, ru: api.title, en: api.title },
    subtitle: s.subtitle ?? { uz: api.description, ru: api.description, en: api.description },
    route: s.route ?? { uz: "", ru: "", en: "" },
    focus: s.focus ?? { uz: "", ru: "", en: "" },
    transport: s.transport ?? { uz: "", ru: "", en: "" },
    spotlight: s.spotlight ?? { uz: "", ru: "", en: "" },
    logistics: (api.tour_details?.logistics ?? []).map((seg) => ({ ...seg, transport: normalizeTransportMode(seg.transport) })),
    itinerary: api.tour_details?.itinerary
  };
  return { baseTour, copy };
}

function getLocalizedText(value: Record<LangCode, string> | undefined, lang: LangCode): string {
  if (!value) return "";
  return value[lang] || value.uz || value.ru || value.en || "";
}

// Translate pipe/comma-separated transport mode codes (e.g. "train|taxi|car") into human-readable text
const TRANSPORT_LABEL: Record<string, Record<LangCode, string>> = {
  train:  { uz: "Poezd",     ru: "Поезд",    en: "Train"  },
  metro:  { uz: "Metro",     ru: "Метро",     en: "Metro"  },
  taxi:   { uz: "Taksi",     ru: "Такси",     en: "Taxi"   },
  car:    { uz: "Avto",      ru: "Авто",      en: "Car"    },
  flight: { uz: "Samolyot",  ru: "Самолёт",  en: "Flight" },
};
function localizeTransportText(raw: string, lang: LangCode): string {
  const parts = raw.split(/[|,/]/).map((p) => p.trim().toLowerCase()).filter(Boolean);
  if (parts.length > 0 && parts.every((p) => TRANSPORT_LABEL[p])) {
    return parts.map((p) => TRANSPORT_LABEL[p][lang]).join(", ");
  }
  return raw;
}

function localizeDurationText(raw: string, lang: LangCode): string {
  const text = String(raw || "").trim();
  if (!text) return text;
  if (lang === "uz") return text;

  // Convert common Uzbek duration words in seeded data.
  if (lang === "ru") {
    return text
      .replace(/\bsoat\b/gi, "ч")
      .replace(/\bmin\b/gi, "мин");
  }

  return text
    .replace(/\bsoat\b/gi, "h")
    .replace(/\bmin\b/gi, "min");
}

// Build a full route string from logistics segments if the stored route looks incomplete
function getEffectiveRoute(copy: { route: Record<LangCode, string>; logistics: Array<{ from: Record<LangCode, string>; to: Record<LangCode, string> }> }, lang: LangCode): string {
  const stored = getLocalizedText(copy.route, lang);
  // If it already contains an arrow or has more than two words, it looks complete
  if (stored && (stored.includes("→") || stored.includes("->") || stored.trim().split(/\s+/).length > 2)) {
    return stored;
  }
  // Build from logistics
  if (copy.logistics && copy.logistics.length > 0) {
    const stops: string[] = [];
    for (const seg of copy.logistics) {
      const from = getLocalizedText(seg.from, lang);
      const to = getLocalizedText(seg.to, lang);
      if (from && !stops.includes(from)) stops.push(from);
      if (to && !stops.includes(to)) stops.push(to);
    }
    if (stops.length > 1) return stops.join(" → ");
  }
  return stored;
}

function handleImgError(e: SyntheticEvent<HTMLImageElement>, query = "uzbekistan travel") {
  const img = e.currentTarget;
  if (img.dataset.fallbackApplied) return;
  img.dataset.fallbackApplied = "1";
  const text = encodeURIComponent((query || "Image not found").slice(0, 50));
  img.src = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='1200' height='900'><rect width='100%' height='100%' fill='%23f1f5f9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='28' font-family='Arial, sans-serif'>${text}</text></svg>`;
}

// ─── Collect all tour images into one flat array ───────────────────────────────
const MAX_CAROUSEL_PHOTOS = 5;

function collectTourImages(heroImage: string, itinerary: DayPlan[] | undefined, lang: LangCode): { url: string; caption: string }[] {
  const seen = new Set<string>();
  const photos: { url: string; caption: string }[] = [];

  function add(url: string, caption: string) {
    if (!url || seen.has(url) || photos.length >= MAX_CAROUSEL_PHOTOS) return;
    seen.add(url);
    photos.push({ url, caption });
  }

  // Priority 1: hero image (no caption — let the title speak)
  if (heroImage) add(heroImage, "");

  if (itinerary) {
    // Priority 2: one image per day (labelled with city)
    for (const day of itinerary) {
      const city = getLocalizedText(day.city, lang);
      if (day.images[0]) add(day.images[0], city);
    }
    // Priority 3: fill remaining slots with attraction images
    for (const day of itinerary) {
      for (const attr of day.attractions) {
        if (attr.image) add(attr.image, getLocalizedText(attr.name, lang));
      }
    }
  }
  return photos;
}

// ─── Hero Carousel ─────────────────────────────────────────────────────────────
function HeroCarousel({ photos }: { photos: { url: string; caption: string }[] }) {
  const [idx, setIdx] = useState(0);

  if (photos.length === 0) return null;

  const prev = () => setIdx((i) => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx((i) => (i + 1) % photos.length);

  return (
    <div className="relative mt-3 overflow-hidden rounded-[22px] bg-[#0f172a] shadow-[0_20px_60px_rgba(15,23,42,0.28)] sm:mt-5 sm:rounded-[28px]">
      <div className="relative aspect-[4/3] w-full sm:aspect-[16/9]">
        <img
          key={idx}
          src={photos[idx].url}
          alt={photos[idx].caption}
          className="h-full w-full object-cover"
          onError={(e) => handleImgError(e, photos[idx].caption || "uzbekistan travel")}
        />

        {/* Gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        {/* Top-right counter */}
        <div className="absolute right-3.5 top-3.5 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
          {idx + 1} / {photos.length}
        </div>

        {/* Bottom overlay: caption + dots */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 sm:px-5 sm:pb-5">
          {photos[idx].caption && (
            <p className="mb-2.5 text-sm font-medium text-white/90 drop-shadow-sm sm:text-base">
              {photos[idx].caption}
            </p>
          )}
          {photos.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-label={`Image ${i + 1}`}
                  className={`rounded-full transition-all duration-200 ${
                    i === idx
                      ? "h-1.5 w-6 bg-white"
                      : "h-1.5 w-1.5 bg-white/40 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Left / Right arrows */}
        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous"
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/55 active:scale-95"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next"
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/55 active:scale-95"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Agency matching ───────────────────────────────────────────────────────────
function matchAgency(tourStops: string[], routeText: string, lang: LangCode): TravelAgency {
  const normalize = (s: string) => s.toLowerCase().replace(/[''`]/g, "'");
  const searchText = normalize([...tourStops, routeText].join(" "));
  let bestAgency = travelAgencies[0];
  let bestScore = 0;
  for (const agency of travelAgencies) {
    let score = 0;
    for (const dest of agency.destinations) {
      if (searchText.includes(normalize(dest))) score += 2;
    }
    for (const word of agency.specialty[lang].toLowerCase().split(/\s+/)) {
      if (word.length > 4 && searchText.includes(word)) score += 1;
    }
    if (score > bestScore) { bestScore = score; bestAgency = agency; }
  }
  return bestAgency;
}

const al = {
  recommendedAgency: { uz: "Tavsiya etilgan tur agentligi", ru: "Рекомендуемое турагентство", en: "Recommended Travel Agency" },
  agencySubtitle: {
    uz: "Tur yo'nalishlariga asoslanib AI tomonidan tanlangan eng mos agentlik.",
    ru: "Выбрано ИИ на основе направлений этого тура.",
    en: "Selected by AI based on this tour's destinations."
  },
  aiNote: { uz: "AI tahlili", ru: "Анализ ИИ", en: "AI match" },
  contactTitle: { uz: "Aloqa", ru: "Контакты", en: "Contact" },
  phone: { uz: "Telefon", ru: "Телефон", en: "Phone" },
  email: { uz: "Email", ru: "Эл. почта", en: "Email" },
  website: { uz: "Veb-sayt", ru: "Сайт", en: "Website" },
  address: { uz: "Manzil", ru: "Адрес", en: "Address" }
};

function RecommendedAgencySection({ tourStops, routeText, lang }: { tourStops: string[]; routeText: string; lang: LangCode }) {
  const agency = matchAgency(tourStops, routeText, lang);

  return (
    <section className="mt-6 border-t border-[#e8eeff] pt-6">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-[#0f172a]">{al.recommendedAgency[lang]}</h2>
      </div>
      <p className="mb-4 text-xs text-[#64748b]">{al.agencySubtitle[lang]}</p>

      <div className="rounded-2xl border border-[#e8eeff] bg-[#f8faff] p-4 sm:p-5">
        {/* Agency header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#191970] text-lg font-bold text-white shadow-[0_4px_14px_rgba(25,25,112,0.4)]">
            {agency.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-[#0f172a]">{agency.name}</p>
            <p className="mt-0.5 text-xs text-[#64748b]">{agency.specialty[lang]}</p>
          </div>
        </div>

        {/* Contact grid */}
        <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">{al.contactTitle[lang]}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { href: `tel:${agency.phone.replace(/\s/g, "")}`, label: al.phone[lang], value: agency.phone, icon: "📞" },
            { href: `mailto:${agency.email}`, label: al.email[lang], value: agency.email, icon: "✉️" },
            { href: `https://${agency.website}`, label: al.website[lang], value: agency.website, icon: "🌐", external: true },
            { href: undefined, label: al.address[lang], value: agency.address[lang], icon: "📍" }
          ].map(({ href, label, value, icon, external }) => {
            const cls = "flex items-center gap-2.5 rounded-xl border border-[#e2eaff] bg-white px-3 py-2.5 text-xs transition hover:bg-[#f3f7ff]";
            const inner = (
              <>
                <span className="text-base leading-none">{icon}</span>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#94a3b8]">{label}</p>
                  <p className="truncate font-semibold text-[#0f172a]">{value}</p>
                </div>
              </>
            );
            return href ? (
              <a key={label} href={href} className={cls} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                {inner}
              </a>
            ) : (
              <div key={label} className={cls}>{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Category / Dining constants ───────────────────────────────────────────────
const CATEGORY_ICONS: Record<AttractionCategory, string> = {
  mosque: "🕌", museum: "🏛️", bazaar: "🛍️", fortress: "🏰", park: "🌿",
  viewpoint: "🔭", palace: "🏯", mausoleum: "⭐", caravanserai: "🏕️",
  restaurant: "🍽️", other: "📍"
};

const DINING_TYPE_LABELS: Record<string, Record<LangCode, string>> = {
  breakfast: { uz: "Nonushta", ru: "Завтрак", en: "Breakfast" },
  lunch: { uz: "Tushlik", ru: "Обед", en: "Lunch" },
  dinner: { uz: "Kechki ovqat", ru: "Ужин", en: "Dinner" },
  cafe: { uz: "Kafe", ru: "Кафе", en: "Café" },
  street_food: { uz: "Ko'cha taomlari", ru: "Уличная еда", en: "Street food" }
};

const PRICE_LABEL: Record<string, Record<LangCode, string>> = {
  "$": { uz: "Arzon", ru: "Бюджетно", en: "Budget" },
  "$$": { uz: "O'rtacha", ru: "Средне", en: "Mid-range" },
  "$$$": { uz: "Qimmat", ru: "Дорого", en: "Upscale" }
};

function DiningCard({ dining, lang }: { dining: DayDining; lang: LangCode }) {
  const typeLabel = DINING_TYPE_LABELS[dining.type]?.[lang] ?? dining.type;
  const priceColor = dining.priceRange === "$" ? "text-[#16a34a] bg-[#f0fdf4]" : dining.priceRange === "$$$" ? "text-[#dc2626] bg-[#fef2f2]" : "text-[#d97706] bg-[#fffbeb]";
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-[#fde68a]/60 bg-[#fffef5] p-2.5">
      <span className="mt-0.5 text-base leading-none">🍴</span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="text-xs font-bold text-[#0f172a]">{getLocalizedText(dining.name, lang)}</p>
          <span className="rounded-full bg-[#f1f5f9] px-1.5 py-0.5 text-[10px] font-medium text-[#64748b]">{typeLabel}</span>
          <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${priceColor}`}>{dining.priceRange}</span>
        </div>
        <p className="mt-0.5 text-[11px] leading-relaxed text-[#64748b]">{getLocalizedText(dining.description, lang)}</p>
      </div>
    </div>
  );
}

// ─── Day Itinerary Card (text-only, minimal) ───────────────────────────────────
function DayItineraryCard({ plan, lang, labels }: {
  plan: DayPlan;
  lang: LangCode;
  labels: { day: string; attractionsOfDay: string; dining: string };
}) {
  const overview = plan.overview ? getLocalizedText(plan.overview, lang) : "";

  return (
    <div className="flex gap-4">
      {/* Timeline */}
      <div className="flex shrink-0 flex-col items-center">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#191970] text-xs font-bold text-white shadow-sm">
          {plan.dayNumber}
        </div>
        <div className="mt-2 w-px flex-1 bg-[#e2e8f0]" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pb-7">
        <h3 className="text-sm font-bold text-[#0f172a] sm:text-base">
          {labels.day} {plan.dayNumber} — {getLocalizedText(plan.city, lang)}
        </h3>
        {overview && (
          <p className="mt-1 text-xs leading-relaxed text-[#64748b] italic">{overview}</p>
        )}

        {/* Attractions */}
        {plan.attractions.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">{labels.attractionsOfDay}</p>
            {plan.attractions.map((a, i) => {
              const icon = CATEGORY_ICONS[(a.category ?? "other") as AttractionCategory] ?? "📍";
              const tip = a.tip ? getLocalizedText(a.tip, lang) : "";
              return (
                <div key={i} className="rounded-xl border border-[#e8eeff] bg-[#f8faff] p-3">
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0 text-base leading-none">{icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#0f172a]">{getLocalizedText(a.name, lang)}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#64748b]">{getLocalizedText(a.description, lang)}</p>
                      {tip && (
                        <p className="mt-1.5 flex items-center gap-1 text-[11px] italic text-[#3b82f6]">
                          <span>ℹ️</span> {tip}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Dining */}
        {plan.dining && plan.dining.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">🍽️ {labels.dining}</p>
            <div className="space-y-1.5">
              {plan.dining.map((d, i) => <DiningCard key={i} dining={d} lang={lang} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Transport icon ────────────────────────────────────────────────────────────
const TRANSPORT_EMOJI: Record<TransportMode, string> = {
  train: "🚆", metro: "🚇", taxi: "🚕", car: "🚗", flight: "✈️"
};

// ─── Dictionary ────────────────────────────────────────────────────────────────
const dictionary = {
  back: { uz: "Orqaga", ru: "Назад", en: "Back" },
  route: { uz: "Yo'nalish", ru: "Маршрут", en: "Route" },
  focus: { uz: "Fokus", ru: "Фокус", en: "Focus" },
  transport: { uz: "Transport", ru: "Транспорт", en: "Transport" },
  logistics: { uz: "Logistika", ru: "Логистика", en: "Logistics" },
  unlockCta: { uz: "To'liq rejani ochish", ru: "Открыть полный план", en: "Unlock full plan" },
  days: { uz: "kun", ru: "дн.", en: "days" },
  from: { uz: "dan boshlab", ru: "от", en: "from" },
  unlockedTitle: { uz: "Kunma-kun marshrut", ru: "Маршрут по дням", en: "Day-by-day itinerary" },
  day: { uz: "Kun", ru: "День", en: "Day" },
  attractionsOfDay: { uz: "Ko'rishga arziydi", ru: "Достопримечательности", en: "Attractions" },
  diningOfDay: { uz: "Ovqatlanish", ru: "Питание", en: "Dining" },
  standardClass: { uz: "Standard", ru: "Standard", en: "Standard" },
  loading: { uz: "Yuklanmoqda…", ru: "Загрузка…", en: "Loading…" },
  notFound: { uz: "Tur topilmadi", ru: "Тур не найден", en: "Tour not found" },
  navHome: { uz: "Bosh sahifa", ru: "Главная", en: "Home" },
  navAbout: { uz: "Biz haqimizda", ru: "О нас", en: "About" },
  navTours: { uz: "Yo'nalishlar", ru: "Направления", en: "Destinations" },
  navWhy: { uz: "Nega TOURLY.UZ?", ru: "Почему TOURLY.UZ?", en: "Why TOURLY" },
  createTrip: { uz: "Yangi Tur Yaratish", ru: "Создать Новый Тур", en: "Create a New Trip" },
  login: { uz: "Kirish", ru: "Войти", en: "Login" },
  stops: { uz: "Bekatchalar", ru: "Остановки", en: "Stops" }
};

// ─── Main page ─────────────────────────────────────────────────────────────────
export default function TourDetailPage() {
  const router = useRouter();
  const params = useParams<{ tourId?: string }>();
  const slug = params?.tourId as string | undefined;

  const [lang, setLang] = useState<LangCode>("uz");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [apiTour, setApiTour] = useState<{ baseTour: { id: string; title: string; days: number; image: string; priceFromUsd: number }; copy: TourDetail } | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const staticBaseTour = slug ? readyTours.find((t) => t.id === slug) : null;
  const staticCopy = slug ? tourDetailData[slug] : null;
  const baseTour = staticBaseTour ?? apiTour?.baseTour ?? null;
  const copy = staticCopy ?? apiTour?.copy ?? null;
  const t = dictionary;

  useEffect(() => {
    if (typeof window === "undefined" || !slug) return;
    if (staticBaseTour && staticCopy) return;
    setLoading(true);
    getJsonOrNull<ApiTour>(`/api/tours/${slug}`)
      .then((data) => { if (!data) { setNotFound(true); } else { setApiTour(apiTourToBaseAndCopy(data)); } })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug, staticBaseTour, staticCopy]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY) as LangCode | null;
    if (stored === "uz" || stored === "ru" || stored === "en") setLang(stored);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !slug || !baseTour || !copy) return;
    const auth = window.localStorage.getItem(AUTH_KEY);
    if (!auth) { router.replace(`/auth?redirect=${encodeURIComponent(`/tour/${slug}`)}`); return; }
    const hasCard = window.localStorage.getItem(PAYMENT_KEY) === "true";
    const hasPro = window.localStorage.getItem(PRO_KEY) === "true";
    if (!hasCard || !hasPro) return;
    try {
      const parsed = JSON.parse(auth) as { token?: string };
      const token = parsed?.token;
      if (!token) return;
      getMyProStatus(token)
        .then((status) => {
          if (!status.active) {
            window.localStorage.removeItem(PRO_KEY);
            return;
          }
          setIsUnlocked(true);
        })
        .catch(() => {
          setIsUnlocked(true);
        });
    } catch {
      setIsUnlocked(true);
    }
  }, [router, slug, baseTour, copy]);

  const handleNavClick = (id: NavItemId) => { window.location.href = `/#${id}`; };

  const handleUnlockClick = async () => {
    if (typeof window === "undefined" || !slug) return;
    const auth = window.localStorage.getItem(AUTH_KEY);
    const hasCard = window.localStorage.getItem(PAYMENT_KEY) === "true";
    const hasPro = window.localStorage.getItem(PRO_KEY) === "true";
    if (!auth) { router.push(`/auth?redirect=${encodeURIComponent(`/tour/${slug}`)}`); return; }
    if (!hasCard || !hasPro) { setShowModal(true); return; }
    try {
      const parsed = JSON.parse(auth) as { token?: string };
      const token = parsed?.token;
      if (token) {
        const status = await getMyProStatus(token);
        if (!status.active) {
          window.localStorage.removeItem(PRO_KEY);
          setShowModal(true);
          return;
        }
      }
    } catch {
      // If status check fails, keep existing local behavior.
    }
    setIsUnlocked(true);
  };

  const navLabels = { home: t.navHome[lang], about: t.navAbout[lang], tours: t.navTours[lang], why: t.navWhy[lang] };

  // ── Loading / not found state ─────────────────────────────────────────────
  if (!slug || !baseTour || !copy) {
    return (
      <div className="min-h-screen bg-[#f8faff]">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <MainNavbar lang={lang} labels={navLabels} onLangChange={setLang} createTripLabel={t.createTrip[lang]} onNavClick={handleNavClick} loginLabel={t.login[lang]} />
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-[#64748b]">{loading ? t.loading[lang] : notFound ? t.notFound[lang] : t.loading[lang]}</p>
            <button type="button" onClick={() => router.push("/")} className="mt-4 rounded-xl bg-[#191970] px-5 py-2 text-sm font-semibold text-white hover:bg-[#12124f]">
              {t.back[lang]}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const allPhotos = collectTourImages(baseTour.image, copy.itinerary, lang);
  const localizedRouteForBadge = getEffectiveRoute(copy, lang);
  const tourStops =
    staticBaseTour?.stops && staticBaseTour.stops.length > 0
      ? staticBaseTour.stops
      : (copy.logistics || [])
          .flatMap((seg) => [getLocalizedText(seg.from, "en"), getLocalizedText(seg.to, "en")])
          .filter(Boolean);
  const routeText = getLocalizedText(copy.route, "en");

  return (
    <div className="min-h-screen bg-[#f8faff]">
      <div className="mx-auto max-w-4xl px-3 py-4 sm:px-6">

        {/* Navbar */}
        <MainNavbar lang={lang} labels={navLabels} onLangChange={setLang} createTripLabel={t.createTrip[lang]} onNavClick={handleNavClick} loginLabel={t.login[lang]} />

        {/* Back */}
        <button
          type="button"
          onClick={() => router.push("/#tours")}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#e2eaff] bg-white px-3.5 py-1.5 text-xs font-medium text-[#64748b] shadow-sm transition hover:bg-[#f1f5ff]"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t.back[lang]}
        </button>

        {/* ── 1. HERO CAROUSEL ───────────────────────────────────────────────── */}
        <HeroCarousel photos={allPhotos} />

        {/* ── 2. TITLE & QUICK STATS ─────────────────────────────────────────── */}
        <div className="mt-5 sm:mt-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#94a3b8]">
            {t.standardClass[lang]} · TOURLY.UZ
          </p>
          <h1 className="mt-1.5 text-2xl font-bold leading-tight text-[#0f172a] sm:text-3xl">
            {getLocalizedText(copy.title, lang)}
          </h1>
          {copy.subtitle && (
            <p className="mt-2 text-sm leading-relaxed text-[#64748b] sm:text-base">
              {getLocalizedText(copy.subtitle, lang)}
            </p>
          )}

          {/* Stats badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-[#191970] px-3.5 py-1.5 text-xs font-semibold text-white">
              📅 {baseTour.days} {t.days[lang]}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-[#eff4ff] px-3.5 py-1.5 text-xs font-semibold text-[#191970]">
              💰 {t.from[lang]} ${baseTour.priceFromUsd}
            </span>
            {localizedRouteForBadge && (
              <span className="flex items-center gap-1.5 rounded-full bg-[#f1f5f9] px-3.5 py-1.5 text-xs font-medium text-[#334155]">
                📍 {localizedRouteForBadge}
              </span>
            )}
          </div>
        </div>

        {/* ── 3. SUMMARY CARDS ───────────────────────────────────────────────── */}
        <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
          {[
            { label: t.route[lang], value: getEffectiveRoute(copy, lang), icon: "🗺️" },
            { label: t.focus[lang], value: getLocalizedText(copy.focus, lang), icon: "🎯" },
            { label: t.transport[lang], value: localizeTransportText(getLocalizedText(copy.transport, lang), lang), icon: "🚌" }
          ].filter(c => c.value).map((card) => (
            <div key={card.label} className="rounded-2xl border border-[#e8eeff] bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-1.5">
                <span className="text-base leading-none">{card.icon}</span>
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">{card.label}</p>
              </div>
              <p className="text-sm font-medium leading-relaxed text-[#0f172a]">{card.value}</p>
            </div>
          ))}
        </div>

        {/* ── 4. LOGISTICS ───────────────────────────────────────────────────── */}
        {copy.logistics.length > 0 && (
          <div className="mt-4 rounded-2xl border border-[#e8eeff] bg-white p-4 shadow-sm sm:p-5">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">{t.logistics[lang]}</p>
            <div className="space-y-2.5">
              {copy.logistics.map((seg, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-lg leading-none">{TRANSPORT_EMOJI[seg.transport] ?? "🚗"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-[#0f172a]">
                      {getLocalizedText(seg.from, lang)}
                      <span className="mx-1.5 text-[#94a3b8]">→</span>
                      {getLocalizedText(seg.to, lang)}
                    </p>
                    <p className="mt-0.5 text-xs text-[#64748b]">
                      <span className="mr-1.5 rounded bg-[#eef2ff] px-1.5 py-0.5 text-[10px] font-semibold text-[#191970]">
                        {transportModeLabel[seg.transport][lang]}
                      </span>
                      {localizeDurationText(seg.duration, lang)}
                      {seg.note && <span className="ml-1.5 text-[#94a3b8]">· {getLocalizedText(seg.note, lang)}</span>}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 5. ITINERARY (locked / unlocked) ───────────────────────────────── */}
        <div className="mt-4 rounded-2xl border border-[#e8eeff] bg-white shadow-sm sm:mt-5">
          {!isUnlocked ? (
            <div className="p-5 text-center sm:p-8">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eff4ff] text-2xl">🔒</div>
              <p className="font-bold text-[#0f172a]">
                {lang === "ru" ? "Полный план тура" : lang === "en" ? "Full tour plan" : "To'liq tur rejasi"}
              </p>
              <p className="mt-1.5 text-sm text-[#64748b]">
                {lang === "ru" ? "Откройте подробный маршрут по дням с PRO версией." : lang === "en" ? "Unlock the detailed day-by-day itinerary with PRO." : "Kunma-kun marshrutni PRO bilan oching."}
              </p>
              <button
                type="button"
                onClick={handleUnlockClick}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#191970] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(25,25,112,0.5)] transition hover:bg-[#12124f] active:scale-95"
              >
                {t.unlockCta[lang]}
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ) : copy.itinerary && copy.itinerary.length > 0 ? (
            <div className="p-4 sm:p-6">
              <div className="mb-5">
                <h2 className="font-bold text-[#0f172a]">{t.unlockedTitle[lang]}</h2>
              </div>
              <div>
                {copy.itinerary.map((dayPlan, i) => (
                  <DayItineraryCard
                    key={`${dayPlan.dayNumber}-${i}`}
                    plan={dayPlan}
                    lang={lang}
                    labels={{ day: t.day[lang], attractionsOfDay: t.attractionsOfDay[lang], dining: t.diningOfDay[lang] }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="p-5 text-center text-sm text-[#64748b]">
              {lang === "ru" ? "Детальный план будет доступен после генерации." : lang === "en" ? "Detailed plan will be available after generation." : "Batafsil reja generatsiyadan keyin mavjud bo'ladi."}
            </div>
          )}
        </div>

        {/* ── 6. RECOMMENDED AGENCY (only after unlock) ─────────────────────── */}
        {isUnlocked && (
          <RecommendedAgencySection
            tourStops={tourStops}
            routeText={routeText}
            lang={lang}
          />
        )}

        {/* Bottom padding */}
        <div className="h-10 sm:h-14" />
      </div>

      {/* ── PRO Modal ──────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 px-4 pb-6 sm:items-center sm:pb-0" onClick={() => setShowModal(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.5)]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eff4ff] text-2xl">🔒</div>
            <h3 className="text-base font-bold text-[#0f172a]">
              {lang === "ru" ? "Нужна PRO версия" : lang === "en" ? "PRO required" : "PRO versiya kerak"}
            </h3>
            <p className="mt-1.5 text-sm text-[#64748b]">
              {lang === "ru" ? "Купите PRO в профиле, чтобы открыть полный план тура." : lang === "en" ? "Purchase PRO in your profile to unlock the full tour plan." : "To'liq tur rejasini ochish uchun profilingizda PRO xarid qiling."}
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-[#e2e8f0] py-2.5 text-sm font-medium text-[#64748b] hover:bg-[#f8faff] transition">
                {lang === "ru" ? "Назад" : lang === "en" ? "Cancel" : "Orqaga"}
              </button>
              <button type="button" onClick={() => { setShowModal(false); router.push("/profile"); }} className="flex-1 rounded-xl bg-[#191970] py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#12124f] transition">
                {lang === "ru" ? "В профиль" : lang === "en" ? "Go to profile" : "Profilga"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
