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
  },
  {
    id: "desert-art",
    title: "Desert & Art Escape",
    days: 4,
    stops: ["Nukus", "Ayaz Qal'a", "Mizdaxxon"],
    focus: "Muzey, cho'l manzarasi va art",
    image:
      "https://i.pinimg.com/1200x/46/7f/9b/467f9b3cf065404129c8dc1ea0479a87.jpg",
    priceFromUsd: 340,
    tags: ["art", "museum", "desert", "nukus", "adventure"]
  },
  {
    id: "weekend-samarkand",
    title: "Samarkand Weekend",
    days: 3,
    stops: ["Toshkent", "Samarqand"],
    focus: "Qisqa va qulay weekend trip",
    image:
      "https://i.pinimg.com/1200x/48/6f/ec/486fec67d267b8bf0eb1bfa1d115594e.jpg",
    priceFromUsd: 250,
    tags: ["weekend", "short", "budget", "samarqand", "train"]
  },
  {
    id: "luxury-cities",
    title: "Luxury Cities",
    days: 7,
    stops: ["Toshkent", "Samarqand", "Buxoro"],
    focus: "Comfort hotel va premium transfer",
    image:
      "https://i.pinimg.com/736x/af/1b/78/af1b78acddb29cec6f1f371fbe39c9d9.jpg",
    priceFromUsd: 890,
    tags: ["luxury", "comfort", "premium", "honeymoon", "flight"]
  }
];

export const transportLabels: Record<TransportType, string> = {
  train: "Poyezd",
  car: "Avto / Transfer",
  flight: "Samolyot"
};
