"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, Search, Globe, ChevronRight } from "lucide-react";
import { DatabaseManager } from "@/lib/mock-data";
import { Method } from "@/types";

export default function PublicMethodsLibraryPage() {
  const [methods, setMethods] = useState<Method[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Filter methods where isPublic = true
    const publicMethods = DatabaseManager.getMethods().filter(m => m.isPublic);
    setMethods(publicMethods);
  }, []);

  const filteredMethods = methods.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isClient) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fade-up">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          📚 Library Metode Global
        </h1>
        <p className="text-sm text-zinc-400">
          Telusuri dan pelajari berbagai metode analisis teknikal, rule entri, dan tingkat akurasi konfirmasi setup yang dipublikasikan oleh komunitas trader.
        </p>
      </div>

      {/* Control bar */}
      <div className="relative w-full sm:max-w-xs mx-auto">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari metode publik..."
          className="w-full bg-zinc-900/50 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-primary/50 focus:outline-none transition-all placeholder:text-zinc-600"
        />
      </div>

      {/* Grid view */}
      {filteredMethods.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {filteredMethods.map((m) => (
            <div 
              key={m.id}
              className="glass rounded-2xl border border-white/5 p-6 flex flex-col justify-between hover:border-indigo-500/20 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.15)] transition-all group duration-300 relative overflow-hidden"
            >
              {/* Corner accent glow */}
              <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Globe className="w-3 h-3" />
                    Publik
                  </span>
                  <span className="text-[10px] text-zinc-500 font-semibold truncate max-w-[100px]">
                    Oleh: @{m.creatorName.split(" ")[0].toLowerCase()}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-primary transition-colors line-clamp-1">{m.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1.5 line-clamp-3 min-h-[48px]">{m.description || "Tidak ada deskripsi."}</p>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="space-y-4 mt-6 pt-4 border-t border-zinc-900/60">
                <div className="grid grid-cols-3 gap-1 text-center">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-zinc-500 block uppercase font-medium">Win Rate</span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">{m.winRate}%</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-zinc-500 block uppercase font-medium">Profit</span>
                    <span className="text-xs font-bold text-white font-mono">{m.profitFactor}x</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-zinc-500 block uppercase font-medium">Avg R</span>
                    <span className="text-xs font-bold text-indigo-400 font-mono">+{m.avgR}</span>
                  </div>
                </div>

                <Link
                  href={`/u/${m.creatorName.split(" ")[0].toLowerCase()}`}
                  className="w-full flex items-center justify-center gap-1 py-2 text-xs text-primary hover:text-primary-hover font-semibold bg-primary/5 hover:bg-primary/10 border border-primary/10 rounded-xl transition-all group/btn"
                >
                  Lihat Profil Pembuat
                  <ChevronRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass rounded-2xl border border-white/5 flex flex-col items-center justify-center py-16 text-center max-w-xl mx-auto">
          <Layers className="w-16 h-16 text-zinc-700 mb-4 animate-pulse" />
          <h3 className="text-lg font-bold text-white">Belum ada metode publik</h3>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs">
            Saat ini belum ada trader yang membagikan metode teknikal mereka ke Library Global.
          </p>
        </div>
      )}
    </div>
  );
}
