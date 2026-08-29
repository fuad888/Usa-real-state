# Sol & Stone — Layihə Qaydaları

Tam spesifikasiya: `docs/spec.md` (yalnız aydın olmayan məqamlarda oxu, hər dəfə tam oxuma)

## Stack
- `frontend/` = Next.js App Router + Tailwind v4 + next-intl (en/es)
- `backend-django/` = Property/Agent/Lead/Community/Insight CRUD + admin + DRF
- `backend-fastapi/` = `/ai/valuation`, `/ai/ticker`

## Qaydalar
- Yalnız tapşırıqda göstərilən qovluq/faylları redaktə et, əlaqəsiz faylları toxunma
- Yeni dependency əlavə etməzdən əvvəl soruş
- Test yazma (ayrıca tələb olunmayıbsa)
- Auth / real email-SMS / real cloud storage QURMA — demo fazasındayıq (spec bölmə 19 "Mock vs Real")
- Kodu birbaşa fayllara yaz, çıxışda tam kodu təkrar göstərmə — yalnız 3-5 cümləlik xülasə ver
- Qeyri-müəyyən/mürəkkəb qərar lazımdırsa, kod yazmazdan əvvəl qısa plan yaz, təsdiq gözlə
- API açarlarını UYDURMA — `.env.example`-a placeholder qoy, real dəyəri sahibi verir

## Demo mərhələsində qəbul edilmiş sadələşdirmələr
- DB: PostGIS əvəzinə SQLite + `latitude`/`longitude` FloatField (kod PostgreSQL-ə hazırdır, `DATABASE_URL` ilə keçir)
- Media: lokal fayl sistemi (`backend-django/media/`), S3/R2 yox
- **Şəkillər: real foto YOXDUR.** Seed data-da bütün image sahələri boşdur;
  `frontend/components/MediaFrame.tsx` brend rənglərində CSS gradient placeholder
  çəkir. Admin paneldən URL/upload verildiyi an eyni komponent real şəkli göstərir —
  kodda dəyişiklik lazım deyil. Real şəkil generasiyası Phase 1-də.
- 360° tur: panoramalar `lib/panorama.ts`-də canvas ilə yaradılan placeholder-dir;
  tur tam gəzilə bilir. Real panorama admin-dən yüklənir.
- Xəritə: Mapbox token yoxdur → `MapView` öz vektor basemap-ini çəkir
  (`lib/geo.ts`). Phase 1-də Mapbox GL JS ilə bir komponentlik dəyişiklik.
- Frontend backend-ə çata bilməsə `lib/demo-data.json`-dan eyni seed data ilə
  render olunur (`manage.py dump_demo_json` ilə yenilənir)
- `npm run build` webpack istifadə edir — Next 16.3.3 Turbopack production build-i
  bir client chunk-ı emit etmir və hydration sınır

## Lokal işə salma
```bash
# 1) Django  (http://localhost:8000)
cd backend-django && python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt && python manage.py migrate
python manage.py seed_demo_data && python manage.py runserver

# 2) FastAPI (http://localhost:8001)
cd backend-fastapi && python -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt && uvicorn main:app --reload --port 8001

# 3) Next.js (http://localhost:3000)
cd frontend && npm install && npm run dev
```
Və ya: `docker compose up --build`
