"use client";

import React, { useState } from "react";
import { Sun, Moon, Laptop, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function TampilanPage() {
  const [selectedTheme, setSelectedTheme] = useState("system");
  const [selectedFont, setSelectedFont] = useState("Outfit");

  const themes = [
    {
      id: "light",
      label: "Terang",
      icon: Sun,
      preview: (
        <div className="w-full h-16 bg-white rounded-md p-2 flex flex-col justify-between border border-zinc-200">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
          </div>
          <div className="w-3/4 h-2 bg-zinc-900 rounded-xs" />
          <div className="w-full flex justify-between items-end">
            <div className="w-1/2 h-1.5 bg-zinc-200 rounded-xs" />
            <div className="w-4 h-2.5 bg-emerald-600 rounded-xs" />
          </div>
        </div>
      ),
    },
    {
      id: "dark",
      label: "Gelap",
      icon: Moon,
      preview: (
        <div className="w-full h-16 bg-zinc-950 rounded-md p-2 flex flex-col justify-between border border-zinc-800">
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
          </div>
          <div className="w-3/4 h-2 bg-zinc-200 rounded-xs" />
          <div className="w-full flex justify-between items-end">
            <div className="w-1/2 h-1.5 bg-zinc-700 rounded-xs" />
            <div className="w-4 h-2.5 bg-emerald-500 rounded-xs" />
          </div>
        </div>
      ),
    },
    {
      id: "system",
      label: "Sistem (Otomatis)",
      icon: Laptop,
      preview: (
        <div className="w-full h-16 rounded-md flex overflow-hidden border border-zinc-700">
          <div className="w-1/2 bg-white p-2 flex flex-col justify-between">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
            <div className="w-full h-2 bg-zinc-900 rounded-xs" />
            <div className="w-4 h-2.5 bg-emerald-600 rounded-xs" />
          </div>
          <div className="w-1/2 bg-zinc-950 p-2 flex flex-col justify-between">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
            <div className="w-full h-2 bg-zinc-200 rounded-xs" />
            <div className="w-4 h-2.5 bg-emerald-500 rounded-xs" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <Card className="gap-6 p-6 shadow-xs">
      {/* Tema Section */}
      <div>
        <Label className="mb-3 font-semibold">Tema</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themes.map((t) => {
            const Icon = t.icon;
            const isSelected = selectedTheme === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedTheme(t.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? "bg-background border-primary ring-1 ring-primary/50"
                    : "bg-background/60 border-border hover:border-input"
                }`}
              >
                {t.preview}

                <div className="flex items-center justify-between mt-3 text-xs">
                  <div className="flex items-center gap-1.5 font-medium text-foreground">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{t.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Font Section */}
      <div className="pt-4 border-t border-border">
        <Label className="mb-2 font-semibold">Font</Label>
        <select
          value={selectedFont}
          onChange={(e) => setSelectedFont(e.target.value)}
          className="w-full bg-input/30 border border-input rounded-lg px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-ring transition-colors cursor-pointer"
        >
          <option value="Outfit">Outfit</option>
          <option value="Inter">Inter</option>
          <option value="Geist">Geist</option>
          <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
        </select>
      </div>
    </Card>
  );
}
