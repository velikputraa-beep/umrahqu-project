import React, { Suspense } from "react";
import { fetchTableData } from "@/lib/supabase/data";
import AnalyticsClient from "./AnalyticsClient";

export const metadata = {
  title: "Analitik",
};

export default async function AnalitikPage() {
  const [stats, trend, sources, top] = await Promise.all([
    fetchTableData("analytics_stats"),
    fetchTableData("analytics_trend"),
    fetchTableData("analytics_sources"),
    fetchTableData("analytics_top"),
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Memuat data analitik...</div>}>
      <AnalyticsClient
        initialStats={stats}
        initialTrend={trend}
        initialSources={sources}
        initialTop={top}
      />
    </Suspense>
  );
}
