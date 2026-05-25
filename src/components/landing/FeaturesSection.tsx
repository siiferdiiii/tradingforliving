import {
  Layers,
  BarChart3,
  TrendingUp,
  Camera,
} from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Setup Sekali, Pakai Berulang",
    description:
      "Definisikan metode dan strategi teknikal sekali. Setiap sesi backtest, cukup pilih dari dropdown — tidak perlu ketik ulang aturan entry, SL, TP.",
    gradient: "from-primary to-accent-violet",
    shadowColor: "shadow-primary/20",
    stats: [
      { label: "Hemat Input", value: "80%" },
      { label: "Lebih Fokus", value: "2x" },
    ],
  },
  {
    icon: BarChart3,
    title: "Analitik Per Sub-Konsep",
    description:
      "Ketahui persis konsep mana yang bekerja. Lihat win rate dan rata-rata R per CISD, MSS, Displacement, atau sub-konsep apapun yang kamu definisikan.",
    gradient: "from-accent-cyan to-accent-emerald",
    shadowColor: "shadow-accent-cyan/20",
    stats: [
      { label: "CISD ✓", value: "71% WR" },
      { label: "MSS ✓", value: "74% WR" },
    ],
  },
  {
    icon: TrendingUp,
    title: "R:R Dinamis & Aktual",
    description:
      "Tidak mengunci R:R sebagai target. Sistem menghitung R aktual dari close price yang sebenarnya — mendukung partial close, trailing stop, dan exit awal.",
    gradient: "from-accent-emerald to-accent-amber",
    shadowColor: "shadow-accent-emerald/20",
    stats: [
      { label: "Target", value: "2.5R" },
      { label: "Aktual", value: "1.8R" },
    ],
  },
  {
    icon: Camera,
    title: "Dokumentasi Visual Wajib",
    description:
      "Setiap trade wajib upload foto Before (sebelum entry) dan After (setelah close). Standar dokumentasi yang memaksa disiplin dan mempermudah review.",
    gradient: "from-accent-violet to-accent-rose",
    shadowColor: "shadow-accent-violet/20",
    stats: [
      { label: "Before", value: "📸" },
      { label: "After", value: "📸" },
    ],
  },
];

export default function FeaturesSection() {
  return (
    <section id="fitur" className="relative py-24 sm:py-32">
      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 section-divider" />
        <div className="absolute bottom-0 left-0 right-0 section-divider" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Solusi TradeLog
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Semua yang Kamu Butuhkan untuk{" "}
            <span className="gradient-text">Backtest Profesional</span>
          </h2>
          <p className="mt-4 text-muted text-lg">
            Empat fitur inti yang mengubah cara kamu melakukan backtest — dari
            spreadsheet berantakan menjadi data-driven insights.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className={`group relative glass rounded-3xl p-8 hover:bg-white/5 transition-all duration-500 overflow-hidden`}
            >
              {/* Gradient glow on hover */}
              <div
                className={`absolute -top-20 -right-20 w-40 h-40 rounded-full bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-700`}
              />

              <div className="relative z-10">
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 ${feature.shadowColor} shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>

                {/* Text */}
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted leading-relaxed text-sm mb-6">
                  {feature.description}
                </p>

                {/* Mini Stats */}
                <div className="flex gap-3">
                  {feature.stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.06] px-4 py-3 text-center"
                    >
                      <p className="text-lg font-bold">{stat.value}</p>
                      <p className="text-xs text-muted mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
