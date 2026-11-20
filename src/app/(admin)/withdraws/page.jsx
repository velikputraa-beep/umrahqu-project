import React, { Suspense } from "react";
import { fetchTableData } from "@/lib/supabase/data";
import WithdrawsClient from "./WithdrawsClient";

export default async function KlaimCashbackPage() {
  const withdraws = await fetchTableData("withdraws");

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Memuat data pencairan...</div>}>
      <WithdrawsClient initialWithdraws={withdraws} />
    </Suspense>
  );
}
