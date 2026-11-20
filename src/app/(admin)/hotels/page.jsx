import React from "react";
import HotelsClient from "./HotelsClient";
import { fetchTableData } from "@/lib/supabase/data";

export const metadata = {
  title: "Hotel",
};

export default async function HotelsPage() {
  const hotels = await fetchTableData("hotels");
  return <HotelsClient initialHotels={hotels} />;
}
