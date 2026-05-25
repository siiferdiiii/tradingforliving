import { z } from "zod";

export const sessionSchema = z
  .object({
    name: z
      .string()
      .min(3, "Nama minimal 3 karakter")
      .max(100, "Nama maksimal 100 karakter"),
    methodId: z.string().uuid("Pilih method"),
    strategyId: z.string().uuid("Pilih strategy"),
    instrument: z
      .string()
      .min(1, "Instrument wajib diisi")
      .max(20, "Instrument maksimal 20 karakter"),
    periodStart: z.coerce.date({
      message: "Tanggal mulai tidak valid",
    }),
    periodEnd: z.coerce.date({
      message: "Tanggal akhir tidak valid",
    }),
  })
  .refine((data) => data.periodEnd >= data.periodStart, {
    message: "Akhir periode harus setelah atau sama dengan awal periode",
    path: ["periodEnd"],
  });

export type SessionInput = z.infer<typeof sessionSchema>;
