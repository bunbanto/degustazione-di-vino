import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/i18n/i18n";

const SUPPORTED = SUPPORTED_LANGS as readonly string[];

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
    url.pathname = `/${DEFAULT_LANG}${url.pathname === "/" ? "" : url.pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon\\.ico).*)"],
};
