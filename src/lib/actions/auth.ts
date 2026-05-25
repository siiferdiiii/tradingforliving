"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import type { LoginInput, RegisterInput } from "@/lib/validations/auth";

type ActionResult<T = void> = {
  data?: T;
  error?: string | Record<string, string[]>;
};

/**
 * Get current authenticated user session
 */
export async function getSession() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;
  return user;
}

/**
 * Get current user's DB record with profile
 */
export async function getCurrentUser() {
  const user = await getSession();
  if (!user) return null;

  return prisma.user.findUnique({
    where: { id: user.id },
    include: { profile: true },
  });
}

/**
 * Register new user:
 * 1. Validate input (Zod)
 * 2. Supabase Auth: signUp
 * 3. Prisma: create User + Profile
 */
export async function register(
  input: RegisterInput
): Promise<ActionResult<{ userId: string }>> {
  try {
    // 1. Validate
    const parsed = registerSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors as Record<string, string[]> };
    }

    const { email, password, username } = parsed.data;

    // Check username uniqueness
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return { error: "Username sudah digunakan" };
    }

    // 2. Supabase Auth: signUp
    const supabase = await createServerClient();
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });

    if (authError) {
      if (authError.message.includes("already registered")) {
        return { error: "Email sudah terdaftar" };
      }
      return { error: authError.message };
    }

    if (!authData.user) {
      return { error: "Terjadi kesalahan server. Silakan coba lagi." };
    }

    // 3. Prisma: create User + Profile
    await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        username,
        profile: { create: {} },
      },
    });

    return { data: { userId: authData.user.id } };
  } catch (error) {
    console.error("register error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}

/**
 * Login with email and password
 */
export async function login(
  input: LoginInput
): Promise<ActionResult> {
  try {
    const parsed = loginSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.flatten().fieldErrors as Record<string, string[]> };
    }

    const supabase = await createServerClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        return { error: "Email atau password salah" };
      }
      return { error: error.message };
    }

    revalidatePath("/", "layout");
    return {};
  } catch (error) {
    console.error("login error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}

/**
 * Logout and clear session
 */
export async function logout(): Promise<ActionResult> {
  try {
    const supabase = await createServerClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
  } catch (error) {
    console.error("logout error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}

/**
 * Initiate GitHub OAuth flow
 */
export async function loginWithGitHub(): Promise<ActionResult<{ url: string }>> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/callback`,
      },
    });

    if (error) return { error: error.message };
    if (!data.url) return { error: "Terjadi kesalahan server. Silakan coba lagi." };

    return { data: { url: data.url } };
  } catch (error) {
    console.error("loginWithGitHub error:", error);
    return { error: "Terjadi kesalahan server. Silakan coba lagi." };
  }
}
