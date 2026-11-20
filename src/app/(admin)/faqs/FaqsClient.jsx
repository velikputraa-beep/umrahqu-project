"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, GripVertical, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import StatusBadge from "@/components/admin/StatusBadge";
import FilterMultiSelect from "@/components/admin/FilterMultiSelect";
import RowActionsMenu from "@/components/admin/RowActionsMenu";
import { cn } from "cn";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

const KATEGORI_OPTIONS = ["Umum", "Paket", "Dokumen", "Pembayaran"];

const kategoriTone = { Paket: "sky", Dokumen: "amber" };
const statusTone = { Disetujui: "emerald", Menunggu: "amber" };

export default function FaqsClient({ initialFaqs }) {
  const router = useRouter();
  const supabase = createClient();
  const [faqs, setFaqs] = useState(initialFaqs);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [kategori, setKategori] = useState([]);
  const [status, setStatus] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const statusOptions = [...new Set(faqs.map((faq) => faq.status))];

  const rows = faqs.filter((faq) => {
    const term = searchTerm.trim().toLowerCase();
    if (term && !faq.pertanyaan.toLowerCase().includes(term)) return false;
    if (kategori.length && !kategori.includes(faq.kategori)) return false;
    if (status.length && !status.includes(faq.status)) return false;
    return true;
  });

  const toggleHomepage = async (id) => {
    const target = faqs.find((f) => f.id === id);
    if (!target) return;
    const newHomepage = !target.isHomepage;

    try {
      const { error } = await supabase
        .from("faqs")
        .update({ is_homepage: newHomepage })
        .eq("id", id);
      if (error) throw error;

      setFaqs((prev) =>
        prev.map((faq) => (faq.id === id ? { ...faq, isHomepage: newHomepage } : faq))
      );
      toast.success("Pengaturan halaman utama diperbarui.");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal memperbarui status beranda.");
    }
  };

  const openAddModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEditModal = (faq) => {
    setEditing(faq);
    setModalOpen(true);
  };

  const submitFaq = async (faq) => {
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("faqs")
          .update(faq)
          .eq("id", faq.id || editing.id);
        if (error) throw error;

        setFaqs((prev) => prev.map((item) => (item === editing || item.id === faq.id ? faq : item)));
        toast.success("FAQ berhasil diperbarui.");
      } else {
        const id = Math.max(0, ...faqs.map((item) => Number(item.id) || 0)) + 1;
        const newFaq = { ...faq, id, no: `#${id}` };

        const { data, error } = await supabase
          .from("faqs")
          .insert([newFaq])
          .select();
        if (error) throw error;

        setFaqs((prev) => [data && data[0] ? data[0] : newFaq, ...prev]);
        toast.success("FAQ berhasil ditambahkan.");
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan FAQ.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditing(null);
    }
  };

  const removeFaq = async (faq) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("faqs")
        .delete()
        .eq("id", faq.id);
      if (error) throw error;

      setFaqs((prev) => prev.filter((item) => item !== faq && item.id !== faq.id));
      toast.success(`FAQ ${faq.no} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus FAQ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListPage
        title="FAQ"
        actions={
          <Button size="sm" onClick={openAddModal} disabled={loading}>
            <Plus className="size-3.5" />
            Tambah FAQ
          </Button>
        }
        search={{
          placeholder: "Cari pertanyaan...",
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
              options={statusOptions}
              value={status}
              onChange={setStatus}
            />
          </>
        }
        columns={[
          {
            key: "urutan",
            header: "Urutan",
            align: "center",
            csv: () => "",
            cell: () => (
              <div className="flex items-center justify-center gap-0.5 text-muted-foreground">
                <GripVertical className="size-3.5 cursor-grab" />
                <div className="flex flex-col">
                  <ChevronUp className="size-2.5 cursor-pointer" />
                  <ChevronDown className="size-2.5 cursor-pointer" />
                </div>
              </div>
            ),
          },
          {
            key: "no",
            header: "No.",
            cell: (faq) => <span className="font-mono text-muted-foreground">{faq.no}</span>,
          },
          {
            key: "pertanyaan",
            header: "Pertanyaan",
            cellClassName: "max-w-md",
            cell: (faq) => <span className="font-medium text-foreground">{faq.pertanyaan}</span>,
          },
          {
            key: "kategori",
            header: "Kategori",
            cell: (faq) => (
              <StatusBadge value={faq.kategori} tone={kategoriTone[faq.kategori] ?? "neutral"} />
            ),
          },
          {
            key: "status",
            header: "Status",
            cell: (faq) => <StatusBadge value={faq.status} tone={statusTone[faq.status]} />,
          },
          {
            key: "halaman",
            header: "Halaman Utama",
            align: "center",
            csv: (faq) => (faq.isHomepage ? "Ya" : "Tidak"),
            cell: (faq) => (
              <button
                type="button"
                role="switch"
                aria-checked={faq.isHomepage}
                aria-label={`Tampilkan ${faq.no} di halaman utama`}
                onClick={() => toggleHomepage(faq.id)}
                className={cn(
                  "inline-block w-9 rounded-full p-0.5 transition-colors",
                  faq.isHomepage ? "bg-primary" : "bg-muted"
                )}
              >
                <span
                  className={cn(
                    "block size-4 rounded-full bg-white transition-transform",
                    faq.isHomepage && "translate-x-4"
                  )}
                />
              </button>
            ),
          },
          {
            key: "aksi",
            header: "Aksi",
            align: "center",
            csv: () => "",
            cell: (faq) => (
              <RowActionsMenu
                name={faq.pertanyaan}
                onEdit={() => openEditModal(faq)}
                onDelete={() => removeFaq(faq)}
              />
            ),
          },
        ]}
        rows={rows}
      />

      <FaqFormModal
        key={editing ? (editing.id || editing.no) : "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        faq={editing}
        onSubmit={submitFaq}
      />
    </>
  );
}

const EMPTY_FAQ_FORM = {
  pertanyaan: "",
  jawaban: "",
  jawabanPendukung: "",
  kategori: "Umum",
  urutan: 0,
  tampilkanBeranda: false,
};

function toFaqForm(faq) {
  if (!faq) return EMPTY_FAQ_FORM;
  return {
    pertanyaan: faq.pertanyaan,
    jawaban: faq.jawaban ?? "",
    jawabanPendukung: faq.jawabanPendukung ?? "",
    kategori: faq.kategori,
    urutan: faq.urutan ?? 0,
    tampilkanBeranda: Boolean(faq.isHomepage),
  };
}

function FaqFormModal({ open, onOpenChange, faq, onSubmit }) {
  const [form, setForm] = useState(() => toFaqForm(faq));
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.pertanyaan.trim()) {
      setError("Pertanyaan wajib diisi.");
      toast.error("Pertanyaan wajib diisi.");
      return;
    }
    setError("");
    onSubmit({
      ...faq,
      pertanyaan: form.pertanyaan.trim(),
      kategori: form.kategori,
      status: faq ? faq.status : "Disetujui",
      isHomepage: form.tampilkanBeranda,
    });
    if (!faq) setForm(EMPTY_FAQ_FORM);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={faq ? "Edit FAQ" : "Tambah FAQ"}
      description="Pertanyaan yang muncul pada halaman bantuan dan beranda."
      onSubmit={submit}
      submitLabel={faq ? "Simpan Perubahan" : "Tambah"}
    >
      <div className="space-y-1.5">
        <Label htmlFor="faq-pertanyaan">Pertanyaan *</Label>
        <Textarea
          id="faq-pertanyaan"
          rows={2}
          value={form.pertanyaan}
          aria-invalid={Boolean(error)}
          onChange={(event) => set("pertanyaan")(event.target.value)}
          placeholder="Contoh: Bagaimana cara membatalkan pesanan?"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="faq-jawaban">Jawaban</Label>
        <Textarea
          id="faq-jawaban"
          rows={3}
          value={form.jawaban}
          onChange={(event) => set("jawaban")(event.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="faq-jawaban-pendukung">Jawaban Pendukung</Label>
        <Textarea
          id="faq-jawaban-pendukung"
          rows={2}
          value={form.jawabanPendukung}
          onChange={(event) => set("jawabanPendukung")(event.target.value)}
        />
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
          <Label htmlFor="faq-urutan">Urutan</Label>
          <Input
            id="faq-urutan"
            type="number"
            min={0}
            value={form.urutan}
            onChange={(event) => set("urutan")(Number(event.target.value) || 0)}
          />
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <Checkbox
          checked={form.tampilkanBeranda}
          onCheckedChange={set("tampilkanBeranda")}
        />
        Tampilkan di Halaman Utama
      </label>
    </Modal>
  );
}
