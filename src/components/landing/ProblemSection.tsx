import {
  RefreshCw,
  SearchX,
  ImageOff,
  UsersRound,
} from "lucide-react";

const problems = [
  {
    icon: RefreshCw,
    title: "Isi Ulang Data Berulang",
    description:
      "Setiap sesi backtest, trader harus mengisi ulang metode, strategi, aturan entry/exit dari awal. Membuang waktu berharga.",
    color: "from-accent-rose/20 to-accent-rose/5",
    iconColor: "text-accent-rose",
    borderColor: "border-accent-rose/10",
  },
  {
    icon: SearchX,
    title: "Tidak Bisa Analisis Per Konsep",
    description:
      "Tidak ada cara mudah mengetahui apakah CISD, MSS, atau IFVG yang memberi win rate tertinggi. Data tercampur tanpa breakdown.",
    color: "from-accent-amber/20 to-accent-amber/5",
    iconColor: "text-accent-amber",
    borderColor: "border-accent-amber/10",
  },
  {
    icon: ImageOff,
    title: "Tanpa Bukti Visual Standar",
    description:
      "Tidak ada standar dokumentasi foto setup. Banyak trade tanpa screenshot, sulit review dan belajar dari kesalahan.",
    color: "from-primary/20 to-primary/5",
    iconColor: "text-primary",
    borderColor: "border-primary/10",
  },
  {
    icon: UsersRound,
    title: "Sulit Bandingkan Performa",
    description:
      "Trader mengklaim win rate tinggi tanpa bukti. Tidak ada standar metrik yang bisa dipercaya untuk membandingkan strategi.",
    color: "from-accent-cyan/20 to-accent-cyan/5",
    iconColor: "text-accent-cyan",
    borderColor: "border-accent-cyan/10",
  },
];

export default function ProblemSection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm font-semibold text-accent-rose uppercase tracking-wider mb-3">
            Masalah Yang Familiar
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Kenapa Backtest Manual{" "}
            <span className="gradient-text-warm">Sering Gagal?</span>
          </h2>
          <p className="mt-4 text-muted text-lg">
            Trader menghabiskan waktu berjam-jam untuk backtest, tapi tanpa
            sistem yang tepat, hasilnya tetap membingungkan.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {problems.map((problem, i) => (
            <div
              key={i}
              className={`group relative rounded-2xl border ${problem.borderColor} bg-gradient-to-br ${problem.color} p-6 sm:p-8 hover:scale-[1.02] transition-all duration-300`}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}
              >
                <problem.icon className={`w-6 h-6 ${problem.iconColor}`} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{problem.title}</h3>
              <p className="text-sm text-muted leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
