# ⛳ GreenHeart — Golf for Good

A full-stack subscription platform where golfers enter monthly prize draws while
directing real charitable funding to causes they care about.

**Stack:** React 18 · Tailwind CSS v3 · Framer Motion · Node.js · Express ·
Supabase (PostgreSQL + Storage) · Stripe · Resend · Vercel

---

## Quick Start (Local Development)

### 1 — Prerequisites

- Node.js 18+ and npm 9+
- A terminal

### 2 — Clone and install

```bash
git clone <your-repo-url> greenheart
cd greenheart

# Install root + both packages at once
npm run install:all
```

### 3 — Configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

Open `backend/.env` and set at minimum:

```env
JWT_SECRET=any-long-random-string-here
# Everything else can stay as placeholders for local testing
```

### 4 — Run the database schema

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor → New Query**
3. Paste and run the full contents of `supabase/migrations/001_initial_schema.sql`
4. Copy your **Project URL** and **service role key** from Project Settings → API
5. Paste them into `backend/.env`

> **Demo mode:** If you skip Supabase setup, the backend gracefully returns demo
> data for all endpoints so you can still browse the UI.

### 5 — Start both servers

```bash
npm run dev
```

| Service  | URL                       |
|----------|---------------------------|
| Frontend | http://localhost:3000     |
| Backend  | http://localhost:5000/api |
| Health   | http://localhost:5000/api/health |

### 6 — Log in

| Role        | Email                  | Password  |
|-------------|------------------------|-----------|
| Admin       | admin@greenheart.io    | admin123  |
| Subscriber  | (register a new account) |          |

---

## Architecture

```
greenheart-platform/
├── frontend/                   # React + Vite + Tailwind
│   ├── src/
│   │   ├── App.jsx             # Router + auth guards
│   │   ├── context/
│   │   │   └── AuthContext.jsx # JWT auth state
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx  # 4-step onboarding
│   │   │   ├── DashboardPage.jsx # Subscriber panel
│   │   │   ├── AdminPage.jsx     # Admin panel
│   │   │   ├── CharityPage.jsx
│   │   │   ├── DrawPage.jsx
│   │   │   └── PricingPage.jsx
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   └── dashboard/
│   │   │       ├── ScoreManager.jsx   # Stableford score entry
│   │   │       ├── DrawHistory.jsx    # Draw results + matching
│   │   │       ├── CharityPanel.jsx   # Charity selection
│   │   │       └── WinnerUpload.jsx   # Proof upload + status
│   │   ├── utils/
│   │   │   └── api.js           # Axios instance
│   │   └── styles/
│   │       └── global.css       # Design system tokens
│   ├── vercel.json
│   └── vite.config.js
│
├── backend/                    # Node.js + Express
│   ├── server.js               # App bootstrap, middleware
│   ├── config/
│   │   ├── supabase.js         # Supabase client (service role)
│   │   └── stripe.js           # Stripe client + price IDs
│   ├── middleware/
│   │   └── auth.js             # JWT verify, admin guard, sub guard
│   ├── routes/
│   │   ├── auth.js             # register, login, /me
│   │   ├── users.js            # profile, stats, charity pref
│   │   ├── scores.js           # CRUD with 5-score enforcement
│   │   ├── draws.js            # public + user draw history
│   │   ├── charities.js        # directory listing
│   │   ├── subscriptions.js    # Stripe checkout + portal
│   │   ├── winnings.js         # winner upload to Supabase Storage
│   │   ├── admin.js            # full admin management API
│   │   └── webhooks.js         # Stripe webhook handler
│   ├── services/
│   │   ├── drawEngine.js       # simulate, execute, prize calc
│   │   └── email.js            # Resend transactional emails
│   └── vercel.json
│
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql   # Full schema + seed data
```

---

## Database Schema

| Table                  | Purpose                                      |
|------------------------|----------------------------------------------|
| `users`                | Subscribers + admins, Stripe IDs, sub status |
| `scores`               | Up to 5 Stableford scores per user (1–45)    |
| `draws`                | Monthly draw records, numbers, pool          |
| `draw_participants`    | Per-user result snapshot for each draw       |
| `winnings`             | Winner records with proof upload + pay status|
| `charities`            | Charity directory                            |
| `charity_contributions`| Per-payment charity allocation log           |

### Key constraints

- **Scores:** DB trigger + API both enforce max 5 per user; inserting a 6th
  automatically deletes the oldest by `played_at`.
- **Draws:** `numbers` is `integer[]`; jackpot rollover is tracked in
  `jackpot_carry` on the next draw.
- **Winnings status flow:**
  `pending_upload → pending_verification → verified → paid`
  (or `→ rejected`)

---

## Draw Engine

Located in `backend/services/drawEngine.js`.

### How a draw runs

1. Admin clicks **Simulate Draw** → `simulateDraw()` generates 5 numbers and
   counts matches for all active subscribers (read-only, nothing persisted).
2. Admin reviews the simulation preview in the UI.
3. Admin clicks **Publish Draw** → `executeDraw()`:
   - Generates a fresh set of 5 numbers (not the simulated ones — fair!)
   - Snapshots every active user's current top-5 scores
   - Calculates `matched_count` for each user
   - Inserts `draw_participants` rows for all users
   - Inserts `winnings` rows for users with 3+ matches
   - Emails all winners via Resend
   - If no 5-match winner → adds `jackpot_rollover` to next scheduled draw

### Prize distribution

| Tier   | Share | Condition        |
|--------|-------|------------------|
| 5 of 5 | 40%   | Jackpot — rolls over if no winner |
| 4 of 5 | 35%   | Split equally among all 4-match winners |
| 3 of 5 | 25%   | Split equally among all 3-match winners |

---

## API Reference

### Auth
| Method | Path               | Auth | Description          |
|--------|--------------------|------|----------------------|
| POST   | /api/auth/register | —    | Create account       |
| POST   | /api/auth/login    | —    | Get JWT              |
| GET    | /api/auth/me       | ✓    | Current user         |

### Scores
| Method | Path              | Auth | Description               |
|--------|-------------------|------|---------------------------|
| GET    | /api/scores       | ✓    | Get user's scores         |
| POST   | /api/scores       | ✓ + active sub | Add score (enforces max 5) |
| DELETE | /api/scores/:id   | ✓    | Remove a score            |

### Draws
| Method | Path                   | Auth | Description              |
|--------|------------------------|------|--------------------------|
| GET    | /api/draws/public      | —    | Latest draws (public)    |
| GET    | /api/draws/my-history  | ✓    | User's participation     |
| GET    | /api/draws/current     | —    | Next scheduled draw      |

### Subscriptions
| Method | Path                              | Auth | Description           |
|--------|-----------------------------------|------|-----------------------|
| POST   | /api/subscriptions/create-checkout | ✓   | Stripe checkout URL   |
| POST   | /api/subscriptions/portal         | ✓    | Stripe billing portal |
| GET    | /api/subscriptions/status         | ✓    | Current sub status    |

### Winnings
| Method | Path                            | Auth | Description           |
|--------|---------------------------------|------|-----------------------|
| GET    | /api/winnings/my                | ✓    | User's winnings       |
| POST   | /api/winnings/:id/upload-proof  | ✓    | Upload to Supabase Storage |

### Admin (require admin role)
| Method | Path                          | Description                     |
|--------|-------------------------------|---------------------------------|
| GET    | /api/admin/stats              | Platform overview stats         |
| GET    | /api/admin/users              | User list with search/filter    |
| PATCH  | /api/admin/users/:id/status   | Suspend / restore user          |
| GET    | /api/admin/draws              | All draws                       |
| POST   | /api/admin/draws              | Create scheduled draw           |
| POST   | /api/admin/draws/simulate     | Preview draw without persisting |
| POST   | /api/admin/draws/publish      | Execute and broadcast draw      |
| GET    | /api/admin/winnings/pending   | Proofs awaiting verification    |
| PATCH  | /api/admin/winnings/:id/verify | Approve or reject proof        |
| POST   | /api/admin/charities          | Add charity to directory        |

---

## Deployment

### Deploy to Vercel (recommended)

Both the frontend and backend are individually deployable to Vercel.

#### Frontend

```bash
cd frontend
npx vercel --prod
```

Set these environment variables in the Vercel dashboard:
- `VITE_API_URL` → your backend Vercel URL (e.g. `https://greenheart-api.vercel.app/api`)
- `VITE_STRIPE_PUBLISHABLE_KEY` → your Stripe publishable key

#### Backend

```bash
cd backend
npx vercel --prod
```

Set these environment variables in the Vercel dashboard:

| Variable                   | Where to find it                             |
|----------------------------|----------------------------------------------|
| `JWT_SECRET`               | Generate: `openssl rand -hex 64`             |
| `SUPABASE_URL`             | Supabase → Settings → API                   |
| `SUPABASE_SERVICE_ROLE_KEY`| Supabase → Settings → API (service role)     |
| `STRIPE_SECRET_KEY`        | Stripe → Developers → API Keys              |
| `STRIPE_WEBHOOK_SECRET`    | Stripe → Developers → Webhooks → endpoint secret |
| `STRIPE_PRICE_MONTHLY`     | Stripe → Products → your monthly price ID   |
| `STRIPE_PRICE_YEARLY`      | Stripe → Products → your yearly price ID    |
| `RESEND_API_KEY`           | resend.com → API Keys                        |
| `EMAIL_FROM`               | e.g. `GreenHeart <noreply@yourdomain.com>`  |
| `FRONTEND_URL`             | Your Vercel frontend URL                     |
| `NODE_ENV`                 | `production`                                 |

#### Stripe Webhook

After deploying the backend, register the webhook endpoint in Stripe:

1. Stripe Dashboard → Developers → Webhooks → **Add endpoint**
2. URL: `https://your-backend.vercel.app/api/webhooks/stripe`
3. Events to listen for:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
4. Copy the **Signing secret** → paste as `STRIPE_WEBHOOK_SECRET` in Vercel

#### Supabase Storage Bucket

Create the `winner-proofs` bucket:

1. Supabase Dashboard → Storage → **New bucket**
2. Name: `winner-proofs`
3. Public: **No** (private — only accessible via service role)
4. Max file size: 10MB
5. Allowed MIME types: `image/jpeg, image/png, image/webp, image/gif, application/pdf`

---

## Adding Real Credentials (step by step)

1. **Supabase** → run `001_initial_schema.sql`, set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
2. **Stripe** → create account, add Monthly (€12) and Yearly (€120) products, set price IDs
3. **Resend** → create account, verify your domain, set `RESEND_API_KEY` + `EMAIL_FROM`
4. **Deploy** → `vercel --prod` from both `frontend/` and `backend/`
5. **Webhooks** → register Stripe webhook URL, copy secret to env

---

## Tech Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Auth | Custom JWT (bcrypt + jsonwebtoken) | Full control, no vendor lock-in, easy to extend |
| Email | Resend | Modern API, great DX, 3k free/month, clean Node SDK |
| File uploads | Supabase Storage | Already in stack, RLS-aware, no extra vendor |
| Animations | Framer Motion | Best-in-class React animation library |
| Styling | Tailwind v3 + CSS custom properties | Utility classes + design tokens for the dark theme |
| Draw RNG | `Math.random()` + Set dedup | Sufficient for draws; upgrade to CSPRNG for regulatory compliance if needed |

---

## License

MIT — built for the GreenHeart platform.
