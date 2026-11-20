"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
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

const STATUS_OPTIONS = ["Aktif", "Masa Tenggang", "Suspended"];

export default function TravelsClient({ initialTravels }) {
  const router = useRouter();
  const supabase = createClient();
  const [travels, setTravels] = useState(initialTravels);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const rows = travels.filter((travel) => {
    const term = searchTerm.trim().toLowerCase();
    if (
      term &&
      !`${travel.nama} ${travel.alamatKota} ${travel.alamatDetail}`
        .toLowerCase()
        .includes(term)
    ) {
      return false;
    }
    if (status.length && !status.includes(travel.status)) return false;
    return true;
  });

  const openEditModal = (travel) => {
    setEditing(travel);
    setModalOpen(true);
  };

  const submitTravel = async (travel) => {
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("travels")
          .update(travel)
          .eq("id", travel.id || editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("travels")
          .insert([travel])
          .select();
        if (error) throw error;
        if (data && data[0]) {
          travel = data[0];
        }
      }

      setTravels((prev) => {
        if (editing) {
          return prev.map((item) => (item === editing || item.id === travel.id ? travel : item));
        }
        return [travel, ...prev];
      });

      toast.success(
        editing
          ? `Travel ${travel.nama} berhasil diperbarui.`
          : `Travel ${travel.nama} berhasil ditambahkan.`
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan travel.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditing(null);
    }
  };

  const removeTravel = async (travel) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("travels")
        .delete()
        .eq("id", travel.id);
      if (error) throw error;

      setTravels((prev) => prev.filter((item) => item !== travel && item.id !== travel.id));
      toast.success(`Travel ${travel.nama} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus travel.");
    } finally {
      setLoading(false);
    }
  };

  const stats = STATUS_OPTIONS.map((option) => ({
    title: option,
    value: String(travels.filter((travel) => travel.status === option).length),
  }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground">Travel</span>
          <div className="mt-3">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              {travels.length}
            </span>
          </div>
        </div>
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border border-border bg-card p-5 shadow-xs"
          >
            <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <ListPage
        title="Mitra Travel"
        search={{
          placeholder: "Cari nama travel, nama PT resmi, nomor PPIU...",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        filters={
          <FilterMultiSelect
            label="Status"
            options={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
          />
        }
        columns={[
          {
            key: "nama",
            header: "Travel",
            cell: (travel) => (
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${travel.color || "bg-muted text-foreground"}`}
                >
                  {travel.initial || travel.nama?.substring(0, 2).toUpperCase()}
                </div>
                <span className="font-medium text-foreground">{travel.nama}</span>
              </div>
            ),
          },
          {
            key: "alamatKota",
            header: "Alamat",
            cell: (travel) => (
              <div>
                <div className="font-medium text-foreground">{travel.alamatKota}</div>
                <div className="text-[11px] text-muted-foreground">{travel.alamatDetail}</div>
              </div>
            ),
          },
          {
            key: "totalPaket",
            header: "Total Paket",
            align: "center",
            cell: (travel) => (
              <span className="font-medium text-foreground">{travel.totalPaket}</span>
            ),
          },
          {
            key: "legalitas",
            header: "Legalitas",
            align: "center",
            cell: (travel) =>
              travel.legalitas === "Lengkap" ? (
                <CheckCircle2 className="mx-auto size-4 text-emerald-400" />
              ) : (
                <span className="text-muted-foreground">{travel.legalitas}</span>
              ),
          },
          {
            key: "status",
            header: "Status",
            cell: (travel) => <StatusBadge value={travel.status} />,
          },
          {
            key: "aksi",
            header: "Aksi",
            align: "center",
            csv: () => "",
            cell: (travel) => (
              <RowActionsMenu
                name={travel.nama}
                onEdit={() => openEditModal(travel)}
                onDelete={() => removeTravel(travel)}
              />
            ),
          },
        ]}
        rows={rows}
      />

      <TravelFormModal
        key={editing ? (editing.id || editing.nama) : "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        travel={editing}
        onSubmit={submitTravel}
      />
    </div>
  );
}

const EMPTY_TRAVEL_FORM = {
  nama: "",
  alamatKota: "",
  alamatDetail: "",
  totalPaket: "0",
  status: "Aktif",
};

function toTravelForm(travel) {
  if (!travel) return EMPTY_TRAVEL_FORM;
  return {
    nama: travel.nama,
    alamatKota: travel.alamatKota,
    alamatDetail: travel.alamatDetail,
    totalPaket: String(travel.totalPaket),
    status: travel.status,
  };
}

function TravelFormModal({ open, onOpenChange, travel, onSubmit }) {
  const [form, setForm] = useState(() => toTravelForm(travel));
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.nama.trim()) {
      setError("Nama travel wajib diisi.");
      toast.error("Nama travel wajib diisi.");
      return;
    }
    setError("");
    onSubmit({
      ...(travel || { id: `trv-${Date.now()}` }),
      nama: form.nama.trim(),
      alamatKota: form.alamatKota,
      alamatDetail: form.alamatDetail,
      totalPaket: Number(form.totalPaket) || 0,
      status: form.status,
    });
    if (!travel) setForm(EMPTY_TRAVEL_FORM);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={travel ? "Edit Travel" : "Tambah Travel"}
      description="Data mitra travel agency pada platform."
      onSubmit={submit}
      submitLabel={travel ? "Simpan Perubahan" : "Simpan Travel"}
    >
      <div className="space-y-1.5">
        <Label htmlFor="trv-nama">Nama Travel *</Label>
        <Input
          id="trv-nama"
          value={form.nama}
          aria-invalid={Boolean(error)}
          onChange={(event) => set("nama")(event.target.value)}
          placeholder="Nama travel"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="trv-kota">Kota</Label>
          <Input
            id="trv-kota"
            value={form.alamatKota}
            onChange={(event) => set("alamatKota")(event.target.value)}
            placeholder="Kota, Provinsi"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="trv-alamat">Alamat Detail</Label>
          <Input
            id="trv-alamat"
            value={form.alamatDetail}
            onChange={(event) => set("alamatDetail")(event.target.value)}
            placeholder="Alamat lengkap kantor"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="trv-total-paket">Total Paket</Label>
          <Input
            id="trv-total-paket"
            type="number"
            min="0"
            value={form.totalPaket}
            onChange={(event) => set("totalPaket")(event.target.value)}
            placeholder="0"
          />
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
