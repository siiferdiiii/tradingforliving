# Product Requirements Document (PRD)
## TradeLog — Trading Backtest Journal Platform

**Versi:** 1.0  
**Tanggal:** Mei 2026  
**Status:** Draft

---

## 1. Overview

### 1.1 Problem Statement

Trader yang melakukan backtest manual menghadapi masalah berulang:

- Setiap kali menambahkan data backtest, mereka harus mengisi ulang field yang sama (metode, strategi, aturan entry/exit)
- Tidak ada cara mudah untuk menganalisis performa per sub-konsep teknikal (misal: IFVG M5 vs IFVG M1)
- Tidak ada platform yang mendukung R:R dinamis (bukan fixed ratio)
- Tidak ada standar untuk menyimpan bukti visual setup (foto before & after)
- Sulit membandingkan performa antar trader dengan metode yang sama

### 1.2 Solusi

TradeLog adalah platform journaling backtest trading berbasis web yang memungkinkan trader untuk:

1. Mendefinisikan metode teknikal dan strategi **sekali**, lalu menggunakannya berulang kali di sesi backtest
2. Melacak performa per sub-konsep teknikal secara otomatis
3. Mendukung R:R dinamis (dihitung dari data aktual, bukan target)
4. Mewajibkan upload foto setup (before & after) sebagai standar dokumentasi
5. Berbagi metode dan melihat performa publik di leaderboard

### 1.3 Target User

- Trader retail yang aktif melakukan backtest manual
- Trader yang belajar price action, SMC (Smart Money Concepts), ICT, atau metode teknikal lainnya
- Komunitas trader yang ingin saling berbagi dan membandingkan strategi

---

## 2. Goals & Non-Goals

### Goals

- Mengurangi friction input data backtest secara signifikan
- Memberikan analitik performa yang breakdown per sub-konsep
- Mendorong dokumentasi visual yang konsisten (foto before & after wajib)
- Membangun komunitas berbasis data performa, bukan klaim subjektif

### Non-Goals

- Tidak terintegrasi dengan data chart real-time (TradingView, broker, dll)
- Tidak ada fitur copy trading atau sinyal trading
- Tidak ada monetisasi (gratis sepenuhnya)
- Tidak ada paper trading atau live trading

---

## 3. User Roles

| Role | Deskripsi |
|---|---|
| **Trader (User)** | Membuat metode, strategi, dan mengisi data backtest |
| **Visitor (Publik)** | Melihat leaderboard dan metode yang dipublikasikan, tanpa akun |

---

## 4. Core Features

### 4.1 Setup Layer — Method & Strategy Builder

Dikerjakan sekali, dipakai berulang kali di semua sesi backtest.

#### 4.1.1 Technical Method

Field yang wajib diisi saat membuat metode:

| Field | Tipe | Keterangan |
|---|---|---|
| Nama Metode | Text | Contoh: "IFVG", "Order Block", "Breaker" |
| Deskripsi | Textarea | Penjelasan konsep |
| Timeframe Utama | Multi-select | H4, H1, M15, M5, M1, dll |
| Visibility | Toggle | Private / Publik |
| Tags | Text | Label bebas untuk filtering |

#### 4.1.2 Strategy Builder

Setiap metode bisa memiliki satu atau lebih strategi. Strategy mendefinisikan:

| Field | Tipe | Keterangan |
|---|---|---|
| Nama Strategi | Text | Contoh: "IFVG M5 → M1 Entry" |
| Trigger Entry | Text/Enum | Konfirmasi apa yang dibutuhkan sebelum entry |
| Aturan SL | Text | Cara penentuan Stop Loss |
| Aturan TP | Text | Cara penentuan Take Profit |
| Konsep Opsional | Multi-input | Tambahkan sub-konsep bebas (CISD, Displacement, MSS, dll) |
| Sesi Trading | Multi-select | Asia, London, New York, London Close |

**Catatan penting:** Field konsep opsional di strategi akan muncul sebagai checklist di sesi backtest, memungkinkan analitik per konsep.

---

### 4.2 Backtest Session Layer — Input Per Trade

Setelah memilih metode dan strategi, user hanya perlu mengisi data yang berubah per trade.

#### 4.2.1 Sesi Backtest

| Field | Tipe | Keterangan |
|---|---|---|
| Nama Sesi | Text | Contoh: "Backtest IFVG Juni 2025" |
| Metode | Dropdown | Pilih dari metode yang sudah dibuat |
| Strategi | Dropdown | Pilih dari strategi dalam metode tersebut |
| Instrumen | Text | XAUUSD, NQ, EUR/USD, dll |
| Periode Backtest | Date range | Rentang tanggal data historis yang diuji |

#### 4.2.2 Input Per Trade (dalam sesi)

**Field Wajib:**

| Field | Tipe | Keterangan |
|---|---|---|
| Tanggal & Jam | DateTime | Waktu entry (atau candle setup) |
| Sesi | Enum | Asia / London / New York / London Close |
| Price Entry | Number | Harga entry aktual |
| Stop Loss (SL) | Number | Harga SL aktual |
| Take Profit (TP) | Number | Harga TP aktual |
| Hasil | Enum | Win / Loss / Breakeven / Partial |
| Close Price | Number | Harga actual close posisi |
| Foto Before | Image upload | Screenshot chart sebelum entry — **WAJIB** |
| Foto After | Image upload | Screenshot chart setelah close — **WAJIB** |

**Field Otomatis (dihitung sistem):**

| Field | Cara Hitung | Keterangan |
|---|---|---|
| Risk (pips/point) | \|Entry - SL\| | Jarak entry ke SL |
| Reward (pips/point) | \|TP - Entry\| | Jarak entry ke TP |
| R:R Target | Reward / Risk | R:R yang direncanakan |
| Actual R | \|Close - Entry\| / Risk | R:R yang benar-benar terjadi |

> **Catatan R:R Dinamis:** Sistem tidak mengunci R:R sebagai target. R aktual dihitung dari harga close yang diinput user. Ini memungkinkan pelacakan partial close, trailing stop, dan exit awal/terlambat.

**Field Opsional (dikonfigurasi dari strategi):**

| Field | Tipe | Keterangan |
|---|---|---|
| Konsep tambahan | Checklist | Dari daftar konsep yang didefinisikan di strategi (CISD, MSS, dll) |
| Timeframe Trigger | Dropdown | Dari timeframe yang didefinisikan di metode |
| Catatan | Textarea | Observasi bebas per trade |
| Mood/Kondisi | Enum | Opsional: Disiplin / Terburu-buru / Ragu |

---

### 4.3 Performance Analytics Layer

Semua analitik dihasilkan otomatis dari data yang diinput. Tidak ada perhitungan manual.

#### 4.3.1 Dashboard Utama

- Total trade, win rate keseluruhan, rata-rata R aktual
- Equity curve (berdasarkan R aktual per trade)
- Breakdown per metode dan strategi

#### 4.3.2 Analitik Per Sub-Konsep

Ini adalah fitur inti yang membedakan TradeLog dari jurnal biasa.

**Contoh:** Dari strategi "IFVG M5 → M1 Entry" yang memiliki konsep CISD dan MSS:

| Konsep | Total Trade | Win | Win Rate | Avg R Aktual |
|---|---|---|---|---|
| CISD ✓ | 45 | 32 | 71% | 1.8R |
| CISD ✗ | 23 | 11 | 48% | 0.9R |
| MSS ✓ | 38 | 28 | 74% | 2.1R |
| MSS ✗ | 30 | 15 | 50% | 1.0R |

Insight: "Trade dengan CISD + MSS memiliki win rate 74%, tanpa keduanya hanya 43%"

#### 4.3.3 Analitik Per Timeframe Trigger

Jika metode memiliki beberapa timeframe:

| Trigger TF | Total | Win Rate | Avg R |
|---|---|---|---|
| M1 | 30 | 53% | 1.2R |
| M5 | 38 | 68% | 1.9R |
| M15 | 12 | 75% | 2.3R |

#### 4.3.4 Analitik Per Sesi Trading

| Sesi | Total | Win Rate | Avg R |
|---|---|---|---|
| London | 40 | 70% | 2.0R |
| New York | 35 | 57% | 1.4R |
| Asia | 10 | 40% | 0.8R |

#### 4.3.5 Distribusi R Aktual

Histogram distribusi R aktual untuk melihat pola:
- Berapa banyak trade yang exit di < 1R (terlalu cepat)
- Berapa banyak yang di > 2R (menunggu TP penuh)
- Outlier win/loss

---

### 4.4 Fitur Sosial & Publik

#### 4.4.1 Method Library (Publik)

- Trader bisa mempublikasikan metode mereka
- Visitor dan user lain bisa melihat deskripsi, strategi, dan statistik agregat metode tersebut
- Foto trade individual tidak ditampilkan di publik (hanya statistik)

#### 4.4.2 Leaderboard

Leaderboard diurutkan berdasarkan metrik yang bisa dipilih:

| Metrik | Keterangan |
|---|---|
| Win Rate | % trade yang profit |
| Avg R Aktual | Rata-rata R yang dicapai per trade |
| Total Sample | Jumlah trade yang dibacktest |
| Consistency Score | Kombinasi win rate + sample size (anti-manipulasi) |

> **Catatan:** Leaderboard hanya menampilkan akun dengan minimum 30 trade untuk menghindari sample size yang tidak representatif.

#### 4.4.3 Profil Publik

Setiap user memiliki halaman profil publik yang menampilkan:

- Metode yang dipublikasikan
- Statistik agregat (bukan detail trade)
- Bio singkat

---

## 5. User Flow

### Flow 1: Setup Awal (Sekali Dilakukan)

```
Daftar/Login
    → Buat Technical Method (nama, timeframe, deskripsi)
    → Buat Strategy di dalam method tersebut (entry rule, SL/TP rule, konsep opsional)
    → Method siap dipakai
```

### Flow 2: Sesi Backtest

```
Buat Sesi Backtest (pilih method + strategy, instrumen, periode)
    → Tambah trade satu per satu:
        → Isi field wajib (tanggal, entry, SL, TP, hasil, close price)
        → Upload foto Before (wajib)
        → Upload foto After (wajib)
        → Centang konsep opsional yang terpenuhi
        → Sistem hitung R:R otomatis
    → Lanjut ke trade berikutnya
```

### Flow 3: Review Performa

```
Buka dashboard
    → Pilih method/strategy yang ingin dianalisis
    → Lihat breakdown per konsep, timeframe, sesi
    → Identifikasi setup dengan probabilitas tertinggi
```

---

## 6. Technical Considerations

### 6.1 Image Storage

- Foto before & after dikompresi dan disimpan di cloud storage
- Format yang diterima: JPG, PNG, WEBP
- Ukuran maksimal per foto: 10 MB
- Foto ditampilkan dalam gallery per trade, bisa di-zoom

### 6.2 Data Model (High-Level)

```
User
 └── Method (banyak)
      └── Strategy (banyak per method)
           └── BacktestSession (banyak per strategy)
                └── Trade (banyak per sesi)
                     ├── TradeImage (before & after, wajib)
                     └── TradeConcept (konsep yang dichecklist)
```

### 6.3 Kalkulasi R:R

```
risk_pips    = |entry_price - sl_price|
reward_pips  = |tp_price - entry_price|
rr_target    = reward_pips / risk_pips

actual_r     = |close_price - entry_price| / risk_pips
  → Positif jika profit, negatif jika loss
```

---

## 7. Out of Scope (V1)

Fitur berikut tidak akan dibangun di versi pertama:

- Integrasi TradingView atau broker API
- Forward testing / live journal
- Mobile app (web-first, responsive)
- Multiple akun / tim / workspace bersama
- Export ke PDF/Excel (pertimbangkan V2)
- Notifikasi atau reminder

---

## 8. Success Metrics

| Metrik | Target (3 bulan setelah launch) |
|---|---|
| Registered Users | 500+ |
| Trade entries | 10.000+ |
| Method yang dipublikasikan | 100+ |
| Retention (kembali minggu ke-2) | > 40% |
| Avg trade per aktif user | > 20 |

---

## 9. Open Questions

1. Apakah perlu fitur **import bulk trade** dari CSV untuk backdating? tidak perlu
2. Apakah foto yang sudah diupload bisa diedit/diganti setelah disimpan? tidak
3. Bagaimana menangani **partial close** — apakah satu trade bisa punya multiple close price? ya bisa multipel close
4. Apakah leaderboard perlu dipisah per instrumen (XAUUSD vs Forex vs Indices)? ya
5. Apakah ada batas maksimal jumlah konsep opsional per strategi? tidak ada

---

*Dokumen ini adalah living document dan akan diperbarui seiring diskusi lebih lanjut.*
