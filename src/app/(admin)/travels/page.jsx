import React, { Suspense } from "react";
import { fetchTableData } from "@/lib/supabase/data";
import TravelsClient from "./TravelsClient";

export default async function MitraTravelPage() {
  const travels = await fetchTableData("travels");

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Memuat data travel...</div>}>
      <TravelsClient initialTravels={travels} />
    </Suspense>
  );
}
