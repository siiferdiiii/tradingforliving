"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { tradeSchema } from "@/lib/validations/trade";
import { getSession } from "@/lib/actions/auth";
import { calculateRR } from "@/lib/utils/rr-calculator";
import type { TradeInput } from "@/lib/validations/trade";
import type { Trade } from "@prisma/client";

type ActionResult<T = void> = {
  data?: T;
  error?: string | Record<string, string[]>;
};

/**
 * Upsert ad-hoc concepts for a user, return their IDs.
 * Called inside createTrade / updateTrade to keep the global library in sync.
 */
async function resolveAdHocConceptIds(
  userId: string,
  adHocConcepts: { name: string; isPresent: boolean }[]
): Promise<{ adHocConceptId: string; isPresent: boolean }[]> {
  const results: { adHocConceptId: string; isPresent: boolean }[] = [];

  for (const c of adHocConcepts) {
    const trimmed = c.name.trim();
    if (!trimmed) continue;

    const concept = await prisma.adHocConcept.upsert({
      where: { userId_name: { userId, name: trimmed } },
      create: { userId, name: trimmed },
      update: {},
      select: { id: true },
    });

    results.push({ adHocConceptId: concept.id, isPresent: c.isPresent });
  }

  return results;
}

/**
 * Get all trades for a session (include closes, images, concepts, ad-hoc concepts)
 */
export async function getTradesBySession(sessionId: string) {
  const user = await getSession();
  if (!user) return [];

  const session = await prisma.backtestSession.findFirst({
    where: { id: sessionId, userId: user.id },
  });
  if (!session) return [];

  return prisma.trade.findMany({
    where: { sessionId },
    include: {
      closes: true,
      images: true,
      concepts: {
        include: { strategyConcept: true },
      },
      adHocConcepts: {
        include: { adHocConcept: true },
      },
    },
    orderBy: { tradeDate: "asc" },
  });
}

/**
 * Get a single trade by ID
 */
export async function getTradeById(id: string) {
  const user = await getSession();
  if (!user) return null;

  return prisma.trade.findFirst({
    where: {
      id,
      backtestSession: { userId: user.id },
    },
    include: {
      closes: true,
      images: true,
      concepts: { include: { strategyConcept: true } },
      adHocConcepts: { include: { adHocConcept: true } },
      backtestSession: {
        select: { id: true, name: true, instrument: true },
      },
    },
  });
}

/**
 * Create a trade with auto-calculated R:R
 * Handles nested closes, strategy concepts, and ad-hoc concepts in one transaction
 */
export async function createTrade(
  input: TradeInput
): Promise<ActionResult<Trade>> {
  try {
    const parsed = tradeSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors as Record<string, string[]> };
    }

    const user = await getSession();
    if (!user) return { error: "Anda harus login untuk melakukan ini" };

    // Verify session ownership
    const session = await prisma.backtestSession.findFirst({
      where: { id: parsed.data.sessionId, userId: user.id },
    });
    if (!session) return { error: "Anda tidak memiliki akses ke data ini" };

    // Calculate R:R
    const { riskPips, rewardPips, rrTarget, actualR } = calculateRR({
      entryPrice: parsed.data.entryPrice,
      slPrice: parsed.data.slPrice,
      tpPrice: parsed.data.tpPrice,
      result: parsed.data.result,
      closes: parsed.data.closes,
    });

    // Resolve ad-hoc concepts (upsert into global library)
    const resolvedAdHoc = await resolveAdHocConceptIds(
      user.id,
      parsed.data.adHocConcepts
    );

    // Create trade with all nested relations
    const trade = await prisma.trade.create({
      data: {
        sessionId: parsed.data.sessionId,
        tradeDate: parsed.data.tradeDate,
        session: parsed.data.session,
        entryPrice: parsed.data.entryPrice,
        slPrice: parsed.data.slPrice,
        tpPrice: parsed.data.tpPrice,
        result: parsed.data.result,
        timeframeTrigger: parsed.data.timeframeTrigger,
        notes: parsed.data.notes,
        mood: parsed.data.mood,
        riskPips,
        rewardPips,
        rrTarget,
        actualR,
        closes: {
          create: parsed.data.closes.map((c) => ({
            closePrice: c.closePrice,
            percentage: c.percentage,
            notes: c.notes,
          })),
        },
        concepts: {
          create: parsed.data.concepts.map((c) => ({
            strategyConceptId: c.strategyConceptId,
            isPresent: c.isPresent,
          })),
        },
        adHocConcepts: {
          create: resolvedAdHoc.map((c) => ({
            adHocConceptId: c.adHocConceptId,
            isPresent: c.isPresent,
          })),
        },
      },
      include: { closes: true, images: true, concepts: true, adHocConcepts: true },
    });

    revalidatePath(`/sessions/${parsed.data.sessionId}`);
    revalidatePath("/analytics");
    revalidatePath("/dashboard");
    return { data: trade };
  } catch (error) {
    console.error("createTrade error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}

/**
 * Update a trade and recalculate R:R
 */
export async function updateTrade(
  id: string,
  input: TradeInput
): Promise<ActionResult<Trade>> {
  try {
    const parsed = tradeSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors as Record<string, string[]> };
    }

    const user = await getSession();
    if (!user) return { error: "Anda harus login untuk melakukan ini" };

    const existing = await prisma.trade.findFirst({
      where: { id, backtestSession: { userId: user.id } },
    });
    if (!existing) return { error: "Data tidak ditemukan" };

    // Recalculate R:R
    const { riskPips, rewardPips, rrTarget, actualR } = calculateRR({
      entryPrice: parsed.data.entryPrice,
      slPrice: parsed.data.slPrice,
      tpPrice: parsed.data.tpPrice,
      result: parsed.data.result,
      closes: parsed.data.closes,
    });

    // Resolve ad-hoc concepts
    const resolvedAdHoc = await resolveAdHocConceptIds(
      user.id,
      parsed.data.adHocConcepts
    );

    // Delete old relations and recreate
    await prisma.tradeClose.deleteMany({ where: { tradeId: id } });
    await prisma.tradeConcept.deleteMany({ where: { tradeId: id } });
    await prisma.tradeAdHocConcept.deleteMany({ where: { tradeId: id } });

    const trade = await prisma.trade.update({
      where: { id },
      data: {
        tradeDate: parsed.data.tradeDate,
        session: parsed.data.session,
        entryPrice: parsed.data.entryPrice,
        slPrice: parsed.data.slPrice,
        tpPrice: parsed.data.tpPrice,
        result: parsed.data.result,
        timeframeTrigger: parsed.data.timeframeTrigger,
        notes: parsed.data.notes,
        mood: parsed.data.mood,
        riskPips,
        rewardPips,
        rrTarget,
        actualR,
        closes: {
          create: parsed.data.closes.map((c) => ({
            closePrice: c.closePrice,
            percentage: c.percentage,
            notes: c.notes,
          })),
        },
        concepts: {
          create: parsed.data.concepts.map((c) => ({
            strategyConceptId: c.strategyConceptId,
            isPresent: c.isPresent,
          })),
        },
        adHocConcepts: {
          create: resolvedAdHoc.map((c) => ({
            adHocConceptId: c.adHocConceptId,
            isPresent: c.isPresent,
          })),
        },
      },
      include: { closes: true, images: true, concepts: true, adHocConcepts: true },
    });

    revalidatePath(`/sessions/${existing.sessionId}`);
    revalidatePath("/analytics");
    revalidatePath("/dashboard");
    return { data: trade };
  } catch (error) {
    console.error("updateTrade error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}

/**
 * Delete a trade (cascade: closes, images, concepts, ad-hoc concepts)
 */
export async function deleteTrade(id: string): Promise<ActionResult> {
  try {
    const user = await getSession();
    if (!user) return { error: "Anda harus login untuk melakukan ini" };

    const existing = await prisma.trade.findFirst({
      where: { id, backtestSession: { userId: user.id } },
    });
    if (!existing) return { error: "Data tidak ditemukan" };

    await prisma.trade.delete({ where: { id } });

    revalidatePath(`/sessions/${existing.sessionId}`);
    revalidatePath("/analytics");
    revalidatePath("/dashboard");
    return {};
  } catch (error) {
    console.error("deleteTrade error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}
