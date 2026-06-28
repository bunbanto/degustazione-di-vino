import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { DEFAULT_LANG, SUPPORTED_LANGS } from "@/i18n/locales";

const SUPPORTED = SUPPORTED_LANGS as readonly string[];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const firstSegment = pathname.split("/").filter(Boolean)[0];
  if (!SUPPORTED.includes(firstSegment || "")) {
    const url = req.nextUrl.clone();
    url.pathname = `/${DEFAULT_LANG}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)",
  ],
};
