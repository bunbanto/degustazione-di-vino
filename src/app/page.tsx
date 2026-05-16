import { redirect } from "next/navigation";
import { getLangFromSegment } from "@/i18n/i18n";

export default function HomeRedirect() {
  // Middleware will handle language prefix for most cases.
  // This is a fallback for direct root navigation.
  redirect(`/${getLangFromSegment(undefined)}`);
}
