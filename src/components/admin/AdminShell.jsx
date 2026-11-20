"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  LogOut,
  Moon,
  PanelLeft,
  Search,
  Settings,
  UserRound,
} from "lucide-react";
import { cn } from "cn";
import { createClient } from "@/lib/supabase/client";
import { fetchNotifications } from "@/lib/supabase/notifications";
import SidebarAdmin from "@/components/admin/SidebarAdmin";
import CommandPalette from "@/components/admin/CommandPalette";
import { Toaster } from "@/components/ui/toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function waktuRelatif(iso) {
  if (!iso) return "";
  const detik = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (detik < 60) return "Baru saja";
  const menit = Math.floor(detik / 60);
  if (menit < 60) return `${menit} menit lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  const hari = Math.floor(jam / 24);
  return hari === 1 ? "Kemarin" : `${hari} hari lalu`;
}

export default function AdminShell({
  children,
  account,
  initialNotifications = [],
  initialUnread = 0,
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [collapsed, setCollapsed] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const userId = account?.id ?? null;

  const loadNotifications = useCallback(async () => {
    const { items, unread, error } = await fetchNotifications(supabase, userId);
    if (error) {
      console.error(error);
      return;
    }
    setNotifications(items);
    setUnreadCount(unread);
  }, [supabase, userId]);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("admin-notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => loadNotifications()
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [supabase, userId, loadNotifications]);

  const markAllRead = async () => {
    if (!userId || unreadCount === 0) return;
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    if (error) {
      console.error(error);
      return;
    }
    setNotifications((prev) => prev.map((item) => ({ ...item, is_read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <SidebarAdmin
        collapsed={collapsed}
        onExpand={() => setCollapsed(false)}
        account={account}
      />

      <div
        className={cn(
          "flex min-h-screen flex-col bg-background transition-[margin] duration-200",
          collapsed ? "ml-16" : "ml-64"
        )}
      >
        <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-md">
          <div className="flex w-full max-w-md items-center gap-2">
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              aria-label="Toggle Sidebar"
              aria-expanded={!collapsed}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <PanelLeft className="size-4" />
            </button>

            <button
              type="button"
              onClick={() => setPaletteOpen(true)}
              aria-label="Cari..."
              className="relative flex h-8 w-72 items-center gap-2 rounded-lg border border-input bg-input/30 px-2.5 text-sm text-muted-foreground transition-colors hover:border-border hover:bg-muted/50"
            >
              <Search className="size-4 shrink-0" />
              <span className="truncate">Cari...</span>
              <kbd className="ml-auto shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                Ctrl + k
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu onOpenChange={(open) => open && markAllRead()}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Notifikasi"
                  className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Bell className="size-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                  <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                    Belum ada notifikasi.
                  </p>
                ) : (
                  notifications.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      className="flex-col items-start gap-0.5 py-2"
                    >
                      <span className="flex items-center gap-1.5 text-xs leading-snug text-foreground">
                        {!item.is_read && (
                          <span className="size-1.5 shrink-0 rounded-full bg-destructive" />
                        )}
                        {item.title}
                      </span>
                      <span className="text-[11px] leading-snug text-muted-foreground">
                        {item.message}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {waktuRelatif(item.created_at)}
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push("/logs")}>
                  Lihat semua aktivitas
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              type="button"
              aria-label="Mode Gelap Aktif"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Moon className="size-5" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Menu Akun"
                  className="size-8 shrink-0 overflow-hidden rounded-full border border-border bg-white"
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{account?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push("/settings/profil")}>
                  <UserRound />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push("/settings/platform")}>
                  <Settings />
                  Pengaturan
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onSelect={logout}>
                  <LogOut />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <Toaster />
    </div>
  );
}
