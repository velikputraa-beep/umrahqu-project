import React, { Suspense } from "react";
import { fetchTableData } from "@/lib/supabase/data";
import WebsitesClient from "./WebsitesClient";

export default async function KelolaWebsiteTravelPage() {
  const websites = await fetchTableData("websites");

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Memuat data website...</div>}>
      <WebsitesClient initialWebsites={websites} />
    </Suspense>
  );
}
