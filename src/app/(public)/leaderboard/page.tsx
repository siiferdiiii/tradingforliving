"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Award, Compass, Info, Shield, Trophy } from "lucide-react";
import { MOCK_LEADERBOARD } from "@/lib/mock-data";
import { UserProfile } from "@/types";

export default function LeaderboardPage() {
  const [traders, setTraders] = useState<UserProfile[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setTraders(MOCK_LEADERBOARD);
  }, []);

  // Consistency Score formula: winRate * log10(totalTrades) * avgR
  const calculateScore = (t: UserProfile) => {
    // mock total trades if empty
    const tradesCount = t.totalTrades || 30;
    const logVal = Math.log10(tradesCount);
    // mock avgR
    const avgR = t.profitFactor ? t.profitFactor * 1.2 : 2.5;
    return parseFloat((t.winRate * logVal * avgR).toFixed(1));
  };

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
          🏆 Global Leaderboard
        </h1>
        <p className="text-sm text-zinc-400">
          Daftar trader berkinerja terbaik yang dihitung berdasarkan konsistensi akurasi win rate dan rasio profit-loss R-value.
        </p>
      </div>

      {/* Info Card Formula */}
      <div className="glass rounded-2xl border border-white/5 p-5 flex items-start gap-4 max-w-3xl mx-auto bg-zinc-950/20">
        <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs leading-relaxed text-zinc-400">
          <p className="font-bold text-white">Bagaimana Consistency Score dihitung?</p>
          <p>
            TradeLog menggunakan rumus matematika terstandarisasi untuk mengukur konsistensi performa:{" "}
            <code className="bg-zinc-950 px-2 py-0.5 rounded text-indigo-400 font-mono text-[10px]">
              Consistency = WinRate × log10(TotalTrades) × AvgR
            </code>.
          </p>
          <p className="text-[10px] text-zinc-500 mt-1">
            * Hanya trader dengan jumlah trade minimal 30 kali yang akan dimasukkan ke peringkat global.
          </p>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <div className="glass rounded-2xl border border-white/5 overflow-hidden max-w-4xl mx-auto shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 text-xs font-semibold text-zinc-400 bg-zinc-950/20">
                <th className="px-6 py-4 text-center w-16">Rank</th>
                <th className="px-6 py-4">Trader</th>
                <th className="px-6 py-4">Total Trades</th>
                <th className="px-6 py-4">Win Rate</th>
                <th className="px-6 py-4">Profit Factor</th>
                <th className="px-6 py-4 text-right">Consistency Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/60">
              {traders.map((trader, idx) => {
                const isTop3 = idx < 3;
                const score = calculateScore(trader);
                return (
                  <tr key={trader.id} className="text-sm text-zinc-300 hover:bg-white/[0.01] transition-all">
                    {/* Rank */}
                    <td className="px-6 py-4 text-center">
                      {isTop3 ? (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center mx-auto text-xs font-black shadow-lg ${
                          idx === 0 
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" 
                            : idx === 1 
                            ? "bg-zinc-300/10 text-zinc-300 border border-zinc-300/30" 
                            : "bg-amber-700/10 text-amber-700 border border-amber-700/30"
                        }`}>
                          {idx + 1}
                        </div>
                      ) : (
                        <span className="font-mono text-zinc-500 font-bold">{idx + 1}</span>
                      )}
                    </td>

                    {/* Trader user */}
                    <td className="px-6 py-4">
                      <Link 
                        href={`/u/${trader.username}`}
                        className="flex items-center gap-3 group"
                      >
                        {trader.avatarUrl ? (
                          <img
                            src={trader.avatarUrl}
                            alt={trader.displayName}
                            className="w-9 h-9 rounded-full object-cover border border-zinc-800"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-indigo-600/10 text-indigo-400 flex items-center justify-center font-bold">
                            {trader.displayName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white group-hover:text-primary transition-colors text-xs">{trader.displayName}</p>
                          <p className="text-[10px] text-zinc-500">@{trader.username}</p>
                        </div>
                      </Link>
                    </td>

                    {/* Stats */}
                    <td className="px-6 py-4 font-mono text-xs">{trader.totalTrades}</td>
                    <td className="px-6 py-4 font-mono text-xs text-emerald-400 font-bold">{trader.winRate.toFixed(1)}%</td>
                    <td className="px-6 py-4 font-mono text-xs">{trader.profitFactor.toFixed(2)}x</td>
                    
                    {/* Score */}
                    <td className="px-6 py-4 text-right font-extrabold font-mono text-primary text-sm">
                      {score}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
