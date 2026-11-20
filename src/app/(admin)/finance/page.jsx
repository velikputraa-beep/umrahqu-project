import React, { Suspense } from "react";
import { fetchTableData } from "@/lib/supabase/data";
import FinanceClient from "./FinanceClient";

export default async function OverviewKeuanganPage() {
  const stats = await fetchTableData("finance_stats");

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Memuat overview keuangan...</div>}>
      <FinanceClient initialStats={stats} />
    </Suspense>
  );
}
