"use client";

import { useState } from "react";
import { MainNavbar, NavItemId } from "@/components/main-navbar";

type Lang = "uz" | "ru" | "en";

const contactDictionary: Record<
  Lang,
  {
    navHome: string;
    navAbout: string;
    navTours: string;
    navWhy: string;
    navReviews: string;
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
    navReviews: "Sharhlar",
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
    navReviews: "Отзывы",
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
    navReviews: "Reviews",
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
  const [lang, setLang] = useState<Lang>("uz");
  const t = contactDictionary[lang];

  const handleNavClick = (id: NavItemId) => {
    window.location.href = `/#${id}`;
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <MainNavbar
        lang={lang}
        labels={{
          home: t.navHome,
          about: t.navAbout,
          tours: t.navTours,
          why: t.navWhy,
          reviews: t.navReviews
        }}
        onLangChange={setLang}
        createTripLabel={t.createTripLabel}
        onNavClick={handleNavClick}
      />

      <section className="mt-4 rounded-[30px] border border-[#d8e7ff] bg-gradient-to-br from-[#eff4ff] via-white to-[#f4f0ff] p-6 shadow-[0_16px_44px_rgba(15,23,42,0.16)] sm:p-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#64748b]">
            {t.kicker}
          </p>
          <h1 className="mt-3 text-2xl font-bold text-[#0f172a] sm:text-3xl">{t.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">{t.subtitle}</p>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        <div className="rounded-[26px] border border-[#d8e7ff] bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.16)] sm:p-8">
          <h2 className="text-xl font-semibold text-[#0f172a] sm:text-2xl">{t.formTitle}</h2>
          <p className="mt-2 text-xs text-[#6b7280]">
            {lang === "uz"
              ? "Quyidagi formani to'ldiring — sizga tez orada javob beramiz."
              : lang === "ru"
                ? "Заполните форму ниже — мы свяжемся с вами в ближайшее время."
                : "Fill in the form below and we will get back to you shortly."}
          </p>
          <form
            className="mt-6 space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1 text-sm">
                <label className="block text-xs font-medium text-[#374151]">{t.formFullName}</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-[#d8e7ff] bg-[#f9fbff] px-3 py-2 text-sm outline-none focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
                />
              </div>
              <div className="space-y-1 text-sm">
                <label className="block text-xs font-medium text-[#374151]">{t.formEmail}</label>
                <input
                  type="email"
                  className="w-full rounded-xl border border-[#d8e7ff] bg-[#f9fbff] px-3 py-2 text-sm outline-none focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1 text-sm">
                <label className="block text-xs font-medium text-[#374151]">{t.formPhone}</label>
                <input
                  type="tel"
                  className="w-full rounded-xl border border-[#d8e7ff] bg-[#f9fbff] px-3 py-2 text-sm outline-none focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
                />
              </div>
              <div className="space-y-1 text-sm">
                <label className="block text-xs font-medium text-[#374151]">{t.formSubject}</label>
                <input
                  type="text"
                  className="w-full rounded-xl border border-[#d8e7ff] bg-[#f9fbff] px-3 py-2 text-sm outline-none focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
                />
              </div>
            </div>
            <div className="space-y-1 text-sm">
              <label className="block text-xs font-medium text-[#374151]">{t.formMessage}</label>
              <textarea
                rows={5}
                className="w-full rounded-xl border border-[#d8e7ff] bg-[#f9fbff] px-3 py-2 text-sm outline-none focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/30"
              />
            </div>
            <button
              type="submit"
              className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-[#fbbf24] px-6 py-3 text-sm font-semibold text-[#1f2937] shadow-[0_10px_30px_rgba(245,158,11,0.55)] transition hover:bg-[#f59e0b] md:w-auto"
            >
              {t.formButton}
            </button>
          </form>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-[22px] border border-[#d8e7ff] bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.14)]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#191970] text-white text-sm font-bold">
              T
            </div>
            <div>
              <p className="text-sm font-semibold text-[#0f172a]">{t.agencyName}</p>
              <p className="text-xs text-[#6b7280]">{t.agencyTagline}</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-[20px] border border-[#d8e7ff] bg-white p-4 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#191970]">
                📍
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  {t.addressLabel}
                </p>
                <p className="mt-1 text-sm text-[#111827]">{t.addressValue}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[20px] border border-[#d8e7ff] bg-white p-4 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#191970]">
                📞
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  {t.phoneLabel}
                </p>
                <p className="mt-1 text-sm text-[#111827]">{t.phoneValue}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[20px] border border-[#d8e7ff] bg-white p-4 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#191970]">
                ✉️
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  {t.emailLabel}
                </p>
                <p className="mt-1 text-sm text-[#111827]">{t.emailValue}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[20px] border border-[#d8e7ff] bg-white p-4 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#eef2ff] text-[#191970]">
                ⏰
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
                  {t.hoursLabel}
                </p>
                <p className="mt-1 text-sm text-[#111827]">{t.hoursValue}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[24px] border border-[#d8e7ff] bg-white shadow-[0_14px_40px_rgba(15,23,42,0.16)]">
        <div className="flex items-center justify-between px-4 pt-4 text-xs text-[#4b5563] sm:px-6">
          <p className="font-medium">{t.mapLabel}</p>
          <span className="hidden sm:inline text-[11px] text-[#6b7280]">Google Maps</span>
        </div>
        <div className="mt-3 h-64 w-full sm:h-80">
          <iframe
            title="Tashkent map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.414343879657!2d69.2642410764786!3d41.31115817131219!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8b29c2b9c60b%3A0x8f8c4782555026a7!2sTashkent!5e0!3m2!1sen!2suz!4v1700000000000"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <footer className="mt-8 rounded-[26px] border border-[#10104a] bg-[#191970] p-6 shadow-[0_8px_24px_rgba(6,10,40,0.6)]">
        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <p className="text-lg font-bold text-white">TOURLY.UZ</p>
            <p className="mt-2 text-sm text-white/80">{t.footerAbout}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{t.footerNav}</p>
            <div className="mt-2 space-y-1 text-sm text-white/80">
              <p>{t.navHome}</p>
              <p>{t.navTours}</p>
              <p>{t.navWhy}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{t.footerContact}</p>
            <div className="mt-2 space-y-1 text-sm text-white/80">
              <p>{t.emailValue}</p>
              <p>{t.phoneValue}</p>
              <p>{t.footerLocation}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 border-t border-white/20 pt-4 text-xs text-white/60">
          © 2026 TOURLY.UZ. {t.footerCopy}
        </div>
      </footer>
    </main>
  );
}

