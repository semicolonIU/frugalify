# Frugalify — All-in-One Financial Recap & Frugal Living Dashboard

> Aplikasi rekap keuangan personal mobile-first yang mendukung gaya hidup **frugal living** berbasis **Next.js 14+ App Router**, **Google Gemini Multimodal AI**, **Appwrite**, dan **Live Stock Market Data (IDX)**.

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 🤖 **AI Universal Receipt Scanner** | Scan struk fisik, screenshot Shopee, GoPay, BCA Mobile via Gemini Vision |
| 📊 **Bibit Portfolio Scanner** | Scan screenshot Bibit → ekstrak Ticker & Lot secara otomatis |
| 📈 **Live Stock Prices** | Harga saham IDX real-time via Yahoo Finance API |
| 💰 **Net Worth Tracker** | Kas + Bank + Portofolio Saham dikalkulasi otomatis |
| 🎯 **Financial Living Score** | Skor frugal living berbasis rasio pengeluaran & investasi |
| 💬 **Dynamic AI Quote** | Quote motivasi blak-blakan via Gemini API sesuai status keuangan |
| ✏️ **UX Guardrail Form** | Review & edit data AI sebelum disimpan ke database |

---

## 🚀 Cara Menjalankan

### 1. Clone / Buka folder project

```bash
cd "c:\Users\ahmad.LAPTOP-ABDLSPA1.000\.gemini\antigravity\scratch\Fiancial-Management"
```

### 2. Install dependencies

```bash
npm install
```

### 3. Konfigurasi API Keys

Buka file `.env.local` dan isi:

```env
GEMINI_API_KEY=isi_gemini_api_key_kamu_disini
NEXT_PUBLIC_GEMINI_API_KEY=isi_gemini_api_key_kamu_disini

# Opsional — Appwrite (kosongkan jika mau pakai localStorage fallback)
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_DATABASE_ID=financial_db
```

> **Tanpa API Key pun bisa jalan** — aplikasi menggunakan mock data dan fallback quotes otomatis untuk preview.

### 4. Jalankan Dev Server

```bash
npm run dev
```

Buka browser: **http://localhost:3000**

---

## 🧰 Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| **AI Engine** | Google Gemini API (`@google/genai`) — Multimodal Vision |
| **Database** | Appwrite Cloud + localStorage Fallback |
| **Market Data** | Yahoo Finance API (IDX) |
| **Icons** | Lucide React |
| **Animations** | Framer Motion, canvas-confetti |

---

## 📁 Struktur Proyek

```
src/
├── app/
│   ├── layout.tsx          # Root layout + SEO metadata
│   ├── page.tsx            # Main dashboard page
│   ├── globals.css         # Dark glassmorphism global styles
│   └── api/
│       ├── scan/receipt/   # POST → Gemini receipt scanner
│       ├── scan/portfolio/ # POST → Gemini Bibit portfolio scanner
│       ├── quote/          # POST → Gemini dynamic quote
│       └── stocks/         # GET  → Live IDX stock prices
├── components/
│   ├── Header.tsx               # Top app bar dengan status badge
│   ├── MacroCards.tsx           # Net Worth, Pengeluaran, Financial Score
│   ├── QuoteBanner.tsx          # Dynamic AI quote banner
│   ├── DualColumnDashboard.tsx  # Expenses history + Portfolio table
│   ├── ScanReceiptModal.tsx     # Upload & scan bukti transaksi
│   ├── ScanPortfolioModal.tsx   # Upload & scan screenshot Bibit
│   ├── InteractiveFormModal.tsx # UX Guardrail edit form
│   ├── SettingsModal.tsx        # Budget & saldo settings
│   └── FloatingBottomNav.tsx   # Mobile bottom navigation
└── lib/
    ├── types.ts        # TypeScript interfaces
    ├── appwrite.ts     # Appwrite SDK init
    ├── storage.ts      # localStorage persistence + mock data
    ├── gemini.ts       # Gemini AI functions
    ├── stocks.ts       # Live stock market module
    └── frugalScore.ts  # Financial Living Score algorithm
```

---

## 🔑 Cara Mendapatkan Gemini API Key

1. Buka [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Klik **Create API Key**
3. Copy dan paste ke `.env.local`

---

## 📱 Mobile-First Design

Aplikasi dioptimalkan untuk tampilan mobile:
- **Floating Bottom Navigation** mirip aplikasi native iOS/Android
- **Glass morphism dark theme** premium
- **Responsive grid**: Single column di mobile, dual column di desktop
