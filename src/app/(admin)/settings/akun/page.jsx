"use client";

import React from "react";
import { AlertTriangle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AkunPenggunaPage() {
  return (
    <div className="space-y-4">
      {/* Card 1: Kata Sandi */}
      <Card className="flex flex-row items-center justify-between p-5 shadow-xs">
        <div>
          <h3 className="text-xs font-semibold text-foreground">Kata Sandi</h3>
        </div>
        <Button type="button" variant="secondary" size="sm">
          Ubah Kata Sandi
        </Button>
      </Card>

      {/* Card 2: Zona Berbahaya */}
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 shadow-xs border border-destructive/30">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
            <AlertTriangle className="size-3.5" />
            <span>Zona Berbahaya</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Tindakan ini akan berdampak permanen terhadap aksesibilitas akun Anda.
          </p>
        </div>

        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="self-start sm:self-auto"
        >
          Nonaktifkan Akun
        </Button>
      </Card>
    </div>
  );
}
