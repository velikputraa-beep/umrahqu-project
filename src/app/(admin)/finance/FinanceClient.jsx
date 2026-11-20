"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  TrendingUp,
  Plus,
} from "lucide-react";

export default function FinanceClient({ initialStats }) {
  const [selectedRange] = useState("Oct 14, 2026 - Nov 12, 2026");

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Overview Keuangan
        </h1>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-xs text-foreground/90 shadow-xs cursor-pointer hover:border-border transition-colors w-fit">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span>{selectedRange}</span>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {initialStats.map((s, i) => (
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

      {/* Row 1: Pendapatan Platform (Bar Chart) & Payment Gateway (Donut) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: Pendapatan Platform */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-white">Pendapatan Platform</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Komisi: Rp 39.800.000 · Bersih: Rp 13.650.000
            </p>

            <div className="w-full h-56 mt-6 flex flex-col justify-end">
              <svg className="w-full h-44" viewBox="0 0 450 160">
                <line x1="20" y1="140" x2="430" y2="140" stroke="#27272a" strokeWidth="1" />
                <line x1="20" y1="90" x2="430" y2="90" stroke="#27272a" strokeDasharray="3 3" strokeWidth="1" />
                <line x1="20" y1="40" x2="430" y2="40" stroke="#27272a" strokeDasharray="3 3" strokeWidth="1" />

                {/* 14-20 Okt */}
                <rect x="65" y="138" width="16" height="2" fill="#10b981" rx="2" />
                <rect x="85" y="138" width="16" height="2" fill="#0284c7" rx="2" />

                {/* 21-27 Okt */}
                <rect x="135" y="45" width="18" height="95" fill="#10b981" rx="2" />
                <rect x="157" y="90" width="18" height="50" fill="#0284c7" rx="2" />

                {/* 28 Okt-3 Nov */}
                <rect x="215" y="65" width="18" height="75" fill="#10b981" rx="2" />
                <rect x="237" y="105" width="18" height="35" fill="#0284c7" rx="2" />

                {/* 4-10 Nov */}
                <rect x="295" y="70" width="18" height="70" fill="#10b981" rx="2" />
                <rect x="317" y="108" width="18" height="32" fill="#0284c7" rx="2" />

                {/* 11-12 Nov */}
                <rect x="370" y="80" width="18" height="60" fill="#10b981" rx="2" />
                <rect x="392" y="118" width="18" height="22" fill="#0284c7" rx="2" />
              </svg>

              <div className="flex justify-between px-6 text-[10px] text-muted-foreground font-medium">
                <span>14-20 Okt</span>
                <span>21-27 Okt</span>
                <span>28 Okt-3 Nov</span>
                <span>4-10 Nov</span>
                <span>11-12 Nov</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-border/60 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#10b981]" />
              <span>Pendapatan Kotor (Komisi)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#0284c7]" />
              <span>Pendapatan Bersih</span>
            </div>
          </div>
        </div>

        {/* Donut Chart: Payment Gateway */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-white">Payment Gateway</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Total: Rp 255.741.667 (16 transaksi)
            </p>

            <div className="flex justify-center items-center my-6">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="34"
                    fill="transparent"
                    stroke="#f87171"
                    strokeWidth="16"
                    strokeDasharray="90 213"
                    strokeDashoffset="0"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="34"
                    fill="transparent"
                    stroke="#94a3b8"
                    strokeWidth="16"
                    strokeDasharray="100 213"
                    strokeDashoffset="-90"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="34"
                    fill="transparent"
                    stroke="#38bdf8"
                    strokeWidth="16"
                    strokeDasharray="15 213"
                    strokeDashoffset="-190"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="34"
                    fill="transparent"
                    stroke="#fb923c"
                    strokeWidth="16"
                    strokeDasharray="8 213"
                    strokeDashoffset="-205"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-3 border-t border-border/60 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#f87171]" />
              <span>Transfer Manual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#94a3b8]" />
              <span>bank_transfer</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]" />
              <span>cash</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#fb923c]" />
              <span>manual</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Volume Pembayaran (Area Chart) & Bankku (Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blue Curved Line: Volume Pembayaran */}
        <div className="bg-card border border-border rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-semibold text-white">Volume Pembayaran</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              14 Okt - 12 Nov 2026 · Total: Rp 255.741.667
            </p>

            <div className="w-full h-56 mt-6 flex flex-col justify-end">
              <svg className="w-full h-44" viewBox="0 0 450 160">
                <line x1="20" y1="140" x2="430" y2="140" stroke="#27272a" strokeWidth="1" />

                <path
                  d="M 25 135 C 70 90, 100 35, 140 35 C 190 35, 220 120, 260 120 C 300 120, 330 70, 370 70 C 400 70, 420 75, 435 75"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2.5"
                />

                <circle cx="25" cy="135" r="3.5" fill="#38bdf8" />
                <circle cx="140" cy="35" r="3.5" fill="#38bdf8" />
                <circle cx="260" cy="120" r="3.5" fill="#38bdf8" />
                <circle cx="370" cy="70" r="3.5" fill="#38bdf8" />
                <circle cx="435" cy="75" r="3.5" fill="#38bdf8" />
              </svg>

              <div className="flex justify-between px-4 text-[10px] text-muted-foreground font-medium">
                <span>14-20 Okt</span>
                <span>21-27 Okt</span>
                <span>28 Okt-3 Nov</span>
                <span>4-10 Nov</span>
                <span>11-12 Nov</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bankku: Cards */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Bankku</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Rekening Platform</p>
            </div>
            <Link
              href="/banks?openAdd=true"
              className="flex items-center gap-1 px-3 py-1.5 bg-transparent hover:bg-muted/80 border border-border/80 rounded-lg text-xs text-foreground/90 hover:text-white transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            {/* Dark Navy Card */}
            <Link
              href="/banks"
              className="h-40 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-zinc-900 border border-zinc-700/50 p-5 flex flex-col justify-between shadow-lg relative overflow-hidden hover:border-zinc-500 transition-all cursor-pointer block group"
            >
              <div className="flex justify-end">
                <span className="font-mono text-xs text-muted-foreground font-bold group-hover:text-foreground">
                  947
                </span>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-semibold mb-1">
                  947
                </div>
                <div className="font-mono text-sm tracking-wider text-foreground font-semibold">
                  1982 *** *** 2181
                </div>
              </div>
            </Link>

            {/* Bright Blue Card */}
            <Link
              href="/banks"
              className="h-40 rounded-2xl bg-gradient-to-br from-sky-600 via-blue-700 to-blue-900 border border-sky-500/40 p-5 flex flex-col justify-between shadow-lg text-white hover:border-sky-300 transition-all cursor-pointer block group"
            >
              <div className="flex justify-end">
                <span className="font-bold text-xs">BRI</span>
              </div>
              <div>
                <div className="text-[10px] text-sky-200 font-semibold mb-1">
                  BRI
                </div>
                <div className="font-mono text-sm tracking-wider text-white font-semibold">
                  3753 *** *** 0011
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
