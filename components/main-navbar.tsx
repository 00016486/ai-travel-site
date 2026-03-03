/* eslint-disable react/button-has-type */
"use client";

import React from "react";

export type LangCode = "uz" | "ru" | "en";

export type NavItemId = "hero" | "about" | "tours" | "why" | "reviews";

export function AiSparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ai-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="9" fill="url(#ai-gradient)" opacity="0.18" />
      <path
        d="M12 5.5 13 9l3.5 1-3.5 1L12 14.5 11 11l-3.5-1L11 9l1-3.5Zm-5 6.5.7 2.1L10 15l-2.3.9L7 18.1 6.3 15.9 4 15l2.3-.9L7 12Z"
        fill="url(#ai-gradient)"
      />
    </svg>
  );
}

type MainNavbarProps = {
  lang: LangCode;
  labels: {
    home: string;
    about: string;
    tours: string;
    why: string;
    reviews: string;
  };
  onLangChange: (lang: LangCode) => void;
  onCreateTrip?: () => void;
  createTripLabel?: string;
  onNavClick?: (id: NavItemId) => void;
};

export function MainNavbar({
  lang,
  labels,
  onLangChange,
  onCreateTrip,
  createTripLabel,
  onNavClick
}: MainNavbarProps) {
  const navItems: { id: NavItemId; label: string }[] = [
    { id: "hero", label: labels.home },
    { id: "about", label: labels.about },
    { id: "tours", label: labels.tours },
    { id: "why", label: labels.why },
    { id: "reviews", label: labels.reviews }
  ];

  const handleNavClick = (id: NavItemId) => {
    if (onNavClick) {
      onNavClick(id);
      return;
    }
    if (typeof window !== "undefined") {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <header className="sticky top-4 z-40 mb-6 flex items-center justify-between gap-4 rounded-[999px] border border-[#d8e7ff]/70 bg-white/80 px-5 py-3 shadow-[0_12px_35px_rgba(15,23,42,0.15)] backdrop-blur-xl">
      <button
        onClick={() => handleNavClick("hero")}
        className="text-sm font-bold tracking-wide text-[#0f172a]"
      >
        TOURLY.UZ
      </button>
      <nav className="hidden flex-1 items-center justify-center gap-1 text-xs font-medium text-[#0f172a] sm:flex">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className="rounded-full px-3 py-1.5 text-xs font-medium text-[#0f172a]/80 transition-colors hover:bg-[#e0ecff] hover:text-[#0f172a]"
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        {onCreateTrip ? (
          <button
            onClick={onCreateTrip}
            className="hidden items-center justify-center rounded-full bg-[#191970] px-4 py-1.5 text-xs font-semibold text-white shadow-[0_10px_24px_rgba(25,25,112,0.55)] hover:bg-[#12124f] sm:inline-flex"
          >
            <span>{createTripLabel ?? "Yangi Tur Yaratish"}</span>
            <AiSparklesIcon className="ml-2 h-4 w-4" />
          </button>
        ) : null}
        <div className="flex rounded-full border border-[#d6e5ff] bg-[#f4f8ff] p-1">
          {(["uz", "ru", "en"] as const).map((language) => (
            <button
              key={language}
              onClick={() => {
                onLangChange(language);
              }}
              className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${
                lang === language ? "bg-[#191970] text-white" : "bg-transparent text-[#191970]"
              }`}
            >
              {language}
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

