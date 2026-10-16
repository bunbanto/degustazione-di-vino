import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import it from "i18n-iso-countries/langs/it.json";
import uk from "i18n-iso-countries/langs/uk.json";
import type { Lang } from "@/i18n/i18n";

countries.registerLocale(en);
countries.registerLocale(it);
countries.registerLocale(uk);

const countryNameLocales: Lang[] = ["uk", "en", "it"];

export function getCountryFlagCode(country: string, lang: Lang): string | null {
  const name = country.trim();
  if (!name) return null;

  for (const locale of [lang, ...countryNameLocales]) {
    const code = countries.getAlpha2Code(name, locale);
    if (code) return code.toLowerCase();
  }

  return null;
}
