"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { strategySchema } from "@/lib/validations/strategy";
import { getSession } from "@/lib/actions/auth";
import type { StrategyInput } from "@/lib/validations/strategy";
import type { Strategy } from "@prisma/client";

type ActionResult<T = void> = {
  data?: T;
  error?: string | Record<string, string[]>;
};

/**
 * Get all strategies for a given method (owned by current user)
 */
export async function getStrategiesByMethod(methodId: string) {
  const user = await getSession();
  if (!user) return [];

  // Verify method ownership
  const method = await prisma.method.findFirst({
    where: { id: methodId, userId: user.id },
  });
  if (!method) return [];

  return prisma.strategy.findMany({
    where: { methodId },
    include: {
      concepts: true,
      sessions: true,
      _count: { select: { backtestSessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get a single strategy by ID
 */
export async function getStrategyById(id: string) {
  const user = await getSession();
  if (!user) return null;

  return prisma.strategy.findFirst({
    where: {
      id,
      method: { userId: user.id },
    },
    include: {
      concepts: true,
      sessions: true,
      method: { select: { id: true, name: true } },
      _count: { select: { backtestSessions: true } },
    },
  });
}

/**
 * Create a new strategy with concepts and sessions
 */
export async function createStrategy(
  input: StrategyInput
): Promise<ActionResult<Strategy>> {
  try {
    const parsed = strategySchema.safeParse(input);
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

    const strategy = await prisma.strategy.create({
      data: {
        methodId: parsed.data.methodId,
        name: parsed.data.name,
        triggerEntry: parsed.data.triggerEntry,
        slRule: parsed.data.slRule,
        tpRule: parsed.data.tpRule,
        concepts: {
          create: parsed.data.concepts.map((c) => ({ name: c.name })),
        },
        sessions: {
          create: parsed.data.sessions.map((s) => ({ sessionName: s })),
        },
      },
      include: { concepts: true, sessions: true },
    });

    revalidatePath(`/methods/${parsed.data.methodId}`);
    return { data: strategy };
  } catch (error) {
    console.error("createStrategy error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}

/**
 * Update an existing strategy (sync concepts and sessions)
 */
export async function updateStrategy(
  id: string,
  input: StrategyInput
): Promise<ActionResult<Strategy>> {
  try {
    const parsed = strategySchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors as Record<string, string[]> };
    }

    const user = await getSession();
    if (!user) return { error: "Anda harus login untuk melakukan ini" };

    // Verify ownership via method
    const existing = await prisma.strategy.findFirst({
      where: { id, method: { userId: user.id } },
    });
    if (!existing) return { error: "Data tidak ditemukan" };

    // Delete old concepts/sessions and recreate (sync)
    await prisma.strategyConcept.deleteMany({ where: { strategyId: id } });
    await prisma.strategySession.deleteMany({ where: { strategyId: id } });

    const strategy = await prisma.strategy.update({
      where: { id },
      data: {
        name: parsed.data.name,
        triggerEntry: parsed.data.triggerEntry,
        slRule: parsed.data.slRule,
        tpRule: parsed.data.tpRule,
        concepts: {
          create: parsed.data.concepts.map((c) => ({ name: c.name })),
        },
        sessions: {
          create: parsed.data.sessions.map((s) => ({ sessionName: s })),
        },
      },
      include: { concepts: true, sessions: true },
    });

    revalidatePath(`/methods/${existing.methodId}`);
    return { data: strategy };
  } catch (error) {
    console.error("updateStrategy error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}

/**
 * Delete a strategy (cascade: concepts, sessions, trades)
 */
export async function deleteStrategy(id: string): Promise<ActionResult> {
  try {
    const user = await getSession();
    if (!user) return { error: "Anda harus login untuk melakukan ini" };

    const existing = await prisma.strategy.findFirst({
      where: { id, method: { userId: user.id } },
    });
    if (!existing) return { error: "Data tidak ditemukan" };

    await prisma.strategy.delete({ where: { id } });

    revalidatePath(`/methods/${existing.methodId}`);
    return {};
  } catch (error) {
    console.error("deleteStrategy error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}
