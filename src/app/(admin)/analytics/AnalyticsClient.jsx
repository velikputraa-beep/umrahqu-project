"use client";

import React, { useState } from "react";
import {
  Banknote,
  Percent,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "cn";
import DateRangeButton from "@/components/admin/DateRangeButton";

const METRICS = {
  pesanan: {
    label: "Pesanan",
    color: "#10b981",
    format: (value) => `${value} pesanan`,
    short: (value) => String(value),
  },
  pendapatan: {
    label: "Pendapatan",
    color: "#8b5cf6",
    format: (value) => `Rp ${value.toLocaleString("id-ID")}`,
    short: (value) => `${Math.round(value / 1_000_000)} Jt`,
  },
};

const STAT_ICONS = {
  pendapatan: Banknote,
  pesanan: ShoppingBag,
  jamaah: Users,
  konversi: Percent,
};

const rupiahJuta = (value) => `Rp ${Math.round(value / 1_000_000)} Jt`;

export default function AnalyticsClient({
  initialStats,
  initialTrend,
  initialSources,
  initialTop,
}) {
  const [metric, setMetric] = useState("pesanan");
  const [range, setRange] = useState({
    from: new Date(2026, 3, 1),
    to: new Date(2026, 10, 12),
  });

  const activeMetric = METRICS[metric];
  const maxTrend = Math.max(...initialTrend.map((item) => item[metric]));
  const totalPesanan = initialTrend.reduce((sum, item) => sum + item.pesanan, 0);
  const totalPendapatan = initialTrend.reduce((sum, item) => sum + item.pendapatan, 0);
  const maxPaket = Math.max(1, ...initialTop.map((item) => item.pesanan));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Analitik</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan performa penjualan paket umrah lintas mitra travel.
          </p>
        </div>
        <DateRangeButton
          from={range.from}
          to={range.to}
          onChange={(from, to) => setRange({ from, to })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {initialStats.map((stat, index) => {
          const Icon = STAT_ICONS[stat.icon] || Banknote;
          const rising = stat.trend === "up";
          return (
            <div
              key={stat.title}
              className="animate-fade-up rounded-xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-muted-foreground/40"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <div className="mt-3 text-2xl font-bold tracking-tight text-foreground">
                {stat.value}
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[11px]">
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full border px-1.5 py-0.5 font-semibold",
                    rising
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      : "border-destructive/20 bg-destructive/10 text-destructive"
                  )}
                >
                  {rising ? (
                    <TrendingUp className="size-3" />
                  ) : (
                    <TrendingDown className="size-3" />
                  )}
                  {stat.delta}
                </span>
                <span className="text-muted-foreground">{stat.note}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-card p-5 shadow-xs lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Tren Penjualan</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Total {totalPesanan} pesanan · {rupiahJuta(totalPendapatan)}
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-input/30 p-0.5">
              {Object.entries(METRICS).map(([key, value]) => (
                <Button
                  key={key}
                  type="button"
                  size="xs"
                  variant={metric === key ? "secondary" : "ghost"}
                  onClick={() => setMetric(key)}
                >
                  {value.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="relative mt-8 h-52">
            {[0, 25, 50, 75].map((line) => (
              <div
                key={line}
                className="absolute inset-x-0 border-t border-dashed border-border"
                style={{ top: `${line}%` }}
              />
            ))}

            <div className="absolute inset-0 flex items-end gap-2 sm:gap-3">
              {initialTrend.map((item, index) => {
                const height = (item[metric] / maxTrend) * 100;
                return (
                  <div key={item.bulan} className="group relative flex h-full flex-1 flex-col justify-end">
                    <div className="pointer-events-none absolute inset-x-0 bottom-full mb-1 hidden justify-center group-hover:flex">
                      <span className="whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-[10px] font-medium text-popover-foreground shadow-lg">
                        {activeMetric.format(item[metric])}
                      </span>
                    </div>
                    <div
                      className="animate-grow-y rounded-t-md opacity-85 transition-[height,opacity] duration-500 group-hover:opacity-100"
                      style={{
                        height: `${Math.max(height, 3)}%`,
                        backgroundColor: activeMetric.color,
                        animationDelay: `${index * 45}ms`,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 flex gap-2 sm:gap-3">
            {initialTrend.map((item) => (
              <div key={item.bulan} className="flex-1 text-center">
                <div className="text-[10px] font-medium text-muted-foreground">{item.bulan}</div>
                <div className="text-[10px] text-muted-foreground/60">
                  {activeMetric.short(item[metric])}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <h2 className="text-sm font-semibold text-foreground">Sumber Pesanan</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {totalPesanan} pesanan per kanal penjualan
          </p>

          <div className="relative mx-auto mt-6 w-fit">
            <DonutChart slices={initialSources} />
            <div
              className="animate-fade-up absolute inset-0 flex flex-col items-center justify-center"
              style={{ animationDelay: "560ms" }}
            >
              <span className="text-xl font-bold text-foreground">{totalPesanan}</span>
              <span className="text-[10px] text-muted-foreground">Pesanan</span>
            </div>
          </div>

          <ul className="mt-6 space-y-2 border-t border-border pt-4">
            {initialSources.map((slice, index) => {
              const share = Math.round((slice.value / totalPesanan) * 100);
              return (
                <li
                  key={slice.label}
                  className="animate-fade-up flex items-center gap-2 text-xs"
                  style={{ animationDelay: `${300 + index * 70}ms` }}
                >
                  <span
                    className="size-2.5 shrink-0 rounded-xs"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-foreground">{slice.label}</span>
                  <span className="ml-auto font-medium text-muted-foreground">
                    {slice.value} · {share}%
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">Paket Terlaris</h2>
          <span className="text-xs text-muted-foreground">Berdasarkan jumlah pesanan</span>
        </div>

        <ul className="mt-4 space-y-4">
          {initialTop.map((paket, index) => (
            <li key={paket.nama} className="flex items-center gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-[11px] font-semibold text-muted-foreground">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-medium text-foreground">{paket.nama}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {paket.pesanan} pesanan · {rupiahJuta(paket.pendapatan)}
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="animate-grow-x h-full rounded-full bg-primary"
                      style={{
                        width: `${(paket.pesanan / maxPaket) * 100}%`,
                        animationDelay: `${index * 70}ms`,
                      }}
                    />
                  </div>
                  <span className="w-32 shrink-0 truncate text-[11px] text-muted-foreground">
                    {paket.travel}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function DonutChart({ slices }) {
  const radius = 62;
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  if (!slices.length || total === 0) return null;
  const stroke = 22;
  const circumference = 2 * Math.PI * radius;

  const segments = slices.map((slice, index) => {
    const before = slices.slice(0, index).reduce((sum, item) => sum + item.value, 0);
    return {
      ...slice,
      length: (slice.value / total) * circumference,
      offset: (before / total) * circumference,
    };
  });

  return (
    <svg viewBox="0 0 160 160" className="size-40 -rotate-90">
      <circle
        cx="80"
        cy="80"
        r={radius}
        fill="none"
        stroke="var(--color-muted)"
        strokeWidth={stroke}
      />
      {segments.map((segment, index) => (
        <circle
          key={segment.label}
          className="animate-draw"
          style={{ animationDelay: `${180 + index * 110}ms` }}
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke={segment.color}
          strokeWidth={stroke}
          strokeDasharray={`${segment.length} ${circumference - segment.length}`}
          strokeDashoffset={-segment.offset}
        />
      ))}
    </svg>
  );
}
