import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const protectedPaths = ["/dashboard", "/me", "/members", "/events"];
const authPaths = ["/login", "/signup"];

function isProtected(pathname: string) {
  return protectedPaths.some((p) => pathname.startsWith(p));
}

function isAuthPath(pathname: string) {
  return authPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  const res = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Redirecionar não autenticados que acessam área protegida
  if (isProtected(pathname)) {
    const authCookie = request.cookies.get("sb-")?.value ?? "";
    const hasSession = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
    if (!hasSession) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", pathname);
      return Response.redirect(url);
    }
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
