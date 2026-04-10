## TOURLY.UZ Node server – API routes

Port: default `8888`

### Auth

- **POST** `/api/auth/register`  
  Body: `{ email, password, name? }` → returns `{ token, user }`

- **POST** `/api/auth/login`  
  Body: `{ email, password }` → returns `{ token, user }`  
  Admin demo: `admin@tourly.local / admin111`

### Public – tours & reviews

- **GET** `/api/tours`  
  Published turlar ro‘yxati (`isPublished = true`).

- **GET** `/api/tours/:slug`  
  Bitta tur to‘liq detail bilan (summary, logistics, itinerary) va sharhlar:  
  Response: `{ ...tour, tour_details?: { summary, logistics, itinerary }, reviews: Review[] }`

- **POST** `/api/tours/:slug/reviews`  
  Foydalanuvchi saytdan sharh qoldirishi uchun.  
  Body: `{ name?, from?, rating, comment }`  
  201 → yaratilgan review.

### Admin – tours CRUD (JWT, role=ADMIN)

Header: `Authorization: Bearer <token>`

- **GET** `/api/admin/tours` – barcha turlar (draft + published)
- **GET** `/api/admin/tours/:id` – bitta tur to‘liq detail bilan (tour_details)
- **POST** `/api/admin/tours`  
  Body (required: `title`, `slug`, `description`):  
  `{ title, slug, description, heroImageUrl?, days?, priceFromUsd?, isPublished?, tour_details? }`  
  `tour_details`: `{ summary?, logistics?, itinerary? }` — full detail saqlash
- **PUT** `/api/admin/tours/:id` – qisman yangilash (shu jumladan `tour_details`)
- **DELETE** `/api/admin/tours/:id`

### Admin – reviews CRUD

- **GET** `/api/admin/reviews`
- **POST** `/api/admin/reviews`  
  Body: `{ tourId, name?, from?, rating, comment }`
- **PUT** `/api/admin/reviews/:id`
- **DELETE** `/api/admin/reviews/:id`

### Admin – stats

- **GET** `/api/admin/stats`  
  Response: `{ userCount, tourCount, totalRevenue, payments }`

### Health

- **GET** `/health` → `{ ok: true }`

