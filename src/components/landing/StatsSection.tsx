"use client";

import { useEffect, useRef, useState } from "react";
import { TrendingUp, BookOpen, Users } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: 12480,
    suffix: "+",
    label: "Trade Tercatat",
    gradient: "from-primary to-accent-violet",
  },
  {
    icon: BookOpen,
    value: 156,
    suffix: "+",
    label: "Metode Dipublikasikan",
    gradient: "from-accent-cyan to-accent-emerald",
  },
  {
    icon: Users,
    value: 830,
    suffix: "+",
    label: "Trader Aktif",
    gradient: "from-accent-emerald to-accent-amber",
  },
];

function AnimatedCounter({
  value,
  suffix,
  inView,
}: {
  value: number;
  suffix: string;
  inView: boolean;
}) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.floor(eased * value));
      if (step >= steps) {
        setCurrent(value);
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span>
      {current.toLocaleString("id-ID")}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative py-24 sm:py-32" id="leaderboard">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 section-divider" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-sm font-semibold text-accent-emerald uppercase tracking-wider mb-3">
            Komunitas Berkembang
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Dipercaya Trader yang{" "}
            <span className="gradient-text">Serius Backtest</span>
          </h2>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="group relative glass rounded-3xl p-8 text-center hover:bg-white/5 transition-all duration-300 overflow-hidden"
            >
              {/* Glow */}
              <div
                className={`absolute -bottom-10 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`}
              />

              <div className="relative z-10">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon className="w-7 h-7 text-white" />
                </div>

                <p className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">
                  <AnimatedCounter
                    value={stat.value}
                    suffix={stat.suffix}
                    inView={inView}
                  />
                </p>
                <p className="text-muted text-sm font-medium">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Leaderboard Preview */}
        <div className="mt-12 glass rounded-3xl p-6 sm:p-8 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">🏆 Leaderboard Teratas</h3>
            <span className="text-xs text-muted glass px-3 py-1 rounded-full">
              Min. 30 trade
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="text-left py-3 pr-4">#</th>
                  <th className="text-left py-3 pr-4">Trader</th>
                  <th className="text-left py-3 pr-4">Metode</th>
                  <th className="text-right py-3 pr-4">Win Rate</th>
                  <th className="text-right py-3 pr-4">Avg R</th>
                  <th className="text-right py-3">Trades</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    rank: 1,
                    name: "raden_fx",
                    method: "IFVG M5",
                    wr: "74%",
                    avgR: "2.1R",
                    trades: 142,
                  },
                  {
                    rank: 2,
                    name: "smc_hunter",
                    method: "Order Block",
                    wr: "69%",
                    avgR: "1.9R",
                    trades: 98,
                  },
                  {
                    rank: 3,
                    name: "ict_warrior",
                    method: "Breaker Block",
                    wr: "67%",
                    avgR: "2.3R",
                    trades: 87,
                  },
                  {
                    rank: 4,
                    name: "gold_sniper",
                    method: "FVG Rebalance",
                    wr: "65%",
                    avgR: "1.7R",
                    trades: 203,
                  },
                  {
                    rank: 5,
                    name: "asia_session",
                    method: "Liquidity Sweep",
                    wr: "63%",
                    avgR: "1.5R",
                    trades: 156,
                  },
                ].map((row) => (
                  <tr
                    key={row.rank}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex w-7 h-7 items-center justify-center rounded-lg text-xs font-bold ${
                          row.rank === 1
                            ? "bg-accent-amber/20 text-accent-amber"
                            : row.rank === 2
                            ? "bg-white/10 text-white/70"
                            : row.rank === 3
                            ? "bg-accent-amber/10 text-accent-amber/70"
                            : "text-muted"
                        }`}
                      >
                        {row.rank}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-medium">{row.name}</td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-xs text-muted">
                        {row.method}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold text-accent-emerald">
                      {row.wr}
                    </td>
                    <td className="py-3 pr-4 text-right font-semibold">
                      {row.avgR}
                    </td>
                    <td className="py-3 text-right text-muted">{row.trades}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
