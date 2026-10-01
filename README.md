# MenuQR 🍽️

Digital QR-code menus for local restaurants. Restaurant owners get a dashboard to manage their menu. Customers scan a QR code at the table and see the menu instantly — no app needed.

---

## Getting started

### 1. Install Node.js
Download from [nodejs.org](https://nodejs.org) (LTS version recommended).

### 2. Create a Supabase project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and run it
4. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key

### 3. Configure environment variables
```bash
cp .env.local.example .env.local
```
Fill in your Supabase URL and anon key in `.env.local`.

Also set your site URL (used for QR code generation):
```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
In production, set it to your actual domain (e.g. `https://menuqr.com`).

### 4. Install dependencies and run
```bash
cd restaurant-menu
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How it works

| Route | Who sees it | What it does |
|---|---|---|
| `/` | Anyone | Landing page |
| `/register` | New owners | Create account + restaurant |
| `/login` | Returning owners | Sign in |
| `/dashboard` | Owner (auth required) | Overview stats |
| `/dashboard/menu` | Owner | Add/edit/delete menu items & categories |
| `/dashboard/qr` | Owner | Download QR code to print |
| `/menu/[slug]` | Customers (public) | Beautiful mobile menu |

---

## Deploy to production

1. Push to GitHub
2. Import to [Vercel](https://vercel.com) — it auto-detects Next.js
3. Add your environment variables in Vercel's project settings
4. Update `NEXT_PUBLIC_SITE_URL` to your Vercel domain

---

## Tech stack

- **Next.js 14** (App Router)
- **Supabase** — database, auth, storage
- **Tailwind CSS** — styling
- **qrcode.react** — QR code generation
- **Lucide React** — icons
