import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TradeLog — Jurnal Backtest Trading Terpintar",
  description:
    "Platform journaling backtest trading yang membantu trader menganalisis performa per sub-konsep teknikal, dengan R:R dinamis dan dokumentasi visual wajib.",
  keywords: [
    "backtest",
    "trading journal",
    "trading",
    "SMC",
    "ICT",
    "price action",
    "jurnal trading",
  ],
  openGraph: {
    title: "TradeLog — Jurnal Backtest Trading Terpintar",
    description:
      "Definisi metode sekali, pakai berulang. Analitik performa otomatis per sub-konsep teknikal.",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
