"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LANG_STORAGE_KEY, MainNavbar, NavItemId, LangCode } from "@/components/main-navbar";
import { getApiBase } from "@/lib/api";

type Mode = "login" | "register";

const authDictionary: Record<
  LangCode,
  {
    navHome: string;
    navAbout: string;
    navTours: string;
    navWhy: string;
    createTripLabel: string;
    title: string;
    subtitle: string;
    loginTab: string;
    registerTab: string;
    nameLabel: string;
    emailLabel: string;
    passwordLabel: string;
    confirmPasswordLabel: string;
    submitLogin: string;
    submitRegister: string;
    helperText: string;
  }
> = {
  uz: {
    navHome: "Bosh sahifa",
    navAbout: "Biz haqimizda",
    navTours: "Yo'nalishlar",
    navWhy: "Nega TOURLY.UZ?",
    createTripLabel: "Yangi Tur Yaratish",
    title: "Kirish yoki ro'yxatdan o'tish",
    subtitle:
      "Trip rejalaringizni saqlash, klasslarni unlock qilish va to'lovlarni boshqarish uchun hisob yarating.",
    loginTab: "Login",
    registerTab: "Ro'yxatdan o'tish",
    nameLabel: "To'liq ism",
    emailLabel: "Email",
    passwordLabel: "Parol",
    confirmPasswordLabel: "Parolni tasdiqlash",
    submitLogin: "Kirish",
    submitRegister: "Ro'yxatdan o'tish",
    helperText:
      "Hozircha barcha ma'lumotlar faqat demo rejimida saqlanadi va faqat sizning brauzeringizda saqlanadi."
  },
  ru: {
    navHome: "Главная",
    navAbout: "О нас",
    navTours: "Направления",
    navWhy: "Почему TOURLY.UZ?",
    createTripLabel: "Создать Новый Тур",
    title: "Вход или регистрация",
    subtitle:
      "Создайте аккаунт, чтобы сохранять планы туров, открывать классы и управлять оплатами.",
    loginTab: "Войти",
    registerTab: "Регистрация",
    nameLabel: "Полное имя",
    emailLabel: "Email",
    passwordLabel: "Пароль",
    confirmPasswordLabel: "Подтверждение пароля",
    submitLogin: "Войти",
    submitRegister: "Зарегистрироваться",
    helperText:
      "Сейчас все данные хранятся в демо‑режиме только в вашем браузере (localStorage)."
  },
  en: {
    navHome: "Home",
    navAbout: "About",
    navTours: "Destinations",
    navWhy: "Why TOURLY",
    createTripLabel: "Create a New Trip",
    title: "Login or create an account",
    subtitle:
      "Create an account to save trip plans, unlock classes and manage payments in one place.",
    loginTab: "Login",
    registerTab: "Sign up",
    nameLabel: "Full name",
    emailLabel: "Email",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm password",
    submitLogin: "Login",
    submitRegister: "Create account",
    helperText:
      "For now everything is stored in demo mode only in your browser (localStorage)."
  }
};

const AUTH_KEY = "tourly_auth";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<LangCode>("uz");
  const [mode, setMode] = useState<Mode>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const t = authDictionary[lang];
  const redirect = searchParams.get("redirect") || "/";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY) as LangCode | null;
    if (stored === "uz" || stored === "ru" || stored === "en") setLang(stored);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const existing = window.localStorage.getItem(AUTH_KEY);
    if (existing) {
      router.replace(redirect || "/profile");
    }
  }, [router, redirect]);

  const handleNavClick = (id: NavItemId) => {
    window.location.href = `/#${id}`;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (typeof window === "undefined") return;
    setError(null);
    setLoading(true);

    try {
      const apiBase = getApiBase();
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : { email, password, name: name || undefined };

      const res = await fetch(`${apiBase}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Authentication failed");
      }

      const data = (await res.json()) as {
        token: string;
        user: { id: string; email: string; name: string | null; role: string };
      };

      window.localStorage.setItem(
        AUTH_KEY,
        JSON.stringify({ token: data.token, user: data.user })
      );

      router.push(redirect && redirect !== "/" ? redirect : "/profile");
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-3 py-4 sm:px-6 lg:px-8">
      <MainNavbar
        lang={lang}
        labels={{
          home: t.navHome,
          about: t.navAbout,
          tours: t.navTours,
          why: t.navWhy
        }}
        onLangChange={setLang}
        createTripLabel={t.createTripLabel}
        onNavClick={handleNavClick}
        loginLabel={lang === "ru" ? "Войти" : lang === "en" ? "Login" : "Kirish"}
      />

      <button
        type="button"
        onClick={() => {
          if (typeof window === "undefined") return;
          const url = new URL(window.location.href);
          const segments = url.pathname.split("/").filter(Boolean);
          if (segments.length <= 1) {
            router.push("/");
            return;
          }
          segments.pop();
          const targetPath = `/${segments.join("/")}`;
          router.push(targetPath || "/");
        }}
        className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#d8e7ff] bg-white px-3 py-1.5 text-xs font-medium text-[#4b5563] shadow-sm transition hover:bg-[#eff4ff]"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        <span>{lang === "ru" ? "Назад" : lang === "en" ? "Back" : "Orqaga"}</span>
      </button>

      <section className="mt-6 flex justify-center">
        <div className="w-full max-w-md rounded-3xl border border-[#d8e7ff] bg-white/95 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.16)] sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#64748b]">
            TOURLY.UZ
          </p>
          <h1 className="mt-2 text-xl font-bold text-[#0f172a] sm:text-2xl">
            {t.title}
          </h1>
          <p className="mt-1.5 text-xs text-[#6b7280] sm:text-sm">
            {t.subtitle}
          </p>

          <div className="mt-4 inline-flex rounded-full bg-[#f3f4ff] p-1 text-xs font-medium text-[#111827]">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-full px-3 py-1.5 ${
                mode === "login"
                  ? "bg-[#191970] text-white shadow-[0_6px_18px_rgba(25,25,112,0.6)]"
                  : ""
              }`}
            >
              {t.loginTab}
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-full px-3 py-1.5 ${
                mode === "register"
                  ? "bg-[#191970] text-white shadow-[0_6px_18px_rgba(25,25,112,0.6)]"
                  : ""
              }`}
            >
              {t.registerTab}
            </button>
          </div>

          {error && (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
              {error}
            </p>
          )}

          <form className="mt-4 space-y-3 sm:space-y-4" onSubmit={handleSubmit}>
            {mode === "register" && (
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#374151]">
                  {t.nameLabel}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-[#d8e7ff] bg-[#f9fbff] px-3 py-2.5 text-sm outline-none transition focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
                />
              </div>
            )}
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#374151]">
                {t.emailLabel}
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-[#d8e7ff] bg-[#f9fbff] px-3 py-2.5 text-sm outline-none transition focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#374151]">
                {t.passwordLabel}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-[#d8e7ff] bg-[#f9fbff] px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-[#9ca3af] hover:text-[#4b5563] transition-colors"
                >
                  {showPassword ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            {mode === "register" && (
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#374151]">
                  {t.confirmPasswordLabel}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-xl border border-[#d8e7ff] bg-[#f9fbff] px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-[#9ca3af] hover:text-[#4b5563] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-2xl bg-[#191970] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.6)] transition hover:bg-[#12124f] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading
                ? lang === "ru"
                  ? "Подождите..."
                  : lang === "en"
                    ? "Please wait..."
                    : "Kuting..."
                : mode === "login"
                  ? t.submitLogin
                  : t.submitRegister}
            </button>
          </form>

          <p className="mt-3 text-[11px] text-[#9ca3af]">{t.helperText}</p>
        </div>
      </section>
    </main>
  );
}

