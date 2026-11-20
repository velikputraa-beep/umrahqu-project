"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ListPage from "@/components/admin/ListPage";
import Modal from "@/components/admin/Modal";
import StatusBadge from "@/components/admin/StatusBadge";
import FilterMultiSelect from "@/components/admin/FilterMultiSelect";
import RowActionsMenu from "@/components/admin/RowActionsMenu";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

const KATEGORI_OPTIONS = ["VIP", "Plus", "Reguler"];
const STATUS_OPTIONS = ["Aktif", "Selesai"];

export default function PackagesClient({ initialPackages = [] }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [packages, setPackages] = useState(initialPackages);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [kategori, setKategori] = useState([]);
  const [status, setStatus] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Supabase Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "packages" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setPackages((prev) => [payload.new, ...prev]);
            toast.info("Paket baru ditambahkan (Realtime)");
          } else if (payload.eventType === "UPDATE") {
            setPackages((prev) =>
              prev.map((item) =>
                item.slug === payload.new.slug || item.id === payload.new.id
                  ? { ...item, ...payload.new }
                  : item
              )
            );
            toast.info("Data paket diperbarui (Realtime)");
          } else if (payload.eventType === "DELETE") {
            setPackages((prev) =>
              prev.filter(
                (item) => item.slug !== payload.old.slug && item.id !== payload.old.id
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const rows = packages.filter((paket) => {
    const term = searchTerm.trim().toLowerCase();
    if (term && !`${paket.nama} ${paket.travel}`.toLowerCase().includes(term)) {
      return false;
    }
    if (kategori.length && !kategori.includes(paket.kategori)) return false;
    if (status.length && !status.includes(paket.status)) return false;
    return true;
  });

  const openEditModal = (paket) => {
    setEditing(paket);
    setModalOpen(true);
  };

  const submitPackage = async (paket) => {
    setLoading(true);
    const pesan = paket.nama.startsWith("Paket") ? paket.nama : `Paket ${paket.nama}`;
    try {
      if (editing) {
        const { error } = await supabase
          .from("packages")
          .update(paket)
          .eq("slug", paket.slug || editing.slug);
        if (error) throw error;
        setPackages((prev) => prev.map((item) => (item === editing ? paket : item)));
        toast.success(`${pesan} berhasil diperbarui.`);
      } else {
        const { data, error } = await supabase
          .from("packages")
          .insert([paket])
          .select();
        if (error) throw error;
        const created = data && data[0] ? data[0] : paket;
        setPackages((prev) => [created, ...prev]);
        toast.success(`${pesan} berhasil ditambahkan.`);
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan paket.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditing(null);
    }
  };

  const removePackage = async (paket) => {
    setLoading(true);
    const pesan = paket.nama.startsWith("Paket") ? paket.nama : `Paket ${paket.nama}`;
    try {
      const { error } = await supabase
        .from("packages")
        .delete()
        .eq("slug", paket.slug);
      if (error) throw error;
      setPackages((prev) => prev.filter((item) => item !== paket));
      toast.success(`${pesan} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus paket.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListPage
        title="Paket Umrah"
        search={{
          placeholder: "Cari paket atau travel...",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        filters={
          <>
            <FilterMultiSelect
              label="Kategori"
              options={KATEGORI_OPTIONS}
              value={kategori}
              onChange={setKategori}
            />
            <FilterMultiSelect
              label="Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={setStatus}
            />
          </>
        }
        columns={[
          {
            key: "nama",
            header: "Paket",
            cell: (paket) => (
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-9 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-gradient-to-br ${paket.imgColor || "from-emerald-950 to-zinc-900"} shadow-xs`}
                >
                  <ImageIcon className="size-4 text-white/50" />
                </div>
                <div>
                  <Link
                    href={`/packages/${paket.slug}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {paket.nama}
                  </Link>
                  <div className="text-[11px] text-muted-foreground">{paket.travel}</div>
                </div>
              </div>
            ),
          },
          {
            key: "biaya",
            header: "Biaya",
            cell: (paket) => (
              <div>
                <div className="font-medium text-foreground">{paket.biaya}</div>
                <div className="text-[10px] font-medium text-emerald-400">{paket.cashback}</div>
              </div>
            ),
          },
          {
            key: "kategori",
            header: "Kategori",
            cell: (paket) => <StatusBadge value={paket.kategori} tone="neutral" />,
          },
          {
            key: "status",
            header: "Status",
            cell: (paket) => <StatusBadge value={paket.status} />,
          },
          {
            key: "kuota",
            header: "Kuota",
            csv: (paket) => `${paket.terisi}/${paket.total} (${paket.persen}%)`,
            cell: (paket) => (
              <div className="w-28 space-y-1">
                <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                  <span>
                    {paket.terisi} / {paket.total}
                  </span>
                  <span>{paket.persen}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${paket.persen}%` }}
                  />
                </div>
              </div>
            ),
          },
          {
            key: "aksi",
            header: "Aksi",
            align: "center",
            csv: () => "",
            cell: (paket) => (
              <RowActionsMenu
                name={paket.nama}
                onEdit={() => openEditModal(paket)}
                onDelete={() => removePackage(paket)}
              />
            ),
          },
        ]}
        rows={rows}
      />

      <PackageFormModal
        key={editing ? editing.slug : "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        paket={editing}
        onSubmit={submitPackage}
      />
    </>
  );
}

const EMPTY_PACKAGE_FORM = {
  nama: "",
  travel: "",
  biaya: "",
  cashback: "",
  kategori: "Reguler",
  status: "Aktif",
  terisi: "0",
  total: "0",
  persen: "0",
};

function toPackageForm(paket) {
  if (!paket) return EMPTY_PACKAGE_FORM;
  return {
    nama: paket.nama,
    travel: paket.travel ?? "",
    biaya: paket.biaya ?? "",
    cashback: paket.cashback ?? "",
    kategori: paket.kategori,
    status: paket.status,
    terisi: String(paket.terisi),
    total: String(paket.total),
    persen: String(paket.persen),
  };
}

function PackageFormModal({ open, onOpenChange, paket, onSubmit }) {
  const [form, setForm] = useState(() => toPackageForm(paket));
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.nama.trim()) {
      setError("Nama paket wajib diisi.");
      toast.error("Nama paket wajib diisi.");
      return;
    }
    setError("");
    onSubmit({
      ...paket,
      nama: form.nama.trim(),
      travel: form.travel.trim(),
      biaya: form.biaya.trim(),
      cashback: form.cashback.trim(),
      kategori: form.kategori,
      status: form.status,
      terisi: Number(form.terisi) || 0,
      total: Number(form.total) || 0,
      persen: Number(form.persen) || 0,
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Paket Umrah"
      description="Data paket digunakan pada daftar paket dan pemesanan jamaah."
      onSubmit={submit}
      submitLabel="Simpan Perubahan"
    >
      <div className="space-y-1.5">
        <Label htmlFor="paket-nama">Paket *</Label>
        <Input
          id="paket-nama"
          value={form.nama}
          aria-invalid={Boolean(error)}
          onChange={(event) => set("nama")(event.target.value)}
          placeholder="Nama paket"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="paket-travel">Mitra Travel</Label>
        <Input
          id="paket-travel"
          value={form.travel}
          onChange={(event) => set("travel")(event.target.value)}
          placeholder="Nama travel"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="paket-biaya">Biaya</Label>
          <Input
            id="paket-biaya"
            value={form.biaya}
            onChange={(event) => set("biaya")(event.target.value)}
            placeholder="Rp 35.000.000"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="paket-cashback">Cashback</Label>
          <Input
            id="paket-cashback"
            value={form.cashback}
            onChange={(event) => set("cashback")(event.target.value)}
            placeholder="Cashback: Rp 1.750.000"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Kategori</Label>
          <Select value={form.kategori} onValueChange={set("kategori")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KATEGORI_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={set("status")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="paket-terisi">Terisi</Label>
          <Input
            id="paket-terisi"
            type="number"
            min="0"
            value={form.terisi}
            onChange={(event) => set("terisi")(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="paket-total">Total Kuota</Label>
          <Input
            id="paket-total"
            type="number"
            min="0"
            value={form.total}
            onChange={(event) => set("total")(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="paket-persen">Persen (%)</Label>
          <Input
            id="paket-persen"
            type="number"
            min="0"
            max="100"
            value={form.persen}
            onChange={(event) => set("persen")(event.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
