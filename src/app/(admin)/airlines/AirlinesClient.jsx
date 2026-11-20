"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plane, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

export default function AirlinesClient({ initialAirlines }) {
  const router = useRouter();
  const supabase = createClient();
  const [airlines, setAirlines] = useState(initialAirlines);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [mitra, setMitra] = useState([]);
  const [status, setStatus] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const mitraOptions = [...new Set(airlines.map((airline) => airline.mitra))];

  const rows = airlines.filter((airline) => {
    const term = searchTerm.trim().toLowerCase();
    if (term && !`${airline.nama} ${airline.iata} ${airline.mitra}`.toLowerCase().includes(term)) {
      return false;
    }
    if (mitra.length && !mitra.includes(airline.mitra)) return false;
    if (status.length && !status.includes(airline.status)) return false;
    return true;
  });

  const openAddModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEditModal = (airline) => {
    setEditing(airline);
    setModalOpen(true);
  };

  const submitAirline = async (airline) => {
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("airlines")
          .update(airline)
          .eq("id", airline.id || editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("airlines")
          .insert([airline])
          .select();
        if (error) throw error;
        if (data && data[0]) {
          airline = data[0];
        }
      }

      setAirlines((prev) => {
        if (editing) {
          return prev.map((item) => (item === editing || item.id === airline.id ? airline : item));
        }
        return [airline, ...prev];
      });

      toast.success(
        editing
          ? `Maskapai ${airline.nama} berhasil diperbarui.`
          : `Maskapai ${airline.nama} berhasil ditambahkan.`
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan maskapai.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditing(null);
    }
  };

  const removeAirline = async (airline) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("airlines")
        .delete()
        .eq("id", airline.id);
      if (error) throw error;

      setAirlines((prev) => prev.filter((item) => item !== airline && item.id !== airline.id));
      toast.success(`Maskapai ${airline.nama} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus maskapai.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListPage
        title="Maskapai"
        actions={
          <Button size="sm" onClick={openAddModal} disabled={loading}>
            <Plus className="size-3.5" />
            Tambah Maskapai
          </Button>
        }
        search={{
          placeholder: "Cari nama maskapai / kode IATA...",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        filters={
          <>
            <FilterMultiSelect label="Mitra Travel" options={mitraOptions} value={mitra} onChange={setMitra} />
            <FilterMultiSelect
              label="Status"
              options={["Aktif", "Nonaktif"]}
              value={status}
              onChange={setStatus}
            />
          </>
        }
        columns={[
          {
            key: "nama",
            header: "Maskapai",
            cell: (airline) => (
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                  <Plane className="size-4 text-muted-foreground" />
                </div>
                <span className="font-medium text-foreground">{airline.nama}</span>
              </div>
            ),
          },
          {
            key: "iata",
            header: "Kode IATA",
            align: "center",
            cell: (airline) => (
              <span className="rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                {airline.iata}
              </span>
            ),
          },
          {
            key: "mitra",
            header: "Mitra Travel",
            cell: (airline) => (
              <span className={airline.mitra === "Semua Travel" ? "text-muted-foreground" : "text-foreground"}>
                {airline.mitra}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            cell: (airline) => <StatusBadge value={airline.status} />,
          },
          {
            key: "aksi",
            header: "Aksi",
            align: "center",
            csv: () => "",
            cell: (airline) => (
              <RowActionsMenu
                name={airline.nama}
                onEdit={() => openEditModal(airline)}
                onDelete={() => removeAirline(airline)}
              />
            ),
          },
        ]}
        rows={rows}
      />

      <AirlineFormModal
        key={editing ? `${editing.id || editing.nama}-${editing.mitra}` : "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        airline={editing}
        onSubmit={submitAirline}
      />
    </>
  );
}

const TRAVEL_OPTIONS = [
  "An-Nahl",
  "Batik Travel",
  "PT. Al Dawood Barokah Utama",
  "PT. HISAR GLOBAL INDONESIA",
];

const EMPTY_AIRLINE_FORM = {
  mitra: "",
  nama: "",
  iata: "",
  aktif: true,
};

function toAirlineForm(airline) {
  if (!airline) return EMPTY_AIRLINE_FORM;
  return {
    mitra: airline.mitra === "Semua Travel" ? "" : airline.mitra,
    nama: airline.nama,
    iata: airline.iata,
    aktif: airline.status !== "Nonaktif",
  };
}

function AirlineFormModal({ open, onOpenChange, airline, onSubmit }) {
  const [form, setForm] = useState(() => toAirlineForm(airline));
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.nama.trim()) {
      setError("Nama maskapai wajib diisi.");
      toast.error("Nama maskapai wajib diisi.");
      return;
    }
    setError("");
    onSubmit({
      ...(airline || { id: `air-${Date.now()}` }),
      nama: form.nama.trim(),
      iata: form.iata.trim().toUpperCase(),
      mitra: form.mitra || "Semua Travel",
      status: form.aktif ? "Aktif" : "Nonaktif",
    });
    if (!airline) setForm(EMPTY_AIRLINE_FORM);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={airline ? "Edit Maskapai" : "Tambah Maskapai"}
      description="Data maskapai digunakan pada jadwal penerbangan paket umrah."
      onSubmit={submit}
      submitLabel={airline ? "Simpan Perubahan" : "Simpan"}
    >
      <div className="space-y-1.5">
        <Label>Mitra Travel</Label>
        <Select value={form.mitra} onValueChange={set("mitra")}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Pilih travel..." />
          </SelectTrigger>
          <SelectContent>
            {TRAVEL_OPTIONS.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">* Kosongkan untuk seluruh travel.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="airline-logo">Logo</Label>
        <Input id="airline-logo" type="file" accept="image/*" className="text-xs" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="airline-nama">Nama</Label>
        <Input
          id="airline-nama"
          value={form.nama}
          aria-invalid={Boolean(error)}
          onChange={(event) => set("nama")(event.target.value)}
          placeholder="Garuda Indonesia"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="airline-iata">Kode IATA</Label>
        <Input
          id="airline-iata"
          maxLength={2}
          value={form.iata}
          onChange={(event) => set("iata")(event.target.value)}
          placeholder="GA"
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <Checkbox checked={form.aktif} onCheckedChange={set("aktif")} />
        Aktifkan
      </label>
    </Modal>
  );
}
