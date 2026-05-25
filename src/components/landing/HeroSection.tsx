import Link from "next/link";
import {
  ArrowRight,
  TrendingUp,
  BarChart3,
  Shield,
} from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/20 animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-accent-cyan/15 animate-pulse-glow [animation-delay:1.5s]" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-accent-violet/10 animate-pulse-glow [animation-delay:3s]" />
      </div>

      {/* Dot Grid Overlay */}
      <div className="absolute inset-0 dot-grid opacity-40" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 animate-fade-up">
          <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
          <span className="text-xs text-muted font-medium tracking-wide uppercase">
            Platform Gratis untuk Trader
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] animate-fade-up-delay-1 opacity-0">
          Backtest Lebih Cerdas,
          <br />
          <span className="gradient-text">Analisis Lebih Tajam</span>
        </h1>

        {/* Sub-headline */}
        <p className="mt-6 text-lg sm:text-xl text-muted max-w-2xl mx-auto leading-relaxed animate-fade-up-delay-2 opacity-0">
          Definisikan metode teknikal sekali, gunakan berulang kali. Lacak
          performa per sub-konsep, timeframe, dan sesi secara otomatis.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up-delay-3 opacity-0">
          <Link
            href="/register"
            className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent-violet text-white font-semibold text-base shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            Mulai Sekarang
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link
            href="#fitur"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl glass text-foreground font-medium text-base hover:bg-white/5 transition-all"
          >
            Lihat Fitur
          </Link>
        </div>

        {/* Floating Stats Preview */}
        <div className="mt-16 sm:mt-20 grid grid-cols-3 gap-3 sm:gap-6 max-w-lg mx-auto">
          {[
            {
              icon: TrendingUp,
              value: "R:R Dinamis",
              label: "Bukan fixed ratio",
              color: "text-accent-emerald",
            },
            {
              icon: BarChart3,
              value: "Per Konsep",
              label: "Analitik breakdown",
              color: "text-primary",
            },
            {
              icon: Shield,
              value: "Foto Wajib",
              label: "Before & after",
              color: "text-accent-cyan",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-2xl p-3 sm:p-4 hover:bg-white/5 transition-all group"
            >
              <stat.icon
                className={`w-5 h-5 ${stat.color} mx-auto mb-2 group-hover:scale-110 transition-transform`}
              />
              <p className="text-sm font-semibold">{stat.value}</p>
              <p className="text-xs text-muted mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
