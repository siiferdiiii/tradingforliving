import { z } from "zod";

const tradeCloseSchema = z.object({
  closePrice: z.coerce.number().positive("Harga close harus positif"),
  percentage: z.coerce.number().min(0, "Persentase minimal 0").max(100, "Persentase maksimal 100"),
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional(),
});

const tradeConceptSchema = z.object({
  strategyConceptId: z.string().uuid("Concept ID tidak valid"),
  isPresent: z.boolean(),
});

const tradeAdHocConceptSchema = z.object({
  name: z.string().min(1, "Nama konsep wajib diisi").max(50, "Nama konsep maksimal 50 karakter"),
  isPresent: z.boolean().default(true),
});

export const tradeSchema = z
  .object({
    sessionId: z.string().uuid("Session tidak valid"),
    tradeDate: z.coerce.date({
      message: "Tanggal trade tidak valid",
    }),
    session: z.enum(["ASIA", "LONDON", "NEW_YORK", "LONDON_CLOSE"]),
    entryPrice: z.coerce.number().positive("Entry price harus positif"),
    slPrice: z.coerce.number().positive("SL price harus positif"),
    tpPrice: z.coerce.number().positive("TP price harus positif"),
    result: z.enum(["WIN", "LOSS", "BREAKEVEN", "PARTIAL"]),
    timeframeTrigger: z.string().min(1, "Timeframe trigger wajib diisi"),
    notes: z.string().max(1000, "Catatan maksimal 1000 karakter").optional(),
    mood: z.enum(["DISCIPLINED", "RUSHED", "HESITANT"]).optional(),
    closes: z.array(tradeCloseSchema).default([]),
    concepts: z.array(tradeConceptSchema).default([]),
    adHocConcepts: z.array(tradeAdHocConceptSchema).default([]),
  })
  .refine((data) => data.entryPrice !== data.slPrice, {
    message: "Entry price tidak boleh sama dengan SL price",
    path: ["slPrice"],
  })
  .refine(
    (data) => {
      if (data.result === "PARTIAL" && data.closes.length > 0) {
        const total = data.closes.reduce((sum, c) => sum + c.percentage, 0);
        return Math.abs(total - 100) < 0.01;
      }
      return true;
    },
    {
      message: "Total persentase close harus = 100%",
      path: ["closes"],
    }
  );

export type TradeInput = z.infer<typeof tradeSchema>;
export type TradeCloseInput = z.infer<typeof tradeCloseSchema>;
export type TradeConceptInput = z.infer<typeof tradeConceptSchema>;
export type TradeAdHocConceptInput = z.infer<typeof tradeAdHocConceptSchema>;
