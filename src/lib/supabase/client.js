import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  const isValidUrl =
    supabaseUrl.startsWith("http://") || supabaseUrl.startsWith("https://");
  const safeUrl = isValidUrl
    ? supabaseUrl
    : "https://placeholder-domain-supabase.co";
  const safeKey =
    supabaseAnonKey && !supabaseAnonKey.includes("masukkan_key")
      ? supabaseAnonKey
      : "placeholder-anon-key";

  return createBrowserClient(safeUrl, safeKey);
}
