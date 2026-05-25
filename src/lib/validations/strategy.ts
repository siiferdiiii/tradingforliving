import { z } from "zod";

export const strategySchema = z.object({
  methodId: z.string().uuid("Method tidak valid"),
  name: z.string().min(3, "Nama minimal 3 karakter").max(100, "Nama maksimal 100 karakter"),
  triggerEntry: z.string().min(1, "Trigger entry wajib diisi").max(1000, "Trigger entry maksimal 1000 karakter"),
  slRule: z.string().min(1, "SL rule wajib diisi").max(500, "SL rule maksimal 500 karakter"),
  tpRule: z.string().min(1, "TP rule wajib diisi").max(500, "TP rule maksimal 500 karakter"),
  concepts: z
    .array(z.object({ name: z.string().min(1, "Nama konsep wajib diisi").max(50, "Nama konsep maksimal 50 karakter") }))
    .min(1, "Minimal 1 konsep"),
  sessions: z
    .array(z.enum(["ASIA", "LONDON", "NEW_YORK", "LONDON_CLOSE"]))
    .min(1, "Pilih minimal 1 session"),
});

export type StrategyInput = z.infer<typeof strategySchema>;
