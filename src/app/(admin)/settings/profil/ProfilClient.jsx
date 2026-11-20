"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

export default function ProfilClient({ initialNama, initialEmail, initialTelp }) {
  const router = useRouter();
  const [nama, setNama] = useState(initialNama);
  const [email, setEmail] = useState(initialEmail);
  const [telp, setTelp] = useState(initialTelp);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await createClient().auth.updateUser({
        email,
        data: { nama, phone: telp },
      });
      if (error) throw error;
      toast.success("Profil berhasil disimpan.");
      router.refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6 shadow-xs">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            <div className="w-11 h-11 rounded-full bg-amber-400 flex items-center justify-center relative shadow-inner">
              <div className="w-1.5 h-1.5 bg-amber-800 rounded-full absolute left-2.5 top-3.5" />
              <div className="w-1.5 h-1.5 bg-amber-800 rounded-full absolute right-2.5 top-3.5" />
              <div className="w-4 h-1.5 border-b-2 border-amber-800 rounded-full absolute bottom-2.5" />
            </div>
          </div>

          <div>
            <Button type="button" variant="secondary" size="sm">
              <Camera className="size-3.5" />
              <span>Unggah</span>
            </Button>
            <p className="text-[11px] text-muted-foreground mt-1.5">
              Maks. 2MB. Format: PNG, JPG, atau WebP
            </p>
          </div>
        </div>

        {/* Nama Lengkap */}
        <div>
          <Label className="mb-1.5 font-semibold">Nama Lengkap</Label>
          <Input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Nama ini akan ditampilkan pada aktivitas operasional dan catatan audit platform.
          </p>
        </div>

        {/* Alamat Email */}
        <div>
          <Label className="mb-1.5 font-semibold">Alamat Email</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* No Telp */}
        <div>
          <Label className="mb-1.5 font-semibold">No. Telp</Label>
          <Input
            type="text"
            value={telp}
            onChange={(e) => setTelp(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            Nomor kontak aktif yang dapat dihubungi untuk koordinasi darurat operasional.
          </p>
        </div>

        {/* Simpan Button */}
        <div>
          <Button type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
