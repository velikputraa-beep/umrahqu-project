"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react";
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

const TEMA_OPTIONS = ["Elegant", "Modern"];

export default function WebsitesClient({ initialWebsites }) {
  const router = useRouter();
  const supabase = createClient();
  const [websites, setWebsites] = useState(initialWebsites);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tema, setTema] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const modeOptions = useMemo(
    () => [...new Set(websites.map((website) => website.modePemeliharaan))],
    [websites]
  );

  const rows = websites.filter((website) => {
    const term = searchTerm.trim().toLowerCase();
    if (
      term &&
      !`${website.nama} ${website.subdomain} ${website.customDomain}`
        .toLowerCase()
        .includes(term)
    ) {
      return false;
    }
    if (tema.length && !tema.includes(website.tema)) return false;
    return true;
  });

  const openEditModal = (website) => {
    setEditing(website);
    setModalOpen(true);
  };

  const submitWebsite = async (website) => {
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("websites")
          .update(website)
          .eq("id", website.id || editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("websites")
          .insert([website])
          .select();
        if (error) throw error;
        if (data && data[0]) {
          website = data[0];
        }
      }

      setWebsites((prev) => {
        if (editing) {
          return prev.map((item) => (item === editing || item.id === website.id ? website : item));
        }
        return [website, ...prev];
      });

      toast.success(
        editing
          ? `Website ${website.nama} berhasil diperbarui.`
          : `Website ${website.nama} berhasil ditambahkan.`
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan website.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditing(null);
    }
  };

  const removeWebsite = async (website) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("websites")
        .delete()
        .eq("id", website.id);
      if (error) throw error;

      setWebsites((prev) => prev.filter((item) => item !== website && item.id !== website.id));
      toast.success(`Website ${website.nama} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus website.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListPage
        title="Kelola Website Travel"
        search={{
          placeholder: "Cari nama travel, subdomain, atau domain...",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        filters={
          <FilterMultiSelect
            label="Template Tema"
            options={TEMA_OPTIONS}
            value={tema}
            onChange={setTema}
          />
        }
        columns={[
          {
            key: "nama",
            header: "Agensi Travel",
            cell: (website) => (
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${website.color}`}
                >
                  {website.initial || website.nama?.substring(0, 2).toUpperCase()}
                </div>
                <span className="font-medium text-foreground">{website.nama}</span>
              </div>
            ),
          },
          {
            key: "subdomain",
            header: "Subdomain Platform",
            cell: (website) => (
              <a
                href={`https://${website.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-mono text-sky-400 hover:text-sky-300 hover:underline"
              >
                <Globe className="size-3.5" />
                {website.subdomain}
              </a>
            ),
          },
          {
            key: "customDomain",
            header: "Custom Domain",
            cell: (website) => (
              <StatusBadge
                value={website.customDomain}
                tone={website.customDomain === "Belum Diatur" ? "neutral" : "emerald"}
              />
            ),
          },
          {
            key: "tema",
            header: "Template Tema",
            cell: (website) => (
              <div className="space-y-1">
                <div className="font-medium text-foreground">{website.tema}</div>
                <StatusBadge value={website.temaBadge || "Standar"} tone="neutral" />
              </div>
            ),
          },
          {
            key: "modePemeliharaan",
            header: "Mode Pemeliharaan",
            cell: (website) => (
              <div className="flex items-center gap-2">
                <span className="inline-flex h-4 w-8 items-center rounded-full bg-emerald-600 p-0.5">
                  <span className="ms-auto size-3 rounded-full bg-white shadow-xs" />
                </span>
                <span className="text-[11px] font-medium text-emerald-400">
                  {website.modePemeliharaan}
                </span>
              </div>
            ),
          },
          {
            key: "aksi",
            header: "Aksi",
            align: "center",
            csv: () => "",
            cell: (website) => (
              <RowActionsMenu
                name={website.nama}
                onEdit={() => openEditModal(website)}
                onDelete={() => removeWebsite(website)}
              />
            ),
          },
        ]}
        rows={rows}
      />

      <WebsiteFormModal
        key={editing ? (editing.id || editing.subdomain) : "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        website={editing}
        modeOptions={modeOptions}
        onSubmit={submitWebsite}
      />
    </>
  );
}

const EMPTY_WEBSITE_FORM = {
  nama: "",
  subdomain: "",
  customDomain: "Belum Diatur",
  tema: "Elegant",
  modePemeliharaan: "Online",
};

function toWebsiteForm(website) {
  if (!website) return EMPTY_WEBSITE_FORM;
  return {
    nama: website.nama,
    subdomain: website.subdomain,
    customDomain: website.customDomain,
    tema: website.tema,
    modePemeliharaan: website.modePemeliharaan,
  };
}

function WebsiteFormModal({ open, onOpenChange, website, modeOptions, onSubmit }) {
  const [form, setForm] = useState(() => toWebsiteForm(website));
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.nama.trim()) {
      setError("Nama agensi travel wajib diisi.");
      toast.error("Nama agensi travel wajib diisi.");
      return;
    }
    setError("");
    const customDomain = form.customDomain.trim() || "Belum Diatur";
    onSubmit({
      ...(website || { id: `web-${Date.now()}` }),
      nama: form.nama.trim(),
      subdomain: form.subdomain.trim(),
      customDomain,
      tema: form.tema,
      modePemeliharaan: form.modePemeliharaan,
    });
    if (!website) setForm(EMPTY_WEBSITE_FORM);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={website ? "Edit Website" : "Tambah Website"}
      description="Pengaturan website travel agency pada platform."
      onSubmit={submit}
      submitLabel={website ? "Simpan Perubahan" : "Simpan Website"}
    >
      <div className="space-y-1.5">
        <Label htmlFor="web-nama">Agensi Travel *</Label>
        <Input
          id="web-nama"
          value={form.nama}
          aria-invalid={Boolean(error)}
          onChange={(event) => set("nama")(event.target.value)}
          placeholder="Nama agensi travel"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="web-subdomain">Subdomain Platform</Label>
        <Input
          id="web-subdomain"
          value={form.subdomain}
          onChange={(event) => set("subdomain")(event.target.value)}
          placeholder="nama-travel.umrohq.com"
          className="font-mono"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="web-custom-domain">Custom Domain</Label>
        <Input
          id="web-custom-domain"
          value={form.customDomain}
          onChange={(event) => set("customDomain")(event.target.value)}
          placeholder="Belum Diatur"
          className="font-mono"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Template Tema</Label>
          <Select value={form.tema} onValueChange={set("tema")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TEMA_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Mode Pemeliharaan</Label>
          <Select value={form.modePemeliharaan} onValueChange={set("modePemeliharaan")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modeOptions.map((option) => (
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
