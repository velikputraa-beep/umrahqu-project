import React from "react";
import BookingsListClient from "./BookingsListClient";
import { fetchTableData } from "@/lib/supabase/data";

export const metadata = {
  title: "Daftar Pesanan",
};

export default async function BookingsListPage() {
  const orders = await fetchTableData("bookings");
  return <BookingsListClient initialOrders={orders} />;
}
