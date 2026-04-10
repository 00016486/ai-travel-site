/**
 * Extended data for ready tour detail pages: summary, focus, transport, logistics.
 */

export type LangCode = "uz" | "ru" | "en";

export type TransportMode = "train" | "metro" | "taxi" | "car" | "flight";

export type LogisticsSegment = {
  from: Record<LangCode, string>;
  to: Record<LangCode, string>;
  transport: TransportMode;
  duration: string;
  note?: Record<LangCode, string>;
};

export type AttractionCategory =
  | "mosque" | "museum" | "bazaar" | "fortress" | "park"
  | "viewpoint" | "palace" | "mausoleum" | "caravanserai"
  | "restaurant" | "other";

export type DayAttraction = {
  name: Record<LangCode, string>;
  description: Record<LangCode, string>;
  tip?: Record<LangCode, string>;
  category?: AttractionCategory;
  image?: string;
};

export type DiningType = "breakfast" | "lunch" | "dinner" | "cafe" | "street_food";

export type DayDining = {
  name: Record<LangCode, string>;
  type: DiningType;
  description: Record<LangCode, string>;
  priceRange: "$" | "$$" | "$$$";
};

export type DayPlan = {
  dayNumber: number;
  city: Record<LangCode, string>;
  overview?: Record<LangCode, string>;
  images: string[];
  dining?: DayDining[];
  attractions: DayAttraction[];
};

export type TourDetail = {
  id: string;
  title: Record<LangCode, string>;
  subtitle: Record<LangCode, string>;
  route: Record<LangCode, string>;
  focus: Record<LangCode, string>;
  transport: Record<LangCode, string>;
  spotlight: Record<LangCode, string>;
  logistics: LogisticsSegment[];
  itinerary?: DayPlan[];
};

const transportModeLabel: Record<TransportMode, Record<LangCode, string>> = {
  train: { uz: "Poyezd", ru: "Поезд", en: "Train" },
  metro: { uz: "Metro", ru: "Метро", en: "Metro" },
  taxi: { uz: "Taksi", ru: "Такси", en: "Taxi" },
  car: { uz: "Avto", ru: "Авто", en: "Car" },
  flight: { uz: "Samolyot", ru: "Самолёт", en: "Flight" }
};

export const tourDetailData: Record<string, TourDetail> = {
  "classic-heritage": {
    id: "classic-heritage",
    title: {
      uz: "Klassik Meros",
      ru: "Классическое Наследие",
      en: "Classic Heritage"
    },
    subtitle: {
      uz: "6 kunlik tarixiy marshrut: Toshkent, Samarqand va Buxoro.",
      ru: "6 дней по историческим городам: Ташкент, Самарканд и Бухара.",
      en: "6-day heritage route: Tashkent, Samarkand and Bukhara."
    },
    route: {
      uz: "Toshkent → Samarqand → Buxoro",
      ru: "Ташкент → Самарканд → Бухара",
      en: "Tashkent → Samarkand → Bukhara"
    },
    focus: {
      uz: "Tarixiy obidalar, mahalliy osh va oila/juftlik uchun qulay temp.",
      ru: "История, гастрономия и комфортный темп для пар и семейных поездок.",
      en: "History, gastronomy and a comfortable pace for couples and family trips."
    },
    transport: {
      uz: "Qulay poyezdlar va avto, 3-4★ mehmonxonalar nonushta bilan.",
      ru: "Комфортные авто / поезда, отели 3-4★ с завтраками и поздним check-out.",
      en: "Comfortable cars / trains, 3-4★ hotels with breakfasts and late check-out."
    },
    spotlight: {
      uz: "Balanslangan qulaylik",
      ru: "Оптимальный баланс комфорта",
      en: "Optimal balance of comfort"
    },
    logistics: [
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
      }
    ],
    itinerary: [
      {
        dayNumber: 1,
        city: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" },
        images: [
          "/classic-heritage-tashkent.png",
          "https://static2.realting.com/uploads/images/a5a/02d87cdb6e7a1d5e07612b667cd81.webp",
          "https://uzbekistan.travel/storage/app/media/places/chorsu_bazaar/chorsu-bazar-tashkent.jpg"
        ],
        attractions: [
          {
            name: { uz: "Hazrati Imom", ru: "Хазрати Имам", en: "Hazrati Imam" },
            description: {
              uz: "Toshkentdagi diniy markaz, Xast-Imom majmuasi XVI asrda asos solingan. Usmon Qurʼon muzeyi, kafedral masjid, madrasalar va maqbara. Islom madaniyati va sharq meʼmorchiligi.",
              ru: "Религиозный центр Ташкента, комплекс Хаст-Имам, основан в XVI веке. Музей Корана Усмана, соборная мечеть, медресе и мавзолеи. Исламская культура и восточная архитектура.",
              en: "Tashkent religious center, Khast-Imam complex founded in the 16th century. Uthman Quran Museum, cathedral mosque, madrasahs and mausoleums. Islamic culture and oriental architecture."
            }
          },
          {
            name: { uz: "Chorsu bozori", ru: "Базар Чорсу", en: "Chorsu Bazaar" },
            description: {
              uz: "Toshkentning eng katta va rang-barang bozori gumbaz ostida. Mahalliy mevalar, sabzavotlar, non, ziravorlar, hunarmandchilik va milliy taomlar. Gastro va suvenirlar uchun ideal joy.",
              ru: "Крупнейший и красочный базар Ташкента под купольным зданием. Фрукты, овощи, лепёшки, специи, сувениры, национальные блюда. Идеальное место для гастрономии и покупки сувениров.",
              en: "Largest and most colorful bazaar in Tashkent under a domed building. Local fruits, vegetables, flatbreads, spices, handicrafts and national dishes. Ideal for gastronomy and souvenirs."
            }
          },
          {
            name: { uz: "Amir Temur xiyoboni", ru: "Сквер Амира Темура", en: "Amir Temur Square" },
            description: {
              uz: "Toshkentning markaziy maydoni — sarkarda haykali va fontanlar. Mehmonxonalar, teatrlar va muzeylar bilan oʻralgan. Shahar jamoat hayotining yurak markazi.",
              ru: "Центральная площадь Ташкента с монументом полководца и фонтанами. Гостиницы, театры и музеи вокруг. Сердце общественной жизни города.",
              en: "Central square of Tashkent with a monument to the commander and fountains. Surrounded by hotels, theaters and museums. The heart of the city's public life."
            }
          }
        ]
      },
      {
        dayNumber: 2,
        city: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" },
        images: [
          "/classic-heritage-tashkent-2.png",
          "/silk-road-tashkent-3.png"
        ],
        attractions: [
          {
            name: { uz: "Mustaqillik maydoni", ru: "Площадь Независимости", en: "Independence Square" },
            description: {
              uz: "O'zbekiston mustaqilligini ifoda etuvchi yirik majmua. Monumental haykallar, favvora va yashil bog'lar.",
              ru: "Монументальный комплекс, символизирующий независимость Узбекистана. Памятники, фонтаны и зелёные зоны.",
              en: "Monumental complex symbolizing Uzbekistan's independence. Sculptures, fountains and green spaces."
            }
          },
          {
            name: { uz: "O'zbekiston davlat san'at muzeyi", ru: "Государственный музей искусств", en: "State Museum of Arts" },
            description: {
              uz: "Zamonaviy va antik san'at to'plami. O'zbek va sharq rasm san'ati, arxeologik topilmalar.",
              ru: "Коллекция современного и античного искусства. Узбекская и восточная живопись, археологические находки.",
              en: "Collection of modern and antique art. Uzbek and oriental painting, archaeological finds."
            }
          }
        ]
      },
      {
        dayNumber: 3,
        city: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" },
        images: [
          "https://i.pinimg.com/1200x/d1/29/82/d129822a2e000bff87a006931a840348.jpg",
          "/silk-road-samarkand-4.png",
          "https://www.afisha.uz/uploads/media/2024/07/ae465a3e0772936e23b895d095087de8.jpg"
        ],
        attractions: [
          {
            name: { uz: "Registon maydoni", ru: "Регистан", en: "Registan Square" },
            description: {
              uz: "Samarqandning ramzi — ulug'vor madrasalar majmuasi: Ulug'bek, Sher-Dor va Tilla-Qori. UNESCO obyekti.",
              ru: "Символ Самарканда — ансамбль величественных медресе: Улугбека, Шер-Дор и Тилля-Кари. Объект ЮНЕСКО.",
              en: "Symbol of Samarkand — ensemble of majestic madrasahs: Ulugbek, Sher-Dor and Tilla-Kori. UNESCO site."
            }
          },
          {
            name: { uz: "Shohi Zinda", ru: "Шахи-Зинда", en: "Shahi Zinda" },
            description: {
              uz: "Qadimiy nekropol — fir'avn mozaikali majmua. Amir Temur avlodlarining maqbaralari.",
              ru: "Древний некрополь — уникальный комплекс с бирюзовой мозаикой. Мавзолеи династии Тимура.",
              en: "Ancient necropolis — unique complex with turquoise mosaic. Mausoleums of the Timur dynasty."
            }
          }
        ]
      },
      {
        dayNumber: 4,
        city: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" },
        images: [
          "/classic-heritage-samarkand-2.png",
          "https://i.pinimg.com/1200x/48/6f/ec/486fec67d267b8bf0eb1bfa1d115594e.jpg"
        ],
        attractions: [
          {
            name: { uz: "Bibixonim masjidi", ru: "Биби-Ханым", en: "Bibi Khanum Mosque" },
            description: {
              uz: "Ulug' masjid — XV asrda qurilgan. Osiyoning eng buyuk masjidlaridan biri, Amir Temur buyrug'i bilan.",
              ru: "Грандиозная мечеть XV века. Одна из крупнейших мечетей Азии, построенная по приказу Тимура.",
              en: "Grand mosque of the 15th century. One of the largest mosques in Asia, built by Timur's order."
            }
          },
          {
            name: { uz: "Ulug'bek rasadxonasi", ru: "Обсерватория Улугбека", en: "Ulugbek Observatory" },
            description: {
              uz: "XV asr astronomiya markazi. Ulug'bek yulduzlar jadvalini yaratgan joy.",
              ru: "Астрономический центр XV века. Место создания звёздного каталога Улугбека.",
              en: "15th century astronomy center. Where Ulugbek created his star catalog."
            }
          }
        ]
      },
      {
        dayNumber: 5,
        city: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" },
        images: [
          "https://resize.tripster.ru/CBS3Bc3dCbADxN3slKwDXgsG_mM=/fit-in/1220x600/filters:no_upscale()/https://cdn.tripster.ru/photos/9f1014c3-7604-42ff-a49c-555ddb6f2048.jpg?width=1200&height=630",
          "https://uzbekistan.travel/storage/app/media/places/poi_kalon_minaret/kalon-minaret-bukhara.jpg",
          "https://uzbekistan.travel/storage/app/media/places/labi_hauz/labi-hauz-bukhara.jpg"
        ],
        attractions: [
          {
            name: { uz: "Minorai Kalon", ru: "Минораи Калон", en: "Kalyan Minaret" },
            description: {
              uz: "47 metrlik minora — Buxoroning ramzi. XII asrda qurilgan, «cho'qqi» laqabli.",
              ru: "47-метровая башня — символ Бухары. Построена в XII веке, «Башня смерти».",
              en: "47-meter tower — symbol of Bukhara. Built in the 12th century, «Tower of death»."
            }
          },
          {
            name: { uz: "Ark qal'asi", ru: "Арк-цитадель", en: "Ark Citadel" },
            description: {
              uz: "Qadimiy qal'a — Buxoro amirlarining qarorgohi. Muzey va eski devorlar.",
              ru: "Древняя цитадель — резиденция бухарских эмиров. Музей и древние стены.",
              en: "Ancient citadel — residence of the emirs of Bukhara. Museum and ancient walls."
            }
          }
        ]
      },
      {
        dayNumber: 6,
        city: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" },
        images: [
          "https://uzbekistan.travel/storage/app/media/places/labi_hauz/labi-hauz-bukhara.jpg",
          "https://uzbekistan.travel/storage/app/media/places/samanid_mausoleum/samanid-mausoleum-bukhara.jpg"
        ],
        attractions: [
          {
            name: { uz: "Labi Hovuz", ru: "Ляби-Хауз", en: "Lyabi Hauz" },
            description: {
              uz: "Hovuz atrofidagi tarixiy maydon — kafe, madrasalar va ko'cha hunarmandchiligi.",
              ru: "Историческая площадь у пруда — кафе, медресе и уличные ремёсла.",
              en: "Historic square around a pond — cafés, madrasahs and street crafts."
            }
          },
          {
            name: { uz: "Samanidlar maqbarasi", ru: "Мавзолей Саманидов", en: "Samanid Mausoleum" },
            description: {
              uz: "IX–X asr meʼmorchiligi durdoni. G'ishtdan ishlangan naqshli qurilma.",
              ru: "Жемчужина архитектуры IX–X веков. Уникальная кирпичная кладка.",
              en: "Architectural gem of the 9th–10th centuries. Unique brickwork pattern."
            }
          }
        ]
      }
    ]
  },
  "silk-road": {
    id: "silk-road",
    title: {
      uz: "Ipak Yo'li Premium",
      ru: "Шелковый Путь Премиум",
      en: "Silk Road Premium"
    },
    subtitle: {
      uz: "8 kunlik to'liq Ipak yo'li marshruti: Toshkent, Samarqand, Buxoro, Xiva.",
      ru: "8 дней полного маршрута Шелкового пути: Ташкент, Самарканд, Бухара, Хива.",
      en: "8-day full Silk Road route: Tashkent, Samarkand, Bukhara, Khiva."
    },
    route: {
      uz: "Toshkent → Samarqand → Buxoro → Xiva",
      ru: "Ташкент → Самарканд → Бухара → Хива",
      en: "Tashkent → Samarkand → Bukhara → Khiva"
    },
    focus: {
      uz: "Tarix, mahalliy gastronomiya, oilaviy/juftlik sayohati uchun balanslangan dastur.",
      ru: "История, гастрономия и комфортный темп для пар и семейных поездок.",
      en: "History, gastronomy and a comfortable pace for couples and family trips."
    },
    transport: {
      uz: "Qulay poyezdlar va avto, 3-4★ mehmonxonalar nonushta bilan.",
      ru: "Комфортные авто / поезда, отели 3-4★ с завтраками и поздним check-out.",
      en: "Comfortable cars / trains, 3-4★ hotels with breakfasts and late check-out."
    },
    spotlight: {
      uz: "Balanslangan qulaylik",
      ru: "Оптимальный баланс комфорта",
      en: "Optimal balance of comfort"
    },
    logistics: [
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
        from: { uz: "Urgench aeroporti", ru: "Аэропорт Ургенча", en: "Urgench airport" },
        to: { uz: "Xiva", ru: "Хива", en: "Khiva" },
        transport: "taxi",
        duration: "30 min",
        note: { uz: "Urgench aeroporti → Xiva", ru: "Аэропорт Ургенча → Хива", en: "Urgench airport → Khiva" }
      }
    ],
    itinerary: [
      { dayNumber: 1, city: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" }, images: ["/classic-heritage-tashkent-2.png", "https://static2.realting.com/uploads/images/a5a/02d87cdb6e7a1d5e07612b667cd81.webp"], attractions: [{ name: { uz: "Hazrati Imom", ru: "Хазрати Имам", en: "Hazrati Imam" }, description: { uz: "Toshkentdagi diniy markaz.", ru: "Религиозный центр Ташкента.", en: "Tashkent religious center." } }, { name: { uz: "Chorsu bozori", ru: "Базар Чорсу", en: "Chorsu Bazaar" }, description: { uz: "Eng katta bozor.", ru: "Крупнейший базар.", en: "Largest bazaar." } }] },
      { dayNumber: 2, city: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" }, images: ["https://uzbekistan.travel/storage/app/media/places/amir_temur_square/thumb_133_1140_0_0_0_auto.jpg"], attractions: [{ name: { uz: "Amir Temur xiyoboni", ru: "Сквер Амира Темура", en: "Amir Temur Square" }, description: { uz: "Markaziy maydon.", ru: "Центральная площадь.", en: "Central square." } }] },
      { dayNumber: 3, city: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" }, images: ["/culture-craft-samarkand-4.png"], attractions: [{ name: { uz: "Registon", ru: "Регистан", en: "Registan" }, description: { uz: "Samarqand ramzi.", ru: "Символ Самарканда.", en: "Symbol of Samarkand." } }] },
      { dayNumber: 4, city: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" }, images: ["/silk-road-samarkand-5.png"], attractions: [{ name: { uz: "Shohi Zinda", ru: "Шахи-Зинда", en: "Shahi Zinda" }, description: { uz: "Nekropol majmuasi.", ru: "Некрополь.", en: "Necropolis complex." } }] },
      { dayNumber: 5, city: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" }, images: ["https://uzbekistan.travel/storage/app/media/places/poi_kalon_minaret/kalon-minaret-bukhara.jpg"], attractions: [{ name: { uz: "Minorai Kalon", ru: "Минораи Калон", en: "Kalyan Minaret" }, description: { uz: "Buxoro ramzi.", ru: "Символ Бухары.", en: "Symbol of Bukhara." } }] },
      { dayNumber: 6, city: { uz: "Buxoro", ru: "Бухара", en: "Bukhara" }, images: ["https://uzbekistan.travel/storage/app/media/places/labi_hauz/labi-hauz-bukhara.jpg"], attractions: [{ name: { uz: "Labi Hovuz", ru: "Ляби-Хауз", en: "Lyabi Hauz" }, description: { uz: "Tarixiy maydon.", ru: "Историческая площадь.", en: "Historic square." } }] },
      { dayNumber: 7, city: { uz: "Xiva", ru: "Хива", en: "Khiva" }, images: ["https://uzbekistan.travel/storage/app/uploads/public/671/9e1/9fc/thumb_3975_1140_0_0_0_auto.jpg"], attractions: [{ name: { uz: "Ichan-Qal'a", ru: "Ичан-Кала", en: "Ichan Kala" }, description: { uz: "Qadimiy shahar-muzey.", ru: "Древний город-музей.", en: "Ancient museum city." } }] },
      { dayNumber: 8, city: { uz: "Xiva", ru: "Хива", en: "Khiva" }, images: ["https://uzbekistan.travel/storage/app/media/places/kalta_minor/kalta-minor-khiva.jpg"], attractions: [{ name: { uz: "Kalta Minor", ru: "Калта Минор", en: "Kalta Minor" }, description: { uz: "Balandsiz minora.", ru: "Голубая минарета.", en: "Short minaret." } }] }
    ]
  },
  "culture-craft": {
    id: "culture-craft",
    title: {
      uz: "Madaniyat va Hunarmandchilik",
      ru: "Культура и Ремесла",
      en: "Culture & Craft"
    },
    subtitle: {
      uz: "5 kunlik hunarmandchilik va gastronomiya: Farg'ona vodiysi va Samarqand.",
      ru: "5 дней ремесла и гастрономии: Ферганская долина и Самарканд.",
      en: "5-day craft and gastronomy: Fergana Valley and Samarkand."
    },
    route: {
      uz: "Toshkent → Farg'ona vodiysi → Samarqand",
      ru: "Ташкент → Ферганская долина → Самарканд",
      en: "Tashkent → Fergana Valley → Samarkand"
    },
    focus: {
      uz: "Kulolchilik, atlas, mahalliy taomlar va hunarmandlik ustaxonalari.",
      ru: "Керамика, атлас, местная кухня и ремесленные мастерские.",
      en: "Ceramics, silk, local cuisine and craft workshops."
    },
    transport: {
      uz: "Qulay poyezdlar va avto, 3-4★ mehmonxonalar nonushta bilan.",
      ru: "Комфортные авто / поезда, отели 3-4★ с завтраками и поздним check-out.",
      en: "Comfortable cars / trains, 3-4★ hotels with breakfasts and late check-out."
    },
    spotlight: {
      uz: "Hunarmandchilik va gastronomiya",
      ru: "Ремесла и гастрономия",
      en: "Craft & gastronomy"
    },
    logistics: [
      {
        from: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" },
        to: { uz: "Farg'ona vodiysi", ru: "Ферганская долина", en: "Fergana Valley" },
        transport: "car",
        duration: "4 soat",
        note: { uz: "Tog'li yo'l orqali", ru: "Через горный перевал", en: "Via mountain pass" }
      },
      {
        from: { uz: "Farg'ona", ru: "Фергана", en: "Fergana" },
        to: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" },
        transport: "car",
        duration: "5 soat",
        note: { uz: "Transfer yoki poyezd", ru: "Трансфер или поезд", en: "Transfer or train" }
      }
    ],
    itinerary: [
      { dayNumber: 1, city: { uz: "Toshkent", ru: "Ташкент", en: "Tashkent" }, images: ["https://static2.realting.com/uploads/images/a5a/02d87cdb6e7a1d5e07612b667cd81.webp"], attractions: [{ name: { uz: "Hazrati Imom", ru: "Хазрати Имам", en: "Hazrati Imam" }, description: { uz: "Diniy markaz.", ru: "Религиозный центр.", en: "Religious center." } }] },
      { dayNumber: 2, city: { uz: "Farg'ona vodiysi", ru: "Ферганская долина", en: "Fergana Valley" }, images: ["https://i.pinimg.com/1200x/52/48/19/5248199fd953810fe631d0e5dd0e1148.jpg"], attractions: [{ name: { uz: "Rishton kulolchilik", ru: "Риштанская керамика", en: "Rishtan ceramics" }, description: { uz: "Kulolchilik ustaxonalari.", ru: "Керамические мастерские.", en: "Ceramics workshops." } }] },
      { dayNumber: 3, city: { uz: "Farg'ona vodiysi", ru: "Ферганская долина", en: "Fergana Valley" }, images: ["https://www.advantour.com/img/kyrgyzstan/nature/kyrgyzstan-nature-gorges-canyons-valleys-fergana-valley.jpg"], attractions: [{ name: { uz: "Marg'ilon atlas", ru: "Маргиланский атлас", en: "Margilan silk" }, description: { uz: "Atlas fabrikasi.", ru: "Шёлковая фабрика.", en: "Silk factory." } }] },
      { dayNumber: 4, city: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" }, images: ["https://uzbekistan.travel/storage/app/media/places/registan_square/registan-samarkand.jpg"], attractions: [{ name: { uz: "Registon", ru: "Регистан", en: "Registan" }, description: { uz: "Me'moriy majmua.", ru: "Архитектурный ансамбль.", en: "Architectural complex." } }] },
      { dayNumber: 5, city: { uz: "Samarqand", ru: "Самарканд", en: "Samarkand" }, images: ["/culture-craft-samarkand-5.png"], attractions: [{ name: { uz: "Shohi Zinda", ru: "Шахи-Зинда", en: "Shahi Zinda" }, description: { uz: "Nekropol majmuasi.", ru: "Некрополь.", en: "Necropolis." } }] }
    ]
  }
};

export { transportModeLabel };
