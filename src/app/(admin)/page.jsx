import React, { Suspense } from "react";
import { fetchTableData } from "@/lib/supabase/data";
import DashboardClient from "./DashboardClient";

export default async function DashboardAdminPage() {
  const orders = await fetchTableData("bookings");

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Memuat dashboard...</div>}>
      <DashboardClient initialOrders={orders} />
    </Suspense>
  );
}
