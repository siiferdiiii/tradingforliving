"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Sparkles, Layers, Globe, Lock } from "lucide-react";
import { DatabaseManager } from "@/lib/mock-data";
import { Method } from "@/types";

export default function NewMethodPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTfs, setSelectedTfs] = useState<string[]>(["M15", "H1", "H4"]);
  const [isPublic, setIsPublic] = useState(false);
  const [error, setError] = useState("");

  const timeframes = ["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1", "MN"];

  const handleTfToggle = (tf: string) => {
    if (selectedTfs.includes(tf)) {
      setSelectedTfs(selectedTfs.filter(t => t !== tf));
    } else {
      setSelectedTfs([...selectedTfs, tf]);
    }
  };

  const handleNextStep = () => {
    setError("");
    if (step === 1) {
      if (name.trim().length < 3) {
        setError("Nama metode minimal 3 karakter");
        return;
      }
    }
    if (step === 2) {
      if (selectedTfs.length === 0) {
        setError("Pilih minimal 1 timeframe");
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setError("");
    setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 3) {
      setError("Nama metode minimal 3 karakter");
      return;
    }
    if (selectedTfs.length === 0) {
      setError("Pilih minimal 1 timeframe");
      return;
    }

    const newMethod: Method = {
      id: `m-${Date.now()}`,
      name,
      description,
      winRate: 0, // new method has no trades initially
      profitFactor: 0,
      totalTrades: 0,
      avgR: 0,
      isPublic,
      creatorId: "user-1",
      creatorName: "Alex Rivera",
      createdAt: new Date().toISOString(),
      strategiesCount: 0
    };

    const currentMethods = DatabaseManager.getMethods();
    DatabaseManager.saveMethods([...currentMethods, newMethod]);

    router.push(`/methods/${newMethod.id}`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
      {/* Back Button */}
      <Link
        href="/methods"
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Metode
      </Link>

      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          Buat Metode Baru
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Definisikan model trading, timeframe target, dan model visibilitas.
        </p>
      </div>

      {/* Step Indicators */}
      <div className="relative flex justify-between items-center bg-zinc-950/40 px-6 py-4 rounded-2xl border border-white/5">
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-[2px] bg-zinc-800 z-0" />
        <div 
          className="absolute left-6 top-1/2 -translate-y-1/2 h-[2px] bg-gradient-to-r from-primary to-accent-violet z-0 transition-all duration-300"
          style={{ width: `${((step - 1) / 3) * 100}%` }}
        />

        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="relative z-10 flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
              s < step 
                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                : s === step 
                ? "bg-zinc-950 border-primary text-primary" 
                : "bg-zinc-950 border-zinc-800 text-zinc-500"
            }`}>
              {s < step ? <Check className="w-4 h-4" /> : s}
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${s === step ? "text-primary" : "text-zinc-500"}`}>
              {s === 1 ? "Nama" : s === 2 ? "Timeframe" : s === 3 ? "Akses" : "Selesai"}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-semibold">
          {error}
        </div>
      )}

      {/* Wizard Form Cards */}
      <div className="glass rounded-2xl border border-white/5 p-8 relative overflow-hidden">
        {/* Decor */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                Nama & Deskripsi Metode
              </h3>
              <p className="text-xs text-zinc-500">Berikan nama unik dan tulis deskripsi ringkas tentang teknik ini.</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nama Metode</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: SMC (Smart Money Concepts)"
                  className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Deskripsi Lengkap</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan mekanisme utama strategi ini..."
                  rows={4}
                  className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600 resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Timeframe Target
              </h3>
              <p className="text-xs text-zinc-500">Pilih rentang timeframe analisis yang digunakan dalam metode ini (bisa multi-select).</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {timeframes.map((tf) => {
                const isSelected = selectedTfs.includes(tf);
                return (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => handleTfToggle(tf)}
                    className={`p-3.5 rounded-xl text-sm font-semibold border text-center transition-all ${
                      isSelected 
                        ? "bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-md" 
                        : "bg-zinc-950/40 border-white/5 text-zinc-400 hover:border-zinc-800"
                    }`}
                  >
                    {tf}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-violet-400" />
                Akses & Visibilitas
              </h3>
              <p className="text-xs text-zinc-500">Metode publik akan ditampilkan di Library Global untuk dipelajari trader lain.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all ${
                  !isPublic 
                    ? "bg-indigo-600/10 border-indigo-500 text-indigo-400" 
                    : "bg-zinc-950/40 border-white/5 text-zinc-400 hover:border-zinc-800"
                }`}
              >
                <div className={`p-2 rounded-lg ${!isPublic ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-900 text-zinc-500"}`}>
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Privat (Hanya Saya)</h4>
                  <p className="text-xs text-zinc-500 mt-1">Metode ini hanya bisa diakses dan dicatat oleh Anda.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`p-5 rounded-2xl border text-left flex items-start gap-4 transition-all ${
                  isPublic 
                    ? "bg-indigo-600/10 border-indigo-500 text-indigo-400" 
                    : "bg-zinc-950/40 border-white/5 text-zinc-400 hover:border-zinc-800"
                }`}
              >
                <div className={`p-2 rounded-lg ${isPublic ? "bg-indigo-500/20 text-indigo-400" : "bg-zinc-900 text-zinc-500"}`}>
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Publik (Dibagikan ke Library)</h4>
                  <p className="text-xs text-zinc-500 mt-1">Ditampilkan di public method library global TradeLog.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in text-center py-6">
            <div className="w-16 h-16 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Siap Dipublikasikan!</h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Semua data telah tervalidasi. Metode Anda siap digunakan untuk mencatat dan menguji setup trading.
              </p>
            </div>

            <div className="max-w-md mx-auto bg-zinc-950/60 rounded-2xl p-4 border border-zinc-900/60 text-left space-y-3.5 mt-6">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-medium">Nama Metode</span>
                <span className="font-bold text-white">{name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-medium">Timeframe</span>
                <span className="font-semibold text-zinc-300">{selectedTfs.join(", ")}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-medium">Visibilitas</span>
                <span className="font-semibold text-zinc-300">{isPublic ? "Publik" : "Privat"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-zinc-900/60">
          {step > 1 ? (
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/5 hover:border-zinc-800 bg-zinc-950/40 hover:bg-zinc-900 text-zinc-400 hover:text-white text-xs font-semibold transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={handleNextStep}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/10 transition-all hover:scale-[1.02]"
            >
              Lanjut
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-accent-violet hover:from-primary-hover hover:to-primary text-white text-xs font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
            >
              Konfirmasi & Buat Metode
              <Check className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
