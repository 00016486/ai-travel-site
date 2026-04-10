import { useEffect, useState } from "react";
import "./index.css";
import axios from "axios";

type AdminView = "dashboard" | "tours" | "users";

type TourDetails = {
  summary?: {
    title?: Record<string, string>;
    subtitle?: Record<string, string>;
    route?: Record<string, string>;
    focus?: Record<string, string>;
    transport?: Record<string, string>;
    spotlight?: Record<string, string>;
  };
  logistics?: Array<{
    from: Record<string, string>;
    to: Record<string, string>;
    transport: string;
    duration: string;
    note?: Record<string, string>;
  }>;
  itinerary?: Array<{
    dayNumber: number;
    city: Record<string, string>;
    images: string[];
    attractions: Array<{
      name: Record<string, string>;
      description: Record<string, string>;
      image?: string;
    }>;
  }>;
};

type AdminTour = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  heroImageUrl?: string;
  priceFromUsd: number;
  days: number;
  isPublished: boolean;
  tour_details?: TourDetails | null;
};

type AdminPayment = {
  id: string;
  amountUsd: number;
  createdAt: string;
  provider: string;
  status: "SUCCESS" | "PENDING" | "FAILED" | string;
};

type AdminStats = {
  userCount: number;
  tourCount: number;
  totalRevenue: number;
  proToursOpened?: number;
  payments: AdminPayment[];
};

type AdminUserPro = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
  proTier: string | null;
  proActivatedAt: string | null;
  proExpiresAt: string | null;
  proGenerationsUsed?: number;
  proToursOpened?: number;
  proStatus: "none" | "active" | "expired";
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  events: {
    id: string;
    type: string;
    message: string;
    createdAt: string;
  }[];
};


type AdminContact = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string;
  createdAt: string;
};

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8888";
const ADMIN_AUTH_KEY = "tourly_admin_auth";

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState("admin@tourly.local");
  const [password, setPassword] = useState("admin111");
  const [view, setView] = useState<AdminView>("dashboard");
  const [tours, setTours] = useState<AdminTour[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [proUsers, setProUsers] = useState<AdminUserPro[]>([]);

  const [tourForm, setTourForm] = useState<Partial<AdminTour>>({
    title: "",
    slug: "",
    description: "",
    heroImageUrl: "",
    days: 3,
    priceFromUsd: 250,
    isPublished: true
  });
  const [tourDetailsJson, setTourDetailsJson] = useState("");
  const [editingTourId, setEditingTourId] = useState<string | null>(null);


  const isLoggedIn = !!token;
  const [showTourForm, setShowTourForm] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ADMIN_AUTH_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as { token?: string } | null;
      if (parsed?.token) setToken(parsed.token);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!token) return;
    loadStats();
    loadTours();
    loadProUsers();
    loadContacts();
  }, [token]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      const tk: string | undefined = res.data?.token;
      if (!tk) throw new Error("Missing token in response");
      setToken(tk);
      window.localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify({ token: tk, email }));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || "Login failed");
    }
  }

  async function loadTours() {
    if (!token) return;
    try {
      const res = await axios.get<AdminTour[]>(`${API_BASE}/api/admin/tours`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTours(res.data);
    } catch { /* silent */ }
  }

  async function loadTourWithDetails(id: string) {
    if (!token) return null;
    const res = await axios.get<AdminTour>(`${API_BASE}/api/admin/tours/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  }

  async function loadStats() {
    if (!token) return;
    try {
      const res = await axios.get<AdminStats>(`${API_BASE}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch { /* silent */ }
  }

  async function loadContacts() {
    if (!token) return;
    try {
      const res = await axios.get<AdminContact[]>(`${API_BASE}/api/admin/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(res.data);
    } catch { /* silent */ }
  }

  async function loadProUsers() {
    if (!token) return;
    try {
      const res = await axios.get<AdminUserPro[]>(`${API_BASE}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProUsers(res.data);
    } catch { /* silent */ }
  }

  async function saveTour() {
    if (!token) return;
    setError(null);
    let tour_details: TourDetails | undefined;
    try {
      if (tourDetailsJson.trim()) {
        tour_details = JSON.parse(tourDetailsJson.trim()) as TourDetails;
      }
    } catch {
      setError("Invalid JSON in Tour details");
      return;
    }
    const payload = {
      title: tourForm.title?.trim(),
      slug: tourForm.slug?.trim(),
      description: tourForm.description?.trim() || "",
      heroImageUrl: tourForm.heroImageUrl?.trim() || "",
      days: Number(tourForm.days) || 1,
      priceFromUsd: Number(tourForm.priceFromUsd) || 0,
      isPublished: !!tourForm.isPublished,
      ...(tour_details && { tour_details })
    };
    try {
      if (editingTourId) {
        const res = await axios.put<AdminTour>(
          `${API_BASE}/api/admin/tours/${editingTourId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTours((curr) => curr.map((t) => (t.id === editingTourId ? res.data : t)));
      } else {
        const res = await axios.post<AdminTour>(`${API_BASE}/api/admin/tours`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTours((curr) => [res.data, ...curr]);
      }
      setTourForm({ title: "", slug: "", description: "", heroImageUrl: "", days: 3, priceFromUsd: 250, isPublished: true });
      setTourDetailsJson("");
      setEditingTourId(null);
      setShowTourForm(false);
      setError(null);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || "Failed to save tour");
    }
  }

  async function deleteTour(id: string) {
    if (!token || !window.confirm("Delete this tour?")) return;
    try {
      await axios.delete(`${API_BASE}/api/admin/tours/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTours((curr) => curr.filter((t) => t.id !== id));
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error || "Failed to delete tour");
    }
  }

  async function startEditTour(tour: AdminTour) {
    setEditingTourId(tour.id);
    setShowTourForm(true);
    setTourForm({
      title: tour.title,
      slug: tour.slug,
      description: tour.description || "",
      heroImageUrl: tour.heroImageUrl || "",
      days: tour.days,
      priceFromUsd: tour.priceFromUsd,
      isPublished: tour.isPublished
    });
    setTourDetailsJson("");
    setError(null);
    try {
      const full = await loadTourWithDetails(tour.id);
      if (full?.tour_details) setTourDetailsJson(JSON.stringify(full.tour_details, null, 2));
    } catch {
      setError("Could not load tour details");
    }
  }

  function resetTourForm() {
    setEditingTourId(null);
    setShowTourForm(true);
    setTourForm({ title: "", slug: "", description: "", heroImageUrl: "", days: 3, priceFromUsd: 250, isPublished: true });
    setTourDetailsJson("");
  }

  // ── derived values ───────────────────────────────────────────────
  const publishedTours = tours.filter((t) => t.isPublished).length;
  const activeProUsers = proUsers.filter((u) => u.proStatus === "active").length;
  const expiredProUsers = proUsers.filter((u) => u.proStatus === "expired").length;
  const proToursOpenedTotal =
    stats?.proToursOpened ??
    proUsers.reduce(
      (sum, u) =>
        sum + Number(u.proToursOpened ?? u.proGenerationsUsed ?? 0),
      0
    );

  const revenueByMonth = (() => {
    if (!stats) return [];
    const map = new Map<string, number>();
    for (const p of stats.payments || []) {
      if (p.status !== "SUCCESS") continue;
      const d = new Date(p.createdAt);
      if (Number.isNaN(d.getTime())) continue;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map.set(key, (map.get(key) || 0) + (p.amountUsd || 0));
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .slice(-6)
      .map(([key, value]) => {
        const [year, month] = key.split("-");
        const label = new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(undefined, { month: "short" });
        return { key, label, value };
      });
  })();

  // ── login screen ─────────────────────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                Tourly Admin
              </p>
              <h1 className="mt-1.5 text-xl font-semibold text-slate-900">Analytics dashboard</h1>
              <p className="mt-1 text-xs text-slate-500">
                Sign in to manage tours, reviews and contact requests.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[11px] text-slate-600">
              Demo credentials:{" "}
              <span className="font-mono text-[10px]">admin@tourly.local / admin111</span>
            </div>
            <form className="space-y-3" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-slate-700">Email</label>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-200"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-[11px] text-red-500">{error}</p>}
              <button
                type="submit"
                className="mt-1 w-full rounded-lg bg-slate-900 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition"
              >
                Enter dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── shared input class ────────────────────────────────────────────
  const inp =
    "w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-900 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-100 placeholder:text-slate-400";

  // ── main layout ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-56 flex-shrink-0 flex-col border-r border-slate-200 bg-white px-4 py-5 text-[13px] md:flex">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-[10px] font-bold text-white">
              TA
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">TOURLY Analytics</p>
              <p className="text-[10px] text-slate-400">Admin console</p>
            </div>
          </div>

          <nav className="space-y-4 flex-1">
            <div>
              <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Dashboards
              </p>
              <div className="space-y-0.5">
                {(
                  [
                    ["dashboard", "Analytics"],
                    ["tours", "Tours"],
                    ["users", "Users & contacts"]
                  ] as [AdminView, string][]
                ).map(([id, label]) => {
                  const active = view === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setView(id);
                        if (id === "tours") loadTours();
                        if (id === "dashboard") loadStats();
                        if (id === "users") { loadContacts(); loadProUsers(); }
                      }}
                      className={`flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition ${
                        active
                          ? "bg-slate-100 font-medium text-slate-900"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${active ? "bg-slate-900" : "bg-slate-300"}`}
                      />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          <div className="mt-4 space-y-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px]">
              <p className="font-semibold text-slate-700">Today</p>
              <p className="mt-1 text-slate-500">
                Tours: <span className="font-semibold text-slate-900">{publishedTours}</span>
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px]">
              <p className="font-semibold text-slate-700">PRO users</p>
              <p className="mt-1 text-slate-500">
                Active: <span className="font-semibold text-emerald-600">{activeProUsers}</span> · Expired:{" "}
                <span className="font-semibold text-amber-500">{expiredProUsers}</span>
              </p>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <div className="flex min-h-screen flex-1 flex-col">
          {/* TOPBAR */}
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {view === "dashboard"
                  ? "Analytics Dashboard"
                  : view === "tours"
                  ? "Tours"
                  : "Users & Contacts"}
              </p>
              <p className="text-[11px] text-slate-400">
                {view === "dashboard"
                  ? "Live overview of users, tours, revenue and PRO activity."
                  : view === "tours"
                  ? "Create and manage all public tour packages."
                  : "Users, PRO subscriptions and contact requests."}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                TA
              </div>
              <div className="hidden text-xs md:block">
                <p className="font-semibold text-slate-900">Super Admin</p>
                <p className="text-[10px] text-slate-400">tourly.uz</p>
              </div>
              <button
                className="ml-2 rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition"
                onClick={() => {
                  setToken(null);
                  window.localStorage.removeItem(ADMIN_AUTH_KEY);
                }}
              >
                Logout
              </button>
            </div>
          </header>

          <main className="flex-1 px-3 py-4 md:px-6 md:py-5">
            <div className="mx-auto max-w-6xl">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {error}
                  <button
                    className="ml-3 text-red-400 hover:text-red-600"
                    onClick={() => setError(null)}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* ── DASHBOARD ─────────────────────────── */}
              {view === "dashboard" && stats && (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-4">
                    {[
                      { label: "Total Users", value: stats.userCount.toLocaleString(), sub: "Registered accounts" },
                      { label: "Tours in catalog", value: stats.tourCount.toLocaleString(), sub: `${publishedTours} published` },
                      { label: "Total revenue", value: `$${stats.totalRevenue.toLocaleString()}`, sub: "Successful payments" },
                      {
                        label: "Opened with PRO",
                        value: Number(proToursOpenedTotal).toLocaleString(),
                        sub: "Tours opened/generated via PRO"
                      }
                    ].map((card) => (
                      <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="text-[11px] font-medium text-slate-500">{card.label}</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{card.value}</p>
                        <p className="mt-1 text-[11px] text-slate-400">{card.sub}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-900">Revenue (last 6 months)</p>
                        <span className="text-[10px] text-slate-400">{revenueByMonth.length} months</span>
                      </div>
                      <div className="h-32 rounded-lg border border-slate-100 bg-slate-50 px-3 pt-3 pb-2">
                        {revenueByMonth.length === 0 ? (
                          <div className="flex h-full items-center justify-center text-[11px] text-slate-400">
                            No successful payments yet.
                          </div>
                        ) : (
                          <div className="flex h-full items-end gap-2">
                            {revenueByMonth.map((m) => {
                              const max = Math.max(...revenueByMonth.map((v) => v.value)) || 1;
                              const pct = Math.max(8, Math.round((m.value / max) * 100));
                              return (
                                <div key={m.key} className="flex flex-1 flex-col items-center gap-1">
                                  <div className="relative flex w-full flex-1 items-end">
                                    <div className="w-full rounded-sm bg-slate-900" style={{ height: `${pct}%` }} />
                                  </div>
                                  <span className="text-[10px] text-slate-400">{m.label}</span>
                                  <span className="text-[10px] font-medium text-slate-700">
                                    ${Math.round(m.value).toLocaleString()}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="mb-3 text-xs font-semibold text-slate-900">PRO subscriptions overview</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: "Active PRO", value: activeProUsers, color: "text-emerald-600" },
                        { label: "Expired PRO", value: expiredProUsers, color: "text-amber-500" },
                        { label: "Free plan", value: proUsers.filter((u) => u.proStatus === "none").length, color: "text-slate-500" }
                      ].map((item) => (
                        <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                          <p className={`text-2xl font-semibold ${item.color}`}>{item.value}</p>
                          <p className="mt-1 text-[11px] text-slate-500">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── TOURS ─────────────────────────────── */}
              {view === "tours" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-slate-500">{tours.length} total tours</p>
                    <button
                      onClick={() => {
                        if (showTourForm) {
                          setShowTourForm(false);
                          setEditingTourId(null);
                        } else {
                          resetTourForm();
                        }
                      }}
                      className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                    >
                      {showTourForm ? "Close form" : "+ New tour"}
                    </button>
                  </div>

                  <div className={`grid gap-4 ${showTourForm ? "md:grid-cols-[280px,1fr]" : ""}`}>
                    {showTourForm && (
                      <form
                        className="space-y-3 rounded-xl border border-slate-200 bg-white p-4"
                        onSubmit={(e) => { e.preventDefault(); saveTour(); }}
                      >
                        <p className="text-xs font-semibold text-slate-900">
                          {editingTourId ? "Edit tour" : "New tour"}
                        </p>
                        {[
                          { label: "Title", key: "title", required: true },
                          { label: "Slug", key: "slug", required: true },
                          { label: "Hero image URL", key: "heroImageUrl", required: false }
                        ].map(({ label, key, required }) => (
                          <div key={key} className="space-y-1">
                            <label className="block text-[11px] text-slate-500">{label}</label>
                            <input
                              className={inp}
                              value={(tourForm[key as keyof typeof tourForm] as string) || ""}
                              onChange={(e) => setTourForm((f) => ({ ...f, [key]: e.target.value }))}
                              required={required}
                            />
                          </div>
                        ))}
                        <div className="space-y-1">
                          <label className="block text-[11px] text-slate-500">Description</label>
                          <textarea
                            className={inp + " resize-none"}
                            rows={3}
                            value={tourForm.description || ""}
                            onChange={(e) => setTourForm((f) => ({ ...f, description: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="block text-[11px] text-slate-500">Days</label>
                            <input
                              type="number"
                              min={1}
                              className={inp}
                              value={tourForm.days ?? 1}
                              onChange={(e) => setTourForm((f) => ({ ...f, days: Number(e.target.value) }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="block text-[11px] text-slate-500">Price (USD)</label>
                            <input
                              type="number"
                              min={0}
                              className={inp}
                              value={tourForm.priceFromUsd ?? 0}
                              onChange={(e) => setTourForm((f) => ({ ...f, priceFromUsd: Number(e.target.value) }))}
                            />
                          </div>
                        </div>
                        <label className="flex items-center gap-2 text-[11px] text-slate-500">
                          <input
                            type="checkbox"
                            checked={tourForm.isPublished ?? true}
                            onChange={(e) => setTourForm((f) => ({ ...f, isPublished: e.target.checked }))}
                          />
                          Published
                        </label>
                        <div className="space-y-1">
                          <label className="block text-[11px] text-slate-500">
                            Tour details (JSON)
                          </label>
                          <textarea
                            className={inp + " resize-none font-mono text-[10px]"}
                            rows={10}
                            placeholder='{"summary":{...},"logistics":[...],"itinerary":[...]}'
                            value={tourDetailsJson}
                            onChange={(e) => setTourDetailsJson(e.target.value)}
                          />
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button
                            type="submit"
                            className="flex-1 rounded-md bg-slate-900 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition"
                          >
                            {editingTourId ? "Save changes" : "Create tour"}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowTourForm(false); setEditingTourId(null); }}
                            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 transition"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <table className="min-w-full divide-y divide-slate-100 text-xs">
                        <thead className="bg-slate-50">
                          <tr>
                            {["Title", "Slug", "Days / Price", "Status", "Actions"].map((h, i) => (
                              <th
                                key={h}
                                className={`px-3 py-2.5 text-[11px] font-medium text-slate-500 ${
                                  i === 4 ? "text-right" : "text-left"
                                }`}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {tours.map((tour) => (
                            <tr key={tour.id} className="hover:bg-slate-50 transition">
                              <td className="px-3 py-2.5 font-medium text-slate-900">{tour.title}</td>
                              <td className="px-3 py-2.5 text-slate-500">{tour.slug}</td>
                              <td className="px-3 py-2.5 text-slate-500">
                                {tour.days}d · ${tour.priceFromUsd}
                              </td>
                              <td className="px-3 py-2.5">
                                <span
                                  className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                    tour.isPublished
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {tour.isPublished ? "Published" : "Draft"}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-right">
                                <div className="inline-flex gap-1.5">
                                  <button
                                    onClick={() => startEditTour(tour)}
                                    className="rounded border border-slate-200 px-2.5 py-1 text-[11px] text-slate-600 hover:bg-slate-50 transition"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteTour(tour.id)}
                                    className="rounded border border-red-100 px-2.5 py-1 text-[11px] text-red-500 hover:bg-red-50 transition"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {tours.length === 0 && (
                            <tr>
                              <td colSpan={5} className="px-3 py-8 text-center text-[11px] text-slate-400">
                                No tours yet. Create the first tour using the form above.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}


              {/* ── USERS ─────────────────────────────── */}
              {view === "users" && (
                <div className="space-y-4">
                  {/* Users table */}
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <p className="text-xs font-semibold text-slate-900">Users & PRO subscriptions</p>
                      <p className="text-[11px] text-slate-400">
                        {proUsers.length} users · {activeProUsers} active PRO · {expiredProUsers} expired · {Number(proToursOpenedTotal).toLocaleString()} opened with PRO
                      </p>
                    </div>
                    <table className="min-w-full divide-y divide-slate-100 text-xs">
                      <thead className="bg-slate-50">
                        <tr>
                          {["User", "PRO status", "Period", "Opened with PRO", "Payments", "Last login"].map((h) => (
                            <th key={h} className="px-3 py-2.5 text-left text-[11px] font-medium text-slate-500">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {proUsers.map((u) => {
                          const badge =
                            u.proStatus === "active"
                              ? "bg-emerald-50 text-emerald-600"
                              : u.proStatus === "expired"
                              ? "bg-amber-50 text-amber-500"
                              : "bg-slate-100 text-slate-500";
                          return (
                            <tr key={u.id} className="hover:bg-slate-50 transition">
                              <td className="px-3 py-2.5">
                                <p className="font-medium text-slate-900">{u.name || u.email}</p>
                                <p className="text-[10px] text-slate-400">{u.email}</p>
                              </td>
                              <td className="px-3 py-2.5">
                                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${badge}`}>
                                  {u.proStatus === "active"
                                    ? "Active PRO"
                                    : u.proStatus === "expired"
                                    ? "Expired"
                                    : "Free"}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-slate-500">
                                {u.proActivatedAt && u.proExpiresAt ? (
                                  <div>
                                    <p>{new Date(u.proActivatedAt).toLocaleDateString()} → {new Date(u.proExpiresAt).toLocaleDateString()}</p>
                                    <p className="text-[10px] text-slate-400">
                                      {u.proStatus === "active" ? "Active" : "Ended"}
                                    </p>
                                  </div>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-slate-700">
                                <span className="font-medium">
                                  {Number(u.proToursOpened ?? u.proGenerationsUsed ?? 0).toLocaleString()}
                                </span>
                              </td>
                              <td className="px-3 py-2.5 text-slate-700">
                                <span className="font-medium">{u.successfulPayments}</span> ok
                                {u.failedPayments > 0 && (
                                  <span className="ml-1 text-amber-500">/ {u.failedPayments} failed</span>
                                )}
                              </td>
                              <td className="px-3 py-2.5 text-slate-500">
                                {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : "—"}
                              </td>
                            </tr>
                          );
                        })}
                        {proUsers.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-3 py-8 text-center text-[11px] text-slate-400">
                              No users yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Activity + contacts grid */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white">
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-xs font-semibold text-slate-900">Recent activity</p>
                        <p className="text-[11px] text-slate-400">Registrations, logins, subscriptions.</p>
                      </div>
                      <div className="max-h-64 space-y-1 overflow-y-auto px-3 py-2">
                        {proUsers
                          .flatMap((u) => u.events.map((e) => ({ ...e, userName: u.name || u.email })))
                          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                          .slice(0, 20)
                          .map((e) => (
                            <div key={e.id} className="flex items-start gap-2 rounded-lg bg-slate-50 px-2 py-1.5 text-[11px]">
                              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                              <div>
                                <p className="text-slate-800">
                                  <span className="font-medium">{e.userName}</span> · {e.message}
                                </p>
                                <p className="text-[10px] text-slate-400">{new Date(e.createdAt).toLocaleString()}</p>
                              </div>
                            </div>
                          ))}
                        {proUsers.every((u) => u.events.length === 0) && (
                          <p className="py-4 text-center text-[11px] text-slate-400">No activity yet.</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white">
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-xs font-semibold text-slate-900">Contact requests</p>
                        <p className="text-[11px] text-slate-400">{contacts.length} messages from the contact form.</p>
                      </div>
                      <div className="max-h-64 divide-y divide-slate-50 overflow-y-auto">
                        {contacts.map((c) => (
                          <div key={c.id} className="px-4 py-3 text-[11px]">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-slate-800">{c.name || "Anonymous"}</p>
                                <p className="text-[10px] text-slate-400">{c.email || c.phone || "—"}</p>
                                {c.subject && <p className="mt-0.5 text-slate-600">{c.subject}</p>}
                                <p className="mt-1 text-slate-700 line-clamp-2">{c.message}</p>
                              </div>
                              <p className="shrink-0 text-[10px] text-slate-400">
                                {new Date(c.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                        {contacts.length === 0 && (
                          <p className="py-6 text-center text-[11px] text-slate-400">No contact messages yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;
