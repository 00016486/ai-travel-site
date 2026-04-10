"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { destinations, readyTours } from "@/lib/travel-data";
import { AiSparklesIcon, LANG_STORAGE_KEY, MainNavbar, NavItemId } from "@/components/main-navbar";
import { getJsonOrNull } from "@/lib/api";
import {
  chatWithAi,
  getAiAuthStatus,
  generateTourFromBuilder,
  type GeneratedTourPreview,
  getAuthTokenFromStorage,
  listChatSessions,
  createChatSession,
  listChatMessages,
  appendChatMessage,
  updateChatSession,
  type ChatSession
} from "@/lib/ai";

type ChatRole = "user" | "assistant";
type Lang = "uz" | "ru" | "en";

type ChatMessage = {
  id: string;
  role: ChatRole;
  text: string;
  suggestionIds?: string[];
  imageUrls?: string[];
  tour?: {
    slug: string;
    title: string;
  };
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
    askPlaceholder: "Istalgan savolni yozing...",
    send: "Yuborish",
    assistantName: "Layla.",
    assistantTitle: "Sayohatingizni tushunmoqda...",
    assistantSub: "Sizning chat javoblaringiz asosida eng mos tur paketlari tanlanadi.",
    initialAssistant:
      "Salom! TOURLY.UZ AI sayohat yordamchisi siz uchun mos marshrutni generatsiya qiladi. Qayerga bormoqchi ekansiz yoki qanday sayohat rejalamoqchisiz? 😊",
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
    aboutOperatorTitle: "Turga mos operator bilan bog'lanish",
    aboutOperatorText:
      "Tanlangan yo'nalish va qiziqishlaringiz asosida mos turoperator bilan bog'lanish imkoniyati mavjud. Operator aynan shu tur uchun narx va tafsilotlarni taqdim etadi.",
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
      "Sizni qiziqtirgan O'zbekiston hududlarini tanlang. Bir yoki bir nechta shaharni belgilashingiz mumkin.",
    builderStep2Text:
      "Endi qiziqishlaringizni tanlang — bu marshrutni yanada aniqroq qilishga yordam beradi.",
    builderStep3Text:
      "Sayohatingiz davomiyligini tanlang. Agar aniq sanalar bo'lsa, pastdagi chatda yozib qoldiring.",
    builderStep4Text:
      "Siz uchun tavsiya etilgan marshrut. O'zgartirish kiritish yoki qo'shimcha talablar bildirish uchun quyidagi AI chat orqali muloqot qiling.",
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
        description: "Eng yuqori qulaylik: 4–5★ mehmonxonalar, shaxsiy gid va kengaytirilgan marshrut."
      }
    },
    unlockTripButton: "Unlock trip plan",
    viewPlanButton: "Full trip plan",
    loginTitle: "Trip rejangizni ochish uchun kiring",
    loginSubtitle:
      "Tanlangan klass bo‘yicha marshrutni to‘liq ko‘rish uchun oddiy login qiling. Keyin sotib olish va saqlash mumkin bo‘ladi.",
    loginEmailLabel: "Email",
    loginPasswordLabel: "Parol",
    loginSubmit: "Kirish va unlock qilish",
    loginSkip: "Keyinroq davom etaman",
    tripPlanTitle: "Ochilgan trip rejangiz",
    tripPlanIntro:
      "Quyida siz tanlagan klass va yo‘nalishlar asosida tuzilgan umumiy marshrut reja. Har bir kun bo‘yicha batafsil reja keyingi bosqichda aniqlashtiriladi.",
    tripPlanClassLabel: "Klass",
    tripPlanRouteLabel: "Yo‘nalish",
    tripPlanDurationLabel: "Davomiylik",
    tripPlanInterestsLabel: "Asosiy fokus",
    tripPlanTransportLabel: "Transport va qulaylik",
    agenciesTitle: "Tur agentliklari",
    agenciesSub: "Ishonchli hamkorlarimiz va ularning yo'nalishlari",
    agenciesKicker: "Hamkorlar"
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
    askPlaceholder: "Спросите что угодно...",
    send: "Отправить",
    assistantName: "Layla.",
    assistantTitle: "Анализирую вашу поездку...",
    assistantSub: "На основе ваших сообщений в чате подбираются лучшие туры.",
    initialAssistant:
      "Привет! AI-помощник TOURLY.UZ сгенерирует маршрут под ваши пожелания. Куда мечтаете поехать или что хотите увидеть в Узбекистане? 😊",
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
    aboutOperatorTitle: "Связаться с оператором по вашему туру",
    aboutOperatorText:
      "Доступна возможность связаться с подходящим туроператором на основе выбранных регионов и интересов. Оператор предоставит детали и стоимость именно по этому туру.",
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
      "Выберите регионы Узбекистана, которые вам интересны. Можно выбрать несколько городов.",
    builderStep2Text:
      "Теперь отметьте ваши интересы — это поможет сделать маршрут более точным.",
    builderStep3Text:
      "Выберите желаемую длительность поездки. Если есть конкретные даты, напишите их в чате ниже.",
    builderStep4Text:
      "Рекомендованный для вас маршрут. Чтобы внести изменения или добавить дополнительные пожелания, пожалуйста, воспользуйтесь AI-чатом ниже.",
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
        description: "Максимальный комфорт: отели 4–5★, личный гид и расширенная программа."
      }
    },
    unlockTripButton: "Unlock trip plan",
    viewPlanButton: "Полный план поездки",
    loginTitle: "Войдите, чтобы открыть план",
    loginSubtitle:
      "Авторизуйтесь, чтобы увидеть полный маршрут по выбранному классу. После этого можно будет оплатить и сохранить поездку.",
    loginEmailLabel: "Email",
    loginPasswordLabel: "Пароль",
    loginSubmit: "Войти и открыть план",
    loginSkip: "Продолжить позже",
    tripPlanTitle: "Ваш открытый план поездки",
    tripPlanIntro:
      "Ниже — общий маршрут, собранный под ваш класс и выбранные направления. Детализация по дням будет доработана на следующем шаге.",
    tripPlanClassLabel: "Класс",
    tripPlanRouteLabel: "Маршрут",
    tripPlanDurationLabel: "Длительность",
    tripPlanInterestsLabel: "Основной фокус",
    tripPlanTransportLabel: "Транспорт и комфорт",
    agenciesTitle: "Туристические агентства",
    agenciesSub: "Наши надёжные партнёры и их специализации",
    agenciesKicker: "Партнёры"
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
    askPlaceholder: "Ask anything...",
    send: "Send",
    assistantName: "Layla.",
    assistantTitle: "Understanding your trip...",
    assistantSub: "Matching tours are selected based on your chat responses.",
    initialAssistant:
      "Hey! TOURLY.UZ AI can generate an itinerary tailored to your preferences. Where would you love to go, or what kind of trip are you dreaming of? 😊",
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
    aboutOperatorTitle: "Contact an operator for this tour",
    aboutOperatorText:
      "A matching tour operator can be contacted based on your selected regions and interests. They provide tailored pricing and exact trip details for this tour.",
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
      "Choose the regions of Uzbekistan you are interested in. You can select multiple cities.",
    builderStep2Text:
      "Now select your interests — this helps make the route much more precise.",
    builderStep3Text:
      "Pick the duration of your trip. If you already know exact dates, write them in the chat below.",
    builderStep4Text:
      "A recommended route for your trip. To request changes or add new requirements, please communicate via the AI chat below.",
    builderChatIntro2:
      "Select your interests or type them in the chat — I'll adapt the route.",
    builderChatIntro3:
      "Set the duration that feels right or type another option in the chat.",
    builderChatIntro4:
      "Here is a route that matches your answers. If something feels off, tell me in chat and we'll adjust.",
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
        description: "Highest comfort: 4–5★ hotels, private guide and an extended route."
      }
    },
    unlockTripButton: "Unlock trip plan",
    viewPlanButton: "View full trip plan",
    loginTitle: "Sign in to unlock your trip plan",
    loginSubtitle:
      "Log in to see the complete route for this class. After that you’ll be able to purchase and save the itinerary.",
    loginEmailLabel: "Email",
    loginPasswordLabel: "Password",
    loginSubmit: "Sign in & unlock",
    loginSkip: "Maybe later",
    tripPlanTitle: "Your unlocked trip plan",
    tripPlanIntro:
      "Here is a high‑level itinerary built around your class and selected regions. We’ll refine each day of the route in the next step.",
    tripPlanClassLabel: "Class",
    tripPlanRouteLabel: "Route",
    tripPlanDurationLabel: "Duration",
    tripPlanInterestsLabel: "Main focus",
    tripPlanTransportLabel: "Transport & comfort",
    agenciesTitle: "Travel agencies",
    agenciesSub: "Our trusted partners and their specializations",
    agenciesKicker: "Partners"
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

/** First highlight (spotlight) under region name on card — uz, ru, en */
const destinationSpotlightByLang: Record<Lang, Record<string, string>> = {
  uz: {
    samarkand: "Registon maydoni",
    bukhara: "Ark qal'asi",
    khiva: "Ichan-Qal'a",
    tashkent: "Hazrati Imom",
    fergana: "Rishton kulolchilik",
    nukus: "Savitskiy muzeyi",
    andijan: "Bobur nomidagi bog'",
    namangan: "Bog'lar shahri",
    jizzakh: "Zomin milliy bog'i",
    navoi: "Qizilqum cho'li",
    karshi: "Shahrisabz me'morchiligi",
    termez: "Fayoztepa"
  },
  ru: {
    samarkand: "Площадь Регистан",
    bukhara: "Арк, крепость",
    khiva: "Ичан-Кала",
    tashkent: "Хазрати Имам",
    fergana: "Риштанская керамика",
    nukus: "Музей Савицкого",
    andijan: "Парк имени Бабура",
    namangan: "Город садов",
    jizzakh: "Зоминский национальный парк",
    navoi: "Кызылкумская пустыня",
    karshi: "Архитектура Шахрисабза",
    termez: "Фаёзтепа"
  },
  en: {
    samarkand: "Registan Square",
    bukhara: "Ark Fortress",
    khiva: "Itchan Kala",
    tashkent: "Hazrati Imam",
    fergana: "Rishton ceramics",
    nukus: "Savitsky Museum",
    andijan: "Babur Park",
    namangan: "City of Gardens",
    jizzakh: "Zomin National Park",
    navoi: "Kyzylkum Desert",
    karshi: "Shakhrisabz architecture",
    termez: "Fayaz-Tepe"
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
  "https://images.pexels.com/photos/338504/pexels-photo-338504.jpeg",
  "https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg",
  "https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg",
  "https://images.pexels.com/photos/1619317/pexels-photo-1619317.jpeg"
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

const BUILDER_STATE_KEY = "tourly_builder_state_v1";
const LAST_SESSION_KEY = "tourly_last_session_id";


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

function escapeHtml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatChatTextToSafeHtml(text: string) {
  const normalized = String(text || "").replace(/\r\n/g, "\n").trim();
  if (!normalized) return "";

  const paragraphs = normalized.split(/\n\s*\n/);
  const htmlParts: string[] = [];

  for (const p of paragraphs) {
    const rawLines = p.split("\n").map((l) => l.trim()).filter(Boolean);
    const isBulletList = rawLines.length > 0 && rawLines.every((l) => /^(-|•)\s+/.test(l));

    if (isBulletList) {
      const items = rawLines.map((l) => l.replace(/^(-|•)\s+/, ""));
      htmlParts.push(`<ul>${items.map((it) => `<li>${escapeHtml(it)}</li>`).join("")}</ul>`);
      continue;
    }

    const escapedLines = p
      .split("\n")
      .map((l) => escapeHtml(l))
      .join("<br/>");
    htmlParts.push(`<p>${escapedLines}</p>`);
  }

  return htmlParts.join("");
}

function formatAiChatFailure(err: unknown, lang: Lang, fallback?: string): string {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  if (
    lower.includes("invalid_api_key") ||
    lower.includes("incorrect api key") ||
    lower.includes("invalid api key") ||
    lower.includes("groq api failed: 401")
  ) {
    if (lang === "ru") {
      return "GROQ API ключ недействителен. Проверьте GROQ_API_KEY в server/.env.";
    }
    if (lang === "en") {
      return "GROQ API key is invalid. Check GROQ_API_KEY in server/.env.";
    }
    return "GROQ API kaliti noto'g'ri. server/.env faylida GROQ_API_KEY ni tekshiring.";
  }
  if (lower.includes("ai service is not configured")) {
    if (lang === "ru") {
      return "AI сервис не настроен. Добавьте GROQ_API_KEY в server/.env.";
    }
    if (lang === "en") {
      return "AI service is not configured. Add GROQ_API_KEY to server/.env.";
    }
    return "AI xizmati sozlanmagan. server/.env ga GROQ_API_KEY qo'shing.";
  }
  if (fallback) return fallback;
  if (lang === "ru") {
    return "Сейчас не смог ответить. Попробуйте ещё раз.";
  }
  if (lang === "en") {
    return "I couldn't respond right now. Please try again.";
  }
  return "Hozir javob bera olmadim. Iltimos yana urinib ko‘ring.";
}

function parseBudgetUsd(text: string): number | null {
  const t = String(text || "");
  // "$500", "500$", "500 usd", "500 USD"
  const withCurrency = t.match(/(\d{2,5})(?:\s*\$|\.?\s*usd|\s*USD)/i) || t.match(/\$\s*(\d{2,5})/i) || t.match(/(\d{2,5})\s*\$/i);
  // "500 dollar", "500 долларов", "500 доллар"
  const withDollarWord = t.match(/(\d{2,5})\s*(?:dollar|доллар)/i);
  const plainBudgetOnly = t.match(/^\s*(\d{2,5})\s*$/);
  const budgetWordPattern =
    /(budget|byudjet|бюджет|limit|лимит|summa|сумма|menda|менда|manda|bor|есть|pul|деньг)/i.test(t) ? t.match(/(\d{2,5})/) : null;
  const raw = withCurrency?.[1] ?? withDollarWord?.[1] ?? plainBudgetOnly?.[1] ?? budgetWordPattern?.[1] ?? null;
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function estimateBuilderDays(selectedDuration: string | null, selectedRegions: string[], selectedDays?: number | null) {
  if (typeof selectedDays === "number" && selectedDays > 0) return Math.round(selectedDays);
  if (selectedDuration === "short") return 4;
  if (selectedDuration === "medium") return 6;
  if (selectedDuration === "long") return 8;
  if (!selectedRegions.length) return 4;
  const regionRecommended = selectedRegions
    .map((id) => destinations.find((d) => d.id === id)?.recommendedDays ?? 4)
    .filter((n) => Number.isFinite(n));
  return Math.max(2, ...regionRecommended);
}

function computeSmartPackagePrices({
  selectedDuration,
  selectedDays,
  selectedRegions,
  selectedInterests,
  builderBudgetUsd,
  builderChatNotes
}: {
  selectedDuration: string | null;
  selectedDays?: number | null;
  selectedRegions: string[];
  selectedInterests: string[];
  builderBudgetUsd: number | null;
  builderChatNotes: string[];
}) {
  const days = estimateBuilderDays(selectedDuration, selectedRegions, selectedDays);
  const notesText = builderChatNotes.join(" ").toLowerCase();

  // Smart signals from already selected options and previous chat context.
  const regionFactor = 1 + Math.min(0.45, selectedRegions.length * 0.06);
  const interestFactor = 1 + Math.min(0.35, selectedInterests.length * 0.045);
  const luxurySignal =
    /\blux|premium|vip|5\*|five star|люкс|роскош|премиум\b/.test(notesText) ? 1.08 : 1;
  const budgetSignal =
    typeof builderBudgetUsd === "number" && builderBudgetUsd > 0
      ? builderBudgetUsd >= 1800
        ? 1.08
        : builderBudgetUsd <= 600
          ? 0.93
          : 1
      : 1;

  const adaptiveBasePerDay = Math.round(115 * regionFactor * interestFactor * luxurySignal * budgetSignal);
  let standard = days * adaptiveBasePerDay;

  if (typeof builderBudgetUsd === "number" && builderBudgetUsd > 0) {
    // Keep standard close to the user's stated budget while preserving tier order.
    standard = Math.round(Math.min(standard, builderBudgetUsd * 0.96));
  }

  standard = Math.max(220, standard);
  const start = Math.max(140, Math.round(standard * 0.78));
  const premium = Math.max(Math.round(standard * 1.32), start + 140, standard + 100);
  const safeStandard = Math.max(standard, start + 70);

  return {
    days,
    prices: {
      economy: start,
      standard: safeStandard,
      premium
    } as Record<"economy" | "standard" | "premium", number>
  };
}

function parseDurationDays(text: string): number | null {
  const t = String(text || "").toLowerCase();

  // Range: 3-4 / 5-7 / 8-10
  const range = t.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})\s*(kun|day|дн|день)/i) || t.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})/i);
  if (range) {
    const a = Number(range[1]);
    const b = Number(range[2]);
    if (Number.isFinite(a) && Number.isFinite(b)) return Math.max(a, b);
  }

  // Single: "3 kun" / "5 day"
  const single = t.match(/(\d{1,2})\s*(kun|day|день|дней)\b/i);
  if (single) {
    const n = Number(single[1]);
    if (Number.isFinite(n)) return n;
  }

  // "8+ kun"
  const plus = t.match(/(\d{1,2})\s*\+\s*(kun|day|день|дней)\b/i);
  if (plus) {
    const n = Number(plus[1]);
    if (Number.isFinite(n)) return n;
  }

  return null;
}

function durationIdFromDays(days: number): string {
  if (days <= 4) return "short";
  if (days <= 7) return "medium";
  return "long";
}

function extractRegionsFromText(text: string, lang: Lang) {
  const t = String(text || "").toLowerCase();
  const ids = Object.keys(destinationCityByLang.uz);
  const out: string[] = [];
  for (const id of ids) {
    const aliases = [id, destinationCityByLang.uz[id], destinationCityByLang.ru[id], destinationCityByLang.en[id]];
    if (aliases.some((a) => a && t.includes(String(a).toLowerCase()))) out.push(id);
  }
  return Array.from(new Set(out));
}

const interestKeywordsById: Record<string, string[]> = {
  history: ["tarix", "history", "истор", "obida", "registon"],
  nature: ["tabiat", "nature", "tog", "mountain", "gora", "горы", "чимган", "chimgan", "vodiy"],
  gastronomy: ["osh", "plov", "sam", "tandir", "food", "гастроном", "gastronomy"],
  family: ["oila", "family", "дет", "сем", "bolа", "kids", "семей"],
  adventure: ["adventure", "ekstrem", "safari", "hiking", "jeep", "sarguzasht", "экстр", "safari", "tour"],
  art: ["sanat", "art", "muzey", "museum", "galere", "искус", "craft"],
  relax: ["spa", "dam olish", "relax", "otd", "sanator", "отдых", "sekin", "relaks"]
};

function extractInterestsFromText(text: string) {
  const t = String(text || "").toLowerCase();
  const out: string[] = [];
  for (const [id, keywords] of Object.entries(interestKeywordsById)) {
    if (keywords.some((k) => t.includes(k.toLowerCase()))) out.push(id);
  }
  return Array.from(new Set(out));
}

function extractIntentFlagsFromText(text: string) {
  const t = String(text || "").trim().toLowerCase();
  const wantsImage =
    /^\/image\b/.test(t) ||
    t.startsWith("image ") ||
    t.includes("rasm") ||
    t.includes("text-to-image") ||
    t.includes("image ");
  const wantsTour =
    t.startsWith("/tour") ||
    t.includes("tour generate") ||
    t.includes("tur generate") ||
    t.includes("tur yarat") ||
    t.includes("tour yarat") ||
    t.includes("tayyor plan") ||
    t.includes("tayyor tur") ||
    t.includes("paket");
  return { wantsImage, wantsTour };
}

const travelAgencies: Record<Lang, { name: string; destinations: string; specialty: string; tag: string }[]> = {
  uz: [
    { name: "Samarkand Silk Road Tours", destinations: "Samarqand, Buxoro, Xiva", specialty: "Buyuk Ipak Yo'li bo'ylab tarixi shaharlar va UNESCO obidalari", tag: "Tarixiy turlar" },
    { name: "Fergana Crafts & Culture", destinations: "Farg'ona, Rishton, Marg'ilon", specialty: "Ipak to'qimachilik, kulolchilik va milliy hunarmandchilik ustaxonalari", tag: "Madaniy turlar" },
    { name: "Nature Adventures UZ", destinations: "Chimyon, Nurata, Zarafshon", specialty: "Tog' yurishlari, eko-turlar va yovvoyi tabiat sayohatlari", tag: "Eko-turlar" },
    { name: "Tashkent City Tours", destinations: "Toshkent va atroflari", specialty: "Toshkent metropoliteni, zamonaviy arxitektura va shahar ko'rgazmalari", tag: "Shahar turlari" },
    { name: "Desert & Steppe Safari", destinations: "Qizilqum, Ayoz Qal'a, Moynaq", specialty: "Qizilqum cho'li ekspeditsiyalari va karvon yo'llari", tag: "Safari turlar" },
    { name: "Luxury Uzbek Journey", destinations: "Butun O'zbekiston", specialty: "5★ mehmonxonalar, shaxsiy gid va VIP individual marshrutlar", tag: "Lyuks turlar" },
    { name: "Family Fun Uzbekistan", destinations: "Samarqand, Toshkent, Buxoro", specialty: "Bolalar uchun qulay aktivliklar va oilaviy dam olish mashrutlari", tag: "Oilaviy turlar" },
    { name: "Gastro & Bazaar Tours", destinations: "Toshkent, Samarqand, Farg'ona", specialty: "Plov to'ylari, ziravorlar bozori va milliy taomlar ustaxonalari", tag: "Gastro turlar" },
    { name: "Termez Heritage Tours", destinations: "Termiz, Shahrisabz, Qarshi", specialty: "Janubiy O'zbekiston: buddist yodgorliklar va qadimiy shaharlar", tag: "Arxeologik turlar" },
    { name: "Aral Sea Expeditions", destinations: "Moynaq, Orol dengizi, Nukus", specialty: "Orol dengizi sayohati, kemalar qabristoni va Qoraqalpog'iston", tag: "Ekspeditsiya turlar" }
  ],
  ru: [
    { name: "Samarkand Silk Road Tours", destinations: "Самарканд, Бухара, Хива", specialty: "Исторические города Великого шёлкового пути и объекты ЮНЕСКО", tag: "Исторические туры" },
    { name: "Fergana Crafts & Culture", destinations: "Фергана, Риштан, Маргилан", specialty: "Шелкоткачество, гончарное дело и ремесленные мастерские", tag: "Культурные туры" },
    { name: "Nature Adventures UZ", destinations: "Чимган, Нурата, Зарафшан", specialty: "Горные походы, экотуры и путешествия к дикой природе", tag: "Экотуры" },
    { name: "Tashkent City Tours", destinations: "Ташкент и окрестности", specialty: "Метро Ташкента, современная архитектура и городские выставки", tag: "Городские туры" },
    { name: "Desert & Steppe Safari", destinations: "Кызылкум, Аяз-Кала, Муйнак", specialty: "Экспедиции по пустыне Кызылкум и маршруты по древним караванным путям", tag: "Сафари-туры" },
    { name: "Luxury Uzbek Journey", destinations: "Весь Узбекистан", specialty: "Отели 5★, личный гид и VIP-индивидуальные маршруты", tag: "Люкс-туры" },
    { name: "Family Fun Uzbekistan", destinations: "Самарканд, Ташкент, Бухара", specialty: "Активности для детей и семейный отдых в комфортном темпе", tag: "Семейные туры" },
    { name: "Gastro & Bazaar Tours", destinations: "Ташкент, Самарканд, Фергана", specialty: "Плов-дворы, базары пряностей и мастер-классы по национальным блюдам", tag: "Гастро-туры" },
    { name: "Termez Heritage Tours", destinations: "Термез, Шахрисабз, Карши", specialty: "Южный Узбекистан: буддийские памятники и древние города", tag: "Археологические туры" },
    { name: "Aral Sea Expeditions", destinations: "Муйнак, Аральское море, Нукус", specialty: "Поездка к Аральскому морю, кладбищу кораблей и Каракалпакстан", tag: "Экспедиционные туры" }
  ],
  en: [
    { name: "Samarkand Silk Road Tours", destinations: "Samarkand, Bukhara, Khiva", specialty: "Historic cities along the Great Silk Road and UNESCO World Heritage sites", tag: "Historical tours" },
    { name: "Fergana Crafts & Culture", destinations: "Fergana, Rishtan, Margilan", specialty: "Silk weaving, pottery crafts and traditional artisan workshops", tag: "Cultural tours" },
    { name: "Nature Adventures UZ", destinations: "Chimgan, Nurata, Zarafshan", specialty: "Mountain hikes, eco-tours and wildlife nature expeditions", tag: "Eco-tours" },
    { name: "Tashkent City Tours", destinations: "Tashkent & surroundings", specialty: "Tashkent metro art, modern architecture and urban exhibitions", tag: "City tours" },
    { name: "Desert & Steppe Safari", destinations: "Kyzylkum, Ayaz Kala, Moynaq", specialty: "Kyzylkum desert expeditions and ancient caravan route trails", tag: "Safari tours" },
    { name: "Luxury Uzbek Journey", destinations: "All of Uzbekistan", specialty: "5-star hotels, personal guide and exclusive VIP private itineraries", tag: "Luxury tours" },
    { name: "Family Fun Uzbekistan", destinations: "Samarkand, Tashkent, Bukhara", specialty: "Kid-friendly activities and family vacations at a comfortable pace", tag: "Family tours" },
    { name: "Gastro & Bazaar Tours", destinations: "Tashkent, Samarkand, Fergana", specialty: "Plov houses, spice bazaars and national cuisine cooking workshops", tag: "Gastro tours" },
    { name: "Termez Heritage Tours", destinations: "Termez, Shahrisabz, Karshi", specialty: "Southern Uzbekistan: Buddhist monuments and ancient historic cities", tag: "Archaeological tours" },
    { name: "Aral Sea Expeditions", destinations: "Moynaq, Aral Sea, Nukus", specialty: "Journey to the Aral Sea, ship graveyard and Karakalpakstan region", tag: "Expedition tours" }
  ]
};

const agencyTagColors: string[] = [
  "bg-[#eff6ff] text-[#1d4ed8]",
  "bg-[#fdf4ff] text-[#7e22ce]",
  "bg-[#f0fdf4] text-[#15803d]",
  "bg-[#fff7ed] text-[#c2410c]",
  "bg-[#fefce8] text-[#a16207]",
  "bg-[#fdf2f8] text-[#be185d]",
  "bg-[#f0fdfa] text-[#0f766e]",
  "bg-[#fff1f2] text-[#be123c]",
  "bg-[#f8fafc] text-[#334155]",
  "bg-[#eff6ff] text-[#1d4ed8]"
];

export default function HomePage() {
  type WizardStep = 1 | 2 | 3 | 4;

  const [view, setView] = useState<ViewMode>("home");
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Lang>("uz");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [agencyIdx, setAgencyIdx] = useState(0);
  const [step, setStep] = useState<WizardStep>(1);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingScroll, setPendingScroll] = useState<NavItemId | null>(null);

  // AI auth status (server-managed OpenAI key)
  const [aiHasServerKey, setAiHasServerKey] = useState(false);
  const [aiChatLoading, setAiChatLoading] = useState(false);

  const [builderBudgetUsd, setBuilderBudgetUsd] = useState<number | null>(null);
  const [builderExactDays, setBuilderExactDays] = useState<number | null>(null);
  const [builderChatNotes, setBuilderChatNotes] = useState<string[]>([]);
  const [generatedTourPreview, setGeneratedTourPreview] = useState<GeneratedTourPreview | null>(null);
  const [generatedTourImages, setGeneratedTourImages] = useState<string[]>([]);
  const [generatingTourPreview, setGeneratingTourPreview] = useState(false);
  const lastGeneratedKeyRef = useRef<string | null>(null);
  const sendInFlightRef = useRef(false);

  type TierId = "economy" | "standard" | "premium";
  const [selectedPackageTierId, setSelectedPackageTierId] = useState<TierId | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chatSessionsLoading, setChatSessionsLoading] = useState(false);

  const router = useRouter();
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const t = dictionary[lang];
  const interestOptions = t.interests;
  const durationOptions = t.durations;
  const buildGenerationHistoryPayload = (extraUserText?: string) => {
    const base = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, text: m.text }));
    if (extraUserText && extraUserText.trim()) {
      base.push({ role: "user", text: extraUserText.trim() });
    }
    return base.slice(-30);
  };
  const smartPricing = computeSmartPackagePrices({
    selectedDuration,
    selectedDays: builderExactDays,
    selectedRegions,
    selectedInterests,
    builderBudgetUsd,
    builderChatNotes
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY) as Lang | null;
    if (stored === "uz" || stored === "ru" || stored === "en") setLang(stored);
  }, []);

  useEffect(() => {
    const token = getAuthTokenFromStorage();
    setAuthToken(token);
  }, []);

  useEffect(() => {
    if (!authToken) {
      setChatSessions([]);
      setActiveSessionId(null);
      return;
    }
    setChatSessionsLoading(true);
    listChatSessions(authToken)
      .then((sessions) => {
        setChatSessions(sessions);
      })
      .catch(() => {
        setChatSessions([]);
      })
      .finally(() => setChatSessionsLoading(false));
  }, [authToken]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    getAiAuthStatus()
      .then(({ hasServerKey }) => {
        setAiHasServerKey(hasServerKey);
      })
      .catch(() => {
        // if backend is unreachable, keep UI as "no server key"
        setAiHasServerKey(false);
      });
  }, []);

  useEffect(() => {
    const builderParam = searchParams.get("builder");
    if (builderParam === "ready") {
      // Restore full state from localStorage when returning from tour page
      const restored = restoreBuilderStateFromStorage();
      if (!restored) {
        setView("builder");
        setStep(4);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // After login redirect with ?builder=new, or returning from tour page via ?builder=ready
  useEffect(() => {
    if (!authToken) return;
    const builderParam = searchParams.get("builder");

    if (builderParam === "new") {
      router.replace("/", { scroll: false });
      resetBuilderState();
      createChatSession(authToken, "New Trip")
        .then((session) => {
          setActiveSessionId(session.id);
          setChatSessions((prev) => [session, ...prev]);
        })
        .catch(() => {
          setActiveSessionId(null);
        });
      return;
    }

    if (builderParam === "ready") {
      // Restore full builder state from localStorage
      restoreBuilderStateFromStorage();
      setView("builder");
      // Restore the last active session so history is preserved
      const lastSessionId = (() => {
        try { return window.localStorage.getItem(LAST_SESSION_KEY); } catch { return null; }
      })();
      if (!lastSessionId) return;
      setActiveSessionId(lastSessionId);
      listChatMessages(authToken, lastSessionId)
        .then((stored) => {
          const mapped: ChatMessage[] = stored.map((m) => ({
            id: m.id,
            role: m.role,
            text: m.text
          }));
          if (mapped.length > 0) setMessages(mapped);
        })
        .catch(() => { /* keep empty messages, session still set */ });
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken]);


  useEffect(() => {
    if (view !== "home") return;
    const timer = setInterval(() => {
      setCarouselIndex((current) => (current + 1) % heroSlides.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [view]);

  useEffect(() => {
    if (view === "builder") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [view]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, step]);

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
    if (step === 1) return selectedRegions.length > 0;
    if (step === 2) return selectedInterests.length > 0;
    if (step === 3) return selectedDuration !== null;
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

  const sendMessage = async () => {
    if (sendInFlightRef.current) return;
    const userText = input.trim();
    if (!userText || aiChatLoading) return;
    sendInFlightRef.current = true;
    try {

      let sessionId = activeSessionId;
      if (!sessionId && authToken) {
        try {
          const created = await createChatSession(authToken, "New Trip");
          sessionId = created.id;
          setActiveSessionId(created.id);
          setChatSessions((prev) => [created, ...prev]);
        } catch {
          sessionId = null;
        }
      }

      const { wantsImage, wantsTour } = extractIntentFlagsFromText(userText);

    // Step-by-step extraction from plain chat text.
      const extractedRegions = extractRegionsFromText(userText, lang);
      const extractedInterests = extractInterestsFromText(userText);
      const extractedBudgetUsd = parseBudgetUsd(userText);
      const extractedDays = parseDurationDays(userText);
      const extractedDurationId = extractedDays ? durationIdFromDays(extractedDays) : null;

      const nextSelectedRegions = extractedRegions.length ? Array.from(new Set([...selectedRegions, ...extractedRegions])) : selectedRegions;
      const nextSelectedInterests = extractedInterests.length
        ? Array.from(new Set([...selectedInterests, ...extractedInterests]))
        : selectedInterests;
      const nextSelectedDuration = extractedDurationId ? extractedDurationId : selectedDuration;
      const nextBuilderExactDays = extractedDays !== null ? extractedDays : builderExactDays;
      const nextBuilderBudgetUsd = extractedBudgetUsd !== null ? extractedBudgetUsd : builderBudgetUsd;

      const regionsReady = nextSelectedRegions.length > 0;
      const interestsReady = nextSelectedInterests.length > 0;
      const durationReady = nextSelectedDuration !== null;

      const desiredStep: WizardStep = regionsReady ? (interestsReady ? (durationReady ? 4 : 3) : 2) : 1;

    // Always append notes (used later in tour generation).
      setBuilderChatNotes((prev) => [...prev, userText]);

    // Update selections immediately.
      setSelectedRegions(nextSelectedRegions);
      setSelectedInterests(nextSelectedInterests);
      setSelectedDuration(nextSelectedDuration);
      if (nextBuilderExactDays !== builderExactDays) setBuilderExactDays(nextBuilderExactDays);
      if (nextBuilderBudgetUsd !== builderBudgetUsd) setBuilderBudgetUsd(nextBuilderBudgetUsd);
      if (desiredStep !== step) setStep(desiredStep);

      const userMsg: ChatMessage = { id: `${Date.now()}-u`, role: "user", text: userText };
      setMessages((current) => [...current, userMsg]);
      setInput("");
      await persistMessageToSession("user", userText, sessionId);

    // Image generation does not require LLM response.
      if (wantsImage && !wantsTour) {
      setAiChatLoading(true);
      try {
        const response = await chatWithAi({
          message: userText,
          lang,
          step: desiredStep,
          selectedRegions: nextSelectedRegions,
          selectedInterests: nextSelectedInterests,
          selectedDuration: nextSelectedDuration,
          selectedDays: nextBuilderExactDays,
          history: [...messages, userMsg].filter(Boolean).map((m) => ({ role: m.role, text: m.text })),
          budgetUsd: nextBuilderBudgetUsd,
          tierId: selectedPackageTierId ?? undefined,
          imageMode: "pexels"
        });

        setMessages((current) => [
          ...current,
          {
            id: `${Date.now()}-a`,
            role: "assistant",
            text: response.reply,
            imageUrls: response.imageUrls
          }
        ]);
        await persistMessageToSession("assistant", response.reply, sessionId);
      } catch (err) {
        const failText =
          lang === "ru" ? "Не удалось создать изображения." : lang === "en" ? "Failed to generate images." : "Rasm yaratilmadi.";
        const displayText = formatAiChatFailure(err, lang, failText);
        setMessages((current) => [
          ...current,
          {
            id: `${Date.now()}-a`,
            role: "assistant",
            text: displayText
          }
        ]);
        await persistMessageToSession("assistant", displayText, sessionId);
      } finally {
        setAiChatLoading(false);
      }
        return;
      }

      const wantsGenerateNow = wantsTour;

    // If not ready yet, still use AI chat (no static scripted replies).
      if (!regionsReady || !interestsReady || !durationReady) {
        if (!aiHasServerKey) {
          const noKeyText =
            lang === "ru"
              ? "AI временно недоступен. Пожалуйста, попробуйте позже."
              : lang === "en"
                ? "AI is temporarily unavailable. Please try again later."
                : "AI hozircha ishlamayapti. Iltimos, keyinroq urinib ko'ring.";
          setMessages((current) => [...current, { id: `${Date.now()}-a`, role: "assistant", text: noKeyText }]);
          await persistMessageToSession("assistant", noKeyText, sessionId);
          return;
        }

        setAiChatLoading(true);
        try {
          const response = await chatWithAi({
            message: userText,
            lang,
            step: desiredStep,
            selectedRegions: nextSelectedRegions,
            selectedInterests: nextSelectedInterests,
            selectedDuration: nextSelectedDuration,
            selectedDays: nextBuilderExactDays,
            history: [...messages, userMsg].filter(Boolean).map((m) => ({ role: m.role, text: m.text })),
            budgetUsd: nextBuilderBudgetUsd,
            tierId: selectedPackageTierId ?? undefined,
            imageMode: "pexels"
          });
          setMessages((current) => [...current, { id: `${Date.now()}-a`, role: "assistant", text: response.reply, imageUrls: response.imageUrls }]);
          await persistMessageToSession("assistant", response.reply, sessionId);
        } catch (err) {
          const failText = formatAiChatFailure(err, lang);
          setMessages((current) => [...current, { id: `${Date.now()}-a`, role: "assistant", text: failText }]);
          await persistMessageToSession("assistant", failText, sessionId);
        } finally {
          setAiChatLoading(false);
        }
        return;
      }

    // We have regions/interests/duration. AI can now generate a tour.
      const budgetReady = typeof nextBuilderBudgetUsd === "number" && nextBuilderBudgetUsd > 0;

      // Detect if user provided any new criteria in this message
      const criteriaChanged =
        extractedRegions.length > 0 ||
        extractedInterests.length > 0 ||
        extractedBudgetUsd !== null ||
        extractedDays !== null ||
        extractedDurationId !== null;

      const generationIntentByText =
        /(generate|create|build|yarat|yasab ber|tuz|tuzib ber|сгенер|созд|собер)/i.test(userText) &&
        /(tour|tur|маршрут|itinerary|plan|trip)/i.test(userText);
      const budgetJustProvided = extractedBudgetUsd !== null && extractedBudgetUsd > 0;

      // Regenerate if: explicit request, or criteria changed when tour already exists
      const shouldGenerate =
        wantsGenerateNow ||
        budgetJustProvided ||
        generationIntentByText ||
        (generatedTourPreview !== null && criteriaChanged);

      if (shouldGenerate) {
      setAiChatLoading(true);
      const genKey = JSON.stringify({
        regions: nextSelectedRegions.slice().sort(),
        interests: nextSelectedInterests.slice().sort(),
        duration: nextSelectedDuration,
        selectedDays: nextBuilderExactDays,
        budgetUsd: nextBuilderBudgetUsd,
        tierId: selectedPackageTierId
      });
      if (lastGeneratedKeyRef.current === genKey && generatedTourPreview) {
        setAiChatLoading(false);
        const alreadyReadyText =
          lang === "ru"
            ? `Тур уже готов — откройте его ниже.`
            : lang === "en"
              ? `Tour is ready — open it below.`
              : `Tur tayyor — pastdan oching.`;
        setMessages((current) => [...current, { id: `${Date.now()}-a`, role: "assistant", text: alreadyReadyText }]);
        await persistMessageToSession("assistant", alreadyReadyText, sessionId);
        return;
      }
      lastGeneratedKeyRef.current = genKey;

      if (!aiHasServerKey) {
        const noKeyText =
          lang === "ru"
            ? "AI временно недоступен. Пожалуйста, попробуйте позже."
            : lang === "en"
              ? "AI is temporarily unavailable. Please try again later."
              : "AI hozircha ishlamayapti. Iltimos, keyinroq urinib ko'ring.";
        setMessages((current) => [...current, { id: `${Date.now()}-a`, role: "assistant", text: noKeyText }]);
        await persistMessageToSession("assistant", noKeyText, sessionId);
        setAiChatLoading(false);
        return;
      }

      setGeneratingTourPreview(true);
      try {
        const joinedNotes = [...builderChatNotes, userText].slice(-14).join("\n");
        const result = await generateTourFromBuilder({
          lang,
          selectedRegions: nextSelectedRegions,
          selectedInterests: nextSelectedInterests,
          selectedDuration: nextSelectedDuration,
          selectedDays: nextBuilderExactDays,
          budgetUsd: nextBuilderBudgetUsd,
          userMessage: joinedNotes,
          history: buildGenerationHistoryPayload(userText),
          tierId: selectedPackageTierId ?? undefined,
          imageMode: "pexels"
        });

        const successText =
          lang === "ru"
            ? `Тур обновлён: ${result.tour.title} · ${result.tour.days} дн. · ~$${result.tour.priceFromUsd}`
            : lang === "en"
              ? `Tour updated: ${result.tour.title} · ${result.tour.days} days · ~$${result.tour.priceFromUsd}`
              : `Tur yangilandi: ${result.tour.title} · ${result.tour.days} kun · ~$${result.tour.priceFromUsd}`;
        setGeneratedTourPreview(result.tour);
        if (result.imageUrls?.length) {
          setGeneratedTourImages(result.imageUrls);
          try {
            window.localStorage.setItem(`tourly_images_${result.tour.slug}`, JSON.stringify(result.imageUrls));
          } catch { /* ignore */ }
        }
        // Save tour slug to backend session so history can navigate directly to tour
        if (sessionId && authToken) {
          try { await updateChatSession(authToken, sessionId, { tourSlug: result.tour.slug }); } catch { /* ignore */ }
        }
        // Refresh session list so sidebar shows updated tourSlug
        if (authToken) {
          listChatSessions(authToken).then(setChatSessions).catch(() => {});
        }
        setMessages((current) => [
          ...current,
          {
            id: `${Date.now()}-a`,
            role: "assistant",
            text: successText,
            tour: {
              slug: result.tour.slug,
              title: result.tour.title
            }
          }
        ]);
        await persistMessageToSession("assistant", successText, sessionId);
      } catch (err) {
        const failTourText =
          lang === "ru"
            ? "Не удалось создать тур. Попробуйте позже."
            : lang === "en"
              ? "Couldn't generate the tour. Try again later."
              : "Tur yaratilmadi. Keyinroq urinib ko‘ring.";
        const displayText = formatAiChatFailure(err, lang, failTourText);
        setMessages((current) => [
          ...current,
          {
            id: `${Date.now()}-a`,
            role: "assistant",
            text: displayText
          }
        ]);
        await persistMessageToSession("assistant", displayText, sessionId);
      } finally {
        setGeneratingTourPreview(false);
        setAiChatLoading(false);
      }
        return;
      }

    // Realistic chat fallback: if user writes extra constraints after setup, AI still replies.
      if (!aiHasServerKey) {
      const localReply =
        lang === "ru"
          ? "Я учёл ваш комментарий. Сейчас AI отключён на сервере, но как только ключ подключат, смогу пересобрать тур."
          : lang === "en"
            ? "Got it. I saved your preference. AI is currently disabled on server, but once key is configured I can regenerate your tour."
            : "Tushundim, istagingizni saqladim. Serverdagi AI kaliti yoqilsa turni darhol yangidan tuzib beraman.";
      setMessages((current) => [...current, { id: `${Date.now()}-a`, role: "assistant", text: localReply }]);
      await persistMessageToSession("assistant", localReply, sessionId);
        return;
      }

      setAiChatLoading(true);
      try {
        const response = await chatWithAi({
          message: userText,
          lang,
          step: desiredStep,
          selectedRegions: nextSelectedRegions,
          selectedInterests: nextSelectedInterests,
          selectedDuration: nextSelectedDuration,
          selectedDays: nextBuilderExactDays,
          history: [...messages, userMsg].filter(Boolean).map((m) => ({ role: m.role, text: m.text })),
          budgetUsd: nextBuilderBudgetUsd,
          tierId: selectedPackageTierId ?? undefined,
          imageMode: "pexels"
        });
        setMessages((current) => [...current, { id: `${Date.now()}-a`, role: "assistant", text: response.reply, imageUrls: response.imageUrls }]);
        await persistMessageToSession("assistant", response.reply, sessionId);
      } catch (err) {
        const failText = formatAiChatFailure(err, lang);
        setMessages((current) => [...current, { id: `${Date.now()}-a`, role: "assistant", text: failText }]);
        await persistMessageToSession("assistant", failText, sessionId);
      } finally {
        setAiChatLoading(false);
      }
    } finally {
      sendInFlightRef.current = false;
    }
  };

  const handlePackageSelect = async (tierId: TierId) => {
    if (generatingTourPreview) return;
    setSelectedPackageTierId(tierId);

    const regionsReady = selectedRegions.length > 0;
    const interestsReady = selectedInterests.length > 0;
    const durationReady = selectedDuration !== null;
    // If budget state wasn't updated yet, infer it from latest chat notes.
    const inferredBudgetFromNotes = (() => {
      if (typeof builderBudgetUsd === "number" && builderBudgetUsd > 0) return builderBudgetUsd;
      const source = [...builderChatNotes, ...messages.filter((m) => m.role === "user").map((m) => m.text)].reverse();
      for (const note of source) {
        const parsed = parseBudgetUsd(note);
        if (typeof parsed === "number" && parsed > 0) return parsed;
      }
      return null;
    })();
    const inferredDaysFromNotes = (() => {
      if (typeof builderExactDays === "number" && builderExactDays > 0) return builderExactDays;
      const source = [...builderChatNotes, ...messages.filter((m) => m.role === "user").map((m) => m.text)].reverse();
      for (const note of source) {
        const parsed = parseDurationDays(note);
        if (typeof parsed === "number" && parsed > 0) return parsed;
      }
      return null;
    })();
    if (
      inferredBudgetFromNotes !== null &&
      (builderBudgetUsd === null || builderBudgetUsd !== inferredBudgetFromNotes)
    ) {
      setBuilderBudgetUsd(inferredBudgetFromNotes);
    }
    if (
      inferredDaysFromNotes !== null &&
      (builderExactDays === null || builderExactDays !== inferredDaysFromNotes)
    ) {
      setBuilderExactDays(inferredDaysFromNotes);
    }
    if (!regionsReady || !interestsReady || !durationReady) {
      const missing =
        !regionsReady
          ? lang === "ru"
            ? "Сначала расскажите, какие города вы хотите посетить — например Самарканд и Бухара."
            : lang === "en"
              ? "First, tell me which cities you'd like to visit — for example Samarkand and Bukhara."
              : "Avval qaysi shaharlarga bormoqchi ekanligingizni ayting — masalan Samarqand va Buxoro."
          : !interestsReady
            ? lang === "ru"
              ? "Что вам больше интересно: история, природа, гастрономия или семейный отдых?"
              : lang === "en"
                ? "What interests you most: history, nature, gastronomy or family travel?"
                : "Sizga nima qiziqroq: tarix, tabiat, gastronomiya yoki oilaviy sayohat?"
            : lang === "ru"
              ? "Сколько дней планируете путешествовать? (3–4 / 5–7 / 8+ дней)"
              : lang === "en"
                ? "How many days are you planning to travel? (3–4 / 5–7 / 8+ days)"
                : "Necha kun sayohat qilmoqchisiz? (3–4 / 5–7 / 8+ kun)";

      setMessages((current) => [
        ...current,
        { id: `${Date.now()}-a`, role: "assistant", text: missing }
      ]);
      await persistMessageToSession("assistant", missing);
      return;
    }

    if (!aiHasServerKey) {
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-a`,
          role: "assistant",
          text:
            lang === "ru"
              ? "AI временно недоступен. Пожалуйста, попробуйте позже."
              : lang === "en"
                ? "AI is temporarily unavailable. Please try again later."
                : "AI hozircha ishlamayapti. Iltimos, keyinroq urinib ko'ring."
        }
      ]);
      return;
    }

    setGeneratingTourPreview(true);
    setAiChatLoading(true);
    try {
      const joinedNotes = builderChatNotes.length > 0 ? builderChatNotes.slice(-12).join("\n") : input;

      const result = await generateTourFromBuilder({
        lang,
        selectedRegions,
        selectedInterests,
        selectedDuration,
        selectedDays: inferredDaysFromNotes,
        budgetUsd: inferredBudgetFromNotes,
        userMessage: joinedNotes,
        history: buildGenerationHistoryPayload(input),
        tierId,
        imageMode: "pexels"
      });

      const tierLabel = tierId === "economy" ? "Start" : tierId === "standard" ? "Standard" : "Premium";
      const successText =
        lang === "ru"
          ? `Отлично! Я собрал для вас тур в пакете ${tierLabel} — открываю маршрут.`
          : lang === "en"
            ? `Great! I've built your ${tierLabel} package tour — opening your itinerary now.`
            : `Ajoyib! ${tierLabel} paket uchun turingiz tayyor — marshrutni ochyapman.`;
      setGeneratedTourPreview(result.tour);
      if (result.imageUrls?.length) {
        setGeneratedTourImages(result.imageUrls);
        try {
          window.localStorage.setItem(`tourly_images_${result.tour.slug}`, JSON.stringify(result.imageUrls));
        } catch { /* ignore */ }
      }
      // Save tour slug to backend session so history can navigate directly to tour
      if (activeSessionId && authToken) {
        try { await updateChatSession(authToken, activeSessionId, { tourSlug: result.tour.slug }); } catch { /* ignore */ }
      }
      // Refresh session list so sidebar reflects the new tourSlug
      if (authToken) {
        listChatSessions(authToken).then(setChatSessions).catch(() => {});
      }
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-a`,
          role: "assistant",
          text: successText,
          tour: {
            slug: result.tour.slug,
            title: result.tour.title
          }
        }
      ]);
      await persistMessageToSession("assistant", successText);

      if (activeSessionId) {
        try { window.localStorage.setItem(LAST_SESSION_KEY, activeSessionId); } catch { /* ignore */ }
      }
    } catch (err) {
      const failTourText =
        lang === "ru" ? "Не удалось создать тур." : lang === "en" ? "Couldn't create tour." : "Tur yaratilmadi.";
      const displayText = formatAiChatFailure(err, lang, failTourText);
      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-a`,
          role: "assistant",
          text: displayText
        }
      ]);
      await persistMessageToSession("assistant", displayText);
    } finally {
      setGeneratingTourPreview(false);
      setAiChatLoading(false);
    }
  };

  const persistMessageToSession = async (
    role: "user" | "assistant",
    text: string,
    sessionIdOverride?: string | null
  ) => {
    const sid = sessionIdOverride || activeSessionId;
    if (!authToken || !sid) return;
    try {
      await appendChatMessage(authToken, sid, role, text);
      const sessions = await listChatSessions(authToken);
      setChatSessions(sessions);
    } catch {
      // ignore persistence errors in UI flow
    }
  };

  const resetBuilderState = () => {
    setView("builder");
    setStep(1);
    setSelectedRegions([]);
    setSelectedInterests([]);
    setSelectedDuration(null);
    setBuilderExactDays(null);
    setBuilderBudgetUsd(null);
    setBuilderChatNotes([]);
    setGeneratedTourPreview(null);
    setGeneratedTourImages([]);
    setGeneratingTourPreview(false);
    setSelectedPackageTierId(null);
    setMessages([{ id: "init-welcome", role: "assistant", text: t.initialAssistant }]);
    setInput("");
  };

  const restoreBuilderStateFromStorage = () => {
    if (typeof window === "undefined") return false;
    try {
      const raw = window.localStorage.getItem(BUILDER_STATE_KEY);
      if (!raw) return false;
      const saved = JSON.parse(raw) as {
        step?: number;
        selectedRegions?: string[];
        selectedInterests?: string[];
        selectedDuration?: string | null;
        selectedDays?: number | null;
        builderBudgetUsd?: number | null;
        messages?: ChatMessage[];
        generatedTourSlug?: string;
        generatedTourPreview?: GeneratedTourPreview;
      };
      if (!saved || typeof saved !== "object") return false;
      if (saved.step && [1, 2, 3, 4].includes(saved.step)) setStep(saved.step as WizardStep);
      if (Array.isArray(saved.selectedRegions)) setSelectedRegions(saved.selectedRegions);
      if (Array.isArray(saved.selectedInterests)) setSelectedInterests(saved.selectedInterests);
      if (saved.selectedDuration !== undefined) setSelectedDuration(saved.selectedDuration ?? null);
      if (typeof saved.selectedDays === "number") setBuilderExactDays(saved.selectedDays);
      if (typeof saved.builderBudgetUsd === "number") setBuilderBudgetUsd(saved.builderBudgetUsd);
      if (Array.isArray(saved.messages) && saved.messages.length > 0) setMessages(saved.messages);
      if (saved.generatedTourPreview) {
        setGeneratedTourPreview(saved.generatedTourPreview);
        const slug = saved.generatedTourPreview.slug;
        if (slug) {
          const imagesRaw = window.localStorage.getItem(`tourly_images_${slug}`);
          if (imagesRaw) {
            const imgs = JSON.parse(imagesRaw) as string[];
            if (Array.isArray(imgs)) setGeneratedTourImages(imgs);
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  };

  const openBuilder = async () => {
    if (!authToken) {
      router.push(`/auth?redirect=${encodeURIComponent("/?builder=new")}`);
      return;
    }
    // Always start fresh when user explicitly clicks "Create New Trip"
    resetBuilderState();
    try {
      const session = await createChatSession(authToken, "New Trip");
      setActiveSessionId(session.id);
      setChatSessions((prev) => [session, ...prev]);
    } catch {
      setActiveSessionId(null);
    }
  };

  const openSessionFromHistory = async (session: ChatSession) => {
    if (!authToken) return;

    resetBuilderState();
    setActiveSessionId(session.id);
    setView("builder");

    // Load chat messages for this session
    try {
      const stored = await listChatMessages(authToken, session.id);
      const mapped: ChatMessage[] = stored.map((m) => ({
        id: m.id,
        role: m.role,
        text: m.text
      }));
      if (mapped.length > 0) setMessages(mapped);
      setStep(4);
    } catch {
      setMessages([]);
      setStep(1);
    }

    // If the session has a generated tour, restore the tour preview card inside the chat
    if (session.tourSlug) {
      try {
        const tour = await getJsonOrNull<{
          slug: string;
          title: string;
          heroImageUrl?: string;
          days: number;
          priceFromUsd: number;
        }>(`/api/tours/${session.tourSlug}`);
        if (tour) {
          setGeneratedTourPreview({
            slug: tour.slug,
            title: tour.title,
            heroImageUrl: tour.heroImageUrl || "",
            days: tour.days,
            priceFromUsd: tour.priceFromUsd
          });
          // Restore cached images if available
          try {
            const raw = window.localStorage.getItem(`tourly_images_${session.tourSlug}`);
            if (raw) {
              const imgs = JSON.parse(raw) as string[];
              if (Array.isArray(imgs)) setGeneratedTourImages(imgs);
            }
          } catch { /* ignore */ }
        }
      } catch { /* ignore, tour preview card just won't show */ }
    }
  };

  const getStepLabel = () => {
    if (step === 1) return t.builderTitle;
    if (step === 2) return t.builderStepInterests;
    if (step === 3) return t.builderStepDuration;
    return t.builderStepReady;
  };

  const getStepText = () => {
    if (step === 1) return t.builderStep1Text;
    if (step === 2) return t.builderStep2Text;
    if (step === 3) return t.builderStep3Text;
    return t.builderStep4Text;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (view !== "builder") return;
    const payload = {
      step,
      selectedRegions,
      selectedInterests,
      selectedDuration,
      selectedDays: builderExactDays,
      builderBudgetUsd,
      messages: messages.slice(-30),
      input,
      generatedTourPreview: generatedTourPreview ?? undefined
    };
    try {
      window.localStorage.setItem(BUILDER_STATE_KEY, JSON.stringify(payload));
    } catch {
      // ignore persistence errors
    }
  }, [view, step, selectedRegions, selectedInterests, selectedDuration, builderExactDays, builderBudgetUsd, messages, input, generatedTourPreview]);

  const renderStepCards = () => {
    if (step === 1) {
      const previewDays = smartPricing.days;

      return (
        <div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {destinations.map((place) => {
              const isSelected = selectedRegions.includes(place.id);
              return (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => toggleRegion(place.id)}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                    isSelected
                      ? "border-[#0d6efd] ring-2 ring-[#0d6efd] shadow-[0_6px_20px_rgba(13,110,253,0.25)]"
                      : "border-[#d7e6ff] hover:border-[#93c5fd]"
                  }`}
                >
                  <div className="overflow-hidden">
                    <img
                      src={place.image}
                      alt={place.city}
                      className="h-24 w-full object-cover transition-transform duration-200 group-hover:scale-105 sm:h-28"
                    />
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-semibold leading-tight text-[#111827]">
                      {destinationCityByLang[lang][place.id] ?? place.city}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] leading-tight text-[#4b5670]">
                      {destinationSpotlightByLang[lang][place.id] ?? place.highlights[0]}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#0d6efd] shadow">
                      <svg
                        className="h-3 w-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <p className="text-sm font-bold text-[#0f172a]">{lang === "ru" ? "Пакеты (предпросмотр)" : lang === "en" ? "Packages (preview)" : "Paketlar (preview)"}</p>
            <p className="mt-1 text-xs text-[#4b5670]">
              {lang === "ru"
                ? "Вы сможете выбрать пакет на шаге 4."
                : lang === "en"
                  ? "You can pick a package on step 4."
                  : "Paketni step 4 da tanlaysiz."}
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
              {tierBase.map((tier) => {
                const days = previewDays;
                const priceEstimate = smartPricing.prices[tier.id];
                const tierName = tier.id === "economy" ? "Start" : tier.id === "standard" ? "Standard" : "Premium";
                return (
                  <div
                    key={tier.id}
                    className="rounded-2xl border border-[#d7e6ff] bg-white p-3 text-left shadow-sm opacity-70"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6b7280]">{tierName}</p>
                    <p className="mt-1 text-sm font-bold text-[#0f172a]">
                      ${priceEstimate} <span className="text-[11px] font-normal text-[#6b7280]">{lang === "ru" ? "оценка" : lang === "en" ? "estimate" : "taxmin"}</span>
                    </p>
                    <p className="mt-1 text-[10px] leading-tight text-[#4b5670]">
                      {days} {lang === "ru" ? "дней" : lang === "en" ? "days" : "kun"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (step === 2) {
      const previewDays = smartPricing.days;

      return (
        <div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {interestOptions.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              const imageSrc = interestImageMap[interest.id];
              return (
                <button
                  key={interest.id}
                  type="button"
                  onClick={() => toggleInterest(interest.id)}
                  className={`flex h-[78px] items-center gap-2 overflow-hidden rounded-2xl border bg-white p-2 text-left shadow-sm transition-all duration-200 ${
                    isSelected
                      ? "border-[#0d6efd] ring-2 ring-[#0d6efd] shadow-[0_6px_20px_rgba(13,110,253,0.25)]"
                      : "border-[#d7e6ff] hover:border-[#93c5fd]"
                  }`}
                >
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <p className="text-[11px] font-semibold leading-tight text-[#111827] sm:text-xs">{interest.label}</p>
                    <p className="mt-0.5 line-clamp-2 text-[9px] leading-tight text-[#4b5670] sm:text-[10px]">
                      {interest.description}
                    </p>
                  </div>
                  {imageSrc && (
                    <div className="h-full w-11 shrink-0 overflow-hidden rounded-xl sm:w-14">
                      <img src={imageSrc} alt={interest.label} className="h-full w-full object-cover" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <p className="text-sm font-bold text-[#0f172a]">{lang === "ru" ? "Пакеты (предпросмотр)" : lang === "en" ? "Packages (preview)" : "Paketlar (preview)"}</p>
            <p className="mt-1 text-xs text-[#4b5670]">
              {lang === "ru" ? "Шаг 4’da пакет будет сгенерирован под ваш бюджет." : lang === "en" ? "On step 4 it will be generated to fit your budget." : "4-qadamda budjetingizga moslab generatsiya qilinadi."}
            </p>

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
              {tierBase.map((tier) => {
                const priceEstimate = smartPricing.prices[tier.id];
                const tierName = tier.id === "economy" ? "Start" : tier.id === "standard" ? "Standard" : "Premium";
                return (
                  <div key={tier.id} className="rounded-2xl border border-[#d7e6ff] bg-white p-3 text-left shadow-sm opacity-70">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6b7280]">{tierName}</p>
                    <p className="mt-1 text-sm font-bold text-[#0f172a]">
                      ${priceEstimate} <span className="text-[11px] font-normal text-[#6b7280]">{lang === "ru" ? "оценка" : lang === "en" ? "estimate" : "taxmin"}</span>
                    </p>
                    <p className="mt-1 text-[10px] leading-tight text-[#4b5670]">
                      {previewDays} {lang === "ru" ? "дней" : lang === "en" ? "days" : "kun"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (step === 3) {
      const previewDays = smartPricing.days;

      return (
        <div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {durationOptions.map((option) => {
              const isSelected = selectedDuration === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectDuration(option.id)}
                  className={`flex flex-col justify-between rounded-2xl border bg-white p-3 text-left shadow-sm transition-all duration-200 ${
                    isSelected
                      ? "border-[#0d6efd] ring-2 ring-[#0d6efd] shadow-[0_6px_20px_rgba(13,110,253,0.25)]"
                      : "border-[#d7e6ff] hover:border-[#93c5fd]"
                  }`}
                >
                  <p className="text-sm font-bold text-[#111827] sm:text-base">{option.label}</p>
                  <p className="mt-1.5 text-[10px] leading-tight text-[#4b5670] sm:text-xs">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-4">
            <p className="text-sm font-bold text-[#0f172a]">{lang === "ru" ? "Пакеты (предпросмотр)" : lang === "en" ? "Packages (preview)" : "Paketlar (preview)"}</p>
            <p className="mt-1 text-xs text-[#4b5670]">
              {lang === "ru"
                ? "Шаг 4: выберите пакет и укажите бюджет — тур будет создан под ваш лимит."
                : lang === "en"
                  ? "Step 4: choose a package and provide budget — the tour will be created within your limit."
                  : "4-qadam: paketni tanlang va budjetni kiriting — tur limitga moslab yaratiladi."}
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
              {tierBase.map((tier) => {
                const priceEstimate = smartPricing.prices[tier.id];
                const tierName = tier.id === "economy" ? "Start" : tier.id === "standard" ? "Standard" : "Premium";
                return (
                  <div key={tier.id} className="rounded-2xl border border-[#d7e6ff] bg-white p-3 text-left shadow-sm opacity-70">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6b7280]">{tierName}</p>
                    <p className="mt-1 text-sm font-bold text-[#0f172a]">
                      ${priceEstimate} <span className="text-[11px] font-normal text-[#6b7280]">{lang === "ru" ? "оценка" : lang === "en" ? "estimate" : "taxmin"}</span>
                    </p>
                    <p className="mt-1 text-[10px] leading-tight text-[#4b5670]">
                      {previewDays} {lang === "ru" ? "дней" : lang === "en" ? "days" : "kun"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        {generatedTourPreview ? (
          <div className="sm:col-span-3">
            <div className="overflow-hidden rounded-2xl border border-[#d8e7ff] bg-white shadow-sm">
              {/* Hero image strip */}
              {generatedTourImages.length > 0 && (
                <div className="flex h-32 gap-0.5 overflow-hidden sm:h-40">
                  {generatedTourImages.slice(0, 5).map((url, i) => (
                    <div
                      key={i}
                      className={`relative overflow-hidden ${i === 0 ? "flex-[2]" : "flex-1"}`}
                    >
                      <img
                        src={url}
                        alt=""
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (!img.dataset.fallbackApplied) {
                            img.dataset.fallbackApplied = "1";
                            img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='300'><rect width='100%' height='100%' fill='%23f3f4f6'/></svg>";
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div className="p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  {!generatedTourImages.length && generatedTourPreview.heroImageUrl && (
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#e5edff] bg-[#f7f9ff]">
                      <img
                        src={generatedTourPreview.heroImageUrl}
                        alt={generatedTourPreview.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6b7280]">
                      {lang === "ru" ? "СОБРАНО ДЛЯ ВАС" : lang === "en" ? "BUILT FOR YOU" : "SIZ UCHUN YIG'ILDI"}
                    </p>
                    <p className="mt-1 text-base font-bold text-[#0f172a] sm:text-lg">{generatedTourPreview.title}</p>
                    <p className="mt-1 text-xs text-[#4b5563]">
                      {generatedTourPreview.days} {lang === "ru" ? "дней" : lang === "en" ? "days" : "kun"}
                      {" • "}
                      {lang === "ru" ? "оценка" : lang === "en" ? "estimate" : "taxmin"}: ~${generatedTourPreview.priceFromUsd}
                    </p>
                    {generatedTourImages.length > 0 && (
                      <p className="mt-1 text-[11px] text-[#6b7280]">
                        {generatedTourImages.length} {lang === "ru" ? "фото" : lang === "en" ? "photos" : "ta rasm"}
                      </p>
                    )}
                  </div>
                </div>

                {/* Small image thumbnails row */}
                {generatedTourImages.length > 5 && (
                  <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
                    {generatedTourImages.slice(5).map((url, i) => (
                      <div key={i} className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-[#e5edff]">
                        <img
                          src={url}
                          alt=""
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const img = e.currentTarget;
                            if (!img.dataset.fallbackApplied) {
                              img.dataset.fallbackApplied = "1";
                              img.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='150'><rect width='100%' height='100%' fill='%23f3f4f6'/></svg>";
                            }
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (activeSessionId) {
                        try { window.localStorage.setItem(LAST_SESSION_KEY, activeSessionId); } catch { /* ignore */ }
                      }
                      router.push(`/tour/${generatedTourPreview.slug}`);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0d6efd] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#1d4ed8]"
                  >
                    {lang === "ru" ? "Открыть тур" : lang === "en" ? "View tour" : "Turni ochish"}
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedTourPreview(null);
                      setGeneratedTourImages([]);
                      lastGeneratedKeyRef.current = null;
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-[#d8e7ff] bg-white px-4 py-2 text-sm font-semibold text-[#4b5563] hover:bg-[#f8faff]"
                  >
                    {lang === "ru" ? "Изменить" : lang === "en" ? "Regenerate" : "Qayta yaratish"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : generatingTourPreview ? (
          <div className="sm:col-span-3 rounded-2xl border border-[#e5edff] bg-white p-5">
            <p className="text-sm font-semibold text-[#0f172a]">
              {lang === "ru" ? "Генерирую тур..." : lang === "en" ? "Generating tour..." : "Tur generatsiya qilinmoqda..."}
            </p>
            <p className="mt-1 text-xs text-[#4b5670]">
              {lang === "ru" ? "Подождите пару секунд." : lang === "en" ? "Please wait a moment." : "Bir necha soniya kuting."}
            </p>
          </div>
        ) : (
          tierBase.map((tier, index) => {
          const price = smartPricing.prices[tier.id];
          const isEconomy = tier.id === "economy";
          const isStandard = tier.id === "standard";
          const isPremium = tier.id === "premium";
          const tierName = isEconomy ? "Start" : isStandard ? "Standard" : "Premium";

          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => void handlePackageSelect(tier.id)}
              disabled={generatingTourPreview}
              className={`group flex flex-col items-start gap-2 rounded-2xl border border-[#d8e7ff] bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#0d6efd] hover:shadow-md sm:p-4 ${
                selectedPackageTierId === tier.id ? "ring-2 ring-[#0d6efd] border-[#0d6efd]" : ""
              } ${generatingTourPreview ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5f7ff] text-[#191970] shadow-sm sm:h-10 sm:w-10`}
                >
                  {isEconomy && (
                    <svg
                      className="h-5 w-5 text-[#22c55e]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path d="M4 17h9" strokeLinecap="round" />
                      <path d="M5 13.5 11 7l3 3-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                  {isStandard && (
                    <svg
                      className="h-5 w-5 text-[#6366f1]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <rect x="5" y="6" width="14" height="3" rx="1.5" />
                      <rect x="5" y="11" width="14" height="3" rx="1.5" />
                      <rect x="5" y="16" width="10" height="3" rx="1.5" />
                    </svg>
                  )}
                  {isPremium && (
                    <svg
                      className="h-5 w-5 text-[#a855f7]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.8}
                    >
                      <path
                        d="M4 10 7 8l3 3 3-5 3 2 2-3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 18h14a1 1 0 0 0 .96-1.28l-1.5-5A1 1 0 0 0 17.5 11h-11a1 1 0 0 0-.96 1.28l1.5 5A1 1 0 0 0 5 18Z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#6b7280]">
                    {tierName}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-[#0f172a]">
                    <span className="text-[11px] font-normal text-[#6b7280]">{t.from}</span>{" "}
                    ${price}
                  </p>
                </div>
              </div>
              <p className="text-[11px] leading-snug text-[#4b5563]">
                {isEconomy &&
                  (lang === "ru"
                    ? "Базовый, но комфортный старт: удобные отели и продуманный маршрут."
                    : lang === "en"
                      ? "Clean, comfortable start level with a smart, budget‑friendly route."
                      : "Toza va qulay Start klass – byudjetga mos, lekin chiroyli marshrut.")}
                {isStandard &&
                  (lang === "ru"
                    ? "Сбалансированный комфорт и насыщенность маршрута для большинства путешественников."
                    : lang === "en"
                      ? "Balanced comfort and pace – the sweet spot for most travelers."
                      : "Balanslangan qulaylik va temp – aksariyat sayohatchilar uchun ideal variant.")}
                {isPremium &&
                  (lang === "ru"
                    ? "Максимум уюта, гибкий темп и продуманная программа с упором на детали."
                    : lang === "en"
                      ? "Maximum comfort, flexible pace and a detail‑rich premium experience."
                      : "Eng yuqori qulaylik, moslashuvchan jadval va detallariga boy Premium tajriba.")}
              </p>
            </button>
          );
          })
        )}
      </div>
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
    <>
      {view === "home" && (
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
            createTripLabel={t.createTrip}
            onCreateTrip={openBuilder}
            onNavClick={handleNavbarNavClick}
            loginLabel={lang === "ru" ? "Войти" : lang === "en" ? "Login" : "Kirish"}
          />

          {/* HERO — original Tourly split layout */}
          <section
            id="hero"
            className="mb-8 overflow-hidden rounded-[30px] border border-[#e2e8f0] bg-white sm:mb-12"
          >
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-10 sm:py-14 lg:flex-row lg:items-center hero-fade-in">
              <div className="flex-[1.15] space-y-5 sm:space-y-6">
                <p className="inline-flex items-center rounded-full bg-[#f1f5f9] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#64748b] ring-1 ring-[#e2e8f0]">
                  <span className="mr-1.5 inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {t.heroKicker}
                </p>
                <div>
                  <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#020617] sm:text-5xl lg:text-[3.3rem]">
                    {t.heroTitle}
                  </h1>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#4b5563] sm:text-base">
                    {t.heroText}
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={openBuilder}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#020617] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-black sm:w-auto sm:px-10 sm:text-[15px]"
                  >
                    <span>{t.createTrip}</span>
                    <AiSparklesIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNavbarNavClick("tours")}
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-[#cbd5e1] bg-white px-7 py-3.5 text-sm font-semibold text-[#0f172a] shadow-sm transition-colors hover:bg-[#f8fafc] sm:w-auto sm:px-9"
                  >
                    {lang === "ru"
                      ? "Посмотреть готовые туры"
                      : lang === "en"
                        ? "Browse ready tours"
                        : "Tayyor turlarni ko‘rish"}
                  </button>
                </div>

                <div className="mt-4 grid gap-3 text-[11px] text-[#6b7280] sm:mt-6 sm:grid-cols-3 sm:text-xs">
                  <div className="rounded-2xl border border-[#e2e8f0] bg-[#f9fafb] px-3 py-2.5">
                    <p className="text-[11px] font-semibold text-[#020617] sm:text-xs">
                      {lang === "ru"
                        ? "6+ регионов по Узбекистану"
                        : lang === "en"
                          ? "6+ regions across Uzbekistan"
                          : "O‘zbekiston bo‘ylab 6+ hudud"}
                    </p>
                    <p className="mt-0.5">
                      {lang === "ru"
                        ? "Классические города и новые направления в одном месте."
                        : lang === "en"
                          ? "Classic cities and new routes in one place."
                          : "Klassik shaharlar va yangi yo‘nalishlar bir joyda."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#e2e8f0] bg-[#f9fafb] px-3 py-2.5">
                    <p className="text-[11px] font-semibold text-[#020617] sm:text-xs">
                      {lang === "ru"
                        ? "AI‑ассистент 24/7"
                        : lang === "en"
                          ? "AI assistant 24/7"
                          : "AI yordamchi 24/7"}
                    </p>
                    <p className="mt-0.5">
                      {lang === "ru"
                        ? "Платформа задаёт вопросы и собирает маршрут под вас."
                        : lang === "en"
                          ? "Answer a few questions — the route adapts to you."
                          : "Bir necha savolga javob bering, marshrut sizga moslashadi."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#e2e8f0] bg-[#f9fafb] px-3 py-2.5">
                    <p className="text-[11px] font-semibold text-[#020617] sm:text-xs">
                      {lang === "ru"
                        ? "Реальные цены и маршруты"
                        : lang === "en"
                          ? "Real budgets & routes"
                          : "Real byudjet va marshrutlar"}
                    </p>
                    <p className="mt-0.5">
                      {lang === "ru"
                        ? "Смотрите примерный бюджет до бронирования."
                        : lang === "en"
                          ? "See a realistic budget before you book."
                          : "Bron qilmasdan oldin taxminiy byudjetni ko‘ring."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-[0.95] hero-fade-in-delayed">
                <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-3xl border border-[#e2e8f0] bg-[#020617] hero-card-float">
                  <img
                    src={heroSlides[carouselIndex]}
                    alt="Uzbekistan travel inspiration"
                    className="h-48 w-full object-cover opacity-80 sm:h-56"
                  />
                  <div className="border-t border-white/10 bg-[#020617] px-4 py-4 text-[11px] text-white/80 sm:px-5 sm:text-xs">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
                      {lang === "ru"
                        ? "Как это работает"
                        : lang === "en"
                          ? "How it works"
                          : "Qanday ishlaydi"}
                    </p>
                    <p className="mt-1.5 text-sm font-semibold text-white sm:text-base">
                      {lang === "ru"
                        ? "Соберите маршрут за пару минут"
                        : lang === "en"
                          ? "Design your route in minutes"
                          : "Marshrutni bir necha daqiqada tuzing"}
                    </p>
                    <p className="mt-1.5">
                      {lang === "ru"
                        ? "Выберите города, интересы и класс — остальное платформа сделает сама."
                        : lang === "en"
                          ? "Pick cities, interests and class — the platform takes care of the rest."
                          : "Shaharlar, qiziqishlar va klassni tanlang, qolganini platforma bajaradi."}
                    </p>
                  </div>
                  <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                    {heroSlides.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCarouselIndex(index)}
                        className={`h-1.5 rounded-full transition-all ${
                          carouselIndex === index ? "w-6 bg-white" : "w-2.5 bg-white/40"
                        }`}
                        aria-label={`Hero slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ABOUT */}
          <section
            id="about"
            className="mb-6 grid gap-6 rounded-[24px] border border-[#d8e7ff] bg-gradient-to-r from-[#eff4ff] via-white to-[#f4f0ff] p-5 shadow-[0_12px_36px_rgba(15,23,42,0.1)] sm:mb-10 sm:rounded-[30px] sm:p-6 lg:grid-cols-2 lg:p-8"
          >
            <div className="flex flex-col justify-center">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#64748b]">
                {t.aboutKicker}
              </p>
              <h2 className="mt-2 text-xl font-bold text-[#0f172a] sm:mt-3 sm:text-3xl">
                {t.aboutTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">{t.aboutBody1}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#4b5563]">{t.aboutBody2}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-[#1e293b]">
                {t.aboutChips.map((chip) => (
                  <span key={chip} className="rounded-full bg-white/80 px-3 py-1.5 shadow-sm">
                    {chip}
                  </span>
                ))}
              </div>
              <div className="mt-4 rounded-2xl border border-[#dbeafe] bg-white/90 p-3 shadow-sm sm:p-4">
                <p className="text-sm font-semibold text-[#0f172a]">{t.aboutOperatorTitle}</p>
                <p className="mt-1 text-xs leading-relaxed text-[#4b5563] sm:text-sm">{t.aboutOperatorText}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {destinations.slice(0, 3).map((place, index) => (
                <div
                  key={place.id}
                  className={`relative overflow-hidden rounded-2xl border border-white/70 shadow-[0_14px_36px_rgba(15,23,42,0.16)] ${
                    index === 0 ? "col-span-2 h-40 sm:h-48" : "h-28 sm:h-36"
                  }`}
                >
                  <img src={place.image} alt={place.city} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                  <div className="absolute bottom-2 left-3">
                    <p className="text-xs font-semibold text-white">
                      {destinationCityByLang[lang][place.id] ?? place.city}
                    </p>
                    <p className="text-[11px] text-white/80">
                      {destinationSpotlightByLang[lang][place.id] ?? place.spotlight}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TAYYOR TURLAR — direct link to details, no AI chat */}
          <section id="tours" className="mb-6 sm:mb-10">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-2xl font-bold text-[#0f172a] sm:text-3xl">{t.readyTours}</h2>
              <p className="mt-1 text-sm text-[#64748b] sm:text-base">{t.readyToursSub}</p>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
              {readyTours.map((tour) => {
                const localized = getTourLocalized(tour, lang);
                const href = `/tour/${tour.id}`;
                return (
                  <Link
                    key={tour.id}
                    href={href}
                    className="group flex flex-col overflow-hidden rounded-[20px] border border-[#e2e8f0] bg-white shadow-[0_4px_20px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c7d2fe] hover:shadow-[0_12px_40px_rgba(25,25,112,0.2)] focus:outline-none focus:ring-2 focus:ring-[#0d6efd] focus:ring-offset-2"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={tour.image}
                        alt={localized.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#191970] backdrop-blur-sm">
                        {tour.days} {t.days}
                      </span>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-base font-bold text-white drop-shadow-md sm:text-lg">
                          {localized.title}
                        </h3>
                        {localized.stops && localized.stops.length > 0 && (
                          <p className="mt-1 text-xs text-white/90 sm:text-sm">
                            {localized.stops.join(" → ")}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col justify-between gap-3 p-4 sm:p-5">
                      <p className="line-clamp-2 text-sm leading-relaxed text-[#64748b]">
                        {localized.focus}
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-lg font-bold text-[#191970] sm:text-xl">
                          <span className="text-sm font-normal text-[#94a3b8]">{t.from}</span>{" "}
                          ${tour.priceFromUsd}
                        </p>
                        <span className="rounded-xl bg-[#191970] px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition-all group-hover:bg-[#12124f] group-hover:shadow-xl">
                          {t.select}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* TRAVEL AGENCIES CAROUSEL */}
          <section className="mb-6 rounded-[24px] border border-[#d8e7ff] bg-white p-4 shadow-[0_12px_36px_rgba(15,23,42,0.1)] sm:mb-10 sm:rounded-[30px] sm:p-6 lg:p-8">
            <div className="mb-5 flex flex-col gap-1.5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#111827] sm:text-2xl">{t.agenciesTitle}</h3>
                <p className="mt-0.5 text-xs text-[#4b5563] sm:text-sm">{t.agenciesSub}</p>
              </div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-[#64748b]">{t.agenciesKicker}</p>
            </div>

            {/* Cards row */}
            <div className="relative">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                {travelAgencies[lang].slice(agencyIdx, agencyIdx + 3).map((agency, i) => {
                  const realIdx = agencyIdx + i;
                  return (
                    <article
                      key={agency.name}
                      className="flex flex-col rounded-2xl border border-[#e5edff] bg-[#f7f9ff] p-4 shadow-[0_8px_22px_rgba(15,23,42,0.07)] transition-shadow hover:shadow-[0_12px_30px_rgba(15,23,42,0.13)] sm:rounded-3xl sm:p-5"
                    >
                      {/* Header */}
                      <div className="mb-3 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#191970] text-white text-base font-bold shadow-sm">
                          {agency.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[#111827]">{agency.name}</p>
                          <p className="mt-0.5 truncate text-xs text-[#64748b]">
                            <svg className="mr-1 inline h-3 w-3 text-[#191970]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                            </svg>
                            {agency.destinations}
                          </p>
                        </div>
                      </div>

                      {/* Specialty */}
                      <p className="flex-1 text-xs leading-relaxed text-[#374151] sm:text-sm">
                        {agency.specialty}
                      </p>

                      {/* Tag */}
                      <div className="mt-3">
                        <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${agencyTagColors[realIdx % agencyTagColors.length]}`}>
                          {agency.tag}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Pagination controls */}
            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAgencyIdx((idx) => Math.max(0, idx - 1))}
                disabled={agencyIdx === 0}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8e7ff] bg-white text-[#191970] shadow-sm transition-all hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Dots */}
              <div className="flex items-center gap-1.5">
                {travelAgencies[lang].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAgencyIdx(Math.min(i, travelAgencies[lang].length - 3))}
                    className={`rounded-full transition-all ${agencyIdx <= i && i < agencyIdx + 3 ? "h-2 w-5 bg-[#191970]" : "h-2 w-2 bg-[#d8e7ff]"}`}
                    aria-label={`Go to agency ${i + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setAgencyIdx((idx) => Math.min(travelAgencies[lang].length - 3, idx + 1))}
                disabled={agencyIdx >= travelAgencies[lang].length - 3}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d8e7ff] bg-white text-[#191970] shadow-sm transition-all hover:bg-[#eff4ff] disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </section>

          {/* WHY TOURLY */}
          <section id="why" className="mb-6 sm:mb-8">
            <h3 className="text-xl font-bold text-[#191970] sm:text-2xl">{t.infoTitle}</h3>
            <p className="mt-1 text-xs text-[#191970] sm:text-sm">{t.infoSub}</p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:mt-4 sm:gap-4">
              {t.infoCards.map((item) => (
                <article
                  key={item.t}
                  className="rounded-2xl border border-white bg-white p-4 shadow-[0_12px_28px_rgba(13,76,161,0.1)] sm:rounded-3xl sm:p-5"
                >
                  <p className="text-base font-semibold text-[#191970]">{item.t}</p>
                  <p className="mt-1.5 text-sm text-[#191970]">{item.d}</p>
                </article>
              ))}
            </div>
          </section>


          {/* FOOTER */}
          <footer className="rounded-[22px] border border-[#10104a] bg-[#191970] p-5 shadow-[0_8px_24px_rgba(6,10,40,0.6)] sm:rounded-[26px] sm:p-6">
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <p className="text-base font-bold text-white sm:text-lg">TOURLY.UZ</p>
                <p className="mt-1.5 text-sm text-white/80">{t.footerAbout}</p>
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
                  className="mt-3 inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#191970] shadow-[0_6px_18px_rgba(15,23,42,0.35)] hover:bg-[#f3f4ff] transition-colors"
                >
                  {t.footerContactCta}
                </Link>
              </div>
            </div>
            <div className="mt-5 border-t border-white/20 pt-4 text-xs text-white/60">
              © 2026 TOURLY.UZ. {t.footerCopy}
            </div>
          </footer>
        </main>
      )}

      {/* BUILDER — ChatGPT-like full-screen layout */}
      {view === "builder" && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "var(--bg, #f0f5ff)" }}>

          {/* TOP HEADER — Progress bar */}
          <div className="shrink-0 border-b border-[#dce8ff] bg-white/95 shadow-sm backdrop-blur-sm">
            <div className="mx-auto max-w-2xl px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => { if (step === 1) setView("home"); else goBack(); }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#eff4ff] text-[#0d6efd] transition-colors hover:bg-[#dce8ff]"
                    aria-label="Back"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("home")}
                    className="min-w-0 text-left"
                  >
                    <p className="truncate text-sm font-bold text-[#191970]">TOURLY.UZ</p>
                    <p className="truncate text-xs text-[#64748b]">{getStepLabel()}</p>
                  </button>
                </div>
                <span className="shrink-0 rounded-full bg-[#eff4ff] px-2.5 py-1 text-xs font-semibold tabular-nums text-[#0d6efd]">
                  {step} / 4
                </span>
              </div>
              <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-[#e2ecff]">
                <div
                  className="h-full rounded-full bg-[#0d6efd] transition-all duration-500 ease-out"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* LEFT SIDEBAR: chat history */}
            <aside className="hidden w-72 shrink-0 border-r border-[#dce8ff] bg-white text-[#0f172a] md:flex md:flex-col">
              <div className="border-b border-[#e5edff] p-3">
                <button
                  type="button"
                  onClick={() => void openBuilder()}
                  className="w-full rounded-xl bg-[#0d6efd] px-3 py-2 text-left text-sm font-semibold text-white hover:bg-[#1d4ed8]"
                >
                  {lang === "ru" ? "Новый тур" : lang === "en" ? "New trip" : "Yangi tur"}
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <p className="mb-2 px-2 text-xs uppercase tracking-[0.18em] text-[#64748b]">
                  {lang === "ru" ? "Бюджет" : lang === "en" ? "Budget" : "Byudjet"}
                </p>
                {!authToken && (
                  <p className="px-2 text-xs text-[#64748b]">
                    {lang === "ru"
                      ? "История доступна после логина."
                      : lang === "en"
                        ? "Login to enable history."
                        : "Tarix uchun login qiling."}
                  </p>
                )}
                {authToken && chatSessionsLoading && (
                  <p className="px-2 text-xs text-[#64748b]">
                    {lang === "ru" ? "Загрузка..." : lang === "en" ? "Loading..." : "Yuklanmoqda..."}
                  </p>
                )}
                {authToken &&
                  !chatSessionsLoading &&
                  chatSessions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => void openSessionFromHistory(s)}
                      className={`mb-1 w-full rounded-lg px-2 py-2 text-left text-sm transition ${
                        activeSessionId === s.id
                          ? "bg-[#eff4ff] text-[#0d6efd]"
                          : "text-[#0f172a] hover:bg-[#f8fbff]"
                      }`}
                      title={s.title}
                    >
                      <span className="flex items-center gap-1.5">
                        {s.tourSlug ? (
                          <svg className="h-3.5 w-3.5 shrink-0 text-[#0d6efd]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                          </svg>
                        ) : (
                          <svg className="h-3.5 w-3.5 shrink-0 text-[#94a3b8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                        )}
                        <span className="truncate">
                          {s.title || (lang === "ru" ? "Новый тур" : lang === "en" ? "New trip" : "Yangi tur")}
                        </span>
                      </span>
                    </button>
                  ))}
              </div>
            </aside>

            {/* RIGHT MAIN PANE */}
            <div className="flex min-w-0 flex-1 flex-col">
              {/* BUILDER CONTENT — scrollable */}
              <div ref={chatScrollRef} className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-2xl space-y-4 px-4 py-5 pb-4">
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-[#e5edff] bg-white px-4 py-3 shadow-sm">
                      <p className="text-base font-bold text-[#0f172a] sm:text-lg">
                        {step === 1 ? t.builderMainTitle : getStepLabel()}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#4b5670] sm:text-sm">{getStepText()}</p>
                    </div>
                    <div>{renderStepCards()}</div>
                    {step === 4 && (
                      <div className="rounded-2xl border border-[#d8e7ff] bg-white p-3 shadow-sm sm:p-4">
                        {/* Layla header */}
                        <div className="mb-3 flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0d6efd] to-[#6366f1]">
                            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 21l3.94-.867A9.952 9.952 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0f172a]">
                              {lang === "ru" ? "AI чат Tourly.UZ" : lang === "en" ? "Tourly.UZ AI Chat" : "Tourly.UZ AI Chat"}
                            </p>
                            <p className="text-[11px] text-[#64748b]">
                              {lang === "ru" ? "Умный помощник по путешествиям" : lang === "en" ? "Smart travel assistant" : "Aqlli sayohat yordamchisi"}
                            </p>
                          </div>
                        </div>

                        {/* Messages */}
                        <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-[#e5edff] bg-[#f8fbff] p-2.5 sm:max-h-80">
                          {messages.map((m) => (
                            <div
                              key={m.id}
                              className={`max-w-[88%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed sm:text-sm ${
                                m.role === "user"
                                  ? "ml-auto rounded-br-sm bg-[#0d6efd] text-white"
                                  : "mr-auto rounded-bl-sm border border-[#e5edff] bg-white text-[#0f172a] shadow-sm"
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{m.text}</p>
                              {m.role === "assistant" && Array.isArray(m.imageUrls) && m.imageUrls.length > 0 && (
                                <div className="mt-2 flex snap-x gap-2 overflow-x-auto pb-1">
                                  {m.imageUrls.map((url, index) => (
                                    <img
                                      key={`${m.id}-img-${index}`}
                                      src={url}
                                      alt={`travel-${index + 1}`}
                                      className="h-20 w-28 shrink-0 snap-start rounded-lg border border-[#e5edff] object-cover"
                                      loading="lazy"
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                          {aiChatLoading && (
                            <div className="mr-auto max-w-[88%] rounded-2xl rounded-bl-sm border border-[#e5edff] bg-white px-3 py-2.5 shadow-sm">
                              <div className="flex items-center gap-1.5">
                                <span className="h-2 w-2 animate-bounce rounded-full bg-[#0d6efd]" style={{ animationDelay: "0ms" }} />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-[#0d6efd]" style={{ animationDelay: "150ms" }} />
                                <span className="h-2 w-2 animate-bounce rounded-full bg-[#0d6efd]" style={{ animationDelay: "300ms" }} />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Input */}
                        <div className="mt-3 flex items-center gap-2">
                          <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                void sendMessage();
                              }
                            }}
                            placeholder={t.askPlaceholder}
                            className="h-11 flex-1 rounded-xl border border-[#d8e7ff] bg-white px-3 text-sm text-[#0f172a] outline-none transition focus:border-[#0d6efd] focus:ring-2 focus:ring-[#0d6efd]/20"
                          />
                          <button
                            type="button"
                            onClick={() => void sendMessage()}
                            disabled={aiChatLoading || input.trim().length === 0}
                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white transition ${
                              aiChatLoading || input.trim().length === 0
                                ? "cursor-not-allowed bg-[#93c5fd]"
                                : "bg-[#0d6efd] hover:bg-[#1d4ed8]"
                            }`}
                            aria-label={t.send}
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* BOTTOM ACTION BAR — sticky */}
              <div className="shrink-0 border-t border-[#dce8ff] bg-white/95 px-4 py-3 backdrop-blur-sm">
                <div className="mx-auto max-w-2xl">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => { if (step === 1) setView("home"); else goBack(); }}
                      className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-[#64748b] transition-colors hover:bg-[#f0f5ff] hover:text-[#0f172a]"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                      {step === 1 ? t.backHome : t.builderBack}
                    </button>
                    {step < 4 ? (
                      <button
                        type="button"
                        onClick={goNext}
                        disabled={!canGoNext()}
                        className={`flex items-center gap-1.5 rounded-xl px-5 py-2 text-sm font-semibold text-white transition-all ${
                          canGoNext()
                            ? "bg-[#0d6efd] shadow-[0_6px_18px_rgba(13,110,253,0.4)] hover:bg-[#1d4ed8]"
                            : "cursor-not-allowed bg-[#93c5fd]"
                        }`}
                      >
                        {t.builderNext}
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (generatedTourPreview) {
                            if (activeSessionId) {
                              try { window.localStorage.setItem(LAST_SESSION_KEY, activeSessionId); } catch { /* ignore */ }
                            }
                            router.push(`/tour/${generatedTourPreview.slug}`);
                          } else {
                            setView("home");
                          }
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-[0_6px_18px_rgba(16,185,129,0.4)] transition-all hover:bg-emerald-600"
                      >
                        {t.builderDone}
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </>
  );
}
