"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LANG_STORAGE_KEY, MainNavbar, NavItemId } from "@/components/main-navbar";
import { postJson } from "@/lib/api";

type Lang = "uz" | "ru" | "en";

const contactDictionary: Record<
  Lang,
  {
    navHome: string;
    navAbout: string;
    navTours: string;
    navWhy: string;
    title: string;
    subtitle: string;
    kicker: string;
    formTitle: string;
    formFullName: string;
    formEmail: string;
    formPhone: string;
    formSubject: string;
    formMessage: string;
    formButton: string;
    agencyName: string;
    agencyTagline: string;
    addressLabel: string;
    addressValue: string;
    phoneLabel: string;
    phoneValue: string;
    emailLabel: string;
    emailValue: string;
    hoursLabel: string;
    hoursValue: string;
    mapLabel: string;
    footerAbout: string;
    footerNav: string;
    footerContact: string;
    footerLocation: string;
    footerCopy: string;
    footerContactCta: string;
    createTripLabel: string;
  }
> = {
  uz: {
    navHome: "Bosh sahifa",
    navAbout: "Biz haqimizda",
    navTours: "Yo'nalishlar",
    navWhy: "Nega TOURLY.UZ?",
    title: "Biz bilan bog'laning",
    subtitle:
      "Savollaringiz, takliflaringiz yoki hamkorlik bo'yicha murojaatlaringizni shu yerdan yuborishingiz mumkin.",
    kicker: "Aloqa",
    formTitle: "Xabar yuborish",
    formFullName: "To'liq ism",
    formEmail: "Email manzil",
    formPhone: "Telefon raqam",
    formSubject: "Mavzu",
    formMessage: "Sizning xabaringiz",
    formButton: "Xabar yuborish",
    agencyName: "TOURLY.UZ",
    agencyTagline: "O'zbekiston bo'ylab aqlli sayohat rejalashtirish",
    addressLabel: "Manzil",
    addressValue: "Alisher Navoiy ko'chasi, Toshkent, O'zbekiston",
    phoneLabel: "Telefon",
    phoneValue: "+998 (90) 000-00-00",
    emailLabel: "Email",
    emailValue: "hello@tourly.uz",
    hoursLabel: "Ish vaqti",
    hoursValue: "24/7",
    mapLabel: "Toshkent, O'zbekiston",
    footerAbout: "TOURLY.UZ - O'zbekiston bo'ylab aqlli sayohat rejalashtirish platformasi.",
    footerNav: "Bo'limlar",
    footerContact: "Aloqa",
    footerLocation: "Toshkent, O'zbekiston",
    footerCopy: "Barcha huquqlar himoyalangan.",
    footerContactCta: "Biz bilan bog'lanish",
    createTripLabel: "Yangi Tur Yaratish"
  },
  ru: {
    navHome: "Главная",
    navAbout: "О нас",
    navTours: "Направления",
    navWhy: "Почему TOURLY.UZ?",
    title: "Свяжитесь с нами",
    subtitle:
      "Задайте вопросы, предложите улучшения или обсудите партнёрство — мы ответим в кратчайшие сроки.",
    kicker: "Контакты",
    formTitle: "Отправить сообщение",
    formFullName: "Полное имя",
    formEmail: "E‑mail",
    formPhone: "Номер телефона",
    formSubject: "Тема",
    formMessage: "Ваше сообщение",
    formButton: "Отправить",
    agencyName: "TOURLY.UZ",
    agencyTagline: "Умное планирование путешествий по Узбекистану",
    addressLabel: "Адрес",
    addressValue: "улица Алишера Навои, Ташкент, Узбекистан",
    phoneLabel: "Телефон",
    phoneValue: "+998 (90) 000-00-00",
    emailLabel: "Email",
    emailValue: "hello@tourly.uz",
    hoursLabel: "Часы работы",
    hoursValue: "24/7",
    mapLabel: "Ташкент, Узбекистан",
    footerAbout: "TOURLY.UZ - платформа умного планирования путешествий по Узбекистану.",
    footerNav: "Разделы",
    footerContact: "Контакты",
    footerLocation: "Ташкент, Узбекистан",
    footerCopy: "Все права защищены.",
    footerContactCta: "Связаться с нами",
    createTripLabel: "Создать Новый Тур"
  },
  en: {
    navHome: "Home",
    navAbout: "About",
    navTours: "Destinations",
    navWhy: "Why TOURLY",
    title: "Contact us",
    subtitle:
      "Send us your questions, ideas, or partnership requests — we will get back to you as soon as possible.",
    kicker: "Contact",
    formTitle: "Send a message",
    formFullName: "Full name",
    formEmail: "Email address",
    formPhone: "Phone number",
    formSubject: "Subject",
    formMessage: "Your message",
    formButton: "Send message",
    agencyName: "TOURLY.UZ",
    agencyTagline: "Smart travel planning across Uzbekistan",
    addressLabel: "Address",
    addressValue: "Alisher Navoi Street, Tashkent, Uzbekistan",
    phoneLabel: "Phone",
    phoneValue: "+998 (90) 000-00-00",
    emailLabel: "Email",
    emailValue: "hello@tourly.uz",
    hoursLabel: "Working hours",
    hoursValue: "24/7",
    mapLabel: "Tashkent, Uzbekistan",
    footerAbout: "TOURLY.UZ - smart travel planning platform for Uzbekistan.",
    footerNav: "Sections",
    footerContact: "Contact",
    footerLocation: "Tashkent, Uzbekistan",
    footerCopy: "All rights reserved.",
    footerContactCta: "Contact us",
    createTripLabel: "Create a New Trip"
  }
};

export default function ContactPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("uz");
  const t = contactDictionary[lang];

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY) as Lang | null;
    if (stored === "uz" || stored === "ru" || stored === "en") setLang(stored);
  }, []);

  const handleNavClick = (id: NavItemId) => {
    window.location.href = `/#${id}`;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await postJson<{ ok: boolean }>("/api/contact", {
        name: fullName,
        email,
        phone,
        subject,
        message
      });

      setFullName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
      setShowModal(true);
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    } finally {
      setLoading(false);
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

      <section className="mt-4 rounded-[24px] border border-[#d8e7ff] bg-gradient-to-br from-[#eff4ff] via-white to-[#f4f0ff] p-5 shadow-[0_14px_40px_rgba(15,23,42,0.14)] sm:rounded-[30px] sm:p-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#64748b]">
            {t.kicker}
          </p>
          <h1 className="mt-2 text-2xl font-bold text-[#0f172a] sm:mt-3 sm:text-3xl">{t.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">{t.subtitle}</p>
        </div>
      </section>

      <section className="mt-4 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        <div className="rounded-[22px] border border-[#d8e7ff] bg-white p-5 shadow-[0_12px_36px_rgba(15,23,42,0.14)] sm:rounded-[26px] sm:p-8">
          <h2 className="text-lg font-semibold text-[#0f172a] sm:text-2xl">{t.formTitle}</h2>
          <p className="mt-1.5 text-xs text-[#6b7280]">
            {lang === "uz"
              ? "Quyidagi formani to'ldiring — sizga tez orada javob beramiz."
              : lang === "ru"
                ? "Заполните форму ниже — мы свяжемся с вами в ближайшее время."
                : "Fill in the form below and we will get back to you shortly."}
          </p>

          {error && (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
              {error}
            </div>
          )}

          <form
            className="mt-5 space-y-3 sm:mt-6 sm:space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#374151]">{t.formFullName}</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-[#d8e7ff] bg-[#f9fbff] px-3 py-2.5 text-sm outline-none transition focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#374151]">{t.formEmail}</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#d8e7ff] bg-[#f9fbff] px-3 py-2.5 text-sm outline-none transition focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
                />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#374151]">{t.formPhone}</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-[#d8e7ff] bg-[#f9fbff] px-3 py-2.5 text-sm outline-none transition focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-[#374151]">{t.formSubject}</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-[#d8e7ff] bg-[#f9fbff] px-3 py-2.5 text-sm outline-none transition focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-[#374151]">{t.formMessage}</label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full resize-none rounded-xl border border-[#d8e7ff] bg-[#f9fbff] px-3 py-2.5 text-sm outline-none transition focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30 sm:rows-5"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#191970] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.5)] transition hover:bg-[#12124f] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
            >
              {loading
                ? lang === "ru"
                  ? "Отправляем..."
                  : lang === "en"
                    ? "Sending..."
                    : "Yuborilmoqda..."
                : t.formButton}
            </button>
          </form>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {[
              { icon: "📞", label: t.phoneLabel, value: t.phoneValue },
              { icon: "✉️", label: t.emailLabel, value: t.emailValue }
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-2.5 rounded-[18px] border border-[#d8e7ff] bg-white p-3 shadow-sm sm:p-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#eef2ff] text-sm">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6b7280]">
                    {item.label}
                  </p>
                  <p className="mt-0.5 break-words text-xs text-[#111827]">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="mt-5 rounded-[22px] border border-[#10104a] bg-[#191970] p-5 shadow-[0_8px_24px_rgba(6,10,40,0.6)] sm:mt-8 sm:rounded-[26px] sm:p-6">
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <p className="text-base font-bold text-white sm:text-lg">TOURLY.UZ</p>
            <p className="mt-1.5 text-sm text-white/80">{t.footerAbout}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{t.footerNav}</p>
            <div className="mt-2 space-y-1 text-sm text-white/80">
              <Link href="/" className="block hover:text-white">
                {t.navHome}
              </Link>
              <Link href="/#tours" className="block hover:text-white">
                {t.navTours}
              </Link>
              <Link href="/#why" className="block hover:text-white">
                {t.navWhy}
              </Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{t.footerContact}</p>
            <div className="mt-2 space-y-1 text-sm text-white/80">
              <a href={`mailto:${t.emailValue}`} className="block hover:text-white">
                {t.emailValue}
              </a>
              <a href={`tel:${t.phoneValue.replace(/[^+\d]/g, "")}`} className="block hover:text-white">
                {t.phoneValue}
              </a>
              <p>{t.footerLocation}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 border-t border-white/20 pt-4 text-xs text-white/60">
          © 2026 TOURLY.UZ. {t.footerCopy}
        </div>
      </footer>
    </main>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.55)]">
            <h3 className="text-base font-semibold text-[#0f172a] sm:text-lg">
              {lang === "ru"
                ? "Спасибо за сообщение!"
                : lang === "en"
                  ? "Thank you for your message!"
                  : "Xabaringiz uchun rahmat!"}
            </h3>
            <p className="mt-2 text-sm text-[#4b5563]">
              {lang === "ru"
                ? "Мы получили ваш запрос и скоро свяжемся с вами."
                : lang === "en"
                  ? "We’ve received your request and will contact you soon."
                  : "So‘rovingizni oldik, tez orada siz bilan bog‘lanamiz."}
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl bg-[#191970] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#12124f]"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

