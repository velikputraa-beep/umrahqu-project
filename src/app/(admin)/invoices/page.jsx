import React, { Suspense } from "react";
import { fetchTableData } from "@/lib/supabase/data";
import InvoicesClient from "./InvoicesClient";

export default async function InvoicePage() {
  const invoices = await fetchTableData("invoices");

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Memuat data invoice...</div>}>
      <InvoicesClient initialInvoices={invoices} />
    </Suspense>
  );
}
