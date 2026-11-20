import React from "react";
import AdminShell from "@/components/admin/AdminShell";
import { createClient } from "@/lib/supabase/server";
import { fetchNotifications } from "@/lib/supabase/notifications";

export const dynamic = "force-dynamic";

export const metadata = {
  title: {
    default: "Dashboard",
    template: "%s | UmrahQu",
  },
  description: "Web Admin UmrahQu - Sistem Manajemen Travel & Umrah",
};

export default async function AdminLayout({ children }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const account = {
    id: user?.id ?? null,
    nama: user?.user_metadata?.nama ?? "",
    email: user?.email ?? "",
    telp: user?.user_metadata?.phone ?? "",
  };

  const { items, unread, error } = await fetchNotifications(supabase, user?.id);
  if (error) console.error(error);

  return (
    <AdminShell
      account={account}
      initialNotifications={items}
      initialUnread={unread}
    >
      {children}
    </AdminShell>
  );
}
