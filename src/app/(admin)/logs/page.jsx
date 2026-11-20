import React, { Suspense } from "react";
import { fetchTableData } from "@/lib/supabase/data";
import LogsClient from "./LogsClient";

export default async function LogAktivitasPage() {
  const logs = await fetchTableData("logs");

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Memuat log aktivitas...</div>}>
      <LogsClient initialLogs={logs} />
    </Suspense>
  );
}
