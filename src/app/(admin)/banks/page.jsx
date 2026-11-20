import React, { Suspense } from "react";
import { fetchTableData } from "@/lib/supabase/data";
import BanksClient from "./BanksClient";

export default async function RekeningBankPage() {
  const accounts = await fetchTableData("banks");

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Memuat data rekening...</div>}>
      <BanksClient initialAccounts={accounts} />
    </Suspense>
  );
}
