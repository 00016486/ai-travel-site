"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LANG_STORAGE_KEY, MainNavbar, NavItemId, LangCode } from "@/components/main-navbar";
import { getMyProStatus } from "@/lib/ai";

type TierId = "economy" | "standard" | "premium";

type DayPlan = {
  id: string;
  title: string;
  description: string;
  bullets: string[];
};

type TierCopy = {
  name: string;
  heroTitle: string;
  heroSubtitle: string;
  unlockCta: string;
  unlockedTitle: string;
  unlockedSubtitle: string;
  downloadLabel: string;
  daysLabel: string;
  routeLabel: string;
  focusLabel: string;
  transportLabel: string;
  sampleRoute: string;
  sampleFocus: string;
  sampleTransport: string;
  days: Record<TierId, DayPlan[]>;
};

const AUTH_KEY = "tourly_auth";
const PAYMENT_KEY = "tourly_has_payment_card";
const PRO_KEY = "tourly_pro_enabled";

const tierDictionary: Record<LangCode, Record<TierId, TierCopy>> = {
  uz: {
    economy: {
      name: "Start",
      heroTitle: "Start klass — aqlli byudjet",
      heroSubtitle:
        "3–5 kunlik klassik yo‘nalish: tarixiy shaharlar, qulay mehmonxonalar va guruh transferlari.",
      unlockCta: "Trip rejasini unlock qilish",
      unlockedTitle: "To‘liq Start klass trip rejangiz",
      unlockedSubtitle:
        "Quyida kunma‑kun reja, tavsiya etilgan joylar va transport variantlari ko‘rsatilgan.",
      downloadLabel: "Trip rejasini yuklab olish",
      daysLabel: "Kunlar bo‘yicha reja",
      routeLabel: "Yo‘nalish",
      focusLabel: "Asosiy fokus",
      transportLabel: "Transport va joylashuv",
      sampleRoute: "Toshkent → Samarqand → Buxoro",
      sampleFocus: "Tarixiy obidalar, mahalliy osh va yengil sayrlar",
      sampleTransport:
        "Tez poyezdlar, guruh transferlari, 3★ mehmonxonalar nonushta bilan.",
      days: {
        economy: [],
        standard: [],
        premium: []
      }
    },
    standard: {
      name: "Standard",
      heroTitle: "Standard klass — balanslangan qulaylik",
      heroSubtitle:
        "5–7 kunlik yo‘nalish: tarix, tabiat va gastronomiya uyg‘unligi, 3–4★ mehmonxonalar.",
      unlockCta: "Standard klass rejasini unlock qilish",
      unlockedTitle: "To‘liq Standard klass trip rejangiz",
      unlockedSubtitle:
        "Quyida kunma‑kun marshrut, tavsiya qilingan restoran va faoliyatlar keltirilgan.",
      downloadLabel: "Standard rejasini yuklab olish",
      daysLabel: "Kunlar bo‘yicha reja",
      routeLabel: "Yo‘nalish",
      focusLabel: "Asosiy fokus",
      transportLabel: "Transport va joylashuv",
      sampleRoute: "Toshkent → Samarqand → Buxoro → Xiva",
      sampleFocus:
        "Tarix, mahalliy gastronomiya, oilaviy/juftlik sayohati uchun balanslangan dastur",
      sampleTransport:
        "Qu­lay poyezdlar va avto, 3–4★ boutique mehmonxonalar nonushta bilan.",
      days: {
        economy: [],
        standard: [],
        premium: []
      }
    },
    premium: {
      name: "Premium",
      heroTitle: "Premium klass — maksimal qulaylik",
      heroSubtitle:
        "6–8 kunlik premium yo‘nalish: shaxsiy gid, 4–5★ mehmonxonalar va moslashuvchan jadval.",
      unlockCta: "Premium rejasini unlock qilish",
      unlockedTitle: "To‘liq Premium klass trip rejangiz",
      unlockedSubtitle:
        "Quyida kunma‑kun premium darajadagi marshrut va tavsiyalar ro‘yxati keltirilgan.",
      downloadLabel: "Premium rejasini yuklab olish",
      daysLabel: "Kunlar bo‘yicha reja",
      routeLabel: "Yo‘nalish",
      focusLabel: "Asosiy fokus",
      transportLabel: "Transport va joylashuv",
      sampleRoute: "Toshkent → Samarqand → Buxoro → Xiva",
      sampleFocus:
        "Premium servis, maxfiylik, asal oyi yoki VIP mehmonlar uchun moslashtirilgan dastur",
      sampleTransport:
        "Shaxsiy transferlar, premium poyezd/vip kabinalar, 4–5★ mehmonxonalar nonushta bilan.",
      days: {
        economy: [],
        standard: [],
        premium: []
      }
    }
  },
  ru: {
    economy: {
      name: "Start",
      heroTitle: "Класс Start — умный бюджет",
      heroSubtitle:
        "3–5 дней по классическому маршруту: исторические города, удобные отели и групповые трансферы.",
      unlockCta: "Открыть план поездки",
      unlockedTitle: "Полный план поездки в классе Start",
      unlockedSubtitle:
        "Ниже — поминутный план по дням, рекомендованные места и варианты транспорта.",
      downloadLabel: "Скачать план поездки",
      daysLabel: "План по дням",
      routeLabel: "Маршрут",
      focusLabel: "Основной фокус",
      transportLabel: "Транспорт и размещение",
      sampleRoute: "Ташкент → Самарканд → Бухара",
      sampleFocus:
        "Исторические объекты, локальная кухня и спокойные прогулки без спешки",
      sampleTransport:
        "Скоростные поезда, групповые трансферы, отели 3★ с завтраками.",
      days: {
        economy: [],
        standard: [],
        premium: []
      }
    },
    standard: {
      name: "Standard",
      heroTitle: "Класс Standard — сбалансированный комфорт",
      heroSubtitle:
        "5–7 дней маршрута с сочетанием истории, природы и гастрономии, отели 3–4★.",
      unlockCta: "Открыть план для Standard",
      unlockedTitle: "Полный план поездки в классе Standard",
      unlockedSubtitle:
        "Ниже описан маршрут с разбивкой по дням, ужинами и экскурсиями.",
      downloadLabel: "Скачать план Standard",
      daysLabel: "План по дням",
      routeLabel: "Маршрут",
      focusLabel: "Основной фокус",
      transportLabel: "Транспорт и размещение",
      sampleRoute: "Ташкент → Самарканд → Бухара → Хива",
      sampleFocus:
        "История, гастрономия и комфортный темп для пар и семейных поездок",
      sampleTransport:
        "Комфортные авто / поезда, отели 3–4★ с завтраками и поздним check‑out.",
      days: {
        economy: [],
        standard: [],
        premium: []
      }
    },
    premium: {
      name: "Premium",
      heroTitle: "Класс Premium — максимум удобства",
      heroSubtitle:
        "6–8 дней премиального маршрута: личный гид, отели 4–5★ и гибкий график.",
      unlockCta: "Открыть Premium план",
      unlockedTitle: "Полный премиальный план поездки",
      unlockedSubtitle:
        "Ниже подробный маршрут по дням с рекомендациями по гастрономии и впечатлениям.",
      downloadLabel: "Скачать Premium план",
      daysLabel: "План по дням",
      routeLabel: "Маршрут",
      focusLabel: "Основной фокус",
      transportLabel: "Транспорт и размещение",
      sampleRoute: "Ташкент → Самарканд → Бухара → Хива",
      sampleFocus:
        "Премиальный сервис, приватность, акцент на комфорте и ярких впечатлениях",
      sampleTransport:
        "Индивидуальные трансферы, бизнес‑класс (поезда/перелёты), отели 4–5★.",
      days: {
        economy: [],
        standard: [],
        premium: []
      }
    }
  },
  en: {
    economy: {
      name: "Start",
      heroTitle: "Start class — smart budget",
      heroSubtitle:
        "3–5 days on a classic route: historic cities, cozy hotels and group transfers.",
      unlockCta: "Unlock trip plan",
      unlockedTitle: "Your full Start class trip plan",
      unlockedSubtitle:
        "Below you’ll find a day‑by‑day outline, recommended spots and transport options.",
      downloadLabel: "Download trip plan",
      daysLabel: "Day‑by‑day plan",
      routeLabel: "Route",
      focusLabel: "Main focus",
      transportLabel: "Transport & stays",
      sampleRoute: "Tashkent → Samarkand → Bukhara",
      sampleFocus:
        "Historical sights, local food and relaxed walks without rushing",
      sampleTransport:
        "High‑speed trains, group transfers, 3★ hotels with breakfast.",
      days: {
        economy: [],
        standard: [],
        premium: []
      }
    },
    standard: {
      name: "Standard",
      heroTitle: "Standard class — balanced comfort",
      heroSubtitle:
        "5–7 day itinerary combining history, nature and food, with 3–4★ boutique hotels.",
      unlockCta: "Unlock Standard plan",
      unlockedTitle: "Your full Standard class trip plan",
      unlockedSubtitle:
        "Below is a structured day‑by‑day route with suggested dinners and activities.",
      downloadLabel: "Download Standard plan",
      daysLabel: "Day‑by‑day plan",
      routeLabel: "Route",
      focusLabel: "Main focus",
      transportLabel: "Transport & stays",
      sampleRoute: "Tashkent → Samarkand → Bukhara → Khiva",
      sampleFocus:
        "History, gastronomy and a comfortable pace for couples and families",
      sampleTransport:
        "Comfortable cars/trains, 3–4★ boutique hotels with breakfast.",
      days: {
        economy: [],
        standard: [],
        premium: []
      }
    },
    premium: {
      name: "Premium",
      heroTitle: "Premium class — maximum comfort",
      heroSubtitle:
        "6–8 day premium route: private guide, 4–5★ hotels and a flexible daily rhythm.",
      unlockCta: "Unlock Premium plan",
      unlockedTitle: "Your full Premium class trip plan",
      unlockedSubtitle:
        "Below is a detailed premium‑level itinerary with food and experience highlights.",
      downloadLabel: "Download Premium plan",
      daysLabel: "Day‑by‑day plan",
      routeLabel: "Route",
      focusLabel: "Main focus",
      transportLabel: "Transport & stays",
      sampleRoute: "Tashkent → Samarkand → Bukhara → Khiva",
      sampleFocus:
        "Premium service, privacy and a focus on comfort and memorable moments",
      sampleTransport:
        "Private transfers, business‑class seats (trains/flights), 4–5★ hotels.",
      days: {
        economy: [],
        standard: [],
        premium: []
      }
    }
  }
};

// Fill in concrete per‑day plans (to avoid repeating large literals above)
tierDictionary.uz.economy.days.economy = [
  {
    id: "d1",
    title: "1‑kun: Toshkentga kelish",
    description:
      "Mehmonxonaga joylashish, eski shahar va Hazrati Imom majmuasiga qisqa sayr.",
    bullets: [
      "Aeroportdan guruh transfer",
      "3★ mehmonxonaga joylashish",
      "Hazrati Imom va Chorsu bozori bo‘ylab sayr"
    ]
  },
  {
    id: "d2",
    title: "2‑kun: Samarqand — Registon markazi",
    description:
      "Tez poyezdda Samarqandga borish, Registon maydoni va Bibixonim majmuasiga tashrif.",
    bullets: [
      "YHHT poyezdida Samarqandga yo‘l",
      "Registon, Shohi Zinda va Bibixonim",
      "Kechki payt plov va milliy taomlar"
    ]
  }
];

tierDictionary.uz.standard.days.standard = [
  {
    id: "d1",
    title: "1‑kun: Toshkent — shaharni his qilish",
    description:
      "Zamonaviy Toshkent, eski shahar va kafe/restaurantlar bilan tanishuv.",
    bullets: [
      "Shaxsiy transfer mehmonxonaga",
      "Amir Temur xiyoboni va metro bekatlari",
      "Chorsu bozori va milliy taomlar"
    ]
  },
  {
    id: "d2",
    title: "2‑kun: Samarqand — Registon & Shohi Zinda",
    description:
      "Tarixiy majmualar, mahalliy bozor va kechki panoramali restoran.",
    bullets: [
      "Tez poyezdda Samarqand",
      "Registon va Shohi Zinda ekskursiyasi",
      "Kechki ovqat uchun roof‑top restoran"
    ]
  }
];

tierDictionary.uz.premium.days.premium = [
  {
    id: "d1",
    title: "1‑kun: Toshkent — VIP kutib olish",
    description:
      "Shaxsiy transfer, 5★ mehmonxona va shahar bo‘ylab yumshoq tempo bilan sayr.",
    bullets: [
      "Aeroportda VIP kutib olish",
      "5★ mehmonxonaga joylashish",
      "Maxsus gid bilan kechki shahar tur"
    ]
  },
  {
    id: "d2",
    title: "2‑kun: Samarqand — premium ekskursiya",
    description:
      "Registon va tarixiy obidalar bo‘ylab gidli ekskursiya, private foto‑sessiya.",
    bullets: [
      "Business klass vagonda Samarqandga yo‘l",
      "Gid bilan individual ekskursiya",
      "Shaxsiy fotograf bilan foto‑sessiya"
    ]
  }
];

// For brevity, reuse Uzbek structure texts for RU/EN day descriptions
tierDictionary.ru.economy.days.economy = tierDictionary.uz.economy.days.economy.map(
  (d) => ({
    ...d,
    title:
      d.id === "d1"
        ? "День 1: Прибытие в Ташкент"
        : "День 2: Самарканд — площадь Регистан",
    description:
      d.id === "d1"
        ? "Заселение в отель, прогулка по старому городу и комплексу Хаст‑Имам."
        : "Переезд в Самарканд на скоростном поезде и знакомство с главными достопримечательностями."
  })
);

tierDictionary.ru.standard.days.standard =
  tierDictionary.uz.standard.days.standard.map((d) => ({
    ...d,
    title:
      d.id === "d1"
        ? "День 1: Ташкент — почувствовать город"
        : "День 2: Самарканд — Регистан и Шахи‑Зинда"
  }));

tierDictionary.ru.premium.days.premium =
  tierDictionary.uz.premium.days.premium.map((d) => ({
    ...d,
    title:
      d.id === "d1"
        ? "День 1: Ташкент — VIP‑встреча"
        : "День 2: Самарканд — премиальная экскурсия"
  }));

tierDictionary.en.economy.days.economy = tierDictionary.uz.economy.days.economy.map(
  (d) => ({
    ...d,
    title:
      d.id === "d1"
        ? "Day 1: Arrival in Tashkent"
        : "Day 2: Samarkand — Registan & old town",
    description:
      d.id === "d1"
        ? "Hotel check‑in, gentle walk through the old town and Hazrati Imam complex."
        : "High‑speed train to Samarkand and first walk around the main landmarks."
  })
);

tierDictionary.en.standard.days.standard =
  tierDictionary.uz.standard.days.standard.map((d) => ({
    ...d,
    title:
      d.id === "d1"
        ? "Day 1: Tashkent — feel the city"
        : "Day 2: Samarkand — Registan & Shohi Zinda"
  }));

tierDictionary.en.premium.days.premium =
  tierDictionary.uz.premium.days.premium.map((d) => ({
    ...d,
    title:
      d.id === "d1"
        ? "Day 1: Tashkent — VIP welcome"
        : "Day 2: Samarkand — premium tour"
  }));

function getTierFromParam(param: string | string[] | undefined): TierId {
  if (param === "standard") return "standard";
  if (param === "premium") return "premium";
  return "economy";
}

type TourSpot = {
  id: string;
  image: string;
  name: Record<LangCode, string>;
  description: Record<LangCode, string>;
};

const tourSpotsByTier: Record<TierId, TourSpot[]> = {
  economy: [
    {
      id: "tk1",
      image: "https://static2.realting.com/uploads/images/a5a/02d87cdb6e7a1d5e07612b667cd81.webp",
      name: { uz: "Hazrati Imom", ru: "Хазрати Имам", en: "Hazrati Imam" },
      description: {
        uz: "Toshkentning diniy yadgorligi — Hazrati Imom majmuasi XVI asrda barpo etilgan. Kompleksga Oʻq Mushaf (Usmon Qurʼoni), katta jome masjidi, madrasa va maqbara kiradi. Bu yer Islom madaniyati va sharq meʼmorchiligi namoyish etiladi.",
        ru: "Религиозный центр Ташкента — комплекс Хаст-Имам, основанный в XVI веке. В него входят музей Корана Усмана, соборная мечеть, медресе и мавзолеи. Здесь представлены исламская культура и восточная архитектура.",
        en: "Tashkent's main religious site — the Hast-Imam complex, built in the 16th century. It includes the Uthman Quran museum, the main mosque, madrasahs and mausoleums. The complex showcases Islamic culture and Eastern architecture."
      }
    },
    {
      id: "tk2",
      image: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg",
      name: { uz: "Chorsu bozori", ru: "Базар Чорсу", en: "Chorsu Bazaar" },
      description: {
        uz: "Chorsu — Toshkentning eng yirik va rang-barang bozori, gumbazli binoda joylashgan. Mahalliy meva-sabzavotlar, non, ziravorlar, qoʻlda ishlangan buyumlar va milliy taomlar sotiladi. Sayohatchilar uchun oziq-ovqat va suvenirlar tanlash uchun ideal joy.",
        ru: "Чорсу — крупнейший и самый колоритный базар Ташкента под купольным зданием. Здесь продают местные фрукты и овощи, лепёшки, специи, ремесленные изделия и национальные блюда. Идеальное место для знакомства с гастрономией и сувенирами.",
        en: "Chorsu is Tashkent's largest and most colourful bazaar, housed under a domed building. You'll find local produce, bread, spices, handicrafts and national dishes. A perfect place to try local food and buy souvenirs."
      }
    },
    {
      id: "sm1",
      image: "https://www.afisha.uz/uploads/media/2024/07/ae465a3e0772936e23b895d095087de8.jpg",
      name: { uz: "Registon maydoni", ru: "Площадь Регистан", en: "Registan Square" },
      description: {
        uz: "Registon — Samarqandning ramzi va Oʻrta Osiyoning eng mashhur maydoni. Uch ulugʻ madrasa: Ulugʻbek, Sher-Dor va Tilla-Qori ansambl tashkil qiladi. Kechalari yoritish va ovozli koʻrsatuvlar boʻlib oʻtadi.",
        ru: "Регистан — символ Самарканда и самая известная площадь Средней Азии. Три величественных медресе — Улугбека, Шер-Дор и Тилля-Кари — образуют единый ансамбль. Вечером проходят световые и звуковые шоу.",
        en: "Registan is the symbol of Samarkand and the most famous square in Central Asia. Three grand madrasahs — Ulugh Beg, Sher-Dor and Tilla-Kari — form a single ensemble. Evening light and sound shows are held here."
      }
    },
    {
      id: "sm2",
      image: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",
      name: { uz: "Shohi Zinda", ru: "Шахи-Зинда", en: "Shahi Zinda" },
      description: {
        uz: "Shohi Zinda — qadimiy nekropol, XI–XIX asrlar davomida qurilgan maqbara va ziyoratgohlar qatori. Amir Temur avlodi va din arboblari dafn etilgan. Koʻk va sirkor bezaklar bilan ajralib turadi.",
        ru: "Шахи-Зинда — древний некрополь, аллея мавзолеев и святынь XI–XIX веков. Здесь похоронены члены семьи Тимура и религиозные деятели. Ансамбль славится бирюзовой и изразцовой отделкой.",
        en: "Shahi Zinda is an ancient necropolis — an alley of mausoleums and shrines from the 11th–19th centuries. Members of Timur's family and religious figures are buried here. The ensemble is famous for its turquoise and tile decoration."
      }
    },
    {
      id: "sm3",
      image: "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg",
      name: { uz: "Bibixonim masjidi", ru: "Мечеть Биби-Ханым", en: "Bibi Khanum Mosque" },
      description: {
        uz: "Bibixonim masjidi XIV asrda Amir Temur buyrugʻi bilan Hindistondan olingan gʻanimatlar hisobiga qurilgan. Oʻsha davrning eng yirik masjidlaridan biri. Gumbaz va peshtoq bezaklari hozir ham taassurot qoldiradi.",
        ru: "Мечеть Биби-Ханым была построена в XIV веке по приказу Тимура на средства из походов в Индию. Одна из крупнейших мечетей своего времени. Декор купола и портала до сих пор впечатляет.",
        en: "The Bibi Khanum Mosque was built in the 14th century on Timur's orders using spoils from his Indian campaigns. One of the largest mosques of its time. The dome and portal decoration still impress today."
      }
    },
    {
      id: "bx1",
      image: "https://resize.tripster.ru/CBS3Bc3dCbADxN3slKwDXgsG_mM=/fit-in/1220x600/filters:no_upscale()/https://cdn.tripster.ru/photos/9f1014c3-7604-42ff-a49c-555ddb6f2048.jpg?width=1200&height=630",
      name: { uz: "Ark qal'asi", ru: "Крепость Арк", en: "Ark Fortress" },
      description: {
        uz: "Ark — Buxoro xonlarining qadimiy qalʼasi, miloddan avvalgi asrlardan maʼlum. Ichida xon saroyi, zindon, masjid va hukumat binolari boʻlgan. Hozirda Buxoro tarixi va meʼmorchiligi muzeyi joylashgan.",
        ru: "Арк — древняя цитадель бухарских ханов, известная с античных времён. Внутри находились дворец, тюрьма, мечеть и административные здания. Сейчас здесь музей истории и архитектуры Бухары.",
        en: "The Ark is the ancient citadel of the Bukhara khans, dating back to antiquity. It contained the palace, prison, mosque and government buildings. Today it houses the Museum of Bukhara's history and architecture."
      }
    },
    {
      id: "bx2",
      image: "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg",
      name: { uz: "Minorai Kalon", ru: "Минарет Калян", en: "Kalon Minaret" },
      description: {
        uz: "Minorai Kalon 1127 yilda qurilgan, balandligi 47 metr. Buxoro va Oʻrta Osiyo islom meʼmorchiligining ramzi. Minora atrofida Kalon masjidi va Mir-i Arab madrasasi joylashgan — Poi Kalon ansambli.",
        ru: "Минарет Калян построен в 1127 году, высота 47 метров. Символ Бухары и исламской архитектуры Средней Азии. Рядом — мечеть Калян и медресе Мири-Араб, вместе они образуют ансамбль Пои-Калян.",
        en: "The Kalon Minaret was built in 1127 and is 47 metres high. A symbol of Bukhara and Central Asian Islamic architecture. Next to it are the Kalon Mosque and Mir-i Arab Madrasah, forming the Poi Kalon ensemble."
      }
    },
    {
      id: "bx3",
      image: "https://images.pexels.com/photos/175773/pexels-photo-175773.jpeg",
      name: { uz: "Labi Hovuz", ru: "Ляби-Хауз", en: "Lyab-i Hauz" },
      description: {
        uz: "Labi Hovuz — eski Buxorodagi hovuz atrofidagi maydon, XVII asrda yaratilgan. Nadir Devonbegi madrasasi, xonaqoh va ikkita karvonsaroy atrofida joylashgan. Choyxonalar va dam olish joyi sifatida mashhur.",
        ru: "Ляби-Хауз — площадь вокруг пруда в старом городе Бухары, созданная в XVII веке. Вокруг расположены медресе Надир Диван-беги, хонака и два караван-сарая. Популярное место для чайных и отдыха.",
        en: "Lyab-i Hauz is the square around a pond in old Bukhara, created in the 17th century. It is surrounded by the Nadir Divan-begi madrasah, a khanaka and two caravanserais. A popular spot for teahouses and relaxation."
      }
    },
    {
      id: "tk3",
      image: "https://images.pexels.com/photos/21014/pexels-photo.jpg",
      name: { uz: "Amir Temur xiyoboni", ru: "Сквер Амира Темура", en: "Amir Timur Square" },
      description: {
        uz: "Amir Temur xiyoboni — Toshkentning markaziy maydoni, sarkardaga bagʻishlangan yodgorlik va fontanlar bilan. Atrofida mehmonxonalar, teatr va muzeylar. Shahar hayotining markazi.",
        ru: "Сквер Амира Темура — центральная площадь Ташкента с памятником полководцу и фонтанами. Вокруг — отели, театры и музеи. Сердце общественной жизни города.",
        en: "Amir Timur Square is Tashkent's central square with a monument to the ruler and fountains. Surrounded by hotels, theatres and museums. The heart of the city's public life."
      }
    },
    {
      id: "sm4",
      image: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg",
      name: { uz: "Ulug'bek rasadxonasi", ru: "Обсерватория Улугбека", en: "Ulugh Beg Observatory" },
      description: {
        uz: "Ulugʻbek 1420-yillarda Samarqandda rasadxona qurdirdi. Unda yulduzlar jadvali tuzildi — oʻsha davrda eng aniq hisoblar. Hozir qoldiqlar va muzey ziyorat qilinadi.",
        ru: "Улугбек построил обсерваторию в Самарканде в 1420-х годах. Здесь составляли звёздные таблицы — самые точные для своего времени. Сейчас можно осмотреть остатки здания и музей.",
        en: "Ulugh Beg built an observatory in Samarkand in the 1420s. Star tables compiled here were among the most accurate of their time. Today you can see the remains and the museum."
      }
    }
  ],
  standard: [
    {
      id: "tk1",
      image: "https://static2.realting.com/uploads/images/a5a/02d87cdb6e7a1d5e07612b667cd81.webp",
      name: { uz: "Hazrati Imom", ru: "Хазрати Имам", en: "Hazrati Imam" },
      description: {
        uz: "Toshkentning diniy yadgorligi — Hazrati Imom majmuasi XVI asrda barpo etilgan. Kompleksga Oʻq Mushaf (Usmon Qurʼoni), katta jome masjidi, madrasa va maqbara kiradi. Bu yer Islom madaniyati va sharq meʼmorchiligi namoyish etiladi.",
        ru: "Религиозный центр Ташкента — комплекс Хаст-Имам, основанный в XVI веке. В него входят музей Корана Усмана, соборная мечеть, медресе и мавзолеи. Здесь представлены исламская культура и восточная архитектура.",
        en: "Tashkent's main religious site — the Hast-Imam complex, built in the 16th century. It includes the Uthman Quran museum, the main mosque, madrasahs and mausoleums. The complex showcases Islamic culture and Eastern architecture."
      }
    },
    {
      id: "tk2",
      image: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",
      name: { uz: "Chorsu bozori", ru: "Базар Чорсу", en: "Chorsu Bazaar" },
      description: {
        uz: "Chorsu — Toshkentning eng yirik va rang-barang bozori, gumbazli binoda joylashgan. Mahalliy meva-sabzavotlar, non, ziravorlar, qoʻlda ishlangan buyumlar va milliy taomlar sotiladi. Sayohatchilar uchun oziq-ovqat va suvenirlar tanlash uchun ideal joy.",
        ru: "Чорсу — крупнейший и самый колоритный базар Ташкента под купольным зданием. Здесь продают местные фрукты и овощи, лепёшки, специи, ремесленные изделия и национальные блюда. Идеальное место для знакомства с гастрономией и сувенирами.",
        en: "Chorsu is Tashkent's largest and most colourful bazaar, housed under a domed building. You'll find local produce, bread, spices, handicrafts and national dishes. A perfect place to try local food and buy souvenirs."
      }
    },
    {
      id: "tk3",
      image: "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg",
      name: { uz: "Amir Temur xiyoboni", ru: "Сквер Амира Темура", en: "Amir Timur Square" },
      description: {
        uz: "Amir Temur xiyoboni — Toshkentning markaziy maydoni, sarkardaga bagʻishlangan yodgorlik va fontanlar bilan. Atrofida mehmonxonalar, teatr va muzeylar. Shahar hayotining markazi.",
        ru: "Сквер Амира Темура — центральная площадь Ташкента с памятником полководцу и фонтанами. Вокруг — отели, театры и музеи. Сердце общественной жизни города.",
        en: "Amir Timur Square is Tashkent's central square with a monument to the ruler and fountains. Surrounded by hotels, theatres and museums. The heart of the city's public life."
      }
    },
    {
      id: "sm1",
      image: "https://www.afisha.uz/uploads/media/2024/07/ae465a3e0772936e23b895d095087de8.jpg",
      name: { uz: "Registon maydoni", ru: "Площадь Регистан", en: "Registan Square" },
      description: {
        uz: "Registon — Samarqandning ramzi va Oʻrta Osiyoning eng mashhur maydoni. Uch ulugʻ madrasa: Ulugʻbek, Sher-Dor va Tilla-Qori ansambl tashkil qiladi. Kechalari yoritish va ovozli koʻrsatuvlar boʻlib oʻtadi.",
        ru: "Регистан — символ Самарканда и самая известная площадь Средней Азии. Три величественных медресе — Улугбека, Шер-Дор и Тилля-Кари — образуют единый ансамбль. Вечером проходят световые и звуковые шоу.",
        en: "Registan is the symbol of Samarkand and the most famous square in Central Asia. Three grand madrasahs — Ulugh Beg, Sher-Dor and Tilla-Kari — form a single ensemble. Evening light and sound shows are held here."
      }
    },
    {
      id: "sm2",
      image: "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg",
      name: { uz: "Shohi Zinda", ru: "Шахи-Зинда", en: "Shahi Zinda" },
      description: {
        uz: "Shohi Zinda — qadimiy nekropol, XI–XIX asrlar davomida qurilgan maqbara va ziyoratgohlar qatori. Amir Temur avlodi va din arboblari dafn etilgan. Koʻk va sirkor bezaklar bilan ajralib turadi.",
        ru: "Шахи-Зинда — древний некрополь, аллея мавзолеев и святынь XI–XIX веков. Здесь похоронены члены семьи Тимура и религиозные деятели. Ансамбль славится бирюзовой и изразцовой отделкой.",
        en: "Shahi Zinda is an ancient necropolis — an alley of mausoleums and shrines from the 11th–19th centuries. Members of Timur's family and religious figures are buried here. The ensemble is famous for its turquoise and tile decoration."
      }
    },
    {
      id: "sm3",
      image: "https://images.pexels.com/photos/175773/pexels-photo-175773.jpeg",
      name: { uz: "Bibixonim masjidi", ru: "Мечеть Биби-Ханым", en: "Bibi Khanum Mosque" },
      description: {
        uz: "Bibixonim masjidi XIV asrda Amir Temur buyrugʻi bilan Hindistondan olingan gʻanimatlar hisobiga qurilgan. Oʻsha davrning eng yirik masjidlaridan biri. Gumbaz va peshtoq bezaklari hozir ham taassurot qoldiradi.",
        ru: "Мечеть Биби-Ханым была построена в XIV веке по приказу Тимура на средства из походов в Индию. Одна из крупнейших мечетей своего времени. Декор купола и портала до сих пор впечатляет.",
        en: "The Bibi Khanum Mosque was built in the 14th century on Timur's orders using spoils from his Indian campaigns. One of the largest mosques of its time. The dome and portal decoration still impress today."
      }
    },
    {
      id: "bx1",
      image: "https://resize.tripster.ru/CBS3Bc3dCbADxN3slKwDXgsG_mM=/fit-in/1220x600/filters:no_upscale()/https://cdn.tripster.ru/photos/9f1014c3-7604-42ff-a49c-555ddb6f2048.jpg?width=1200&height=630",
      name: { uz: "Ark qal'asi", ru: "Крепость Арк", en: "Ark Fortress" },
      description: {
        uz: "Ark — Buxoro xonlarining qadimiy qalʼasi, miloddan avvalgi asrlardan maʼlum. Ichida xon saroyi, zindon, masjid va hukumat binolari boʻlgan. Hozirda Buxoro tarixi va meʼmorchiligi muzeyi joylashgan.",
        ru: "Арк — древняя цитадель бухарских ханов, известная с античных времён. Внутри находились дворец, тюрьма, мечеть и административные здания. Сейчас здесь музей истории и архитектуры Бухары.",
        en: "The Ark is the ancient citadel of the Bukhara khans, dating back to antiquity. It contained the palace, prison, mosque and government buildings. Today it houses the Museum of Bukhara's history and architecture."
      }
    },
    {
      id: "bx2",
      image: "https://images.pexels.com/photos/21014/pexels-photo.jpg",
      name: { uz: "Minorai Kalon", ru: "Минарет Калян", en: "Kalon Minaret" },
      description: {
        uz: "Minorai Kalon 1127 yilda qurilgan, balandligi 47 metr. Buxoro va Oʻrta Osiyo islom meʼmorchiligining ramzi. Minora atrofida Kalon masjidi va Mir-i Arab madrasasi joylashgan — Poi Kalon ansambli.",
        ru: "Минарет Калян построен в 1127 году, высота 47 метров. Символ Бухары и исламской архитектуры Средней Азии. Рядом — мечеть Калян и медресе Мири-Араб, вместе они образуют ансамбль Пои-Калян.",
        en: "The Kalon Minaret was built in 1127 and is 47 metres high. A symbol of Bukhara and Central Asian Islamic architecture. Next to it are the Kalon Mosque and Mir-i Arab Madrasah, forming the Poi Kalon ensemble."
      }
    },
    {
      id: "bx3",
      image: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg",
      name: { uz: "Labi Hovuz", ru: "Ляби-Хауз", en: "Lyab-i Hauz" },
      description: {
        uz: "Labi Hovuz — eski Buxorodagi hovuz atrofidagi maydon, XVII asrda yaratilgan. Nadir Devonbegi madrasasi, xonaqoh va ikkita karvonsaroy atrofida joylashgan. Choyxonalar va dam olish joyi sifatida mashhur.",
        ru: "Ляби-Хауз — площадь вокруг пруда в старом городе Бухары, созданная в XVII веке. Вокруг расположены медресе Надир Диван-беги, хонака и два караван-сарая. Популярное место для чайных и отдыха.",
        en: "Lyab-i Hauz is the square around a pond in old Bukhara, created in the 17th century. It is surrounded by the Nadir Divan-begi madrasah, a khanaka and two caravanserais. A popular spot for teahouses and relaxation."
      }
    },
    {
      id: "xv1",
      image: "https://uzbekistan.travel/storage/app/uploads/public/671/9e1/9fc/thumb_3975_1140_0_0_0_auto.jpg",
      name: { uz: "Ichan-Qal'a", ru: "Ичан-Кала", en: "Itchan Kala" },
      description: {
        uz: "Ichan-Qal'a — Xiva ichki shahri, toʻliq saqlanib qolgan qadimiy devor bilan oʻralgan. YuNESKO Butunjahon merosi roʻyxatiga kiritilgan. Ichida 50 dan ortiq yodgorlik: minoralar, masjidlar, madrasalar va saroylar.",
        ru: "Ичан-Кала — внутренний город Хивы, окружённый цельной крепостной стеной. Включён в список Всемирного наследия ЮНЕСКО. Внутри более 50 памятников: минареты, мечети, медресе и дворцы.",
        en: "Itchan Kala is Khiva's inner town, surrounded by a complete fortified wall. It is a UNESCO World Heritage site. Inside are over 50 monuments: minarets, mosques, madrasahs and palaces."
      }
    },
    {
      id: "xv2",
      image: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",
      name: { uz: "Kalta Minor", ru: "Калта-Минор", en: "Kalta Minor" },
      description: {
        uz: "Kalta Minor — Xivadagi past minora, 1855 yilda qurila boshangan, toʻliq tugallanmagan. Poydevorsiz, kobalt va sirkor koshinlar bilan qoplangan. Shaharning eng taniqli ramzlaridan biri.",
        ru: "Калта-Минор — низкий минарет в Хиве, строительство началось в 1855 году и не было завершено. Без традиционного основания, облицован кобальтовой и бирюзовой плиткой. Один из главных символов города.",
        en: "Kalta Minor is a short minaret in Khiva; construction began in 1855 and was never completed. It has no traditional base and is clad in cobalt and turquoise tiles. One of the city's main symbols."
      }
    },
    {
      id: "xv3",
      image: "https://uzbekistan.travel/storage/app/uploads/public/671/9e1/9fc/thumb_3975_1140_0_0_0_auto.jpg",
      name: { uz: "Tosh Hovli saroyi", ru: "Дворец Таш-Хаули", en: "Tash-Khauli Palace" },
      description: {
        uz: "Tosh Hovli — Xiva xonlarining 1830–1840-yillarda qurilgan saroyi. Haram, sudxona va rasmiy qabulxona qismlari mavjud. Oq marmar va yogʻoch oʻymakorligi, koshinlar bilan bezatilgan.",
        ru: "Таш-Хаули — дворец хивинских ханов, построенный в 1830–1840-х годах. Включает гарем, судебную палату и приёмный зал. Украшен белым мрамором, резьбой по дереву и изразцами.",
        en: "Tash-Khauli is the palace of the Khiva khans, built in the 1830s–1840s. It contains the harem, court chamber and reception hall. Decorated with white marble, woodcarving and tiles."
      }
    }
  ],
  premium: [
    {
      id: "tk1",
      image: "https://static2.realting.com/uploads/images/a5a/02d87cdb6e7a1d5e07612b667cd81.webp",
      name: { uz: "Hazrati Imom", ru: "Хазрати Имам", en: "Hazrati Imam" },
      description: {
        uz: "Toshkentning diniy yadgorligi — Hazrati Imom majmuasi XVI asrda barpo etilgan. Kompleksga Oʻq Mushaf (Usmon Qurʼoni), katta jome masjidi, madrasa va maqbara kiradi. Bu yer Islom madaniyati va sharq meʼmorchiligi namoyish etiladi.",
        ru: "Религиозный центр Ташкента — комплекс Хаст-Имам, основанный в XVI веке. В него входят музей Корана Усмана, соборная мечеть, медресе и мавзолеи. Здесь представлены исламская культура и восточная архитектура.",
        en: "Tashkent's main religious site — the Hast-Imam complex, built in the 16th century. It includes the Uthman Quran museum, the main mosque, madrasahs and mausoleums. The complex showcases Islamic culture and Eastern architecture."
      }
    },
    {
      id: "tk2",
      image: "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg",
      name: { uz: "Chorsu bozori", ru: "Базар Чорсу", en: "Chorsu Bazaar" },
      description: {
        uz: "Chorsu — Toshkentning eng yirik va rang-barang bozori, gumbazli binoda joylashgan. Mahalliy meva-sabzavotlar, non, ziravorlar, qoʻlda ishlangan buyumlar va milliy taomlar sotiladi. Sayohatchilar uchun oziq-ovqat va suvenirlar tanlash uchun ideal joy.",
        ru: "Чорсу — крупнейший и самый колоритный базар Ташкента под купольным зданием. Здесь продают местные фрукты и овощи, лепёшки, специи, ремесленные изделия и национальные блюда. Идеальное место для знакомства с гастрономией и сувенирами.",
        en: "Chorsu is Tashkent's largest and most colourful bazaar, housed under a domed building. You'll find local produce, bread, spices, handicrafts and national dishes. A perfect place to try local food and buy souvenirs."
      }
    },
    {
      id: "tk3",
      image: "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg",
      name: { uz: "Amir Temur xiyoboni", ru: "Сквер Амира Темура", en: "Amir Timur Square" },
      description: {
        uz: "Amir Temur xiyoboni — Toshkentning markaziy maydoni, sarkardaga bagʻishlangan yodgorlik va fontanlar bilan. Atrofida mehmonxonalar, teatr va muzeylar. Shahar hayotining markazi.",
        ru: "Сквер Амира Темура — центральная площадь Ташкента с памятником полководцу и фонтанами. Вокруг — отели, театры и музеи. Сердце общественной жизни города.",
        en: "Amir Timur Square is Tashkent's central square with a monument to the ruler and fountains. Surrounded by hotels, theatres and museums. The heart of the city's public life."
      }
    },
    {
      id: "sm1",
      image: "https://www.afisha.uz/uploads/media/2024/07/ae465a3e0772936e23b895d095087de8.jpg",
      name: { uz: "Registon maydoni", ru: "Площадь Регистан", en: "Registan Square" },
      description: {
        uz: "Registon — Samarqandning ramzi va Oʻrta Osiyoning eng mashhur maydoni. Uch ulugʻ madrasa: Ulugʻbek, Sher-Dor va Tilla-Qori ansambl tashkil qiladi. Kechalari yoritish va ovozli koʻrsatuvlar boʻlib oʻtadi.",
        ru: "Регистан — символ Самарканда и самая известная площадь Средней Азии. Три величественных медресе — Улугбека, Шер-Дор и Тилля-Кари — образуют единый ансамбль. Вечером проходят световые и звуковые шоу.",
        en: "Registan is the symbol of Samarkand and the most famous square in Central Asia. Three grand madrasahs — Ulugh Beg, Sher-Dor and Tilla-Kari — form a single ensemble. Evening light and sound shows are held here."
      }
    },
    {
      id: "sm2",
      image: "https://images.pexels.com/photos/175773/pexels-photo-175773.jpeg",
      name: { uz: "Shohi Zinda", ru: "Шахи-Зинда", en: "Shahi Zinda" },
      description: {
        uz: "Shohi Zinda — qadimiy nekropol, XI–XIX asrlar davomida qurilgan maqbara va ziyoratgohlar qatori. Amir Temur avlodi va din arboblari dafn etilgan. Koʻk va sirkor bezaklar bilan ajralib turadi.",
        ru: "Шахи-Зинда — древний некрополь, аллея мавзолеев и святынь XI–XIX веков. Здесь похоронены члены семьи Тимура и религиозные деятели. Ансамбль славится бирюзовой и изразцовой отделкой.",
        en: "Shahi Zinda is an ancient necropolis — an alley of mausoleums and shrines from the 11th–19th centuries. Members of Timur's family and religious figures are buried here. The ensemble is famous for its turquoise and tile decoration."
      }
    },
    {
      id: "sm3",
      image: "https://images.pexels.com/photos/21014/pexels-photo.jpg",
      name: { uz: "Bibixonim masjidi", ru: "Мечеть Биби-Ханым", en: "Bibi Khanum Mosque" },
      description: {
        uz: "Bibixonim masjidi XIV asrda Amir Temur buyrugʻi bilan Hindistondan olingan gʻanimatlar hisobiga qurilgan. Oʻsha davrning eng yirik masjidlaridan biri. Gumbaz va peshtoq bezaklari hozir ham taassurot qoldiradi.",
        ru: "Мечеть Биби-Ханым была построена в XIV веке по приказу Тимура на средства из походов в Индию. Одна из крупнейших мечетей своего времени. Декор купола и портала до сих пор впечатляет.",
        en: "The Bibi Khanum Mosque was built in the 14th century on Timur's orders using spoils from his Indian campaigns. One of the largest mosques of its time. The dome and portal decoration still impress today."
      }
    },
    {
      id: "bx1",
      image: "https://resize.tripster.ru/CBS3Bc3dCbADxN3slKwDXgsG_mM=/fit-in/1220x600/filters:no_upscale()/https://cdn.tripster.ru/photos/9f1014c3-7604-42ff-a49c-555ddb6f2048.jpg?width=1200&height=630",
      name: { uz: "Ark qal'asi", ru: "Крепость Арк", en: "Ark Fortress" },
      description: {
        uz: "Ark — Buxoro xonlarining qadimiy qalʼasi, miloddan avvalgi asrlardan maʼlum. Ichida xon saroyi, zindon, masjid va hukumat binolari boʻlgan. Hozirda Buxoro tarixi va meʼmorchiligi muzeyi joylashgan.",
        ru: "Арк — древняя цитадель бухарских ханов, известная с античных времён. Внутри находились дворец, тюрьма, мечеть и административные здания. Сейчас здесь музей истории и архитектуры Бухары.",
        en: "The Ark is the ancient citadel of the Bukhara khans, dating back to antiquity. It contained the palace, prison, mosque and government buildings. Today it houses the Museum of Bukhara's history and architecture."
      }
    },
    {
      id: "bx2",
      image: "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg",
      name: { uz: "Minorai Kalon", ru: "Минарет Калян", en: "Kalon Minaret" },
      description: {
        uz: "Minorai Kalon 1127 yilda qurilgan, balandligi 47 metr. Buxoro va Oʻrta Osiyo islom meʼmorchiligining ramzi. Minora atrofida Kalon masjidi va Mir-i Arab madrasasi joylashgan — Poi Kalon ansambli.",
        ru: "Минарет Калян построен в 1127 году, высота 47 метров. Символ Бухары и исламской архитектуры Средней Азии. Рядом — мечеть Калян и медресе Мири-Араб, вместе они образуют ансамбль Пои-Калян.",
        en: "The Kalon Minaret was built in 1127 and is 47 metres high. A symbol of Bukhara and Central Asian Islamic architecture. Next to it are the Kalon Mosque and Mir-i Arab Madrasah, forming the Poi Kalon ensemble."
      }
    },
    {
      id: "bx3",
      image: "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",
      name: { uz: "Labi Hovuz", ru: "Ляби-Хауз", en: "Lyab-i Hauz" },
      description: {
        uz: "Labi Hovuz — eski Buxorodagi hovuz atrofidagi maydon, XVII asrda yaratilgan. Nadir Devonbegi madrasasi, xonaqoh va ikkita karvonsaroy atrofida joylashgan. Choyxonalar va dam olish joyi sifatida mashhur.",
        ru: "Ляби-Хауз — площадь вокруг пруда в старом городе Бухары, созданная в XVII веке. Вокруг расположены медресе Надир Диван-беги, хонака и два караван-сарая. Популярное место для чайных и отдыха.",
        en: "Lyab-i Hauz is the square around a pond in old Bukhara, created in the 17th century. It is surrounded by the Nadir Divan-begi madrasah, a khanaka and two caravanserais. A popular spot for teahouses and relaxation."
      }
    },
    {
      id: "xv1",
      image: "https://uzbekistan.travel/storage/app/uploads/public/671/9e1/9fc/thumb_3975_1140_0_0_0_auto.jpg",
      name: { uz: "Ichan-Qal'a", ru: "Ичан-Кала", en: "Itchan Kala" },
      description: {
        uz: "Ichan-Qal'a — Xiva ichki shahri, toʻliq saqlanib qolgan qadimiy devor bilan oʻralgan. YuNESKO Butunjahon merosi roʻyxatiga kiritilgan. Ichida 50 dan ortiq yodgorlik: minoralar, masjidlar, madrasalar va saroylar.",
        ru: "Ичан-Кала — внутренний город Хивы, окружённый цельной крепостной стеной. Включён в список Всемирного наследия ЮНЕСКО. Внутри более 50 памятников: минареты, мечети, медресе и дворцы.",
        en: "Itchan Kala is Khiva's inner town, surrounded by a complete fortified wall. It is a UNESCO World Heritage site. Inside are over 50 monuments: minarets, mosques, madrasahs and palaces."
      }
    },
    {
      id: "xv2",
      image: "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg",
      name: { uz: "Kalta Minor", ru: "Калта-Минор", en: "Kalta Minor" },
      description: {
        uz: "Kalta Minor — Xivadagi past minora, 1855 yilda qurila boshangan, toʻliq tugallanmagan. Poydevorsiz, kobalt va sirkor koshinlar bilan qoplangan. Shaharning eng taniqli ramzlaridan biri.",
        ru: "Калта-Минор — низкий минарет в Хиве, строительство началось в 1855 году и не было завершено. Без традиционного основания, облицован кобальтовой и бирюзовой плиткой. Один из главных символов города.",
        en: "Kalta Minor is a short minaret in Khiva; construction began in 1855 and was never completed. It has no traditional base and is clad in cobalt and turquoise tiles. One of the city's main symbols."
      }
    },
    {
      id: "xv3",
      image: "https://uzbekistan.travel/storage/app/uploads/public/671/9e1/9fc/thumb_3975_1140_0_0_0_auto.jpg",
      name: { uz: "Tosh Hovli saroyi", ru: "Дворец Таш-Хаули", en: "Tash-Khauli Palace" },
      description: {
        uz: "Tosh Hovli — Xiva xonlarining 1830–1840-yillarda qurilgan saroyi. Haram, sudxona va rasmiy qabulxona qismlari mavjud. Oq marmar va yogʻoch oʻymakorligi, koshinlar bilan bezatilgan.",
        ru: "Таш-Хаули — дворец хивинских ханов, построенный в 1830–1840-х годах. Включает гарем, судебную палату и приёмный зал. Украшен белым мрамором, резьбой по дереву и изразцами.",
        en: "Tash-Khauli is the palace of the Khiva khans, built in the 1830s–1840s. It contains the harem, court chamber and reception hall. Decorated with white marble, woodcarving and tiles."
      }
    }
  ]
};

const tourPhotosSectionTitle: Record<LangCode, string> = {
  uz: "Tur joylari — fotosuratlar va tavsiflar",
  ru: "Места тура — фото и описание",
  en: "Tour locations — photos and descriptions"
};

type TransportMode = "train" | "metro" | "taxi" | "car";

type LogisticsSegment = {
  from: Record<LangCode, string>;
  to: Record<LangCode, string>;
  transport: TransportMode;
  duration: string;
  note?: Record<LangCode, string>;
};

const transportModeLabel: Record<TransportMode, Record<LangCode, string>> = {
  train: { uz: "Poyezd", ru: "Поезд", en: "Train" },
  metro: { uz: "Metro", ru: "Метро", en: "Metro" },
  taxi: { uz: "Taksi", ru: "Такси", en: "Taxi" },
  car: { uz: "Avto", ru: "Авто", en: "Car" }
};

const logisticsSectionTitle: Record<LangCode, string> = {
  uz: "Logistika — transport va vaqt",
  ru: "Логистика — транспорт и время",
  en: "Logistics — transport and time"
};

const logisticsByTier: Record<TierId, LogisticsSegment[]> = {
  economy: [
    {
      from: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" },
      to: { uz: "Toshkent Janubiy vokzal", ru: "Ташкент Южный вокзал", en: "Tashkent South station" },
      transport: "metro",
      duration: "25 min",
      note: { uz: "Shahar markazi → vokzal", ru: "Центр города → вокзал", en: "City centre → station" }
    },
    {
      from: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" },
      to: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" },
      transport: "train",
      duration: "2 soat 10 min",
      note: { uz: "Afrosiyob tez poyezd", ru: "Скоростной поезд «Афросиёб»", en: "Afrosiyob high-speed train" }
    },
    {
      from: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" },
      to: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" },
      transport: "train",
      duration: "1 soat 40 min",
      note: { uz: "Afrosiyob tez poyezd", ru: "Скоростной поезд «Афросиёб»", en: "Afrosiyob high-speed train" }
    }
  ],
  standard: [
    {
      from: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" },
      to: { uz: "Toshkent Janubiy vokzal", ru: "Ташкент Южный вокзал", en: "Tashkent South station" },
      transport: "metro",
      duration: "25 min",
      note: { uz: "Metro → vokzal", ru: "Метро до вокзала", en: "Metro to station" }
    },
    {
      from: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" },
      to: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" },
      transport: "train",
      duration: "2 soat 10 min",
      note: { uz: "Afrosiyob tez poyezd", ru: "Скоростной поезд «Афросиёб»", en: "Afrosiyob high-speed train" }
    },
    {
      from: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" },
      to: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" },
      transport: "train",
      duration: "1 soat 40 min",
      note: { uz: "Afrosiyob tez poyezd", ru: "Скоростной поезд «Афросиёб»", en: "Afrosiyob high-speed train" }
    },
    {
      from: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" },
      to: { uz: "Xiva", ru: "Хива", en: "Khiva" },
      transport: "car",
      duration: "6 soat",
      note: { uz: "Transfer yoki taksi (Urgench orqali)", ru: "Трансфер или такси (через Ургенч)", en: "Transfer or taxi (via Urgench)" }
    },
    {
      from: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" },
      to: { uz: "Xiva", ru: "Хива", en: "Khiva" },
      transport: "taxi",
      duration: "30 min",
      note: { uz: "Urgench aeroporti → Xiva", ru: "Аэропорт Ургенча → Хива", en: "Urgench airport → Khiva" }
    }
  ],
  premium: [
    {
      from: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" },
      to: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" },
      transport: "train",
      duration: "2 soat 10 min",
      note: { uz: "Afrosiyob business-klass", ru: "«Афросиёб» бизнес-класс", en: "Afrosiyob business class" }
    },
    {
      from: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" },
      to: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" },
      transport: "taxi",
      duration: "20 min",
      note: { uz: "Mehmonxona → vokzal", ru: "Отель → вокзал", en: "Hotel → station" }
    },
    {
      from: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" },
      to: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" },
      transport: "train",
      duration: "1 soat 40 min",
      note: { uz: "Tez poyezd", ru: "Скоростной поезд", en: "High-speed train" }
    },
    {
      from: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" },
      to: { uz: "Xiva", ru: "Хива", en: "Khiva" },
      transport: "car",
      duration: "6 soat",
      note: { uz: "Shaxsiy transfer", ru: "Индивидуальный трансфер", en: "Private transfer" }
    }
  ]
};

type Hotel = {
  id: string;
  name: Record<LangCode, string>;
  city: Record<LangCode, string>;
  stars: 3 | 4 | 5;
  pricePerNight: number;
  pluses: Record<LangCode, string>;
  images: string[];
  hasBreakfast: boolean;
};

type RoadmapDay = {
  day: number;
  cityId: string;
  hotelId: string;
  restaurantIds: string[];
};

type ScheduleItem = {
  time: string;
  text: Record<LangCode, string>;
  isSection?: boolean;
};

type DayLogisticsSegment = {
  from: Record<LangCode, string>;
  to: Record<LangCode, string>;
  transport: TransportMode;
  duration: string;
  time?: string;
  note?: Record<LangCode, string>;
};

type FullDaySchedule = {
  day: number;
  cityId: string;
  hotelId: string;
  restaurantIds: string[];
  spotIds: string[];
  logistics: DayLogisticsSegment[];
  lunchRestaurantIds?: string[];
  dinnerRestaurantIds?: string[];
  schedule: ScheduleItem[];
};

const fullDaySchedulesByTier: Record<TierId, FullDaySchedule[]> = {
  economy: [
    {
      day: 1,
      cityId: "tashkent",
      hotelId: "tk3",
      restaurantIds: ["tk1", "tk2"],
      spotIds: ["tk1", "tk2", "tk3"],
      logistics: [
        { from: { uz: "Toshkent aeroporti", ru: "Аэропорт Ташкента", en: "Tashkent airport" }, to: { uz: "Mehmonxona", ru: "Отель", en: "Hotel" }, transport: "taxi", duration: "20–30 min", time: "12:00", note: { uz: "Transfer guruhi yoki taksi", ru: "Групповой трансфер или такси", en: "Group transfer or taxi" } }
      ],
      dinnerRestaurantIds: ["tk1", "tk2"],
      schedule: [
        { time: "12:00", text: { uz: "Aeroportdan transfer, mehmonxonaga borish", ru: "Трансфер из аэропорта, заезд в отель", en: "Airport transfer, hotel check-in" } },
        { time: "14:00", text: { uz: "Mehmonxonada dam olish", ru: "Отдых в отеле", en: "Rest at hotel" } },
        { isSection: true, time: "", text: { uz: "Kechqurun ko‘rish mumkin bo‘lgan joylar:", ru: "Что посмотреть вечером:", en: "Places to visit in the evening:" } },
        { time: "", text: { uz: "Hazrati Imom, Chorsu bozori", ru: "Хазрати Имам, базар Чорсу", en: "Hazrati Imam, Chorsu Bazaar" } },
        { time: "20:00", text: { uz: "Kechki ovqat — Osh markazi yoki Caravan", ru: "Ужин — Центр Плова или Караван", en: "Dinner — Plov Center or Caravan" } }
      ]
    },
    {
      day: 2,
      cityId: "tashkent",
      hotelId: "tk3",
      restaurantIds: ["tk1", "tk2"],
      spotIds: ["sm1", "sm2", "sm3"],
      logistics: [
        { from: { uz: "Mehmonxona", ru: "Отель", en: "Hotel" }, to: { uz: "Toshkent Janubiy vokzal", ru: "Южный вокзал Ташкента", en: "Tashkent South station" }, transport: "metro", duration: "25 min", time: "08:30", note: { uz: "Metro liniyasi — markazdan vokzalga", ru: "Метро — из центра до вокзала", en: "Metro — centre to station" } },
        { from: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" }, to: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" }, transport: "train", duration: "2 soat 10 min", time: "09:30", note: { uz: "Afrosiyob tez poyezd, jo‘nash ~09:30", ru: "Скоростной поезд Афросиёб, отправление ~09:30", en: "Afrosiyob high-speed train, dep ~09:30" } },
        { from: { uz: "Samarqand vokzali", ru: "Вокзал Самарканда", en: "Samarkand station" }, to: { uz: "Mehmonxona", ru: "Отель", en: "Hotel" }, transport: "taxi", duration: "15 min", time: "12:00", note: { uz: "Taksi yoki transfer", ru: "Такси или трансфер", en: "Taxi or transfer" } }
      ],
      dinnerRestaurantIds: ["sm1", "sm2"],
      schedule: [
        { time: "08:00", text: { uz: "Nonushta mehmonxonada", ru: "Завтрак в отеле", en: "Breakfast at hotel" } },
        { time: "09:30", text: { uz: "Poyezdda Samarqandga (2 soat 10 min) — Afrosiyob", ru: "Поезд в Самарканд (2 ч 10 мин) — Афросиёб", en: "Train to Samarkand (2h 10min) — Afrosiyob" } },
        { time: "12:00", text: { uz: "Mehmonxonaga kirish, joylashish", ru: "Прибытие, заселение в отель", en: "Hotel check-in in Samarkand" } },
        { isSection: true, time: "", text: { uz: "Tashrif buyurish:", ru: "Посещение:", en: "Visit:" } },
        { time: "", text: { uz: "Registon, Shohi Zinda, Bibixonim", ru: "Регистан, Шахи-Зинда, Биби-Ханым", en: "Registan, Shahi Zinda, Bibi Khanum" } },
        { time: "19:00", text: { uz: "Kechki ovqat — Platan yoki Samarqand restoran", ru: "Ужин — Платан или ресторан Самарканд", en: "Dinner — Platan or Samarkand Restaurant" } }
      ]
    },
    {
      day: 3,
      cityId: "samarkand",
      hotelId: "sm3",
      restaurantIds: ["sm1", "sm2"],
      spotIds: ["bx1", "bx2", "bx3"],
      logistics: [
        { from: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" }, to: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" }, transport: "train", duration: "1 soat 40 min", time: "09:00", note: { uz: "Afrosiyob tez poyezd yoki avtobus (4 soat)", ru: "Поезд Афросиёб или автобус (4 ч)", en: "Afrosiyob train or bus (4h)" } },
        { from: { uz: "Buxoro vokzali", ru: "Вокзал Бухары", en: "Bukhara station" }, to: { uz: "Mehmonxona", ru: "Отель", en: "Hotel" }, transport: "taxi", duration: "15 min", time: "13:00" }
      ],
      lunchRestaurantIds: ["bx1", "bx3"],
      schedule: [
        { time: "08:00", text: { uz: "Nonushta mehmonxonada", ru: "Завтрак в отеле", en: "Breakfast at hotel" } },
        { time: "09:00", text: { uz: "Transfer Buxoroga (4 soat) — avto/poezd", ru: "Трансфер в Бухару (4 ч) — авто/поезд", en: "Transfer to Bukhara (4h) — car/train" } },
        { time: "13:00", text: { uz: "Mehmonxonaga kirish", ru: "Заселение в отель", en: "Hotel check-in" } },
        { time: "14:00", text: { uz: "Tushlik — Chasmai Mirob yoki Lyab-i Hauz", ru: "Обед — Часмаи Мироб или Ляби-Хауз", en: "Lunch — Chasmai Mirob or Lyab-i Hauz" } },
        { isSection: true, time: "", text: { uz: "Ko‘rish:", ru: "Посещение:", en: "Visit:" } },
        { time: "", text: { uz: "Ark, Minorai Kalon, Labi Hovuz", ru: "Арк, минарет Калян, Ляби-Хауз", en: "Ark, Kalon Minaret, Lyab-i Hauz" } }
      ]
    },
    {
      day: 4,
      cityId: "bukhara",
      hotelId: "bx2",
      restaurantIds: ["bx1", "bx2", "bx3"],
      spotIds: ["bx1", "bx2", "bx3"],
      logistics: [
        { from: { uz: "Mehmonxona", ru: "Отель", en: "Hotel" }, to: { uz: "Ark qal'asi", ru: "Крепость Арк", en: "Ark Fortress" }, transport: "car", duration: "10 min", time: "09:00", note: { uz: "Piyoda yoki taksi — shahar ichida", ru: "Пешком или такси — в черте города", en: "On foot or taxi — within city" } }
      ],
      lunchRestaurantIds: ["bx2", "bx1"],
      schedule: [
        { time: "08:00", text: { uz: "Nonushta mehmonxonada", ru: "Завтрак в отеле", en: "Breakfast at hotel" } },
        { time: "09:00", text: { uz: "Eski Buxoroni sayohat qilish", ru: "Прогулка по старой Бухаре", en: "Walk through old Bukhara" } },
        { time: "12:00", text: { uz: "Tushlik — Minzifa yoki Chasmai Mirob", ru: "Обед — Минзифа или Часмаи Мироб", en: "Lunch — Minzifa or Chasmai Mirob" } },
        { time: "15:00", text: { uz: "Bo‘zori va hunarmandchilik", ru: "Базар и ремёсла", en: "Bazaar and crafts" } }
      ]
    }
  ],
  standard: [
    {
      day: 1,
      cityId: "tashkent",
      hotelId: "tk2",
      restaurantIds: ["tk1", "tk2"],
      spotIds: ["tk1", "tk2", "tk3"],
      logistics: [
        { from: { uz: "Toshkent aeroporti", ru: "Аэропорт Ташкента", en: "Tashkent airport" }, to: { uz: "Hyatt Regency", ru: "Hyatt Regency", en: "Hyatt Regency" }, transport: "taxi", duration: "25 min", time: "12:00", note: { uz: "Taksi yoki transfer", ru: "Такси или трансфер", en: "Taxi or transfer" } }
      ],
      dinnerRestaurantIds: ["tk1", "tk2"],
      schedule: [
        { time: "12:00", text: { uz: "Aeroportdan transfer, mehmonxonaga joylashish", ru: "Трансфер из аэропорта, заселение в отель", en: "Airport transfer, hotel check-in" } },
        { time: "14:00", text: { uz: "Mehmonxonada dam olish", ru: "Отдых в отеле", en: "Rest at hotel" } },
        { isSection: true, time: "", text: { uz: "Kechqurun joylar:", ru: "Вечером:", en: "Evening:" } },
        { time: "", text: { uz: "Hazrati Imom, Chorsu bozori, Amir Temur xiyoboni", ru: "Хазрати Имам, Чорсу, сквер Амира Темура", en: "Hazrati Imam, Chorsu, Amir Timur Square" } },
        { time: "19:30", text: { uz: "Kechki ovqat — Osh markazi yoki Caravan", ru: "Ужин — Центр Плова или Караван", en: "Dinner — Plov Center or Caravan" } }
      ]
    },
    {
      day: 2,
      cityId: "tashkent",
      hotelId: "tk2",
      restaurantIds: ["tk1", "tk2"],
      spotIds: ["sm1", "sm2", "sm3"],
      logistics: [
        { from: { uz: "Hyatt Regency", ru: "Hyatt Regency", en: "Hyatt Regency" }, to: { uz: "Toshkent Janubiy vokzal", ru: "Южный вокзал", en: "Tashkent South station" }, transport: "metro", duration: "25 min", time: "08:30" },
        { from: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" }, to: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" }, transport: "train", duration: "2 soat 10 min", time: "09:30", note: { uz: "Afrosiyob", ru: "Афросиёб", en: "Afrosiyob" } },
        { from: { uz: "Samarqand vokzali", ru: "Вокзал Самарканда", en: "Samarkand station" }, to: { uz: "Emir Han Hotel", ru: "Emir Han Hotel", en: "Emir Han Hotel" }, transport: "taxi", duration: "15 min", time: "12:00" }
      ],
      dinnerRestaurantIds: ["sm1", "sm3"],
      schedule: [
        { time: "08:00", text: { uz: "Nonushta mehmonxonada", ru: "Завтрак в отеле", en: "Breakfast at hotel" } },
        { time: "09:30", text: { uz: "Metro → vokzal (25 min), poyezd Samarqandga (2 soat 10 min)", ru: "Метро → вокзал (25 мин), поезд в Самарканд (2 ч 10 мин)", en: "Metro to station (25 min), train to Samarkand (2h 10min)" } },
        { time: "12:00", text: { uz: "Mehmonxonaga kirish — Emir Han Hotel", ru: "Заселение — Emir Han Hotel", en: "Check-in — Emir Han Hotel" } },
        { isSection: true, time: "", text: { uz: "Tashrif:", ru: "Посещение:", en: "Visit:" } },
        { time: "", text: { uz: "Registon, Shohi Zinda, Bibixonim", ru: "Регистан, Шахи-Зинда, Биби-Ханым", en: "Registan, Shahi Zinda, Bibi Khanum" } },
        { time: "19:00", text: { uz: "Kechki ovqat — Platan yoki Old City Samarkand", ru: "Ужин — Платан или Old City Samarkand", en: "Dinner — Platan or Old City Samarkand" } }
      ]
    },
    {
      day: 3,
      cityId: "samarkand",
      hotelId: "sm2",
      restaurantIds: ["sm1", "sm2", "sm3"],
      spotIds: ["sm1", "sm2", "sm3"],
      logistics: [
        { from: { uz: "Emir Han", ru: "Emir Han", en: "Emir Han" }, to: { uz: "Ulug'bek rasadxonasi", ru: "Обсерватория Улугбека", en: "Ulugh Beg Observatory" }, transport: "taxi", duration: "20 min", time: "09:00" },
        { from: { uz: "Rasadxona", ru: "Обсерватория", en: "Observatory" }, to: { uz: "Afrosiyob muzeyi", ru: "Музей Афросиёб", en: "Afrosiyob Museum" }, transport: "taxi", duration: "15 min", time: "10:30" },
        { from: { uz: "Afrosiyob", ru: "Афросиёб", en: "Afrosiyob" }, to: { uz: "Registon", ru: "Регистан", en: "Registan" }, transport: "taxi", duration: "10 min", time: "17:00", note: { uz: "Kechki ko'rinish", ru: "Вечерний вид", en: "Night view" } }
      ],
      lunchRestaurantIds: ["sm2"],
      dinnerRestaurantIds: ["sm1"],
      schedule: [
        { time: "08:00", text: { uz: "Nonushta mehmonxonada", ru: "Завтрак в отеле", en: "Breakfast at hotel" } },
        { isSection: true, time: "", text: { uz: "Ekskursiya:", ru: "Экскурсия:", en: "Tour:" } },
        { time: "", text: { uz: "Ulug‘bek rasadxonasi, Afrosiyob muzeyi, Registon (kechki ko‘rinish)", ru: "Обсерватория Улугбека, музей Афросиёб, Регистан (вечером)", en: "Ulugh Beg Observatory, Afrosiyob Museum, Registan (night view)" } },
        { time: "13:00", text: { uz: "Tushlik — Samarqand restoran", ru: "Обед — ресторан Самарканд", en: "Lunch — Samarkand Restaurant" } },
        { time: "19:00", text: { uz: "Kechki ovqat — Platan", ru: "Ужин — Платан", en: "Dinner — Platan" } }
      ]
    },
    {
      day: 4,
      cityId: "samarkand",
      hotelId: "sm2",
      restaurantIds: ["sm1", "sm2", "sm3"],
      spotIds: ["bx1", "bx2", "bx3"],
      logistics: [
        { from: { uz: "Samarqand vokzali", ru: "Вокзал Самарканда", en: "Samarkand station" }, to: { uz: "Buxoro vokzali", ru: "Вокзал Бухары", en: "Bukhara station" }, transport: "train", duration: "1 soat 40 min", time: "09:00", note: { uz: "Afrosiyob tez poyezd", ru: "Поезд Афросиёб", en: "Afrosiyob train" } },
        { from: { uz: "Buxoro vokzali", ru: "Вокзал Бухары", en: "Bukhara station" }, to: { uz: "Komil Bukhara", ru: "Komil Bukhara", en: "Komil Bukhara" }, transport: "taxi", duration: "15 min", time: "11:00" },
        { from: { uz: "Mehmonxona", ru: "Отель", en: "Hotel" }, to: { uz: "Ark", ru: "Арк", en: "Ark" }, transport: "car", duration: "10 min", time: "14:00" }
      ],
      lunchRestaurantIds: ["bx3"],
      dinnerRestaurantIds: ["bx1", "bx2"],
      schedule: [
        { time: "08:00", text: { uz: "Nonushta mehmonxonada", ru: "Завтрак в отеле", en: "Breakfast at hotel" } },
        { time: "09:00", text: { uz: "Transfer Buxoroga — poyezd (1 soat 40 min)", ru: "Поезд в Бухару (1 ч 40 мин)", en: "Train to Bukhara (1h 40min)" } },
        { time: "11:00", text: { uz: "Mehmonxonaga kirish — Komil Bukhara", ru: "Заселение — Komil Bukhara", en: "Check-in — Komil Bukhara" } },
        { time: "13:00", text: { uz: "Tushlik — Lyab-i Hauz atrofidagi choyxona", ru: "Обед — чайхана у Ляби-Хауз", en: "Lunch — teahouse by Lyab-i Hauz" } },
        { isSection: true, time: "", text: { uz: "Ko‘rish:", ru: "Посещение:", en: "Visit:" } },
        { time: "", text: { uz: "Ark, Minorai Kalon, Labi Hovuz", ru: "Арк, Калян, Ляби-Хауз", en: "Ark, Kalon Minaret, Lyab-i Hauz" } },
        { time: "19:00", text: { uz: "Kechki ovqat — Chasmai Mirob yoki Minzifa", ru: "Ужин — Часмаи Мироб или Минзифа", en: "Dinner — Chasmai Mirob or Minzifa" } }
      ]
    },
    {
      day: 5,
      cityId: "bukhara",
      hotelId: "bx2",
      spotIds: ["xv1"],
      logistics: [
        { from: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" }, to: { uz: "Xiva", ru: "Хива", en: "Khiva" }, transport: "car", duration: "6 soat", time: "09:00", note: { uz: "Shaxsiy avto yoki Urgench + taksi (30 min)", ru: "Авто или Ургенч + такси (30 мин)", en: "Car or Urgench + taxi (30 min)" } },
        { from: { uz: "Xiva/Urgench", ru: "Хива/Ургенч", en: "Khiva/Urgench" }, to: { uz: "Malika Khiva", ru: "Malika Khiva", en: "Malika Khiva" }, transport: "taxi", duration: "15 min", time: "15:00" }
      ],
      dinnerRestaurantIds: ["xv1", "xv2"],
      restaurantIds: ["bx1", "bx2", "bx3"],
      schedule: [
        { time: "08:00", text: { uz: "Nonushta mehmonxonada", ru: "Завтрак в отеле", en: "Breakfast at hotel" } },
        { time: "09:00", text: { uz: "Transfer Xivaga — avto (6 soat) yoki Urgench + taksi", ru: "Трансфер в Хиву (6 ч) — авто/поезд Ургенч + такси", en: "Transfer to Khiva (6h) — car or Urgench + taxi" } },
        { time: "15:00", text: { uz: "Mehmonxonaga kirish — Malika Khiva", ru: "Заселение — Malika Khiva", en: "Check-in — Malika Khiva" } },
        { time: "18:00", text: { uz: "Ichan-Qal'a sayohati", ru: "Прогулка по Ичан-Кале", en: "Walk through Itchan Kala" } },
        { time: "20:00", text: { uz: "Kechki ovqat — Terassa Café yoki Bir Gumbaz", ru: "Ужин — Terassa Café или Бир Гумбаз", en: "Dinner — Terassa Café or Bir Gumbaz" } }
      ]
    },
    {
      day: 6,
      cityId: "khiva",
      hotelId: "xv2",
      restaurantIds: ["xv1", "xv2"],
      spotIds: ["xv1", "xv2", "xv3"],
      logistics: [
        { from: { uz: "Malika Khiva", ru: "Malika Khiva", en: "Malika Khiva" }, to: { uz: "Ichan-Qal'a", ru: "Ичан-Кала", en: "Itchan Kala" }, transport: "car", duration: "5 min", time: "09:00", note: { uz: "Piyoda 10 min", ru: "Пешком 10 мин", en: "On foot 10 min" } }
      ],
      lunchRestaurantIds: ["xv1"],
      schedule: [
        { time: "08:00", text: { uz: "Nonushta mehmonxonada", ru: "Завтрак в отеле", en: "Breakfast at hotel" } },
        { isSection: true, time: "", text: { uz: "Xiva ekskursiyasi:", ru: "Экскурсия по Хиве:", en: "Khiva tour:" } },
        { time: "", text: { uz: "Ichan-Qal'a, Kalta Minor, Tosh Hovli, Jome masjidi", ru: "Ичан-Кала, Калта-Минор, Таш-Хаули, Джума-мечеть", en: "Itchan Kala, Kalta Minor, Tash-Khauli, Juma Mosque" } },
        { time: "13:00", text: { uz: "Tushlik — Terassa Café", ru: "Обед — Terassa Café", en: "Lunch — Terassa Café" } }
      ]
    }
  ],
  premium: [
    {
      day: 1,
      cityId: "tashkent",
      hotelId: "tk1",
      restaurantIds: ["tk1", "tk2"],
      spotIds: ["tk1", "tk2", "tk3"],
      logistics: [
        { from: { uz: "Aeroport", ru: "Аэропорт", en: "Airport" }, to: { uz: "Lotte City Hotel", ru: "Lotte City Hotel", en: "Lotte City Hotel" }, transport: "taxi", duration: "25 min", time: "12:00", note: { uz: "VIP transfer", ru: "VIP трансфер", en: "VIP transfer" } }
      ],
      dinnerRestaurantIds: ["tk2"],
      schedule: [
        { time: "12:00", text: { uz: "VIP transfer aeroportdan, Lotte City Hotel", ru: "VIP трансфер, заселение Lotte City Hotel", en: "VIP airport transfer, Lotte City Hotel check-in" } },
        { time: "14:00", text: { uz: "Mehmonxonada dam olish", ru: "Отдых в отеле", en: "Rest at hotel" } },
        { time: "17:00", text: { uz: "Shaxsiy gid bilan shahar turi", ru: "Экскурсия с личным гидом", en: "City tour with private guide" } },
        { time: "20:00", text: { uz: "Kechki ovqat — Caravan", ru: "Ужин — Караван", en: "Dinner — Caravan" } }
      ]
    },
    {
      day: 2,
      cityId: "tashkent",
      hotelId: "tk1",
      restaurantIds: ["tk1", "tk2"],
      spotIds: ["sm1", "sm2", "sm3"],
      logistics: [
        { from: { uz: "Lotte City Hotel", ru: "Lotte City Hotel", en: "Lotte City Hotel" }, to: { uz: "Vokzal", ru: "Вокзал", en: "Station" }, transport: "taxi", duration: "20 min", time: "08:30" },
        { from: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" }, to: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" }, transport: "train", duration: "2 soat 10 min", time: "09:00", note: { uz: "Afrosiyob business-klass", ru: "Афросиёб бизнес", en: "Afrosiyob business" } },
        { from: { uz: "Samarqand vokzali", ru: "Вокзал Самарканда", en: "Samarkand station" }, to: { uz: "Registan Plaza Hotel", ru: "Registan Plaza Hotel", en: "Registan Plaza Hotel" }, transport: "taxi", duration: "15 min", time: "11:30" }
      ],
      dinnerRestaurantIds: ["sm3"],
      schedule: [
        { time: "08:00", text: { uz: "Nonushta mehmonxonada", ru: "Завтрак в отеле", en: "Breakfast at hotel" } },
        { time: "09:00", text: { uz: "Taksi vokzalga (20 min), Afrosiyob business-klass (2 soat 10 min)", ru: "Такси на вокзал (20 мин), поезд бизнес (2 ч 10 мин)", en: "Taxi to station (20 min), business train (2h 10min)" } },
        { time: "11:30", text: { uz: "Mehmonxonaga kirish — Registan Plaza Hotel", ru: "Заселение — Registan Plaza Hotel", en: "Check-in — Registan Plaza Hotel" } },
        { isSection: true, time: "", text: { uz: "Tashrif:", ru: "Посещение:", en: "Visit:" } },
        { time: "", text: { uz: "Registon, Shohi Zinda, Bibixonim", ru: "Регистан, Шахи-Зинда, Биби-Ханым", en: "Registan, Shahi Zinda, Bibi Khanum" } },
        { time: "19:30", text: { uz: "Kechki ovqat — Old City Samarkand (panorama)", ru: "Ужин — Old City Samarkand (панорама)", en: "Dinner — Old City Samarkand (panorama)" } }
      ]
    },
    {
      day: 3,
      cityId: "samarkand",
      hotelId: "sm1",
      spotIds: ["sm1", "sm2", "sm3"],
      logistics: [
        { from: { uz: "Registan Plaza", ru: "Registan Plaza", en: "Registan Plaza" }, to: { uz: "Ulug'bek rasadxonasi", ru: "Обсерватория Улугбека", en: "Ulugh Beg Observatory" }, transport: "taxi", duration: "20 min", time: "09:00" },
        { from: { uz: "Rasadxona", ru: "Обсерватория", en: "Observatory" }, to: { uz: "Registon", ru: "Регистан", en: "Registan" }, transport: "taxi", duration: "15 min", time: "11:00" },
        { from: { uz: "Registon", ru: "Регистан", en: "Registan" }, to: { uz: "Shohi Zinda", ru: "Шахи-Зинда", en: "Shahi Zinda" }, transport: "taxi", duration: "10 min", time: "14:00" }
      ],
      lunchRestaurantIds: ["sm1"],
      dinnerRestaurantIds: ["sm2"],
      restaurantIds: ["sm1", "sm2", "sm3"],
      schedule: [
        { time: "08:00", text: { uz: "Nonushta mehmonxonada", ru: "Завтрак в отеле", en: "Breakfast at hotel" } },
        { isSection: true, time: "", text: { uz: "Premium ekskursiya:", ru: "Премиум экскурсия:", en: "Premium tour:" } },
        { time: "", text: { uz: "Ulug‘bek rasadxonasi, gid bilan Registon, Shohi Zinda", ru: "Обсерватория Улугбека, Регистан и Шахи-Зинда с гидом", en: "Ulugh Beg Observatory, Registan & Shahi Zinda with guide" } },
        { time: "13:00", text: { uz: "Tushlik — Platan", ru: "Обед — Платан", en: "Lunch — Platan" } },
        { time: "19:00", text: { uz: "Kechki ovqat — Samarqand restoran", ru: "Ужин — ресторан Самарканд", en: "Dinner — Samarkand Restaurant" } }
      ]
    },
    {
      day: 4,
      cityId: "samarkand",
      hotelId: "sm1",
      restaurantIds: ["sm1", "sm2", "sm3"],
      spotIds: ["bx1", "bx2", "bx3"],
      logistics: [
        { from: { uz: "Samarqand vokzali", ru: "Вокзал Самарканда", en: "Samarkand station" }, to: { uz: "Buxoro vokzali", ru: "Вокзал Бухары", en: "Bukhara station" }, transport: "train", duration: "1 soat 40 min", time: "09:30" },
        { from: { uz: "Buxoro vokzali", ru: "Вокзал Бухары", en: "Bukhara station" }, to: { uz: "Amulet Boutique Hotel", ru: "Amulet Boutique Hotel", en: "Amulet Boutique Hotel" }, transport: "taxi", duration: "15 min", time: "11:30" },
        { from: { uz: "Mehmonxona", ru: "Отель", en: "Hotel" }, to: { uz: "Ark", ru: "Арк", en: "Ark" }, transport: "taxi", duration: "10 min", time: "14:00" }
      ],
      lunchRestaurantIds: ["bx2"],
      dinnerRestaurantIds: ["bx1"],
      schedule: [
        { time: "08:00", text: { uz: "Nonushta mehmonxonada", ru: "Завтрак в отеле", en: "Breakfast at hotel" } },
        { time: "09:30", text: { uz: "Tez poyezd Buxoroga (1 soat 40 min)", ru: "Скоростной поезд в Бухару (1 ч 40 мин)", en: "High-speed train to Bukhara (1h 40min)" } },
        { time: "11:30", text: { uz: "Mehmonxonaga kirish — Amulet Boutique Hotel", ru: "Заселение — Amulet Boutique Hotel", en: "Check-in — Amulet Boutique Hotel" } },
        { time: "13:00", text: { uz: "Tushlik — Minzifa", ru: "Обед — Минзифа", en: "Lunch — Minzifa" } },
        { isSection: true, time: "", text: { uz: "Ko‘rish:", ru: "Посещение:", en: "Visit:" } },
        { time: "", text: { uz: "Ark, Minorai Kalon, Labi Hovuz", ru: "Арк, Калян, Ляби-Хауз", en: "Ark, Kalon Minaret, Lyab-i Hauz" } },
        { time: "19:30", text: { uz: "Kechki ovqat — Chasmai Mirob", ru: "Ужин — Часмаи Мироб", en: "Dinner — Chasmai Mirob" } }
      ]
    },
    {
      day: 5,
      cityId: "bukhara",
      hotelId: "bx1",
      spotIds: ["xv1"],
      logistics: [
        { from: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" }, to: { uz: "Xiva", ru: "Хива", en: "Khiva" }, transport: "car", duration: "6 soat", time: "09:00", note: { uz: "Shaxsiy avto", ru: "Индивидуальный авто", en: "Private car" } },
        { from: { uz: "Xiva", ru: "Хива", en: "Khiva" }, to: { uz: "Orient Star Khiva", ru: "Orient Star Khiva", en: "Orient Star Khiva" }, transport: "taxi", duration: "5 min", time: "15:00" }
      ],
      dinnerRestaurantIds: ["xv1"],
      restaurantIds: ["bx1", "bx2", "bx3"],
      schedule: [
        { time: "08:00", text: { uz: "Nonushta mehmonxonada", ru: "Завтрак в отеле", en: "Breakfast at hotel" } },
        { time: "09:00", text: { uz: "Shaxsiy transfer Xivaga (6 soat)", ru: "Индивидуальный трансфер в Хиву (6 ч)", en: "Private transfer to Khiva (6h)" } },
        { time: "15:00", text: { uz: "Mehmonxonaga kirish — Orient Star Khiva", ru: "Заселение — Orient Star Khiva", en: "Check-in — Orient Star Khiva" } },
        { time: "18:00", text: { uz: "Ichan-Qal'a sayohati", ru: "Прогулка по Ичан-Кале", en: "Walk through Itchan Kala" } },
        { time: "20:00", text: { uz: "Kechki ovqat — Terassa Café", ru: "Ужин — Terassa Café", en: "Dinner — Terassa Café" } }
      ]
    },
    {
      day: 6,
      cityId: "khiva",
      hotelId: "xv1",
      restaurantIds: ["xv1", "xv2"],
      spotIds: ["xv1", "xv2", "xv3"],
      logistics: [
        { from: { uz: "Orient Star Khiva", ru: "Orient Star Khiva", en: "Orient Star Khiva" }, to: { uz: "Ichan-Qal'a", ru: "Ичан-Кала", en: "Itchan Kala" }, transport: "car", duration: "5 min", time: "09:00", note: { uz: "Piyoda — ichkarida", ru: "Пешком — внутри", en: "On foot — inside" } }
      ],
      lunchRestaurantIds: ["xv2"],
      schedule: [
        { time: "08:00", text: { uz: "Nonushta mehmonxonada", ru: "Завтрак в отеле", en: "Breakfast at hotel" } },
        { isSection: true, time: "", text: { uz: "Xiva ekskursiyasi:", ru: "Экскурсия по Хиве:", en: "Khiva tour:" } },
        { time: "", text: { uz: "Ichan-Qal'a, Kalta Minor, Tosh Hovli, Jome masjidi", ru: "Ичан-Кала, Калта-Минор, Таш-Хаули, Джума-мечеть", en: "Itchan Kala, Kalta Minor, Tash-Khauli, Juma Mosque" } },
        { time: "13:00", text: { uz: "Tushlik — Bir Gumbaz", ru: "Обед — Бир Гумбаз", en: "Lunch — Bir Gumbaz" } }
      ]
    },
    {
      day: 7,
      cityId: "khiva",
      hotelId: "xv1",
      restaurantIds: ["xv1", "xv2"],
      spotIds: [],
      logistics: [
        { from: { uz: "Orient Star Khiva", ru: "Orient Star Khiva", en: "Orient Star Khiva" }, to: { uz: "Urgench aeroporti", ru: "Аэропорт Ургенча", en: "Urgench airport" }, transport: "taxi", duration: "30 min", time: "12:00" }
      ],
      schedule: [
        { time: "08:00", text: { uz: "Nonushta mehmonxonada", ru: "Завтрак в отеле", en: "Breakfast at hotel" } },
        { time: "10:00", text: { uz: "Erkin vaqt, xaridlar", ru: "Свободное время, шоппинг", en: "Free time, shopping" } },
        { time: "12:00", text: { uz: "Transfer aeroportga / uyga", ru: "Трансфер в аэропорт / отъезд", en: "Transfer to airport / departure" } }
      ]
    }
  ]
};

const perNightLabel: Record<LangCode, string> = {
  uz: "kecha",
  ru: "ночь",
  en: "night"
};

const totalLabel: Record<LangCode, string> = {
  uz: "jami",
  ru: "итого",
  en: "total"
};

const cityNameByLang: Record<string, Record<LangCode, string>> = {
  tashkent: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" },
  samarkand: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" },
  bukhara: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" },
  khiva: { uz: "Xiva", ru: "Хива", en: "Khiva" }
};

const recommendedHotels: Hotel[] = [
  { id: "tk1", name: { uz: "Lotte City Hotel Tashkent Palace", ru: "Lotte City Hotel Tashkent Palace", en: "Lotte City Hotel Tashkent Palace" }, city: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" }, stars: 5, pricePerNight: 120, pluses: { uz: "Markaziy joylashuv, nonushta kiritilgan, spa, Wi‑Fi.", ru: "Центральная локация, включённые завтраки, спа, Wi‑Fi.", en: "Central location, breakfast included, spa, Wi‑Fi." }, images: ["https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg", "https://images.pexels.com/photos/175773/pexels-photo-175773.jpeg", "https://images.pexels.com/photos/21014/pexels-photo.jpg"], hasBreakfast: true },
  { id: "tk2", name: { uz: "Hyatt Regency Tashkent", ru: "Hyatt Regency Tashkent", en: "Hyatt Regency Tashkent" }, city: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" }, stars: 5, pricePerNight: 95, pluses: { uz: "Vokzalga yaqin, nonushta, basseyn, fitness.", ru: "Близко к вокзалу, завтрак, бассейн, фитнес.", en: "Near station, breakfast, pool, fitness." }, images: ["https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg", "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg"], hasBreakfast: true },
  { id: "tk3", name: { uz: "International Hotel Tashkent", ru: "International Hotel Tashkent", en: "International Hotel Tashkent" }, city: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" }, stars: 4, pricePerNight: 65, pluses: { uz: "Qulay joylashuv, nonushta kiritilgan, Wi‑Fi, parkir.", ru: "Удобная локация, включённые завтраки, Wi‑Fi, парковка.", en: "Convenient location, breakfast included, Wi‑Fi, parking." }, images: ["https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg", "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg"], hasBreakfast: true },
  { id: "sm1", name: { uz: "Registan Plaza Hotel", ru: "Registan Plaza Hotel", en: "Registan Plaza Hotel" }, city: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" }, stars: 5, pricePerNight: 85, pluses: { uz: "Registonga qarash, nonushta, restoran, Wi‑Fi.", ru: "Вид на Регистан, завтрак, ресторан, Wi‑Fi.", en: "View of Registan, breakfast, restaurant, Wi‑Fi." }, images: ["https://images.pexels.com/photos/175773/pexels-photo-175773.jpeg", "https://images.pexels.com/photos/21014/pexels-photo.jpg"], hasBreakfast: true },
  { id: "sm2", name: { uz: "Emir Han Hotel", ru: "Emir Han Hotel", en: "Emir Han Hotel" }, city: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" }, stars: 4, pricePerNight: 55, pluses: { uz: "Eski shaharga yaqin, nonushta kiritilgan, hovli, Wi‑Fi.", ru: "Близко к старому городу, завтрак включён, двор, Wi‑Fi.", en: "Near old town, breakfast included, courtyard, Wi‑Fi." }, images: ["https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg", "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg"], hasBreakfast: true },
  { id: "sm3", name: { uz: "Orient Star Samarkand", ru: "Orient Star Samarkand", en: "Orient Star Samarkand" }, city: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" }, stars: 3, pricePerNight: 38, pluses: { uz: "Byudjet uchun, nonushta, markaziy joylashuv.", ru: "Бюджетный вариант, завтрак, центральная локация.", en: "Budget‑friendly, breakfast, central location." }, images: ["https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg"], hasBreakfast: true },
  { id: "bx1", name: { uz: "Amulet Boutique Hotel", ru: "Amulet Boutique Hotel", en: "Amulet Boutique Hotel" }, city: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" }, stars: 5, pricePerNight: 90, pluses: { uz: "Labi Hovuzga qarash, nonushta, meʼmoriy uslub.", ru: "Вид на Ляби-Хауз, завтрак, архитектурный стиль.", en: "View of Lyab-i Hauz, breakfast, architectural style." }, images: ["https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg", "https://images.pexels.com/photos/175773/pexels-photo-175773.jpeg"], hasBreakfast: true },
  { id: "bx2", name: { uz: "Komil Bukhara Boutique Hotel", ru: "Komil Bukhara Boutique Hotel", en: "Komil Bukhara Boutique Hotel" }, city: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" }, stars: 4, pricePerNight: 60, pluses: { uz: "Anʼanaviy mehmonxona, nonushta, hovli, Wi‑Fi.", ru: "Традиционная гостиница, завтрак, двор, Wi‑Fi.", en: "Traditional inn, breakfast, courtyard, Wi‑Fi." }, images: ["https://images.pexels.com/photos/21014/pexels-photo.jpg"], hasBreakfast: true },
  { id: "xv1", name: { uz: "Orient Star Khiva Hotel", ru: "Orient Star Khiva Hotel", en: "Orient Star Khiva Hotel" }, city: { uz: "Xiva", ru: "Хива", en: "Khiva" }, stars: 4, pricePerNight: 70, pluses: { uz: "Ichan-Qalʼa ichida, nonushta, panorama, Wi‑Fi.", ru: "Внутри Ичан-Калы, завтрак, панорама, Wi‑Fi.", en: "Inside Itchan Kala, breakfast, panorama, Wi‑Fi." }, images: ["https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg", "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg"], hasBreakfast: true },
  { id: "xv2", name: { uz: "Malika Khiva", ru: "Malika Khiva", en: "Malika Khiva" }, city: { uz: "Xiva", ru: "Хива", en: "Khiva" }, stars: 3, pricePerNight: 42, pluses: { uz: "Qulay joylashuv, nonushta kiritilgan, milliy bezak.", ru: "Удобная локация, включённые завтраки, национальный декор.", en: "Convenient location, breakfast included, national decor." }, images: ["https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg"], hasBreakfast: true }
];

const roadmapByTier: Record<TierId, RoadmapDay[]> = {
  economy: [
    { day: 1, cityId: "tashkent", hotelId: "tk3", restaurantIds: ["tk1", "tk2"] },
    { day: 2, cityId: "tashkent", hotelId: "tk3", restaurantIds: ["tk1", "tk2"] },
    { day: 3, cityId: "samarkand", hotelId: "sm3", restaurantIds: ["sm1", "sm2"] },
    { day: 4, cityId: "bukhara", hotelId: "bx2", restaurantIds: ["bx1", "bx2", "bx3"] }
  ],
  standard: [
    { day: 1, cityId: "tashkent", hotelId: "tk2", restaurantIds: ["tk1", "tk2"] },
    { day: 2, cityId: "tashkent", hotelId: "tk2", restaurantIds: ["tk1", "tk2"] },
    { day: 3, cityId: "samarkand", hotelId: "sm2", restaurantIds: ["sm1", "sm2", "sm3"] },
    { day: 4, cityId: "samarkand", hotelId: "sm2", restaurantIds: ["sm1", "sm2", "sm3"] },
    { day: 5, cityId: "bukhara", hotelId: "bx2", restaurantIds: ["bx1", "bx2", "bx3"] },
    { day: 6, cityId: "khiva", hotelId: "xv2", restaurantIds: ["xv1", "xv2"] }
  ],
  premium: [
    { day: 1, cityId: "tashkent", hotelId: "tk1", restaurantIds: ["tk1", "tk2"] },
    { day: 2, cityId: "tashkent", hotelId: "tk1", restaurantIds: ["tk1", "tk2"] },
    { day: 3, cityId: "samarkand", hotelId: "sm1", restaurantIds: ["sm1", "sm2", "sm3"] },
    { day: 4, cityId: "samarkand", hotelId: "sm1", restaurantIds: ["sm1", "sm2", "sm3"] },
    { day: 5, cityId: "bukhara", hotelId: "bx1", restaurantIds: ["bx1", "bx2", "bx3"] },
    { day: 6, cityId: "khiva", hotelId: "xv1", restaurantIds: ["xv1", "xv2"] },
    { day: 7, cityId: "khiva", hotelId: "xv1", restaurantIds: ["xv1", "xv2"] }
  ]
};

const roadmapSectionTitle: Record<LangCode, string> = {
  uz: "Kunma-kun marshrut",
  ru: "День за днём — маршрут",
  en: "Day-by-day roadmap"
};

const roadmapDayLabel: Record<LangCode, string> = {
  uz: "Kun",
  ru: "День",
  en: "Day"
};

const roadmapStayLabel: Record<LangCode, string> = {
  uz: "Qayerda qolish",
  ru: "Где остановиться",
  en: "Where to stay"
};

const roadmapDiningLabel: Record<LangCode, string> = {
  uz: "Ovqatlanish",
  ru: "Питание",
  en: "Dining"
};

const roadmapBreakfastAtHotel: Record<LangCode, string> = {
  uz: "Nonushta mehmonxonada kiritilgan",
  ru: "Завтрак включён в отеле",
  en: "Breakfast included at hotel"
};

const roadmapNearbyLabel: Record<LangCode, string> = {
  uz: "Yaqin atrofda",
  ru: "Рядом",
  en: "Nearby"
};

const roadmapLunchLabel: Record<LangCode, string> = {
  uz: "Tushlik",
  ru: "Обед",
  en: "Lunch"
};

const roadmapDinnerLabel: Record<LangCode, string> = {
  uz: "Kechki ovqat",
  ru: "Ужин",
  en: "Dinner"
};

const roadmapRestaurantDescLabel: Record<LangCode, string> = {
  uz: "Qisqacha tavsif",
  ru: "Краткое описание",
  en: "Brief description"
};

function getMealTimesFromSchedule(
  schedule: ScheduleItem[],
  lang: LangCode
): { lunchTime?: string; dinnerTime?: string } {
  const lunchKeywords = { uz: "Tushlik", ru: "Обед", en: "Lunch" };
  const dinnerKeywords = { uz: "Kechki ovqat", ru: "Ужин", en: "Dinner" };
  let lunchTime: string | undefined;
  let dinnerTime: string | undefined;
  for (const item of schedule) {
    if (!item.time) continue;
    const t = item.text[lang];
    if (t.includes(lunchKeywords[lang]) && !lunchTime) lunchTime = item.time;
    if (t.includes(dinnerKeywords[lang]) && !dinnerTime) dinnerTime = item.time;
  }
  return { lunchTime, dinnerTime };
}

const roadmapAttractionsLabel: Record<LangCode, string> = {
  uz: "Bugun tashrif buyuriladigan joylar",
  ru: "Достопримечательности дня",
  en: "Today's attractions"
};

const roadmapLogisticsLabel: Record<LangCode, string> = {
  uz: "Logistika — transport va vaqt",
  ru: "Логистика — транспорт и время",
  en: "Logistics — transport and time"
};

type Restaurant = {
  id: string;
  name: Record<LangCode, string>;
  city: Record<LangCode, string>;
  cuisine: Record<LangCode, string>;
  description: Record<LangCode, string>;
  images: string[];
};

const recommendedRestaurants: Restaurant[] = [
  {
    id: "tk1",
    name: { uz: "Osh markazi", ru: "Центр Плова", en: "Plov Center" },
    city: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" },
    cuisine: { uz: "Oʻzbek osh va milliy taomlar", ru: "Узбекский плов и национальная кухня", en: "Uzbek pilaf and national cuisine" },
    description: { uz: "Anʼanaviy osh pishirish, katta idishlar. Sayohatchilar orasida juda mashhur. Qulay narx.", ru: "Традиционное приготовление плова, огромные казаны. Очень популярно среди туристов. Умеренные цены.", en: "Traditional pilaf cooking, giant cauldrons. Very popular with tourists. Moderate prices." },
    images: [
      "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg",
      "https://images.pexels.com/photos/175773/pexels-photo-175773.jpeg",
      "https://images.pexels.com/photos/21014/pexels-photo.jpg"
    ]
  },
  {
    id: "tk2",
    name: { uz: "Caravan", ru: "Караван", en: "Caravan" },
    city: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" },
    cuisine: { uz: "Sharq va Oʻrta Osiyo oshxonasi", ru: "Восточная и среднеазиатская кухня", en: "Eastern and Central Asian cuisine" },
    description: { uz: "Zamonaviy interyer, plov, lagʻmon, manti. Markaziy joylashuv, yaxshi servis.", ru: "Современный интерьер, плов, лагман, манты. Центральная локация, отличный сервис.", en: "Modern interior, pilaf, lagman, manti. Central location, great service." },
    images: [
      "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg",
      "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",
      "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg"
    ]
  },
  {
    id: "sm1",
    name: { uz: "Platan", ru: "Платан", en: "Platan" },
    city: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" },
    cuisine: { uz: "Oʻzbek va tojik taomlari", ru: "Узбекская и таджикская кухня", en: "Uzbek and Tajik cuisine" },
    description: { uz: "Registon yaqinida, hovli ostida. Somsa, shashlik, dimlama. Sayohatchilar sevimlisi.", ru: "Рядом с Регистаном, во дворе под платанами. Самса, шашлык, димляма. Любимое место туристов.", en: "Near Registan, courtyard under plane trees. Samsa, shashlik, dimlama. Tourists' favourite." },
    images: [
      "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg",
      "https://images.pexels.com/photos/175773/pexels-photo-175773.jpeg",
      "https://images.pexels.com/photos/21014/pexels-photo.jpg"
    ]
  },
  {
    id: "sm2",
    name: { uz: "Samarqand restoran", ru: "Ресторан Самарканд", en: "Samarkand Restaurant" },
    city: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" },
    cuisine: { uz: "Klassik oʻzbek oshxonasi", ru: "Классическая узбекская кухня", en: "Classic Uzbek cuisine" },
    description: { uz: "Shohi Zinda va Bibixonim yaqinida. Milliy bezak, osh, norin, chuchvara. Atmosfera.", ru: "Близко к Шахи-Зинда и Биби-Ханым. Национальный декор, плов, норин, чучвара. Атмосферно.", en: "Near Shahi Zinda and Bibi Khanum. National decor, pilaf, norin, chuchvara. Atmospheric." },
    images: [
      "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg",
      "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",
      "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg"
    ]
  },
  {
    id: "sm3",
    name: { uz: "Old City Samarkand", ru: "Old City Samarkand", en: "Old City Samarkand" },
    city: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" },
    cuisine: { uz: "Mahalliy va xalqaro taomlar", ru: "Местная и международная кухня", en: "Local and international dishes" },
    description: { uz: "Eski shaharda, panoramali terassa. Kechki ovqat uchun ideal. Yuqori reyting.", ru: "В старом городе, панорамная терраса. Идеально для ужина. Высокий рейтинг.", en: "In old town, panoramic terrace. Ideal for dinner. High rating." },
    images: [
      "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg",
      "https://images.pexels.com/photos/175773/pexels-photo-175773.jpeg",
      "https://images.pexels.com/photos/21014/pexels-photo.jpg"
    ]
  },
  {
    id: "bx1",
    name: { uz: "Chasmai Mirob", ru: "Часмаи Мироб", en: "Chasmai Mirob" },
    city: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" },
    cuisine: { uz: "Buxoro oshxonasi", ru: "Бухарская кухня", en: "Bukharian cuisine" },
    description: { uz: "Labi Hovuz ustida, manzara. Buxoro oshi, qovurma, manti. Anʼanaviy muhit.", ru: "Над Ляби-Хаузом, вид на пруд. Бухарский плов, куарма, манты. Традиционная атмосфера.", en: "Over Lyab-i Hauz, pond view. Bukharian pilaf, kavurma, manti. Traditional atmosphere." },
    images: [
      "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg",
      "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",
      "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg"
    ]
  },
  {
    id: "bx2",
    name: { uz: "Minzifa", ru: "Минзифа", en: "Minzifa" },
    city: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" },
    cuisine: { uz: "Oʻzbek va sharq taomlari", ru: "Узбекская и восточная кухня", en: "Uzbek and Eastern cuisine" },
    description: { uz: "Eski Buxorodagi terassa restoran. Shashlik, lagʻmon, ichimliklar. Kechki panorama.", ru: "Терраса-ресторан в старом городе. Шашлык, лагман, напитки. Вечерняя панорама.", en: "Terrace restaurant in old Bukhara. Shashlik, lagman, drinks. Evening panorama." },
    images: [
      "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg",
      "https://images.pexels.com/photos/175773/pexels-photo-175773.jpeg",
      "https://images.pexels.com/photos/21014/pexels-photo.jpg"
    ]
  },
  {
    id: "bx3",
    name: { uz: "Lyab-i Haus", ru: "Ляби-Хауз", en: "Lyab-i Hauz" },
    city: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" },
    cuisine: { uz: "Milliy taomlar, choyxona", ru: "Национальная кухня, чайхана", en: "National cuisine, teahouse" },
    description: { uz: "Hovuz yonida, dam olish. Osh, somsa, choy. Sayohatchilar uchun majburiy toʻxtash.", ru: "У пруда, место для отдыха. Плов, самса, чай. Обязательная остановка для туристов.", en: "By the pond, place to relax. Pilaf, samsa, tea. Must-stop for tourists." },
    images: [
      "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg",
      "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",
      "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg"
    ]
  },
  {
    id: "xv1",
    name: { uz: "Terassa Café", ru: "Кафе Терасса", en: "Terassa Café" },
    city: { uz: "Xiva", ru: "Хива", en: "Khiva" },
    cuisine: { uz: "Xorazm va oʻzbek taomlari", ru: "Хорезмская и узбекская кухня", en: "Khorezm and Uzbek cuisine" },
    description: { uz: "Ichan-Qalʼa ichida, minora qarshisida. Mahalliy taomlar, juda mashhur.", ru: "Внутри Ичан-Калы, напротив минарета. Местная кухня, очень популярно.", en: "Inside Itchan Kala, opposite minaret. Local cuisine, very popular." },
    images: [
      "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg",
      "https://images.pexels.com/photos/175773/pexels-photo-175773.jpeg",
      "https://images.pexels.com/photos/21014/pexels-photo.jpg"
    ]
  },
  {
    id: "xv2",
    name: { uz: "Bir Gumbaz", ru: "Бир Гумбаз", en: "Bir Gumbaz" },
    city: { uz: "Xiva", ru: "Хива", en: "Khiva" },
    cuisine: { uz: "Xorazm oshi, tandir kabob", ru: "Хорезмский плов, тандыр-кебаб", en: "Khorezm pilaf, tandyr kebab" },
    description: { uz: "Anʼanaviy interyer, yaxshi narx. Tandirda pishirilgan taomlar. Turistlar tavsiya qiladi.", ru: "Традиционный интерьер, хорошие цены. Блюда из тандыра. Рекомендуют туристы.", en: "Traditional interior, good prices. Tandyr dishes. Recommended by tourists." },
    images: [
      "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg",
      "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",
      "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg"
    ]
  }
];

export default function TierPage() {
  const router = useRouter();
  const routeParams = useParams<{ tier?: string }>();
  const [lang, setLang] = useState<LangCode>("uz");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [nights, setNights] = useState(6);
  const [restaurantCarouselIndex, setRestaurantCarouselIndex] = useState<Record<string, number>>({});
  const [hotelCarouselIndex, setHotelCarouselIndex] = useState<Record<string, number>>({});
  const [roadmapDayCarouselIndex, setRoadmapDayCarouselIndex] = useState<Record<string, number>>({});

  const tierParam = routeParams?.tier;
  const tierId: TierId = getTierFromParam(tierParam);
  const copy = tierDictionary[lang][tierId];

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY) as LangCode | null;
    if (stored === "uz" || stored === "ru" || stored === "en") setLang(stored);
  }, []);

  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showBuyProModal, setShowBuyProModal] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const auth = window.localStorage.getItem(AUTH_KEY);
    const hasCard = window.localStorage.getItem(PAYMENT_KEY) === "true";
    const hasPro = window.localStorage.getItem(PRO_KEY) === "true";
    if (!auth || !hasCard || !hasPro) return;
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
  }, []);

  const handleNavClick = (id: NavItemId) => {
    window.location.href = `/#${id}`;
  };

  const handleBack = () => {
    // From class details always go to ready‑tours page
    router.push("/?builder=ready");
  };

  const handleUnlockClick = async () => {
    if (typeof window === "undefined") return;
    const auth = window.localStorage.getItem(AUTH_KEY);
    const hasCard = window.localStorage.getItem(PAYMENT_KEY) === "true";
    const hasPro = window.localStorage.getItem(PRO_KEY) === "true";

    const targetPath = `/class/${tierId}`;

    if (!auth) {
      router.push(`/auth?redirect=${encodeURIComponent(targetPath)}`);
      return;
    }

    if (!hasCard) {
      setShowAddCardModal(true);
      return;
    }

    if (!hasPro) {
      setShowBuyProModal(true);
      return;
    }

    try {
      const parsed = JSON.parse(auth) as { token?: string };
      const token = parsed?.token;
      if (!token) {
        setIsUnlocked(true);
        return;
      }
      const status = await getMyProStatus(token);
      if (!status.active) {
        window.localStorage.removeItem(PRO_KEY);
        setShowBuyProModal(true);
        return;
      }
    } catch {
      // If status check fails, keep existing local behavior.
    }
    setIsUnlocked(true);
  };

  const handleDownload = () => {
    // PDF export has been removed per latest requirements.
    // This handler is kept only to avoid runtime errors if it is still referenced.
    return;
  };

  const tourSpots = tourSpotsByTier[tierId];
  useEffect(() => {
    setCarouselIndex(0);
  }, [tierId]);

  useEffect(() => {
    setNights(tierId === "economy" ? 4 : tierId === "standard" ? 6 : 7);
  }, [tierId]);

  const isEconomy = tierId === "economy";
  const isStandard = tierId === "standard";
  const isPremium = tierId === "premium";

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-3 py-4 sm:px-6 lg:px-8">
      <MainNavbar
        lang={lang}
        labels={{
          home: lang === "ru" ? "Главная" : lang === "en" ? "Home" : "Bosh sahifa",
          about: lang === "ru" ? "О нас" : lang === "en" ? "About" : "Biz haqimizda",
          tours: lang === "ru" ? "Направления" : lang === "en" ? "Destinations" : "Yo'nalishlar",
          why: lang === "ru" ? "Почему TOURLY.UZ?" : lang === "en" ? "Why TOURLY" : "Nega TOURLY.UZ?"
        }}
        onLangChange={setLang}
        createTripLabel={
          lang === "ru"
            ? "Создать Новый Тур"
            : lang === "en"
              ? "Create a New Trip"
              : "Yangi Tur Yaratish"
        }
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

      <div>
      <section className="mt-4 rounded-[26px] border border-[#d8e7ff] bg-gradient-to-br from-[#eff4ff] via-white to-[#f4f0ff] p-5 shadow-[0_14px_40px_rgba(15,23,42,0.16)] sm:mt-6 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-[#6b7280]">
              {copy.name} CLASS
            </p>
            <h1 className="mt-1.5 text-xl font-bold text-[#0f172a] sm:text-2xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-1.5 text-xs text-[#4b5563] sm:text-sm">
              {copy.heroSubtitle}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-white/80 px-3 py-2 shadow-sm sm:px-4 sm:py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#191970] text-white shadow-[0_8px_20px_rgba(25,25,112,0.6)]">
              {isEconomy && "$"}
              {isStandard && "≃"}
              {isPremium && "★"}
            </div>
            <div className="text-xs text-[#4b5563]">
              <p className="font-semibold text-[#0f172a]">
                {isEconomy
                  ? lang === "ru"
                    ? "Лучший старт по бюджету"
                    : lang === "en"
                      ? "Best smart‑budget start"
                      : "Byudjet uchun eng yaxshi start"
                  : isStandard
                    ? lang === "ru"
                      ? "Оптимальный баланс комфорта"
                      : lang === "en"
                        ? "Optimal balance of comfort"
                        : "Qulaylik va narxning optimal balansi"
                    : lang === "ru"
                      ? "Максимальный комфорт и сервис"
                      : lang === "en"
                        ? "Maximum comfort & service"
                        : "Eng yuqori darajadagi servis va qulaylik"}
              </p>
              <p className="mt-0.5 text-[11px] text-[#6b7280]">
                {copy.sampleRoute}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Сводка и Логистика — сразу после заголовка */}
      <section className="mt-4 rounded-[22px] border border-[#d8e7ff] bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.14)] sm:mt-6 sm:rounded-[26px] sm:p-5">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#6b7280]">
              {lang === "ru"
                ? "Сводка"
                : lang === "en"
                  ? "Summary"
                  : "Qisqacha ma'lumot"}
            </p>
            <div className="mt-2 space-y-2.5 text-[12px] text-[#111827]">
              <div>
                <p className="text-[11px] font-semibold text-[#6b7280]">{copy.routeLabel}</p>
                <p className="mt-0.5">{copy.sampleRoute}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#6b7280]">{copy.focusLabel}</p>
                <p className="mt-0.5">{copy.sampleFocus}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#6b7280]">{copy.transportLabel}</p>
                <p className="mt-0.5">{copy.sampleTransport}</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#6b7280]">
              {logisticsSectionTitle[lang]}
            </p>
            <ul className="mt-2 space-y-2">
              {logisticsByTier[tierId].map((seg, i) => (
                <li key={i} className="text-[11px] text-[#111827]">
                  <span className="font-medium text-[#0f172a]">
                    {seg.from[lang]} → {seg.to[lang]}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[10px] text-[#4b5563]">
                    <span className="rounded bg-[#eef2ff] px-1.5 py-0.5 font-medium text-[#191970]">
                      {transportModeLabel[seg.transport][lang]}
                    </span>
                    <span>{seg.duration}</span>
                  </span>
                  {seg.note && (
                    <p className="mt-0.5 text-[10px] text-[#6b7280]">{seg.note[lang]}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        {isUnlocked && (
          <div className="mt-4 rounded-2xl bg-[#ecfdf3] p-3 text-[11px] text-[#166534]">
            <p className="font-semibold">{copy.unlockedTitle}</p>
            <p className="mt-0.5 text-[#166534]/80">{copy.unlockedSubtitle}</p>
          </div>
        )}
      </section>

      <section className="mt-4 sm:mt-6">
        <div className="min-w-0 rounded-[22px] border border-[#d8e7ff] bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.14)] sm:rounded-[26px] sm:p-6">
          {!isUnlocked ? (
            <button
              type="button"
              onClick={handleUnlockClick}
              className="block w-full rounded-2xl bg-[#191970] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(15,23,42,0.7)] transition hover:bg-[#12124f]"
            >
              {lang === "ru" && isStandard ? "Открыть полный план на Standard" : copy.unlockCta}
            </button>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#6b7280]">
                {copy.downloadLabel}
              </p>
            </div>
          )}

          {isUnlocked && (() => {
            const days = fullDaySchedulesByTier[tierId];
            const hotelMap = Object.fromEntries(recommendedHotels.map((h) => [h.id, h]));
            const restaurantMap = Object.fromEntries(recommendedRestaurants.map((r) => [r.id, r]));
            const spotMap = Object.fromEntries(tourSpots.map((s) => [s.id, s]));
            return (
              <div className="mt-6">
                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#6b7280]">
                  {roadmapSectionTitle[lang]}
                </p>
                {/* Timeline: vertical grey line + orange markers */}
                <div className="relative pl-8 sm:pl-10">
                  {/* Vertical line */}
                  <div
                    className="absolute left-[11px] top-6 bottom-6 w-0.5 bg-[#d1d5db] sm:left-[15px]"
                    aria-hidden
                  />
                  <div className="space-y-6">
                    {days.map((d) => {
                      const hotel = hotelMap[d.hotelId];
                      const cityName = cityNameByLang[d.cityId]?.[lang] ?? d.cityId;
                      if (!hotel) return null;
                      const nearbyRestaurants = d.restaurantIds
                        .map((id) => restaurantMap[id])
                        .filter(Boolean);
                      const lunchRestaurants = (d.lunchRestaurantIds ?? [])
                        .map((id) => restaurantMap[id])
                        .filter(Boolean);
                      const dinnerRestaurants = (d.dinnerRestaurantIds ?? [])
                        .map((id) => restaurantMap[id])
                        .filter(Boolean);
                      const { lunchTime, dinnerTime } = getMealTimesFromSchedule(d.schedule, lang);
                      const daySpots = (d.spotIds ?? []).map((id) => spotMap[id]).filter(Boolean);
                      const carouselKey = `day-${d.day}`;
                      const spotCarouselIdx = roadmapDayCarouselIndex[carouselKey] ?? 0;
                      return (
                        <div key={`${d.day}-${d.hotelId}`} className="relative flex gap-4">
                          {/* Day marker */}
                          <div
                            className="absolute -left-8 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ea580c] text-xs font-bold text-white sm:-left-10 sm:h-7 sm:w-7"
                            aria-hidden
                          >
                            {d.day}
                          </div>
                          {/* Day card */}
                          <article className="flex-1 overflow-hidden rounded-2xl border border-[#e5e7eb] bg-[#fafaf9] shadow-sm">
                            <div className="border-b border-[#e5e7eb] px-4 py-3">
                              <span className="text-xs font-semibold uppercase tracking-wider text-[#ea580c]">
                                {roadmapDayLabel[lang]} {d.day}
                              </span>
                              <h3 className="mt-0.5 font-bold text-[#111827]">
                                {roadmapDayLabel[lang]} {d.day} — {cityName}
                              </h3>
                            </div>
                            {/* Attraction carousel */}
                            {daySpots.length > 0 && (
                              <div className="relative border-b border-[#e5e7eb] overflow-hidden">
                                <p className="px-4 pt-3 text-xs font-semibold text-[#6b7280]">
                                  {roadmapAttractionsLabel[lang]}
                                </p>
                                <div className="relative mt-2 h-56 sm:h-64 w-full overflow-hidden bg-[#f1f5f9] rounded-[18px]">
                                  {daySpots.map((spot, idx) => (
                                    <div
                                      key={spot.id}
                                      className={`absolute inset-0 transition-opacity duration-300 ${
                                        idx === spotCarouselIdx ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none"
                                      }`}
                                    >
                                      <img
                                        src={spot.image}
                                        alt={spot.name[lang]}
                                        className="h-full w-full object-cover"
                                      />
                                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                                        <span className="text-sm font-semibold text-white">
                                          {idx + 1}. {spot.name[lang]}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {daySpots.length > 1 && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setRoadmapDayCarouselIndex((prev) => ({
                                          ...prev,
                                          [carouselKey]: (prev[carouselKey] ?? 0) <= 0 ? daySpots.length - 1 : (prev[carouselKey] ?? 0) - 1
                                        }))
                                      }
                                      className="absolute left-2 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#374151] shadow-md hover:bg-white"
                                      aria-label={lang === "ru" ? "Назад" : "Previous"}
                                    >
                                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                      </svg>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setRoadmapDayCarouselIndex((prev) => ({
                                          ...prev,
                                          [carouselKey]: (prev[carouselKey] ?? 0) >= daySpots.length - 1 ? 0 : (prev[carouselKey] ?? 0) + 1
                                        }))
                                      }
                                      className="absolute right-2 top-1/2 z-20 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#374151] shadow-md hover:bg-white"
                                      aria-label={lang === "ru" ? "Вперёд" : "Next"}
                                    >
                                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                      </svg>
                                    </button>
                                    <div className="flex justify-center gap-1.5 py-2">
                                      {daySpots.map((_, i) => (
                                        <button
                                          key={i}
                                          type="button"
                                          onClick={() => setRoadmapDayCarouselIndex((prev) => ({ ...prev, [carouselKey]: i }))}
                                          className={`h-2 rounded-full transition-all ${
                                            i === spotCarouselIdx ? "w-5 bg-[#ea580c]" : "w-2 bg-[#e5e7eb] hover:bg-[#d1d5db]"
                                          }`}
                                          aria-label={`${i + 1} / ${daySpots.length}`}
                                        />
                                      ))}
                                    </div>
                                  </>
                                )}
                                {/* Spot descriptions */}
                                <div className="space-y-2 px-4 pb-3">
                                  {daySpots.map((spot) => (
                                    <div key={spot.id} className="rounded-lg bg-white/80 p-2 text-xs text-[#4b5563]">
                                      <p className="font-semibold text-[#374151]">{spot.name[lang]}</p>
                                      <p className="mt-0.5 leading-relaxed">{spot.description[lang]}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Logistics */}
                            {d.logistics && d.logistics.length > 0 && (
                              <div className="border-b border-[#e5e7eb] bg-[#f8fafc] px-4 py-3">
                                <p className="text-xs font-semibold text-[#6b7280]">{roadmapLogisticsLabel[lang]}</p>
                                <div className="mt-2 space-y-2">
                                  {d.logistics.map((seg, i) => (
                                    <div key={i} className="flex flex-wrap items-start gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm">
                                      {seg.time && (
                                        <span className="shrink-0 font-semibold text-[#ea580c]">{seg.time}</span>
                                      )}
                                      <span className="text-[#374151]">{seg.from[lang]} → {seg.to[lang]}</span>
                                      <span className="text-[#6b7280]">
                                        {transportModeLabel[seg.transport][lang]} · {seg.duration}
                                      </span>
                                      {seg.note && (
                                        <span className="w-full text-[11px] text-[#6b7280]">{seg.note[lang]}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {/* Schedule with times */}
                            <div className="space-y-1.5 px-4 py-3">
                              {d.schedule.map((item, idx) =>
                                item.isSection ? (
                                  <p key={idx} className="mt-3 font-semibold text-[#374151]">
                                    {item.text[lang]}
                                  </p>
                                ) : (
                                  <div key={idx} className="flex gap-2 text-sm text-[#4b5563]">
                                    {item.time && (
                                      <span className="shrink-0 font-medium text-[#6b7280]">
                                        {item.time}
                                      </span>
                                    )}
                                    <span>{item.text[lang]}</span>
                                  </div>
                                )
                              )}
                            </div>
                            {/* Hotel + restaurants block */}
                            <div className="border-t border-[#e5e7eb] bg-white/60 px-4 py-3">
                              <p className="text-xs font-semibold text-[#6b7280]">
                                {roadmapStayLabel[lang]}
                              </p>
                              <div className="mt-1.5 flex items-start gap-3">
                                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-[#f1f5f9]">
                                  <img
                                    src={hotel.images[0]}
                                    alt={hotel.name[lang]}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div>
                                  <p className="font-semibold text-[#0f172a]">{hotel.name[lang]}</p>
                                  <p className="text-xs text-[#4b5563]">{hotel.pluses[lang]}</p>
                                  <p className="mt-1 text-sm font-bold text-[#191970]">
                                    ${hotel.pricePerNight} / {perNightLabel[lang]}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 border-t border-[#f1f5f9] pt-3">
                                <p className="text-xs font-semibold text-[#6b7280]">
                                  {roadmapDiningLabel[lang]}
                                </p>
                                {hotel.hasBreakfast && (
                                  <p className="mt-1 text-xs text-[#166534]">
                                    ✓ {roadmapBreakfastAtHotel[lang]}
                                  </p>
                                )}
                                {lunchRestaurants.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-xs font-semibold text-[#374151]">
                                      {roadmapLunchLabel[lang]}
                                      {lunchTime && (
                                        <span className="ml-1.5 font-normal text-[#6b7280]">
                                          — {lunchTime}
                                        </span>
                                      )}
                                    </p>
                                    <div className="mt-1.5 flex flex-wrap gap-2">
                                      {lunchRestaurants.map((r) => (
                                        <div
                                          key={r.id}
                                          className="flex items-start gap-2 rounded-lg border border-[#e5e7eb] bg-white px-2 py-1.5"
                                        >
                                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-[#f1f5f9]">
                                            <img
                                              src={r.images[0]}
                                              alt={r.name[lang]}
                                              className="h-full w-full object-cover"
                                            />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-[#111827]">
                                              {r.name[lang]}, {r.city[lang]}
                                            </p>
                                            <p className="text-[10px] text-[#6b7280]">{r.cuisine[lang]}</p>
                                            <p className="mt-1 text-[11px] text-[#4b5563]">
                                              {roadmapRestaurantDescLabel[lang]}: {r.description[lang]}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {dinnerRestaurants.length > 0 && (
                                  <div className="mt-3">
                                    <p className="text-xs font-semibold text-[#374151]">
                                      {roadmapDinnerLabel[lang]}
                                      {dinnerTime && (
                                        <span className="ml-1.5 font-normal text-[#6b7280]">
                                          — {dinnerTime}
                                        </span>
                                      )}
                                    </p>
                                    <div className="mt-1.5 flex flex-wrap gap-2">
                                      {dinnerRestaurants.map((r) => (
                                        <div
                                          key={r.id}
                                          className="flex items-start gap-2 rounded-lg border border-[#e5e7eb] bg-white px-2 py-1.5"
                                        >
                                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-[#f1f5f9]">
                                            <img
                                              src={r.images[0]}
                                              alt={r.name[lang]}
                                              className="h-full w-full object-cover"
                                            />
                                          </div>
                                          <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-[#111827]">
                                              {r.name[lang]}, {r.city[lang]}
                                            </p>
                                            <p className="text-[10px] text-[#6b7280]">{r.cuisine[lang]}</p>
                                            <p className="mt-1 text-[11px] text-[#4b5563]">
                                              {roadmapRestaurantDescLabel[lang]}: {r.description[lang]}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {nearbyRestaurants.length > 0 && lunchRestaurants.length === 0 && dinnerRestaurants.length === 0 && (
                                  <p className="mt-1.5 text-[11px] font-medium text-[#4b5563]">
                                    {roadmapNearbyLabel[lang]}:{" "}
                                    {nearbyRestaurants.map((r) => r.name[lang]).join(", ")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </article>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {isUnlocked && tourSpots.length > 0 && (
          <div className="mt-8 rounded-[26px] border border-[#dbeafe] bg-gradient-to-br from-[#eff4ff] via-white to-[#e0f2fe] p-4 shadow-[0_14px_40px_rgba(15,23,42,0.18)] sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#1d4ed8]">
                  {tourPhotosSectionTitle[lang]}
                </p>
                <span className="rounded-full bg-white/80 px-2 py-1 text-[10px] font-medium text-[#1e3a8a]">
                  {tourSpots.length} spot
                </span>
              </div>
              <div className="relative overflow-hidden rounded-2xl border border-[#dbeafe] bg-[#eff6ff]">
                <div className="relative h-64 w-full sm:h-80">
                  {tourSpots.map((spot, index) => (
                    <div
                      key={`${spot.id}-${index}`}
                      className={`absolute inset-0 transition-opacity duration-300 ${
                        index === carouselIndex ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none"
                      }`}
                    >
                      <img
                        src={spot.image}
                        alt={spot.name[lang]}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
                        <span className="text-xs font-semibold text-white">
                          {index + 1}. {spot.name[lang]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="absolute left-0 right-0 top-1/2 z-20 flex -translate-y-1/2 justify-between px-2">
                  <button
                    type="button"
                    onClick={() => setCarouselIndex((i) => (i <= 0 ? tourSpots.length - 1 : i - 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#191970] shadow-md transition hover:bg-white"
                    aria-label={lang === "ru" ? "Назад" : lang === "en" ? "Previous" : "Orqaga"}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCarouselIndex((i) => (i >= tourSpots.length - 1 ? 0 : i + 1))}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#191970] shadow-md transition hover:bg-white"
                    aria-label={lang === "ru" ? "Вперёд" : lang === "en" ? "Next" : "Keyingi"}
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="flex justify-center gap-1.5 py-2">
                  {tourSpots.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCarouselIndex(index)}
                      className={`h-2 rounded-full transition-all ${
                        index === carouselIndex ? "w-5 bg-[#191970]" : "w-2 bg-[#d8e7ff] hover:bg-[#93c5fd]"
                      }`}
                      aria-label={`${index + 1} / ${tourSpots.length}`}
                    />
                  ))}
                </div>
              </div>
              <ol className="mt-4 list-none space-y-3 pl-0">
                {tourSpots.map((spot, index) => (
                  <li key={`${spot.id}-${index}`} className="flex gap-3 text-sm text-[#111827]">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#191970] text-xs font-semibold text-white">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-[#0f172a]">{spot.name[lang]}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-[#4b5563]">{spot.description[lang]}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </section>
      </div>

            {(showAddCardModal || showBuyProModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.55)]">
            <h3 className="text-base font-semibold text-[#0f172a] sm:text-lg">
              {lang === "ru"
                ? "Для доступа нужна PRO версия"
                : lang === "en"
                  ? "PRO version required"
                  : "Kirish uchun PRO versiya kerak"}
            </h3>
            <p className="mt-2 text-sm text-[#4b5563]">
              {lang === "ru"
                ? "Чтобы открыть полный план тура, купите PRO версию в профиле."
                : lang === "en"
                  ? "To open the full tour plan, purchase the PRO version in your profile."
                  : "To'liq tur rejasini ochish uchun profilingizdan PRO versiyani xarid qiling."}
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowAddCardModal(false); setShowBuyProModal(false); }}
                className="rounded-xl border border-[#e5e7eb] px-4 py-2 text-xs font-semibold text-[#4b5563] hover:bg-[#f3f4f6]"
              >
                {lang === "ru" ? "Назад" : lang === "en" ? "Back" : "Orqaga"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddCardModal(false);
                  setShowBuyProModal(false);
                  router.push("/profile");
                }}
                className="rounded-xl bg-[#191970] px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#12124f]"
              >
                {lang === "ru"
                  ? "Перейти в профиль"
                  : lang === "en"
                    ? "Go to profile"
                    : "Profilga o'tish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

