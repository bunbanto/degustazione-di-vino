import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPPORTED = ["uk", "en", "it"];

function pickLang(req: NextRequest): string {
  const url = req.nextUrl;
  const first = url.pathname.split("/").filter(Boolean)[0];
  if (SUPPORTED.includes(first || "")) return first;

  const accept = req.headers.get("accept-language") || "";
  // very small heuristic
  if (accept.toLowerCase().includes("it")) return "it";
  if (accept.toLowerCase().includes("en")) return "en";
  return "uk";
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  // Skip static files
  if (
    url.pathname.startsWith("/_next") ||
    url.pathname.startsWith("/api") ||
    url.pathname.match(
      /\.(png|jpg|jpeg|svg|ico|css|js|txt|xml|webmanifest|map)$/,
    )
  ) {
    return NextResponse.next();
  }

  const firstSegment = url.pathname.split("/").filter(Boolean)[0];
  if (!SUPPORTED.includes(firstSegment || "")) {
    const lang = pickLang(req);
    url.pathname = `/${lang}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon\\.ico).*)"],
};
