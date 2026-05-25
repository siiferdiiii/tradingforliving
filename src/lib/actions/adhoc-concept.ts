"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/actions/auth";
import type { AdHocConcept } from "@prisma/client";

type ActionResult<T = void> = {
  data?: T;
  error?: string;
};

/**
 * Get all ad-hoc concepts owned by the current user (for autocomplete / tag picker)
 */
export async function getAdHocConcepts(): Promise<AdHocConcept[]> {
  const user = await getSession();
  if (!user) return [];

  return prisma.adHocConcept.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });
}

/**
 * Upsert an ad-hoc concept by name — creates if not exists, returns existing if present.
 * This way the user's global library stays clean with no duplicates.
 */
export async function upsertAdHocConcept(
  name: string
): Promise<ActionResult<AdHocConcept>> {
  try {
    const user = await getSession();
    if (!user) return { error: "Anda harus login untuk melakukan ini" };

    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 50) {
      return { error: "Nama konsep tidak valid (1-50 karakter)" };
    }

    const concept = await prisma.adHocConcept.upsert({
      where: { userId_name: { userId: user.id, name: trimmed } },
      create: { userId: user.id, name: trimmed },
      update: {},
    });

    revalidatePath("/sessions");
    return { data: concept };
  } catch (error) {
    console.error("upsertAdHocConcept error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}

/**
 * Delete an ad-hoc concept from the user's library.
 * (Cascade will remove all TradeAdHocConcept relations too)
 */
export async function deleteAdHocConcept(id: string): Promise<ActionResult> {
  try {
    const user = await getSession();
    if (!user) return { error: "Anda harus login untuk melakukan ini" };

    const existing = await prisma.adHocConcept.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return { error: "Konsep tidak ditemukan" };

    await prisma.adHocConcept.delete({ where: { id } });
    revalidatePath("/sessions");
    return {};
  } catch (error) {
    console.error("deleteAdHocConcept error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}
