import { createServerClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createServerClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Check / create user in our DB
      const existingUser = await prisma.user.findUnique({
        where: { id: data.user.id },
      });

      if (!existingUser) {
        // Derive username from GitHub handle or email prefix, ensure uniqueness
        const rawUsername =
          (data.user.user_metadata?.user_name as string) ||
          data.user.email?.split("@")[0] ||
          data.user.id.slice(0, 8);

        // Sanitise: only alphanumeric + underscore, max 20 chars
        const sanitised = rawUsername
          .replace(/[^a-zA-Z0-9_]/g, "_")
          .slice(0, 20);

        // Check uniqueness — append random suffix if needed
        let username = sanitised;
        const existing = await prisma.user.findUnique({ where: { username } });
        if (existing) {
          username = `${sanitised.slice(0, 14)}_${Math.random()
            .toString(36)
            .slice(2, 6)}`;
        }

        await prisma.user.create({
          data: {
            id: data.user.id,
            email: data.user.email!,
            username,
            profile: { create: {} },
          },
        });
      }
    }
  }

  return NextResponse.redirect(new URL("/dashboard", origin));
}
