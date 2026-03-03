"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { destinations, readyTours } from "@/lib/travel-data";
import { AiSparklesIcon, MainNavbar, NavItemId } from "@/components/main-navbar";

type ChatRole = "user" | "assistant";
type Lang = "uz" | "ru" | "en";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  suggestionIds?: string[];
};

const dictionary = {
  uz: {
    communityTrips: "Hamjamiyat Turlari",
    heroKicker: "O'zbekiston birinchi raqamli sayohat platformasi",
    heroTitle: "TOURLY.UZ",
    heroText:
      "Parvozlar, mehmonxonalar va faoliyatlar — barchasi bir joyda. AI yordamida orzu sayohatingizni bir necha daqiqada tuzing.",
    createTrip: "Yangi Tur Yaratish",
    readyTours: "Tayyor turlar",
    readyToursSub: "Rasmli paketlar: narx, manzil va davomiylik bilan",
    days: "kun",
    from: "dan boshlab",
    select: "Tanlash",
    infoTitle: "Nega TOURLY.UZ?",
    infoSub: "Sayohat rejangizni tez va professional tayyorlash uchun",
    infoCards: [
      { t: "AI Marshrut Tuzuvchi", d: "Qayerga borish va necha kun qolishni avtomatik taklif qiladi." },
      { t: "Real Byudjet", d: "Byudjet, transfer va mehmonxona narxlarini bir joyda hisoblaydi." },
      { t: "Tezkor Chat Rejalash", d: "Chat asosida tavsiyalar va tayyor tur kartalarini beradi." }
    ],
    footerAbout: "TOURLY.UZ - O'zbekiston bo'ylab aqlli sayohat rejalashtirish platformasi.",
    footerNav: "Bo'limlar",
    footerContact: "Aloqa",
    footerLocation: "Toshkent, O'zbekiston",
    footerCopy: "Barcha huquqlar himoyalangan.",
    builderTitle: "Yo'nalishlar",
    backHome: "Bosh sahifaga qaytish",
    askPlaceholder: "Istalgan savolni yozing... masalan: 4 kunlik byudjet tur",
    send: "Yuborish",
    assistantName: "Layla.",
    assistantTitle: "Sayohatingizni tushunmoqda...",
    assistantSub: "Sizning chat javoblaringiz asosida eng mos tur paketlari tanlanadi.",
    initialAssistant:
      "Salom! Men TOURLY.UZ AI yordamchisiman. Qaysi turdagi sayohatni xohlaysiz?",
    quickPrompts: [
      "3 kunlik Samarqand turi",
      "Oila uchun byudjet tur",
      "Premium asal oyi marshruti",
      "Tarixiy obidalar ko'p bo'lsin"
    ],
    navHome: "Bosh sahifa",
    navAbout: "Biz haqimizda",
    navTours: "Yo'nalishlar",
    navWhy: "Nega TOURLY.UZ?",
    navReviews: "Sharhlar",
    aboutKicker: "Biz haqimizda",
    aboutTitle: "Aqlli sayohat rejalashtirish platformasi",
    aboutBody1:
      "TOURLY.UZ yordamida siz parvozlar, mehmonxonalar va faoliyatlarni bir joyda ko'rib chiqasiz. Bizning AI yordamchi sizning byudjetingiz, vaqt va qiziqishlaringizni hisobga olgan holda marshrutni taklif qiladi.",
    aboutBody2:
      "Platforma tur operatorlari va mustaqil sayohatchilar uchun qulay: tayyor paketlar bilan birga moslashtiriladigan turlarni ham yaratishingiz mumkin.",
    aboutChips: [
      "Real vaqt rejimidagi AI chat",
      "O'zbekiston bo'ylab 6+ hudud",
      "Tayyor va moslashtiriladigan marshrutlar"
    ],
    reviewsTitle: "Sayohatchilar fikri",
    reviewsSubtitle: "TOURLY.UZ orqali o'z marshrutini yaratgan mehmonlarimiz sharhlari.",
    reviewsKicker: "Sayohatchilar ishonchi",
    reviewsCustomTour: "Maxsus tur",
    footerContactCta: "Biz bilan bog'lanish",
    builderProgressLabel: "Qadam",
    builderMainTitle: "O'zbekistondagi sayohatingizni tuzamiz",
    builderBack: "Orqaga",
    builderNext: "Keyingi",
    builderDone: "Tugallandi",
    builderStepInterests: "Qiziqishlar",
    builderStepDuration: "Davomiylik",
    builderStepReady: "Tayyor tur",
    builderStep1Text:
      "Sizni qiziqtirgan O'zbekiston hududlarini tanlang. Har bir karta ustiga olib borilganda u kattalashadi.",
    builderStep2Text:
      "Endi qiziqishlaringizni tanlang — bu marshrutni yanada aniqroq qilishga yordam beradi.",
    builderStep3Text:
      "Sayohatingiz davomiyligini tanlang. Agar aniq sanalar bo'lsa, pastdagi chatda yozib qoldiring.",
    builderStep4Text:
      "Siz uchun tavsiya etilgan marshrut. Variantlardan birini tanlang yoki pastdagi chat orqali o'zgartirishlarni so'rang.",
    builderChatIntro2:
      "Qiziqishlaringizni tanlang yoki pastdagi chatda o'zingiz yozing — men marshrutni moslashtiraman.",
    builderChatIntro3:
      "Sizga qulay bo'lgan davomiylikni belgilang yoki pastdagi chatda boshqa variantni yozing.",
    builderChatIntro4:
      "Mana sizga mos marshrut. Agar nimadir yoqmasa, chatda yozing va sozlaymiz.",
    builderRouteLabel: "Marshrut",
    builderDurationLabel: "Davomiylik",
    builderInterestsLabel: "Qiziqishlar",
    durationDisplay: {
      short: "3–4 kun",
      medium: "5–7 kun",
      long: "8+ kun"
    },
    interests: [
      {
        id: "history",
        label: "Tarixiy obidalar",
        description: "Registon, Ark, Ichan-Qal'a kabi tarixiy joylar."
      },
      {
        id: "nature",
        label: "Tabiat va tog'lar",
        description: "Chimyon, Zarafshon tog'lari va tog'li manzaralar."
      },
      {
        id: "gastronomy",
        label: "Gastronomiya",
        description: "Plov, tandir va bozorlar ta'mlari."
      },
      {
        id: "family",
        label: "Oila bilan sayohat",
        description: "Oila bilan tinch va xavfsiz marshrutlar."
      },
      {
        id: "adventure",
        label: "Ekstremal va sarguzasht",
        description: "Cho'l safari, hiking va jeep-turlar."
      },
      {
        id: "art",
        label: "San'at va muzeylar",
        description: "Savitskiy muzeyi va zamonaviy galereyalar."
      },
      {
        id: "relax",
        label: "Spa va dam olish",
        description: "Sanatoriyalar, spa-markazlar va sekin ritm."
      }
    ],
    durations: [
      {
        id: "short",
        label: "3–4 kun",
        description: "Qisqa weekend yoki mini-ta'tillar."
      },
      {
        id: "medium",
        label: "5–7 kun",
        description: "Balanslangan marshrut asosiy shaharlarga."
      },
      {
        id: "long",
        label: "8+ kun",
        description: "Ko'proq shaharlarga kirish va tinch tempo."
      }
    ],
    tiers: {
      economy: {
        label: "Econom",
        description: "Qulay byudjet: mehmonxonalar 3★, poyezd yoki umumiy transfer."
      },
      standard: {
        label: "Standart",
        description: "Balanslangan qulaylik: 3–4★ mehmonxonalar, qulay transfer."
      },
      premium: {
        label: "Premium",
        description: "Eng yuqori qulaylik: 4–5★ mehmonxonalar, shaxsiy gid va transfer."
      }
    }
  },
  ru: {
    communityTrips: "Сообщество Туров",
    heroKicker: "Первая цифровая платформа путешествий Узбекистана",
    heroTitle: "TOURLY.UZ",
    heroText:
      "Перелёты, отели и активности — всё в одном месте. Соберите путешествие мечты за считанные минуты с помощью AI.",
    createTrip: "Создать Новый Тур",
    readyTours: "Готовые туры",
    readyToursSub: "Пакеты с фото: цена, направления и длительность",
    days: "дней",
    from: "от",
    select: "Выбрать",
    infoTitle: "Почему TOURLY.UZ?",
    infoSub: "Чтобы быстро и удобно собрать идеальный маршрут",
    infoCards: [
      { t: "AI Маршруты", d: "Автоматически предлагает куда ехать и сколько дней провести." },
      { t: "Реальный бюджет", d: "Считает бюджет, трансфер и отели в одном месте." },
      { t: "Планирование в чате", d: "Подбирает туры прямо по вашим ответам в чате." }
    ],
    footerAbout: "TOURLY.UZ - платформа умного планирования путешествий по Узбекистану.",
    footerNav: "Разделы",
    footerContact: "Контакты",
    footerLocation: "Ташкент, Узбекистан",
    footerCopy: "Все права защищены.",
    builderTitle: "Направления",
    backHome: "Вернуться на главную",
    askPlaceholder: "Спросите что угодно... например: бюджетный тур на 4 дня",
    send: "Отправить",
    assistantName: "Layla.",
    assistantTitle: "Анализирую вашу поездку...",
    assistantSub: "На основе ваших сообщений в чате подбираются лучшие туры.",
    initialAssistant:
      "Привет! Я AI-ассистент TOURLY.UZ. Какой формат путешествия вы хотите?",
    quickPrompts: [
      "3 дня в Самарканде",
      "Бюджетный семейный тур",
      "Премиум маршрут для пары",
      "Больше исторических мест"
    ],
    navHome: "Главная",
    navAbout: "О нас",
    navTours: "Направления",
    navWhy: "Почему мы",
    navReviews: "Отзывы",
    aboutKicker: "О нас",
    aboutTitle: "Умная платформа планирования путешествий",
    aboutBody1:
      "С TOURLY.UZ вы просматриваете перелёты, отели и активности в одном месте. Наш AI‑ассистент учитывает ваш бюджет, время и интересы и предлагает оптимальный маршрут.",
    aboutBody2:
      "Платформа удобна как для туроператоров, так и для самостоятельных путешественников: вы можете использовать готовые пакеты или собрать полностью индивидуальный тур.",
    aboutChips: [
      "AI‑чат в реальном времени",
      "6+ регионов по Узбекистану",
      "Готовые и настраиваемые маршруты"
    ],
    reviewsTitle: "Отзывы путешественников",
    reviewsSubtitle: "Отзывы гостей, которые собрали свой маршрут через TOURLY.UZ.",
    reviewsKicker: "Нам доверяют путешественники",
    reviewsCustomTour: "Индивидуальный тур",
    footerContactCta: "Связаться с нами",
    builderProgressLabel: "Шаг",
    builderMainTitle: "Соберём ваше путешествие по Узбекистану",
    builderBack: "Назад",
    builderNext: "Далее",
    builderDone: "Готово",
    builderStepInterests: "Интересы",
    builderStepDuration: "Длительность",
    builderStepReady: "Готовый тур",
    builderStep1Text:
      "Выберите регионы Узбекистана, которые вам интересны. При наведении карточки слегка увеличиваются.",
    builderStep2Text:
      "Теперь отметьте ваши интересы — это поможет сделать маршрут более точным.",
    builderStep3Text:
      "Выберите желаемую длительность поездки. Если есть конкретные даты, напишите их в чате ниже.",
    builderStep4Text:
      "Рекомендованный для вас маршрут. Выберите один из вариантов или попросите изменить детали через чат.",
    builderChatIntro2:
      "Выберите интересы или опишите их в чате ниже — я подстрою маршрут.",
    builderChatIntro3:
      "Отметьте желаемую длительность или напишите другой вариант в чате.",
    builderChatIntro4:
      "Вот маршрут под ваши ответы. Если что‑то не подходит, напишите в чат и мы всё настроим.",
    builderRouteLabel: "Маршрут",
    builderDurationLabel: "Длительность",
    builderInterestsLabel: "Интересы",
    durationDisplay: {
      short: "3–4 дня",
      medium: "5–7 дней",
      long: "8+ дней"
    },
    interests: [
      {
        id: "history",
        label: "Исторические места",
        description: "Регистан, Арк, Ичан‑Кала и старый город."
      },
      {
        id: "nature",
        label: "Природа и горы",
        description: "Чимган, горные хребты и пейзажи."
      },
      {
        id: "gastronomy",
        label: "Гастрономия",
        description: "Плов, тандир и вкусы базаров."
      },
      {
        id: "family",
        label: "Путешествие с семьёй",
        description: "Спокойные маршруты и отели для детей."
      },
      {
        id: "adventure",
        label: "Экстрим и приключения",
        description: "Сафари, хайкинг и джип‑туры."
      },
      {
        id: "art",
        label: "Искусство и музеи",
        description: "Музеи, галереи и современное искусство."
      },
      {
        id: "relax",
        label: "Spa и отдых",
        description: "Спа‑отдых, санатории и релакс."
      }
    ],
    durations: [
      {
        id: "short",
        label: "3–4 дня",
        description: "Короткие уик‑энды и мини‑отпуска."
      },
      {
        id: "medium",
        label: "5–7 дней",
        description: "Сбалансированный маршрут по ключевым городам."
      },
      {
        id: "long",
        label: "8+ дней",
        description: "Больше городов и более спокойный темп поездки."
      }
    ],
    tiers: {
      economy: {
        label: "Эконом",
        description: "Доступный бюджет: отели 3★, поезд или общий трансфер."
      },
      standard: {
        label: "Стандарт",
        description: "Баланс комфорта: отели 3–4★, удобный трансфер."
      },
      premium: {
        label: "Премиум",
        description: "Максимальный комфорт: отели 4–5★, личный гид и трансфер."
      }
    }
  },
  en: {
    communityTrips: "Community Trips",
    heroKicker: "Uzbekistan's #1 digital travel platform",
    heroTitle: "TOURLY.UZ",
    heroText:
      "Flights, hotels, and activities — all in one place. Build your dream trip in minutes with AI.",
    createTrip: "Create a New Trip",
    readyTours: "Ready Tours",
    readyToursSub: "Photo packages with pricing, destinations, and duration",
    days: "days",
    from: "from",
    select: "Select",
    infoTitle: "Why TOURLY.UZ?",
    infoSub: "Everything needed to plan your trip quickly and beautifully",
    infoCards: [
      { t: "AI Route Builder", d: "Automatically suggests where to go and how many days to stay." },
      { t: "Realistic Budget", d: "Calculates budget, transfer, and hotel costs in one place." },
      { t: "Chat-Based Planning", d: "Suggests matching tours based on your live chat responses." }
    ],
    footerAbout: "TOURLY.UZ - smart travel planning platform for Uzbekistan.",
    footerNav: "Sections",
    footerContact: "Contact",
    footerLocation: "Tashkent, Uzbekistan",
    footerCopy: "All rights reserved.",
    builderTitle: "Destinations",
    backHome: "Back to home",
    askPlaceholder: "Ask anything... e.g. 4-day budget trip",
    send: "Send",
    assistantName: "Layla.",
    assistantTitle: "Understanding your trip...",
    assistantSub: "Matching tours are selected based on your chat responses.",
    initialAssistant:
      "Hi! I am TOURLY.UZ AI assistant. What type of trip would you like to plan?",
    quickPrompts: [
      "3-day Samarkand trip",
      "Budget family tour",
      "Luxury honeymoon route",
      "More historical landmarks"
    ],
    navHome: "Home",
    navAbout: "About",
    navTours: "Destinations",
    navWhy: "Why TOURLY",
    navReviews: "Reviews",
    aboutKicker: "About us",
    aboutTitle: "Smart travel planning platform",
    aboutBody1:
      "With TOURLY.UZ you browse flights, hotels, and activities in one place. Our AI assistant considers your budget, timing, and interests to suggest the best route.",
    aboutBody2:
      "The platform is convenient both for tour operators and independent travelers: use ready‑made packages or build fully customized itineraries.",
    aboutChips: [
      "Real‑time AI chat",
      "6+ regions across Uzbekistan",
      "Ready‑made & customizable routes"
    ],
    reviewsTitle: "Traveler reviews",
    reviewsSubtitle: "Feedback from guests who built their trip with TOURLY.UZ.",
    reviewsKicker: "Trusted by travelers",
    reviewsCustomTour: "Custom tour",
    footerContactCta: "Contact us",
    builderProgressLabel: "Step",
    builderMainTitle: "We design your trip across Uzbekistan",
    builderBack: "Back",
    builderNext: "Next",
    builderDone: "Done",
    builderStepInterests: "Interests",
    builderStepDuration: "Duration",
    builderStepReady: "Ready tour",
    builderStep1Text:
      "Choose the regions of Uzbekistan you are interested in. Cards gently grow when you hover over them.",
    builderStep2Text:
      "Now select your interests — this helps make the route much more precise.",
    builderStep3Text:
      "Pick the duration of your trip. If you already know exact dates, write them in the chat below.",
    builderStep4Text:
      "A route recommended for you. Choose one of the options or ask for changes in the chat.",
    builderChatIntro2:
      "Select your interests or type them in the chat — I'll adapt the route.",
    builderChatIntro3:
      "Set the duration that feels right or type another option in the chat.",
    builderChatIntro4:
      "Here is a route that matches your answers. If something feels off, tell me in chat and we’ll adjust.",
    builderRouteLabel: "Route",
    builderDurationLabel: "Duration",
    builderInterestsLabel: "Interests",
    durationDisplay: {
      short: "3–4 days",
      medium: "5–7 days",
      long: "8+ days"
    },
    interests: [
      {
        id: "history",
        label: "Historical sights",
        description: "Registan, Ark, Itchan‑Kala and old towns."
      },
      {
        id: "nature",
        label: "Nature & mountains",
        description: "Chimgan, mountain ranges and valleys."
      },
      {
        id: "gastronomy",
        label: "Gastronomy",
        description: "Plov, tandoor dishes and bazaar flavors."
      },
      {
        id: "family",
        label: "Family travel",
        description: "Calm routes and family‑friendly hotels."
      },
      {
        id: "adventure",
        label: "Adventure & extreme",
        description: "Desert safari, hiking and jeep tours."
      },
      {
        id: "art",
        label: "Art & museums",
        description: "Museums, galleries and local artists."
      },
      {
        id: "relax",
        label: "Spa & relaxation",
        description: "Spa hotels, resorts and slow pace."
      }
    ],
    durations: [
      {
        id: "short",
        label: "3–4 days",
        description: "Quick weekend or mini vacation."
      },
      {
        id: "medium",
        label: "5–7 days",
        description: "Balanced itinerary for key cities."
      },
      {
        id: "long",
        label: "8+ days",
        description: "More cities with a relaxed pace."
      }
    ],
    tiers: {
      economy: {
        label: "Economy",
        description: "Budget friendly: 3★ hotels, train or shared transfers."
      },
      standard: {
        label: "Standard",
        description: "Balanced comfort: 3–4★ hotels, comfortable transfers."
      },
      premium: {
        label: "Premium",
        description: "Highest comfort: 4–5★ hotels, private guide and transfer."
      }
    }
  }
} as const;

const destinationCityByLang: Record<Lang, Record<string, string>> = {
  uz: {
    samarkand: "Samarqand",
    bukhara: "Buxoro",
    khiva: "Xiva",
    tashkent: "Toshkent",
    fergana: "Farg'ona vodiysi",
    nukus: "Nukus",
    andijan: "Andijon",
    namangan: "Namangan",
    jizzakh: "Jizzax",
    navoi: "Navoiy",
    karshi: "Qarshi",
    termez: "Termiz"
  },
  ru: {
    samarkand: "Самарканд",
    bukhara: "Бухара",
    khiva: "Хива",
    tashkent: "Ташкент",
    fergana: "Ферганская долина",
    nukus: "Нукус",
    andijan: "Андижан",
    namangan: "Наманган",
    jizzakh: "Джизак",
    navoi: "Навои",
    karshi: "Карши",
    termez: "Термез"
  },
  en: {
    samarkand: "Samarkand",
    bukhara: "Bukhara",
    khiva: "Khiva",
    tashkent: "Tashkent",
    fergana: "Fergana Valley",
    nukus: "Nukus",
    andijan: "Andijan",
    namangan: "Namangan",
    jizzakh: "Jizzakh",
    navoi: "Navoi",
    karshi: "Karshi",
    termez: "Termez"
  }
};

const tourByLang: Record<
  Lang,
  Record<string, { title: string; focus: string; stops: string[] }>
> = {
  uz: {
    "classic-heritage": {
      title: "Klassik Meros",
      focus: "Tarixiy obidalar",
      stops: ["Toshkent", "Samarqand", "Buxoro"]
    },
    "silk-road": {
      title: "Ipak Yo'li Premium",
      focus: "To'liq Ipak yo'li yo'nalishi",
      stops: ["Toshkent", "Samarqand", "Buxoro", "Xiva"]
    },
    "culture-craft": {
      title: "Madaniyat va Hunarmandchilik",
      focus: "Hunarmandchilik va gastronomiya",
      stops: ["Toshkent", "Farg'ona vodiysi", "Samarqand"]
    },
    "desert-art": {
      title: "Cho'l va San'at",
      focus: "Muzey, cho'l manzarasi va san'at",
      stops: ["Nukus", "Ayaz qal'a", "Mizdaxxon"]
    },
    "weekend-samarkand": {
      title: "Samarqand Dam Olish Turi",
      focus: "Qisqa va qulay dam olish sayohati",
      stops: ["Toshkent", "Samarqand"]
    },
    "luxury-cities": {
      title: "Hashamatli Shaharlar",
      focus: "Qulay mehmonxona va premium transfer",
      stops: ["Toshkent", "Samarqand", "Buxoro"]
    }
  },
  ru: {
    "classic-heritage": {
      title: "Классическое Наследие",
      focus: "Исторические памятники",
      stops: ["Ташкент", "Самарканд", "Бухара"]
    },
    "silk-road": {
      title: "Шелковый Путь Премиум",
      focus: "Полный маршрут Шелкового пути",
      stops: ["Ташкент", "Самарканд", "Бухара", "Хива"]
    },
    "culture-craft": {
      title: "Культура и Ремесла",
      focus: "Ремесла и гастрономия",
      stops: ["Ташкент", "Ферганская долина", "Самарканд"]
    },
    "desert-art": {
      title: "Пустыня и Искусство",
      focus: "Музей, пустынные пейзажи и искусство",
      stops: ["Нукус", "Аяз-Кала", "Миздахкан"]
    },
    "weekend-samarkand": {
      title: "Выходные в Самарканде",
      focus: "Короткий и удобный тур выходного дня",
      stops: ["Ташкент", "Самарканд"]
    },
    "luxury-cities": {
      title: "Люксовые Города",
      focus: "Комфортные отели и премиум-трансфер",
      stops: ["Ташкент", "Самарканд", "Бухара"]
    }
  },
  en: {
    "classic-heritage": {
      title: "Classic Heritage",
      focus: "Historical landmarks",
      stops: ["Tashkent", "Samarkand", "Bukhara"]
    },
    "silk-road": {
      title: "Silk Road Premium",
      focus: "Full Silk Road route",
      stops: ["Tashkent", "Samarkand", "Bukhara", "Khiva"]
    },
    "culture-craft": {
      title: "Culture & Craft",
      focus: "Craftsmanship and gastronomy",
      stops: ["Tashkent", "Fergana Valley", "Samarkand"]
    },
    "desert-art": {
      title: "Desert & Art Escape",
      focus: "Museum, desert landscapes, and art",
      stops: ["Nukus", "Ayaz Kala", "Mizdakhkan"]
    },
    "weekend-samarkand": {
      title: "Samarkand Weekend",
      focus: "Short and comfortable weekend trip",
      stops: ["Tashkent", "Samarkand"]
    },
    "luxury-cities": {
      title: "Luxury Cities",
      focus: "Comfort hotels and premium transfers",
      stops: ["Tashkent", "Samarkand", "Bukhara"]
    }
  }
};

const tierBase = [
  {
    id: "economy",
    multiplier: 0.85
  },
  {
    id: "standard",
    multiplier: 1
  },
  {
    id: "premium",
    multiplier: 1.35
  }
] as const;

function getTourLocalized(tour: (typeof readyTours)[number], lang: Lang) {
  return tourByLang[lang][tour.id] ?? { title: tour.title, focus: tour.focus, stops: tour.stops };
}

type ViewMode = "home" | "builder";

const heroSlides = [
  "https://images.unsplash.com/photo-1557841089-d82280fcc341?q=80&w=2065&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1668156360639-4de3832281d7?q=80&w=1064&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1694475128245-999b1ae8a44e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1670514535515-e7af911bdadb?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
];

const interestImageMap: Record<string, string> = {
  history:
    "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/21/e0/3f/3f/fortress-toprak-kala.jpg?w=500&h=500&s=1",
  nature:
    "https://images.wallpaperscraft.ru/image/single/gory_ozero_tsvety_204278_1920x1080.jpg",
  gastronomy:
    "https://www.bahroma1.ru/templates/bahroma1/img/ne-plovom-edinym.png",
  family:
    "https://media.istockphoto.com/id/982881616/ru/%D1%84%D0%BE%D1%82%D0%BE/%D1%81%D1%87%D0%B0%D1%81%D1%82%D0%BB%D0%B8%D0%B2%D0%B0%D1%8F-%D1%81%D0%B5%D0%BC%D1%8C%D1%8F-%D0%BF%D1%83%D1%82%D0%B5%D1%88%D0%B5%D1%81%D1%82%D0%B2%D1%83%D0%B5%D1%82-%D0%BD%D0%B0-%D0%BC%D0%B0%D1%88%D0%B8%D0%BD%D0%B5-%D0%BA-%D0%BC%D0%BE%D1%80%D1%8E.jpg?s=612x612&w=0&k=20&c=blz1tdp7m0YDZjLg80CUlvJ-4dYeyC7uWfl4FQN-VMY=",
  adventure:
    "https://приключения.tv/storage/8801/broadcast-images/01J9XY36ZXSKN8WTHKH44165Q1.JPG",
  art:
    "https://www.orexca.com/img/uzbekistan/tashkent/applied-arts-museum5.jpg",
  relax:
    "https://lh6.googleusercontent.com/proxy/ZS47V6G5xQi9aSUJka3-Ook_0Sn9elxD-XhtHAjZKa7znRsmlGjj30A9-YnmRyelztr3"
};

const reviews = [
  {
    id: "rev-1",
    name: "Laylo & Aziz",
    from: "Toshkent · Oila safari",
    text: "Samarkand va Buxoroga oilaviy tur juda muvozanatli bo'ldi — bolalar uchun ham, kattalar uchun ham qiziqarli joylar juda ko'p edi.",
    tourId: "classic-heritage",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rev-2",
    name: "Anna",
    from: "Moskva · Solo sayohat",
    text: "AI yordamchisi mendan faqat bir nechta savol so'rab, aniq nimani xohlashimni tushundi. Silk Road Premium marshruti hayratlanarli darajada mos tushdi.",
    tourId: "silk-road",
    image:
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "rev-3",
    name: "Omar & Sofia",
    from: "Dubai · Honeymoon",
    text: "Premium darajadagi transfer, mehmonxonalar va yo'ldagi servis juda yuqori. TOURLY.UZ orqali hammasi bir joyda boshqarildi.",
    tourId: "luxury-cities",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80"
  }
];

function buildAssistantText(input: string, step: number, lang: Lang) {
  const q = input.toLowerCase();

  if (step === 2) {
    if (lang === "ru") {
      if (q.includes("дет") || q.includes("сем")) return "Учту семейный формат и подберу спокойные маршруты и отели.";
      if (q.includes("истор")) return "Добавлю больше исторических локаций и экскурсий по выбранным регионам.";
      return "Я учту эти интересы и усилю ими программу тура.";
    }
    if (lang === "en") {
      if (q.includes("family")) return "I'll keep the route family‑friendly with easy walks and calm hotels.";
      if (q.includes("history")) return "I'll add more historical stops and guided tours in the regions you chose.";
      return "Got it, I'll align the tour program with these interests.";
    }
    if (q.includes("oila") || q.includes("bol")) {
      return "Oila bilan qulay bo'lishi uchun tinch marshrutlar va mehmonxonalarni tanlab qo'yaman.";
    }
    if (q.includes("tarix")) {
      return "Ko'proq tarixiy obidalar va ekskursiyalarni marshrutga qo'shib boraman.";
    }
    return "Bu qiziqishlarni e'tiborga olib, tur dasturini shunga moslashtiraman.";
  }

  if (step === 3) {
    if (lang === "ru") {
      return "Зафиксировала желаемую продолжительность. Варианты тура будут подогнаны под эти даты.";
    }
    if (lang === "en") {
      return "Got it, I'll keep this duration in mind when shaping the daily program.";
    }
    return "Davomiylikni inobatga oldim, kunlik reja shunga qarab tuziladi.";
  }

  if (step === 4) {
    if (lang === "ru") {
      return "Я могу изменить отели, транспорт или насыщенность программы — просто напишите, что хотите поменять.";
    }
    if (lang === "en") {
      return "I can adjust hotels, transport, or pacing — tell me what you'd like to change.";
    }
    return "Mehmonxona darajasi, transport yoki kunlik yuklamani o'zgartirishim mumkin — nimani sozlashni yozing.";
  }

  if (lang === "ru") {
    return "Я учту это при подборе тура.";
  }
  if (lang === "en") {
    return "I'll keep this in mind for your trip.";
  }
  return "Bu fikrni sayohat rejasini tuzishda inobatga olaman.";
}

export default function HomePage() {
  type WizardStep = 1 | 2 | 3 | 4;

  const [view, setView] = useState<ViewMode>("home");
  const [lang, setLang] = useState<Lang>("uz");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingScroll, setPendingScroll] = useState<NavItemId | null>(null);
  const t = dictionary[lang];

  const interestOptions = t.interests;
  const durationOptions = t.durations;

  useEffect(() => {
    if (view !== "home") return;
    const timer = setInterval(() => {
      setCarouselIndex((current) => (current + 1) % heroSlides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [view]);

  useEffect(() => {
    if (view !== "builder") {
      setMessages([]);
      setInput("");
      return;
    }

    if (step === 1) {
      setMessages([]);
      setInput("");
      return;
    }
    const introId = `intro-${step}-${lang}`;
    const text =
      step === 2 ? t.builderChatIntro2 : step === 3 ? t.builderChatIntro3 : t.builderChatIntro4;
    setMessages([
      {
        id: introId,
        role: "assistant",
        text
      }
    ]);
    setInput("");
  }, [step, lang]);

  useEffect(() => {
    if (view !== "home" || !pendingScroll) return;
    if (typeof document === "undefined") return;
    const el = document.getElementById(pendingScroll);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setPendingScroll(null);
  }, [view, pendingScroll]);

  const toggleRegion = (id: string) => {
    setSelectedRegions((current) =>
      current.includes(id) ? current.filter((regionId) => regionId !== id) : [...current, id]
    );
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((current) =>
      current.includes(id) ? current.filter((interestId) => interestId !== id) : [...current, id]
    );
  };

  const selectDuration = (id: string) => {
    setSelectedDuration(id);
  };

  const canGoNext = () => {
    const hasUserMessage = messages.some((message) => message.role === "user");
    if (step === 1) return selectedRegions.length > 0;
    if (step === 2) return selectedInterests.length > 0 || hasUserMessage;
    if (step === 3) return selectedDuration !== null || hasUserMessage;
    return true;
  };

  const goNext = () => {
    if (step < 4 && canGoNext()) {
      setStep((step + 1) as WizardStep);
    }
  };

  const goBack = () => {
    if (step > 1) {
      setStep((step - 1) as WizardStep);
    }
  };

  const sendMessage = () => {
    const userText = input.trim();
    if (!userText || step === 1) return;
    const assistantText = buildAssistantText(userText, step, lang);
    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-u`, role: "user", text: userText },
      { id: `${Date.now()}-a`, role: "assistant", text: assistantText }
    ]);
    setInput("");
  };

  const renderChat = () => {
    if (step === 1) return null;
    return (
      <div className="mt-8">
        <div className="rounded-[28px] border border-[#c3d6ff] bg-[#e9f0ff] p-4 sm:p-5 lg:p-6 shadow-[0_16px_44px_rgba(15,23,42,0.18)] space-y-4">
          <div className="max-h-[420px] space-y-4 overflow-y-auto rounded-3xl bg-[#f7f7f8] p-4 shadow-inner">
          {messages.map((message) => {
            const isAssistant = message.role === "assistant";
            return (
              <div
                key={message.id}
                className={`flex w-full gap-3 ${isAssistant ? "justify-start" : "justify-end"}`}
              >
                {isAssistant && (
                  <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full bg-[#0d6efd] text-[11px] font-semibold text-white">
                    AI
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    isAssistant
                      ? "bg-white text-[#111827] shadow-sm"
                      : "bg-[#191970] text-white"
                  }`}
                >
                  <p>{message.text}</p>
                </div>
              </div>
            );
          })}
          </div>
          <form
            className="flex items-center gap-2 rounded-3xl border border-[#d8e7ff] bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,0.08)]"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={t.askPlaceholder}
              className="w-full rounded-2xl px-3 py-2 text-sm outline-none"
            />
            <button
              type="submit"
              className="rounded-2xl bg-[#191970] px-4 py-2 text-sm font-medium text-white hover:bg-[#12124f]"
            >
              {t.send}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <>
          <p className="text-sm text-[#4b5670]">
            {t.builderStep1Text}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {destinations.map((place) => {
              const isSelected = selectedRegions.includes(place.id);
              return (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => toggleRegion(place.id)}
                  className={`group flex flex-col overflow-hidden rounded-3xl border bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.18)] ${
                    isSelected ? "ring-2 ring-[#0d6efd] shadow-[0_18px_40px_rgba(15,23,42,0.22)]" : "border-[#d7e6ff]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <img
                      src={place.image}
                      alt={place.city}
                      className="h-48 w-full transform object-cover transition-transform duration-200 group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <p className="text-sm font-semibold text-[#111827]">
                        {destinationCityByLang[lang][place.id] ?? place.city}
                      </p>
                      <p className="mt-1 text-xs text-[#4b5670]">{place.region}</p>
                      <p className="mt-2 text-xs text-[#111827]">{place.spotlight}</p>
                    </div>
                    <p className="mt-3 text-xs font-medium text-[#0d6efd]">
                      {place.highlights.slice(0, 2).join(" · ")}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      );
    }

    if (step === 2) {
      return (
        <>
          <p className="text-sm text-[#4b5670]">
            {t.builderStep2Text}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
            {interestOptions.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              const imageSrc = interestImageMap[interest.id];
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  className={`flex h-[120px] items-center gap-3 rounded-3xl border bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.18)] ${
                    isSelected ? "ring-2 ring-[#0d6efd] shadow-[0_18px_40px_rgba(15,23,42,0.22)]" : "border-[#d7e6ff]"
                  }`}
                >
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-sm font-semibold text-[#111827]">{interest.label}</p>
                    <p className="mt-1 text-xs text-[#4b5670]">{interest.description}</p>
                  </div>
                  {imageSrc && (
                    <div className="relative h-full w-2/5 max-w-[140px]">
                      <span className="block h-full w-full overflow-hidden rounded-2xl bg-[#eff4ff]">
                        <img
                          src={imageSrc}
                          alt={interest.label}
                          className="h-full w-full object-cover"
                        />
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </>
      );
    }

    if (step === 3) {
      return (
        <>
          <p className="text-sm text-[#4b5670]">
            {t.builderStep3Text}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {durationOptions.map((option) => {
              const isSelected = selectedDuration === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectDuration(option.id)}
                  className={`flex flex-col justify-between rounded-3xl border bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.18)] ${
                    isSelected ? "ring-2 ring-[#0d6efd] shadow-[0_18px_40px_rgba(15,23,42,0.22)]" : "border-[#d7e6ff]"
                  }`}
                >
                  <p className="text-sm font-semibold text-[#111827]">{option.label}</p>
                  <p className="mt-2 text-xs text-[#4b5670]">{option.description}</p>
                </button>
              );
            })}
          </div>
        </>
      );
    }

    return (
      <>
        <p className="text-sm text-[#4b5670]">
          {t.builderStep4Text}
        </p>
        <div className="mt-5 space-y-5">
          {tierBase.map((tier, index) => {
            const baseTour = readyTours[index] ?? readyTours[0];
            const localizedTour = getTourLocalized(baseTour, lang);
            const price = Math.round(baseTour.priceFromUsd * tier.multiplier);
            const tierCopy = t.tiers[tier.id];

            const isEconomy = tier.id === "economy";
            const isStandard = tier.id === "standard";
            const isPremium = tier.id === "premium";

            return (
              <article
                key={tier.id}
                className={`overflow-hidden rounded-3xl border bg-white/95 shadow-[0_20px_50px_rgba(15,23,42,0.22)] ${
                  isPremium ? "border-[#0d6efd]" : "border-[#d8e7ff]"
                }`}
              >
                <div className="h-48 w-full overflow-hidden bg-[#e5edff] sm:h-56">
                  <img
                    src={baseTour.image}
                    alt={localizedTour.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex flex-col gap-4 p-4 sm:p-5">
                  <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-2xl text-white ${
                      isEconomy ? "bg-emerald-500" : isStandard ? "bg-indigo-500" : "bg-purple-600"
                    }`}
                  >
                    {isEconomy && <span className="text-sm font-bold">$</span>}
                    {isStandard && <span className="text-sm font-bold">≃</span>}
                    {isPremium && <span className="text-sm font-bold">★</span>}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">
                      {tierCopy.label}
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-[#0f172a] sm:text-lg">
                      {localizedTour.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#4b5670]">{tierCopy.description}</p>
                  </div>
                </div>

                  <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#94a3b8]">
                    {t.builderRouteLabel}
                  </p>
                  <p className="mt-1 text-xs text-[#1f2937]">{localizedTour.stops.join(" → ")}</p>
                  {selectedDuration && (
                    <p className="mt-2 text-xs text-[#4b5670]">
                      {t.builderDurationLabel}:{" "}
                      {
                        t.durationDisplay[
                          selectedDuration as keyof typeof t.durationDisplay
                        ]
                      }
                    </p>
                  )}
                  {selectedInterests.length > 0 && (
                    <p className="mt-1 text-xs text-[#4b5670]">
                      {t.builderInterestsLabel}: {selectedInterests.length}
                    </p>
                  )}
                </div>

                  <div className="mt-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-[#191970]">${price}</span>
                    <span className="text-xs text-[#6b7280]">/ пакет</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    {isEconomy && (
                      <>
                        <span className="rounded-full bg-[#ecfdf3] px-2 py-1 text-emerald-700">
                          3★ отели
                        </span>
                        <span className="rounded-full bg-[#eff6ff] px-2 py-1 text-[#1d4ed8]">
                          Общий трансфер
                        </span>
                      </>
                    )}
                    {isStandard && (
                      <>
                        <span className="rounded-full bg-[#eef2ff] px-2 py-1 text-indigo-700">
                          3–4★ отели
                        </span>
                        <span className="rounded-full bg-[#fef3c7] px-2 py-1 text-[#92400e]">
                          Комфортный трансфер
                        </span>
                      </>
                    )}
                    {isPremium && (
                      <>
                        <span className="rounded-full bg-[#f5f3ff] px-2 py-1 text-purple-700">
                          4–5★ отели
                        </span>
                        <span className="rounded-full bg-[#fef2f2] px-2 py-1 text-[#b91c1c]">
                          Личный гид и авто
                        </span>
                      </>
                    )}
                  </div>
                </div>
                </div>
              </article>
            );
          })}
        </div>
      </>
    );
  };

  const handleNavbarNavClick = (id: NavItemId) => {
    if (view !== "home") {
      setView("home");
      setStep(1);
      setPendingScroll(id);
      return;
    }
    if (typeof document === "undefined") return;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
        createTripLabel={t.createTrip}
        onCreateTrip={() => {
          setView("builder");
          setStep(1);
          setSelectedRegions([]);
          setSelectedInterests([]);
          setSelectedDuration(null);
          setMessages([]);
          setInput("");
        }}
        onNavClick={handleNavbarNavClick}
      />
      {view === "home" && (
        <>
          <section
            id="hero"
            className="relative mb-10 overflow-hidden rounded-[30px] border border-[#bdd8ff] bg-white shadow-[0_12px_40px_rgba(5,21,57,0.15)]"
          >
            {heroSlides.map((slide, index) => (
              <img
                key={slide}
                src={slide}
                alt="Uzbekistan historical monuments"
                className={`absolute inset-0 h-[560px] w-full object-cover transition-opacity duration-700 ${
                  carouselIndex === index ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-b from-[#030817]/50 via-[#030817]/60 to-[#030817]/85" />
            <div className="relative flex h-[560px] flex-col items-center justify-center px-4 text-center">
              <p className="font-hero-body text-base font-semibold tracking-[0.2em] text-white/95 sm:text-lg">
                {t.heroKicker}
              </p>
              <h1 className="font-hero-title mt-3 text-5xl font-bold tracking-tight text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.3)] sm:text-7xl lg:text-8xl">
                {t.heroTitle}
              </h1>
              <p className="font-hero-body mt-5 max-w-2xl text-base leading-relaxed text-white/90 sm:text-xl">
                {t.heroText}
              </p>
              <button
                type="button"
                onClick={() => {
                  setView("builder");
                  setStep(1);
                  setSelectedRegions([]);
                  setSelectedInterests([]);
                  setSelectedDuration(null);
                  setMessages([]);
                  setInput("");
                }}
                className="mt-10 inline-flex items-center justify-center rounded-2xl bg-white px-12 py-5 text-lg font-bold text-[#191970] shadow-[0_12px_40px_rgba(0,0,0,0.25)] ring-2 ring-white/50 transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_16px_48px_rgba(0,0,0,0.35)] active:scale-[0.98] sm:px-16 sm:py-6 sm:text-xl"
              >
                <span>{t.createTrip}</span>
                <AiSparklesIcon className="ml-3 h-5 w-5" />
              </button>
              <div className="mt-6 flex gap-2">
                {heroSlides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCarouselIndex(index)}
                    className={`h-2.5 w-8 rounded-full ${
                      carouselIndex === index ? "bg-white" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          </section>

          <section
            id="about"
            className="mb-10 grid gap-8 rounded-[30px] border border-[#d8e7ff] bg-gradient-to-r from-[#eff4ff] via-white to-[#f4f0ff] p-6 shadow-[0_14px_40px_rgba(15,23,42,0.12)] lg:grid-cols-2 lg:p-8"
          >
            <div className="flex flex-col justify-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#64748b]">
                {t.aboutKicker}
              </p>
              <h2 className="mt-3 text-2xl font-bold text-[#0f172a] sm:text-3xl">
                {t.aboutTitle}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#4b5563]">
                {t.aboutBody1}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">
                {t.aboutBody2}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs text-[#1e293b]">
                {t.aboutChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full bg-white/80 px-3 py-1 shadow-sm"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {destinations.slice(0, 3).map((place, index) => (
                <div
                  key={place.id}
                  className={`relative overflow-hidden rounded-3xl border border-white/70 shadow-[0_18px_40px_rgba(15,23,42,0.18)] ${
                    index === 0 ? "col-span-2 h-52" : "h-40"
                  }`}
                >
                  <img
                    src={place.image}
                    alt={place.city}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <p className="text-xs font-semibold text-white">
                      {destinationCityByLang[lang][place.id] ?? place.city}
                    </p>
                    <p className="text-[11px] text-white/80">{place.spotlight}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section
            id="tours"
            className="mb-8"
          >
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold">{t.readyTours}</h2>
                <p className="text-sm text-[#5f6b7b]">{t.readyToursSub}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {readyTours.map((tour) => {
                const localizedTour = getTourLocalized(tour, lang);
                return (
                  <article
                    key={tour.id}
                    className="overflow-hidden rounded-[24px] border border-[#cde1ff] bg-white shadow-[0_10px_28px_rgba(8,37,96,0.1)]"
                  >
                    <img src={tour.image} alt={localizedTour.title} className="h-56 w-full object-cover" />
                    <div className="p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{localizedTour.title}</h3>
                        <span className="rounded-full bg-[#eaf2ff] px-2 py-1 text-xs font-semibold text-[#0d6efd]">
                          {tour.days} {t.days}
                        </span>
                      </div>
                      <p className="text-sm text-[#5f6b7b]">{localizedTour.focus}</p>
                      <p className="mt-2 text-sm text-[#1f2f49]">{localizedTour.stops.join(" -> ")}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm font-bold text-[#191970]">
                          ${tour.priceFromUsd} {t.from}
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setView("builder");
                            setStep(1);
                            setSelectedRegions([]);
                            setSelectedInterests([]);
                            setSelectedDuration(null);
                            setMessages([]);
                            setInput("");
                          }}
                          className="rounded-xl bg-[#191970] px-3 py-2 text-sm font-medium text-white hover:bg-[#12124f]"
                        >
                          {t.select}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section
            id="why"
            className="mb-8"
          >
            <h3 className="text-2xl font-bold text-[#191970]">{t.infoTitle}</h3>
            <p className="mt-1 text-sm text-[#191970]">{t.infoSub}</p>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
              {t.infoCards.map((item) => (
                <article
                  key={item.t}
                  className="rounded-3xl border border-white bg-white p-5 shadow-[0_14px_32px_rgba(13,76,161,0.12)]"
                >
                  <p className="text-lg font-semibold text-[#191970]">{item.t}</p>
                  <p className="mt-2 text-sm text-[#191970]">{item.d}</p>
                </article>
              ))}
            </div>
          </section>

          <section
            id="reviews"
            className="mb-10 rounded-[30px] border border-[#d8e7ff] bg-white p-6 shadow-[0_14px_40px_rgba(15,23,42,0.12)] sm:p-8"
          >
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-2xl font-bold text-[#111827]">{t.reviewsTitle}</h3>
                <p className="mt-1 text-sm text-[#4b5563]">
                  {t.reviewsSubtitle}
                </p>
              </div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#64748b]">
                {t.reviewsKicker}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {reviews.map((review) => {
                const tour = readyTours.find((t) => t.id === review.tourId);
                const localizedTour = tour ? getTourLocalized(tour, lang) : null;
                return (
                  <article
                    key={review.id}
                    className="flex h-full flex-col rounded-3xl border border-[#e5edff] bg-[#f7f9ff] p-4 shadow-[0_10px_26px_rgba(15,23,42,0.12)]"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <img
                        src={review.image}
                        alt={review.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{review.name}</p>
                        <p className="text-xs text-[#64748b]">{review.from}</p>
                      </div>
                    </div>
                    <p className="flex-1 text-sm leading-relaxed text-[#111827]">&ldquo;{review.text}&rdquo;</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-[#4b5563]">
                  {localizedTour ? <span>{localizedTour.title}</span> : <span>{t.reviewsCustomTour}</span>}
                      <span className="text-[#f59e0b]">★★★★★</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <footer className="rounded-[26px] border border-[#10104a] bg-[#191970] p-6 shadow-[0_8px_24px_rgba(6,10,40,0.6)]">
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <p className="text-lg font-bold text-white">TOURLY.UZ</p>
                <p className="mt-2 text-sm text-white/80">{t.footerAbout}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{t.footerNav}</p>
                <div className="mt-2 space-y-1 text-sm text-white/80">
                  <p>{t.readyTours}</p>
                  <p>{t.createTrip}</p>
                  <p>{t.communityTrips}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{t.footerContact}</p>
                <div className="mt-2 space-y-1 text-sm text-white/80">
                  <p>hello@tourly.uz</p>
                  <p>+998 90 000 00 00</p>
                  <p>{t.footerLocation}</p>
                </div>
                <Link
                  href="/contact"
                  className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#191970] shadow-[0_8px_22px_rgba(15,23,42,0.4)] hover:bg-[#f3f4ff]"
                >
                  {t.footerContactCta}
                </Link>
              </div>
            </div>
            <div className="mt-6 border-t border-white/20 pt-4 text-xs text-white/60">
              © 2026 TOURLY.UZ. {t.footerCopy}
            </div>
          </footer>
        </>
      )}

      {view === "builder" && (
        <section className="rounded-[30px] border border-[#bdd8ff] bg-gradient-to-br from-[#eff4ff] via-white to-[#f4f0ff] p-5 shadow-[0_16px_44px_rgba(15,23,42,0.16)] sm:p-7 lg:p-8">
          <div className="flex flex-col gap-4 border-b border-[#d8e7ff] pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#64748b]">
                {t.builderProgressLabel} {step} / 4
              </p>
              <h1 className="mt-2 text-2xl font-bold text-[#0f172a] sm:text-3xl">
                {t.builderMainTitle}
              </h1>
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div className="w-full">
                <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-[#64748b]">
                  <span>0%</span>
                  <span>{Math.round((step / 4) * 100)}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e2ecff]">
                  <div
                    className="h-full rounded-full bg-[#0d6efd] transition-all duration-300"
                    style={{ width: `${(step / 4) * 100}%` }}
                  />
                </div>
              </div>
              <div className="mt-1 flex flex-wrap gap-2 md:flex-nowrap">
                {[
                  { id: 1, label: t.builderTitle },
                  { id: 2, label: t.builderStepInterests },
                  { id: 3, label: t.builderStepDuration },
                  { id: 4, label: t.builderStepReady }
                ].map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      step === item.id
                        ? "bg-[#0d6efd] text-white shadow-[0_10px_24px_rgba(37,99,235,0.45)]"
                        : "bg-white text-[#0f172a] border border-[#d8e7ff]"
                    }`}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] text-[#0d6efd]">
                      {item.id}
                    </span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5">
            {renderStepContent()}
            {renderChat()}
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (step === 1) {
                    setView("home");
                    return;
                  }
                  goBack();
                }}
                className="rounded-xl px-4 py-2 text-sm font-medium bg-white text-[#111827] border border-[#d8e7ff] hover:bg-[#eff4ff]"
              >
                {step === 1 ? t.backHome : t.builderBack}
              </button>
              <button
                type="button"
                onClick={goNext}
                disabled={step === 4 || !canGoNext()}
                className={`rounded-xl px-6 py-2 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.5)] ${
                  step === 4 || !canGoNext()
                    ? "cursor-not-allowed bg-[#93c5fd]"
                    : "bg-[#0d6efd] hover:bg-[#1d4ed8]"
                }`}
              >
                {step === 4 ? t.builderDone : t.builderNext}
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
