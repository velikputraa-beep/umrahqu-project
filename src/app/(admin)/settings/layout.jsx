"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  User,
  Building2,
  Sliders,
  ShieldCheck,
  Palette,
  Bell,
} from "lucide-react";

export default function PengaturanLayout({ children }) {
  const pathname = usePathname();

  const tabs = [
    {
      title: "Profil Saya",
      url: "/settings/profil",
      altUrl: "/pengaturan/profil",
      icon: User,
    },
    {
      title: "Profil Perusahaan",
      url: "/settings/perusahaan",
      altUrl: "/pengaturan/perusahaan",
      icon: Building2,
    },
    {
      title: "Konfigurasi Platform",
      url: "/settings/platform",
      altUrl: "/pengaturan/platform",
      icon: Sliders,
    },
    {
      title: "Akun Pengguna",
      url: "/settings/akun",
      altUrl: "/pengaturan/akun",
      icon: ShieldCheck,
    },
    {
      title: "Tampilan",
      url: "/settings/tampilan",
      altUrl: "/pengaturan/tampilan",
      icon: Palette,
    },
    {
      title: "Notifikasi",
      url: "/settings/notifikasi",
      altUrl: "/pengaturan/notifikasi",
      icon: Bell,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Pengaturan
      </h1>

      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Left: Sidebar Khusus Pengaturan */}
        <aside className="w-full md:w-60 shrink-0 bg-card border border-border rounded-xl p-2 space-y-1 shadow-xs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              pathname === tab.url ||
              pathname === tab.altUrl ||
              (tab.url === "/settings/profil" &&
                (pathname === "/settings"));

            return (
              <Link
                key={tab.title}
                href={tab.url}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "text-primary bg-primary/10 border border-primary/25 shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                />
                <span className="truncate">{tab.title}</span>
              </Link>
            );
          })}
        </aside>

        {/* Right: Tab Content */}
        <div className="flex-1 w-full min-w-0 max-w-3xl">{children}</div>
      </div>
    </div>
  );
}

