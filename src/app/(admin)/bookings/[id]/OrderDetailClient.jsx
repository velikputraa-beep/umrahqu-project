"use client";

import React from "react";
import { useRouter } from "next/navigation";
import OrderDetailView from "@/components/admin/OrderDetailView";

export default function OrderDetailClient({ orderData }) {
  const router = useRouter();

  return (
    <OrderDetailView
      order={orderData}
      onBack={() => router.push("/bookings/list")}
    />
  );
}
