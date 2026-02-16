# KantinApp — Hamar Katedralskole

Mobiledodatek og admin-panel for bestilling og vurdering av kantinemat ved Hamar Katedralskole.

**Elever** ser ukens meny, vurderer retter og leser allergeninformasjon.
**Kantinepersonale** oppretter retter, publiserer ukemenyer, følger med popularitet og eksporterer statistikk.

---

## Arkitektur

| Lag | Teknologi | Mappe |
| --- | --- | --- |
| Backend | Next.js 15 (App Router), Prisma ORM, Neon PostgreSQL | `backend/` |
| Frontend | Expo 54 (React Native), expo-router, NativeWind v4 | `frontend/` |
| Bilder | Vercel Blob Storage | — |
| E-post | Maileroo (OTP-verifisering) | — |
| Deploy | Vercel (backend), EAS Build (mobilapp) | — |

---

## Kom i gang

### Forutsetninger

- Node.js >= 20
- npm
- PostgreSQL-database (Neon anbefalt)

### Backend

```bash
cd backend
npm install
```

Opprett `.env` basert på `.env.example` og fyll inn:

| Variabel | Beskrivelse |
| --- | --- |
| `DATABASE_URL` | PostgreSQL tilkoblingsstreng (pooled) |
| `DATABASE_URL_UNPOOLED` | Direkte tilkobling (for migrasjoner) |
| `JWT_SECRET` | Tilfeldig streng, minst 32 tegn |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob-token for bildeopplasting |
| `MAILEROO_API_KEY` | API-nokkel for Maileroo (e-posttjeneste) |
| `MAILEROO_TEMPLATE_VERIFY_ID` | Template-ID for OTP-verifisering i Maileroo |
| `MAILEROO_FROM_ADDRESS` | Avsenderadresse for e-post |
| `MAILEROO_FROM_NAME` | Avsendernavn for e-post |
| `VERIFY_CODE_TTL_MINUTES` | Gyldighet for OTP-kode (standard: 10) |

```bash
npx prisma db push          # synkroniser skjema med database
npx tsx prisma/seed.ts       # fyll med testdata
npm run dev                  # start på http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
```

Opprett `frontend/.env`:

```env
EXPO_PUBLIC_API_URL=http://<din-ip>:3000
```

```bash
npx expo start               # start Expo-utviklerserver
```

Skann QR-koden med Expo Go (Android/iOS) eller trykk `a` for Android-emulator / `i` for iOS-simulator.

---

## Prosjektstruktur

```
KantinApp/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Databaseskjema (8 modeller)
│   │   └── seed.ts                # Testdata
│   └── src/
│       ├── app/
│       │   ├── api/
│       │   │   ├── auth/          # Registrering, login, OTP, refresh, logout
│       │   │   ├── admin/         # Retter, ukemenyer, menypunkter, opplasting, analyse
│       │   │   ├── menu/          # Offentlig meny (uke/dag)
│       │   │   ├── menu-item/     # Rettdetaljer med stemmestatistikk
│       │   │   ├── votes/         # Stemmegivning
│       │   │   ├── me/            # Brukerinfo
│       │   │   └── health/        # Helsesjekk
│       │   └── admin/             # Admin-panel (Next.js-sider)
│       │       ├── dishes/        # CRUD for retter
│       │       ├── weeks/         # Ukemenyoversikt og detaljer
│       │       ├── analytics/     # Stemmestatistikk
│       │       └── login/         # Admin-innlogging
│       ├── lib/                   # Auth, DB, validering, feilhondtering, logging
│       └── services/              # Forretningslogikk (stemmer)
│
└── frontend/
    ├── app/
    │   ├── (tabs)/
    │   │   ├── index.tsx          # Ukemeny-skjerm
    │   │   └── settings.tsx       # Innstillinger
    │   ├── dish/[id].tsx          # Rettdetaljer
    │   ├── login.tsx              # Innlogging
    │   └── register.tsx           # Registrering med OTP
    └── src/
        ├── api/
        │   ├── client.ts          # Axios med JWT-interceptorer
        │   ├── types.ts           # TypeScript-typer
        │   └── hooks/             # React Query-hooks
        ├── components/            # UI-komponenter
        ├── context/               # AuthContext
        ├── lib/                   # Hjelpefunksjoner
        └── constants/             # Farger, allergener
```

---

## Databaseskjema

```
User ──< RefreshToken
  │
  └──< Vote >── MenuItem >── Dish
                    │
               MenuDay >── WeekMenu
               
VerificationToken (midlertidig OTP-lagring)
```

**Modeller:**

| Modell | Beskrivelse |
| --- | --- |
| `User` | Brukere med roller: `STUDENT`, `CANTEEN_ADMIN`, `SCHOOL_ADMIN` |
| `RefreshToken` | JWT refresh-tokens (7 dagers gyldighet) |
| `WeekMenu` | Ukemeny med status: `DRAFT` / `PUBLISHED` / `ARCHIVED` |
| `MenuDay` | Dag i uken (mandag–fredag), refererer til `WeekMenu` |
| `Dish` | Rett med tittel, beskrivelse, bilde, allergener og tagger |
| `MenuItem` | Kobling mellom rett og dag, med pris, kategori og status |
| `Vote` | Stemme per bruker per menypunkt (-1 / 0 / +1) |
| `VerificationToken` | Midlertidig lagring av OTP-kode under registrering |

---

## API-oversikt

### Offentlige endepunkter

| Metode | Rute | Beskrivelse |
| --- | --- | --- |
| `GET` | `/api/menu/week?year=&week=` | Hent publisert ukemeny |
| `GET` | `/api/menu/day?date=` | Hent meny for en bestemt dag |
| `GET` | `/api/menu-item/:id` | Rettdetaljer med stemmestatistikk |
| `GET` | `/api/health` | Helsesjekk (DB-tilkobling) |

### Autentisering

| Metode | Rute | Beskrivelse |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Registrering (sender OTP-e-post) |
| `POST` | `/api/auth/verify` | Verifiser OTP og opprett bruker |
| `POST` | `/api/auth/login` | Innlogging (JWT + cookies) |
| `POST` | `/api/auth/refresh` | Forny access-token |
| `POST` | `/api/auth/logout` | Logg ut (slett cookies) |

### Bruker (krever autentisering)

| Metode | Rute | Beskrivelse |
| --- | --- | --- |
| `GET` | `/api/me` | Hent brukerinfo |
| `POST` | `/api/votes` | Avgi stemme |
| `PATCH` | `/api/votes/:menuItemId` | Endre stemme |

### Admin (krever `CANTEEN_ADMIN` eller `SCHOOL_ADMIN`)

| Metode | Rute | Beskrivelse |
| --- | --- | --- |
| `GET/POST` | `/api/admin/dishes` | List / opprett retter |
| `GET/PATCH/DELETE` | `/api/admin/dishes/:id` | Hent / rediger / slett rett |
| `GET/POST` | `/api/admin/week-menu` | List / opprett ukemeny |
| `GET/DELETE` | `/api/admin/week-menu/:id` | Hent / slett ukemeny |
| `POST` | `/api/admin/week-menu/:id/publish` | Publiser ukemeny |
| `POST/PATCH/DELETE` | `/api/admin/menu-items(/:id)` | CRUD for menypunkter |
| `PATCH` | `/api/admin/menu-items/:id/status` | Endre status (aktiv/endret/utsolgt) |
| `POST/DELETE` | `/api/admin/uploads` | Last opp / slett bilder (Vercel Blob) |
| `GET` | `/api/admin/analytics` | Stemmestatistikk (JSON eller CSV) |

---

## Funksjoner

### Mobilapp (elever)

- Ukemeny med daggruppering (mandag–fredag)
- Automatisk rulling til dagens meny
- Rettdetaljer med bilde, pris, beskrivelse og allergener
- 3-nivoa stemming: god / ok / darlig med emoji-knapper
- Sanntidsstatistikk med prosentfordelingsbarer
- Optimistisk UI-oppdatering (stemmer vises umiddelbart)
- Pull-to-refresh og lasting-skjelett
- Registrering med e-postverifisering (OTP)
- Domenerestrikjon: kun `@innlandetfylke.no`
- Sikker tokenlagring med `expo-secure-store`
- Automatisk fornyelse av utlopte tokens

### Admin-panel (kantinepersonale)

- Dashboard med oversikt: antall retter, stemmer, ukemenyer
- Rettadministrasjon: opprett, rediger inline, slett
- Bildeopplasting via Vercel Blob (dra-og-slipp eller URL)
- Automatisk sletting av gamle bilder ved oppdatering
- Ukemenyoversikt med dagoppsummering
- Detaljvisning per uke: legg til retter per dag, publiser
- Statusstyring per menypunkt (aktiv / endret / utsolgt)
- Analyse med toppretter, stemmefordeling og CSV-eksport
- Cookie-basert autentisering med automatisk tokenfornyelse

### Sikkerhet

- JWT-autentisering (access + refresh tokens)
- Rollebasert tilgangskontroll (RBAC)
- Sikre httpOnly-cookies for admin-panel
- E-postverifisering med OTP ved registrering
- Passordkryptering med bcrypt
- Rate limiting (stemmer: 30/time, API: 100/min)
- CORS-beskyttelse og sikkerhetshoder
- Zod-validering pa alle API-inputs

---

## Teknisk stack

### Backend

| Pakke | Versjon | Funksjon |
| --- | --- | --- |
| Next.js | 15.x | Server-framework med App Router |
| Prisma | 6.x | ORM for PostgreSQL |
| jose | 6.x | JWT-verifikasjon i Edge-middleware |
| jsonwebtoken | 9.x | JWT-signering i API-ruter |
| bcryptjs | 2.x | Passordkryptering |
| zod | 3.x | Skjemavalidering |
| date-fns | 4.x | Datohondtering (ISO-uker, Oslo-tidssone) |
| @vercel/blob | 2.x | Bildelagring i skyen |

### Frontend

| Pakke | Versjon | Funksjon |
| --- | --- | --- |
| Expo | 54.x | React Native-plattform |
| expo-router | 6.x | Filbasert navigasjon |
| NativeWind | 4.x | Tailwind CSS for React Native |
| @tanstack/react-query | 5.x | Servertilstandshondtering, caching |
| axios | 1.x | HTTP-klient med interceptorer |
| expo-secure-store | 15.x | Sikker tokenlagring |
| expo-image | 3.x | Optimalisert bildekomponent |

---

## Deploy

### Backend (Vercel)

```bash
cd backend
npx vercel --prod
```

Legg til alle miljovariablene i Vercel-prosjektinnstillingene.

### Mobilapp (EAS Build)

```bash
cd frontend
eas build --platform all --profile production
```

Byggprofiler er konfigurert i `frontend/eas.json`:
- `development` — utviklerklient med dev-server
- `preview` — intern distribusjon
- `production` — App Store / Google Play

---

## Nyttige kommandoer

```bash
# Backend
npm run dev                    # Start utviklerserver
npx prisma studio             # Apne Prisma Studio (DB-nettleser)
npx prisma db push            # Synkroniser skjema med DB
npx tsx prisma/seed.ts         # Seed testdata
npx prisma migrate dev         # Opprett migrasjon

# Frontend
npx expo start                 # Start Expo
npx expo start --clear         # Start med tom cache
eas build --profile preview    # Bygg for testing
```

---

## Lisens

Privat — Hamar Katedralskole
