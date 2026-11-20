"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function UnauthorizedClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  const logout = async () => {
    setLoading(true);
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
      <Card className="gap-0 w-full max-w-[420px] rounded-2xl p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 flex size-12 items-center justify-center rounded-full bg-destructive/15">
          <ShieldAlert className="size-6 text-destructive" />
        </div>

        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Akses terbatas
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {email ? (
            <>
              Akun <span className="font-mono text-foreground">{email}</span> berhasil
              masuk, tetapi tidak punya hak akses ke halaman admin.
            </>
          ) : (
            "Akun ini tidak punya hak akses ke halaman admin."
          )}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Hubungi Super Admin jika Anda merasa seharusnya punya akses.
        </p>

        <Button className="mt-6 w-full" onClick={logout} disabled={loading}>
          {loading ? "Keluar..." : "Keluar"}
        </Button>
      </Card>
    </div>
  );
}
