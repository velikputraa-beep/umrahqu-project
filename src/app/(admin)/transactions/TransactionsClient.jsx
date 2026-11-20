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

const STATUS_OPTIONS = ["Terbayar", "Menunggu"];

const MONTHS = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, Jun: 5,
  Jul: 6, Agu: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11,
};

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

function parseTanggal(value) {
  if (/\blalu\b/i.test(value ?? "")) return new Date();
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
  const originalIso = dateToIso(parseTanggal(original));
  if (original && iso === originalIso) return original;
  const date = isoToDate(iso);
  if (!date) return original ?? "";
  return `${String(date.getDate()).padStart(2, "0")} ${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

function parseRp(value) {
  return String(value ?? "").replace(/[^\d]/g, "");
}

function formatRp(digits) {
  const clean = String(digits ?? "").replace(/[^\d]/g, "");
  if (!clean) return "Rp 0";
  return `Rp ${clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export default function TransactionsClient({ initialTransactions }) {
  const router = useRouter();
  const supabase = createClient();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [channels, setChannels] = useState([]);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const channelOptions = useMemo(
    () => [...new Set(transactions.map((item) => item.channel))],
    [transactions]
  );

  const rows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return transactions.filter((item) => {
      if (term) {
        const haystack = `${item.invoice} ${item.deskripsi} ${item.channel}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (statuses.length && !statuses.includes(item.status)) return false;
      if (channels.length && !channels.includes(item.channel)) return false;

      if (dateFrom || dateTo) {
        const tanggal = parseTanggal(item.tanggal);
        if (!tanggal) return false;
        if (dateFrom && tanggal < dateFrom) return false;
        if (
          dateTo &&
          tanggal >
            new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate(), 23, 59, 59)
        )
          return false;
      }
      return true;
    });
  }, [transactions, searchTerm, statuses, channels, dateFrom, dateTo]);

  const openEditModal = (transaction) => {
    setEditing(transaction);
    setModalOpen(true);
  };

  const submitTransaction = async (transaction) => {
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("transactions")
          .update(transaction)
          .eq("id", transaction.id || editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("transactions")
          .insert([transaction])
          .select();
        if (error) throw error;
        if (data && data[0]) {
          transaction = data[0];
        }
      }

      setTransactions((prev) => {
        if (editing) {
          return prev.map((item) => (item === editing || item.id === transaction.id ? transaction : item));
        }
        return [transaction, ...prev];
      });

      toast.success(
        editing
          ? `Transaksi ${transaction.invoice} berhasil diperbarui.`
          : `Transaksi ${transaction.invoice} berhasil ditambahkan.`
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan transaksi.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditing(null);
    }
  };

  const removeTransaction = async (transaction) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", transaction.id);
      if (error) throw error;

      setTransactions((prev) => prev.filter((item) => item !== transaction && item.id !== transaction.id));
      toast.success(`Transaksi ${transaction.invoice} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus transaksi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListPage
        title="Transaksi"
        search={{
          placeholder: "Cari no. referensi / gateway...",
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
              label="Status"
              options={STATUS_OPTIONS}
              value={statuses}
              onChange={setStatuses}
            />
            <FilterMultiSelect
              label="Channel"
              options={channelOptions}
              value={channels}
              onChange={setChannels}
            />
          </>
        }
        columns={[
          {
            key: "invoice",
            header: "No. Invoice",
            cellClassName: "font-mono whitespace-nowrap",
            cell: (item) => <span className="text-foreground">{item.invoice}</span>,
          },
          {
            key: "deskripsi",
            header: "Deskripsi",
            cell: (item) => <span className="text-foreground">{item.deskripsi}</span>,
          },
          {
            key: "channel",
            header: "Channel",
            cell: (item) => <span className="text-muted-foreground">{item.channel}</span>,
          },
          {
            key: "nominal",
            header: "Nominal",
            cellClassName: "whitespace-nowrap",
            cell: (item) => <span className="font-medium text-foreground">{item.nominal}</span>,
          },
          {
            key: "tanggal",
            header: "Tanggal",
            cellClassName: "whitespace-nowrap text-muted-foreground",
          },
          {
            key: "status",
            header: "Status",
            cell: (item) => <StatusBadge value={item.status} />,
          },
          {
            key: "aksi",
            header: "Aksi",
            align: "center",
            csv: () => "",
            cell: (item) => (
              <RowActionsMenu
                name={item.invoice}
                onEdit={() => openEditModal(item)}
                onDelete={() => removeTransaction(item)}
              />
            ),
          },
        ]}
        rows={rows}
      />

      <TransactionFormModal
        key={editing ? (editing.id || editing.invoice) : "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        transaction={editing}
        channelOptions={channelOptions}
        onSubmit={submitTransaction}
      />
    </>
  );
}

const EMPTY_TRANSACTION_FORM = {
  invoice: "",
  deskripsi: "",
  channel: "Bank Transfer",
  nominal: "",
  tanggal: "",
  status: "Menunggu",
};

function toTransactionForm(transaction) {
  if (!transaction) return EMPTY_TRANSACTION_FORM;
  return {
    invoice: transaction.invoice,
    deskripsi: transaction.deskripsi,
    channel: transaction.channel,
    nominal: parseRp(transaction.nominal),
    tanggal: dateToIso(parseTanggal(transaction.tanggal)),
    status: transaction.status,
  };
}

function TransactionFormModal({ open, onOpenChange, transaction, channelOptions, onSubmit }) {
  const [form, setForm] = useState(() => toTransactionForm(transaction));
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.invoice.trim()) {
      setError("No. invoice wajib diisi.");
      toast.error("No. invoice wajib diisi.");
      return;
    }
    setError("");
    onSubmit({
      ...(transaction || { id: `tx-${Date.now()}` }),
      invoice: form.invoice.trim(),
      deskripsi: form.deskripsi,
      channel: form.channel,
      nominal: formatRp(form.nominal),
      tanggal: roundTripTanggal(transaction?.tanggal, form.tanggal),
      status: form.status,
    });
    if (!transaction) setForm(EMPTY_TRANSACTION_FORM);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={transaction ? "Edit Transaksi" : "Tambah Transaksi"}
      description="Data transaksi pembayaran jamaah pada keuangan travel."
      onSubmit={submit}
      submitLabel={transaction ? "Simpan Perubahan" : "Simpan Transaksi"}
    >
      <div className="space-y-1.5">
        <Label htmlFor="tx-invoice">No. Invoice *</Label>
        <Input
          id="tx-invoice"
          value={form.invoice}
          aria-invalid={Boolean(error)}
          onChange={(event) => set("invoice")(event.target.value)}
          placeholder="INV-20261112-001"
          className="font-mono"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="tx-deskripsi">Deskripsi</Label>
        <Input
          id="tx-deskripsi"
          value={form.deskripsi}
          onChange={(event) => set("deskripsi")(event.target.value)}
          placeholder="Deskripsi pembayaran"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Channel</Label>
          <Select value={form.channel} onValueChange={set("channel")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih channel..." />
            </SelectTrigger>
            <SelectContent>
              {channelOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tx-nominal">Nominal (Rp)</Label>
          <Input
            id="tx-nominal"
            type="number"
            min="0"
            value={form.nominal}
            onChange={(event) => set("nominal")(event.target.value)}
            placeholder="14000000"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="tx-tanggal">Tanggal</Label>
          <Input
            id="tx-tanggal"
            type="date"
            value={form.tanggal}
            onChange={(event) => set("tanggal")(event.target.value)}
          />
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
      </div>
    </Modal>
  );
}
