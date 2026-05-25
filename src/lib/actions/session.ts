"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { sessionSchema } from "@/lib/validations/session";
import { getSession } from "@/lib/actions/auth";
import type { SessionInput } from "@/lib/validations/session";
import type { BacktestSession } from "@prisma/client";

type ActionResult<T = void> = {
  data?: T;
  error?: string | Record<string, string[]>;
};

export type SessionFilters = {
  methodId?: string;
  strategyId?: string;
  instrument?: string;
  dateFrom?: Date;
  dateTo?: Date;
};

/**
 * Get all backtest sessions for current user with optional filters
 */
export async function getSessionsByUser(filters?: SessionFilters) {
  const user = await getSession();
  if (!user) return [];

  return prisma.backtestSession.findMany({
    where: {
      userId: user.id,
      ...(filters?.methodId && { methodId: filters.methodId }),
      ...(filters?.strategyId && { strategyId: filters.strategyId }),
      ...(filters?.instrument && {
        instrument: { contains: filters.instrument, mode: "insensitive" },
      }),
      ...(filters?.dateFrom && { periodStart: { gte: filters.dateFrom } }),
      ...(filters?.dateTo && { periodEnd: { lte: filters.dateTo } }),
    },
    include: {
      method: { select: { id: true, name: true } },
      strategy: { select: { id: true, name: true } },
      trades: {
        select: {
          result: true,
          actualR: true,
        },
      },
      _count: { select: { trades: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get a single session by ID (with trade stats)
 */
export async function getSessionById(id: string) {
  const user = await getSession();
  if (!user) return null;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    return null;
  }

  const session = await prisma.backtestSession.findFirst({
    where: { id, userId: user.id },
    include: {
      method: true,
      strategy: { include: { concepts: true, sessions: true } },
      trades: {
        include: { closes: true, images: true, concepts: true },
        orderBy: { tradeDate: "asc" },
      },
      _count: { select: { trades: true } },
    },
  });

  return session;
}

/**
 * Create a new backtest session
 */
export async function createSession(
  input: SessionInput
): Promise<ActionResult<BacktestSession>> {
  try {
    const parsed = sessionSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors as Record<string, string[]> };
    }

    const user = await getSession();
    if (!user) return { error: "Anda harus login untuk melakukan ini" };

    // Verify method ownership
    const method = await prisma.method.findFirst({
      where: { id: parsed.data.methodId, userId: user.id },
    });
    if (!method) return { error: "Anda tidak memiliki akses ke data ini" };

    // Verify strategy belongs to method
    const strategy = await prisma.strategy.findFirst({
      where: { id: parsed.data.strategyId, methodId: parsed.data.methodId },
    });
    if (!strategy) return { error: "Strategy tidak ditemukan dalam method ini" };

    const session = await prisma.backtestSession.create({
      data: {
        userId: user.id,
        methodId: parsed.data.methodId,
        strategyId: parsed.data.strategyId,
        name: parsed.data.name,
        instrument: parsed.data.instrument.toUpperCase(),
        periodStart: parsed.data.periodStart,
        periodEnd: parsed.data.periodEnd,
      },
    });

    revalidatePath("/sessions");
    return { data: session };
  } catch (error) {
    console.error("createSession error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}

/**
 * Update session metadata
 */
export async function updateSession(
  id: string,
  input: SessionInput
): Promise<ActionResult<BacktestSession>> {
  try {
    const parsed = sessionSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors as Record<string, string[]> };
    }

    const user = await getSession();
    if (!user) return { error: "Anda harus login untuk melakukan ini" };

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return { error: "ID tidak valid" };
    }

    const existing = await prisma.backtestSession.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return { error: "Data tidak ditemukan" };

    const session = await prisma.backtestSession.update({
      where: { id },
      data: {
        name: parsed.data.name,
        instrument: parsed.data.instrument.toUpperCase(),
        periodStart: parsed.data.periodStart,
        periodEnd: parsed.data.periodEnd,
      },
    });

    revalidatePath("/sessions");
    revalidatePath(`/sessions/${id}`);
    return { data: session };
  } catch (error) {
    console.error("updateSession error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}

/**
 * Delete a session (cascade: all trades, closes, images, concepts)
 */
export async function deleteSession(id: string): Promise<ActionResult> {
  try {
    const user = await getSession();
    if (!user) return { error: "Anda harus login untuk melakukan ini" };

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return { error: "ID tidak valid" };
    }

    const existing = await prisma.backtestSession.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return { error: "Data tidak ditemukan" };

    await prisma.backtestSession.delete({ where: { id } });

    revalidatePath("/sessions");
    return {};
  } catch (error) {
    console.error("deleteSession error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}
