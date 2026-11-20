import React, { Suspense } from "react";
import { fetchTableData } from "@/lib/supabase/data";
import DepositsClient from "./DepositsClient";

export default async function DepositSaldoTravelPage() {
  const deposits = await fetchTableData("deposits");

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Memuat data deposit...</div>}>
      <DepositsClient initialDeposits={deposits} />
    </Suspense>
  );
}
