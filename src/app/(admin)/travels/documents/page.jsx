import React, { Suspense } from "react";
import { fetchTableData } from "@/lib/supabase/data";
import DocumentsClient from "./DocumentsClient";

export default async function DokumenKemitraanPage() {
  const documents = await fetchTableData("documents");

  return (
    <Suspense fallback={<div className="p-8 text-center text-zinc-500">Memuat data dokumen...</div>}>
      <DocumentsClient initialDocuments={documents} />
    </Suspense>
  );
}
