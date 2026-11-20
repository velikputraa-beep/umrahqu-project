import React, { Suspense } from "react";
import { fetchTableData } from "@/lib/supabase/data";
import ReviewsClient from "./ReviewsClient";

export default async function UlasanPenggunaPage() {
  const reviews = await fetchTableData("reviews");

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Memuat data ulasan...</div>}>
      <ReviewsClient initialReviews={reviews} />
    </Suspense>
  );
}
