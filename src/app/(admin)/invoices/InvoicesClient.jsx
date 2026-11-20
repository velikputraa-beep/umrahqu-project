"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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

const STATUS_OPTIONS = ["Menunggu Pembayaran", "Sebagian", "Lunas", "Batal"];

const statusTone = {
  "Menunggu Pembayaran": "sky",
  Sebagian: "amber",
  Lunas: "emerald",
  Batal: "red",
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

function parseRp(value) {
  return String(value ?? "").replace(/[^\d]/g, "");
}

function formatRp(digits) {
  const clean = String(digits ?? "").replace(/[^\d]/g, "");
  if (!clean) return "Rp 0";
  return `Rp ${clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export default function InvoicesClient({ initialInvoices }) {
  const router = useRouter();
  const supabase = createClient();
  const [invoices, setInvoices] = useState(initialInvoices);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const rows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (term && !`${inv.noFaktur} ${inv.jamaah}`.toLowerCase().includes(term)) return false;
      if (statuses.length && !statuses.includes(inv.status)) return false;

      if (dateFrom || dateTo) {
        const tanggal = parseTanggal(inv.tanggal);
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
  }, [invoices, searchTerm, statuses, dateFrom, dateTo]);

  const openEditModal = (invoice) => {
    setEditing(invoice);
    setModalOpen(true);
  };

  const submitInvoice = async (invoice) => {
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("invoices")
          .update(invoice)
          .eq("id", invoice.id || editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("invoices")
          .insert([invoice])
          .select();
        if (error) throw error;
        if (data && data[0]) {
          invoice = data[0];
        }
      }

      setInvoices((prev) => {
        if (editing) {
          return prev.map((item) => (item === editing || item.id === invoice.id ? invoice : item));
        }
        return [invoice, ...prev];
      });

      toast.success(
        editing
          ? `Invoice ${invoice.noFaktur} berhasil diperbarui.`
          : `Invoice ${invoice.noFaktur} berhasil ditambahkan.`
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan invoice.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditing(null);
    }
  };

  const removeInvoice = async (invoice) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoice.id);
      if (error) throw error;

      setInvoices((prev) => prev.filter((item) => item !== invoice && item.id !== invoice.id));
      toast.success(`Invoice ${invoice.noFaktur} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus invoice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListPage
        title="Invoice"
        actions={
          <Button size="sm" asChild>
            <Link href="/invoices/new">
              <Plus className="size-3.5" />
              Buat Invoice
            </Link>
          </Button>
        }
        search={{
          placeholder: "Cari no. invoice...",
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
          <FilterMultiSelect
            label="Status"
            options={STATUS_OPTIONS}
            value={statuses}
            onChange={setStatuses}
          />
        }
        columns={[
          {
            key: "noFaktur",
            header: "No. Faktur",
            cellClassName: "font-mono whitespace-nowrap",
            cell: (inv) => <span className="font-medium text-foreground">{inv.noFaktur}</span>,
          },
          {
            key: "jamaah",
            header: "Jamaah",
            cell: (inv) => <span className="font-medium text-foreground">{inv.jamaah}</span>,
          },
          {
            key: "jumlah",
            header: "Jumlah",
            cellClassName: "whitespace-nowrap",
            cell: (inv) => <span className="font-semibold text-foreground">{inv.jumlah}</span>,
          },
          {
            key: "tanggal",
            header: "Tanggal",
            cellClassName: "whitespace-nowrap text-muted-foreground",
          },
          {
            key: "status",
            header: "Status",
            cell: (inv) => <StatusBadge value={inv.status} tone={statusTone[inv.status]} />,
          },
          {
            key: "aksi",
            header: "Aksi",
            align: "center",
            csv: () => "",
            cell: (inv) => (
              <RowActionsMenu
                name={inv.noFaktur}
                onEdit={() => openEditModal(inv)}
                onDelete={() => removeInvoice(inv)}
              />
            ),
          },
        ]}
        rows={rows}
      />

      <InvoiceFormModal
        key={editing ? (editing.id || editing.noFaktur) : "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        invoice={editing}
        onSubmit={submitInvoice}
      />
    </>
  );
}

const EMPTY_INVOICE_FORM = {
  noFaktur: "",
  jamaah: "",
  jumlah: "",
  tanggal: "",
  status: "Menunggu Pembayaran",
};

function toInvoiceForm(invoice) {
  if (!invoice) return EMPTY_INVOICE_FORM;
  return {
    noFaktur: invoice.noFaktur,
    jamaah: invoice.jamaah,
    jumlah: parseRp(invoice.jumlah),
    tanggal: dateToIso(parseTanggal(invoice.tanggal)),
    status: invoice.status,
  };
}

function InvoiceFormModal({ open, onOpenChange, invoice, onSubmit }) {
  const [form, setForm] = useState(() => toInvoiceForm(invoice));
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.noFaktur.trim()) {
      setError("No. faktur wajib diisi.");
      toast.error("No. faktur wajib diisi.");
      return;
    }
    setError("");
    onSubmit({
      ...(invoice || { id: `inv-${Date.now()}` }),
      noFaktur: form.noFaktur.trim(),
      jamaah: form.jamaah,
      jumlah: formatRp(form.jumlah),
      tanggal: roundTripTanggal(invoice?.tanggal, form.tanggal),
      status: form.status,
    });
    if (!invoice) setForm(EMPTY_INVOICE_FORM);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={invoice ? "Edit Invoice" : "Tambah Invoice"}
      description="Data tagihan invoice jamaah pada keuangan travel."
      onSubmit={submit}
      submitLabel={invoice ? "Simpan Perubahan" : "Simpan Invoice"}
    >
      <div className="space-y-1.5">
        <Label htmlFor="inv-nofaktur">No. Faktur *</Label>
        <Input
          id="inv-nofaktur"
          value={form.noFaktur}
          aria-invalid={Boolean(error)}
          onChange={(event) => set("noFaktur")(event.target.value)}
          placeholder="INV-20261112-001"
          className="font-mono"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="inv-jamaah">Jamaah</Label>
        <Input
          id="inv-jamaah"
          value={form.jamaah}
          onChange={(event) => set("jamaah")(event.target.value)}
          placeholder="Nama jamaah / pemesan"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="inv-jumlah">Jumlah (Rp)</Label>
          <Input
            id="inv-jumlah"
            type="number"
            min="0"
            value={form.jumlah}
            onChange={(event) => set("jumlah")(event.target.value)}
            placeholder="35000000"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="inv-tanggal">Tanggal</Label>
          <Input
            id="inv-tanggal"
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
