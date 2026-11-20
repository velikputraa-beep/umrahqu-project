"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminMenu } from "@/data/admin-menu";
import {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  Users,
  Database,
  Headphones,
  ShieldCheck,
  BarChart3,
  Settings,
  ChevronRight,
  ChevronDown,
  MoreVertical,
} from "lucide-react";

// Map string icon names to Lucide components
const iconMap = {
  LayoutDashboard,
  ShoppingBag,
  Wallet,
  Users,
  Database,
  Headphones,
  ShieldCheck,
  BarChart3,
  Settings,
};

function normalizePath(p) {
  if (!p) return "";
  const cleaned = p.replace(/\/+$/, "");
  return cleaned === "" ? "/" : cleaned;
}

const DASHBOARD_ROOTS = ["/", "/bookings", "/finance"];

function isItemActive(itemUrl, currentPath) {
  if (!itemUrl) return false;
  const normItem = normalizePath(itemUrl);
  const normCurrent = normalizePath(currentPath);

  if (normItem === normCurrent) return true;

  // Dashboard entries must match exactly, otherwise every nested route under
  // /bookings or /finance would light up several "Dashboard" items at once.
  if (DASHBOARD_ROOTS.includes(normItem)) return false;

  // Detail routes keep their list entry active: /bookings/MP-261113CUBY01 -> /bookings/list
  if (normItem === "/bookings/list" && /^\/bookings\/[^/]+$/.test(normCurrent)) return true;

  return normCurrent.startsWith(normItem + "/");
}

// Helper to check if any child (or nested child) route matches current pathname
function isRouteActive(item, pathname) {
  if (item.url && isItemActive(item.url, pathname)) {
    return true;
  }
  if (item.submenu && item.submenu.length > 0) {
    return item.submenu.some((sub) => isRouteActive(sub, pathname));
  }
  return false;
}

// Recursive Nav Item Component for handling menu, submenu, and sub-submenu
function NavItem({ item, pathname, depth = 0, collapsed = false, onExpand }) {
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const isChildActive = hasSubmenu && isRouteActive(item, pathname);
  const isDirectActive = item.url && isItemActive(item.url, pathname);

  // Track manual toggle; defaults to open if child route is active
  const [userToggled, setUserToggled] = useState(null);
  const isOpen = userToggled !== null ? userToggled : isChildActive;

  const toggleOpen = (e) => {
    if (hasSubmenu) {
      e.preventDefault();
      setUserToggled(!isOpen);
    }
  };

  const IconComponent = item.icon ? iconMap[item.icon] : null;

  const activeClass =
    isDirectActive || isChildActive
      ? "text-emerald-500 bg-emerald-500/10 font-medium"
      : "text-muted-foreground hover:text-foreground hover:bg-muted";

  if (collapsed) {
    const label = item.title;
    return hasSubmenu ? (
      <button
        type="button"
        onClick={onExpand}
        title={label}
        aria-label={label}
        className={`flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm transition-colors ${activeClass}`}
      >
        {IconComponent && <IconComponent className="size-4 shrink-0" />}
      </button>
    ) : (
      <Link
        href={item.url || "#"}
        title={label}
        aria-label={label}
        className={`flex w-full items-center justify-center rounded-lg px-3 py-2 text-sm transition-colors ${activeClass}`}
      >
        {IconComponent && <IconComponent className="size-4 shrink-0" />}
      </Link>
    );
  }

  return (
    <div className="w-full">
      {hasSubmenu ? (
        <button
          type="button"
          onClick={toggleOpen}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left group cursor-pointer ${activeClass}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {IconComponent && (
              <IconComponent
                className={`w-4 h-4 shrink-0 ${
                  isDirectActive || isChildActive
                    ? "text-emerald-500"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              />
            )}
            <span className="truncate">{item.title}</span>
          </div>
          <span className="shrink-0 text-muted-foreground group-hover:text-foreground">
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </span>
        </button>
      ) : (
        <Link
          href={item.url || "#"}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
            isDirectActive
              ? "text-emerald-500 bg-emerald-500/10 font-medium"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {IconComponent && (
              <IconComponent
                className={`w-4 h-4 shrink-0 ${
                  isDirectActive
                    ? "text-emerald-500"
                    : "text-muted-foreground"
                }`}
              />
            )}
            <span className="truncate">{item.title}</span>
          </div>
        </Link>
      )}

      {/* Accordion content with vertical hierarchy guide line */}
      {hasSubmenu && isOpen && (
        <div
          className={`mt-1 ml-4 pl-3 border-l border-border flex flex-col space-y-1 ${
            depth > 0 ? "ml-3 pl-2" : ""
          }`}
        >
          {item.submenu.map((subItem, index) => (
            <NavItem
              key={subItem.title + index}
              item={subItem}
              pathname={pathname}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SidebarAdmin({ collapsed = false, onExpand, account }) {
  const pathname = usePathname();

  return (
    <aside
      className={`${
        collapsed ? "w-16" : "w-64"
      } fixed left-0 top-0 bottom-0 z-40 bg-background border-r border-border flex flex-col justify-between select-none transition-[width] duration-200`}
    >
      {/* Top Section: Logo */}
      <div className="p-5 border-b border-border/60">
        <Link href="/" className="flex items-center gap-1 group justify-center">
          {collapsed ? (
            <span className="text-lg font-bold tracking-wider text-emerald-500">U</span>
          ) : (
            <>
              <span className="text-xl font-bold tracking-wider text-white">UMRAH</span>
              <span className="text-xl font-bold tracking-wider text-emerald-500 relative">
                Q
                {/* Islamic dome / crescent accent on Q */}
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-1 bg-emerald-400 rounded-t-full opacity-80" />
                U
              </span>
            </>
          )}
        </Link>
      </div>

      {/* Navigation Menu (Scrollable) */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
        {adminMenu.map((item, index) => (
          <NavItem
            key={item.title + index}
            item={item}
            pathname={pathname}
            depth={0}
            collapsed={collapsed}
            onExpand={onExpand}
          />
        ))}
      </nav>

      {/* Bottom Section: User Profile Card */}
      <div className="p-3 border-t border-border/60 bg-background">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-muted transition-colors cursor-pointer group">
          <div className="flex items-center gap-3 min-w-0">
            {/* Round yellow egg/smiley avatar */}
            <div className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
              <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center relative shadow-inner">
                {/* Cute yolk face detail */}
                <div className="w-1 h-1 bg-amber-800 rounded-full absolute left-1.5 top-2" />
                <div className="w-1 h-1 bg-amber-800 rounded-full absolute right-1.5 top-2" />
                <div className="w-2.5 h-1 border-b-2 border-amber-800 rounded-full absolute bottom-1.5" />
              </div>
            </div>

            {/* User Info */}
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate max-w-[125px]">
                  {account?.nama}
                </span>
                <span className="text-[11px] text-muted-foreground truncate max-w-[125px]">
                  {account?.email}
                </span>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
              title="Menu Akun"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
