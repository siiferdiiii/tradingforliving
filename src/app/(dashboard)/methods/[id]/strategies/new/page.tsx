"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Plus, Shield, Target, Clock } from "lucide-react";
import { getMethodById } from "@/lib/actions/method";
import { createStrategy } from "@/lib/actions/strategy";

type DBMethod = Awaited<ReturnType<typeof getMethodById>>;

export default function NewStrategyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: methodId } = use(params);
  const router = useRouter();
  const [method, setMethod] = useState<DBMethod>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [slRule, setSlRule] = useState("");
  const [tpRule, setTpRule] = useState("");
  const [newRule, setNewRule] = useState("");
  const [rules, setRules] = useState<string[]>(["BOS", "OB", "FVG"]);
  const [selectedSessions, setSelectedSessions] = useState<string[]>(["LONDON", "NEW_YORK"]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    async function load() {
      if (methodId) {
        try {
          const data = await getMethodById(methodId);
          setMethod(data);
        } catch (err) {
          console.error("Gagal memuat metode:", err);
        }
      }
    }
    load();
  }, [methodId]);

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRule.trim() && !rules.includes(newRule.trim())) {
      setRules([...rules, newRule.trim()]);
      setNewRule("");
    }
  };

  const handleRemoveRule = (index: number) => {
    setRules(rules.filter((_, idx) => idx !== index));
  };

  const handleSessionToggle = (session: string) => {
    if (selectedSessions.includes(session)) {
      setSelectedSessions(selectedSessions.filter(s => s !== session));
    } else {
      setSelectedSessions([...selectedSessions, session]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Nama strategi harus diisi");
      return;
    }
    if (!description.trim()) {
      setError("Aturan pemicu entri harus diisi");
      return;
    }
    if (!slRule.trim()) {
      setError("Aturan stop loss harus diisi");
      return;
    }
    if (!tpRule.trim()) {
      setError("Aturan take profit harus diisi");
      return;
    }
    if (rules.length === 0) {
      setError("Pilih minimal 1 konsep konfirmasi");
      return;
    }
    if (selectedSessions.length === 0) {
      setError("Pilih minimal 1 sesi trading target");
      return;
    }

    setIsLoading(true);

    try {
      const res = await createStrategy({
        methodId: method!.id,
        name,
        triggerEntry: description,
        slRule,
        tpRule,
        concepts: rules.map(r => ({ name: r })),
        sessions: selectedSessions as any,
      });

      if (res.error) {
        setError(typeof res.error === "string" ? res.error : "Gagal membuat strategi");
      } else if (res.data) {
        router.push(`/methods/${method!.id}`);
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan server. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!method) {
    return (
      <div className="text-center py-16 space-y-4">
        <h3 className="text-lg font-bold text-white">Metode tidak ditemukan</h3>
        <Link href="/methods" className="text-primary hover:underline text-xs font-semibold">
          Kembali ke Daftar Metode
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-up">
      {/* Back Button */}
      <Link
        href={`/methods/${method.id}`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Detail Metode {method.name}
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          Tambah Strategi Baru
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Tambahkan spesifikasi setup baru di bawah metode <span className="text-indigo-400 font-semibold">{method.name}</span>.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-semibold">
          {error}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="glass rounded-2xl border border-white/5 p-8 space-y-6 relative overflow-hidden">
        {/* Decor */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nama Strategi</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Order Block Refinement H4-M15"
            required
            className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pemicu Entri (Setup Trigger)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detail kondisi pasar yang wajib dipenuhi sebelum melakukan klik entri..."
            required
            rows={4}
            className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600 resize-none"
          />
        </div>

        {/* SL & TP Rules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-red-400" />
              Aturan Stop Loss (SL)
            </label>
            <textarea
              value={slRule}
              onChange={(e) => setSlRule(e.target.value)}
              placeholder="Aturan penempatan SL (Contoh: 2 pips di bawah swing low terdekat)"
              rows={3}
              className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              Aturan Take Profit (TP)
            </label>
            <textarea
              value={tpRule}
              onChange={(e) => setTpRule(e.target.value)}
              placeholder="Aturan penempatan TP (Contoh: Mengincar level likuiditas H4 terdekat)"
              rows={3}
              className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600 resize-none"
            />
          </div>
        </div>

        {/* Sesi Trading Target */}
        <div className="space-y-4 pt-4 border-t border-zinc-900">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Sesi Trading Target
            </label>
            <p className="text-[10px] text-zinc-500">Pilih sesi trading yang relevan dengan strategi ini (bisa multi-select).</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {["ASIA", "LONDON", "NEW_YORK", "LONDON_CLOSE"].map((sess) => {
              const isSelected = selectedSessions.includes(sess);
              return (
                <button
                  key={sess}
                  type="button"
                  onClick={() => handleSessionToggle(sess)}
                  className={`p-3.5 rounded-xl text-xs font-bold border text-center transition-all ${
                    isSelected 
                      ? "bg-indigo-600/10 border-indigo-500 text-indigo-400 shadow-md" 
                      : "bg-zinc-950/40 border-white/5 text-zinc-400 hover:border-zinc-800"
                  }`}
                >
                  {sess.replace("_", " ")}
                </button>
              );
            })}
          </div>
        </div>

        {/* Concept Builder */}
        <div className="space-y-4 pt-4 border-t border-zinc-900">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Konsep / Kriteria Konfirmasi
            </label>
            <p className="text-[10px] text-zinc-500">Definisikan konsep pembentuk model strategi ini (seperti BOS, FVG, MSS).</p>
          </div>

          <div className="flex gap-2.5">
            <input
              type="text"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              placeholder="Masukkan nama konsep... (Lalu tekan Enter)"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newRule.trim() && !rules.includes(newRule.trim())) {
                    setRules([...rules, newRule.trim()]);
                    setNewRule("");
                  }
                }
              }}
              className="flex-1 bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600"
            />
            <button
              type="button"
              onClick={handleAddRule}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-white/5 hover:border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <Plus className="w-4 h-4" />
              Tambah
            </button>
          </div>

          {/* Rules Tags Display */}
          <div className="flex flex-wrap gap-2.5 pt-1.5">
            {rules.map((rule, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300"
              >
                {rule}
                <button
                  type="button"
                  onClick={() => handleRemoveRule(idx)}
                  className="text-zinc-500 hover:text-red-400 focus:outline-none"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-zinc-900/60">
          <Link
            href={`/methods/${method.id}`}
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
                Simpan Strategi
                <Check className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
