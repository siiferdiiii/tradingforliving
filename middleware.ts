import { type NextRequest } from "next/server";
import { updateSession } from "./src/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/methods/:path*",
    "/sessions/:path*",
    "/analytics/:path*",
    "/profile/:path*",
    "/login",
    "/register",
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth/callback (OAuth callback must be public)
     * - public assets
     */
  ],
};
