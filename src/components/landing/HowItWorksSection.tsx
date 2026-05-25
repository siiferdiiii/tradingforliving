import {
  BookOpen,
  PenLine,
  BarChart3,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: BookOpen,
    title: "Definisi Metode & Strategi",
    description:
      "Buat metode teknikal (IFVG, Order Block, dll) beserta strategi di dalamnya. Tentukan aturan entry, SL/TP, dan konsep opsional yang ingin dilacak.",
    details: [
      "Nama metode, deskripsi, timeframe",
      "Aturan SL & TP per strategi",
      "Sub-konsep opsional: CISD, MSS, dll",
    ],
    gradient: "from-primary to-accent-violet",
  },
  {
    number: "02",
    icon: PenLine,
    title: "Input Trade per Sesi",
    description:
      "Pilih metode dan strategi dari dropdown, lalu isi hanya data yang berubah: harga entry, SL, TP, close, dan upload foto wajib.",
    details: [
      "Pilih method & strategy (dropdown)",
      "Isi entry, SL, TP, hasil, close price",
      "Upload foto before & after (wajib)",
    ],
    gradient: "from-accent-cyan to-accent-emerald",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Analisis Otomatis",
    description:
      "Lihat dashboard performa yang otomatis breakdown per konsep, timeframe, sesi trading. Identifikasi setup dengan probabilitas tertinggi.",
    details: [
      "Win rate per sub-konsep teknikal",
      "Equity curve & distribusi R aktual",
      "Perbandingan antar sesi trading",
    ],
    gradient: "from-accent-emerald to-accent-amber",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="cara-kerja" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-accent-cyan uppercase tracking-wider mb-3">
            Cara Kerja
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Tiga Langkah ke{" "}
            <span className="gradient-text">Backtest Profesional</span>
          </h2>
          <p className="mt-4 text-muted text-lg">
            Dari setup awal hingga insights dalam hitungan menit.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector Line (desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                {/* Arrow connector between cards (desktop) */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-5 h-5 text-muted/30" />
                  </div>
                )}

                <div className="group glass rounded-3xl p-8 hover:bg-white/5 transition-all duration-300 h-full flex flex-col">
                  {/* Step Number + Icon */}
                  <div className="flex items-center gap-4 mb-6">
                    <span
                      className={`text-5xl font-black bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent opacity-30 group-hover:opacity-60 transition-opacity`}
                    >
                      {step.number}
                    </span>
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                    >
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-sm text-muted leading-relaxed mb-5 flex-1">
                    {step.description}
                  </p>

                  {/* Details */}
                  <ul className="space-y-2">
                    {step.details.map((detail, j) => (
                      <li
                        key={j}
                        className="flex items-start gap-2 text-sm text-muted/80"
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${step.gradient} mt-1.5 shrink-0`}
                        />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
