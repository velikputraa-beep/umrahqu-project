"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
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
  {
    title: "Saldo Mengendap",
    value: "Rp 100 Jt",
    badge: "Deposit",
    icon: ShieldCheck,
    tone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  },
  {
    title: "Mitra Saldo Aman",
    value: "2",
    badge: "Aman",
    icon: CheckCircle2,
    tone: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  },
  {
    title: "Mitra Saldo Rendah",
    value: "7",
    badge: "Perhatian",
    icon: AlertTriangle,
    tone: "border-amber-500/20 bg-amber-500/10 text-amber-400",
  },
  {
    title: "Mutasi Bulan Ini",
    value: "9 Kali",
    badge: "Aktivitas",
    icon: Activity,
    tone: "border-sky-500/20 bg-sky-500/10 text-sky-400",
  },
];

const STATUS_OPTIONS = ["Aktif", "Warning (Low Balance)", "Dibekukan"];

const statusTone = {
  Aktif: "emerald",
  "Warning (Low Balance)": "amber",
  Dibekukan: "red",
};

function parseRp(value) {
  return String(value ?? "").replace(/[^\d]/g, "");
}

function formatRp(digits) {
  const clean = String(digits ?? "").replace(/[^\d]/g, "");
  if (!clean) return "Rp 0";
  return `Rp ${clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

function StatusCell({ value }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {value === "Aktif" && <CheckCircle2 className="size-3 text-emerald-400" />}
      {value.startsWith("Warning") && <AlertTriangle className="size-3 text-amber-400" />}
      <StatusBadge value={value} tone={statusTone[value]} />
    </span>
  );
}

export default function DepositsClient({ initialDeposits }) {
  const router = useRouter();
  const supabase = createClient();
  const [deposits, setDeposits] = useState(initialDeposits);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const rows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return deposits.filter((item) => {
      if (term && !`${item.nama} ${item.handle}`.toLowerCase().includes(term)) return false;
      if (statuses.length && !statuses.includes(item.status)) return false;
      return true;
    });
  }, [deposits, searchTerm, statuses]);

  const openEditModal = (deposit) => {
    setEditing(deposit);
    setModalOpen(true);
  };

  const submitDeposit = async (deposit) => {
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("deposits")
          .update(deposit)
          .eq("id", deposit.id || editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("deposits")
          .insert([deposit])
          .select();
        if (error) throw error;
        if (data && data[0]) {
          deposit = data[0];
        }
      }

      setDeposits((prev) => {
        if (editing) {
          return prev.map((item) => (item === editing || item.id === deposit.id ? deposit : item));
        }
        return [deposit, ...prev];
      });

      toast.success(
        editing
          ? `Deposit ${deposit.nama} berhasil diperbarui.`
          : `Deposit ${deposit.nama} berhasil ditambahkan.`
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan deposit.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditing(null);
    }
  };

  const removeDeposit = async (deposit) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("deposits")
        .delete()
        .eq("id", deposit.id);
      if (error) throw error;

      setDeposits((prev) => prev.filter((item) => item !== deposit && item.id !== deposit.id));
      toast.success(`Deposit ${deposit.nama} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus deposit.");
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
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">{stat.title}</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${stat.tone}`}
              >
                <stat.icon className="size-3" />
                {stat.badge}
              </span>
            </div>
            <div className="mt-3 text-2xl font-bold tracking-tight text-foreground">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <ListPage
        title="Deposit & Mutasi Travel"
        search={{
          placeholder: "Cari agensi travel...",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        filters={
          <FilterMultiSelect
            label="Status Saldo"
            options={STATUS_OPTIONS}
            value={statuses}
            onChange={setStatuses}
          />
        }
        columns={[
          {
            key: "nama",
            header: "Agensi Travel",
            cell: (item) => (
              <div>
                <div className="font-medium text-foreground">{item.nama}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{item.handle}</div>
              </div>
            ),
          },
          {
            key: "saldo",
            header: "Saldo Deposit",
            cell: (item) => (
              <div>
                <div className={`font-semibold ${item.saldoTone}`}>{item.saldo}</div>
                <div className="text-[10px] text-muted-foreground">{item.minSaldo}</div>
              </div>
            ),
          },
          {
            key: "batasOperasional",
            header: "Batas Min. Operasional",
            cellClassName: "whitespace-nowrap",
          },
          {
            key: "status",
            header: "Status Saldo",
            cell: (item) => <StatusCell value={item.status} />,
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
                onDelete={() => removeDeposit(item)}
              />
            ),
          },
        ]}
        rows={rows}
      />

      <DepositFormModal
        key={editing ? (editing.id || editing.nama) : "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        deposit={editing}
        onSubmit={submitDeposit}
      />
    </div>
  );
}

const EMPTY_DEPOSIT_FORM = {
  nama: "",
  saldo: "",
  minSaldo: "10000000",
  batasOperasional: "10000000",
  status: "Aktif",
};

function toDepositForm(deposit) {
  if (!deposit) return EMPTY_DEPOSIT_FORM;
  return {
    nama: deposit.nama,
    saldo: parseRp(deposit.saldo),
    minSaldo: parseRp(deposit.minSaldo),
    batasOperasional: parseRp(deposit.batasOperasional),
    status: deposit.status,
  };
}

function DepositFormModal({ open, onOpenChange, deposit, onSubmit }) {
  const [form, setForm] = useState(() => toDepositForm(deposit));
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
    onSubmit({
      ...(deposit || { id: `dep-${Date.now()}` }),
      nama: form.nama.trim(),
      saldo: formatRp(form.saldo),
      saldoTone: Number(parseRp(form.saldo)) > 0 ? "text-emerald-400" : "text-amber-400",
      minSaldo: `Min: ${formatRp(form.minSaldo)}`,
      batasOperasional: formatRp(form.batasOperasional),
      status: form.status,
    });
    if (!deposit) setForm(EMPTY_DEPOSIT_FORM);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={deposit ? "Edit Deposit" : "Tambah Deposit"}
      description="Saldo deposit dan batas operasional travel agency."
      onSubmit={submit}
      submitLabel={deposit ? "Simpan Perubahan" : "Simpan Deposit"}
    >
      <div className="space-y-1.5">
        <Label htmlFor="dep-nama">Agensi Travel *</Label>
        <Input
          id="dep-nama"
          value={form.nama}
          aria-invalid={Boolean(error)}
          onChange={(event) => set("nama")(event.target.value)}
          placeholder="Nama agensi travel"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="dep-saldo">Saldo Deposit (Rp)</Label>
          <Input
            id="dep-saldo"
            type="number"
            min="0"
            value={form.saldo}
            onChange={(event) => set("saldo")(event.target.value)}
            placeholder="50000000"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dep-min-saldo">Minimum Saldo (Rp)</Label>
          <Input
            id="dep-min-saldo"
            type="number"
            min="0"
            value={form.minSaldo}
            onChange={(event) => set("minSaldo")(event.target.value)}
            placeholder="10000000"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="dep-batas">Batas Min. Operasional (Rp)</Label>
          <Input
            id="dep-batas"
            type="number"
            min="0"
            value={form.batasOperasional}
            onChange={(event) => set("batasOperasional")(event.target.value)}
            placeholder="10000000"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Status Saldo</Label>
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
