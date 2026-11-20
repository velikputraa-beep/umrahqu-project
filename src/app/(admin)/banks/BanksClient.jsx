"use client";

import React, { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

export const BANK_OPTIONS = [
  { name: "Bank Aladin", code: "947" },
  { name: "Bank Rakyat Indonesia", code: "002" },
  { name: "Bank Syariah Indonesia", code: "451" },
  { name: "Bank Mandiri", code: "008" },
  { name: "Bank Central Asia", code: "014" },
  { name: "Bank Negara Indonesia", code: "009" },
  { name: "Bank CIMB Niaga", code: "022" },
  { name: "Bank Permata", code: "013" },
  { name: "Bank Danamon", code: "011" },
  { name: "Bank Muamalat", code: "147" },
  { name: "Bank Jago", code: "542" },
  { name: "Bank Tabungan Negara", code: "200" },
];

const STATUS_OPTIONS = ["Aktif", "Nonaktif"];

function bankCode(name) {
  return BANK_OPTIONS.find((option) => option.name === name)?.code ?? "000";
}

export default function BanksClient({ initialAccounts }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [accounts, setAccounts] = useState(initialAccounts);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [bank, setBank] = useState([]);
  const [status, setStatus] = useState([]);
  const [modalOpen, setModalOpen] = useState(
    () => searchParams?.get("openAdd") === "true"
  );
  const [editing, setEditing] = useState(null);

  const bankOptions = useMemo(
    () => [...new Set(accounts.map((account) => account.bank))],
    [accounts]
  );

  const rows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return accounts.filter((account) => {
      if (term) {
        const haystack = `${account.bank} ${account.norek} ${bankCode(account.bank)}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (bank.length && !bank.includes(account.bank)) return false;
      if (status.length && !status.includes(account.status)) return false;
      return true;
    });
  }, [accounts, searchTerm, bank, status]);

  const activeFilterCount = bank.length + status.length;

  const resetFilters = () => {
    setBank([]);
    setStatus([]);
  };

  const openAddModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEditModal = (account) => {
    setEditing(account);
    setModalOpen(true);
  };

  const submitAccount = async (account) => {
    setLoading(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from("banks")
          .update(account)
          .eq("id", account.id || editing.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("banks")
          .insert([account])
          .select();
        if (error) throw error;
        if (data && data[0]) {
          account = data[0];
        }
      }

      setAccounts((prev) => {
        const next = editing
          ? prev.map((item) => (item === editing ? account : item))
          : [account, ...prev];
        return account.utama
          ? next.map((item) => (item === account ? item : { ...item, utama: false }))
          : next;
      });

      toast.success(
        editing
          ? `Rekening ${account.bank} berhasil diperbarui.`
          : `Rekening ${account.bank} berhasil ditambahkan.`
      );
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan rekening.");
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditing(null);
    }
  };

  const removeAccount = async (account) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("banks")
        .delete()
        .eq("id", account.id);
      if (error) throw error;
      setAccounts((prev) => prev.filter((item) => item !== account));
      toast.success(`Rekening ${account.bank} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus rekening.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListPage
        title="Rekening Bank"
        actions={
          <Button size="sm" onClick={openAddModal} disabled={loading}>
            <Plus className="size-3.5" />
            Tambah Rekening
          </Button>
        }
        search={{
          placeholder: "Cari no rek, dan bank",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        filters={
          <>
            <FilterMultiSelect label="Bank" options={bankOptions} value={bank} onChange={setBank} />
            <FilterMultiSelect
              label="Status"
              options={STATUS_OPTIONS}
              value={status}
              onChange={setStatus}
            />

            {activeFilterCount > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={resetFilters}>
                Reset filter ({activeFilterCount})
              </Button>
            )}
          </>
        }
        columns={[
          {
            key: "bank",
            header: "Bank",
            cell: (account) => (
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">{account.bank}</span>
                {account.utama && <StatusBadge value="Utama" tone="sky" />}
              </div>
            ),
          },
          {
            key: "norek",
            header: "Nomor Rekening",
            cellClassName: "font-mono whitespace-nowrap",
          },
          {
            key: "aksi",
            header: "Aksi",
            align: "center",
            csv: () => "",
            cell: (account) => (
              <RowActionsMenu
                name={account.bank}
                onEdit={() => openEditModal(account)}
                onDelete={() => removeAccount(account)}
              />
            ),
          },
        ]}
        rows={rows}
      />

      <BankFormModal
        key={editing ? `${editing.bank}-${editing.norek}` : "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        account={editing}
        onSubmit={submitAccount}
      />
    </>
  );
}

const EMPTY_BANK_FORM = {
  bank: "",
  norek: "",
  pemilik: "",
  aktif: true,
  utama: false,
};

function toBankForm(account) {
  if (!account) return EMPTY_BANK_FORM;
  return {
    bank: account.bank,
    norek: account.norek,
    pemilik: account.pemilik ?? "",
    aktif: account.status !== "Nonaktif",
    utama: Boolean(account.utama),
  };
}

function BankFormModal({ open, onOpenChange, account, onSubmit }) {
  const [form, setForm] = useState(() => toBankForm(account));
  const [errors, setErrors] = useState({});

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    if (!form.bank) nextErrors.bank = "Bank wajib dipilih.";
    if (!form.norek.trim()) nextErrors.norek = "Nomor rekening wajib diisi.";
    else if (!/^\d{6,}$/.test(form.norek.trim()))
      nextErrors.norek = "Nomor rekening minimal 6 digit angka.";
    if (!form.pemilik.trim()) nextErrors.pemilik = "Pemilik rekening wajib diisi.";

    const firstError = Object.values(nextErrors)[0];
    if (firstError) {
      setErrors(nextErrors);
      toast.error(firstError);
      return;
    }

    setErrors({});
    onSubmit({
      ...(account || { id: `bnk-${Date.now()}` }),
      bank: form.bank,
      norek: form.norek.trim(),
      pemilik: form.pemilik.trim(),
      status: form.aktif ? "Aktif" : "Nonaktif",
      utama: form.utama,
    });
    if (!account) setForm(EMPTY_BANK_FORM);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={account ? "Edit Rekening" : "Tambah Rekening"}
      description="Rekening ini dipakai sebagai tujuan transfer pembayaran jamaah."
      onSubmit={submit}
      submitLabel={account ? "Simpan Perubahan" : "Simpan"}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_7rem]">
        <div className="space-y-1.5">
          <Label htmlFor="bank-nama">Bank *</Label>
          <Select value={form.bank} onValueChange={set("bank")}>
            <SelectTrigger id="bank-nama" className="w-full" aria-invalid={Boolean(errors.bank)}>
              <SelectValue placeholder="Cari nama atau kode bank..." />
            </SelectTrigger>
            <SelectContent>
              {BANK_OPTIONS.map((option) => (
                <SelectItem key={option.code} value={option.name}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.bank && <p className="text-xs text-destructive">{errors.bank}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bank-kode">Kode</Label>
          <Input
            id="bank-kode"
            readOnly
            value={form.bank ? bankCode(form.bank) : "000"}
            className="font-mono text-center"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bank-norek">No. Rekening *</Label>
        <Input
          id="bank-norek"
          inputMode="numeric"
          value={form.norek}
          aria-invalid={Boolean(errors.norek)}
          onChange={(event) => set("norek")(event.target.value)}
          placeholder="1109276111"
        />
        {errors.norek && <p className="text-xs text-destructive">{errors.norek}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bank-pemilik">Pemilik Rekening *</Label>
        <Input
          id="bank-pemilik"
          value={form.pemilik}
          aria-invalid={Boolean(errors.pemilik)}
          onChange={(event) => set("pemilik")(event.target.value)}
          placeholder="Nama pemilik rekening"
        />
        {errors.pemilik && <p className="text-xs text-destructive">{errors.pemilik}</p>}
      </div>

      <div className="space-y-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox checked={form.aktif} onCheckedChange={set("aktif")} />
          Aktifkan
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <Checkbox checked={form.utama} onCheckedChange={set("utama")} />
          Jadikan Rekening Utama
        </label>
      </div>
    </Modal>
  );
}

