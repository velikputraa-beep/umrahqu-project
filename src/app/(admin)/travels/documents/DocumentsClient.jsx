"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText } from "lucide-react";
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

const JENIS_OPTIONS = ["NPWP Badan Usaha", "NIB (Izin Berusaha)", "SK PPIU Kemenag"];
const STATUS_OPTIONS = ["Menunggu Review", "Terverifikasi"];

const statusTone = {
  Terverifikasi: "emerald",
  "Menunggu Review": "amber",
};

const MONTHS = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, Jun: 5,
  Jul: 6, Agu: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11,
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function parseMasaBerlaku(value) {
  const match = /^(\d{2})\s(\w{3})\s(\d{4})$/.exec(value ?? "");
  if (!match) return null;
  const [, day, month, year] = match;
  const parsed = new Date(Number(year), MONTHS[month], Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function dateToIso(date) {
  if (!date) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function isoToDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso ?? "");
  if (!match) return null;
  const [, year, month, day] = match;
  const parsed = new Date(Number(year), Number(month) - 1, Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function roundTripMasaBerlaku(original, iso) {
  if (!iso) return original ?? "";
  if (original && iso === dateToIso(parseMasaBerlaku(original))) return original;
  const date = isoToDate(iso);
  if (!date) return original ?? "";
  return `${String(date.getDate()).padStart(2, "0")} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export default function DocumentsClient({ initialDocuments }) {
  const router = useRouter();
  const supabase = createClient();
  const [documents, setDocuments] = useState(initialDocuments);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [jenis, setJenis] = useState([]);
  const [status, setStatus] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const statusBerlakuOptions = useMemo(
    () => [...new Set(documents.map((doc) => doc.statusBerlaku))],
    [documents]
  );

  const rows = documents.filter((doc) => {
    const term = searchTerm.trim().toLowerCase();
    if (
      term &&
      !`${doc.agensi} ${doc.nomor} ${doc.jenis}`.toLowerCase().includes(term)
    ) {
      return false;
    }
    if (jenis.length && !jenis.includes(doc.jenis)) return false;
    if (status.length && !status.includes(doc.status)) return false;
    return true;
  });

  const openEditModal = (doc) => {
    setEditing(doc);
    setModalOpen(true);
  };

  const submitDocument = async (doc) => {
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("documents")
          .update(doc)
          .eq("id", doc.id || editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("documents")
          .insert([doc])
          .select();
        if (error) throw error;
        if (data && data[0]) {
          doc = data[0];
        }
      }

      setDocuments((prev) => {
        if (editing) {
          return prev.map((item) => (item === editing || item.id === doc.id ? doc : item));
        }
        return [doc, ...prev];
      });

      toast.success(`Dokumen ${doc.jenis} ${doc.agensi} berhasil disimpan.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan dokumen.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditing(null);
    }
  };

  const removeDocument = async (doc) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", doc.id);
      if (error) throw error;

      setDocuments((prev) => prev.filter((item) => item !== doc && item.id !== doc.id));
      toast.success(`Dokumen ${doc.jenis} ${doc.agensi} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus dokumen.");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { title: "Total Dokumen", value: String(documents.length), badge: "Dokumen", tone: "neutral" },
    {
      title: "Menunggu Review",
      value: String(documents.filter((doc) => doc.status === "Menunggu Review").length),
      badge: "Review",
      tone: "amber",
    },
    {
      title: "Terverifikasi",
      value: String(documents.filter((doc) => doc.status === "Terverifikasi").length),
      badge: "Sah",
      tone: "emerald",
    },
    {
      title: "Kedaluwarsa / Perlu Perhatian",
      value: String(documents.filter((doc) => doc.statusBerlaku === "Kedaluwarsa").length),
      badge: "Perhatian",
      tone: "red",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="rounded-xl border border-border bg-card p-5 shadow-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
              <StatusBadge value={stat.badge} tone={stat.tone} />
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      <ListPage
        title="Manajemen Dokumen Legalitas Travel"
        search={{
          placeholder: "Cari travel atau nomor SK/dokumen...",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        filters={
          <>
            <FilterMultiSelect
              label="Jenis Dokumen"
              options={JENIS_OPTIONS}
              value={jenis}
              onChange={setJenis}
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
            key: "agensi",
            header: "Agensi Travel",
            cell: (doc) => (
              <div>
                <div className="font-medium text-foreground">{doc.agensi}</div>
                <div className="font-mono text-[11px] text-muted-foreground">
                  {doc.subdomain}
                </div>
              </div>
            ),
          },
          {
            key: "jenis",
            header: "Jenis Dokumen",
            cell: (doc) => (
              <StatusBadge value={doc.jenis} tone="neutral" />
            ),
          },
          {
            key: "nomor",
            header: "Nomor Dokumen",
            cellClassName: "whitespace-nowrap",
            cell: (doc) => (
              <span className="font-mono text-muted-foreground">{doc.nomor}</span>
            ),
          },
          {
            key: "berkas",
            header: "Berkas",
            cell: (doc) =>
              doc.berkas ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-sky-400 hover:text-sky-300"
                >
                  <FileText className="size-3.5" />
                  {doc.berkas}
                </Button>
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
          {
            key: "masaBerlaku",
            header: "Masa Berlaku",
            cell: (doc) => (
              <div className="space-y-1">
                <div className="text-foreground">{doc.masaBerlaku}</div>
                <StatusBadge value={doc.statusBerlaku} />
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            cell: (doc) => (
              <StatusBadge value={doc.status} tone={statusTone[doc.status]} />
            ),
          },
          {
            key: "aksi",
            header: "Aksi",
            align: "center",
            csv: () => "",
            cell: (doc) => (
              <RowActionsMenu
                name={`${doc.jenis} ${doc.agensi}`}
                onEdit={() => openEditModal(doc)}
                onDelete={() => removeDocument(doc)}
              />
            ),
          },
        ]}
        rows={rows}
      />

      <DocumentFormModal
        key={editing ? (editing.id || `${editing.agensi}|${editing.jenis}|${editing.nomor}`) : "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        doc={editing}
        statusBerlakuOptions={statusBerlakuOptions}
        onSubmit={submitDocument}
      />
    </div>
  );
}

const EMPTY_DOCUMENT_FORM = {
  agensi: "",
  subdomain: "",
  jenis: "NPWP Badan Usaha",
  nomor: "",
  masaBerlaku: "",
  statusBerlaku: "Verifikasi",
  status: "Menunggu Review",
};

function toDocumentForm(doc) {
  if (!doc) {
    return EMPTY_DOCUMENT_FORM;
  }
  return {
    agensi: doc.agensi,
    subdomain: doc.subdomain,
    jenis: doc.jenis,
    nomor: doc.nomor,
    masaBerlaku: dateToIso(parseMasaBerlaku(doc.masaBerlaku)),
    statusBerlaku: doc.statusBerlaku,
    status: doc.status,
  };
}

function DocumentFormModal({ open, onOpenChange, doc, statusBerlakuOptions, onSubmit }) {
  const [form, setForm] = useState(() => toDocumentForm(doc));
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.agensi.trim()) {
      setError("Nama agensi travel wajib diisi.");
      toast.error("Nama agensi travel wajib diisi.");
      return;
    }
    setError("");
    onSubmit({
      ...(doc || { id: `doc-${Date.now()}` }),
      agensi: form.agensi.trim(),
      subdomain: form.subdomain,
      jenis: form.jenis,
      nomor: form.nomor,
      masaBerlaku: roundTripMasaBerlaku(doc?.masaBerlaku, form.masaBerlaku),
      statusBerlaku: form.statusBerlaku,
      status: form.status,
    });
    if (!doc) setForm(EMPTY_DOCUMENT_FORM);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={doc ? "Edit Dokumen" : "Tambah Dokumen"}
      description="Dokumen legalitas travel agency untuk proses verifikasi."
      onSubmit={submit}
      submitLabel={doc ? "Simpan Perubahan" : "Simpan Dokumen"}
    >
      <div className="space-y-1.5">
        <Label htmlFor="doc-agensi">Agensi Travel *</Label>
        <Input
          id="doc-agensi"
          value={form.agensi}
          aria-invalid={Boolean(error)}
          onChange={(event) => set("agensi")(event.target.value)}
          placeholder="Nama agensi travel"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="doc-subdomain">Subdomain</Label>
        <Input
          id="doc-subdomain"
          value={form.subdomain}
          onChange={(event) => set("subdomain")(event.target.value)}
          placeholder="nama-travel.umrohq.com"
          className="font-mono"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Jenis Dokumen</Label>
          <Select value={form.jenis} onValueChange={set("jenis")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {JENIS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="doc-nomor">Nomor Dokumen</Label>
          <Input
            id="doc-nomor"
            value={form.nomor}
            onChange={(event) => set("nomor")(event.target.value)}
            placeholder="Nomor SK / dokumen"
            className="font-mono"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="doc-masa-berlaku">Masa Berlaku</Label>
          <Input
            id="doc-masa-berlaku"
            type="date"
            value={form.masaBerlaku}
            onChange={(event) => set("masaBerlaku")(event.target.value)}
          />
          {doc && !dateToIso(parseMasaBerlaku(doc.masaBerlaku)) && (
            <p className="text-xs text-muted-foreground">
              Saat ini &ldquo;{doc.masaBerlaku}&rdquo;. Pilih tanggal untuk menggantinya.
            </p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Status Berlaku</Label>
          <Select value={form.statusBerlaku} onValueChange={set("statusBerlaku")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusBerlakuOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Status Review</Label>
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
    </Modal>
  );
}
