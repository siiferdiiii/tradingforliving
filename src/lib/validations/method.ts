import { z } from "zod";

export const methodSchema = z.object({
  name: z
    .string()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter"),
  description: z
    .string()
    .max(500, "Deskripsi maksimal 500 karakter")
    .optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string().max(30)).max(10, "Maksimal 10 tags").default([]),
  timeframes: z
    .array(z.enum(["M1", "M5", "M15", "M30", "H1", "H4", "D1", "W1", "MN"]))
    .min(1, "Pilih minimal 1 timeframe"),
});

export type MethodInput = z.infer<typeof methodSchema>;
