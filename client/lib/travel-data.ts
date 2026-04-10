export type TransportType = "train" | "car" | "flight";

export type Destination = {
  id: string;
  city: string;
  region: string;
  spotlight: string;
  image: string;
  highlights: string[];
  dailyBudgetUsd: number;
  tourPriceFromUsd: number;
  recommendedDays: number;
  transport: TransportType[];
  hotelRangeUsd: [number, number];
  coords: {
    lat: number;
    lng: number;
  };
};

export const destinations: Destination[] = [
  {
    id: "samarkand",
    city: "Samarqand",
    region: "Samarqand viloyati",
    spotlight: "Registon va tarixiy madrasalar",
    image:
      "https://www.afisha.uz/uploads/media/2024/07/ae465a3e0772936e23b895d095087de8.jpg",
    highlights: ["Registon maydoni", "Shohi Zinda", "Bibixonim masjidi"],
    dailyBudgetUsd: 55,
    tourPriceFromUsd: 220,
    recommendedDays: 2,
    transport: ["train", "car", "flight"],
    hotelRangeUsd: [35, 120],
    coords: { lat: 39.6542, lng: 66.9597 }
  },
  {
    id: "bukhara",
    city: "Buxoro",
    region: "Buxoro viloyati",
    spotlight: "Qadimiy ark va Labi Hovuz",
    image:
      "https://resize.tripster.ru/CBS3Bc3dCbADxN3slKwDXgsG_mM=/fit-in/1220x600/filters:no_upscale()/https://cdn.tripster.ru/photos/9f1014c3-7604-42ff-a49c-555ddb6f2048.jpg?width=1200&height=630",
    highlights: ["Ark qal'asi", "Minorai Kalon", "Labi Hovuz"],
    dailyBudgetUsd: 50,
    tourPriceFromUsd: 190,
    recommendedDays: 2,
    transport: ["train", "car", "flight"],
    hotelRangeUsd: [30, 110],
    coords: { lat: 39.767, lng: 64.455 }
  },
  {
    id: "khiva",
    city: "Xiva",
    region: "Xorazm viloyati",
    spotlight: "Ichan-Qal'a ochiq osmon muzeyi",
    image:
      "https://uzbekistan.travel/storage/app/uploads/public/671/9e1/9fc/thumb_3975_1140_0_0_0_auto.jpg",
    highlights: ["Ichan-Qal'a", "Kalta Minor", "Tosh Hovli saroyi"],
    dailyBudgetUsd: 45,
    tourPriceFromUsd: 180,
    recommendedDays: 2,
    transport: ["flight", "car"],
    hotelRangeUsd: [28, 95],
    coords: { lat: 41.3783, lng: 60.3639 }
  },
  {
    id: "tashkent",
    city: "Toshkent",
    region: "Toshkent shahri",
    spotlight: "Modern va milliy uyg'unlik",
    image:
      "https://static2.realting.com/uploads/images/a5a/02d87cdb6e7a1d5e07612b667cd81.webp",
    highlights: ["Hazrati Imom", "Amir Temur xiyoboni", "Chorsu bozori"],
    dailyBudgetUsd: 60,
    tourPriceFromUsd: 240,
    recommendedDays: 2,
    transport: ["train", "car", "flight"],
    hotelRangeUsd: [40, 150],
    coords: { lat: 41.2995, lng: 69.2401 }
  },
  {
    id: "fergana",
    city: "Farg'ona vodiysi",
    region: "Farg'ona viloyati",
    spotlight: "Hunarmandchilik va tabiat",
    image:
      "https://www.advantour.com/img/kyrgyzstan/nature/kyrgyzstan-nature-gorges-canyons-valleys-fergana-valley.jpg",
    highlights: ["Rishton kulolchilik", "Qo'qon xon saroyi", "Marg'ilon atlas markazi"],
    dailyBudgetUsd: 42,
    tourPriceFromUsd: 160,
    recommendedDays: 2,
    transport: ["train", "car", "flight"],
    hotelRangeUsd: [25, 85],
    coords: { lat: 40.3864, lng: 71.7843 }
  },
  {
    id: "nukus",
    city: "Nukus",
    region: "Qoraqalpog'iston",
    spotlight: "Savitskiy muzeyi va cho'l manzarasi",
    image:
      "https://img.pac.ru/resorts/213093/425824/big/EE70323A7F000101595B4A84F8AF417E.jpg",
    highlights: ["Savitskiy muzeyi", "Mizdaxxon", "Ayaz Qal'a"],
    dailyBudgetUsd: 48,
    tourPriceFromUsd: 175,
    recommendedDays: 2,
    transport: ["flight", "car"],
    hotelRangeUsd: [30, 90],
    coords: { lat: 42.4602, lng: 59.6166 }
  },
  {
    id: "andijan",
    city: "Andijon",
    region: "Andijon viloyati",
    spotlight: "Farg'ona vodiysining sharqiy darvozasi",
    image:
      "https://discovery-russia.ru/photos/big/Nigora_Rose.jpg",
    highlights: ["Bobur nomidagi bog'", "Andijon bozorlari", "Mahalliy hunarmandlar"],
    dailyBudgetUsd: 40,
    tourPriceFromUsd: 150,
    recommendedDays: 2,
    transport: ["train", "car", "flight"],
    hotelRangeUsd: [25, 80],
    coords: { lat: 40.7821, lng: 72.3442 }
  },
  {
    id: "namangan",
    city: "Namangan",
    region: "Namangan viloyati",
    spotlight: "Bog'lar va qadimiy madaniyat",
    image:
      "https://i.ytimg.com/vi/ugUpNCYXbMs/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBolCFCwXNPjKe-qTuK1JnzbLPOWQ",
    highlights: ["Bog'lar shahri", "Chust pichog'i", "Ko'hna madaniyat izlari"],
    dailyBudgetUsd: 38,
    tourPriceFromUsd: 145,
    recommendedDays: 2,
    transport: ["car", "train"],
    hotelRangeUsd: [22, 75],
    coords: { lat: 41.0011, lng: 71.6687 }
  },
  {
    id: "jizzakh",
    city: "Jizzax",
    region: "Jizzax viloyati",
    spotlight: "Tog' etaklari va ekoturizm",
    image:
      "https://www.advantour.com/img/uzbekistan/images/jizzakh.jpg",
    highlights: ["Zomin milliy bog'i", "Tog'li manzaralar", "Ekotur marshrutlar"],
    dailyBudgetUsd: 36,
    tourPriceFromUsd: 140,
    recommendedDays: 2,
    transport: ["car", "train"],
    hotelRangeUsd: [20, 70],
    coords: { lat: 40.1158, lng: 67.8422 }
  },
  {
    id: "navoi",
    city: "Navoiy",
    region: "Navoiy viloyati",
    spotlight: "Cho'l landshaftlari va tarix",
    image:
      "https://uzbekistan.travel/storage/app/media/Otabek/asosiydagi%20rasmlar/Navoiy/cropped-images/IMG_20221027_143255_335-0-0-0-0-1728897390.jpg",
    highlights: ["Qizilqum cho'li", "Raboti Malik karvonsaroyi", "Sarmishsoy petrogliflari"],
    dailyBudgetUsd: 44,
    tourPriceFromUsd: 170,
    recommendedDays: 2,
    transport: ["car", "train", "flight"],
    hotelRangeUsd: [28, 95],
    coords: { lat: 40.1039, lng: 65.3683 }
  },
  {
    id: "karshi",
    city: "Qarshi",
    region: "Qashqadaryo viloyati",
    spotlight: "Shahrisabz va tog' etaklari",
    image:
      "https://uzbekistan.travel/storage/app/media/fed/karshi/cropped-images/ancientbridgeinqarshiuzbekistan-0-0-0-0-1583313931.jpg",
    highlights: ["Shahrisabz me'morchiligi", "Tog'li qishloqlar", "Mahalliy oshxona"],
    dailyBudgetUsd: 43,
    tourPriceFromUsd: 165,
    recommendedDays: 2,
    transport: ["car", "train"],
    hotelRangeUsd: [26, 90],
    coords: { lat: 38.8606, lng: 65.7891 }
  },
  {
    id: "termez",
    city: "Termiz",
    region: "Surxondaryo viloyati",
    spotlight: "Budda merosi va chegaradosh landshaftlar",
    image:
      "https://uzbekistan.travel/storage/app/uploads/public/5e6/b54/bc7/thumb_486_1140_0_0_0_auto.jpg",
    highlights: ["Fayoztepa", "Jarkurgan minorasi", "Amudaryo bo'yi manzaralari"],
    dailyBudgetUsd: 46,
    tourPriceFromUsd: 180,
    recommendedDays: 2,
    transport: ["flight", "car"],
    hotelRangeUsd: [30, 95],
    coords: { lat: 37.2242, lng: 67.2783 }
  }
];

export const readyTours = [
  {
    id: "classic-heritage",
    title: "Classic Heritage",
    days: 6,
    stops: ["Toshkent", "Samarqand", "Buxoro"],
    focus: "Tarixiy obidalar",
    image:
      "https://i.pinimg.com/1200x/d1/29/82/d129822a2e000bff87a006931a840348.jpg",
    priceFromUsd: 460,
    tags: ["history", "madaniyat", "registan", "buxoro", "samarqand", "family"]
  },
  {
    id: "silk-road",
    title: "Silk Road Premium",
    days: 8,
    stops: ["Toshkent", "Samarqand", "Buxoro", "Xiva"],
    focus: "To'liq Ipak yo'li yo'nalishi",
    image:
      "https://i.pinimg.com/736x/99/03/2c/99032c67ee35c657d5b8b01a07e9203e.jpg",
    priceFromUsd: 680,
    tags: ["history", "silk road", "xiva", "premium", "couple", "photography"]
  },
  {
    id: "culture-craft",
    title: "Culture & Craft",
    days: 5,
    stops: ["Toshkent", "Farg'ona vodiysi", "Samarqand"],
    focus: "Hunarmandchilik va gastronomiya",
    image:
      "https://i.pinimg.com/1200x/52/48/19/5248199fd953810fe631d0e5dd0e1148.jpg",
    priceFromUsd: 390,
    tags: ["craft", "food", "family", "fergana", "local", "culture"]
  }
];

export const transportLabels: Record<TransportType, string> = {
  train: "Poyezd",
  car: "Avto / Transfer",
  flight: "Samolyot"
};

export type TravelAgency = {
  name: string;
  destinations: string[];
  specialty: Record<"uz" | "ru" | "en", string>;
  tag: Record<"uz" | "ru" | "en", string>;
  phone: string;
  email: string;
  website: string;
  address: Record<"uz" | "ru" | "en", string>;
};

export const travelAgencies: TravelAgency[] = [
  {
    name: "Samarkand Silk Road Tours",
    destinations: ["samarkand", "bukhara", "buxoro", "khiva", "xiva", "tashkent", "toshkent"],
    specialty: {
      uz: "Buyuk Ipak Yo'li bo'ylab tarixi shaharlar va UNESCO obidalari",
      ru: "Исторические города Великого шёлкового пути и объекты ЮНЕСКО",
      en: "Historic cities along the Great Silk Road and UNESCO World Heritage sites"
    },
    tag: { uz: "Tarixiy turlar", ru: "Исторические туры", en: "Historical tours" },
    phone: "+998 91 234-56-78",
    email: "info@silkroadtours.uz",
    website: "www.silkroadtours.uz",
    address: {
      uz: "Samarqand, Registon ko'chasi 14",
      ru: "Самарканд, ул. Регистан 14",
      en: "Samarkand, Registon Street 14"
    }
  },
  {
    name: "Fergana Crafts & Culture",
    destinations: ["fergana", "farg'ona", "andijan", "andijon", "namangan", "rishtan", "margilan", "marg'ilon"],
    specialty: {
      uz: "Ipak to'qimachilik, kulolchilik va milliy hunarmandchilik ustaxonalari",
      ru: "Шелкоткачество, гончарное дело и ремесленные мастерские",
      en: "Silk weaving, pottery crafts and traditional artisan workshops"
    },
    tag: { uz: "Madaniy turlar", ru: "Культурные туры", en: "Cultural tours" },
    phone: "+998 73 245-67-89",
    email: "hello@ferganacraft.uz",
    website: "www.ferganacraft.uz",
    address: {
      uz: "Farg'ona, Mustaqillik ko'chasi 22",
      ru: "Фергана, ул. Мустакиллик 22",
      en: "Fergana, Mustaqillik Street 22"
    }
  },
  {
    name: "Nature Adventures UZ",
    destinations: ["chimgan", "chimyon", "nurata", "zarafshan", "zarafshon", "jizzakh", "jizzax"],
    specialty: {
      uz: "Tog' yurishlari, eko-turlar va yovvoyi tabiat sayohatlari",
      ru: "Горные походы, экотуры и путешествия к дикой природе",
      en: "Mountain hikes, eco-tours and wildlife nature expeditions"
    },
    tag: { uz: "Eko-turlar", ru: "Экотуры", en: "Eco-tours" },
    phone: "+998 90 312-45-67",
    email: "adventure@natureuz.com",
    website: "www.natureuz.com",
    address: {
      uz: "Toshkent, Amir Temur xiyoboni 5",
      ru: "Ташкент, бульвар Амира Темура 5",
      en: "Tashkent, Amir Temur Boulevard 5"
    }
  },
  {
    name: "Tashkent City Tours",
    destinations: ["tashkent", "toshkent"],
    specialty: {
      uz: "Toshkent metropoliteni, zamonaviy arxitektura va shahar ko'rgazmalari",
      ru: "Метро Ташкента, современная архитектура и городские выставки",
      en: "Tashkent metro art, modern architecture and urban exhibitions"
    },
    tag: { uz: "Shahar turlari", ru: "Городские туры", en: "City tours" },
    phone: "+998 71 256-78-90",
    email: "tours@tashkentcity.uz",
    website: "www.tashkentcity.uz",
    address: {
      uz: "Toshkent, Shayxontohur ko'chasi 8",
      ru: "Ташкент, ул. Шайхантахур 8",
      en: "Tashkent, Shaykhantakhur Street 8"
    }
  },
  {
    name: "Desert & Steppe Safari",
    destinations: ["kyzylkum", "qizilqum", "ayaz qala", "ayoz qal'a", "moynaq", "mo'ynoq", "nukus"],
    specialty: {
      uz: "Qizilqum cho'li ekspeditsiyalari va karvon yo'llari",
      ru: "Экспедиции по пустыне Кызылкум и маршруты по древним караванным путям",
      en: "Kyzylkum desert expeditions and ancient caravan route trails"
    },
    tag: { uz: "Safari turlar", ru: "Сафари-туры", en: "Safari tours" },
    phone: "+998 61 222-34-56",
    email: "safari@desertsteppe.uz",
    website: "www.desertsteppe.uz",
    address: {
      uz: "Nukus, Karakalpakstan ko'chasi 3",
      ru: "Нукус, ул. Каракалпакстан 3",
      en: "Nukus, Karakalpakstan Street 3"
    }
  },
  {
    name: "Luxury Uzbek Journey",
    destinations: ["samarkand", "bukhara", "buxoro", "tashkent", "toshkent", "khiva", "xiva", "fergana", "farg'ona"],
    specialty: {
      uz: "5★ mehmonxonalar, shaxsiy gid va VIP individual marshrutlar",
      ru: "Отели 5★, личный гид и VIP-индивидуальные маршруты",
      en: "5-star hotels, personal guide and exclusive VIP private itineraries"
    },
    tag: { uz: "Lyuks turlar", ru: "Люкс-туры", en: "Luxury tours" },
    phone: "+998 71 280-00-01",
    email: "vip@luxuryuzbekjourney.com",
    website: "www.luxuryuzbekjourney.com",
    address: {
      uz: "Toshkent, Afrosiyob ko'chasi 1, penthouse qavat",
      ru: "Ташкент, ул. Афрасиаб 1, пентхаус",
      en: "Tashkent, Afrosiab Street 1, Penthouse Floor"
    }
  },
  {
    name: "Family Fun Uzbekistan",
    destinations: ["samarkand", "tashkent", "toshkent", "bukhara", "buxoro"],
    specialty: {
      uz: "Bolalar uchun qulay aktivliklar va oilaviy dam olish marshrutlari",
      ru: "Активности для детей и семейный отдых в комфортном темпе",
      en: "Kid-friendly activities and family vacations at a comfortable pace"
    },
    tag: { uz: "Oilaviy turlar", ru: "Семейные туры", en: "Family tours" },
    phone: "+998 90 345-67-89",
    email: "family@funuzbekistan.uz",
    website: "www.funuzbekistan.uz",
    address: {
      uz: "Toshkent, Yunusobod 4-mavze 12",
      ru: "Ташкент, Юнусабад, 4-квартал 12",
      en: "Tashkent, Yunusabad District 4, Building 12"
    }
  },
  {
    name: "Gastro & Bazaar Tours",
    destinations: ["tashkent", "toshkent", "samarkand", "fergana", "farg'ona"],
    specialty: {
      uz: "Plov to'ylari, ziravorlar bozori va milliy taomlar ustaxonalari",
      ru: "Плов-дворы, базары пряностей и мастер-классы по национальным блюдам",
      en: "Plov houses, spice bazaars and national cuisine cooking workshops"
    },
    tag: { uz: "Gastro turlar", ru: "Гастро-туры", en: "Gastro tours" },
    phone: "+998 93 456-78-90",
    email: "taste@gastrobazaar.uz",
    website: "www.gastrobazaar.uz",
    address: {
      uz: "Toshkent, Chorsu bozori yonida, Navoi ko'chasi 40",
      ru: "Ташкент, рядом с Чорсу, ул. Навои 40",
      en: "Tashkent, near Chorsu Bazaar, Navoi Street 40"
    }
  },
  {
    name: "Termez Heritage Tours",
    destinations: ["termez", "shahrisabz", "karshi", "qarshi", "surxondaryo"],
    specialty: {
      uz: "Janubiy O'zbekiston: buddist yodgorliklar va qadimiy shaharlar",
      ru: "Южный Узбекистан: буддийские памятники и древние города",
      en: "Southern Uzbekistan: Buddhist monuments and ancient historic cities"
    },
    tag: { uz: "Arxeologik turlar", ru: "Археологические туры", en: "Archaeological tours" },
    phone: "+998 76 223-45-67",
    email: "heritage@termezheritage.uz",
    website: "www.termezheritage.uz",
    address: {
      uz: "Termiz, Alpomish ko'chasi 7",
      ru: "Термез, ул. Алпомыш 7",
      en: "Termez, Alpomish Street 7"
    }
  },
  {
    name: "Aral Sea Expeditions",
    destinations: ["moynaq", "mo'ynoq", "aral", "nukus", "karakalpakstan", "qoraqalpog'iston"],
    specialty: {
      uz: "Orol dengizi sayohati, kemalar qabristoni va Qoraqalpog'iston",
      ru: "Поездка к Аральскому морю, кладбищу кораблей и Каракалпакстан",
      en: "Journey to the Aral Sea, ship graveyard and Karakalpakstan region"
    },
    tag: { uz: "Ekspeditsiya turlar", ru: "Экспедиционные туры", en: "Expedition tours" },
    phone: "+998 61 234-56-78",
    email: "explore@aralsea.uz",
    website: "www.aralsea.uz",
    address: {
      uz: "Nukus, Beruniy ko'chasi 11",
      ru: "Нукус, ул. Беруни 11",
      en: "Nukus, Beruni Street 11"
    }
  }
];
