"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye } from "lucide-react";
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
import FilterMultiSelect from "@/components/admin/FilterMultiSelect";
import RowActionsMenu from "@/components/admin/RowActionsMenu";
import StatusBadge from "@/components/admin/StatusBadge";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

const STATUS_OPTIONS = ["Menunggu", "Dikonfirmasi", "Selesai", "Dibatalkan"];
const PEMBAYARAN_OPTIONS = ["Belum Bayar", "Belum Lunas", "Lunas"];
const SUMBER_OPTIONS = ["Marketplace", "Web Travel", "Offline"];

const MONTHS = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, Mei: 4, Jun: 5,
  Jul: 6, Agu: 7, Sep: 8, Okt: 9, Nov: 10, Des: 11,
};

function parseTanggal(value) {
  const match = /^(\d{2})\s(\w{3})\s(\d{4})$/.exec(value ?? "");
  if (!match) return null;
  const [, day, month, year] = match;
  const parsed = new Date(Number(year), MONTHS[month], Number(day));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default function BookingsListClient({ initialOrders = [] }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [travel, setTravel] = useState("all");
  const [statuses, setStatuses] = useState([]);
  const [pembayarans, setPembayarans] = useState([]);
  const [sumber, setSumber] = useState([]);
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // Supabase Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel("custom-all-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setOrders((prev) => [payload.new, ...prev]);
            toast.info("Pesanan baru diterima (Realtime)");
          } else if (payload.eventType === "UPDATE") {
            setOrders((prev) =>
              prev.map((item) =>
                item.id === payload.new.id ? { ...item, ...payload.new } : item
              )
            );
            toast.info("Data pesanan diperbarui (Realtime)");
          } else if (payload.eventType === "DELETE") {
            setOrders((prev) => prev.filter((item) => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const travelOptions = useMemo(
    () => [...new Set(orders.map((order) => order.travel))].sort(),
    [orders]
  );

  const rows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      if (term) {
        const haystack = `${order.id} ${order.paket} ${order.travel}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (travel !== "all" && order.travel !== travel) return false;
      if (statuses.length && !statuses.includes(order.status)) return false;
      if (pembayarans.length && !pembayarans.includes(order.pembayaran)) return false;
      if (sumber.length && !sumber.includes(order.sumber)) return false;

      if (dateFrom || dateTo) {
        const tanggal = parseTanggal(order.tglPesan);
        if (!tanggal) return false;
        if (dateFrom && tanggal < dateFrom) return false;
        if (dateTo && tanggal > new Date(dateTo.getFullYear(), dateTo.getMonth(), dateTo.getDate(), 23, 59, 59)) return false;
      }
      return true;
    });
  }, [orders, searchTerm, travel, statuses, pembayarans, sumber, dateFrom, dateTo]);

  const activeFilterCount =
    (travel !== "all" ? 1 : 0) +
    statuses.length +
    pembayarans.length +
    sumber.length +
    (dateFrom || dateTo ? 1 : 0);

  const resetFilters = () => {
    setTravel("all");
    setStatuses([]);
    setPembayarans([]);
    setSumber([]);
    setDateFrom(null);
    setDateTo(null);
  };

  const openEditModal = (order) => {
    setEditing(order);
    setModalOpen(true);
  };

  const submitOrder = async (order) => {
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("bookings")
          .update(order)
          .eq("id", order.id || editing.id);
        if (error) throw error;
        setOrders((prev) => prev.map((item) => (item === editing ? order : item)));
        toast.success(`Pesanan ${order.id} berhasil diperbarui.`);
      } else {
        const { data, error } = await supabase
          .from("bookings")
          .insert([order])
          .select();
        if (error) throw error;
        const created = data && data[0] ? data[0] : order;
        setOrders((prev) => [created, ...prev]);
        toast.success(`Pesanan ${order.id} berhasil ditambahkan.`);
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan pesanan.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditing(null);
    }
  };

  const removeOrder = async (order) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", order.id);
      if (error) throw error;
      setOrders((prev) => prev.filter((item) => item !== order));
      toast.success(`Pesanan ${order.id} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus pesanan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListPage
        title="Pesanan"
        search={{
          placeholder: "Cari ID pesanan / nama paket...",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        dateRange={{ from: dateFrom, to: dateTo, onChange: (from, to) => { setDateFrom(from); setDateTo(to); } }}
        filters={
          <>
            <Select value={travel} onValueChange={setTravel}>
              <SelectTrigger aria-label="Pilih mitra travel" className="w-56">
                <SelectValue placeholder="Pilih mitra travel..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Mitra Travel</SelectItem>
                {travelOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <FilterMultiSelect label="Status" options={STATUS_OPTIONS} value={statuses} onChange={setStatuses} />
            <FilterMultiSelect label="Pembayaran" options={PEMBAYARAN_OPTIONS} value={pembayarans} onChange={setPembayarans} />
            <FilterMultiSelect label="Sumber" options={SUMBER_OPTIONS} value={sumber} onChange={setSumber} />

            {activeFilterCount > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
                Reset filter ({activeFilterCount})
              </Button>
            )}
          </>
        }
        columns={[
          {
            key: "id",
            header: "ID Pesanan",
            cellClassName: "whitespace-nowrap",
            cell: (order) => (
              <Link
                href={`/bookings/${order.id}`}
                className="font-mono font-medium text-foreground hover:text-primary"
              >
                {order.id}
              </Link>
            ),
          },
          {
            key: "paket",
            header: "Paket & Travel",
            cell: (order) => (
              <div>
                <div className="font-medium text-foreground">{order.paket}</div>
                <div className="text-[11px] text-muted-foreground">{order.travel}</div>
              </div>
            ),
          },
          {
            key: "biaya",
            header: "Biaya & Sisa",
            cell: (order) => (
              <div>
                <div className="font-medium text-foreground">{order.biaya}</div>
                {order.sisa && <div className="text-[11px] text-red-400">{order.sisa}</div>}
              </div>
            ),
          },
          {
            key: "pembayaran",
            header: "Pembayaran",
            cell: (order) => <StatusBadge value={order.pembayaran} />,
          },
          {
            key: "status",
            header: "Status Pesanan",
            cell: (order) => <StatusBadge value={order.status} />,
          },
          {
            key: "sumber",
            header: "Sumber",
            cell: (order) => <StatusBadge value={order.sumber} tone="neutral" />,
          },
          { key: "tgl", header: "Tgl. Pesan" },
          {
            key: "aksi",
            header: "Aksi",
            align: "center",
            csv: () => "",
            cell: (order) => (
              <div className="flex items-center justify-center gap-1">
                <Link
                  href={`/bookings/${order.id}`}
                  title="Lihat Detail"
                  aria-label={`Lihat detail ${order.id}`}
                  className="inline-flex items-center justify-center rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Eye className="size-4" />
                </Link>
                <RowActionsMenu
                  name={order.id}
                  onEdit={() => openEditModal(order)}
                  onDelete={() => removeOrder(order)}
                />
              </div>
            ),
          },
        ]}
        rows={rows}
      />

      <OrderFormModal
        key={editing ? editing.id : "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        order={editing}
        travelOptions={travelOptions}
        onSubmit={submitOrder}
      />
    </>
  );
}

const EMPTY_ORDER_FORM = {
  id: "",
  paket: "",
  travel: "",
  biaya: "",
  sisa: "",
  pembayaran: "Belum Bayar",
  status: "Menunggu",
  sumber: "Marketplace",
  tgl: "",
};

function toOrderForm(order) {
  if (!order) return EMPTY_ORDER_FORM;
  return {
    id: order.id,
    paket: order.paket ?? "",
    travel: order.travel ?? "",
    biaya: order.biaya ?? "",
    sisa: order.sisa ?? "",
    pembayaran: order.pembayaran,
    status: order.status,
    sumber: order.sumber,
    tgl: order.tgl ?? "",
  };
}

function OrderFormModal({ open, onOpenChange, order, travelOptions, onSubmit }) {
  const [form, setForm] = useState(() => toOrderForm(order));
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.id.trim()) {
      setError("ID pesanan wajib diisi.");
      toast.error("ID pesanan wajib diisi.");
      return;
    }
    setError("");
    onSubmit({
      ...order,
      id: form.id.trim(),
      paket: form.paket.trim(),
      travel: form.travel,
      biaya: form.biaya.trim(),
      sisa: form.sisa.trim() || null,
      pembayaran: form.pembayaran,
      status: form.status,
      sumber: form.sumber,
      tgl: form.tgl.trim(),
    });
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Pesanan"
      description="Perbarui data pesanan jamaah. Detail pembayaran lain ikut tersimpan."
      onSubmit={submit}
      submitLabel="Simpan Perubahan"
    >
      <div className="space-y-1.5">
        <Label htmlFor="pesanan-id">ID Pesanan *</Label>
        <Input
          id="pesanan-id"
          value={form.id}
          aria-invalid={Boolean(error)}
          onChange={(event) => set("id")(event.target.value)}
          placeholder="MP-261112RPD301"
        />
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="pesanan-paket">Paket</Label>
          <Input
            id="pesanan-paket"
            value={form.paket}
            onChange={(event) => set("paket")(event.target.value)}
            placeholder="Nama paket"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Travel</Label>
          <Select value={form.travel} onValueChange={set("travel")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Pilih mitra travel..." />
            </SelectTrigger>
            <SelectContent>
              {travelOptions.map((option) => (
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
          <Label htmlFor="pesanan-biaya">Biaya</Label>
          <Input
            id="pesanan-biaya"
            value={form.biaya}
            onChange={(event) => set("biaya")(event.target.value)}
            placeholder="Rp 35.000.000"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pesanan-sisa">Sisa Pembayaran</Label>
          <Input
            id="pesanan-sisa"
            value={form.sisa}
            onChange={(event) => set("sisa")(event.target.value)}
            placeholder="- Rp 35.000.000"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label>Pembayaran</Label>
          <Select value={form.pembayaran} onValueChange={set("pembayaran")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PEMBAYARAN_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Status Pesanan</Label>
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
        <div className="space-y-1.5">
          <Label>Sumber</Label>
          <Select value={form.sumber} onValueChange={set("sumber")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SUMBER_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="pesanan-tgl">Tgl. Pesan</Label>
        <Input
          id="pesanan-tgl"
          value={form.tgl}
          onChange={(event) => set("tgl")(event.target.value)}
          placeholder="12 Nov 2026"
        />
      </div>
    </Modal>
  );
}
