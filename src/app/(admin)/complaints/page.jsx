import React, { Suspense } from "react";
import { fetchTableData } from "@/lib/supabase/data";
import ComplaintsClient from "./ComplaintsClient";

export default async function KeluhanPelangganPage() {
  const complaints = await fetchTableData("complaints");

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Memuat data keluhan...</div>}>
      <ComplaintsClient initialComplaints={complaints} />
    </Suspense>
  );
}
