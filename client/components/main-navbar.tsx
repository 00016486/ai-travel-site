/* eslint-disable react/button-has-type */
"use client";

import React, { useEffect, useState } from "react";

export type LangCode = "uz" | "ru" | "en";

export type NavItemId = "hero" | "about" | "tours" | "why";

export const LANG_STORAGE_KEY = "tourly_lang";

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
  };
  onLangChange: (lang: LangCode) => void;
  onCreateTrip?: () => void;
  createTripLabel?: string;
  onNavClick?: (id: NavItemId) => void;
  loginLabel?: string;
};

export function MainNavbar({
  lang,
  labels,
  onLangChange,
  onCreateTrip,
  createTripLabel,
  onNavClick,
  loginLabel
}: MainNavbarProps) {
  const navItems: { id: NavItemId; label: string }[] = [
    { id: "hero", label: labels.home },
    { id: "about", label: labels.about },
    { id: "tours", label: labels.tours },
    { id: "why", label: labels.why }
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

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(LANG_STORAGE_KEY) as LangCode | null;
      if (stored === "uz" || stored === "ru" || stored === "en") {
        if (stored !== lang) {
          onLangChange(stored);
        }
      } else {
        window.localStorage.setItem(LANG_STORAGE_KEY, lang);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const auth = window.localStorage.getItem("tourly_auth");
      setIsLoggedIn(Boolean(auth));
    } catch {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLoginClick = () => {
    if (typeof window === "undefined") return;
    const redirect = `${window.location.pathname}${window.location.search}`;
    window.location.href = `/auth?redirect=${encodeURIComponent(redirect)}`;
  };

  const handleProfileClick = () => {
    if (typeof window === "undefined") return;
    window.location.href = "/profile";
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
        {loginLabel && !isLoggedIn && (
          <button
            onClick={handleLoginClick}
            className="hidden items-center justify-center rounded-full border border-[#d6e5ff] bg-white px-4 py-1.5 text-xs font-semibold text-[#111827] shadow-sm transition hover:bg-[#f3f4ff] sm:inline-flex"
          >
            {loginLabel}
          </button>
        )}
        {isLoggedIn && (
          <button
            onClick={handleProfileClick}
            aria-label="Profile"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#191970] text-white shadow-[0_8px_20px_rgba(25,25,112,0.6)] hover:bg-[#12124f]"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
            >
              <circle cx="12" cy="9" r="3.2" />
              <path
                d="M6.5 18.2C7.5 16.2 9.6 15 12 15s4.5 1.2 5.5 3.2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
        <div className="flex rounded-full border border-[#d6e5ff] bg-[#f4f8ff] p-1">
          {(["uz", "ru", "en"] as const).map((language) => (
            <button
              key={language}
              onClick={() => {
                onLangChange(language);
                if (typeof window !== "undefined") {
                  try {
                    window.localStorage.setItem(LANG_STORAGE_KEY, language);
                  } catch {
                    // ignore
                  }
                }
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

