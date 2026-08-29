# SOL & STONE — California Luxury Real Estate
## Sayt Konsepsiyası və Texniki Spesifikasiya

**Hədəf bazar:** California, upper-mid luxury ($800K–$5M+ seqment)

---

## 1. BREND KONSEPSİYASI

### 1.1 Ad
**SOL & STONE** — "Sol" (işıq/günəş, ispan dilində "günəş"), "Stone" (daş, arxitektura, sabitlik).

### 1.2 Loqo konsepsiyası
- **Wordmark:** incə serif hərflərlə "SOL & STONE", böyük hərflərlə, geniş letter-spacing.
- **Simvol:** çox nazik horizon-arc (üfüq xətti üzərində yarım günəş), qızılı-taupe (#B9975B).
- **Variantlar:** tam loqo, monoqram (S&S), favicon üçün yalnız simvol.

### 1.3 Tagline
**"Find a place worth calling home."**

---

## 2. TEXNOLOGİYA ARXİTEKTURASI

| Qat | Texnologiya |
|---|---|
| Frontend | Next.js (App Router) |
| Styling | Tailwind CSS + design tokens |
| Backend (core) | Django + Django REST Framework |
| Backend (AI/servislər) | FastAPI |
| DB | PostgreSQL + PostGIS (demo: SQLite + float lat/lng) |
| Media Storage | Cloudflare R2 / AWS S3 + CDN (demo: lokal) |
| 360° Tour | Pannellum.js |
| Auth (Phase 2) | Django auth + JWT |
| Email/SMS (Phase 2) | SendGrid/Postmark + Twilio |
| i18n | next-intl (EN/ES) |
| Xəritə | Mapbox GL JS |

**Niyə Django + FastAPI birlikdə?** Django admin paneli və property/agent/lead data modeli üçün ideal.
FastAPI isə AI Valuation Assistant kimi asinxron servislər üçün ayrı mikroservisdir. İki backend eyni bazanı paylaşa bilər.

---

## 3. SAYT XƏRİTƏSİ

```
Home
├── Buy (search) → Property Detail (/listings/[slug])
├── Sell → AI Home Valuation (chat flow)
├── Rent → Property Detail
├── Communities → [Community]
├── Agents → [Agent Profile]
├── Insights → [Article]
├── About
├── Contact
└── EN / ES dil toggle
```

---

## 4. QLOBAL ELEMENTLƏR

### 4.1 Navbar
Sticky, transparent → solid scroll-da. Loqo (sol), naviqasiya, "Schedule a Consultation" CTA + EN/ES switcher.

### 4.2 Live Market Ticker Bar
- Navbar ilə Hero arasında, ~28–32px hündürlük.
- Fon: muted sage (`#3A4A3E`), mətn krem (`#F5F1EA`).
- 14px sans-serif, geniş letter-spacing, marquee.
- Nümunə: `Median CA Home Price: $875,400 (+2.1% YoY) • 30-Yr Fixed Rate: 6.42% • Avg. Days on Market: 34 • Price/Sq Ft: $612`
- Data: FRED API (makro) + MLS/IDX (lokal). Demo: manual/statik JSON, FastAPI `/ai/ticker` ilə verilir.

### 4.3 Footer
Naviqasiya, Equal Housing Opportunity loqo + statement (bölmə 18), sosial media, əlaqə, Privacy/Terms.

---

## 5. BÖLMƏ-BÖLMƏ UX/UI SPESİFİKASİYASI

### 5.1 HOME
Hero (image | video, admin seçimli `hero_type`), headline + search bar (şəhər/ZIP + Buy/Rent toggle).
Aşağıda: Buy / Sell / Explore Communities 3 kart, Featured Properties, New Listings, Testimonials,
Meet an Agent teaser, Insights teaser.

### 5.2 BUY — Axtarış Səhifəsi
Split-view: filter paneli + property cards list + interaktiv Mapbox xəritə (marker ↔ card highlight).

**MVP filterlər:** Şəhər/Neighborhood/ZIP · Buy/Rent toggle · Price range · Bedrooms/Bathrooms ·
Property type (Single Family, Condo, Townhome) · Square footage (min-max).

**Phase 2 filterlər:** Lot size · Year built · HOA fee · Waterfront/Pool/Garage · School district ·
Open House / New statusu.

**Property Card:** böyük foto, status badge (New / Open House / Price Reduced / Pending / Coming Soon),
Save/Favorite (MVP: localStorage), qiymət, ünvan, beds/baths/sqft.

### 5.3 PROPERTY DETAIL
1. Böyük image gallery + "View all photos" lightbox.
2. **"View in 360°" düyməsi** — tam-ekran panorama viewer, otaqlar arası hotspot naviqasiyası (Pannellum.js).
3. Fact-lar: qiymət, beds, baths, sqft, lot size, year built.
4. Description, Highlights, Features/Amenities.
5. Location/Map + Neighborhood info.
6. CTA: Schedule a Showing (→ lead), Ask a Question, Save Property.

### 5.4 SELL — AI Home Valuation Assistant
Söhbət axını:
1. İstifadəçi ünvan/zona daxil edir.
2. AI ardıcıl sual verir: sqft → lot size → məhəllə/zona → təmir səviyyəsi
   (Original / Updated / Fully Renovated / Luxury Renovation).
3. FastAPI `/ai/valuation` → sadə estimation modeli (məhəllə orta $/sqft × sahə × təmir əmsalı)
   → qiymət aralığı. **"Preliminary estimate, not an appraisal"** qeydi mütləqdir.
4. Sonra "Get your exact valuation from an agent" CTA → lead forması → agentə göndərilir.

Aşağıda: satış prosesi (Valuation → Preparation → Marketing → Negotiation → Closing) + xidmətlər.

### 5.5 RENT
Buy ilə eyni struktur, `listing_type: rent` filtri ilə.

### 5.6 COMMUNITIES
Hər community: cinematic hero, market data (median price, active listings, median DOM),
homes grid + map, lifestyle guide. Demo: 1-2 nümunə tam hazır.

### 5.7 AGENTS
Editorial grid → portret, ad, title, specialties, neighborhoods, statistika.
Agent profile: bio, listings, reviews, contact form.

### 5.8 INSIGHTS
Editorial magazine hissi — Market Reports, Neighborhood Guides, Buying/Selling Guides.

### 5.9 SAVED SEARCH + ALERTS (Phase 2)
İstifadəçi hesabı + email/SMS infrastrukturu tələb edir. MVP-də yalnız localStorage "Save Property".

---

## 6. ADMIN PANEL (Django)
- Property idarəetməsi: şəkillər, 360° panorama upload, status badge, bütün fact-lar, description (EN/ES).
- Agent idarəetməsi: profil, portret, statistika, listing assignment.
- Lead/Inquiry: showing/question/valuation/contact vahid inbox, status (New/Contacted/Closed).
- Community & Insights CMS: EN/ES paralel məzmun.
- Market Ticker: manual override.

---

## 7. ÇOXDİLLİ DƏSTƏK (EN/ES)
- next-intl route-based i18n (`/en/...`, `/es/...`).
- Bütün statik UI mətnləri tərcümə fayllarında.
- Property/Insight/Community mətnləri: admin paneldə hər dil üçün ayrı sahə.
- Avtomatik brauzer dili aşkarlanması + manual switcher.

---

## 8. SEO STRATEGİYASI
- SSR/ISR hər property/community/agent/insight səhifəsi üçün.
- Structured data: `RealEstateListing`, `Article`, `LocalBusiness`.
- URL: `/listings/[city]-[address]-[id]`, `/communities/[slug]`, `/insights/[slug]`.
- Lokal SEO: hər Community səhifəsi öz açar sözləri ilə.
- Sitemap.xml + robots.txt avtomatik generasiya.
- Core Web Vitals: Next/Image, lazy-loading, CDN.

---

## 9. DİZAYN SİSTEMİ

### 9.1 Rəng palitrası
| Ad | Hex | İstifadə |
|---|---|---|
| Warm White | `#FAF7F2` | Fon |
| Soft Black | `#1C1B19` | Mətn/başlıq |
| Stone | `#A9A29A` | İkinci dərəcəli elementlər |
| Taupe | `#8C7F72` | Border, ayırıcılar |
| Muted Gold | `#B9975B` | Yalnız CTA/vurğu |
| Ticker Green | `#3A4A3E` | Yalnız market ticker fon |

### 9.2 Tipografiya
- Başlıqlar (serif): Cormorant Garamond / Fraunces.
- UI/body (sans): Inter / General Sans.

### 9.3 Animasiya
Image reveal on scroll, hover scale 1.02–1.03 (300–400ms ease), fade page transitions,
sticky CTA, marker transitions, count-up statistika. Heç bir animasiya 500ms-dən uzun olmamalı.

### 9.4 Responsive
Mobile-first, desktop-da tam editorial hero. Mobil-də video hero → poster image.

---

## 10. LAYİHƏ STRUKTURU (MONOREPO)

```
sol-stone/
├── frontend/              # Next.js (App Router)
│   ├── app/[locale]/{page,buy,rent,sell,listings/[slug],communities,agents,insights,about,contact}
│   ├── components/
│   ├── lib/
│   └── messages/ (en.json, es.json)
├── backend-django/        # Core CRUD + Admin
│   ├── properties/ agents/ leads/ communities/ insights/ config/
├── backend-fastapi/       # AI servisləri
│   ├── main.py valuation/ ticker/
└── docker-compose.yml
```

---

## 11. DATA MODELLƏRİ (Django)

| Model | Əsas sahələr |
|---|---|
| **Property** | slug, title, address, city, state, zip, latitude, longitude, price, listing_type (buy/rent), status (new/open_house/price_reduced/pending/coming_soon/sold), property_type, bedrooms, bathrooms, square_footage, lot_size, year_built, description_en, description_es, features (JSON), agent (FK), community (FK), created_at, updated_at |
| **PropertyImage** | property (FK), image_url, order, caption |
| **PropertyTour** | property (FK), room_name, panorama_url, hotspots (JSON) |
| **Agent** | name, slug, title, photo_url, bio_en, bio_es, phone, email, specialties, career_stats (JSON), neighborhoods |
| **Lead** | type (showing/question/valuation/contact), property (FK), agent (FK), name, email, phone, message, preferred_date, preferred_time, valuation_data (JSON), status (new/contacted/closed), created_at |
| **Community** | slug, name, hero_image, market_data (JSON), description_en, description_es, lifestyle_info |
| **Article** | slug, title_en, title_es, body_en, body_es, cover_image, category, published_at |

---

## 12. API CONTRACT

**Django REST Framework:**
```
GET  /api/properties/?city=&price_min=&price_max=&beds=&baths=&type=&listing_type=
GET  /api/properties/{slug}/
GET  /api/agents/            GET /api/agents/{slug}/
GET  /api/communities/       GET /api/communities/{slug}/
GET  /api/insights/          GET /api/insights/{slug}/
POST /api/leads/
```

**FastAPI:**
```
POST /ai/valuation   body: { sqft, zone, condition }  → { estimated_min, estimated_max, currency }
GET  /ai/ticker      → { items: [ { label, value } ] }
```

**Təhlükəsizlik:** `POST /api/leads/` və `POST /ai/valuation` — rate limiting + honeypot sahə mütləqdir.

---

## 13. NEXT.JS KOMPONENT İNVENTARI
`Navbar` · `MarketTicker` · `Footer` · `Hero` · `SearchBar` · `FilterPanel` · `PropertyCard` ·
`PropertyGrid` · `MapView` · `Gallery` · `TourViewer` · `StatusBadge` · `ScheduleShowingForm` ·
`AskQuestionForm` · `ValuationChatWidget` · `AgentCard` · `CommunityCard` · `TestimonialCarousel` ·
`LanguageSwitcher`

---

## 14. DEMO SEED DATA (5 property)

*Uydurma (fictional) demo məlumatlardır, real ünvan deyil.*

| # | Ünvan | Şəhər | Qiymət | Beds/Baths | Sq Ft | Status |
|---|---|---|---|---|---|---|
| 1 | 1428 Blue Jay Way | Beverly Hills, CA | $4,250,000 | 5 / 6 | 6,200 | New |
| 2 | 210 Ocean Front Walk | Malibu, CA | $6,900,000 | 4 / 4.5 | 4,800 | Coming Soon |
| 3 | 742 Hillcrest Avenue | Los Angeles, CA | $1,895,000 | 4 / 3.5 | 2,840 | Open House |
| 4 | 88 Pacific Terrace | Santa Monica, CA | $3,150,000 | 3 / 3 | 2,950 | Price Reduced |
| 5 | 15 Rolling Hills Drive | Calabasas, CA | $2,475,000 | 5 / 4 | 4,100 | Pending |

360° tur: ən azı 1 property-də (#1) tam funksional.

---

## 15. ENVIRONMENT VARIABLES

```
DATABASE_URL=
DJANGO_SECRET_KEY=
DJANGO_ALLOWED_HOSTS=
MAPBOX_ACCESS_TOKEN=
AWS_S3_ACCESS_KEY=
AWS_S3_SECRET_KEY=
AWS_S3_BUCKET=
FRED_API_KEY=
NEXT_PUBLIC_DJANGO_API_URL=
NEXT_PUBLIC_FASTAPI_URL=
# Phase 2:
SENDGRID_API_KEY=
TWILIO_SID=
TWILIO_TOKEN=
```

Açarlar uydurulmamalıdır — real dəyərləri sahibi təmin edir.

---

## 16. DEPLOYMENT
| Komponent | Platform |
|---|---|
| Next.js | Vercel |
| Django + FastAPI | Railway / Render (Docker) |
| PostgreSQL (+PostGIS) | Railway / Supabase |
| Media | Cloudflare R2 |

---

## 17. FAZALAR / ROADMAP

| Faza | Əhatə |
|---|---|
| **Demo** | Home, Buy search, property detail (360° + AI valuation), Sell, 1 Community, Agents, Contact. EN tam, ES struktur hazır. |
| **Phase 1** | Real inventar, bütün Community səhifələri, Insights aktiv, tam EN/ES, SEO, canlı ticker. |
| **Phase 2** | İstifadəçi hesabı, Saved Search + alerts, AI NL search, review inteqrasiyaları, niş filterlər. |

---

## 18. UYĞUNLUQ (COMPLIANCE)
- **Fair Housing Act / Equal Housing Opportunity** loqo və statement footer-də mütləqdir.
- **ADA/accessibility** — kontrast, klaviatura naviqasiyası, alt-text.
- **TCPA** uyğun consent checkbox-ları SMS/email üçün.

---

## 19. DEMO-DA "İŞLƏK" NƏ DEMƏKDİR? (Mock vs Real)

İstifadəçi interfeysində **hər funksiya tam işlək olmalıdır** — müştəri hər düyməni klikləyə bilməlidir.

| Funksiya | Demo (indi) | Production (Phase 1+) |
|---|---|---|
| AI Valuation | Sadə formula — real ədəd qaytarır | ML / MLS comp-larına əsaslanan model |
| Live Market Ticker | Statik/manual JSON, UI tam animasiyalı | FRED API + MLS avtomatik |
| 360° Tour | Ən azı 1 property-də tam işlək | Bütün property-lərdə |
| Lead formaları | Bazaya real yazılır, admin paneldə görünür | + email/SMS bildirişi |
| Şəkil saxlama | Lokal fayl sistemi | R2/S3 + CDN |
| Auth / Saved Search | Yoxdur | Phase 2 |
| Email/SMS | Console-a log | Real inteqrasiya |

### Demo — Qəbul Meyarları (Definition of Done)
- [ ] Home: hero, search bar, 3 CTA kartı, Featured Properties (5 nümunə)
- [ ] Buy search: filter + list + map işləyir, nəticələr seed data-dan gəlir
- [ ] Property Detail: gallery + "View in 360°" (ən azı 1-də işlək) + Schedule Showing → lead
- [ ] Sell: AI Valuation chat axını, təxmini qiymət, lead forması
- [ ] Agents: minimum 1-2 profil
- [ ] Admin paneldən yeni property əlavə etmək mümkündür
- [ ] Mobil və desktop responsive
- [ ] EN tam, ES struktur hazır

---

## 20. FAZA-FAZA İŞ SIRASI

1. Repo skeleti + Django + models + admin
2. Seed data script
3. DRF serializers/views/endpoints
4. FastAPI valuation servisi
5. Next.js skeleti + qlobal komponentlər
6. Home page
7. Buy search
8. Property Detail
9. Sell + AI Valuation
10. Agents, Communities, Contact
11. Mobile responsive pass + deploy
