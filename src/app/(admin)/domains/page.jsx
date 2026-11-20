import React, { Suspense } from "react";
import { fetchTableData } from "@/lib/supabase/data";
import DomainsClient from "./DomainsClient";

export default async function KelolaCustomDomainPage() {
  const domains = await fetchTableData("domains");

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Memuat data domain...</div>}>
      <DomainsClient initialDomains={domains} />
    </Suspense>
  );
}
