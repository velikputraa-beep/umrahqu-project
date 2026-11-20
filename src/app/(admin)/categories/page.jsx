import React, { Suspense } from "react";
import { fetchTableData } from "@/lib/supabase/data";
import CategoriesClient from "./CategoriesClient";

export default async function KategoriMasterDataPage() {
  const categories = await fetchTableData("categories");

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Memuat data kategori...</div>}>
      <CategoriesClient initialCategories={categories} />
    </Suspense>
  );
}
