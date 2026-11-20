"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import FilterMultiSelect from "@/components/admin/FilterMultiSelect";
import RowActionsMenu from "@/components/admin/RowActionsMenu";
import StatusBadge from "@/components/admin/StatusBadge";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

const RATING_OPTIONS = ["1", "2", "3", "4", "5"];
const STATUS_OPTIONS = ["Dipublikasikan", "Draf", "Ditolak"];

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

export default function ReviewsClient({ initialReviews }) {
  const router = useRouter();
  const supabase = createClient();
  const [reviews, setReviews] = useState(initialReviews);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratings, setRatings] = useState([]);
  const [status, setStatus] = useState([]);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const rows = reviews.filter((item) => {
    const term = searchTerm.trim().toLowerCase();
    if (
      term &&
      !`${item.jamaah} ${item.travel} ${item.ulasan}`.toLowerCase().includes(term)
    )
      return false;
    if (ratings.length && !ratings.includes(String(item.rating))) return false;
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

  const submitReview = async (item) => {
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("reviews")
          .update(item)
          .eq("id", item.id || editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("reviews")
          .insert([item])
          .select();
        if (error) throw error;
        if (data && data[0]) {
          item = data[0];
        }
      }

      setReviews((prev) => {
        if (editing) {
          return prev.map((row) => (row === editing || row.id === item.id ? item : row));
        }
        return [item, ...prev];
      });

      toast.success(
        editing
          ? `Ulasan ${item.jamaah} berhasil diperbarui.`
          : `Ulasan ${item.jamaah} berhasil ditambahkan.`
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan ulasan.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditing(null);
    }
  };

  const removeReview = async (item) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("reviews")
        .delete()
        .eq("id", item.id);
      if (error) throw error;

      setReviews((prev) => prev.filter((row) => row !== item && row.id !== item.id));
      toast.success(`Ulasan ${item.jamaah} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus ulasan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListPage
        title="Ulasan Pengguna"
        search={{
          placeholder: "Cari isi ulasan jamaah...",
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
              label="Rating"
              options={RATING_OPTIONS}
              value={ratings}
              onChange={setRatings}
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
            key: "jamaah",
            header: "Jamaah",
            cell: (item) => (
              <span className="font-semibold text-foreground">{item.jamaah}</span>
            ),
          },
          { key: "travel", header: "Agensi Travel" },
          { key: "paket", header: "Paket Umrah", cellClassName: "text-muted-foreground" },
          {
            key: "rating",
            header: "Rating",
            csv: (item) => String(item.rating),
            cell: (item) => (
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(item.rating)].map((_, i) => (
                  <Star key={i} className="size-3.5 fill-amber-400 stroke-none" />
                ))}
              </div>
            ),
          },
          {
            key: "ulasan",
            header: "Ulasan Jamaah",
            cellClassName: "max-w-xs truncate",
          },
          {
            key: "status",
            header: "Status",
            cell: (item) => <StatusBadge value={item.status} tone="emerald" />,
          },
          { key: "tanggal", header: "Tanggal", cellClassName: "whitespace-nowrap" },
          {
            key: "aksi",
            header: "Aksi",
            align: "center",
            csv: () => "",
            cell: (item) => (
              <RowActionsMenu
                name={item.jamaah}
                onEdit={() => openEditModal(item)}
                onDelete={() => removeReview(item)}
              />
            ),
          },
        ]}
        rows={rows}
      />

      <ReviewFormModal
        key={editing ? (editing.id || `${editing.jamaah}-${editing.tanggal}`) : "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        review={editing}
        onSubmit={submitReview}
      />
    </>
  );
}

const EMPTY_REVIEW_FORM = {
  jamaah: "",
  travel: "",
  paket: "",
  rating: "5",
  ulasan: "",
  status: STATUS_OPTIONS[0] ?? "Dipublikasikan",
  tanggal: "",
};

function toReviewForm(item) {
  if (!item) return EMPTY_REVIEW_FORM;
  return {
    jamaah: item.jamaah,
    travel: item.travel ?? "",
    paket: item.paket ?? "",
    rating: String(item.rating),
    ulasan: item.ulasan ?? "",
    status: item.status,
    tanggal: item.tanggal ?? "",
  };
}

function ReviewFormModal({ open, onOpenChange, review, onSubmit }) {
  const [form, setForm] = useState(() => toReviewForm(review));
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.jamaah.trim()) {
      setError("Nama jamaah wajib diisi.");
      toast.error("Nama jamaah wajib diisi.");
      return;
    }
    setError("");
    onSubmit({
      ...(review || { id: `rev-${Date.now()}` }),
      jamaah: form.jamaah.trim(),
      travel: form.travel.trim(),
      paket: form.paket.trim(),
      rating: Number(form.rating),
      ulasan: form.ulasan.trim(),
      status: form.status,
      tanggal: form.tanggal.trim(),
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Ulasan"
      description="Kelola ulasan jamaah yang tampil pada halaman publik."
      onSubmit={submit}
      submitLabel="Simpan Perubahan"
    >
      <div className="space-y-1.5">
        <Label htmlFor="ulasan-jamaah">Jamaah *</Label>
        <Input
          id="ulasan-jamaah"
          value={form.jamaah}
          aria-invalid={Boolean(error)}
          onChange={(event) => set("jamaah")(event.target.value)}
          placeholder="Nama jamaah"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="ulasan-travel">Agensi Travel</Label>
          <Input
            id="ulasan-travel"
            value={form.travel}
            onChange={(event) => set("travel")(event.target.value)}
            placeholder="Nama agensi travel"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ulasan-paket">Paket Umrah</Label>
          <Input
            id="ulasan-paket"
            value={form.paket}
            onChange={(event) => set("paket")(event.target.value)}
            placeholder="Nama paket"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Rating</Label>
          <Select value={form.rating} onValueChange={set("rating")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RATING_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option} ★
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
        <div className="space-y-1.5">
          <Label htmlFor="ulasan-tanggal">Tanggal</Label>
          <Input
            id="ulasan-tanggal"
            value={form.tanggal}
            onChange={(event) => set("tanggal")(event.target.value)}
            placeholder="10 Nov 2026"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="ulasan-isi">Ulasan Jamaah</Label>
        <Textarea
          id="ulasan-isi"
          rows={3}
          value={form.ulasan}
          onChange={(event) => set("ulasan")(event.target.value)}
        />
      </div>
    </Modal>
  );
}
