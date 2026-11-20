"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Button } from "@/components/ui/button";
import ListPage from "@/components/admin/ListPage";
import Modal from "@/components/admin/Modal";
import StatusBadge from "@/components/admin/StatusBadge";
import FilterMultiSelect from "@/components/admin/FilterMultiSelect";
import RowActionsMenu from "@/components/admin/RowActionsMenu";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

const MONTHS = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, Jun: 5,
  Jul: 6, Agu: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11,
};

function parseKapan(value) {
  if (/\blalu\b/i.test(value ?? "")) return new Date();
  const match = /^(\d{2})\s(\w{3})\s(\d{4})$/.exec(value ?? "");
  if (!match) return null;
  const [, day, month, year] = match;
  const parsed = new Date(Number(year), MONTHS[month], Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function LogsClient({ initialLogs }) {
  const router = useRouter();
  const supabase = createClient();
  const [logs, setLogs] = useState(initialLogs);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modul, setModul] = useState([]);
  const [aksi, setAksi] = useState([]);
  const [aktor, setAktor] = useState([]);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const modulOptions = useMemo(() => [...new Set(logs.map((log) => log.entity))], [logs]);
  const aksiOptions = useMemo(() => [...new Set(logs.map((log) => log.aksi))], [logs]);
  const aktorOptions = useMemo(() => [...new Set(logs.map((log) => log.aktor))], [logs]);

  const rows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return logs.filter((log) => {
      if (term) {
        const haystack = `${log.deskripsi} ${log.aktor} ${log.entity}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (modul.length && !modul.includes(log.entity)) return false;
      if (aksi.length && !aksi.includes(log.aksi)) return false;
      if (aktor.length && !aktor.includes(log.aktor)) return false;

      if (dateFrom || dateTo) {
        const kapan = parseKapan(log.kapan);
        if (!kapan) return false;
        if (dateFrom && kapan < dateFrom) return false;
        if (
          dateTo &&
          kapan > new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate(), 23, 59, 59)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [logs, searchTerm, modul, aksi, aktor, dateFrom, dateTo]);

  const activeFilterCount =
    modul.length + aksi.length + aktor.length + (dateFrom || dateTo ? 1 : 0);

  const resetFilters = () => {
    setModul([]);
    setAksi([]);
    setAktor([]);
    setDateFrom(null);
    setDateTo(null);
  };

  const openEditModal = (log) => {
    setEditing(log);
    setModalOpen(true);
  };

  const submitLog = async (log) => {
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("logs")
          .update(log)
          .eq("id", log.id || editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("logs")
          .insert([log])
          .select();
        if (error) throw error;
        if (data && data[0]) {
          log = data[0];
        }
      }

      setLogs((prev) => {
        if (editing) {
          return prev.map((item) => (item === editing || item.id === log.id ? log : item));
        }
        return [log, ...prev];
      });

      toast.success(`Log ${log.entity} berhasil diperbarui.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan log.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditing(null);
    }
  };

  const removeLog = async (log) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("logs")
        .delete()
        .eq("id", log.id);
      if (error) throw error;

      setLogs((prev) => prev.filter((item) => item !== log && item.id !== log.id));
      toast.success(`Log ${log.entity} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus log.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListPage
        title="Log Aktivitas"
        search={{
          placeholder: "Cari deskripsi aktivitas...",
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
            <FilterMultiSelect label="Modul" options={modulOptions} value={modul} onChange={setModul} />
            <FilterMultiSelect label="Aksi" options={aksiOptions} value={aksi} onChange={setAksi} />
            <FilterMultiSelect label="Aktor" options={aktorOptions} value={aktor} onChange={setAktor} />

            {activeFilterCount > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
                Reset filter ({activeFilterCount})
              </Button>
            )}
          </>
        }
        columns={[
          {
            key: "deskripsi",
            header: "Deskripsi",
            cellClassName: "max-w-md",
            cell: (log) => <span className="font-medium text-foreground">{log.deskripsi}</span>,
          },
          {
            key: "aktor",
            header: "Aktor",
            cell: (log) => <span className="font-medium text-foreground">{log.aktor}</span>,
          },
          {
            key: "aksi",
            header: "Aksi",
            align: "center",
            cell: (log) => (
              <StatusBadge
                value={log.aksi}
                tone={log.aksi === "CREATE" ? "emerald" : "neutral"}
                className="font-mono"
              />
            ),
          },
          {
            key: "entity",
            header: "Entity",
            align: "center",
            cell: (log) => <StatusBadge value={log.entity} tone="neutral" />,
          },
          {
            key: "kapan",
            header: "Kapan",
            cellClassName: "whitespace-nowrap text-muted-foreground",
          },
          {
            key: "menu",
            header: "Aksi",
            align: "center",
            csv: () => "",
            cell: (log) => (
              <RowActionsMenu
                name={log.deskripsi}
                onEdit={() => openEditModal(log)}
                onDelete={() => removeLog(log)}
              />
            ),
          },
        ]}
        rows={rows}
      />

      <LogFormModal
        key={editing ? (editing.id || `log-${logs.indexOf(editing)}`) : "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        log={editing}
        entityOptions={modulOptions}
        aksiOptions={aksiOptions}
        aktorOptions={aktorOptions}
        onSubmit={submitLog}
      />
    </>
  );
}

const EMPTY_LOG_FORM = {
  deskripsi: "",
  aktor: "Sistem",
  aksi: "UPDATE",
  entity: "Paket",
  kapan: "",
};

function toLogForm(log) {
  if (!log) return EMPTY_LOG_FORM;
  return {
    deskripsi: log.deskripsi,
    aktor: log.aktor,
    aksi: log.aksi,
    entity: log.entity,
    kapan: log.kapan ?? "",
  };
}

function LogFormModal({ open, onOpenChange, log, entityOptions, aksiOptions, aktorOptions, onSubmit }) {
  const [form, setForm] = useState(() => toLogForm(log));
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.deskripsi.trim()) {
      setError("Deskripsi wajib diisi.");
      toast.error("Deskripsi wajib diisi.");
      return;
    }
    setError("");
    onSubmit({
      ...(log || { id: `log-${Date.now()}` }),
      deskripsi: form.deskripsi.trim(),
      aktor: form.aktor,
      aksi: form.aksi,
      entity: form.entity,
      kapan: form.kapan.trim(),
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Log Aktivitas"
      description="Perbarui catatan aktivitas pada sistem."
      onSubmit={submit}
      submitLabel="Simpan Perubahan"
    >
      <div className="space-y-1.5">
        <Label htmlFor="log-deskripsi">Deskripsi *</Label>
        <Textarea
          id="log-deskripsi"
          rows={2}
          value={form.deskripsi}
          aria-invalid={Boolean(error)}
          onChange={(event) => set("deskripsi")(event.target.value)}
          placeholder="Deskripsi aktivitas"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Aktor</Label>
          <Select value={form.aktor} onValueChange={set("aktor")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {aktorOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Aksi</Label>
          <Select value={form.aksi} onValueChange={set("aksi")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {aksiOptions.map((option) => (
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
          <Label>Entity</Label>
          <Select value={form.entity} onValueChange={set("entity")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {entityOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="log-kapan">Kapan</Label>
          <Input
            id="log-kapan"
            value={form.kapan}
            onChange={(event) => set("kapan")(event.target.value)}
            placeholder="21 menit lalu"
          />
        </div>
      </div>
    </Modal>
  );
}
