"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, TrendingUp, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toast";

export const DEFAULT_STATS = [
  { title: "Pesanan", value: "17", badge: "+100.0%" },
  { title: "Masa Pembayaran", value: "10", badge: "+100.0%" },
  { title: "Lunas", value: "3", badge: "+100.0%" },
  { title: "Dibatalkan", value: "4", badge: "+100.0%" },
];

export default function BookingsDashboardClient({ initialStats = DEFAULT_STATS }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [stats] = useState(initialStats);
  const [selectedRange] = useState("Oct 14, 2026 - Nov 12, 2026");

  // Supabase Realtime Subscription for Bookings
  useEffect(() => {
    const channel = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          router.refresh();
          toast.info("Statistik pesanan diperbarui (Realtime)");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [router, supabase]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Dashboard Pesanan
        </h1>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-foreground/90 shadow-xs cursor-pointer hover:border-border transition-colors w-fit">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{selectedRange}</span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={s.title + i}
            className="bg-card border border-border rounded-xl p-5 hover:border-border transition-all shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">{s.title}</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                <TrendingUp className="w-3 h-3" />
                {s.badge}
              </span>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-white">
                {s.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Tren Pesanan (Left) and Right Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Tren Pesanan Area Chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Tren Pesanan</h3>
                <p className="text-xs text-muted-foreground mt-0.5">14 Okt - 12 Nov 2026</p>
              </div>
              <span className="text-xs text-muted-foreground bg-muted border border-border rounded-full px-2.5 py-0.5">
                17 Pesanan
              </span>
            </div>

            {/* Custom SVG Line/Area Chart */}
            <div className="w-full h-80 mt-6 flex flex-col justify-end">
              <svg className="w-full h-64" viewBox="0 0 550 200">
                <defs>
                  <linearGradient id="pesananGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Dotted Grid Lines */}
                <line x1="20" y1="180" x2="530" y2="180" stroke="#27272a" strokeWidth="1" />
                <line x1="20" y1="120" x2="530" y2="120" stroke="#27272a" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="20" y1="60" x2="530" y2="60" stroke="#27272a" strokeDasharray="3 3" strokeWidth="1" />

                {/* Area Gradient */}
                <path
                  d="M 30 180 L 30 170 C 80 140, 120 105, 170 105 C 220 105, 250 170, 290 170 C 330 170, 370 40, 410 40 C 450 40, 480 120, 520 125 L 520 180 Z"
                  fill="url(#pesananGrad)"
                />

                {/* Curve Line */}
                <path
                  d="M 30 170 C 80 140, 120 105, 170 105 C 220 105, 250 170, 290 170 C 330 170, 370 40, 410 40 C 450 40, 480 120, 520 125"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />

                {/* Glowing Nodes */}
                <circle cx="30" cy="170" r="4.5" fill="#a7f3d0" stroke="#10b981" strokeWidth="2" />
                <circle cx="170" cy="105" r="4.5" fill="#a7f3d0" stroke="#10b981" strokeWidth="2" />
                <circle cx="290" cy="170" r="4.5" fill="#a7f3d0" stroke="#10b981" strokeWidth="2" />
                <circle cx="410" cy="40" r="4.5" fill="#a7f3d0" stroke="#10b981" strokeWidth="2" />
                <circle cx="520" cy="125" r="4.5" fill="#a7f3d0" stroke="#10b981" strokeWidth="2" />
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between px-4 text-[11px] text-muted-foreground font-medium">
                <span>14-20 Okt</span>
                <span>21-27 Okt</span>
                <span>28 Okt-3 Nov</span>
                <span>4-10 Nov</span>
                <span>11-12 Nov</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Distribusi Status & Top 5 Travel */}
        <div className="space-y-6">
          {/* Distribusi Status Pesanan (Donut Chart) */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-white">Distribusi Status Pesanan</h3>
            <p className="text-xs text-muted-foreground mt-0.5">14 Okt - 12 Nov 2026</p>

            <div className="flex justify-center items-center my-6">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="transparent"
                    stroke="#3b82f6"
                    strokeWidth="15"
                    strokeDasharray="133 226"
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="transparent"
                    stroke="#ef4444"
                    strokeWidth="15"
                    strokeDasharray="54 226"
                    strokeDashoffset="-133"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="36"
                    fill="transparent"
                    stroke="#f59e0b"
                    strokeWidth="15"
                    strokeDasharray="39 226"
                    strokeDashoffset="-187"
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-18 h-18 bg-background rounded-full flex items-center justify-center shadow-inner">
                    <span className="text-xs font-semibold text-foreground/90">17 Order</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border/60">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Dibatalkan (24%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Dikonfirmasi (59%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Menunggu (18%)</span>
              </div>
            </div>
          </div>

          {/* Top 5 Travel Card */}
          <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Top 5 Travel</h3>
                <p className="text-xs text-muted-foreground mt-0.5">14 Okt - 12 Nov 2026</p>
              </div>
              <Link
                href="/travels"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-white transition-colors"
              >
                <span>Semua Travel</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4 mt-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">1</span>
                  <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center font-bold text-xs text-amber-500">
                    AN
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">An-Nahl</div>
                    <div className="text-[11px] text-muted-foreground">Rp 438.000.000</div>
                  </div>
                </div>
                <span className="text-xs bg-muted text-foreground/90 border border-border px-2 py-0.5 rounded-full font-medium">
                  13 pesanan
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground">2</span>
                  <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-800/60 flex items-center justify-center font-bold text-xs text-red-400">
                    PI
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-foreground">Persada Indonesia</div>
                    <div className="text-[11px] text-muted-foreground">Rp 158.000.000</div>
                  </div>
                </div>
                <span className="text-xs bg-muted text-foreground/90 border border-border px-2 py-0.5 rounded-full font-medium">
                  4 pesanan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
