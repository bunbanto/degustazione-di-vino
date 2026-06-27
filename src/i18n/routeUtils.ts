import { DEFAULT_LANG, type Lang } from "./i18n";

export const LANGS: Lang[] = ["uk", "en", "it"];

export function isLangSegment(s: string): s is Lang {
  return s === "uk" || s === "en" || s === "it";
}

export function getLangFromPath(pathname: string): Lang {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return firstSegment && isLangSegment(firstSegment)
    ? firstSegment
    : DEFAULT_LANG;
}

export function withLang(path: string, lang: Lang): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const parts = normalized.split("/").filter(Boolean);

  if (parts[0] && isLangSegment(parts[0])) {
    const rest = parts.slice(1).join("/");
    return rest ? `/${lang}/${rest}` : `/${lang}`;
  }

  return normalized === "/" ? `/${lang}` : `/${lang}${normalized}`;
}
