"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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

const STATUS_DNS_OPTIONS = ["Terhubung", "Menunggu Propagasi"];

const statusDnsTone = {
  Terhubung: "emerald",
  "Menunggu Propagasi": "amber",
};

const statusSslTone = {
  Aktif: "emerald",
  Proses: "amber",
};

const MONTHS = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, Jun: 5,
  Jul: 6, Agu: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11,
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function parseTanggal(value) {
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

function roundTripTanggal(original, iso) {
  if (!iso) return original ?? "";
  if (original && iso === dateToIso(parseTanggal(original))) return original;
  const date = isoToDate(iso);
  if (!date) return original ?? "";
  return `${String(date.getDate()).padStart(2, "0")} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export default function DomainsClient({ initialDomains }) {
  const router = useRouter();
  const supabase = createClient();
  const [domains, setDomains] = useState(initialDomains);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusDns, setStatusDns] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const statusSslOptions = useMemo(
    () => [...new Set(domains.map((domain) => domain.statusSsl))],
    [domains]
  );

  const rows = domains.filter((domain) => {
    const term = searchTerm.trim().toLowerCase();
    if (
      term &&
      !`${domain.agensi} ${domain.customDomain} ${domain.cname}`.toLowerCase().includes(term)
    ) {
      return false;
    }
    if (statusDns.length && !statusDns.includes(domain.statusDns)) return false;
    return true;
  });

  const openEditModal = (domain) => {
    setEditing(domain);
    setModalOpen(true);
  };

  const submitDomain = async (domain) => {
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("domains")
          .update(domain)
          .eq("id", domain.id || editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("domains")
          .insert([domain])
          .select();
        if (error) throw error;
        if (data && data[0]) {
          domain = data[0];
        }
      }

      setDomains((prev) => {
        if (editing) {
          return prev.map((item) => (item === editing || item.id === domain.id ? domain : item));
        }
        return [domain, ...prev];
      });

      toast.success(
        editing
          ? `Domain ${domain.customDomain} berhasil diperbarui.`
          : `Domain ${domain.customDomain} berhasil ditambahkan.`
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan domain.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditing(null);
    }
  };

  const removeDomain = async (domain) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("domains")
        .delete()
        .eq("id", domain.id);
      if (error) throw error;

      setDomains((prev) => prev.filter((item) => item !== domain && item.id !== domain.id));
      toast.success(`Domain ${domain.customDomain} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus domain.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListPage
        title="Kelola Custom Domain"
        search={{
          placeholder: "Cari domain kustom atau nama travel...",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        filters={
          <FilterMultiSelect
            label="Status DNS"
            options={STATUS_DNS_OPTIONS}
            value={statusDns}
            onChange={setStatusDns}
          />
        }
        columns={[
          {
            key: "agensi",
            header: "Agensi Travel",
            cell: (domain) => (
              <span className="font-medium text-foreground">{domain.agensi}</span>
            ),
          },
          {
            key: "customDomain",
            header: "Custom Domain",
            cell: (domain) => (
              <span className="font-mono text-emerald-400">{domain.customDomain}</span>
            ),
          },
          {
            key: "cname",
            header: "Target CNAME",
            cell: (domain) => (
              <span className="font-mono text-muted-foreground">{domain.cname}</span>
            ),
          },
          {
            key: "statusDns",
            header: "Status DNS",
            cell: (domain) => (
              <StatusBadge value={domain.statusDns} tone={statusDnsTone[domain.statusDns]} />
            ),
          },
          {
            key: "statusSsl",
            header: "Status SSL",
            cell: (domain) => (
              <StatusBadge value={domain.statusSsl} tone={statusSslTone[domain.statusSsl]} />
            ),
          },
          {
            key: "tanggal",
            header: "Tanggal Pengajuan",
            cell: (domain) => (
              <span className="text-muted-foreground">{domain.tanggal}</span>
            ),
          },
          {
            key: "aksi",
            header: "Aksi",
            align: "center",
            csv: () => "",
            cell: (domain) => (
              <RowActionsMenu
                name={domain.customDomain}
                onEdit={() => openEditModal(domain)}
                onDelete={() => removeDomain(domain)}
              />
            ),
          },
        ]}
        rows={rows}
      />

      <DomainFormModal
        key={editing ? (editing.id || editing.customDomain) : "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        domain={editing}
        statusSslOptions={statusSslOptions}
        onSubmit={submitDomain}
      />
    </>
  );
}

const EMPTY_DOMAIN_FORM = {
  agensi: "",
  customDomain: "",
  cname: "cname.umrohq.com",
  statusDns: "Terhubung",
  statusSsl: "Aktif",
  tanggal: "",
};

function toDomainForm(domain) {
  if (!domain) return EMPTY_DOMAIN_FORM;
  return {
    agensi: domain.agensi,
    customDomain: domain.customDomain,
    cname: domain.cname,
    statusDns: domain.statusDns,
    statusSsl: domain.statusSsl,
    tanggal: dateToIso(parseTanggal(domain.tanggal)),
  };
}

function DomainFormModal({ open, onOpenChange, domain, statusSslOptions, onSubmit }) {
  const [form, setForm] = useState(() => toDomainForm(domain));
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.customDomain.trim()) {
      setError("Custom domain wajib diisi.");
      toast.error("Custom domain wajib diisi.");
      return;
    }
    setError("");
    onSubmit({
      ...(domain || { id: `dom-${Date.now()}` }),
      agensi: form.agensi,
      customDomain: form.customDomain.trim(),
      cname: form.cname,
      statusDns: form.statusDns,
      statusSsl: form.statusSsl,
      tanggal: roundTripTanggal(domain?.tanggal, form.tanggal),
    });
    if (!domain) setForm(EMPTY_DOMAIN_FORM);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={domain ? "Edit Custom Domain" : "Tambah Custom Domain"}
      description="Domain kustom travel agency beserta status DNS dan SSL."
      onSubmit={submit}
      submitLabel={domain ? "Simpan Perubahan" : "Simpan Domain"}
    >
      <div className="space-y-1.5">
        <Label htmlFor="dom-custom">Custom Domain *</Label>
        <Input
          id="dom-custom"
          value={form.customDomain}
          aria-invalid={Boolean(error)}
          onChange={(event) => set("customDomain")(event.target.value)}
          placeholder="domainkustom.com"
          className="font-mono"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="dom-agensi">Agensi Travel</Label>
          <Input
            id="dom-agensi"
            value={form.agensi}
            onChange={(event) => set("agensi")(event.target.value)}
            placeholder="Nama agensi travel"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dom-cname">Target CNAME</Label>
          <Input
            id="dom-cname"
            value={form.cname}
            onChange={(event) => set("cname")(event.target.value)}
            placeholder="cname.umrohq.com"
            className="font-mono"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Status DNS</Label>
          <Select value={form.statusDns} onValueChange={set("statusDns")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_DNS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status SSL</Label>
          <Select value={form.statusSsl} onValueChange={set("statusSsl")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusSslOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dom-tanggal">Tanggal Pengajuan</Label>
          <Input
            id="dom-tanggal"
            type="date"
            value={form.tanggal}
            onChange={(event) => set("tanggal")(event.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}
