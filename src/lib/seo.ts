const RAW_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://degustazione-di-vino.com";

export const SITE_URL = RAW_SITE_URL.replace(/\/$/, "");
export const SITE_NAME = "Degustazione di Vino";
