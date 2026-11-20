"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const STATS = [
  { title: "Menunggu Verifikasi", value: "2" },
  { title: "Peringatan Rekening", value: "1" },
  { title: "Terverifikasi", value: "8" },
  { title: "Ditolak / Expired", value: "0" },
];

const statusTone = {
  Aktif: "emerald",
  Terverifikasi: "emerald",
  "Menunggu Verifikasi": "amber",
  Ditolak: "red",
  Kedaluwarsa: "red",
};

export default function RegistrationsClient({ initialSubmissions }) {
  const router = useRouter();
  const supabase = createClient();
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const statusOptions = useMemo(
    () => [...new Set(submissions.map((item) => item.status))],
    [submissions]
  );

  const rows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return submissions.filter((item) => {
      if (term && !`${item.nama} ${item.pt} ${item.ppiu}`.toLowerCase().includes(term)) {
        return false;
      }
      if (statuses.length && !statuses.includes(item.status)) return false;
      return true;
    });
  }, [submissions, searchTerm, statuses]);

  const openEditModal = (submission) => {
    setEditing(submission);
    setModalOpen(true);
  };

  const submitRegistration = async (submission) => {
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("registrations")
          .update(submission)
          .eq("id", submission.id || editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("registrations")
          .insert([submission])
          .select();
        if (error) throw error;
        if (data && data[0]) {
          submission = data[0];
        }
      }

      setSubmissions((prev) => {
        if (editing) {
          return prev.map((item) => (item === editing || item.id === submission.id ? submission : item));
        }
        return [submission, ...prev];
      });

      toast.success(
        editing
          ? `Pengajuan ${submission.nama} berhasil diperbarui.`
          : `Pengajuan ${submission.nama} berhasil ditambahkan.`
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan pengajuan.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditing(null);
    }
  };

  const removeRegistration = async (submission) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("registrations")
        .delete()
        .eq("id", submission.id);
      if (error) throw error;

      setSubmissions((prev) => prev.filter((item) => item !== submission && item.id !== submission.id));
      toast.success(`Pengajuan ${submission.nama} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus pengajuan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border border-border bg-card p-5 shadow-xs transition-colors hover:border-primary/40"
          >
            <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
            <div className="mt-3 text-2xl font-bold tracking-tight text-foreground">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <ListPage
        title="Pengajuan Travel"
        search={{
          placeholder: "Cari nama travel, nama PT resmi, nomor PPIU...",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        filters={
          <FilterMultiSelect
            label="Status"
            options={statusOptions}
            value={statuses}
            onChange={setStatuses}
          />
        }
        columns={[
          {
            key: "nama",
            header: "Travel",
            cell: (item) => (
              <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-xs font-bold text-amber-500">
                  {item.nama.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-medium text-foreground">{item.nama}</div>
                  <div className="text-[11px] text-muted-foreground">{item.pt}</div>
                </div>
              </div>
            ),
          },
          {
            key: "ppiu",
            header: "PPIU",
            cell: (item) => (
              <div>
                <div className="font-medium text-foreground">{item.ppiu}</div>
                <div className="text-[10px] text-muted-foreground">{item.ppiuExp}</div>
              </div>
            ),
          },
          {
            key: "rekening",
            header: "Rekening",
            cellClassName: "font-mono",
          },
          {
            key: "status",
            header: "Status",
            cell: (item) => <StatusBadge value={item.status} tone={statusTone[item.status]} />,
          },
          {
            key: "email",
            header: "Kontak",
            cell: (item) => (
              <div>
                <div className="text-foreground">{item.email}</div>
                <div className="text-[11px] text-muted-foreground">{item.telp}</div>
              </div>
            ),
          },
          {
            key: "tanggal",
            header: "Pengajuan",
            cell: (item) => (
              <div className="flex items-center justify-between gap-2">
                <span className="whitespace-nowrap text-muted-foreground">{item.tanggal}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Tinjau pengajuan ${item.nama}`}
                >
                  <ArrowUpRight className="size-4" />
                </Button>
              </div>
            ),
          },
          {
            key: "aksi",
            header: "Aksi",
            align: "center",
            csv: () => "",
            cell: (item) => (
              <RowActionsMenu
                name={item.nama}
                onEdit={() => openEditModal(item)}
                onDelete={() => removeRegistration(item)}
              />
            ),
          },
        ]}
        rows={rows}
      />

      <RegistrationFormModal
        key={editing ? (editing.id || editing.nama) : "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        submission={editing}
        statusOptions={statusOptions}
        onSubmit={submitRegistration}
      />
    </div>
  );
}

const EMPTY_REGISTRATION_FORM = {
  nama: "",
  pt: "",
  ppiu: "",
  email: "",
  telp: "",
  status: "Aktif",
};

function toRegistrationForm(submission) {
  if (!submission) return EMPTY_REGISTRATION_FORM;
  return {
    nama: submission.nama,
    pt: submission.pt,
    ppiu: submission.ppiu,
    email: submission.email,
    telp: submission.telp,
    status: submission.status,
  };
}

function RegistrationFormModal({ open, onOpenChange, submission, statusOptions, onSubmit }) {
  const [form, setForm] = useState(() => toRegistrationForm(submission));
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
      ...(submission || { id: `reg-${Date.now()}` }),
      nama: form.nama.trim(),
      pt: form.pt,
      ppiu: form.ppiu,
      email: form.email,
      telp: form.telp,
      status: form.status,
    });
    if (!submission) setForm(EMPTY_REGISTRATION_FORM);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={submission ? "Edit Pengajuan Travel" : "Tambah Pengajuan Travel"}
      description="Data pengajuan pendaftaran travel agency."
      onSubmit={submit}
      submitLabel={submission ? "Simpan Perubahan" : "Simpan Pengajuan"}
    >
      <div className="space-y-1.5">
        <Label htmlFor="reg-nama">Nama Travel *</Label>
        <Input
          id="reg-nama"
          value={form.nama}
          aria-invalid={Boolean(error)}
          onChange={(event) => set("nama")(event.target.value)}
          placeholder="Nama travel"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="reg-pt">Nama PT</Label>
        <Input
          id="reg-pt"
          value={form.pt}
          onChange={(event) => set("pt")(event.target.value)}
          placeholder="PT. Nama Resmi Internasional"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="reg-ppiu">PPIU</Label>
          <Input
            id="reg-ppiu"
            value={form.ppiu}
            onChange={(event) => set("ppiu")(event.target.value)}
            placeholder="PPIU-d582/2023"
            className="font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Status</Label>
          <Select value={form.status} onValueChange={set("status")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="reg-email">Email</Label>
          <Input
            id="reg-email"
            type="email"
            value={form.email}
            onChange={(event) => set("email")(event.target.value)}
            placeholder="email@gmail.com"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reg-telp">Telepon</Label>
          <Input
            id="reg-telp"
            value={form.telp}
            onChange={(event) => set("telp")(event.target.value)}
            placeholder="021xxxxxxx"
          />
        </div>
      </div>
    </Modal>
  );
}
