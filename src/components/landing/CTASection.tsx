import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[2rem] overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent-violet/10 to-accent-cyan/20" />
          <div className="absolute inset-0 dot-grid opacity-30" />

          {/* Glow Orbs */}
          <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-accent-cyan/20 blur-3xl" />

          {/* Content */}
          <div className="relative z-10 px-8 py-16 sm:px-16 sm:py-20 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6">
              <Sparkles className="w-4 h-4 text-accent-amber" />
              <span className="text-xs font-medium text-muted">
                100% Gratis, Selamanya
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Mulai Backtest Lebih
              <br />
              <span className="gradient-text">Cerdas Sekarang</span>
            </h2>

            <p className="mt-5 text-muted text-lg max-w-xl mx-auto leading-relaxed">
              Bergabung dengan ratusan trader yang sudah beralih dari
              spreadsheet berantakan ke analitik berbasis data yang sesungguhnya.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group relative inline-flex items-center gap-2 px-10 py-4 rounded-2xl bg-gradient-to-r from-primary to-accent-violet text-white font-semibold text-lg shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-[1.03] active:scale-[0.98]"
              >
                Buat Akun Gratis
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link
                href="#fitur"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl glass text-foreground font-medium hover:bg-white/5 transition-all"
              >
                Pelajari Lebih Lanjut
              </Link>
            </div>

            <p className="mt-6 text-xs text-muted/60">
              Tidak perlu kartu kredit • Setup dalam 2 menit • Data kamu milik kamu
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
