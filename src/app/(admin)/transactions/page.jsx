import React, { Suspense } from "react";
import { fetchTableData } from "@/lib/supabase/data";
import TransactionsClient from "./TransactionsClient";

export default async function TransaksiPage() {
  const transactions = await fetchTableData("transactions");

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Memuat data transaksi...</div>}>
      <TransactionsClient initialTransactions={transactions} />
    </Suspense>
  );
}
