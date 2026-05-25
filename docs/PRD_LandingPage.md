# PRD — Landing Page TradeLog

> **Dokumen**: PRD_LandingPage.md
> **Proyek**: TradeLog — Jurnal Backtest Trading Terpintar
> **Versi**: 1.0
> **Tanggal**: 26 Mei 2026
> **Status**: Draft
> **Dependensi**: [PRD_Frontend.md](./PRD_Frontend.md) · [PRD_Backend.md](./PRD_Backend.md)

---

## 1. Overview

Landing page adalah halaman publik pertama yang dilihat pengunjung saat mengakses TradeLog (`/`). Halaman ini berfungsi sebagai **pintu masuk utama** platform, menjelaskan value proposition, menampilkan fitur unggulan, dan mengarahkan pengunjung untuk mendaftar atau menjelajahi fitur publik (Leaderboard, Method Library).

Landing page bersifat **fully static** (SSG) untuk performa optimal dan SEO, tanpa memerlukan autentikasi.

---

## 2. Tujuan

| # | Tujuan | Metrik Keberhasilan |
|---|--------|---------------------|
| 1 | Menarik trader retail untuk mendaftar | Conversion rate CTA → halaman register |
| 2 | Menjelaskan value proposition TradeLog secara jelas | Bounce rate < 60% |
| 3 | Menampilkan fitur utama platform | Scroll depth > 70% |
| 4 | Mengarahkan ke Leaderboard & Method Library | Click-through rate ke halaman publik |

---

## 3. Target User

**Trader retail** yang melakukan backtest manual dengan pendekatan:

- **SMC** (Smart Money Concepts)
- **ICT** (Inner Circle Trader)
- **Price Action** klasik
- Trader yang menggunakan multi-timeframe analysis
- Trader yang ingin mendokumentasikan dan menganalisis performa per konsep/setup

**Karakteristik umum:**

- Sudah paham dasar trading, belum punya sistem journaling yang terstruktur
- Menggunakan spreadsheet atau catatan manual untuk backtest
- Frustasi dengan proses dokumentasi yang repetitif
- Ingin tahu setup mana yang paling profitable

---

## 4. Tech Stack

| Teknologi | Fungsi |
|-----------|--------|
| Next.js 15 (App Router) | Framework, SSG untuk landing page |
| TypeScript | Type safety |
| Tailwind CSS v4 | Styling & responsive design |
| shadcn/ui | Komponen UI dasar (Button, dll.) |
| Lucide Icons | Ikon untuk fitur cards |
| Inter (Google Fonts) | Tipografi utama |
| Framer Motion / CSS | Scroll animations & micro-interactions |

---

## 5. Sections Landing Page

### 5.1 Navbar

| Properti | Detail |
|----------|--------|
| Posisi | Fixed di atas, transparent background |
| Scroll behavior | Background menjadi `backdrop-blur` + semi-transparent saat scroll |
| Konten kiri | Logo TradeLog |
| Konten kanan | Links: Fitur, Cara Kerja, Leaderboard, Method Library |
| CTA | Tombol "Masuk" (ghost) + "Daftar" (primary gradient) |
| Mobile | Hamburger menu → slide-in drawer |

### 5.2 Hero Section

```
┌─────────────────────────────────────────────────────┐
│                  [Animated Gradient BG]             │
│                                                     │
│          Backtest Lebih Cerdas,                      │
│          Analisis Lebih Tajam.                       │
│                                                     │
│   Platform journaling backtest trading yang          │
│   menganalisis performa per konsep, bukan            │
│   sekadar mencatat win/loss.                         │
│                                                     │
│   [ 🚀 Mulai Sekarang ]  [ 🏆 Lihat Leaderboard ]  │
│                                                     │
│          [Hero Illustration / Mockup]               │
└─────────────────────────────────────────────────────┘
```

| Properti | Detail |
|----------|--------|
| Headline | "Backtest Lebih Cerdas, Analisis Lebih Tajam." |
| Sub-headline | "Platform journaling backtest trading yang menganalisis performa per konsep, bukan sekadar mencatat win/loss." |
| CTA Primer | "Mulai Sekarang" → navigasi ke `/register` |
| CTA Sekunder | "Lihat Leaderboard" → navigasi ke `/leaderboard` |
| Background | Gradient animasi: indigo → violet → cyan, slow shift |
| Elemen dekoratif | Floating geometric shapes (circles, grid dots) dengan parallax ringan |
| Animasi | Fade-in + slide-up untuk teks, staggered animation untuk CTA buttons |

### 5.3 Problem Statement Section

**Heading**: "Kenapa Backtest Manual Itu Melelahkan?"

| # | Pain Point | Ikon | Deskripsi |
|---|-----------|------|-----------|
| 1 | Isi Ulang Data Berulang | `RefreshCcw` | "Setiap sesi backtest, kamu harus isi ulang setup, rules, dan kriteria yang sama berulang kali." |
| 2 | Tidak Bisa Analisis Per Konsep | `PieChart` | "Spreadsheet hanya menunjukkan win/loss. Kamu tidak tahu konsep mana yang benar-benar profitable." |
| 3 | Tidak Ada Standar Dokumentasi Visual | `ImageOff` | "Screenshot tersebar di mana-mana tanpa format konsisten. Tidak ada before vs after yang jelas." |
| 4 | Sulit Membandingkan Performa | `BarChart3` | "Membandingkan performa antar sesi, timeframe, atau strategi membutuhkan effort manual yang besar." |

**Design:**
- Layout: Grid 2×2 (desktop), stack (mobile)
- Card style: Glassmorphism, border subtle, ikon berwarna merah/oranye untuk menekankan "masalah"
- Animasi: Fade-in on scroll, staggered per card

### 5.4 Fitur Utama Section

**Heading**: "Solusi yang Kamu Butuhkan"

| # | Fitur | Ikon | Deskripsi |
|---|-------|------|-----------|
| 1 | Setup Sekali, Pakai Berulang | `Layers` | "Definisikan method & strategy sekali. Semua sesi backtest otomatis mewarisi setup yang sama." |
| 2 | Analitik Per Sub-Konsep | `BrainCircuit` | "Ketahui performa setiap konsep (BOS, FVG, OB, dll.) secara spesifik. Buang yang tidak bekerja." |
| 3 | R:R Dinamis | `Calculator` | "Kalkulasi Risk-Reward otomatis, termasuk partial close. Lihat actual R per trade secara real-time." |
| 4 | Dokumentasi Visual Wajib | `Camera` | "Upload screenshot before & after di setiap trade. Bangun library visual dari setup terbaikmu." |

**Design:**
- Layout: Grid 2×2 (desktop), stack (mobile)
- Card style: Glassmorphism dengan gradient border on hover
- Ikon: Gradient indigo → violet
- Animasi: Scale-up on hover, fade-in on scroll

### 5.5 Cara Kerja Section

**Heading**: "Mulai dalam 3 Langkah"

```
   ┌──────────┐       ┌──────────┐       ┌──────────┐
   │    01    │  ───▶  │    02    │  ───▶  │    03    │
   │ Definisi │       │  Input   │       │ Analisis │
   │  Method  │       │  Trade   │       │ Otomatis │
   └──────────┘       └──────────┘       └──────────┘
```

| Step | Judul | Deskripsi |
|------|-------|-----------|
| 01 | Definisi Method | "Buat method trading kamu: tentukan nama, timeframe, strategy, dan konsep-konsep yang digunakan." |
| 02 | Input Trade | "Catat setiap trade dalam sesi backtest. Isi entry, SL, TP, upload screenshot, dan checklist konsep." |
| 03 | Analisis Otomatis | "TradeLog menghitung R:R, win rate per konsep, dan menyajikan analytics yang actionable." |

**Design:**
- Layout: Horizontal steps dengan connecting line/arrow (desktop), vertical stack (mobile)
- Step number: Circle dengan gradient background
- Animasi: Progressive reveal on scroll (step 1 → 2 → 3)

### 5.6 Statistik / Social Proof Section

**Heading**: "Dipercaya oleh Trader"

| Metrik | Placeholder Value | Ikon |
|--------|-------------------|------|
| Total Trades Logged | 12,500+ | `TrendingUp` |
| Methods Published | 350+ | `BookOpen` |
| Active Traders | 1,200+ | `Users` |

**Design:**
- Layout: 3 kolom horizontal
- Angka: Counter animation (count-up effect) saat section masuk viewport
- Background: Gradient subtle atau pattern dots
- Font angka: Extra bold, ukuran besar

> [!NOTE]
> Semua angka adalah placeholder. Akan diganti dengan data real dari API setelah backend siap.

### 5.7 CTA Section

**Heading**: "Mulai Backtest Lebih Cerdas"
**Sub-heading**: "Gratis. Open source. Dibangun untuk trader, oleh trader."

| Properti | Detail |
|----------|--------|
| CTA Button | "Daftar Sekarang — Gratis" → navigasi ke `/register` |
| Background | Gradient indigo → violet, full-width |
| Animasi | Pulse/glow effect pada button |

### 5.8 Footer

| Kolom | Konten |
|-------|--------|
| Brand | Logo + tagline "Jurnal Backtest Trading Terpintar" |
| Navigasi | Method Library, Leaderboard, Dashboard |
| Legal | Terms of Service, Privacy Policy |
| Social | GitHub repository link |
| Copyright | `© 2026 TradeLog. All rights reserved.` |

**Design:**
- Background: Dark (lebih gelap dari body)
- Layout: 3-4 kolom (desktop), stack (mobile)
- Separator: Gradient line di atas footer

---

## 6. Design Requirements

### 6.1 Theme & Warna

| Token | Nilai | Penggunaan |
|-------|-------|------------|
| `--primary` | Gradient `indigo-600` → `violet-600` | CTA, headings, aksen |
| `--accent` | `cyan-400` | Highlight, secondary accent |
| `--background` | `slate-950` / `#0a0a0f` | Background utama |
| `--surface` | `slate-900` / `rgba(15,15,25,0.8)` | Card background |
| `--text-primary` | `slate-50` | Teks utama |
| `--text-secondary` | `slate-400` | Teks pendukung |
| `--border` | `slate-800` / `rgba(255,255,255,0.1)` | Border cards |
| `--success` | `emerald-500` | Elemen positif |
| `--destructive` | `red-500` | Elemen negatif |

### 6.2 Glassmorphism

```css
.glass-card {
  background: rgba(15, 15, 25, 0.6);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
}
```

### 6.3 Animasi

| Tipe | Detail |
|------|--------|
| Scroll animations | Fade-in + slide-up saat elemen masuk viewport (IntersectionObserver atau Framer Motion `whileInView`) |
| Floating elements | Translasi Y berulang (2-4s duration, ease-in-out) |
| Gradient shifts | Background gradient yang bergeser perlahan (hue-rotate atau keyframe) |
| Hover effects | Scale 1.02-1.05, border glow, shadow elevation |
| Counter animation | Count-up dari 0 ke target value saat Stats section masuk viewport |
| Page load | Staggered fade-in untuk Hero elements |

### 6.4 Tipografi

| Elemen | Font | Weight | Size (Desktop) |
|--------|------|--------|-----------------|
| H1 (Hero) | Inter | 800 (ExtraBold) | 56-64px |
| H2 (Section) | Inter | 700 (Bold) | 36-40px |
| H3 (Card title) | Inter | 600 (SemiBold) | 20-24px |
| Body | Inter | 400 (Regular) | 16-18px |
| Caption | Inter | 400 (Regular) | 14px |

### 6.5 Responsive

| Breakpoint | Lebar | Penyesuaian |
|------------|-------|-------------|
| Mobile | < 768px | Stack layout, hamburger menu, font size berkurang |
| Tablet | 768-1024px | 2-kolom grid, sidebar jika perlu |
| Desktop | > 1024px | Full layout, 4-kolom grid di fitur, horizontal steps |

---

## 7. SEO & Meta Tags

```html
<title>TradeLog — Jurnal Backtest Trading Terpintar</title>
<meta name="description" content="Platform journaling backtest trading yang menganalisis performa per konsep. Definisikan method, catat trade, dan dapatkan analytics yang actionable. Gratis & open source." />

<!-- Open Graph -->
<meta property="og:title" content="TradeLog — Jurnal Backtest Trading Terpintar" />
<meta property="og:description" content="Backtest lebih cerdas, analisis lebih tajam. Platform journaling untuk trader SMC, ICT, dan Price Action." />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://tradelog.app" />
<meta property="og:image" content="https://tradelog.app/og-image.png" />
<meta property="og:locale" content="id_ID" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="TradeLog — Jurnal Backtest Trading Terpintar" />
<meta name="twitter:description" content="Backtest lebih cerdas, analisis lebih tajam." />
<meta name="twitter:image" content="https://tradelog.app/og-image.png" />
```

**Semantic HTML:**
- Gunakan `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`
- Setiap section memiliki `id` untuk anchor navigation
- Heading hierarchy yang benar: satu `<h1>` di Hero, `<h2>` per section
- Alt text pada semua gambar/ilustrasi
- `aria-label` pada interactive elements

---

## 8. Komponen yang Dibutuhkan

| Komponen | Path | Tipe | Deskripsi |
|----------|------|------|-----------|
| `Navbar` | `components/landing/Navbar.tsx` | Client | Navigasi fixed, transparent → blur on scroll |
| `HeroSection` | `components/landing/HeroSection.tsx` | Server + Client (animasi) | Hero dengan headline, CTA, gradient background |
| `ProblemSection` | `components/landing/ProblemSection.tsx` | Server + Client (animasi) | Pain points dalam grid cards |
| `FeaturesSection` | `components/landing/FeaturesSection.tsx` | Server + Client (animasi) | 4 fitur utama cards |
| `HowItWorksSection` | `components/landing/HowItWorksSection.tsx` | Server + Client (animasi) | 3-step flow |
| `StatsSection` | `components/landing/StatsSection.tsx` | Client | Counter animation, intersection observer |
| `CTASection` | `components/landing/CTASection.tsx` | Server | Final call-to-action |
| `Footer` | `components/landing/Footer.tsx` | Server | Footer links, copyright |

### Struktur File

```
app/
├── (public)/
│   ├── layout.tsx            ← Public layout (Navbar + Footer)
│   └── page.tsx              ← Landing page (compose semua sections)
components/
└── landing/
    ├── Navbar.tsx
    ├── HeroSection.tsx
    ├── ProblemSection.tsx
    ├── FeaturesSection.tsx
    ├── HowItWorksSection.tsx
    ├── StatsSection.tsx
    ├── CTASection.tsx
    └── Footer.tsx
```

---

## 9. Acceptance Criteria

| # | Kriteria | Prioritas |
|---|----------|-----------|
| 1 | Landing page dapat diakses di route `/` tanpa autentikasi | P0 |
| 2 | Semua 7 sections ditampilkan dengan konten sesuai spesifikasi | P0 |
| 3 | CTA "Mulai Sekarang" mengarah ke `/register` | P0 |
| 4 | CTA "Lihat Leaderboard" mengarah ke `/leaderboard` | P0 |
| 5 | Navbar fixed dengan efek blur saat scroll | P0 |
| 6 | Dark mode sebagai default theme | P0 |
| 7 | Responsive di mobile, tablet, dan desktop | P0 |
| 8 | Scroll animations bekerja (fade-in on scroll) | P1 |
| 9 | Counter animation di Stats section | P1 |
| 10 | Glassmorphism effect pada cards | P1 |
| 11 | Gradient animasi di Hero background | P1 |
| 12 | SEO meta tags ter-render di HTML | P0 |
| 13 | Lighthouse Performance score ≥ 90 | P1 |
| 14 | Lighthouse Accessibility score ≥ 90 | P1 |
| 15 | Semantic HTML sesuai spesifikasi | P1 |

---

## 10. Verification & Testing

### 10.1 Visual Testing

- [ ] Screenshot comparison di 3 breakpoint (mobile 375px, tablet 768px, desktop 1440px)
- [ ] Verifikasi semua animasi berjalan smooth (60fps)
- [ ] Verifikasi gradient rendering di Chrome, Firefox, Safari
- [ ] Verifikasi glassmorphism effect (backdrop-filter support)

### 10.2 Functional Testing

- [ ] Semua link navigasi berfungsi
- [ ] CTA buttons mengarah ke halaman yang benar
- [ ] Navbar hamburger menu berfungsi di mobile
- [ ] Smooth scroll ke section saat klik nav link
- [ ] Counter animation trigger saat scroll ke Stats section

### 10.3 SEO Testing

- [ ] Validasi meta tags dengan [Meta Tags Debugger](https://metatags.io)
- [ ] Open Graph preview benar di Facebook Sharing Debugger
- [ ] Twitter Card preview benar di Twitter Card Validator
- [ ] Lighthouse SEO score ≥ 90

### 10.4 Performance Testing

- [ ] Lighthouse Performance ≥ 90
- [ ] First Contentful Paint (FCP) < 1.5s
- [ ] Largest Contentful Paint (LCP) < 2.5s
- [ ] Cumulative Layout Shift (CLS) < 0.1
- [ ] Bundle size landing page < 200KB (gzipped)

### 10.5 Accessibility Testing

- [ ] Keyboard navigation berfungsi penuh
- [ ] Screen reader dapat membaca semua konten
- [ ] Color contrast ratio ≥ 4.5:1 (WCAG AA)
- [ ] Focus indicators visible pada semua interactive elements
- [ ] Lighthouse Accessibility ≥ 90

---

## 11. Referensi ke PRD Lain

| PRD | Relasi |
|-----|--------|
| [PRD_Frontend.md](./PRD_Frontend.md) | Landing page adalah bagian dari route group `(public)`. Design system, komponen reusable (Button, dll.), dan layout public dibahas di PRD Frontend. |
| [PRD_Backend.md](./PRD_Backend.md) | Stats section (placeholder) akan diganti dengan data real dari API analytics. Endpoint yang digunakan: aggregasi publik total trades, methods, dan active traders. |

---

## 12. Out of Scope

- Internationalization (i18n) — UI hanya dalam Bahasa Indonesia untuk v1
- A/B testing pada CTA
- Blog / konten marketing
- Live chat / chatbot
- Video testimonial
- Pricing page (platform gratis untuk v1)
