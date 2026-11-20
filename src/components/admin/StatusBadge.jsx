import { cn } from "cn";

const tones = {
  emerald: "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
  amber: "border-amber-500/30 bg-amber-500/15 text-amber-400",
  sky: "border-sky-500/30 bg-sky-500/15 text-sky-400",
  red: "border-red-500/30 bg-red-500/15 text-red-400",
  neutral: "border-border bg-muted text-muted-foreground",
};

// Production keeps distinct value sets per domain, so the maps are kept separate
// instead of one shared enum.
const toneByValue = {
  Lunas: "emerald",
  "Belum Lunas": "amber",
  "Belum Bayar": "neutral",
  Dikonfirmasi: "sky",
  Menunggu: "amber",
  Selesai: "emerald",
  Dibatalkan: "red",
  Terbayar: "emerald",
  Aktif: "emerald",
  Nonaktif: "neutral",
  Verifikasi: "sky",
  "Perlu Verifikasi Ulang": "amber",
  "Tidak memenuhi": "red",
  "Akan kedaluwarsa": "amber",
  Kedaluwarsa: "red",
};

export default function StatusBadge({ value, tone, className }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        tones[tone ?? toneByValue[value] ?? "neutral"],
        className
      )}
    >
      {value}
    </span>
  );
}
