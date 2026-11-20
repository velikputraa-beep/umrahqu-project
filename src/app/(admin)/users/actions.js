"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ROLES } from "@/lib/roles";
import { formatTanggal } from "@/lib/utils";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Sesi berakhir. Silakan login ulang.", supabase: null };
  if (user.app_metadata?.role !== "admin") {
    return { error: "Aksi ditolak: hanya admin yang bisa mengelola pengguna.", supabase: null };
  }
  return { supabase };
}

export async function createUserAction({ nama, email, password, role }) {
  const { supabase, error: guardError } = await requireAdmin();
  if (guardError) return { ok: false, error: guardError };

  const cleanName = (nama ?? "").trim();
  const cleanEmail = (email ?? "").trim().toLowerCase();
  if (!cleanName) return { ok: false, error: "Nama lengkap wajib diisi." };
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return { ok: false, error: "Format email tidak valid." };
  if (!password || password.length < 6) {
    return { ok: false, error: "Password minimal 6 karakter." };
  }
  const appRole = ROLES.find((item) => item.value === role)?.value;
  if (!appRole) return { ok: false, error: "Role tidak dikenal." };

  let admin;
  try {
    admin = createAdminClient();
  } catch (err) {
    return { ok: false, error: err.message };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: cleanEmail,
    password,
    email_confirm: true,
    user_metadata: { nama: cleanName },
    app_metadata: { role: appRole },
  });
  if (error) return { ok: false, error: `Gagal membuat akun: ${error.message}` };

  const row = {
    id: data.user.id,
    nama: cleanName,
    email: cleanEmail,
    travel: "—",
    role: appRole,
    tglDaftar: formatTanggal(new Date()),
    terakhirLogin: "—",
  };

  // The row is written with the admin's own session so the users_* RLS policies
  // still apply; the service client is only used for the auth.* calls.
  const { error: insertError } = await supabase.from("users").insert([row]);
  if (insertError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return { ok: false, error: `Akun dibuat tapi data pengguna gagal disimpan: ${insertError.message}` };
  }

  revalidatePath("/users");
  return { ok: true, user: row };
}

export async function removeUserAction(userId) {
  const { supabase, error: guardError } = await requireAdmin();
  if (guardError) return { ok: false, error: guardError };
  if (!userId) return { ok: false, error: "ID pengguna tidak valid." };

  const { error } = await supabase.from("users").delete().eq("id", userId);
  if (error) return { ok: false, error: `Gagal menghapus pengguna: ${error.message}` };

  // Removing the profile must also remove the login account, otherwise the
  // deleted user keeps a working session and can still sign in. Legacy rows use
  // a "usr-<timestamp>" id that has no auth account behind it.
  const isAuthAccount = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    userId
  );
  if (isAuthAccount) {
    try {
      const { error: authError } = await createAdminClient().auth.admin.deleteUser(userId);
      if (authError) {
        revalidatePath("/users");
        return { ok: true, warning: `Data Profil Terhapus, tetapi Gagal Menghapus Akun: ${authError.message}` };
      }
    } catch (err) {
      revalidatePath("/users");
      return { ok: true, warning: err.message };
    }
  }

  revalidatePath("/users");
  return { ok: true };
}
