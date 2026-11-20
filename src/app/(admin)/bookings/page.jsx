import React from "react";
import BookingsDashboardClient, { DEFAULT_STATS } from "./BookingsDashboardClient";
import { fetchTableData } from "@/lib/supabase/data";

export const metadata = {
  title: "Dashboard Pesanan",
};

export default async function DashboardPesananPage() {
  const stats = await fetchTableData("booking_stats");
  return <BookingsDashboardClient initialStats={stats} />;
}
