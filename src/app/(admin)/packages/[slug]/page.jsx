import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";
import { fetchSingleRecord } from "@/lib/supabase/data";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const paket = await fetchSingleRecord("packages", "slug", slug);
  if (!paket) {
    return { title: "Paket Tidak Ditemukan | UmrahQu Admin" };
  }
  return {
    title: `${paket.nama} | UmrahQu Admin`,
    description: `Detail ${paket.nama} — ${paket.travel}.`,
  };
}

export default async function PaketDetailPage({ params }) {
  const { slug } = await params;
  const paket = await fetchSingleRecord("packages", "slug", slug);
  if (!paket) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header: back link, thumbnail, title, badges */}
      <div className="space-y-3">
        <Link
          href="/packages"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-3.5" />
          <span>Kembali ke Daftar Paket</span>
        </Link>

        <div className="flex items-start gap-4">
          <div
            className={`flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-gradient-to-br ${paket.imgColor || "from-amber-600/30 to-amber-900/40"} shadow-xs`}
            aria-hidden="true"
          />
          <div className="min-w-0 space-y-1.5">
            <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              {paket.nama}
            </h1>
            <p className="text-xs text-muted-foreground">{paket.travel}</p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <StatusBadge value={paket.status} />
              <StatusBadge value={paket.kategori} tone="neutral" />
            </div>
          </div>
        </div>
      </div>

      {/* Ringkasan Paket */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ringkasan Paket
        </h2>
        <dl className="grid grid-cols-1 gap-x-10 gap-y-3 text-xs md:grid-cols-2">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <dt className="text-muted-foreground">Biaya Paket</dt>
            <dd className="font-medium text-foreground">{paket.biaya}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <dt className="text-muted-foreground">Cashback</dt>
            <dd className="font-medium text-emerald-400">
              {String(paket.cashback || "").replace(/^Cashback:\s*/, "")}
            </dd>
          </div>
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <dt className="text-muted-foreground">Travel Penyelenggara</dt>
            <dd className="font-medium text-foreground">{paket.travel}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <dt className="text-muted-foreground">Kategori</dt>
            <dd className="font-medium text-foreground">{paket.kategori}</dd>
          </div>
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <StatusBadge value={paket.status} />
            </dd>
          </div>
        </dl>
      </section>

      {/* Kuota */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Users className="size-3.5" />
          Kuota Jamaah
        </h2>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Terisi</span>
            <span className="font-medium text-foreground">
              {paket.terisi} / {paket.total} jamaah ({paket.persen}%)
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${paket.persen}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Sisa kuota: {(paket.total || 0) - (paket.terisi || 0)} jamaah.
          </p>
        </div>
      </section>
    </div>
  );
}
