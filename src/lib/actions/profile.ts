"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { profileSchema } from "@/lib/validations/profile";
import { getSession } from "@/lib/actions/auth";
import type { ProfileInput } from "@/lib/validations/profile";
import type { Profile } from "@prisma/client";

type ActionResult<T = void> = {
  data?: T;
  error?: string | Record<string, string[]>;
};

/**
 * Update current user's profile (displayName, bio, avatarUrl)
 */
export async function updateProfile(
  input: ProfileInput
): Promise<ActionResult<Profile>> {
  try {
    const parsed = profileSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors as Record<string, string[]> };
    }

    const user = await getSession();
    if (!user) return { error: "Anda harus login untuk melakukan ini" };

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        displayName: parsed.data.displayName,
        bio: parsed.data.bio,
        avatarUrl: parsed.data.avatarUrl || null,
      },
      update: {
        displayName: parsed.data.displayName,
        bio: parsed.data.bio,
        avatarUrl: parsed.data.avatarUrl || null,
      },
    });

    revalidatePath("/profile");
    return { data: profile };
  } catch (error) {
    console.error("updateProfile error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}

/**
 * Get current user profile with aggregate stats
 */
export async function getMyProfile() {
  const user = await getSession();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      profile: true,
      _count: {
        select: {
          methods: true,
          backtestSessions: true,
        },
      },
    },
  });

  if (!dbUser) return null;

  // Aggregate trade stats
  const trades = await prisma.trade.findMany({
    where: { backtestSession: { userId: user.id } },
    select: { result: true, actualR: true },
  });

  const totalTrades = trades.length;
  const wins = trades.filter(
    (t) => t.result === "WIN" || t.result === "PARTIAL"
  ).length;
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 1000) / 10 : 0;
  const avgR =
    totalTrades > 0
      ? Math.round(
          (trades.reduce((s, t) => s + Number(t.actualR), 0) / totalTrades) * 100
        ) / 100
      : 0;

  return {
    ...dbUser,
    stats: { totalTrades, winRate, avgR },
  };
}

/**
 * Get a public profile by username with published methods + stats
 */
export async function getPublicProfile(username: string) {
  const dbUser = await prisma.user.findUnique({
    where: { username },
    include: {
      profile: true,
      methods: {
        where: { isPublic: true },
        include: {
          timeframes: true,
          _count: { select: { strategies: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!dbUser) return null;

  // Aggregate stats from all trades
  const trades = await prisma.trade.findMany({
    where: { backtestSession: { userId: dbUser.id } },
    select: { result: true, actualR: true },
  });

  const totalTrades = trades.length;
  const wins = trades.filter(
    (t) => t.result === "WIN" || t.result === "PARTIAL"
  ).length;
  const winRate = totalTrades > 0 ? Math.round((wins / totalTrades) * 1000) / 10 : 0;
  const avgR =
    totalTrades > 0
      ? Math.round(
          (trades.reduce((s, t) => s + Number(t.actualR), 0) / totalTrades) * 100
        ) / 100
      : 0;

  return {
    username: dbUser.username,
    displayName: dbUser.profile?.displayName ?? dbUser.username,
    bio: dbUser.profile?.bio ?? null,
    avatarUrl: dbUser.profile?.avatarUrl ?? null,
    publicMethods: dbUser.methods,
    stats: { totalTrades, winRate, avgR },
  };
}
