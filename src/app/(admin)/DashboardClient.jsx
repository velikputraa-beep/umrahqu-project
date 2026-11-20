"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Package,
  ShoppingBag,
  Users,
  Calendar,
  Download,
  ArrowUpRight,
  Eye,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

export default function DashboardClient({ initialOrders }) {
  const [selectedRange] = useState("Oct 14, 2026 - Nov 12, 2026");

  // Statistics Cards
  const stats = [
    {
      title: "Pendapatan",
      value: "Rp 255.7 Jt",
      badge: "+100.0%",
      badgeIcon: TrendingUp,
      badgeColor: "text-primary bg-primary/10 border-primary/20",
    },
    {
      title: "Paket",
      value: "72",
      badge: "+4",
      badgeIcon: Package,
      badgeColor: "text-primary bg-primary/10 border-primary/20",
    },
    {
      title: "Pesanan",
      value: "17",
      badge: "+17",
      badgeIcon: ShoppingBag,
      badgeColor: "text-primary bg-primary/10 border-primary/20",
    },
    {
      title: "Travel",
      value: "21",
      badge: "+10",
      badgeIcon: Users,
      badgeColor: "text-primary bg-primary/10 border-primary/20",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>

        {/* Date Filter */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-muted-foreground hover:border-muted-foreground/40 transition-colors cursor-pointer w-fit shadow-xs">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{selectedRange}</span>
        </div>
      </div>

      {/* Grid Statistik (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const BadgeIcon = stat.badgeIcon;
          return (
            <div
              key={stat.title + i}
              className="animate-fade-up bg-card border border-border rounded-xl p-5 hover:border-muted-foreground/40 transition-all shadow-xs"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${stat.badgeColor}`}
                >
                  <BadgeIcon className="w-3 h-3" />
                  {stat.badge}
                </span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Grafik (2 Kolom) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Kanal Penjualan Bar Chart */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Kanal Penjualan
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  14 Okt 2026 - 12 Nov 2026
                </p>
              </div>
              <span className="text-xs text-muted-foreground bg-muted border border-border rounded-full px-2.5 py-0.5">
                17 Pesanan
              </span>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="w-full h-56 mt-6 flex flex-col justify-end">
              <svg className="w-full h-44" viewBox="0 0 450 160">
                {/* Horizontal grid lines */}
                <line
                  x1="20"
                  y1="140"
                  x2="430"
                  y2="140"
                  stroke="#27272a"
                  strokeWidth="1"
                />
                <line
                  x1="20"
                  y1="90"
                  x2="430"
                  y2="90"
                  stroke="#27272a"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <line
                  x1="20"
                  y1="40"
                  x2="430"
                  y2="40"
                  stroke="#27272a"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />

                {/* Group 1: 14-20 Okt */}
                <g className="animate-grow-y-svg" style={{ animationDelay: "120ms" }}>
                  <rect x="42" y="138" width="16" height="2" fill="#10b981" rx="2" />
                  <rect x="62" y="138" width="16" height="2" fill="#8b5cf6" rx="2" />
                  <rect x="82" y="138" width="16" height="2" fill="#eab308" rx="2" />
                </g>

                {/* Group 2: 21-27 Okt */}
                <g className="animate-grow-y-svg" style={{ animationDelay: "200ms" }}>
                  <rect x="115" y="70" width="16" height="70" fill="#10b981" rx="2" />
                  <rect x="135" y="138" width="16" height="2" fill="#8b5cf6" rx="2" />
                  <rect x="155" y="138" width="16" height="2" fill="#eab308" rx="2" />
                </g>

                {/* Group 3: 28 Okt-3 Nov */}
                <g className="animate-grow-y-svg" style={{ animationDelay: "280ms" }}>
                  <rect x="190" y="138" width="16" height="2" fill="#10b981" rx="2" />
                  <rect x="210" y="138" width="16" height="2" fill="#8b5cf6" rx="2" />
                  <rect x="230" y="138" width="16" height="2" fill="#eab308" rx="2" />
                </g>

                {/* Group 4: 4-10 Nov */}
                <g className="animate-grow-y-svg" style={{ animationDelay: "360ms" }}>
                  <rect x="265" y="25" width="16" height="115" fill="#10b981" rx="2" />
                  <rect x="285" y="110" width="16" height="30" fill="#8b5cf6" rx="2" />
                  <rect x="305" y="138" width="16" height="2" fill="#eab308" rx="2" />
                </g>

                {/* Group 5: 11-12 Nov */}
                <g className="animate-grow-y-svg" style={{ animationDelay: "440ms" }}>
                  <rect x="345" y="85" width="16" height="55" fill="#10b981" rx="2" />
                  <rect x="365" y="138" width="16" height="2" fill="#8b5cf6" rx="2" />
                  <rect x="385" y="138" width="16" height="2" fill="#eab308" rx="2" />
                </g>
              </svg>

              {/* X-axis labels */}
              <div className="flex justify-between px-6 text-[10px] text-muted-foreground font-medium">
                <span>14-20 Okt</span>
                <span>21-27 Okt</span>
                <span>28 Okt-3 Nov</span>
                <span>4-10 Nov</span>
                <span>11-12 Nov</span>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981]" />
              <span>Marketplace</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#8b5cf6]" />
              <span>Langsung</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#eab308]" />
              <span>Website Travel</span>
            </div>
          </div>
        </div>

        {/* Tren Pendapatan Smooth Area Chart */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Tren Pendapatan
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  Rp 255.741.667
                </p>
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1 bg-muted/80 hover:bg-muted border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Ekspor</span>
              </button>
            </div>

            {/* Custom SVG Smooth Curved Area Chart */}
            <div className="w-full h-56 mt-6 flex flex-col justify-end">
              <svg className="w-full h-44" viewBox="0 0 450 160">
                <defs>
                  {/* Subtle Emerald Gradient under the curve */}
                  <linearGradient
                    id="emeraldGrad"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal grid lines */}
                <line
                  x1="20"
                  y1="140"
                  x2="430"
                  y2="140"
                  stroke="#27272a"
                  strokeWidth="1"
                />
                <line
                  x1="20"
                  y1="90"
                  x2="430"
                  y2="90"
                  stroke="#27272a"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
                <line
                  x1="20"
                  y1="40"
                  x2="430"
                  y2="40"
                  stroke="#27272a"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />

                {/* Area under curve */}
                <path
                  className="animate-fade-in"
                  style={{ animationDelay: "620ms" }}
                  d="M 20 140 L 20 135 C 70 120, 110 30, 150 30 C 190 30, 220 120, 260 120 C 300 120, 330 65, 370 65 C 400 65, 410 70, 430 70 L 430 140 Z"
                  fill="url(#emeraldGrad)"
                />

                {/* Curved line */}
                <path
                  className="animate-draw-line"
                  pathLength="1"
                  strokeDasharray="1"
                  d="M 20 135 C 70 120, 110 30, 150 30 C 190 30, 220 120, 260 120 C 300 120, 330 65, 370 65 C 400 65, 410 70, 430 70"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2.5"
                />

                {/* Data points */}
                <circle className="animate-fade-in" style={{ animationDelay: "420ms" }} cx="20" cy="135" r="4" fill="#a7f3d0" stroke="#10b981" strokeWidth="2" />
                <circle className="animate-fade-in" style={{ animationDelay: "520ms" }} cx="150" cy="30" r="4" fill="#a7f3d0" stroke="#10b981" strokeWidth="2" />
                <circle className="animate-fade-in" style={{ animationDelay: "620ms" }} cx="260" cy="120" r="4" fill="#a7f3d0" stroke="#10b981" strokeWidth="2" />
                <circle className="animate-fade-in" style={{ animationDelay: "720ms" }} cx="370" cy="65" r="4" fill="#a7f3d0" stroke="#10b981" strokeWidth="2" />
                <circle className="animate-fade-in" style={{ animationDelay: "820ms" }} cx="430" cy="70" r="4" fill="#a7f3d0" stroke="#10b981" strokeWidth="2" />
              </svg>

              {/* X-axis labels */}
              <div className="flex justify-between px-4 text-[10px] text-muted-foreground font-medium">
                <span>14-20 Okt</span>
                <span>21-27 Okt</span>
                <span>28 Okt-3 Nov</span>
                <span>4-10 Nov</span>
                <span>11-12 Nov</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-border mt-4 text-xs text-muted-foreground text-center">
            Pembaruan otomatis setiap 5 menit
          </div>
        </div>
      </div>

      {/* Tabel Pesanan Terbaru */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 flex items-center justify-between border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Pesanan Terbaru</h3>
          <Link
            href="/bookings/list"
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Selengkapnya</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background/70 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="py-3 px-4">ID Pesanan</th>
                <th className="py-3 px-4">Paket & Travel</th>
                <th className="py-3 px-4">Biaya & Sisa</th>
                <th className="py-3 px-4">Pembayaran</th>
                <th className="py-3 px-4">Status Pesanan</th>
                <th className="py-3 px-4">Sumber</th>
                <th className="py-3 px-4">Tgl. Pesan</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-foreground">
              {initialOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="py-3 px-4 font-mono font-medium text-muted-foreground">
                    {order.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-foreground">{order.paket}</div>
                    <div className="text-[11px] text-muted-foreground">{order.travel}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-foreground">{order.biaya}</div>
                    {order.sisa && (
                      <div className="text-[11px] text-destructive">{order.sisa}</div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge value={order.pembayaran} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge value={order.status} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge value={order.sumber} tone="neutral" />
                  </td>
                  <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                    {order.tgl}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      href={`/bookings/${order.id}`}
                      className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors inline-flex items-center justify-center"
                      title="Lihat Detail"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
