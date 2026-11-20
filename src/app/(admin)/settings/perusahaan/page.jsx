"use client";

import React, { useState } from "react";
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilPerusahaanPage() {
  const [organisasi, setOrganisasi] = useState("PT. Universal Big Data");
  const [brand, setBrand] = useState("UmrahQu");
  const [deskripsi, setDeskripsi] = useState(
    "Platform marketplace dan ekosistem terpadu penyelenggara perjalanan ibadah umrah dan haji khusus berizin resmi di Indonesia."
  );
  const [email, setEmail] = useState("support@umrahqu.com");
  const [telepon, setTelepon] = useState("+62 21 8899 7766");
  const [whatsapp, setWhatsapp] = useState("+62 811 2233 4455");
  const [alamat, setAlamat] = useState(
    "Ruko Modern Kav A16-A17, Jl Loncat Indah, Tasikmadu, Kota Malang 65143"
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Profil perusahaan berhasil disimpan.");
  };

  return (
    <Card className="p-6 shadow-xs">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Ikon Aplikasi */}
        <div>
          <Label className="mb-2 font-semibold">Ikon Aplikasi</Label>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary border border-primary/50 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-md">
              Q
            </div>
            <div>
              <Button type="button" variant="secondary" size="sm">
                <Camera className="size-3.5" />
                <span>Unggah</span>
              </Button>
              <p className="text-[11px] text-muted-foreground mt-1">
                Ukuran file maksimal 2MB. Format: PNG, JPG, WebP atau SVG
              </p>
            </div>
          </div>
        </div>

        {/* Grid 2 cols: Nama Organisasi & Nama Brand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="mb-1.5 font-semibold">Nama Organisasi</Label>
            <Input
              type="text"
              value={organisasi}
              onChange={(e) => setOrganisasi(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1.5 font-semibold">Nama Brand</Label>
            <Input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
            />
          </div>
        </div>

        {/* Deskripsi */}
        <div>
          <Label className="mb-1.5 font-semibold">Deskripsi</Label>
          <Textarea
            rows={3}
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
          />
        </div>

        {/* Grid 3 cols: Email, No Telepon, WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label className="mb-1.5 font-semibold">Email Organisasi</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1.5 font-semibold">No. Telepon Organisasi</Label>
            <Input
              type="text"
              value={telepon}
              onChange={(e) => setTelepon(e.target.value)}
            />
          </div>
          <div>
            <Label className="mb-1.5 font-semibold">WhatsApp</Label>
            <Input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
          </div>
        </div>

        {/* Alamat Kantor */}
        <div>
          <Label className="mb-1.5 font-semibold">Alamat Kantor</Label>
          <Input
            type="text"
            value={alamat}
            onChange={(e) => setAlamat(e.target.value)}
          />
        </div>

        {/* Simpan Button */}
        <div>
          <Button type="submit">Simpan</Button>
        </div>
      </form>
    </Card>
  );
}
