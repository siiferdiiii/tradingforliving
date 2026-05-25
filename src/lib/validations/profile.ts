import { z } from "zod";

export const profileSchema = z.object({
  displayName: z
    .string()
    .max(50, "Nama tampilan maksimal 50 karakter")
    .optional(),
  bio: z.string().max(300, "Bio maksimal 300 karakter").optional(),
  avatarUrl: z.string().url("URL avatar tidak valid").optional().or(z.literal("")),
});

export type ProfileInput = z.infer<typeof profileSchema>;
