"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Check, Plus, Trash2, Camera, Shield, Target, Award, Smile } from "lucide-react";
import { DatabaseManager } from "@/lib/mock-data";
import { TradingSession, Trade } from "@/types";

export default function NewTradePage() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<TradingSession | null>(null);
  
  // Form fields
  const [tradeDate, setTradeDate] = useState("2026-05-25");
  const [tradingSession, setTradingSession] = useState("NEW_YORK");
  const [entryPrice, setEntryPrice] = useState<number>(1.08500);
  const [slPrice, setSlPrice] = useState<number>(1.08350);
  const [tpPrice, setTpPrice] = useState<number>(1.08950);
  const [result, setResult] = useState<"win" | "loss" | "breakeven">("win");
  const [timeframe, setTimeframe] = useState("M15");
  const [notes, setNotes] = useState("");
  const [mood, setMood] = useState("DISCIPLINED");
  const [entryImage, setEntryImage] = useState<string>("");
  
  // Real-time calculations
  const [risk, setRisk] = useState(0);
  const [reward, setReward] = useState(0);
  const [rr, setRr] = useState(0);
  const [pnl, setPnl] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const segments = pathname.split("/");
    const sessionId = segments[segments.indexOf("sessions") + 1];

    if (sessionId) {
      const allSessions = DatabaseManager.getSessions();
      const foundSession = allSessions.find(s => s.id === sessionId);
      if (foundSession) {
        setSession(foundSession);
      }
    }
  }, [pathname]);

  // Recalculate R:R and PnL in real-time
  useEffect(() => {
    if (entryPrice && slPrice && tpPrice) {
      const isLong = tpPrice > entryPrice;
      
      const calculatedRisk = Math.abs(entryPrice - slPrice);
      const calculatedReward = Math.abs(tpPrice - entryPrice);
      
      setRisk(calculatedRisk);
      setReward(calculatedReward);
      
      const ratio = calculatedRisk > 0 ? calculatedReward / calculatedRisk : 0;
      setRr(parseFloat(ratio.toFixed(2)));

      // PnL calculation
      let calculatedPnl = 0;
      if (result === "win") {
        calculatedPnl = 200 * ratio; // Simulate +$200 per 1R risked
      } else if (result === "loss") {
        calculatedPnl = -200; // -$200 loss
      } else {
        calculatedPnl = 0; // Breakeven
      }
      setPnl(parseFloat(calculatedPnl.toFixed(0)));
    }
  }, [entryPrice, slPrice, tpPrice, result]);

  // Base64 file uploader
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEntryImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!entryPrice || !slPrice || !tpPrice) {
      setError("Semua level harga (Entry, SL, TP) wajib diisi");
      return;
    }

    setIsLoading(true);

    const newTrade: Trade = {
      id: `t-${Date.now()}`,
      sessionId: session!.id,
      methodId: "m-1", // default SMC method
      methodName: "SMC (Smart Money Concepts)",
      strategyId: "s-1-1", // default OB refinement strategy
      strategyName: "Order Block Refinement",
      pair: session!.notes.split(" ")[2] || "EURUSD",
      type: tpPrice > entryPrice ? "long" : "short",
      entryPrice,
      exitPrice: result === "win" ? tpPrice : result === "loss" ? slPrice : entryPrice,
      stopLoss: slPrice,
      takeProfit: tpPrice,
      rr,
      pnl,
      result,
      entryImage,
      notes,
      createdAt: new Date().toISOString()
    };

    setTimeout(() => {
      // Append trade
      const allTrades = DatabaseManager.getTrades();
      DatabaseManager.saveTrades([newTrade, ...allTrades]);

      // Update session stats
      const sessionTrades = [newTrade, ...allTrades.filter(t => t.sessionId === session!.id)];
      const wins = sessionTrades.filter(t => t.result === "win");
      const wr = sessionTrades.length > 0 ? (wins.length / sessionTrades.length) * 100 : 0;
      const profit = sessionTrades.reduce((sum, t) => sum + t.pnl, 0);

      const allSessions = DatabaseManager.getSessions();
      const updatedSessions = allSessions.map(s => {
        if (s.id === session!.id) {
          return {
            ...s,
            totalTrades: sessionTrades.length,
            winRate: parseFloat(wr.toFixed(1)),
            netProfit: profit,
            endBalance: s.startBalance + profit
          };
        }
        return s;
      });
      DatabaseManager.saveSessions(updatedSessions);

      router.push(`/sessions/${session!.id}`);
    }, 800);
  };

  if (!isClient) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-16 space-y-4">
        <h3 className="text-lg font-bold text-white">Sesi tidak ditemukan</h3>
        <Link href="/sessions" className="text-primary hover:underline text-xs font-semibold">
          Kembali ke Daftar Sesi
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      {/* Back Button */}
      <Link
        href={`/sessions/${session.id}`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Detail Sesi {session.name}
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          Catat Trade Log Baru
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Rekam eksekusi posisi secara instan untuk mempercepat proses uji kriteria backtesting.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-semibold">
          {error}
        </div>
      )}

      {/* Main Grid: Form + Sticky Preview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Container (2/3 width) */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 glass rounded-2xl border border-white/5 p-8 space-y-6 relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

          {/* Setup Inputs Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tanggal Transaksi</label>
              <input
                type="date"
                value={tradeDate}
                onChange={(e) => setTradeDate(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none transition-all text-zinc-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Sesi Waktu Trading</label>
              <select
                value={tradingSession}
                onChange={(e) => setTradingSession(e.target.value)}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none transition-all text-zinc-200"
              >
                <option value="ASIA">ASIA (Tokyo)</option>
                <option value="LONDON">LONDON (Killzone)</option>
                <option value="NEW_YORK">NEW YORK (Killzone)</option>
                <option value="LONDON_CLOSE">LONDON CLOSE</option>
              </select>
            </div>
          </div>

          {/* Price Levels Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Harga Masuk (Entry)</label>
              <input
                type="number"
                step="0.00001"
                value={entryPrice}
                onChange={(e) => setEntryPrice(parseFloat(e.target.value))}
                required
                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600 text-zinc-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-red-400" />
                Stop Loss (SL)
              </label>
              <input
                type="number"
                step="0.00001"
                value={slPrice}
                onChange={(e) => setSlPrice(parseFloat(e.target.value))}
                required
                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600 text-zinc-200"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Take Profit (TP)
              </label>
              <input
                type="number"
                step="0.00001"
                value={tpPrice}
                onChange={(e) => setTpPrice(parseFloat(e.target.value))}
                required
                className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600 text-zinc-200"
              />
            </div>
          </div>

          {/* Result & Timeframe & Mood */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Hasil Akhir</label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value as any)}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none transition-all text-zinc-200"
              >
                <option value="win">WIN (Profit penuh)</option>
                <option value="loss">LOSS (Rugi penuh)</option>
                <option value="breakeven">BREAKEVEN (Scratch)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Trigger Timeframe</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none transition-all text-zinc-200"
              >
                <option value="M1">M1</option>
                <option value="M5">M5</option>
                <option value="M15">M15</option>
                <option value="H1">H1</option>
                <option value="H4">H4</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                <Smile className="w-3.5 h-3.5 text-indigo-400" />
                Mood / Psikologi
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none transition-all text-zinc-200"
              >
                <option value="DISCIPLINED">🎯 DISIPLIN (Mengikuti Aturan)</option>
                <option value="RUSHED">😰 TERBURU-BURU (Fomo)</option>
                <option value="HESITANT">😟 RAGU-RAGU (Takut Kalah)</option>
              </select>
            </div>
          </div>

          {/* Screenshot Upload zone */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
              Unggah Bukti Transaksi (Screenshot Chart)
            </label>
            <div className="border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/20 rounded-2xl p-6 text-center cursor-pointer transition-all relative overflow-hidden group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {entryImage ? (
                <div className="relative rounded-xl overflow-hidden max-h-48">
                  <img
                    src={entryImage}
                    alt="Preview Screenshot"
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white font-bold bg-zinc-950/80 px-3 py-1.5 rounded-xl border border-white/10">Ubah Gambar</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1.5 py-4">
                  <Camera className="w-8 h-8 text-zinc-600 group-hover:text-zinc-500 transition-colors" />
                  <span className="text-xs text-zinc-400">Tarik gambar ke sini, atau klik untuk memilih file</span>
                  <span className="text-[10px] text-zinc-600">Mendukung format JPG, PNG, WEBP hingga 5MB</span>
                </div>
              )}
            </div>
          </div>

          {/* Trade Notes */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Catatan Tambahan (Komentar)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Tulis alasan masuk posisi, kriteria konfirmasi yang terlihat, atau refleksi psikologi..."
              rows={4}
              className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t border-zinc-900/60">
            <Link
              href={`/sessions/${session.id}`}
              className="px-5 py-2.5 rounded-xl border border-white/5 hover:border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs font-semibold transition-all"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-primary text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Simpan Catatan Trade
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Risk-Reward Sticky Preview Panel (1/3 width) */}
        <div className="lg:col-span-1 glass rounded-2xl border border-white/5 p-6 space-y-6 sticky top-24">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              Preview Risk-Reward
            </h3>
            <p className="text-xs text-zinc-500">Dihitung otomatis berdasarkan harga masuk & target penempatan level Anda.</p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center text-xs border-b border-zinc-900/60 pb-3">
              <span className="text-zinc-500 font-medium">Jarak Risk (Point)</span>
              <span className="font-bold text-red-400 font-mono">{(risk * 100000).toFixed(0)} Pips</span>
            </div>

            <div className="flex justify-between items-center text-xs border-b border-zinc-900/60 pb-3">
              <span className="text-zinc-500 font-medium">Jarak Reward (Point)</span>
              <span className="font-bold text-emerald-400 font-mono">{(reward * 100000).toFixed(0)} Pips</span>
            </div>

            <div className="flex justify-between items-center text-xs border-b border-zinc-900/60 pb-3">
              <span className="text-zinc-500 font-medium">Rasio R:R Target</span>
              <span className="font-extrabold text-white font-mono">1 : {rr}</span>
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-zinc-500 font-medium">Potensi PnL Estimasi</span>
              <span className={`text-base font-bold font-mono ${pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {pnl >= 0 ? "+" : ""}${pnl}
              </span>
            </div>
          </div>

          {/* Alert check */}
          <div className={`p-4 rounded-xl text-[11px] font-semibold border ${
            rr >= 2 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-amber-500/10 border-amber-500/20 text-amber-400"
          }`}>
            {rr >= 2 
              ? "✔ Rasio Risk-to-Reward solid! Target ≥ 1:2 terpenuhi."
              : "⚠ Rasio Risk-to-Reward rendah. Target di bawah standar minimum 1:2."
            }
          </div>
        </div>
      </div>
    </div>
  );
}
