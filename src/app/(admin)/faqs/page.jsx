import React, { Suspense } from "react";
import { fetchTableData } from "@/lib/supabase/data";
import FaqsClient from "./FaqsClient";

export default async function FAQPage() {
  const faqs = await fetchTableData("faqs");

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Memuat data FAQ...</div>}>
      <FaqsClient initialFaqs={faqs} />
    </Suspense>
  );
}
