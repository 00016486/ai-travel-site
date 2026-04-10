"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LANG_STORAGE_KEY, MainNavbar, NavItemId } from "@/components/main-navbar";
import { getApiBase } from "@/lib/api";
import { activateMyPro, getMyProStatus, ProStatus } from "@/lib/ai";

type Lang = "uz" | "ru" | "en";

type SectionId = "profile" | "payments" | "pro" | "proActive";

type StoredCard = {
  name: string;
  expiry: string;
  last4: string;
  masked: string;
  brand: string;
};

type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

const AUTH_KEY = "tourly_auth";
const PAYMENT_KEY = "tourly_has_payment_card";
const PAYMENT_CARD_KEY = "tourly_payment_card";
const PRO_KEY = "tourly_pro_enabled";

const profileDictionary: Record<
  Lang,
  {
    navHome: string;
    navAbout: string;
    navTours: string;
    navWhy: string;
    createTripLabel: string;
    title: string;
    subtitle: string;
    welcomeKicker: string;
    sectionProfile: string;
    sectionPayments: string;
    sectionPro: string;
    sectionProActive: string;
    profileNameLabel: string;
    profileEmailLabel: string;
    profilePhoneLabel: string;
    profileLanguageLabel: string;
    profileSaveButton: string;
    paymentsCardTitle: string;
    paymentsCardSubtitle: string;
    paymentsAddCard: string;
    paymentsMethodVisa: string;
    paymentsMethodCash: string;
  }
> = {
  uz: {
    navHome: "Bosh sahifa",
    navAbout: "Biz haqimizda",
    navTours: "Yo'nalishlar",
    navWhy: "Nega TOURLY.UZ?",
    createTripLabel: "Yangi Tur Yaratish",
    title: "Shaxsiy kabinet",
    subtitle:
      "Profilingiz, to'lov ma'lumotlari va oldingi turlar tarixini shu yerda boshqarishingiz mumkin.",
    welcomeKicker: "Sizning hisobingiz",
    sectionProfile: "Profil sozlamalari",
    sectionPayments: "To'lov sozlamalari",
    sectionPro: "PRO versiyani sotib olish",
    profileNameLabel: "Ism familiya",
    profileEmailLabel: "Email",
    profilePhoneLabel: "Telefon raqam",
    profileLanguageLabel: "Interfeys tili",
    profileSaveButton: "O'zgarishlarni saqlash",
    paymentsCardTitle: "To'lov usullari",
    paymentsCardSubtitle:
      "Xavfsiz to'lov uchun kartalaringizni qo'shing. Hozircha demo rejim.",
    paymentsAddCard: "Karta qo'shish (demo)",
    paymentsMethodVisa: "Visa / MasterCard",
    paymentsMethodCash: "Naqd yoki bank o'tkazmasi",
    sectionProActive: "PRO versiya yoqilgan"
  },
  ru: {
    navHome: "Главная",
    navAbout: "О нас",
    navTours: "Направления",
    navWhy: "Почему TOURLY.UZ?",
    createTripLabel: "Создать Новый Тур",
    title: "Личный кабинет",
    subtitle:
      "Управляйте профилем, платёжными данными и историей поездок в одном месте.",
    welcomeKicker: "Ваш аккаунт",
    sectionProfile: "Настройки профиля",
    sectionPayments: "Платёжные настройки",
    sectionPro: "Купить PRO версию",
    profileNameLabel: "Имя и фамилия",
    profileEmailLabel: "Email",
    profilePhoneLabel: "Телефон",
    profileLanguageLabel: "Язык интерфейса",
    profileSaveButton: "Сохранить изменения",
    paymentsCardTitle: "Способы оплаты",
    paymentsCardSubtitle:
      "Добавьте карты для безопасных платежей. Сейчас включён демо‑режим.",
    paymentsAddCard: "Добавить карту (демо)",
    paymentsMethodVisa: "Visa / MasterCard",
    paymentsMethodCash: "Наличные или банковский перевод",
    sectionProActive: "У вас активна PRO версия"
  },
  en: {
    navHome: "Home",
    navAbout: "About",
    navTours: "Destinations",
    navWhy: "Why TOURLY",
    createTripLabel: "Create a New Trip",
    title: "Profile",
    subtitle:
      "Manage your profile, payment details and trip history from one clean dashboard.",
    welcomeKicker: "Your account",
    sectionProfile: "Profile settings",
    sectionPayments: "Payment settings",
    sectionPro: "Buy PRO version",
    profileNameLabel: "Full name",
    profileEmailLabel: "Email",
    profilePhoneLabel: "Phone number",
    profileLanguageLabel: "Interface language",
    profileSaveButton: "Save changes",
    paymentsCardTitle: "Payment methods",
    paymentsCardSubtitle:
      "Add cards for secure payments. For now this is a demo‑only screen.",
    paymentsAddCard: "Add card (demo)",
    paymentsMethodVisa: "Visa / MasterCard",
    paymentsMethodCash: "Cash or bank transfer",
    sectionProActive: "Your PRO plan is active"
  }
};

export default function ProfilePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Lang>("uz");
  const [section, setSection] = useState<SectionId>("profile");
  const [hasCard, setHasCard] = useState(false);
  const [savedCard, setSavedCard] = useState<StoredCard | null>(null);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isSavingCard, setIsSavingCard] = useState(false);
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardError, setCardError] = useState<string | null>(null);
  const [showCardMenu, setShowCardMenu] = useState(false);
  const [isEditingCard, setIsEditingCard] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [isBuyingPro, setIsBuyingPro] = useState(false);
  const [showProSuccess, setShowProSuccess] = useState(false);
  const [showProNoCard, setShowProNoCard] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [proStatus, setProStatus] = useState<ProStatus | null>(null);
  const t = profileDictionary[lang];
  const logoutLabel =
    lang === "ru" ? "Выйти" : lang === "en" ? "Logout" : "Chiqish";

  const redirect = searchParams.get("redirect") || "";
  const initialSection = (searchParams.get("section") as SectionId | null) || "profile";

  const navItems: [SectionId, string][] = isPro
    ? ([
        ["profile", t.sectionProfile],
        ["payments", t.sectionPayments],
        ["proActive", t.sectionProActive]
      ] as [SectionId, string][])
    : ([
        ["profile", t.sectionProfile],
        ["payments", t.sectionPayments]
      ] as [SectionId, string][]);

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY) as Lang | null;
    if (stored === "uz" || stored === "ru" || stored === "en") setLang(stored);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const auth = window.localStorage.getItem(AUTH_KEY);
    if (!auth) {
      router.replace(`/auth?redirect=/profile`);
      return;
    }
    try {
      const parsed = JSON.parse(auth) as { token?: string; user?: AuthUser };
      if (parsed?.user) {
        setAuthUser(parsed.user);
        setProfileName(parsed.user.name || "");
        setProfileEmail(parsed.user.email || "");
      }
      if (parsed?.token) {
        setAuthToken(parsed.token);
      }
    } catch {
      setAuthUser(null);
    }
    (async () => {
      try {
        const apiBase = getApiBase();
        if (authToken) {
          const res = await fetch(`${apiBase}/api/me/payment-card`, {
            headers: {
              Authorization: `Bearer ${authToken}`
            }
          });
          if (res.ok) {
            const card = (await res.json()) as (StoredCard & { id?: string }) | null;
            if (card) {
              setHasCard(true);
              setSavedCard({
                name: card.name,
                expiry: card.expiry,
                last4: card.last4,
                masked: card.masked,
                brand: card.brand
              });
              window.localStorage.setItem(PAYMENT_KEY, "true");
              window.localStorage.setItem(
                PAYMENT_CARD_KEY,
                JSON.stringify({
                  name: card.name,
                  expiry: card.expiry,
                  last4: card.last4,
                  masked: card.masked,
                  brand: card.brand
                })
              );
              return;
            }
          }
        }
      } catch {
        // fall through to localStorage-only
      }
      const storedCard = window.localStorage.getItem(PAYMENT_KEY) === "true";
      setHasCard(storedCard);
      if (storedCard) {
        try {
          const raw = window.localStorage.getItem(PAYMENT_CARD_KEY);
          if (raw) {
            const localCard = JSON.parse(raw) as StoredCard;
            setSavedCard(localCard);
          }
        } catch {
          setSavedCard(null);
        }
      } else {
        setSavedCard(null);
      }
    })();

    const storedPro = window.localStorage.getItem(PRO_KEY) === "true";
    setIsPro(storedPro);
  }, [router]);

  useEffect(() => {
    if (!authToken) return;
    (async () => {
      try {
        const status = await getMyProStatus(authToken);
        setProStatus(status);
        setIsPro(status.active);
        if (typeof window !== "undefined") {
          if (status.active) {
            window.localStorage.setItem(PRO_KEY, "true");
          } else {
            window.localStorage.removeItem(PRO_KEY);
            if (section === "proActive") setSection("pro");
          }
        }
      } catch {
        // keep local fallback
      }
    })();
  }, [authToken, section]);

  const handleNavClick = (id: NavItemId) => {
    window.location.href = `/#${id}`;
  };

  const handleBack = () => {
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
  };

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(AUTH_KEY);
    window.localStorage.removeItem(PAYMENT_KEY);
    window.localStorage.removeItem(PAYMENT_CARD_KEY);
    window.localStorage.removeItem(PRO_KEY);
    router.push("/");
  };

  const handleAddCardSubmit = (event: any) => {
    event.preventDefault();
    if (!cardName || !cardExpiry) return;
    if (typeof window === "undefined") return;
    setIsSavingCard(true);
    setCardError(null);
    window.setTimeout(() => {
      const sanitizedNumber = cardNumber.replace(/\s+/g, "");
      const cvvDigits = cardCvv.replace(/\D/g, "");
      const expiryDigits = cardExpiry.replace(/\D/g, "");
      const changingNumber = sanitizedNumber.length > 0 || !isEditingCard || !savedCard;

      if (changingNumber) {
        if (!/^\d{16}$/.test(sanitizedNumber)) {
          const message =
            lang === "ru"
              ? "Номер карты должен содержать ровно 16 цифр."
              : lang === "en"
                ? "Card number must contain exactly 16 digits."
                : "Karta raqami aniq 16 ta raqamdan iborat bo‘lishi kerak.";
          setCardError(message);
          setIsSavingCard(false);
          return;
        }
      }

      if (cvvDigits && !/^\d{3}$/.test(cvvDigits)) {
        const message =
          lang === "ru"
            ? "CVV код должен состоять из 3 цифр."
            : lang === "en"
              ? "CVV must be exactly 3 digits."
              : "CVV kodi aniq 3 ta raqam bo‘lishi kerak.";
        setCardError(message);
        setIsSavingCard(false);
        return;
      }

      if (!/^\d{4}$/.test(expiryDigits)) {
        const message =
          lang === "ru"
            ? "Срок действия должен содержать 4 цифры (ММГГ)."
            : lang === "en"
              ? "Expiry must contain 4 digits (MMYY)."
              : "Amal qilish muddati (MMYY) 4 ta raqamdan iborat bo‘lishi kerak.";
        setCardError(message);
        setIsSavingCard(false);
        return;
      }

      const month = parseInt(expiryDigits.slice(0, 2), 10);
      if (Number.isNaN(month) || month < 1 || month > 12) {
        const message =
          lang === "ru"
            ? "Некорректный месяц в сроке действия карты."
            : lang === "en"
              ? "Invalid month in card expiry."
              : "Karta amal qilish muddatidagi oy noto‘g‘ri kiritilgan.";
        setCardError(message);
        setIsSavingCard(false);
        return;
      }
      let last4 = savedCard?.last4 ?? "";
      let masked = savedCard?.masked ?? "";
      let brand = savedCard?.brand ?? "demo";

      if (changingNumber) {
        last4 = sanitizedNumber.slice(-4);
        masked = last4.padStart(sanitizedNumber.length, "•");
      }

      const cardPayload: StoredCard = {
        name: cardName,
        expiry: `${expiryDigits.slice(0, 2)}/${expiryDigits.slice(2)}`,
        last4,
        masked,
        brand
      };

      const token = authToken;
      if (token) {
        const apiBase = getApiBase();
        fetch(`${apiBase}/api/me/payment-card`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(cardPayload)
        }).catch(() => {
          // ignore network errors – local fallback still works
        });
      }
      window.localStorage.setItem(PAYMENT_KEY, "true");
      window.localStorage.setItem(PAYMENT_CARD_KEY, JSON.stringify(cardPayload));
      setHasCard(true);
      setSavedCard(cardPayload);
      setIsSavingCard(false);
      setIsAddingCard(false);
      setCardNumber("");
      setCardName("");
      setCardExpiry("");
      setCardCvv("");
      setCardError(null);
      setIsEditingCard(false);
    }, 900);
  };

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const handleCardNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCardNumber(formatCardNumber(event.target.value));
    setCardError(null);
  };

  const handleCardExpiryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
    const formatted = digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`;
    setCardExpiry(formatted);
    setCardError(null);
  };

  const handleCardCvvChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 3);
    setCardCvv(digits);
    setCardError(null);
  };

  const handleDeleteCard = () => {
    if (typeof window === "undefined") return;
    const token = authToken;
    if (token) {
      const apiBase = getApiBase();
      fetch(`${apiBase}/api/me/payment-card`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      }).catch(() => {
        // ignore network errors
      });
    }
    window.localStorage.removeItem(PAYMENT_KEY);
    window.localStorage.removeItem(PAYMENT_CARD_KEY);
    setHasCard(false);
    setSavedCard(null);
    setIsAddingCard(false);
  };

  const handleChangeCard = () => {
    if (savedCard) {
      setIsAddingCard(true);
      setIsEditingCard(true);
      setCardNumber("");
      setCardName(savedCard.name);
      setCardExpiry(savedCard.expiry);
      setCardCvv("");
      setCardError(null);
    }
  };

  return (
    <>
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
        onClick={handleBack}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#d8e7ff] bg-white px-3 py-1.5 text-xs font-medium text-[#4b5563] shadow-sm transition hover:bg-[#eff4ff]"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span>{lang === "ru" ? "Назад" : lang === "en" ? "Back" : "Orqaga"}</span>
        </button>

        <section className="mt-4 rounded-3xl border border-[#e5edff] bg-white/90 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.12)] sm:mt-5 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#64748b]">
                {t.welcomeKicker}
              </p>
              <h1 className="mt-2 text-2xl font-bold text-[#0f172a] sm:mt-3 sm:text-3xl">
                {t.title}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">
                {t.subtitle}
              </p>
              {authUser && (
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-[#4b5563]">
                  <span className="inline-flex items-center rounded-full bg-[#eef2ff] px-3 py-1 font-medium text-[#111827]">
                    {authUser.name || authUser.email}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#ecfdf3] px-3 py-1 font-medium text-[#166534]">
                    {authUser.role}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-[#f3f4ff] px-3 py-1 font-medium text-[#4b5563]">
                    ID: {authUser.id}
                  </span>
                </div>
              )}
            </div>
            <div className="hidden flex-col items-end gap-2 sm:flex">
              {!isPro ? (
                <button
                  type="button"
                  onClick={() => {
                    setSection("pro");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#4f46e5] via-[#191970] to-[#0f0f5a] px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_28px_rgba(79,70,229,0.55)] transition hover:shadow-[0_10px_36px_rgba(79,70,229,0.7)] hover:scale-[1.04] active:scale-[0.98]"
                  style={{ letterSpacing: "0.01em" }}
                >
                  <svg className="h-4 w-4 shrink-0 text-yellow-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {lang === "ru"
                    ? "Купить PRO версию"
                    : lang === "en"
                      ? "Buy PRO version"
                      : "PRO versiyani sotib olish"}
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {t.sectionProActive}
                </span>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] px-3 py-1.5 text-[11px] font-medium text-[#6b7280] transition hover:bg-[#f3f4f6]"
              >
                <span>{logoutLabel}</span>
              </button>
            </div>
          </div>
        </section>

        <section className="mt-4 space-y-4 sm:mt-6 sm:space-y-6">
          {/* Mobile / tablet: stacked menu card */}
          <div className="space-y-3 rounded-[22px] border border-[#e5edff] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.12)] sm:rounded-[26px] sm:p-5 lg:hidden">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#6b7280]">
                {lang === "ru" ? "МЕНЮ" : lang === "en" ? "MENU" : "MENYU"}
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] px-3 py-1.5 text-[11px] font-medium text-[#6b7280] transition hover:bg-[#f3f4f6]"
              >
                <span>{logoutLabel}</span>
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {navItems.map(([id, label]) => {
                const active = section === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setSection(id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-xs font-medium transition-all sm:px-4 sm:py-2.5 ${
                      active
                        ? "bg-[#191970] text-white shadow-[0_10px_28px_rgba(15,23,42,0.45)]"
                        : "bg-[#f9fbff] text-[#111827] hover:bg-[#eef2ff]"
                    }`}
                  >
                    <span>{label}</span>
                    {active && (
                      <span className="ml-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
            {hasCard && (
              <div className="mt-2 rounded-2xl bg-[#ecfdf3] p-3 text-[11px] text-[#166534]">
                <p className="font-semibold">
                  {lang === "ru"
                    ? "Карта добавлена"
                    : lang === "en"
                      ? "Payment card saved"
                      : "To'lov kartasi qo'shildi"}
                </p>
                <p className="mt-0.5 text-[#166534]/80">
                  {lang === "ru"
                    ? "Вы можете оплачивать туры и открывать новые планы без повторного ввода данных."
                    : lang === "en"
                      ? "You can now unlock plans and pay for trips without entering details again."
                      : "Endi turlarni unlock qilish va to'lash uchun kartani qayta kiritish shart emas."}
                </p>
                <p className="mt-1 text-[#15803d]">
                  **** **** ****{" "}
                  {(() => {
                    if (typeof window === "undefined") return "0000";
                    try {
                      const raw = window.localStorage.getItem(PAYMENT_CARD_KEY);
                      if (!raw) return "0000";
                      const parsed = JSON.parse(raw) as { last4?: string };
                      return parsed.last4 || "0000";
                    } catch {
                      return "0000";
                    }
                  })()}
                </p>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
          <aside className="hidden space-y-3 rounded-[22px] border border-[#e5edff] bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.12)] lg:block sm:rounded-[26px] sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#6b7280]">
                {lang === "ru" ? "МЕНЮ" : lang === "en" ? "MENU" : "MENYU"}
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#e5e7eb] px-3 py-1.5 text-[11px] font-medium text-[#6b7280] transition hover:bg-[#f3f4f6]"
              >
                <span>{logoutLabel}</span>
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {navItems.map(([id, label]) => {
                const active = section === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSection(id)}
                    className={`flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-xs font-medium transition-all sm:px-4 sm:py-2.5 ${
                      active
                        ? "bg-[#191970] text-white shadow-[0_10px_28px_rgba(15,23,42,0.45)]"
                        : "bg-[#f9fbff] text-[#111827] hover:bg-[#eef2ff]"
                    }`}
                  >
                    <span>{label}</span>
                    {active && (
                      <span className="ml-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>
            {hasCard && (
              <div className="mt-2 rounded-2xl bg-[#ecfdf3] p-3 text-[11px] text-[#166534]">
                <p className="font-semibold">
                  {lang === "ru"
                    ? "Карта добавлена"
                    : lang === "en"
                      ? "Payment card saved"
                      : "To'lov kartasi qo'shildi"}
                </p>
                <p className="mt-0.5 text-[#166534]/80">
                  {lang === "ru"
                    ? "Вы можете оплачивать туры и открывать новые планы без повторного ввода данных."
                    : lang === "en"
                      ? "You can now unlock plans and pay for trips without entering details again."
                      : "Endi turlarni unlock qilish va to'lash uchun kartani qayta kiritish shart emas."}
                </p>
                <p className="mt-1 text-[#15803d]">
                  **** **** ****{" "}
                  {(() => {
                    if (typeof window === "undefined") return "0000";
                    try {
                      const raw = window.localStorage.getItem(PAYMENT_CARD_KEY);
                      if (!raw) return "0000";
                      const parsed = JSON.parse(raw) as { last4?: string };
                      return parsed.last4 || "0000";
                    } catch {
                      return "0000";
                    }
                  })()}
                </p>
              </div>
            )}
          </aside>

          <div className="space-y-4 sm:space-y-5">
          {section === "profile" && (
            <div className="rounded-[22px] border border-[#d8e7ff] bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.12)] sm:rounded-[26px] sm:p-6">
              <h2 className="text-lg font-semibold text-[#0f172a] sm:text-xl">
                {t.sectionProfile}
              </h2>
              <p className="mt-1 text-xs text-[#6b7280]">
                {lang === "uz"
                  ? "Profil ma'lumotlaringizni yangilab turing — agentlar siz bilan tezroq aloqaga chiqishi osonlashadi."
                  : lang === "ru"
                    ? "Обновляйте данные профиля, чтобы агентам было проще связаться с вами."
                    : "Keep your details up to date so our team can easily reach you when needed."}
              </p>
              <form
                className="mt-4 grid gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4"
                onSubmit={(event) => event.preventDefault()}
              >
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-medium text-[#374151]">
                    {t.profileNameLabel}
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(event) => setProfileName(event.target.value)}
                    className="w-full rounded-xl border border-[#d8e7ff] bg-[#f9fbff] px-3 py-2.5 text-sm outline-none transition focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
                    placeholder={
                      lang === "uz"
                        ? "Masalan, Azizbek Karimov"
                        : lang === "ru"
                          ? "Например, Анна Иванова"
                          : "e.g. John Smith"
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#374151]">
                    {t.profileEmailLabel}
                  </label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(event) => setProfileEmail(event.target.value)}
                    className="w-full rounded-xl border border-[#d8e7ff] bg-[#f9fbff] px-3 py-2.5 text-sm outline-none transition focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-[#374151]">
                    {t.profilePhoneLabel}
                  </label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(event) => setProfilePhone(event.target.value)}
                    className="w-full rounded-xl border border-[#d8e7ff] bg-[#f9fbff] px-3 py-2.5 text-sm outline-none transition focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-xs font-medium text-[#374151]">
                    {t.profileLanguageLabel}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(["uz", "ru", "en"] as Lang[]).map((code) => {
                      const active = lang === code;
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setLang(code)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                            active
                              ? "bg-[#191970] text-white shadow-[0_8px_22px_rgba(15,23,42,0.4)]"
                              : "bg-[#eef2ff] text-[#111827] hover:bg-[#e0e7ff]"
                          }`}
                        >
                          {code.toUpperCase()}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="mt-2 inline-flex items-center justify-center rounded-2xl bg-[#191970] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(15,23,42,0.45)] transition hover:bg-[#12124f]"
                  >
                    {t.profileSaveButton}
                  </button>
                </div>
              </form>
            </div>
          )}

          {section === "payments" && (
            <div className="rounded-[22px] border border-[#d8e7ff] bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.12)] sm:rounded-[26px] sm:p-6">
              <h2 className="text-lg font-semibold text-[#0f172a] sm:text-xl">
                {t.sectionPayments}
              </h2>
              <p className="mt-1 text-xs text-[#6b7280]">
                {t.paymentsCardSubtitle}
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="rounded-[18px] border border-[#e5edff] bg-[#f9fbff] p-4">
                  <p className="text-sm font-semibold text-[#111827]">
                    {t.paymentsCardTitle}
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-[#4b5563]">
                    <li>• {t.paymentsMethodVisa}</li>
                    <li>• {t.paymentsMethodCash}</li>
                  </ul>
                  {!hasCard && (
                    <button
                      type="button"
                      onClick={() => setIsAddingCard(true)}
                      className="mt-3 inline-flex items-center justify-center rounded-xl bg-[#191970] px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_22px_rgba(15,23,42,0.45)] transition hover:bg-[#12124f]"
                    >
                      {t.paymentsAddCard}
                    </button>
                  )}
                </div>
                <div className="rounded-[18px] border border-dashed border-[#e5edff] bg-[#faf5ff] p-4 text-xs text-[#4b5563]">
                  {lang === "uz"
                    ? "Tez orada bu bo'limda kartani saqlash, avtomatik to'lov va cheklarni yuklab olish imkoniyati qo'shiladi."
                    : lang === "ru"
                      ? "Скоро здесь появится сохранение карт, автосписание и выгрузка чеков в один клик."
                      : "Soon you’ll be able to save cards, enable auto‑charge and download invoices from one place."}
                </div>
              </div>
              {hasCard && savedCard && (
                <div className="mt-5 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b7280]">
                    {lang === "ru"
                      ? "Сохранённые карты"
                      : lang === "en"
                        ? "Saved cards"
                        : "Saqlangan kartalar"}
                  </p>
                  <div className="relative rounded-[24px] border border-[#c7d2ff] bg-gradient-to-br from-[#3b4fd8] via-[#4c63e8] to-[#5f7af5] p-4 text-white shadow-[0_16px_38px_rgba(79,70,229,0.45)] backdrop-blur-[3px] sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <p className="inline-flex items-center rounded-full bg-white/12 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[#bfdbfe]">
                          {savedCard.brand === "demo"
                            ? "Demo card"
                            : savedCard.brand}
                        </p>
                        <p className="text-lg font-semibold tracking-[0.14em] text-white sm:text-xl">
                          {savedCard.masked}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-white/70">
                          <span>
                            {lang === "ru"
                              ? "Действует до"
                              : lang === "en"
                                ? "Valid thru"
                                : "Amal qilish muddati"}{" "}
                            <span className="font-medium text-white">
                              {savedCard.expiry}
                            </span>
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-300" />
                            <span className="text-[11px] text-emerald-200">
                              {lang === "ru"
                                ? "Основная карта"
                                : lang === "en"
                                  ? "Default card"
                                  : "Asosiy karta"}
                            </span>
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end justify-between">
                        <p className="max-w-[130px] text-right text-[11px] font-medium text-white">
                          {savedCard.name}
                        </p>
                        <p className="mt-4 text-[11px] tracking-[0.35em] text-white/60">
                          ●●●
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowCardMenu((open) => !open)}
                      className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
                      aria-label="Card actions"
                    >
                      <span className="flex h-3 w-3 flex-col items-center justify-between">
                        <span className="h-[3px] w-[3px] rounded-full bg-current" />
                        <span className="h-[3px] w-[3px] rounded-full bg-current" />
                        <span className="h-[3px] w-[3px] rounded-full bg-current" />
                      </span>
                    </button>
                    {showCardMenu && (
                      <div className="absolute right-3 top-11 z-10 w-40 rounded-xl bg-white/95 p-2 text-[11px] text-[#111827] shadow-[0_12px_30px_rgba(15,23,42,0.45)] backdrop-blur">
                        <button
                          type="button"
                          onClick={() => {
                            setShowCardMenu(false);
                            handleChangeCard();
                          }}
                          className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left hover:bg-[#eff4ff]"
                        >
                          <span>
                            {lang === "ru"
                              ? "Изменить карту"
                              : lang === "en"
                                ? "Edit card"
                                : "Kartani tahrirlash"}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowCardMenu(false);
                            handleDeleteCard();
                          }}
                          className="mt-1 flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-red-600 hover:bg-red-50"
                        >
                          <span>
                            {lang === "ru"
                              ? "Удалить карту"
                              : lang === "en"
                                ? "Delete card"
                                : "Kartani o‘chirish"}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* Кнопка "Создать тур" убрана по новым требованиям */}
            </div>
          )}

          {section === "pro" && (
            <div className="rounded-[22px] border border-[#d8e7ff] bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.12)] sm:rounded-[26px] sm:p-6">
              <h2 className="text-lg font-semibold text-[#0f172a] sm:text-xl">
                {t.sectionPro}
              </h2>
              <div className="mt-4 rounded-[18px] border border-[#e5edff] bg-[#f9fbff] p-4 text-sm text-[#4b5563]">
                <p>
                  {lang === "ru"
                    ? "PRO версия действует только на 25 генераций тура для одного аккаунта. После 25-й генерации PRO отключается автоматически."
                    : lang === "en"
                      ? "PRO works for up to 25 tour generations per account. After the 25th generated tour, PRO is turned off automatically."
                      : "PRO versiya bitta akkaunt uchun 25 ta tur generatsiyasigacha amal qiladi. 25-turdan keyin PRO avtomatik o‘chadi."}
                </p>
                {proStatus && (
                  <p className="mt-2 text-xs font-medium text-[#334155]">
                    {lang === "ru"
                      ? `Использовано: ${proStatus.generationsUsed}/${proStatus.generationsLimit}. Осталось: ${proStatus.generationsLeft}.`
                      : lang === "en"
                        ? `Used: ${proStatus.generationsUsed}/${proStatus.generationsLimit}. Left: ${proStatus.generationsLeft}.`
                        : `Ishlatilgan: ${proStatus.generationsUsed}/${proStatus.generationsLimit}. Qoldi: ${proStatus.generationsLeft}.`}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={async () => {
                  if (!hasCard) {
                    setShowProNoCard(true);
                    return;
                  }
                  if (typeof window === "undefined" || !authToken) return;
                  setIsBuyingPro(true);
                  try {
                    const status = await activateMyPro(authToken);
                    setProStatus(status);
                    window.localStorage.setItem(PRO_KEY, status.active ? "true" : "false");
                    setIsBuyingPro(false);
                    setIsPro(status.active);
                    setShowProSuccess(true);
                    setSection("proActive");
                  } catch {
                    setIsBuyingPro(false);
                  }
                }}
                disabled={isBuyingPro}
                className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base font-bold text-white shadow-[0_10px_32px_rgba(79,70,229,0.5)] transition hover:shadow-[0_12px_40px_rgba(79,70,229,0.7)] hover:scale-[1.02] active:scale-[0.98] ${
                  isBuyingPro
                    ? "bg-[#4f46e5]/80 cursor-wait"
                    : "bg-gradient-to-r from-[#4f46e5] via-[#191970] to-[#0f0f5a]"
                }`}
              >
                {isBuyingPro ? (
                  <span className="inline-flex h-4 w-4 items-center justify-center">
                    <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  </span>
                ) : (
                  <svg className="h-5 w-5 shrink-0 text-yellow-300" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                )}
                {lang === "ru" ? "Купить PRO версию" : lang === "en" ? "Buy PRO version" : "PRO versiyani sotib olish"}
              </button>
            </div>
          )}

          {section === "proActive" && (
            <div className="rounded-[22px] border border-[#d8e7ff] bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.12)] sm:rounded-[26px] sm:p-6">
              <h2 className="text-lg font-semibold text-[#0f172a] sm:text-xl">
                {t.sectionProActive}
              </h2>
              <p className="mt-3 text-sm text-[#4b5563]">
                {lang === "ru"
                  ? "PRO версия активна до 25 генераций туров на аккаунт. После достижения лимита PRO отключится автоматически."
                  : lang === "en"
                    ? "Your PRO plan is active for up to 25 generated tours per account. After reaching the limit, PRO will be disabled automatically."
                    : "PRO versiya bitta akkauntda 25 ta tur generatsiyasigacha faol. Limitga yetgach, PRO avtomatik o‘chadi."}
              </p>
              {proStatus && (
                <p className="mt-2 text-xs font-medium text-[#334155]">
                  {lang === "ru"
                    ? `Использовано: ${proStatus.generationsUsed}/${proStatus.generationsLimit}. Осталось: ${proStatus.generationsLeft}.`
                    : lang === "en"
                      ? `Used: ${proStatus.generationsUsed}/${proStatus.generationsLimit}. Left: ${proStatus.generationsLeft}.`
                      : `Ishlatilgan: ${proStatus.generationsUsed}/${proStatus.generationsLimit}. Qoldi: ${proStatus.generationsLeft}.`}
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  if (typeof window === "undefined") return;
                  window.location.href = "/?builder=ready";
                }}
                className="mt-5 inline-flex items-center justify-center rounded-2xl bg-[#191970] px-5 py-2 text-sm font-semibold text-white shadow-[0_10px_26px_rgba(15,23,42,0.45)] transition hover:bg-[#12124f]"
              >
                {lang === "ru"
                  ? "Перейти к сгенерированным турам"
                  : lang === "en"
                    ? "Go to generated tours"
                    : "Generatsiya qilingan turlarga o‘tish"}
              </button>
            </div>
          )}
          </div>
        </div>
      </section>
      </main>

      {showProSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.55)]">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-3 text-base font-semibold text-[#0f172a] sm:text-lg">
                {lang === "ru"
                  ? "PRO версия успешно подключена"
                  : lang === "en"
                    ? "PRO plan activated"
                    : "PRO versiya muvaffaqiyatli yoqildi"}
              </h3>
              <p className="mt-2 text-sm text-[#4b5563]">
                {lang === "ru"
                  ? "Теперь вы можете открывать любые полные планы туров без ограничений."
                  : lang === "en"
                    ? "You can now open any full trip plan without limits."
                    : "Endi istalgan to‘liq tur rejasini cheklovsiz ko‘rishingiz mumkin."}
              </p>
              <button
                type="button"
                onClick={() => setShowProSuccess(false)}
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#191970] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#12124f]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showProNoCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.55)]">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
                </svg>
              </div>
              <h3 className="mt-3 text-base font-semibold text-[#0f172a] sm:text-lg">
                {lang === "ru"
                  ? "Карта не добавлена"
                  : lang === "en"
                    ? "No card added"
                    : "Karta qo‘shilmagan"}
              </h3>
              <p className="mt-2 text-sm text-[#4b5563]">
                {lang === "ru"
                  ? "Чтобы купить PRO версию, сначала добавьте платёжную карту в разделе «Платёжные настройки»."
                  : lang === "en"
                    ? "To buy the PRO version, please add a payment card first in “Payment settings”."
                    : "PRO versiyani sotib olish uchun avval «To‘lov sozlamalari» bo‘limida kartani qo‘shing."}
              </p>
              <div className="mt-4 flex justify-end gap-2 w-full">
                <button
                  type="button"
                  onClick={() => setShowProNoCard(false)}
                  className="rounded-xl border border-[#e5e7eb] px-4 py-2 text-xs font-semibold text-[#4b5563] hover:bg-[#f3f4f6]"
                >
                  {lang === "ru" ? "Позже" : lang === "en" ? "Later" : "Keyinroq"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowProNoCard(false);
                    if (typeof window === "undefined") return;
                    window.location.href = "/profile?section=payments";
                  }}
                  className="rounded-xl bg-[#191970] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#12124f]"
                >
                  {lang === "ru"
                    ? "Перейти к картам"
                    : lang === "en"
                      ? "Go to cards"
                      : "Kartalar bo‘limiga o‘tish"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.55)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#64748b]">
                  {lang === "ru"
                    ? "Добавить карту"
                    : lang === "en"
                      ? "Add payment card"
                      : "To'lov kartasi"}
                </p>
                <h3 className="mt-1 text-base font-bold text-[#0f172a] sm:text-lg">
                  {lang === "ru"
                    ? "Данные карты (демо)"
                    : lang === "en"
                      ? "Card details (demo)"
                      : "Karta ma'lumotlari (demo)"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (isSavingCard) return;
                  setIsAddingCard(false);
                }}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f3f4ff] text-[#6b7280] hover:bg-[#e5e7ff]"
                aria-label="Close"
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="mt-3 space-y-2.5" onSubmit={handleAddCardSubmit}>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#374151]">
                  {lang === "ru"
                    ? "Номер карты"
                    : lang === "en"
                      ? "Card number"
                      : "Karta raqami"}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={19}
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  className="w-full rounded-xl border border-[#d8e7ff] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-[11px] font-medium text-[#374151]">
                  {lang === "ru"
                    ? "Имя и фамилия"
                    : lang === "en"
                      ? "Name on card"
                      : "Ism va familiya"}
                </label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(event) => setCardName(event.target.value)}
                  className="w-full rounded-xl border border-[#d8e7ff] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-[#374151]">
                    {lang === "ru"
                      ? "Срок действия"
                      : lang === "en"
                        ? "Expiry (MM/YY)"
                        : "Amal qilish muddati (AA/YY)"}
                  </label>
                  <input
                    type="text"
                    placeholder="12/26"
                    maxLength={5}
                    value={cardExpiry}
                    onChange={handleCardExpiryChange}
                    className="w-full rounded-xl border border-[#d8e7ff] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[11px] font-medium text-[#374151]">
                    CVV
                  </label>
                  <input
                    type="password"
                    maxLength={3}
                    value={cardCvv}
                    onChange={handleCardCvvChange}
                    className="w-full rounded-xl border border-[#d8e7ff] bg-white px-3 py-2 text-xs outline-none transition focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
                  />
                </div>
              </div>

              {cardError && (
                <p className="text-[11px] text-red-600">
                  {cardError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSavingCard}
                className={`mt-2 inline-flex w-full items-center justify-center rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-[0_8px_22px_rgba(15,23,42,0.45)] transition ${
                  isSavingCard
                    ? "bg-[#4f46e5]/80 cursor-wait"
                    : "bg-[#191970] hover:bg-[#12124f]"
                }`}
              >
                {isSavingCard && (
                  <span className="mr-2 inline-flex h-3.5 w-3.5 items-center justify-center">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-[1.5px] border-white/40 border-t-white" />
                  </span>
                )}
                {isSavingCard
                  ? lang === "ru"
                    ? "Сохраняем карту..."
                    : lang === "en"
                      ? "Saving card..."
                      : "Karta saqlanmoqda..."
                  : lang === "ru"
                    ? "Сохранить карту"
                    : lang === "en"
                      ? "Save card"
                      : "Kartani saqlash"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

