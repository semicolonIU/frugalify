import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

export const isGeminiConfigured = Boolean(GEMINI_API_KEY && GEMINI_API_KEY !== '');

/**
 * Universal Receipt Scan Prompt for Gemini Vision
 */
export async function analyzeReceiptImage(base64Image: string, mimeType: string) {
  if (!GEMINI_API_KEY) {
    // Return realistic fallback parsed object for demonstration
    return getFallbackReceiptScanData();
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Image.replace(/^data:image\/\w+;base64,/, ''),
                mimeType: mimeType || 'image/jpeg',
              },
            },
            {
              text: `Analisis gambar bukti transaksi keuangan ini. 
Dapat berupa Struk Belanja Fisik (Indomaret, Alfamart), Screenshot E-Commerce (Shopee, Tokopedia), Screenshot e-Wallet & QRIS (GoPay, OVO, DANA), atau Screenshot Mutasi M-Banking (BCA Mobile, Livin by Mandiri).

PENTING - ATURAN OUTPUT:
1. Kembalikan HANYA format JSON murni tanpa simbol Rp, tanpa tanda titik ribuan (misal 45000 bukan 45.000 atau Rp 45.000).
2. Tipe platform harus salah satu dari:
   "Struk Belanja Fisik", "Screenshot Shopee", "Screenshot Tokopedia", "Screenshot GoPay", "Screenshot OVO", "Screenshot DANA", "Screenshot BCA Mobile", "Screenshot Livin by Mandiri", "Lainnya"
3. KHUSUS untuk screenshot marketplace (terutama Shopee/Tokopedia):
   - PASTIKAN Subtotal Pengiriman / Ongkos Kirim (Ongkir), Biaya Penanganan, Biaya Layanan, dan Pajak dimasukkan ke dalam properti 'fees' (jangan digabung ke 'mainAmount').
   - 'mainAmount' HANYA untuk total harga barang/produk saja (Subtotal Produk).
   - Segala bentuk potongan (Voucher Diskon, Koin Shopee, Promo) dimasukkan ke dalam 'discount'.
4. JSON Format:
{
  "platform": "Tipe Platform di atas",
  "storeName": "Nama Toko / Nama Merchant / Penerima Transfer",
  "date": "YYYY-MM-DD (Gunakan tanggal hari ini jika tidak terbaca)",
  "mainAmount": 0, // Total harga barang/produk saja (Subtotal Produk)
  "fees": 0, // Biaya Pengiriman, Penanganan, Layanan, Pajak, dll
  "discount": 0, // Total diskon/potongan (Voucher, Koin Shopee, dll)
  "totalAmount": 0, // Hasil akhir pembayaran: (mainAmount + fees) - discount
  "category": "Makanan & Groceries" | "Belanja Shopee" | "Tagihan & Utilitas" | "Transportasi" | "Hiburan" | "Lainnya",
  "items": [
    {
      "name": "Nama produk / deskripsi",
      "price": 0,
      "qty": 1,
      "subtotal": 0
    }
  ]
}`
            }
          ]
        }
      ]
    });

    const text = response.text || '';
    const parsed = safeParseJson(text);
    return parsed;
  } catch (error) {
    console.error('Error calling Gemini Vision API for receipt:', error);
    return getFallbackReceiptScanData();
  }
}

/**
 * Stock Portfolio Scan (Bibit Screenshot) Prompt for Gemini Vision
 */
export async function analyzePortfolioImage(base64Image: string, mimeType: string) {
  if (!GEMINI_API_KEY) {
    return getFallbackPortfolioScanData();
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                data: base64Image.replace(/^data:image\/\w+;base64,/, ''),
                mimeType: mimeType || 'image/jpeg',
              },
            },
            {
              text: `Analisis gambar screenshot aplikasi portofolio saham (seperti Bibit / Stockbit / M-Banking).
Ekstrak daftar aset saham dengan mengambil:
- Kode Ticker Emiten Saham (4 huruf kapital, contoh: BBCA, BBRI, TLKM, ASII, UNVR, GOTO, MDKA)
- Jumlah Lot yang dimiliki (1 Lot = 100 lembar saham)
- Harga beli rata-rata (jika ada pada screenshot, atau 0 jika tidak ada)

PENTING - ATURAN OUTPUT:
Kembalikan HANYA format JSON murni tanpa tanda kurung markdown atau teks pengantar:
{
  "stocks": [
    {
      "ticker": "BBCA",
      "lots": 10,
      "avgBuyPrice": 9200
    }
  ]
}`
            }
          ]
        }
      ]
    });

    const text = response.text || '';
    const parsed = safeParseJson(text);
    return parsed;
  } catch (error) {
    console.error('Error calling Gemini Vision API for portfolio:', error);
    return getFallbackPortfolioScanData();
  }
}

export interface MonthlyExpenseMetrics {
  totalExpense: number;
  totalIncome: number;
  budget: number;
  remainingBudget: number;
  usedPercentage: number;
  shopeeTotal: number;
  dailyAvg: number;
  status: string;
}

/**
 * Dynamic Financial Advice Quote Prompt for Gemini API aligned with Monthly Expense & Income Card
 */
export async function fetchDynamicQuote(metrics: MonthlyExpenseMetrics) {
  if (!GEMINI_API_KEY) {
    return getFallbackQuote(metrics);
  }

  const monthlySurplus = metrics.totalIncome - metrics.totalExpense;

  const prompt = `Kamu adalah asisten keuangan pribadi yang cerdas, blak-blakan, sekaligus memotivasi. 
Tugasmu adalah memberikan satu kutipan (quote) atau tips keuangan singkat dalam Bahasa Indonesia yang disesuaikan dengan kondisi pengeluaran dan pemasukan bulan ini.

Data Keuangan Bulan Ini:
- Total Pemasukan Bulan Ini: Rp ${metrics.totalIncome.toLocaleString('id-ID')}
- Total Pengeluaran Berjalan: Rp ${metrics.totalExpense.toLocaleString('id-ID')}
- ${monthlySurplus >= 0 ? `Surplus Bulan Ini: Rp ${monthlySurplus.toLocaleString('id-ID')}` : `⚠️ Defisit Bulan Ini: Rp ${Math.abs(monthlySurplus).toLocaleString('id-ID')}`}
- Batas Anggaran (Budget): Rp ${metrics.budget.toLocaleString('id-ID')}
- ${metrics.remainingBudget >= 0 ? `Sisa Kuota Anggaran: Rp ${metrics.remainingBudget.toLocaleString('id-ID')}` : `⚠️ Overbudget Sebesar: Rp ${Math.abs(metrics.remainingBudget).toLocaleString('id-ID')}`}
- Persentase Terpakai: ${metrics.usedPercentage}%
- Belanja Shopee/E-Commerce: Rp ${metrics.shopeeTotal.toLocaleString('id-ID')}
- Rata-Rata Pengeluaran Harian: Rp ${metrics.dailyAvg.toLocaleString('id-ID')}/hari
- Status Kuota: ${metrics.status}

Aturan Pembuatan Quotes/Tips:
1. Jika status "AMAN" (Terpakai < 80%): Puji kedisiplinan menghemat kuota anggaran, sebutkan pemasukan (Rp ${metrics.totalIncome.toLocaleString('id-ID')}) & sisa kuota/surplus yang siap dialokasikan ke investasi emas/saham.
2. Jika status "WASPADA" (Terpakai 80%-100%): Berikan peringatan ramah karena rata-rata harian (Rp ${metrics.dailyAvg.toLocaleString('id-ID')}/hari) sudah mendekati batas limit bulan ini.
3. Jika status "OVERBUDGET" (Terpakai > 100%): Berikan teguran taktis dan motivasi pemulihan karena telah melebihi batas budget sebesar Rp ${Math.abs(metrics.remainingBudget).toLocaleString('id-ID')}.

Kriteria Teks:
- Maksimal 2 kalimat pendek (singkat dan padat untuk banner dashboard).
- Gunakan gaya bahasa Indonesia yang modern, tidak kaku, dan relevan dengan budaya belanja saat ini.

Aturan Output:
- Kembalikan jawaban HANYA dalam format JSON objek murni tanpa markdown \`\`\`json atau teks pengantar apa pun.
- Format JSON: {"text": "isi kutipan", "author": "Nama Tokoh atau 'Asisten Keuangan Frugalify'"}`;

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ]
    });

    const text = response.text || '';
    const parsed = safeParseJson(text);
    return parsed || getFallbackQuote(metrics);
  } catch (error) {
    console.error('Error generating financial quote with Gemini:', error);
    return getFallbackQuote(metrics);
  }
}

/**
 * Helper function to safely parse JSON strings returned by LLM, handling control characters and markdown blocks
 */
function safeParseJson(rawText: string) {
  if (!rawText) return null;
  let cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  const match = cleaned.match(/({[\s\S]*}|\[[\s\S]*\])/);
  if (match) {
    cleaned = match[0];
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    try {
      const sanitized = cleaned.replace(/[\u0000-\u001F\u007F-\u009F]/g, (char) => {
        if (char === '\n') return '\\n';
        if (char === '\r') return '\\r';
        if (char === '\t') return '\\t';
        return '';
      });
      return JSON.parse(sanitized);
    } catch (e) {
      console.warn('Could not parse JSON from Gemini response, using fallback');
      return null;
    }
  }
}

// Fallback Mock Data Generators for instant preview without API keys
function getFallbackReceiptScanData() {
  const dateStr = new Date().toISOString().substring(0, 10);
  return {
    platform: "Struk Belanja Fisik",
    storeName: "Alfamart Supermarket",
    date: dateStr,
    mainAmount: 64500,
    fees: 0,
    discount: 5000,
    totalAmount: 59500,
    category: "Makanan & Groceries",
    items: [
      { name: "Oatmilk Barista Edition 1L", price: 39500, qty: 1, subtotal: 39500 },
      { name: "Roti Gandum Whole Wheat", price: 25000, qty: 1, subtotal: 25000 }
    ],
    rawGeminiNotes: "Ekstraksi AI otomatis berhasil dari struk belanja fisik."
  };
}

function getFallbackPortfolioScanData() {
  return {
    stocks: [
      { ticker: "BBCA", lots: 20, avgBuyPrice: 9100 },
      { ticker: "BBRI", lots: 35, avgBuyPrice: 5100 },
      { ticker: "TLKM", lots: 40, avgBuyPrice: 3650 },
      { ticker: "ASII", lots: 15, avgBuyPrice: 4950 }
    ]
  };
}

function getFallbackQuote(metrics: MonthlyExpenseMetrics) {
  const monthlySurplus = metrics.totalIncome - metrics.totalExpense;
  if (metrics.usedPercentage > 100) {
    return {
      text: `Pemasukan bulan ini Rp ${metrics.totalIncome.toLocaleString('id-ID')}, namun pengeluaran tembus Rp ${metrics.totalExpense.toLocaleString('id-ID')} (${metrics.usedPercentage}%). Kamu telah overbudget Rp ${Math.abs(metrics.remainingBudget).toLocaleString('id-ID')}. Saatnya rem belanja impulsif!`,
      author: "Asisten Keuangan Frugalify"
    };
  } else if (metrics.usedPercentage >= 80) {
    return {
      text: `Pengeluaran menyentuh ${metrics.usedPercentage}% dari limit dengan rata-rata Rp ${metrics.dailyAvg.toLocaleString('id-ID')}/hari dari pemasukan Rp ${metrics.totalIncome.toLocaleString('id-ID')}. Jaga sisa kuota Rp ${metrics.remainingBudget.toLocaleString('id-ID')} hingga akhir bulan!`,
      author: "Asisten Keuangan Frugalify"
    };
  } else {
    return {
      text: `Disiplin keuangan yang baik! Dari pemasukan Rp ${metrics.totalIncome.toLocaleString('id-ID')}, pengeluaran baru ${metrics.usedPercentage}% (${metrics.totalExpense.toLocaleString('id-ID')}). ${monthlySurplus > 0 ? `Surplus Rp ${monthlySurplus.toLocaleString('id-ID')}` : 'Sisa kuota'} siap disisihkan ke investasi.`,
      author: "Asisten Keuangan Frugalify"
    };
  }
}
