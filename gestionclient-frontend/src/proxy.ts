import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const publicPaths = ["/login", "/register"];

export function proxy (request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // For protected routes, we rely on client-side AuthGuard
  // since JWT is stored in localStorage (not accessible in middleware)
  // Middleware here serves as a lightweight first check
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
