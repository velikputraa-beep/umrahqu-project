import React from "react";
import PackagesClient from "./PackagesClient";
import { fetchTableData } from "@/lib/supabase/data";

export const metadata = {
  title: "Paket Umrah",
};

export default async function PackagesPage() {
  const packages = await fetchTableData("packages");
  return <PackagesClient initialPackages={packages} />;
}
