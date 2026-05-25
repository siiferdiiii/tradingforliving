"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Check, Camera, Shield, Target, Award, Smile,
  Plus, X, Sparkles, BookOpen, Tag, ChevronDown, ChevronUp
} from "lucide-react";
import { getSessionById } from "@/lib/actions/session";
import { getAdHocConcepts } from "@/lib/actions/adhoc-concept";
import { createTrade } from "@/lib/actions/trade";
import type { AdHocConcept } from "@prisma/client";

type SessionWithRelations = Awaited<ReturnType<typeof getSessionById>>;
type StrategyConcept = { id: string; name: string };

interface AdHocTag {
  name: string;
  isPresent: boolean;
}

export default function NewTradePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: sessionId } = use(params);

  // Session & concepts data
  const [session, setSession] = useState<SessionWithRelations>(null);
  const [strategyConcepts, setStrategyConcepts] = useState<StrategyConcept[]>([]);
  const [conceptChecks, setConceptChecks] = useState<Record<string, boolean>>({});
  const [globalAdHocConcepts, setGlobalAdHocConcepts] = useState<AdHocConcept[]>([]);

  // Ad-hoc (optional) concepts state
  const [adHocTags, setAdHocTags] = useState<AdHocTag[]>([]);
  const [adHocInput, setAdHocInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showOptionalSection, setShowOptionalSection] = useState(false);

  // Form fields
  const [tradeDate, setTradeDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [tradingSession, setTradingSession] = useState("NEW_YORK");
  const [entryPrice, setEntryPrice] = useState("");
  const [slPrice, setSlPrice] = useState("");
  const [tpPrice, setTpPrice] = useState("");
  const [result, setResult] = useState<"WIN" | "LOSS" | "BREAKEVEN" | "PARTIAL">("WIN");
  const [timeframe, setTimeframe] = useState("M5");
  const [notes, setNotes] = useState("");
  const [mood, setMood] = useState("DISCIPLINED");
  const [entryImage, setEntryImage] = useState<string>("");
  const [entryImageFile, setEntryImageFile] = useState<File | null>(null);

  // Calculated values
  const [riskPips, setRiskPips] = useState(0);
  const [rewardPips, setRewardPips] = useState(0);
  const [rr, setRr] = useState(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [error, setError] = useState("");

  // Load session and concepts
  useEffect(() => {
    async function load() {
      setIsPageLoading(true);
      try {
        const [sessionData, adHocData] = await Promise.all([
          getSessionById(sessionId),
          getAdHocConcepts(),
        ]);

        if (!sessionData) {
          setError("Sesi tidak ditemukan.");
          return;
        }

        setSession(sessionData);
        setGlobalAdHocConcepts(adHocData);

        const concepts = sessionData.strategy?.concepts ?? [];
        setStrategyConcepts(concepts);
        const initialChecks: Record<string, boolean> = {};
        concepts.forEach((c) => { initialChecks[c.id] = false; });
        setConceptChecks(initialChecks);
      } finally {
        setIsPageLoading(false);
      }
    }
    load();
  }, [sessionId]);

  // Real-time R:R calculation
  useEffect(() => {
    const entry = parseFloat(entryPrice);
    const sl = parseFloat(slPrice);
    const tp = parseFloat(tpPrice);

    if (!isNaN(entry) && !isNaN(sl) && !isNaN(tp) && entry !== sl) {
      const risk = Math.abs(entry - sl);
      const reward = Math.abs(tp - entry);
      setRiskPips(parseFloat((risk * 100000).toFixed(1)));
      setRewardPips(parseFloat((reward * 100000).toFixed(1)));
      setRr(risk > 0 ? parseFloat((reward / risk).toFixed(2)) : 0);
    } else {
      setRiskPips(0);
      setRewardPips(0);
      setRr(0);
    }
  }, [entryPrice, slPrice, tpPrice]);

  // Ad-hoc concept helpers
  const filteredSuggestions = globalAdHocConcepts.filter(
    (c) =>
      adHocInput.length > 0 &&
      c.name.toLowerCase().includes(adHocInput.toLowerCase()) &&
      !adHocTags.find((t) => t.name.toLowerCase() === c.name.toLowerCase())
  );

  const addAdHocTag = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (adHocTags.find((t) => t.name.toLowerCase() === trimmed.toLowerCase())) {
      setAdHocInput("");
      return;
    }
    setAdHocTags((prev) => [...prev, { name: trimmed, isPresent: true }]);
    setAdHocInput("");
    setShowSuggestions(false);
  }, [adHocTags]);

  const removeAdHocTag = (name: string) => {
    setAdHocTags((prev) => prev.filter((t) => t.name !== name));
  };

  const handleAdHocKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === ",") && adHocInput.trim()) {
      e.preventDefault();
      addAdHocTag(adHocInput);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEntryImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setEntryImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!entryPrice || !slPrice || !tpPrice) {
      setError("Semua level harga (Entry, SL, TP) wajib diisi.");
      return;
    }

    setIsLoading(true);
    try {
      const conceptsPayload = strategyConcepts.map((c) => ({
        strategyConceptId: c.id,
        isPresent: !!conceptChecks[c.id],
      }));

      const result2 = await createTrade({
        sessionId,
        tradeDate: new Date(tradeDate),
        session: tradingSession as any,
        entryPrice: parseFloat(entryPrice),
        slPrice: parseFloat(slPrice),
        tpPrice: parseFloat(tpPrice),
        result,
        timeframeTrigger: timeframe,
        notes: notes || undefined,
        mood: mood as any,
        closes: [],
        concepts: conceptsPayload,
        adHocConcepts: adHocTags,
      });

      if (result2.error) {
        setError(typeof result2.error === "string" ? result2.error : "Validasi gagal. Periksa input Anda.");
      } else {
        const newTradeId = result2.data?.id;
        // Upload screenshot if user selected one
        if (entryImageFile && newTradeId) {
          try {
            const formData = new FormData();
            formData.append("file", entryImageFile);
            formData.append("tradeId", newTradeId);
            formData.append("imageType", "before");
            const uploadRes = await fetch("/api/upload", {
              method: "POST",
              body: formData,
            });
            if (!uploadRes.ok) {
              console.error("Upload gambar gagal:", await uploadRes.text());
            }
          } catch (uploadErr) {
            console.error("Upload gambar error:", uploadErr);
          }
        }
        router.push(`/sessions/${sessionId}`);
      }
    } catch {
      setError("Terjadi kesalahan tak terduga. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading) {
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
      {/* Back */}
      <Link
        href={`/sessions/${session.id}`}
        className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Sesi: {session.name}
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
          Catat Trade Log Baru
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Instrument: <span className="text-white font-bold">{session.instrument}</span> &nbsp;·&nbsp;
          Strategi: <span className="text-indigo-400 font-semibold">{session.strategy?.name}</span>
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">

          {/* === BASIC INFO CARD === */}
          <div className="glass rounded-2xl border border-white/5 p-6 space-y-6 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              Data Dasar Transaksi
            </h2>

            {/* Date & Session */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            {/* Prices */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Entry Price</label>
                <input
                  type="number" step="0.00001"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  required placeholder="1.08500"
                  className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600 text-zinc-200"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-red-400" /> Stop Loss
                </label>
                <input
                  type="number" step="0.00001"
                  value={slPrice}
                  onChange={(e) => setSlPrice(e.target.value)}
                  required placeholder="1.08350"
                  className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600 text-zinc-200"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-emerald-400" /> Take Profit
                </label>
                <input
                  type="number" step="0.00001"
                  value={tpPrice}
                  onChange={(e) => setTpPrice(e.target.value)}
                  required placeholder="1.08950"
                  className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600 text-zinc-200"
                />
              </div>
            </div>

            {/* Result, Timeframe, Mood */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Hasil Akhir</label>
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value as any)}
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none transition-all text-zinc-200"
                >
                  <option value="WIN">WIN ✅</option>
                  <option value="LOSS">LOSS ❌</option>
                  <option value="BREAKEVEN">BREAKEVEN ➖</option>
                  <option value="PARTIAL">PARTIAL 🔶</option>
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
                  <option value="M2">M2</option>
                  <option value="M3">M3</option>
                  <option value="M5">M5</option>
                  <option value="M15">M15</option>
                  <option value="H1">H1</option>
                  <option value="H4">H4</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Smile className="w-3.5 h-3.5 text-indigo-400" /> Mood / Psikologi
                </label>
                <select
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none transition-all text-zinc-200"
                >
                  <option value="DISCIPLINED">🎯 DISIPLIN</option>
                  <option value="RUSHED">😰 TERBURU-BURU</option>
                  <option value="HESITANT">😟 RAGU-RAGU</option>
                </select>
              </div>
            </div>
          </div>

          {/* === STRATEGY CONCEPTS CARD === */}
          {strategyConcepts.length > 0 && (
            <div className="glass rounded-2xl border border-white/5 p-6 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  Konsep Strategi yang Hadir
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Centang konsep dari strategi <span className="text-indigo-400">{session.strategy?.name}</span> yang terlihat saat entry.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {strategyConcepts.map((concept) => {
                  const checked = !!conceptChecks[concept.id];
                  return (
                    <button
                      key={concept.id}
                      type="button"
                      onClick={() => setConceptChecks((prev) => ({ ...prev, [concept.id]: !prev[concept.id] }))}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 group ${
                        checked
                          ? "bg-violet-500/10 border-violet-500/30 text-violet-300"
                          : "bg-zinc-950/40 border-white/5 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                        checked ? "bg-violet-500 border-violet-400" : "border-zinc-700 group-hover:border-zinc-500"
                      }`}>
                        {checked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-xs font-semibold">{concept.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* === OPTIONAL / AD-HOC CONCEPTS CARD === */}
          <div className="glass rounded-2xl border border-white/5 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowOptionalSection((v) => !v)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <Tag className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Konsep Opsional (Ad-hoc)</p>
                  <p className="text-xs text-zinc-500">Tambah konsep yang muncul tapi tidak ada di strategi (SMT, Liquidity Sweep, NWOG, dll.)</p>
                </div>
                {adHocTags.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold border border-cyan-500/30">
                    {adHocTags.length}
                  </span>
                )}
              </div>
              {showOptionalSection ? (
                <ChevronUp className="w-4 h-4 text-zinc-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              )}
            </button>

            {showOptionalSection && (
              <div className="px-6 pb-6 space-y-4 border-t border-zinc-900/60 pt-4">
                {/* Tags display */}
                {adHocTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {adHocTags.map((tag) => (
                      <span
                        key={tag.name}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold"
                      >
                        {tag.name}
                        <button
                          type="button"
                          onClick={() => removeAdHocTag(tag.name)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Input */}
                <div className="relative">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={adHocInput}
                      onChange={(e) => { setAdHocInput(e.target.value); setShowSuggestions(true); }}
                      onKeyDown={handleAdHocKeyDown}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      placeholder="Ketik nama konsep... (Enter untuk tambah)"
                      className="flex-1 bg-zinc-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-cyan-500/40 focus:outline-none transition-all placeholder:text-zinc-600 text-zinc-200"
                    />
                    <button
                      type="button"
                      onClick={() => addAdHocTag(adHocInput)}
                      disabled={!adHocInput.trim()}
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-all disabled:opacity-40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah
                    </button>
                  </div>

                  {/* Autocomplete dropdown */}
                  {showSuggestions && filteredSuggestions.length > 0 && (
                    <div className="absolute z-20 top-full left-0 right-12 mt-1 glass border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                      {filteredSuggestions.slice(0, 6).map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onMouseDown={() => addAdHocTag(s.name)}
                          className="w-full text-left px-4 py-2.5 text-xs text-zinc-300 hover:bg-white/5 transition-all flex items-center gap-2"
                        >
                          <Tag className="w-3 h-3 text-cyan-500" />
                          {s.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-zinc-600">
                  Konsep yang Anda tambahkan akan otomatis disimpan ke library pribadi untuk digunakan lagi di trade berikutnya.
                </p>
              </div>
            )}
          </div>

          {/* === SCREENSHOT === */}
          <div className="glass rounded-2xl border border-white/5 p-6 space-y-4">
            <h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4 text-indigo-400" />
              Bukti Transaksi (Screenshot Chart)
            </h2>
            <div className="border border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-950/20 rounded-2xl p-6 text-center cursor-pointer transition-all relative overflow-hidden group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {entryImage ? (
                <div className="relative rounded-xl overflow-hidden max-h-48">
                  <img src={entryImage} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs text-white font-bold bg-zinc-950/80 px-3 py-1.5 rounded-xl border border-white/10">Ubah Gambar</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-1.5 py-4">
                  <Camera className="w-8 h-8 text-zinc-600 group-hover:text-zinc-500 transition-colors" />
                  <span className="text-xs text-zinc-400">Tarik gambar ke sini, atau klik untuk memilih file</span>
                  <span className="text-[10px] text-zinc-600">JPG, PNG, WEBP hingga 5MB</span>
                </div>
              )}
            </div>
          </div>

          {/* === NOTES === */}
          <div className="glass rounded-2xl border border-white/5 p-6 space-y-3">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Catatan & Refleksi</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Alasan masuk posisi, konfirmasi yang terlihat, refleksi psikologi..."
              rows={4}
              className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600 resize-none"
            />
          </div>

          {/* === ACTIONS === */}
          <div className="flex justify-end gap-3">
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
                  Simpan Trade Log
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Sticky Preview Panel */}
        <div className="lg:col-span-1 space-y-4 sticky top-24">
          {/* R:R Preview */}
          <div className="glass rounded-2xl border border-white/5 p-6 space-y-5">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                Preview Risk-Reward
              </h3>
              <p className="text-xs text-zinc-500">Dihitung otomatis dari level harga Anda.</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs border-b border-zinc-900/60 pb-3">
                <span className="text-zinc-500 font-medium">Jarak Risk</span>
                <span className="font-bold text-red-400 font-mono">{riskPips} Pips</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-zinc-900/60 pb-3">
                <span className="text-zinc-500 font-medium">Jarak Reward</span>
                <span className="font-bold text-emerald-400 font-mono">{rewardPips} Pips</span>
              </div>
              <div className="flex justify-between items-center text-xs border-b border-zinc-900/60 pb-3">
                <span className="text-zinc-500 font-medium">Rasio R:R</span>
                <span className="font-extrabold text-white font-mono text-lg">1 : {rr}</span>
              </div>
            </div>

            <div className={`p-3.5 rounded-xl text-[11px] font-semibold border ${
              rr >= 2
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                : rr > 0
                ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                : "bg-zinc-900 border-zinc-800 text-zinc-500"
            }`}>
              {rr >= 2
                ? "✔ Rasio solid! Target ≥ 1:2 terpenuhi."
                : rr > 0
                ? "⚠ Rasio di bawah standar minimum 1:2."
                : "Isi harga entry, SL, dan TP untuk preview."}
            </div>
          </div>

          {/* Summary of optional concepts */}
          {adHocTags.length > 0 && (
            <div className="glass rounded-2xl border border-cyan-500/10 p-5 space-y-3">
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Konsep Opsional
              </p>
              <div className="flex flex-wrap gap-1.5">
                {adHocTags.map((t) => (
                  <span key={t.name} className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-semibold">
                    {t.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Strategy concepts summary */}
          {strategyConcepts.length > 0 && (
            <div className="glass rounded-2xl border border-violet-500/10 p-5 space-y-3">
              <p className="text-xs font-bold text-violet-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Konsep Strategi
              </p>
              <div className="space-y-1.5">
                {strategyConcepts.map((c) => (
                  <div key={c.id} className="flex items-center gap-2 text-xs">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${conceptChecks[c.id] ? "bg-violet-400" : "bg-zinc-700"}`} />
                    <span className={conceptChecks[c.id] ? "text-violet-300 font-semibold" : "text-zinc-500"}>
                      {c.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
