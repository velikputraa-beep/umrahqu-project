import React, { Suspense } from "react";
import { fetchTableData } from "@/lib/supabase/data";
import AirlinesClient from "./AirlinesClient";

export default async function MaskapaiPage() {
  const airlines = await fetchTableData("airlines");

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Memuat data maskapai...</div>}>
      <AirlinesClient initialAirlines={airlines} />
    </Suspense>
  );
}
