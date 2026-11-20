"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";
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
import FilterMultiSelect from "@/components/admin/FilterMultiSelect";
import RowActionsMenu from "@/components/admin/RowActionsMenu";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

const KEPARAHAN_OPTIONS = ["Tinggi", "Sedang", "Rendah"];
const STATUS_OPTIONS = ["Sedang Ditinjau", "Selesai"];

const MONTHS = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, Jun: 5,
  Jul: 6, Agu: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11,
};

function parseTanggal(value) {
  const match = /^(\d{2})\s(\w{3})\s(\d{4})$/.exec(value ?? "");
  if (!match) return null;
  const [, day, month, year] = match;
  const parsed = new Date(Number(year), MONTHS[month], Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const keparahanTone = {
  Tinggi: "border-amber-500/30 bg-amber-500/15 text-amber-400",
  Sedang: "border-yellow-500/30 bg-yellow-500/15 text-yellow-400",
  Rendah: "border-border bg-muted text-muted-foreground",
};

export default function ComplaintsClient({ initialComplaints }) {
  const router = useRouter();
  const supabase = createClient();
  const [complaints, setComplaints] = useState(initialComplaints);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [keparahan, setKeparahan] = useState([]);
  const [status, setStatus] = useState([]);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const rows = complaints.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    if (
      term &&
      !`${item.komplain} ${item.jamaah} ${item.agensi}`.toLowerCase().includes(term)
    )
      return false;
    if (keparahan.length && !keparahan.includes(item.keparahan)) return false;
    if (status.length && !status.includes(item.status)) return false;

    if (dateFrom || dateTo) {
      const tanggal = parseTanggal(item.tanggal);
      if (!tanggal) return false;
      if (dateFrom && tanggal < dateFrom) return false;
      if (
        dateTo &&
        tanggal > new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate(), 23, 59, 59)
      )
        return false;
    }
    return true;
  });

  const openEditModal = (item) => {
    setEditing(item);
    setModalOpen(true);
  };

  const submitComplaint = async (item) => {
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("complaints")
          .update(item)
          .eq("id", item.id || editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("complaints")
          .insert([item])
          .select();
        if (error) throw error;
        if (data && data[0]) {
          item = data[0];
        }
      }

      setComplaints((prev) => {
        if (editing) {
          return prev.map((row) => (row === editing || row.id === item.id ? item : row));
        }
        return [item, ...prev];
      });

      toast.success(
        editing
          ? `Komplain ${item.komplain} berhasil diperbarui.`
          : `Komplain ${item.komplain} berhasil ditambahkan.`
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan komplain.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditing(null);
    }
  };

  const removeComplaint = async (item) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("complaints")
        .delete()
        .eq("id", item.id);
      if (error) throw error;

      setComplaints((prev) => prev.filter((row) => row !== item && row.id !== item.id));
      toast.success(`Komplain ${item.komplain} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus komplain.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListPage
        title="Daftar keluhan pelanggan"
        search={{
          placeholder: "Cari komplain, travel, jamaah...",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        dateRange={{
          from: dateFrom,
          to: dateTo,
          onChange: (from, to) => {
            setDateFrom(from);
            setDateTo(to);
          },
        }}
        filters={
          <>
            <FilterMultiSelect
              label="Tingkat Keparahan"
              options={KEPARAHAN_OPTIONS}
              value={keparahan}
              onChange={setKeparahan}
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
            key: "komplain",
            header: "Komplain & Kategori",
            cell: (item) => (
              <div>
                <div className="font-semibold text-foreground">{item.komplain}</div>
                <span className="mt-1 inline-block rounded-full border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-[9px] font-medium text-red-400">
                  {item.kategoriBadge}
                </span>
              </div>
            ),
          },
          {
            key: "jamaah",
            header: "Jamaah Pelapor",
            csv: (item) => `${item.jamaah} (${item.email})`,
            cell: (item) => (
              <div>
                <div className="font-semibold text-foreground">{item.jamaah}</div>
                <div className="text-[11px] text-muted-foreground">{item.email}</div>
              </div>
            ),
          },
          {
            key: "agensi",
            header: "Agensi Terlapor",
            csv: (item) => `${item.agensi} (${item.agensiHandle})`,
            cell: (item) => (
              <div>
                <div className="font-semibold text-foreground">{item.agensi}</div>
                <div className="font-mono text-[11px] text-muted-foreground">
                  {item.agensiHandle}
                </div>
              </div>
            ),
          },
          {
            key: "keparahan",
            header: "Tingkat Keparahan",
            cell: (item) => (
              <span
                className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${keparahanTone[item.keparahan]}`}
              >
                {item.keparahan}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            cell: (item) => (
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${
                  item.status === "Sedang Ditinjau"
                    ? "border-amber-500/30 bg-amber-500/15 text-amber-400"
                    : "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                }`}
              >
                <Clock className="size-3" />
                <span>{item.status}</span>
              </span>
            ),
          },
          { key: "tanggal", header: "Tanggal", cellClassName: "whitespace-nowrap" },
          {
            key: "aksi",
            header: "Aksi",
            align: "center",
            csv: () => "",
            cell: (item) => (
              <RowActionsMenu
                name={item.komplain}
                onEdit={() => openEditModal(item)}
                onDelete={() => removeComplaint(item)}
              />
            ),
          },
        ]}
        rows={rows}
      />

      <ComplaintFormModal
        key={editing ? (editing.id || editing.komplain) : "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        complaint={editing}
        onSubmit={submitComplaint}
      />
    </>
  );
}

const EMPTY_COMPLAINT_FORM = {
  komplain: "",
  kategoriBadge: "",
  jamaah: "",
  email: "",
  agensi: "",
  agensiHandle: "",
  keparahan: "Sedang",
  status: "Sedang Ditinjau",
  tanggal: "",
};

function toComplaintForm(item) {
  if (!item) return EMPTY_COMPLAINT_FORM;
  return {
    komplain: item.komplain,
    kategoriBadge: item.kategoriBadge ?? "",
    jamaah: item.jamaah ?? "",
    email: item.email ?? "",
    agensi: item.agensi ?? "",
    agensiHandle: item.agensiHandle ?? "",
    keparahan: item.keparahan,
    status: item.status,
    tanggal: item.tanggal ?? "",
  };
}

function ComplaintFormModal({ open, onOpenChange, complaint, onSubmit }) {
  const [form, setForm] = useState(() => toComplaintForm(complaint));
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.komplain.trim()) {
      setError("Komplain wajib diisi.");
      toast.error("Komplain wajib diisi.");
      return;
    }
    setError("");
    onSubmit({
      ...(complaint || { id: `cmp-${Date.now()}` }),
      komplain: form.komplain.trim(),
      kategoriBadge: form.kategoriBadge.trim(),
      jamaah: form.jamaah.trim(),
      email: form.email.trim(),
      agensi: form.agensi.trim(),
      agensiHandle: form.agensiHandle.trim(),
      keparahan: form.keparahan,
      status: form.status,
      tanggal: form.tanggal.trim(),
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Komplain"
      description="Perbarui data keluhan pelanggan dan status penanganannya."
      onSubmit={submit}
      submitLabel="Simpan Perubahan"
    >
      <div className="space-y-1.5">
        <Label htmlFor="komplain-judul">Komplain *</Label>
        <Input
          id="komplain-judul"
          value={form.komplain}
          aria-invalid={Boolean(error)}
          onChange={(event) => set("komplain")(event.target.value)}
          placeholder="Judul komplain"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="komplain-kategori">Kategori</Label>
          <Input
            id="komplain-kategori"
            value={form.kategoriBadge}
            onChange={(event) => set("kategoriBadge")(event.target.value)}
            placeholder="Contoh: Operasional"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="komplain-tanggal">Tanggal</Label>
          <Input
            id="komplain-tanggal"
            value={form.tanggal}
            onChange={(event) => set("tanggal")(event.target.value)}
            placeholder="02 Nov 2026"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="komplain-jamaah">Jamaah Pelapor</Label>
          <Input
            id="komplain-jamaah"
            value={form.jamaah}
            onChange={(event) => set("jamaah")(event.target.value)}
            placeholder="Nama jamaah"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="komplain-email">Email Jamaah</Label>
          <Input
            id="komplain-email"
            type="email"
            value={form.email}
            onChange={(event) => set("email")(event.target.value)}
            placeholder="email@gmail.com"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="komplain-agensi">Agensi Terlapor</Label>
          <Input
            id="komplain-agensi"
            value={form.agensi}
            onChange={(event) => set("agensi")(event.target.value)}
            placeholder="Nama agensi"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="komplain-handle">Handle Agensi</Label>
          <Input
            id="komplain-handle"
            value={form.agensiHandle}
            onChange={(event) => set("agensiHandle")(event.target.value)}
            placeholder="@nama-agensi"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Tingkat Keparahan</Label>
          <Select value={form.keparahan} onValueChange={set("keparahan")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KEPARAHAN_OPTIONS.map((option) => (
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
    </Modal>
  );
}
