import React, { Suspense } from "react";
import { fetchTableData } from "@/lib/supabase/data";
import RegistrationsClient from "./RegistrationsClient";

export default async function PengajuanTravelPage() {
  const submissions = await fetchTableData("registrations");

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Memuat data pengajuan...</div>}>
      <RegistrationsClient initialSubmissions={submissions} />
    </Suspense>
  );
}
