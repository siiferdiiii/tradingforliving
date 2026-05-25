"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { methodSchema } from "@/lib/validations/method";
import { getSession } from "@/lib/actions/auth";
import type { MethodInput } from "@/lib/validations/method";
import type { Method } from "@prisma/client";

type ActionResult<T = void> = {
  data?: T;
  error?: string | Record<string, string[]>;
};

/**
 * Get all methods belonging to current user (with strategy + trade counts)
 */
export async function getMethodsByUser() {
  const user = await getSession();
  if (!user) return [];

  return prisma.method.findMany({
    where: { userId: user.id },
    include: {
      timeframes: true,
      _count: { select: { strategies: true, backtestSessions: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Get a single method by ID (owned by current user)
 */
export async function getMethodById(id: string) {
  const user = await getSession();
  if (!user) return null;

  return prisma.method.findFirst({
    where: { id, userId: user.id },
    include: {
      timeframes: true,
      strategies: {
        include: {
          concepts: true,
          sessions: true,
          _count: { select: { backtestSessions: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: { select: { backtestSessions: true } },
    },
  });
}

/**
 * Create a new method with timeframes
 */
export async function createMethod(
  input: MethodInput
): Promise<ActionResult<Method>> {
  try {
    const parsed = methodSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors as Record<string, string[]> };
    }

    const user = await getSession();
    if (!user) return { error: "Anda harus login untuk melakukan ini" };

    const method = await prisma.method.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        description: parsed.data.description,
        isPublic: parsed.data.isPublic,
        tags: parsed.data.tags,
        timeframes: {
          create: parsed.data.timeframes.map((tf) => ({ timeframe: tf })),
        },
      },
      include: { timeframes: true },
    });

    revalidatePath("/methods");
    return { data: method };
  } catch (error) {
    console.error("createMethod error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}

/**
 * Update an existing method (sync timeframes)
 */
export async function updateMethod(
  id: string,
  input: MethodInput
): Promise<ActionResult<Method>> {
  try {
    const parsed = methodSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors as Record<string, string[]> };
    }

    const user = await getSession();
    if (!user) return { error: "Anda harus login untuk melakukan ini" };

    // Ownership check
    const existing = await prisma.method.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return { error: "Data tidak ditemukan" };

    // Delete old timeframes and recreate (sync)
    await prisma.methodTimeframe.deleteMany({ where: { methodId: id } });

    const method = await prisma.method.update({
      where: { id },
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        isPublic: parsed.data.isPublic,
        tags: parsed.data.tags,
        timeframes: {
          create: parsed.data.timeframes.map((tf) => ({ timeframe: tf })),
        },
      },
      include: { timeframes: true },
    });

    revalidatePath("/methods");
    revalidatePath(`/methods/${id}`);
    return { data: method };
  } catch (error) {
    console.error("updateMethod error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}

/**
 * Delete a method (cascade: strategies, sessions, trades)
 */
export async function deleteMethod(id: string): Promise<ActionResult> {
  try {
    const user = await getSession();
    if (!user) return { error: "Anda harus login untuk melakukan ini" };

    const existing = await prisma.method.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return { error: "Data tidak ditemukan" };

    await prisma.method.delete({ where: { id } });

    revalidatePath("/methods");
    return {};
  } catch (error) {
    console.error("deleteMethod error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}

/**
 * Toggle method public/private visibility
 */
export async function toggleMethodVisibility(
  id: string
): Promise<ActionResult<Method>> {
  try {
    const user = await getSession();
    if (!user) return { error: "Anda harus login untuk melakukan ini" };

    const existing = await prisma.method.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) return { error: "Data tidak ditemukan" };

    const method = await prisma.method.update({
      where: { id },
      data: { isPublic: !existing.isPublic },
    });

    revalidatePath("/methods");
    revalidatePath(`/methods/${id}`);
    return { data: method };
  } catch (error) {
    console.error("toggleMethodVisibility error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}
