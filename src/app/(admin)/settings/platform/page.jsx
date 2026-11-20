"use client";

import React, { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

export default function KonfigurasiPlatformPage() {
  const [komisi, setKomisi] = useState("Rp 2.000.000");
  const [cashback, setCashback] = useState("Rp 1.500.000");
  const [minDeposit, setMinDeposit] = useState("Rp 10.000.000");
  const [waktuBayar, setWaktuBayar] = useState("24");

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success("Konfigurasi platform berhasil disimpan.");
  };

  return (
    <Card className="p-6 shadow-xs">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Komisi Platform */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <Label className="gap-1.5 font-semibold">
            <span>Komisi platform</span>
            <HelpCircle className="size-3.5 text-muted-foreground" />
          </Label>
          <Input
            type="text"
            value={komisi}
            onChange={(e) => setKomisi(e.target.value)}
            className="sm:w-72 text-right"
          />
        </div>

        {/* Cashback */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <Label className="gap-1.5 font-semibold">
            <span>Cashback</span>
            <HelpCircle className="size-3.5 text-muted-foreground" />
          </Label>
          <Input
            type="text"
            value={cashback}
            onChange={(e) => setCashback(e.target.value)}
            className="sm:w-72 text-right"
          />
        </div>

        {/* Batas Minimal Saldo Deposit */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <Label className="gap-1.5 font-semibold">
            <span>Batas Minimal Saldo Deposit</span>
            <HelpCircle className="size-3.5 text-muted-foreground" />
          </Label>
          <Input
            type="text"
            value={minDeposit}
            onChange={(e) => setMinDeposit(e.target.value)}
            className="sm:w-72 text-right"
          />
        </div>

        {/* Batas Waktu Pembayaran */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <Label className="gap-1.5 font-semibold">
            <span>Batas Waktu Pembayaran</span>
            <HelpCircle className="size-3.5 text-muted-foreground" />
          </Label>
          <div className="flex items-center gap-2 w-full sm:w-72">
            <Input
              type="number"
              value={waktuBayar}
              onChange={(e) => setWaktuBayar(e.target.value)}
              className="text-right"
            />
            <span className="text-xs text-muted-foreground">Jam</span>
          </div>
        </div>

        {/* Simpan Button */}
        <div className="flex justify-end pt-3">
          <Button type="submit">Simpan</Button>
        </div>
      </form>
    </Card>
  );
}
