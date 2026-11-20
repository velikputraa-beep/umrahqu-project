"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";

export default function NotifikasiPage() {
  const [soundEnabled, setSoundEnabled] = useState(false);

  return (
    <Card className="flex flex-row items-center justify-between p-5 shadow-xs">
      <div>
        <h3 className="text-xs font-semibold text-foreground">Suara Notifikasi</h3>
      </div>

      <button
        type="button"
        onClick={() => setSoundEnabled(!soundEnabled)}
        className={`w-10 h-5 rounded-full relative p-0.5 transition-colors cursor-pointer ${
          soundEnabled ? "bg-primary" : "bg-muted"
        }`}
      >
        <div
          className={`w-4 h-4 bg-white rounded-full transition-transform shadow-xs ${
            soundEnabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </Card>
  );
}
