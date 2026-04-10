"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "motion/react";
import { destinations, readyTours } from "@/lib/travel-data";

const World = dynamic(() => import("./ui/globe").then((m) => m.World), { ssr: false });

const stopToCoords: Record<string, { lat: number; lng: number }> = {
  Toshkent: { lat: 41.2995, lng: 69.2401 },
  Samarqand: { lat: 39.6542, lng: 66.9597 },
  Buxoro: { lat: 39.767, lng: 64.455 },
  "Buxoro ": { lat: 39.767, lng: 64.455 },
  Xiva: { lat: 41.3783, lng: 60.3639 },
  "Farg'ona vodiysi": { lat: 40.3864, lng: 71.7843 },
  Nukus: { lat: 42.4602, lng: 59.6166 },
  "Ayaz Qal'a": { lat: 42.1, lng: 60.2 },
  Mizdaxxon: { lat: 42.2, lng: 59.0 }
};

const colors = ["#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899"];

function buildArcs() {
  const arcs: Array<{
    order: number;
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    arcAlt: number;
    color: string;
  }> = [];
  let order = 0;

  // Tour routes within Uzbekistan
  readyTours.forEach((tour, tourIdx) => {
    const stops = tour.stops;
    for (let i = 0; i < stops.length - 1; i++) {
      const from = stopToCoords[stops[i]] ?? destinations.find((d) => d.city === stops[i])?.coords;
      const to = stopToCoords[stops[i + 1]] ?? destinations.find((d) => d.city === stops[i + 1])?.coords;
      if (from && to) {
        arcs.push({
          order: ++order,
          startLat: from.lat,
          startLng: from.lng,
          endLat: to.lat,
          endLng: to.lng,
          arcAlt: 0.15 + Math.random() * 0.2,
          color: colors[tourIdx % colors.length]
        });
      }
    }
  });

  // International connections to Tashkent
  const tashkent = { lat: 41.2995, lng: 69.2401 };
  const hubs = [
    { lat: 55.7558, lng: 37.6173 },
    { lat: 41.0082, lng: 28.9784 },
    { lat: 25.2048, lng: 55.2708 },
    { lat: 51.5074, lng: -0.1278 },
    { lat: 40.7128, lng: -74.006 },
    { lat: 28.6139, lng: 77.209 },
    { lat: 39.9042, lng: 116.4074 }
  ];
  hubs.forEach((hub, idx) => {
    arcs.push({
      order: ++order,
      startLat: hub.lat,
      startLng: hub.lng,
      endLat: tashkent.lat,
      endLng: tashkent.lng,
      arcAlt: 0.3 + (idx % 3) * 0.2,
      color: colors[idx % colors.length]
    });
  });

  return arcs;
}

const sampleArcs = buildArcs();

const globeConfig = {
  pointSize: 4,
  globeColor: "#062056",
  showAtmosphere: true,
  atmosphereColor: "#FFFFFF",
  atmosphereAltitude: 0.1,
  emissive: "#062056",
  emissiveIntensity: 0.1,
  shininess: 0.9,
  polygonColor: "rgba(255,255,255,0.7)",
  ambientLight: "#38bdf8",
  directionalLeftLight: "#ffffff",
  directionalTopLight: "#ffffff",
  pointLight: "#ffffff",
  arcTime: 1500,
  arcLength: 0.9,
  rings: 1,
  maxRings: 3,
  initialPosition: { lat: 41.3, lng: 69.24 },
  autoRotate: true,
  autoRotateSpeed: 0.5
};

const globeSectionCopy = {
  uz: {
    title: "O'zbekiston bo'ylab ",
    titleHighlight: "turlar",
    subtitle: "Samarqand, Buxoro, Xiva va boshqa diqqatga sazovor joylarga sayohat. Dunyo bo'ylab sayohatchilar Toshkentga keladi — siz ham qo'shiling."
  },
  ru: {
    title: "Туры по ",
    titleHighlight: "Узбекистану",
    subtitle: "Путешествия в Самарканд, Бухару, Хиву и другие уникальные места. Путешественники со всего мира приезжают в Ташкент — присоединяйтесь."
  },
  en: {
    title: "Tours across ",
    titleHighlight: "Uzbekistan",
    subtitle: "Journey to Samarkand, Bukhara, Khiva and beyond. Travelers from around the world come to Tashkent — join them."
  }
} as const;

type Lang = "uz" | "ru" | "en";

export function GlobeSection({ lang = "uz" }: { lang?: Lang }) {
  const t = globeSectionCopy[lang];

  return (
    <section className="relative py-24 w-full overflow-hidden rounded-[30px] border border-[#bdd8ff] bg-white shadow-[0_12px_40px_rgba(5,21,57,0.08)] dark:border-neutral-800 dark:bg-neutral-950">
      <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-hero-title text-2xl font-bold text-[#191970] dark:text-white md:text-4xl lg:text-5xl">
            {t.title}
            <span className="text-[#0d6efd] dark:text-sky-400">
              {t.titleHighlight.split("").map((char, idx) => (
                <motion.span
                  key={idx}
                  className="inline-block"
                  initial={{ x: -6, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: idx * 0.03 }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          </h2>
          <p className="mt-4 text-base text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto md:text-lg">
            {t.subtitle}
          </p>
        </motion.div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-white dark:to-neutral-950 pointer-events-none select-none z-20" />
      <div className="absolute inset-x-0 -bottom-10 h-80 md:h-[28rem] z-0">
        <World data={sampleArcs} globeConfig={globeConfig} />
      </div>
    </section>
  );
}
