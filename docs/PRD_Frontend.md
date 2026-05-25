# PRD — Frontend TradeLog

> **Dokumen**: PRD_Frontend.md
> **Proyek**: TradeLog — Jurnal Backtest Trading Terpintar
> **Versi**: 1.0
> **Tanggal**: 26 Mei 2026
> **Status**: Draft
> **Dependensi**: [PRD_LandingPage.md](./PRD_LandingPage.md) · [PRD_Backend.md](./PRD_Backend.md)

---

## 1. Overview

Dokumen ini mendefinisikan seluruh halaman dan komponen UI untuk platform TradeLog. Mencakup halaman autentikasi, dashboard (area terproteksi), dan halaman publik. Landing page dibahas secara detail terpisah di [PRD_LandingPage.md](./PRD_LandingPage.md).

TradeLog adalah **Single Page Application (SPA)** yang dibangun dengan pendekatan **hybrid rendering**: Server Components untuk data fetching dan SEO, Client Components untuk interaktivitas.

---

## 2. Tech Stack

| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Next.js | 15 (App Router) | Framework utama, SSR/SSG/ISR |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | v4 | Utility-first styling |
| shadcn/ui | Latest | Komponen UI primitif (Button, Dialog, Form, Table, dll.) |
| Recharts | 2.x | Charting library untuk analytics |
| Lucide Icons | Latest | Icon library |
| React Hook Form | 7.x | Form state management |
| Zod | 3.x | Schema validation (shared dengan backend) |
| Framer Motion | 11.x | Animasi & transisi halaman |
| browser-image-compression | Latest | Kompresi gambar client-side |
| Inter (Google Fonts) | — | Tipografi utama |

---

## 3. Arsitektur Routing

```
app/
├── (public)/                    ← Layout: Navbar + Footer
│   ├── layout.tsx
│   ├── page.tsx                 ← Landing Page (/)
│   ├── leaderboard/
│   │   └── page.tsx             ← /leaderboard
│   ├── methods/
│   │   └── page.tsx             ← /methods (public library)
│   └── u/
│       └── [username]/
│           └── page.tsx         ← /u/[username]
│
├── (auth)/                      ← Layout: Centered card, gradient bg
│   ├── layout.tsx
│   ├── login/
│   │   └── page.tsx             ← /login
│   └── register/
│       └── page.tsx             ← /register
│
├── (dashboard)/                 ← Layout: Sidebar + Header
│   ├── layout.tsx
│   ├── dashboard/
│   │   └── page.tsx             ← /dashboard
│   ├── methods/
│   │   ├── page.tsx             ← /methods (user's methods)
│   │   ├── new/
│   │   │   └── page.tsx         ← /methods/new
│   │   └── [id]/
│   │       ├── page.tsx         ← /methods/[id]
│   │       └── strategies/
│   │           ├── new/
│   │           │   └── page.tsx ← /methods/[id]/strategies/new
│   │           └── [strategyId]/
│   │               └── page.tsx ← /methods/[id]/strategies/[strategyId]
│   ├── sessions/
│   │   ├── page.tsx             ← /sessions
│   │   ├── new/
│   │   │   └── page.tsx         ← /sessions/new
│   │   └── [id]/
│   │       ├── page.tsx         ← /sessions/[id]
│   │       └── trades/
│   │           └── new/
│   │               └── page.tsx ← /sessions/[id]/trades/new
│   ├── analytics/
│   │   └── page.tsx             ← /analytics
│   └── profile/
│       └── page.tsx             ← /profile
│
├── api/
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts         ← OAuth callback
│   └── upload/
│       └── route.ts             ← Image upload handler
│
├── layout.tsx                   ← Root layout
├── loading.tsx                  ← Global loading
├── error.tsx                    ← Global error boundary
└── not-found.tsx                ← 404 page
```

---

## 4. Detail Halaman

### 4.1 Auth Pages — Route Group `(auth)`

#### Layout Auth

| Properti | Detail |
|----------|--------|
| Background | Gradient `slate-950` → `indigo-950` dengan pattern dots |
| Container | Centered card, max-width 420px |
| Logo | TradeLog logo di atas form |
| Responsif | Full-width card di mobile, centered di desktop |

#### `/login` — Halaman Login

| Elemen | Detail |
|--------|--------|
| Heading | "Masuk ke TradeLog" |
| Form fields | Email (input), Password (input + show/hide toggle) |
| Validasi | Email format (Zod), password min 8 karakter |
| Tombol submit | "Masuk" (full-width, gradient primary) |
| OAuth | Tombol "Masuk dengan GitHub" (outline, ikon GitHub) |
| Divider | "atau" separator antara form dan OAuth |
| Link | "Belum punya akun? Daftar" → `/register` |
| Error handling | Toast notification untuk error (invalid credentials, dll.) |
| Loading state | Button disabled + spinner saat submit |

#### `/register` — Halaman Register

| Elemen | Detail |
|--------|--------|
| Heading | "Buat Akun TradeLog" |
| Form fields | Username (input), Email (input), Password (input + strength indicator) |
| Validasi | Username: 3-20 karakter, alphanumeric + underscore. Email: format valid. Password: min 8, harus ada huruf + angka |
| Tombol submit | "Daftar" (full-width, gradient primary) |
| OAuth | Tombol "Daftar dengan GitHub" |
| Link | "Sudah punya akun? Masuk" → `/login` |
| Post-register | Redirect ke `/dashboard` setelah verifikasi email (atau langsung jika email confirmation disabled) |

---

### 4.2 Dashboard Pages — Route Group `(dashboard)`

#### Layout Dashboard

```
┌──────────────────────────────────────────────────┐
│ [Sidebar]  │  [Header: Breadcrumbs | User Menu] │
│            │─────────────────────────────────────│
│ Dashboard  │                                     │
│ Methods    │         [Page Content]               │
│ Sessions   │                                     │
│ Analytics  │                                     │
│ ───────    │                                     │
│ Profile    │                                     │
│ Logout     │                                     │
└──────────────────────────────────────────────────┘
```

| Properti | Detail |
|----------|--------|
| Sidebar | Width 256px, collapsible ke 64px (icon-only). Background `slate-950`. |
| Sidebar items | Dashboard, Methods, Sessions, Analytics, divider, Profile, Logout |
| Sidebar icons | Lucide: `LayoutDashboard`, `BookOpen`, `FlaskConical`, `BarChart3`, `User`, `LogOut` |
| Header | Sticky, breadcrumbs di kiri, kanan: theme toggle (dark/light) + user dropdown (avatar, nama, menu: Profile, Logout) |
| Mobile | Sidebar hidden, hamburger button di header, slide-in overlay sidebar |
| Active state | Sidebar item aktif: background `indigo-600/20`, border-left `indigo-500` |

#### `/dashboard` — Halaman Utama Dashboard

**Deskripsi**: Overview performa trading user secara keseluruhan.

| Section | Detail |
|---------|--------|
| Stat Cards | 4 cards horizontal: Total Trades, Win Rate (%), Rata-rata R, Best Strategy (nama + win rate) |
| Equity Curve | Line chart (Recharts) — X: trade number/date, Y: cumulative R. Tooltip per data point. |
| Method Breakdown | Horizontal bar chart — performa per method (win rate, avg R) |
| Recent Trades | Table 5 trade terakhir: tanggal, method, strategy, result (badge warna), actual R |

**Stat Cards Design:**

| Card | Ikon | Warna | Format |
|------|------|-------|--------|
| Total Trades | `TrendingUp` | Indigo | Angka integer |
| Win Rate | `Target` | Emerald (jika ≥ 50%) / Red | Persentase 1 desimal |
| Rata-rata R | `Calculator` | Cyan | Angka 2 desimal, prefix + / - |
| Best Strategy | `Trophy` | Violet | Nama + win rate |

**Empty State**: Jika belum ada trade → ilustrasi + "Belum ada trade. Mulai dengan membuat Method pertamamu." + CTA "Buat Method"

#### `/methods` — Daftar Methods

| Elemen | Detail |
|--------|--------|
| Header | "Methods" + tombol "Buat Method Baru" |
| View toggle | Grid view (default) / List view |
| Search | Input pencarian by nama method |
| Filter | Filter by tags (multi-select chips) |
| Method Card | Nama, deskripsi (truncated), tags badges, jumlah strategies, quick stats (total trades, win rate), visibility badge (Public/Private), created date |
| Empty state | "Belum ada method. Buat method pertamamu untuk mulai." |
| Card action | Klik → navigasi ke `/methods/[id]` |

#### `/methods/new` — Buat Method Baru

**Form Type**: Multi-step form (wizard)

| Step | Fields | Validasi |
|------|--------|----------|
| 1 — Nama & Deskripsi | `name` (required, 3-100 char), `description` (optional, max 500) | Zod |
| 2 — Timeframes | Multi-select checkboxes: M1, M5, M15, M30, H1, H4, D1, W1, MN | Min 1 selected |
| 3 — Tags | Tag input (free text, max 10 tags, max 30 char per tag) | — |
| 4 — Visibility | Radio: Private (default) / Public | — |

**UX:**
- Step indicator (numbered circles + connecting line)
- Back / Next buttons
- Preview di step terakhir sebelum submit
- Redirect ke `/methods/[id]` setelah berhasil

#### `/methods/[id]` — Detail Method

| Section | Detail |
|---------|--------|
| Header | Nama method, visibility badge, edit button, delete button (konfirmasi dialog) |
| Info | Deskripsi, timeframes (badges), tags (badges), created date |
| Strategies | List/grid strategies dalam method. Setiap card: nama, trigger entry (truncated), jumlah konsep, jumlah sessions. Tombol "Tambah Strategy" |
| Stats | Total trades via method, win rate, avg R |

#### `/methods/[id]/strategies/new` — Buat Strategy

| Field | Tipe | Validasi |
|-------|------|----------|
| `name` | Text input | Required, 3-100 char |
| `triggerEntry` | Textarea | Required, max 1000 char |
| `slRule` | Textarea | Required, max 500 char |
| `tpRule` | Textarea | Required, max 500 char |
| Concepts | Dynamic list builder: input nama konsep + tombol tambah. Min 1. Bisa hapus per item. | Min 1 konsep |
| Sessions | Multi-select checkboxes: ASIA, LONDON, NEW_YORK, LONDON_CLOSE | Min 1 selected |

**Dynamic Concept Builder:**
```
┌──────────────────────────────────────────┐
│ Konsep yang Digunakan                    │
│ ┌──────────────────────┐ ┌───────────┐  │
│ │ Nama konsep...       │ │ + Tambah  │  │
│ └──────────────────────┘ └───────────┘  │
│                                          │
│  [BOS]  ✕    [FVG]  ✕    [OB]  ✕       │
└──────────────────────────────────────────┘
```

#### `/methods/[id]/strategies/[strategyId]` — Detail Strategy

| Section | Detail |
|---------|--------|
| Header | Nama strategy, edit button, delete button |
| Info | Trigger entry, SL rule, TP rule |
| Concepts | List konsep dalam badges |
| Sessions | List trading sessions dalam badges |
| Stats | Total trades via strategy, win rate, avg R, konsep paling sering present |
| Edit mode | Inline editing atau modal form |

#### `/sessions` — Daftar Sessions

| Elemen | Detail |
|--------|--------|
| Header | "Backtest Sessions" + tombol "Sesi Baru" |
| Filters | Method dropdown, Strategy dropdown (cascading), Instrument text input, Date range picker |
| Session Card | Nama sesi, method + strategy (breadcrumb-style), instrument, period, jumlah trades, win rate, avg R, created date |
| Sort | By date (default newest), by win rate, by total trades |
| Empty state | "Belum ada sesi backtest." |

#### `/sessions/new` — Buat Session Baru

| Field | Tipe | Validasi |
|-------|------|----------|
| `name` | Text input | Required, 3-100 char |
| `methodId` | Dropdown (methods milik user) | Required |
| `strategyId` | Dropdown (strategies dari method terpilih, cascading) | Required |
| `instrument` | Text input (e.g., XAUUSD, EURUSD) | Required, max 20 char |
| `periodStart` | Date picker | Required |
| `periodEnd` | Date picker | Required, ≥ periodStart |

**UX Cascading Dropdown:**
- Saat method dipilih → strategy dropdown diisi otomatis dengan strategies dari method tersebut
- Jika method berubah → strategy dropdown di-reset

#### `/sessions/[id]` — Detail Session

| Section | Detail |
|---------|--------|
| Header | Nama sesi, method → strategy breadcrumb, instrument, period, tombol "Tambah Trade" |
| Quick Stats | Stat cards: Total Trades, Win Rate, Avg R, Best Trade (R tertinggi) |
| Trade List | Toggle: Table view / Card view |
| Table columns | #, Tanggal, Session, Entry, SL, TP, Result (badge), Actual R, Concepts (badges), Actions |
| Card view | Compact card per trade: result badge, R value, tanggal, thumbnail screenshot |
| Empty state | "Belum ada trade di sesi ini. Tambah trade pertamamu." |
| Klik trade | Expand trade detail (accordion) atau modal dengan full info + images |

#### `/sessions/[id]/trades/new` — Input Trade Baru

> [!IMPORTANT]
> Form ini harus **dioptimasi untuk kecepatan input**. Trader ingin mencatat banyak trade dalam satu sesi backtest. Minimize jumlah klik dan langkah.

| Field | Tipe | Validasi | Notes |
|-------|------|----------|-------|
| `tradeDate` | Date picker | Required | Default: hari ini |
| `session` | Select: ASIA, LONDON, NEW_YORK, LONDON_CLOSE | Required | — |
| `entryPrice` | Number input | Required, > 0 | Step: 0.00001 |
| `slPrice` | Number input | Required, > 0 | Step: 0.00001 |
| `tpPrice` | Number input | Required, > 0 | Step: 0.00001 |
| `result` | Select: WIN, LOSS, BREAKEVEN, PARTIAL | Required | — |
| `timeframeTrigger` | Select (dari method timeframes) | Required | — |
| Close Prices | Dynamic list (jika result PARTIAL/WIN): closePrice + percentage | Jika PARTIAL: total % = 100 | Lihat detail di bawah |
| Images — Before | Image upload (drag & drop) | **Wajib** | Compress client-side |
| Images — After | Image upload (drag & drop) | **Wajib** | Compress client-side |
| Concept Checklist | Checkbox list (dari strategy concepts) | — | Pre-populated dari strategy |
| `notes` | Textarea | Optional, max 1000 | — |
| `mood` | Select: DISCIPLINED, RUSHED, HESITANT | Optional | Emoji ikon: 🎯 😰 😟 |

**Live R:R Preview Panel:**

```
┌─────────────────────────────┐
│  Risk-Reward Preview        │
│                             │
│  Risk:    15.3 pips         │
│  Reward:  45.9 pips         │
│  R:R:     1 : 3.00          │
│                             │
│  Actual R: +2.45 R          │
│  (dihitung dari close data) │
└─────────────────────────────┘
```

- Panel sticky di samping kanan form (desktop) atau collapsible di bawah (mobile)
- Update real-time saat entry/SL/TP/close prices berubah
- Warna: hijau jika R positif, merah jika negatif

**Close Prices (Multiple Close):**

```
┌────────────────────────────────────────────┐
│ Close Prices                               │
│                                            │
│  Close #1:  [1.08550]  [50] %  [Notes]  ✕ │
│  Close #2:  [1.08700]  [50] %  [Notes]  ✕ │
│                                            │
│  [+ Tambah Close]     Total: 100%          │
│                                            │
│  ⚠️ Total percentage harus = 100%          │
└────────────────────────────────────────────┘
```

**Image Upload UX:**
1. Drag & drop zone atau klik untuk browse
2. Preview thumbnail setelah upload
3. Client-side compression sebelum upload (max 1MB after compression)
4. Progress indicator saat upload
5. Bisa hapus / ganti setelah upload
6. Label jelas: "Screenshot SEBELUM entry" dan "Screenshot SETELAH entry"

#### `/analytics` — Halaman Analytics

**Tab-based layout:**

| Tab | Konten |
|-----|--------|
| **Overview** | Equity curve (seluruh trades), win rate trend (rolling 20 trades), stat cards summary |
| **Konsep** | Bar chart: win rate per konsep. Table: konsep, total trades, win, loss, win rate, avg R. Sortable. |
| **Timeframe** | Bar chart: win rate per timeframe. Table detail. |
| **Sesi** | Bar chart: win rate per trading session (ASIA, LONDON, dll.). Table detail. |
| **Distribusi R** | Histogram: distribusi R dari semua trades. Mean, median, std dev. |

**Filter Controls (berlaku untuk semua tab):**

| Filter | Tipe | Detail |
|--------|------|--------|
| Method | Dropdown multi-select | Filter by method(s) |
| Strategy | Dropdown multi-select (cascading) | Filter by strategy/strategies |
| Instrument | Text input / multi-select | Filter by instrument |
| Date range | Date range picker | Filter by trade date |
| Session | Checkbox group | ASIA, LONDON, NEW_YORK, LONDON_CLOSE |

**Charts (Recharts):**
- Tema gelap: grid lines `slate-800`, axis `slate-500`, tooltip background `slate-900`
- Warna data: indigo (primary), cyan (secondary), emerald (win), red (loss)
- Responsive: chart width 100%, height sesuai container
- Tooltip: informasi detail saat hover
- Legend jika ada multiple data series

#### `/profile` — Edit Profil

| Field | Tipe | Validasi |
|-------|------|----------|
| `displayName` | Text input | Optional, max 50 char |
| `bio` | Textarea | Optional, max 300 char |
| `avatarUrl` | Image upload (circular preview) | Optional, max 5MB, JPG/PNG/WEBP |

**Info non-editable yang ditampilkan:** Email, username, member since.

---

### 4.3 Public Pages — Route Group `(public)`

#### `/leaderboard` — Leaderboard

| Properti | Detail |
|----------|--------|
| Rendering | SSR (revalidate setiap 1 jam) |
| Heading | "🏆 Leaderboard" |
| Minimum | Hanya tampilkan trader dengan ≥ 30 trades |
| Tabel kolom | Rank, Username (link ke profile), Total Trades, Win Rate, Avg R, Consistency Score |
| Default sort | Consistency Score (desc) |
| Sortable columns | Total Trades, Win Rate, Avg R, Consistency Score |
| Filter | Instrument dropdown |
| Pagination | 20 per page |
| Consistency Score | `winRate × log10(totalTrades) × avgR` — tooltip penjelasan formula |

#### `/methods` — Public Method Library

| Properti | Detail |
|----------|--------|
| Heading | "📚 Method Library" |
| Konten | Grid cards untuk semua methods yang `isPublic = true` |
| Card info | Nama method, pembuat (username, link), deskripsi (truncated), tags, jumlah strategies, total trades, win rate |
| Search | By nama method |
| Filter | By tags |
| Sort | By popularity (total trades), by win rate, by newest |
| Klik card | Navigate ke detail method (read-only view) |

#### `/u/[username]` — Public Profile

| Section | Detail |
|---------|--------|
| Header | Avatar, display name, username, bio, member since |
| Published Methods | Grid cards methods publik milik user |
| Aggregate Stats | Total trades, win rate, avg R (hanya dari methods publik) |
| Empty state | "Trader ini belum mempublikasikan method apapun." |

---

## 5. Komponen Reusable

### 5.1 Layout Components

| Komponen | Path | Deskripsi |
|----------|------|-----------|
| `Sidebar` | `components/layout/Sidebar.tsx` | Dashboard sidebar, collapsible, active state |
| `Header` | `components/layout/Header.tsx` | Dashboard header, breadcrumbs, user dropdown |
| `MobileNav` | `components/layout/MobileNav.tsx` | Slide-in sidebar untuk mobile |
| `Footer` | `components/landing/Footer.tsx` | Footer untuk public pages |
| `Navbar` | `components/landing/Navbar.tsx` | Navbar untuk public pages |

### 5.2 Method & Strategy Components

| Komponen | Path | Props Utama |
|----------|------|-------------|
| `MethodForm` | `components/methods/MethodForm.tsx` | `mode: 'create' \| 'edit'`, `defaultValues?`, `onSubmit` |
| `MethodCard` | `components/methods/MethodCard.tsx` | `method`, `showStats?`, `isPublic?` |
| `StrategyForm` | `components/methods/StrategyForm.tsx` | `mode`, `defaultValues?`, `onSubmit` |
| `StrategyCard` | `components/methods/StrategyCard.tsx` | `strategy`, `showStats?` |
| `ConceptBuilder` | `components/methods/ConceptBuilder.tsx` | `concepts`, `onChange` |

### 5.3 Session & Trade Components

| Komponen | Path | Props Utama |
|----------|------|-------------|
| `SessionForm` | `components/sessions/SessionForm.tsx` | `mode`, `methods`, `onSubmit` |
| `SessionCard` | `components/sessions/SessionCard.tsx` | `session`, `showStats?` |
| `TradeForm` | `components/trades/TradeForm.tsx` | `session`, `strategy`, `onSubmit` |
| `TradeCard` | `components/trades/TradeCard.tsx` | `trade`, `onClick?` |
| `TradeImageUpload` | `components/trades/TradeImageUpload.tsx` | `type: 'BEFORE' \| 'AFTER'`, `onUpload`, `imageUrl?` |
| `TradeGallery` | `components/trades/TradeGallery.tsx` | `images`, `onImageClick?` |
| `CloseBuilder` | `components/trades/CloseBuilder.tsx` | `closes`, `onChange` |
| `RRPreview` | `components/trades/RRPreview.tsx` | `entry`, `sl`, `tp`, `closes` |

### 5.4 Analytics Components

| Komponen | Path | Props Utama |
|----------|------|-------------|
| `StatCard` | `components/analytics/StatCard.tsx` | `title`, `value`, `icon`, `trend?`, `color?` |
| `EquityCurve` | `components/analytics/EquityCurve.tsx` | `data` (array of {x, y}) |
| `ConceptBreakdown` | `components/analytics/ConceptBreakdown.tsx` | `data` (array of concept stats) |
| `TimeframeBreakdown` | `components/analytics/TimeframeBreakdown.tsx` | `data` |
| `SessionBreakdown` | `components/analytics/SessionBreakdown.tsx` | `data` |
| `RDistribution` | `components/analytics/RDistribution.tsx` | `data` (array of R values) |
| `FilterControls` | `components/analytics/FilterControls.tsx` | `methods`, `onFilterChange` |

### 5.5 Public Components

| Komponen | Path | Props Utama |
|----------|------|-------------|
| `LeaderboardTable` | `components/public/LeaderboardTable.tsx` | `data`, `sortBy`, `onSort` |
| `MethodLibrary` | `components/public/MethodLibrary.tsx` | `methods`, `filters` |
| `PublicProfile` | `components/public/PublicProfile.tsx` | `user`, `methods`, `stats` |

### 5.6 Common Components

| Komponen | Path | Deskripsi |
|----------|------|-----------|
| `EmptyState` | `components/common/EmptyState.tsx` | Ilustrasi + pesan + CTA opsional |
| `LoadingSkeleton` | `components/common/LoadingSkeleton.tsx` | Skeleton loader untuk cards, table, chart |
| `ErrorBoundary` | `components/common/ErrorBoundary.tsx` | Error fallback UI |
| `ConfirmDialog` | `components/common/ConfirmDialog.tsx` | Modal konfirmasi untuk delete actions |
| `Badge` | Dari shadcn/ui | Badge dengan variant warna |
| `DataTable` | `components/common/DataTable.tsx` | Wrapper Tanstack Table + pagination |

---

## 6. Design System

### 6.1 Color Palette

| Token | Light Mode | Dark Mode (Default) | Penggunaan |
|-------|------------|---------------------|------------|
| Background | `white` | `slate-950` | Page background |
| Surface | `slate-50` | `slate-900` | Card, sidebar |
| Surface Hover | `slate-100` | `slate-800` | Hover state |
| Border | `slate-200` | `slate-800` | Borders, dividers |
| Text Primary | `slate-900` | `slate-50` | Headings, body text |
| Text Secondary | `slate-500` | `slate-400` | Captions, labels |
| Primary | `indigo-600` | `indigo-500` | Buttons, links, active states |
| Primary Gradient | `indigo-600 → violet-600` | `indigo-500 → violet-500` | CTA buttons, highlights |
| Accent | `cyan-500` | `cyan-400` | Secondary highlights |
| Success | `emerald-600` | `emerald-500` | WIN badges, positive R |
| Destructive | `red-600` | `red-500` | LOSS badges, negative R, delete |
| Warning | `amber-500` | `amber-400` | BREAKEVEN, caution |
| Partial | `blue-500` | `blue-400` | PARTIAL result |

### 6.2 Result Badges

| Result | Warna Background | Warna Teks | Label |
|--------|-------------------|------------|-------|
| WIN | `emerald-500/20` | `emerald-400` | WIN |
| LOSS | `red-500/20` | `red-400` | LOSS |
| BREAKEVEN | `amber-500/20` | `amber-400` | BE |
| PARTIAL | `blue-500/20` | `blue-400` | PARTIAL |

### 6.3 Glassmorphism

```css
/* Card default (dark mode) */
.glass-card {
  background: rgba(15, 23, 42, 0.6);     /* slate-900 with opacity */
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
}

/* Card hover */
.glass-card:hover {
  border-color: rgba(99, 102, 241, 0.3); /* indigo hint */
  box-shadow: 0 8px 25px -5px rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
  transition: all 0.2s ease;
}
```

### 6.4 Spacing & Sizing

| Token | Value | Penggunaan |
|-------|-------|------------|
| Page padding | `px-4 md:px-6 lg:px-8` | Konten utama |
| Section gap | `py-16 md:py-24` | Antar section (landing page) |
| Card padding | `p-4 md:p-6` | Internal card padding |
| Card gap | `gap-4 md:gap-6` | Grid gap antar cards |
| Border radius | `rounded-lg` (8px) / `rounded-xl` (12px) | Cards, buttons |

### 6.5 Animasi & Transisi

| Tipe | CSS / Library | Duration |
|------|---------------|----------|
| Hover effects | Tailwind `transition-all duration-200` | 200ms |
| Page transitions | Framer Motion `AnimatePresence` | 300ms |
| Fade-in on scroll | Framer Motion `whileInView` | 500ms |
| Loading skeleton | CSS pulse animation | 1.5s loop |
| Counter animation | Custom hook (requestAnimationFrame) | 1-2s |
| Toast notifications | shadcn/ui Toast | 5s auto-dismiss |
| Sidebar collapse | Tailwind `transition-all duration-300` | 300ms |

### 6.6 Responsive Breakpoints

| Breakpoint | Lebar | Layout Dashboard | Layout Public |
|------------|-------|------------------|---------------|
| Mobile | < 768px | Full-width, no sidebar, bottom nav atau hamburger | Stack, hamburger navbar |
| Tablet | 768-1024px | Collapsed sidebar (icons), full content | 2-column grid |
| Desktop | > 1024px | Expanded sidebar + content | Full layout |

### 6.7 Tipografi

| Elemen | Font | Weight | Size | Line Height |
|--------|------|--------|------|-------------|
| H1 | Inter | 700-800 | 30px / 36px (md) | 1.2 |
| H2 | Inter | 700 | 24px / 30px (md) | 1.3 |
| H3 | Inter | 600 | 20px / 24px (md) | 1.4 |
| Body | Inter | 400 | 14px / 16px (md) | 1.5 |
| Caption | Inter | 400 | 12px / 14px (md) | 1.5 |
| Code/Data | JetBrains Mono | 400 | 13px | 1.5 |

---

## 7. State Management

### 7.1 Pendekatan Utama

| Layer | Teknologi | Penggunaan |
|-------|-----------|------------|
| Server State | React Server Components | Fetching data dari database (methods, sessions, trades, analytics) |
| Client Interactivity | React Client Components (`'use client'`) | Forms, modals, toggles, drag-and-drop, charts |
| Form State | React Hook Form | Semua forms (method, strategy, session, trade, profile) |
| URL State | `useSearchParams` / `nuqs` | Filters, sorting, pagination, active tab |
| Auth State | Supabase Auth (session via cookie) | User session, protected routes |

### 7.2 Data Fetching Pattern

```tsx
// Server Component — data fetching
async function MethodsPage() {
  const methods = await getMethodsByUser(); // Server Action
  return <MethodsList methods={methods} />;
}

// Client Component — interactivity
'use client';
function MethodsList({ methods }: { methods: Method[] }) {
  const [search, setSearch] = useState('');
  const filtered = methods.filter(m => m.name.includes(search));
  return (/* UI with search + grid */);
}
```

### 7.3 Optimistic Updates

- Gunakan `useOptimistic` atau `useTransition` untuk update yang memerlukan response cepat
- Contoh: toggle visibility method (langsung update UI, revert jika server gagal)
- Delete actions: optimistic remove dari list + toast "Berhasil dihapus" + undo option (3 detik)

---

## 8. Form Handling

### 8.1 Stack

- **React Hook Form** — form state, field registration, submit handling
- **Zod** — schema validation (shared dengan backend Server Actions)
- **shadcn/ui Form** — form field wrapper, error display

### 8.2 Contoh Pattern

```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { methodSchema, type MethodInput } from '@/lib/validations/method';

function MethodForm() {
  const form = useForm<MethodInput>({
    resolver: zodResolver(methodSchema),
    defaultValues: { name: '', description: '', isPublic: false, tags: [] },
  });

  async function onSubmit(data: MethodInput) {
    const result = await createMethod(data); // Server Action
    if (result.error) {
      toast.error(result.error);
    } else {
      router.push(`/methods/${result.data.id}`);
    }
  }

  return <Form {...form}>...</Form>;
}
```

### 8.3 Shared Zod Schemas

Schemas didefinisikan di `lib/validations/` dan digunakan oleh **frontend (form validation)** dan **backend (Server Action validation)**.

```
lib/
└── validations/
    ├── method.ts
    ├── strategy.ts
    ├── session.ts
    ├── trade.ts
    ├── profile.ts
    └── auth.ts
```

---

## 9. Image Handling

### 9.1 Flow Upload

```
User selects image
       │
       ▼
Client-side compression (browser-image-compression)
  - maxSizeMB: 1
  - maxWidthOrHeight: 1920
  - useWebWorker: true
       │
       ▼
Preview thumbnail ditampilkan
       │
       ▼
Form submit → Server Action / API Route
       │
       ▼
Upload ke Supabase Storage
  - Bucket: trade-images
  - Path: {userId}/{tradeId}/{before|after}.{ext}
       │
       ▼
Simpan storageUrl ke tabel TradeImage
```

### 9.2 Komponen `TradeImageUpload`

| Fitur | Detail |
|-------|--------|
| Drag & Drop | `react-dropzone` atau custom implementation |
| Click to browse | File picker fallback |
| Preview | Thumbnail preview setelah select / upload |
| Compression | `browser-image-compression` sebelum upload |
| Progress | Progress bar saat uploading |
| Delete | Tombol hapus untuk mengganti gambar |
| Validation | Format: JPG, PNG, WEBP. Max size (before compression): 10MB |
| Label | "📸 Screenshot SEBELUM Entry" / "📸 Screenshot SETELAH Entry" |

### 9.3 `TradeGallery`

- Lightbox view saat klik thumbnail (full-screen overlay)
- Side-by-side Before vs After comparison (desktop)
- Swipe antara Before / After (mobile)
- Zoom capability

---

## 10. Accessibility (A11y)

| Requirement | Detail |
|-------------|--------|
| Keyboard navigation | Semua interactive elements bisa diakses via keyboard |
| Focus management | Visible focus indicators, trap focus di modals |
| Screen reader | `aria-label` pada semua buttons tanpa teks, `aria-describedby` pada form errors |
| Color contrast | Minimum 4.5:1 (WCAG AA) |
| Alt text | Semua images harus memiliki alt text |
| Form errors | Error messages terhubung ke field via `aria-describedby` |
| Reduced motion | Respect `prefers-reduced-motion` → disable animasi |
| Skip links | "Skip to main content" link di awal halaman |

---

## 11. Acceptance Criteria

| # | Kriteria | Prioritas |
|---|----------|-----------|
| 1 | Semua halaman yang terdaftar dapat diakses sesuai routing | P0 |
| 2 | Auth flow (register, login, logout, OAuth) berfungsi end-to-end | P0 |
| 3 | CRUD Method, Strategy, Session, Trade berfungsi | P0 |
| 4 | Trade form menghitung R:R secara real-time | P0 |
| 5 | Image upload (before + after) berfungsi dengan compression | P0 |
| 6 | Dashboard menampilkan stats dan equity curve yang benar | P0 |
| 7 | Analytics page menampilkan data sesuai filter | P0 |
| 8 | Leaderboard menampilkan data publik yang benar | P0 |
| 9 | Responsive di semua breakpoints | P0 |
| 10 | Dark mode sebagai default, light mode support | P0 |
| 11 | Form validation (Zod) menampilkan error yang jelas | P0 |
| 12 | Empty states ditampilkan saat data kosong | P1 |
| 13 | Loading skeletons ditampilkan saat fetching | P1 |
| 14 | Animasi berjalan smooth (60fps) | P1 |
| 15 | Keyboard navigasi berfungsi penuh | P1 |
| 16 | Lighthouse Performance ≥ 80, Accessibility ≥ 90 | P1 |

---

## 12. Verification & Testing

### 12.1 Component Testing

- [ ] Setiap komponen reusable memiliki unit test (Vitest + React Testing Library)
- [ ] Form components ditest: validasi, submit, error state
- [ ] Analytics charts ditest: render dengan data kosong, data minimal, data besar

### 12.2 Integration Testing

- [ ] Auth flow end-to-end: register → login → dashboard → logout
- [ ] CRUD flow: create method → add strategy → create session → add trade → view analytics
- [ ] Image upload flow: select → compress → upload → preview → delete
- [ ] Cascading dropdown: method → strategy dalam session form

### 12.3 Visual / UI Testing

- [ ] Screenshot comparison di 3 breakpoints (mobile, tablet, desktop)
- [ ] Dark mode + light mode rendering
- [ ] Glassmorphism effect rendering di major browsers
- [ ] Animasi smooth (tidak ada jank)

### 12.4 E2E Testing (Playwright)

- [ ] Happy path: landing → register → create method → create strategy → create session → add trade → dashboard stats benar
- [ ] Error paths: invalid form submissions, network errors
- [ ] Public pages: leaderboard, method library, public profile
- [ ] Mobile viewport E2E

### 12.5 Performance Testing

- [ ] Lighthouse Performance ≥ 80 (dashboard)
- [ ] Lighthouse Performance ≥ 90 (landing page, SSG)
- [ ] Bundle analysis: no unnecessary large dependencies
- [ ] Image compression: output ≤ 1MB

### 12.6 Accessibility Testing

- [ ] Lighthouse Accessibility ≥ 90
- [ ] axe-core scan: 0 critical/serious violations
- [ ] Keyboard-only navigation test
- [ ] Screen reader test (NVDA / VoiceOver)

---

## 13. Referensi ke PRD Lain

| PRD | Relasi |
|-----|--------|
| [PRD_LandingPage.md](./PRD_LandingPage.md) | Detail lengkap landing page (`/`), termasuk sections, design, dan animasi |
| [PRD_Backend.md](./PRD_Backend.md) | Database schema, Server Actions, API routes, validasi Zod, storage policies, R:R calculation logic. Frontend bergantung pada semua endpoints dan schema yang didefinisikan di backend. |

---

## 14. Out of Scope (v1)

- Internationalization (i18n) — Bahasa Indonesia saja
- Real-time collaboration / sharing sesi backtest
- Mobile native app (PWA dipertimbangkan untuk v2)
- Notifikasi push
- Import/export CSV
- Dark/light mode auto-detect (manual toggle saja)
- Advanced charting (candlestick replay, TradingView widget)
