"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Hourglass, Landmark, XCircle } from "lucide-react";
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

const STATUS_OPTIONS = ["Menunggu Berangkat", "Dibatalkan"];

const statusTone = {
  "Menunggu Berangkat": "amber",
  Dibatalkan: "red",
};

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

export default function WithdrawsClient({ initialWithdraws }) {
  const router = useRouter();
  const supabase = createClient();
  const [withdraws, setWithdraws] = useState(initialWithdraws);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statuses, setStatuses] = useState([]);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const rows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return withdraws.filter((item) => {
      if (term) {
        const haystack =
          `${item.jamaah} ${item.email} ${item.metode} ${item.agensi} ${item.pesanan}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (statuses.length && !statuses.includes(item.status)) return false;

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
  }, [withdraws, searchTerm, statuses, dateFrom, dateTo]);

  const openEditModal = (withdraw) => {
    setEditing(withdraw);
    setModalOpen(true);
  };

  const submitWithdraw = async (withdraw) => {
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("withdraws")
          .update(withdraw)
          .eq("id", withdraw.id || editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("withdraws")
          .insert([withdraw])
          .select();
        if (error) throw error;
        if (data && data[0]) {
          withdraw = data[0];
        }
      }

      setWithdraws((prev) => {
        if (editing) {
          return prev.map((item) => (item === editing || item.id === withdraw.id ? withdraw : item));
        }
        return [withdraw, ...prev];
      });

      toast.success(
        editing
          ? `Klaim cashback ${withdraw.pesanan} berhasil diperbarui.`
          : `Klaim cashback ${withdraw.pesanan} berhasil ditambahkan.`
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan klaim cashback.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditing(null);
    }
  };

  const removeWithdraw = async (withdraw) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("withdraws")
        .delete()
        .eq("id", withdraw.id);
      if (error) throw error;

      setWithdraws((prev) => prev.filter((item) => item !== withdraw && item.id !== withdraw.id));
      toast.success(`Klaim cashback ${withdraw.pesanan} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus klaim cashback.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListPage
        title="Klaim Cashback Jamaah"
        search={{
          placeholder: "Cari nama, email, bank...",
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
            key: "jamaah",
            header: "Jamaah Penerima",
            cell: (item) => (
              <div>
                <div className="font-medium text-foreground">{item.jamaah}</div>
                <div className="text-[11px] text-muted-foreground">{item.email}</div>
              </div>
            ),
          },
          {
            key: "metode",
            header: "Metode & Rekening",
            cell: (item) => (
              <div>
                <span className="inline-flex items-center gap-1.5 rounded border border-border bg-muted px-2 py-0.5 text-[11px] font-medium text-foreground">
                  <Landmark className="size-3 text-muted-foreground" />
                  {item.metode}
                </span>
                <div className="mt-1 text-[10px] text-muted-foreground">{item.keterangan}</div>
              </div>
            ),
          },
          {
            key: "nominal",
            header: "Nominal Cashback",
            cellClassName: "whitespace-nowrap",
            cell: (item) => <span className="font-semibold text-emerald-400">{item.nominal}</span>,
          },
          {
            key: "agensi",
            header: "Agensi & Pesanan",
            cell: (item) => (
              <div>
                <div className="font-medium text-foreground">{item.agensi}</div>
                <div className="font-mono text-[11px] text-muted-foreground">{item.pesanan}</div>
              </div>
            ),
          },
          {
            key: "status",
            header: "Status",
            cell: (item) => (
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                {item.status === "Menunggu Berangkat" ? (
                  <Hourglass className="size-3 text-amber-400" />
                ) : (
                  <XCircle className="size-3 text-red-400" />
                )}
                <StatusBadge value={item.status} tone={statusTone[item.status]} />
              </span>
            ),
          },
          {
            key: "tanggal",
            header: "Tanggal",
            cellClassName: "whitespace-nowrap text-muted-foreground",
          },
          {
            key: "aksi",
            header: "Aksi",
            align: "center",
            csv: () => "",
            cell: (item) => (
              <RowActionsMenu
                name={item.pesanan}
                onEdit={() => openEditModal(item)}
                onDelete={() => removeWithdraw(item)}
              />
            ),
          },
        ]}
        rows={rows}
      />

      <WithdrawFormModal
        key={editing ? (editing.id || editing.pesanan) : "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        withdraw={editing}
        onSubmit={submitWithdraw}
      />
    </>
  );
}

const EMPTY_WITHDRAW_FORM = {
  jamaah: "",
  email: "",
  nominal: "",
  agensi: "",
  status: "Menunggu Berangkat",
  tanggal: "",
};

function toWithdrawForm(withdraw) {
  if (!withdraw) return EMPTY_WITHDRAW_FORM;
  return {
    jamaah: withdraw.jamaah,
    email: withdraw.email,
    nominal: parseRp(withdraw.nominal),
    agensi: withdraw.agensi,
    status: withdraw.status,
    tanggal: dateToIso(parseTanggal(withdraw.tanggal)),
  };
}

function WithdrawFormModal({ open, onOpenChange, withdraw, onSubmit }) {
  const [form, setForm] = useState(() => toWithdrawForm(withdraw));
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.jamaah.trim()) {
      setError("Nama jamaah penerima wajib diisi.");
      toast.error("Nama jamaah penerima wajib diisi.");
      return;
    }
    setError("");
    onSubmit({
      ...(withdraw || { id: `wd-${Date.now()}` }),
      jamaah: form.jamaah.trim(),
      email: form.email,
      nominal: formatRp(form.nominal),
      agensi: form.agensi,
      status: form.status,
      tanggal: roundTripTanggal(withdraw?.tanggal, form.tanggal),
    });
    if (!withdraw) setForm(EMPTY_WITHDRAW_FORM);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={withdraw ? "Edit Klaim Cashback" : "Tambah Klaim Cashback"}
      description="Data klaim pencairan cashback jamaah pada saldo travel."
      onSubmit={submit}
      submitLabel={withdraw ? "Simpan Perubahan" : "Simpan Klaim"}
    >
      <div className="space-y-1.5">
        <Label htmlFor="wd-jamaah">Jamaah Penerima *</Label>
        <Input
          id="wd-jamaah"
          value={form.jamaah}
          aria-invalid={Boolean(error)}
          onChange={(event) => set("jamaah")(event.target.value)}
          placeholder="Nama jamaah penerima"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="wd-email">Email</Label>
        <Input
          id="wd-email"
          type="email"
          value={form.email}
          onChange={(event) => set("email")(event.target.value)}
          placeholder="email@gmail.com"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="wd-nominal">Nominal Cashback (Rp)</Label>
          <Input
            id="wd-nominal"
            type="number"
            min="0"
            value={form.nominal}
            onChange={(event) => set("nominal")(event.target.value)}
            placeholder="1750000"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="wd-agensi">Agensi</Label>
          <Input
            id="wd-agensi"
            value={form.agensi}
            onChange={(event) => set("agensi")(event.target.value)}
            placeholder="Nama agensi travel"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="wd-tanggal">Tanggal</Label>
          <Input
            id="wd-tanggal"
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
