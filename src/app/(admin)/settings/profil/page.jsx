import React from "react";
import ProfilClient from "./ProfilClient";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Profil Saya",
};

export default async function ProfilSayaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ProfilClient
      initialNama={user?.user_metadata?.nama ?? ""}
      initialEmail={user?.email ?? ""}
      initialTelp={user?.user_metadata?.phone ?? ""}
    />
  );
}
