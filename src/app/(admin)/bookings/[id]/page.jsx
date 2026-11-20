import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import OrderDetailClient from "./OrderDetailClient";
import { fetchSingleRecord } from "@/lib/supabase/data";

export const metadata = {
  title: "Rincian Pesanan",
};

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  const rawId = decodeURIComponent(id);
  const orderData = await fetchSingleRecord("bookings", "id", rawId);
  if (!orderData) notFound();

  return (
    <Suspense
      fallback={<div className="p-8 text-center text-muted-foreground">Memuat rincian pesanan...</div>}
    >
      <OrderDetailClient orderData={orderData} />
    </Suspense>
  );
}
