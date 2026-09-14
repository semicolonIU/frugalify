import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PrivacyProvider } from "@/components/PrivacyProvider";

export const metadata: Metadata = {
  title: "Frugalify - All-in-One Financial & Investment Portfolio Recap",
  description: "Aplikasi rekap keuangan personal mobile-first pendukung gaya hidup frugal living. Menggabungkan universal AI scan bukti transaksi dan pelacakan portofolio investasi real-time.",
  keywords: ["frugal living", "rekap keuangan", "scan struk AI", "portofolio investasi", "keuangan personal", "gemini ai financial dashboard"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body className="min-h-screen antialiased selection:bg-emerald-500 selection:text-slate-950 transition-colors duration-300">
        <ThemeProvider>
          <PrivacyProvider>
            {children}
          </PrivacyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
