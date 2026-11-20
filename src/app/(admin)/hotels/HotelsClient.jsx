"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
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

const TRAVEL_OPTIONS = [
  "Semua Travel",
  "An-Nahl",
  "Batik Travel",
  "PT. Al Dawood Barokah",
  "PT. Fio Amanah Perdana",
];

const KOTA_OPTIONS = ["Makkah", "Madinah", "Jeddah", "Thaif"];
const BINTANG_OPTIONS = [3, 4, 5];

export default function HotelsClient({ initialHotels }) {
  const router = useRouter();
  const supabase = createClient();
  const [hotels, setHotels] = useState(initialHotels);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [kota, setKota] = useState([]);
  const [bintang, setBintang] = useState([]);
  const [status, setStatus] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const rows = hotels.filter((hotel) => {
    const term = searchTerm.trim().toLowerCase();
    if (term && !`${hotel.nama} ${hotel.mitra}`.toLowerCase().includes(term)) return false;
    if (kota.length && !kota.includes(hotel.kota)) return false;
    if (bintang.length && !bintang.includes(String(hotel.bintang))) return false;
    if (status.length && !status.includes(hotel.status)) return false;
    return true;
  });

  const openAddModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEditModal = (hotel) => {
    setEditing(hotel);
    setModalOpen(true);
  };

  const submitHotel = async (hotel) => {
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("hotels")
          .update(hotel)
          .eq("id", hotel.id || editing.id);
        if (error) throw error;
        setHotels((prev) => prev.map((item) => (item === editing ? hotel : item)));
        toast.success(`Hotel ${hotel.nama} berhasil diperbarui.`);
      } else {
        const { data, error } = await supabase
          .from("hotels")
          .insert([hotel])
          .select();
        if (error) throw error;
        const created = data && data[0] ? data[0] : hotel;
        setHotels((prev) => [created, ...prev]);
        toast.success(`Hotel ${hotel.nama} berhasil ditambahkan.`);
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan hotel.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditing(null);
    }
  };

  const removeHotel = async (hotel) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("hotels")
        .delete()
        .eq("id", hotel.id);
      if (error) throw error;
      setHotels((prev) => prev.filter((item) => item !== hotel));
      toast.success(`Hotel ${hotel.nama} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus hotel.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListPage
        title="Hotel"
        actions={
          <Button size="sm" onClick={openAddModal} disabled={loading}>
            <Plus className="size-3.5" />
            Tambah Hotel
          </Button>
        }
        search={{
          placeholder: "Cari nama hotel...",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        filters={
          <>
            <FilterMultiSelect label="Kota" options={KOTA_OPTIONS} value={kota} onChange={setKota} />
            <FilterMultiSelect
              label="Bintang"
              options={BINTANG_OPTIONS.map(String)}
              value={bintang}
              onChange={setBintang}
            />
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
            header: "Hotel",
            cell: (hotel) => (
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                  <Building2 className="size-4 text-muted-foreground" />
                </div>
                <span className="font-medium text-foreground">{hotel.nama}</span>
              </div>
            ),
          },
          { key: "kota", header: "Kota" },
          {
            key: "bintang",
            header: "Bintang",
            align: "center",
            cell: (hotel) => (
              <span className="inline-flex items-center gap-0.5 font-medium text-amber-400">
                {hotel.bintang}
                <Star className="size-3 fill-amber-400 stroke-none" />
              </span>
            ),
          },
          { key: "mitra", header: "Mitra Travel" },
          {
            key: "status",
            header: "Status",
            cell: (hotel) => <StatusBadge value={hotel.status} />,
          },
          {
            key: "aksi",
            header: "Aksi",
            align: "center",
            csv: () => "",
            cell: (hotel) => (
              <RowActionsMenu
                name={hotel.nama}
                onEdit={() => openEditModal(hotel)}
                onDelete={() => removeHotel(hotel)}
              />
            ),
          },
        ]}
        rows={rows}
      />

      <HotelFormModal
        key={editing ? editing.nama : "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        hotel={editing}
        onSubmit={submitHotel}
      />
    </>
  );
}

const EMPTY_HOTEL_FORM = {
  mitra: "Semua Travel",
  nama: "",
  kota: "Makkah",
  bintang: "4",
  jarak: "",
  alamat: "",
  fasilitas: [],
  catatanLokasi: "",
  catatanKonsumsi: "",
  aktif: true,
};

function toHotelForm(hotel) {
  if (!hotel) return EMPTY_HOTEL_FORM;
  return {
    mitra: hotel.mitra,
    nama: hotel.nama,
    kota: hotel.kota,
    bintang: String(hotel.bintang),
    jarak: hotel.jarak ?? "",
    alamat: hotel.alamat ?? "",
    fasilitas: hotel.fasilitas ?? [],
    catatanLokasi: hotel.catatanLokasi ?? "",
    catatanKonsumsi: hotel.catatanKonsumsi ?? "",
    aktif: hotel.status !== "Nonaktif",
  };
}

function HotelFormModal({ open, onOpenChange, hotel, onSubmit }) {
  const [form, setForm] = useState(() => toHotelForm(hotel));
  const [facilityDraft, setFacilityDraft] = useState("");
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const addFacility = () => {
    const value = facilityDraft.trim();
    if (!value) return;
    set("fasilitas")([...form.fasilitas, value]);
    setFacilityDraft("");
  };

  const submit = (event) => {
    event.preventDefault();
    if (!form.nama.trim()) {
      setError("Nama hotel wajib diisi.");
      toast.error("Nama hotel wajib diisi.");
      return;
    }
    setError("");
    onSubmit({
      ...(hotel || { id: `htl-${Date.now()}` }),
      nama: form.nama.trim(),
      kota: form.kota,
      bintang: Number(form.bintang),
      mitra: form.mitra,
      jarak: form.jarak,
      alamat: form.alamat,
      fasilitas: form.fasilitas,
      catatanLokasi: form.catatanLokasi,
      catatanKonsumsi: form.catatanKonsumsi,
      status: form.aktif ? "Aktif" : "Nonaktif",
    });
    if (!hotel) setForm(EMPTY_HOTEL_FORM);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={hotel ? "Edit Hotel" : "Tambah Hotel"}
      description="Data hotel digunakan pada paket umrah dan jadwal inap jamaah."
      onSubmit={submit}
      submitLabel={hotel ? "Simpan Perubahan" : "Simpan Hotel"}
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
        <Label htmlFor="hotel-nama">Hotel *</Label>
        <Input
          id="hotel-nama"
          value={form.nama}
          aria-invalid={Boolean(error)}
          onChange={(event) => set("nama")(event.target.value)}
          placeholder="Nama hotel"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Kota</Label>
          <Select value={form.kota} onValueChange={set("kota")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KOTA_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Bintang</Label>
          <Select value={form.bintang} onValueChange={set("bintang")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BINTANG_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}★
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hotel-jarak">Jarak ke Masjid</Label>
          <Input
            id="hotel-jarak"
            type="number"
            value={form.jarak}
            onChange={(event) => set("jarak")(event.target.value)}
            placeholder="150"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hotel-alamat">Alamat</Label>
        <Textarea
          id="hotel-alamat"
          rows={2}
          value={form.alamat}
          onChange={(event) => set("alamat")(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Fasilitas</Label>
        <div className="flex gap-2">
          <Input
            value={facilityDraft}
            onChange={(event) => setFacilityDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addFacility();
              }
            }}
            placeholder="Tambah fasilitas lain..."
          />
          <Button type="button" variant="outline" size="sm" onClick={addFacility}>
            Tambah
          </Button>
        </div>
        {form.fasilitas.length > 0 && (
          <ul className="flex flex-wrap gap-1.5">
            {form.fasilitas.map((facility, index) => (
              <li
                key={`${facility}-${index}`}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs"
              >
                {facility}
                <button
                  type="button"
                  aria-label={`Hapus ${facility}`}
                  onClick={() => set("fasilitas")(form.fasilitas.filter((_, i) => i !== index))}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="hotel-catatan-lokasi">Catatan Lokasi</Label>
          <Textarea
            id="hotel-catatan-lokasi"
            rows={2}
            value={form.catatanLokasi}
            onChange={(event) => set("catatanLokasi")(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="hotel-catatan-konsumsi">Catatan Konsumsi</Label>
          <Textarea
            id="hotel-catatan-konsumsi"
            rows={2}
            value={form.catatanKonsumsi}
            onChange={(event) => set("catatanKonsumsi")(event.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="hotel-berkas">Berkas</Label>
        <Input id="hotel-berkas" type="file" className="text-xs" />
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <Checkbox checked={form.aktif} onCheckedChange={set("aktif")} />
        Aktifkan
      </label>
    </Modal>
  );
}
