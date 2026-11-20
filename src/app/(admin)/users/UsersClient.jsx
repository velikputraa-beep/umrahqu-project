"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Plus, User } from "lucide-react";
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
import { createUserAction, removeUserAction } from "./actions";
import { ROLES, ROLE_OPTIONS, roleParts } from "@/lib/roles";

export default function UsersClient({ initialUsers }) {
  const router = useRouter();
  const supabase = createClient();
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [role, setRole] = useState([]);
  const [travel, setTravel] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const travelOptions = [...new Set(users.map((user) => user.travel))].filter((item) => item !== "—");

  const rows = users.filter((user) => {
    const term = searchTerm.trim().toLowerCase();
    if (term && !`${user.nama} ${user.email} ${user.travel}`.toLowerCase().includes(term)) {
      return false;
    }
    if (role.length && !role.includes(roleParts(user.role).label)) return false;
    if (travel.length && !travel.includes(user.travel)) return false;
    return true;
  });

  const openAddModal = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditing(user);
    setModalOpen(true);
  };

  const submitUser = async (user) => {
    setLoading(true);
    try {
      if (editing) {
        // Update in Supabase
        const { error } = await supabase
          .from("users")
          .update({
            nama: user.nama,
            email: user.email,
            role: user.role,
          })
          .eq("id", user.id || editing.id);

        if (error) throw error;
        setUsers((prev) => prev.map((item) => (item === editing ? user : item)));
        toast.success(`Pengguna ${user.nama} berhasil diperbarui.`);
      } else {
        // Server Action creates the Auth account and the public.users row.
        const result = await createUserAction(user);
        if (!result.ok) throw new Error(result.error);
        setUsers((prev) => [result.user, ...prev]);
        toast.success(`Pengguna ${result.user.nama} berhasil ditambahkan.`);
      }
      setModalOpen(false);
      setEditing(null);
      router.refresh();
      return true;
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal menyimpan pengguna.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeUser = async (user) => {
    setLoading(true);
    try {
      const result = await removeUserAction(user.id);
      if (!result.ok) throw new Error(result.error);
      setUsers((prev) => prev.filter((item) => item !== user));
      if (result.warning) {
        toast.info(`Pengguna ${user.nama} dihapus, tapi ${result.warning}`);
      } else {
        toast.success(`Pengguna ${user.nama} berhasil dihapus.`);
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal menghapus pengguna.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ListPage
        title="Pengguna"
        actions={
          <Button size="sm" onClick={openAddModal} disabled={loading}>
            <Plus className="size-3.5" />
            Tambah Pengguna
          </Button>
        }
        search={{
          placeholder: "Cari nama atau email...",
          value: searchTerm,
          onChange: setSearchTerm,
        }}
        filters={
          <>
            <FilterMultiSelect label="Role" options={ROLE_OPTIONS} value={role} onChange={setRole} />
            <FilterMultiSelect
              label="Travel"
              options={travelOptions}
              value={travel}
              onChange={setTravel}
            />
          </>
        }
        columns={[
          {
            key: "nama",
            header: "Pengguna",
            cell: (user) => (
              <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                  <User className="size-4 text-muted-foreground" />
                </div>
                <span className="font-medium text-foreground">{user.nama}</span>
              </div>
            ),
          },
          {
            key: "email",
            header: "Email",
            cell: (user) => <span className="font-mono text-muted-foreground">{user.email}</span>,
          },
          { key: "travel", header: "Travel" },
          {
            key: "role",
            header: "Role",
            cell: (user) => {
              const { label, tone } = roleParts(user.role);
              return <StatusBadge value={label} tone={tone} />;
            },
          },
          { key: "tglDaftar", header: "Tgl. Daftar" },
          { key: "terakhirLogin", header: "Terakhir Login" },
          {
            key: "aksi",
            header: "",
            align: "right",
            csv: () => "",
            cell: (user) => (
              <div className="flex items-center justify-end gap-1">
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Kirim undangan">
                  <Mail className="size-4" />
                </Button>
                <RowActionsMenu
                  name={user.nama}
                  onEdit={() => openEditModal(user)}
                  onDelete={() => removeUser(user)}
                />
              </div>
            ),
          },
        ]}
        rows={rows}
      />

      <UserFormModal
        key={editing ? `${editing.nama}-${editing.email}-${editing.tglDaftar}` : "new"}
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={editing}
        onSubmit={submitUser}
      />
    </>
  );
}

const EMPTY_USER_FORM = {
  nama: "",
  email: "",
  password: "",
  konfirmasi: "",
  role: "customer",
};

function toUserForm(user) {
  if (!user) return EMPTY_USER_FORM;
  return {
    nama: user.nama,
    email: user.email,
    password: "",
    konfirmasi: "",
    role: roleParts(user.role).value,
  };
}

function UserFormModal({ open, onOpenChange, user, onSubmit }) {
  const [form, setForm] = useState(() => toUserForm(user));
  const [errors, setErrors] = useState({});

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!form.nama.trim()) next.nama = "Nama lengkap wajib diisi.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = "Format email tidak valid.";
    if (!user) {
      if (form.password.length < 6) next.password = "Password minimal 6 karakter.";
      if (form.konfirmasi !== form.password) next.konfirmasi = "Konfirmasi password tidak sama.";
    }

    setErrors(next);
    const message = Object.values(next)[0];
    if (message) {
      toast.error(message);
      return;
    }

    const saved = await onSubmit(
      user
        ? {
            ...user,
            nama: form.nama.trim(),
            email: form.email.trim(),
            role: form.role,
          }
        : {
            nama: form.nama.trim(),
            email: form.email.trim(),
            password: form.password,
            role: form.role,
          }
    );
    if (saved && !user) setForm(EMPTY_USER_FORM);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={user ? "Edit Pengguna" : "Tambah Pengguna"}
      description="Akun baru langsung mendapat akses sesuai role yang dipilih."
      onSubmit={submit}
      submitLabel={user ? "Simpan Perubahan" : "Simpan Pengguna"}
    >
      <div className="space-y-1.5">
        <Label htmlFor="user-nama">Nama Lengkap</Label>
        <Input
          id="user-nama"
          value={form.nama}
          aria-invalid={Boolean(errors.nama)}
          onChange={(event) => set("nama")(event.target.value)}
          placeholder="Nama lengkap pengguna"
        />
        {errors.nama && <p className="text-xs text-destructive">{errors.nama}</p>}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="user-email">Email</Label>
        <Input
          id="user-email"
          type="email"
          value={form.email}
          aria-invalid={Boolean(errors.email)}
          onChange={(event) => set("email")(event.target.value)}
          placeholder="user@umrahqu.id"
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="user-password">Password</Label>
          <Input
            id="user-password"
            type="password"
            value={form.password}
            aria-invalid={Boolean(errors.password)}
            onChange={(event) => set("password")(event.target.value)}
            placeholder="Minimal 6 karakter"
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="user-konfirmasi">Konfirmasi Password</Label>
          <Input
            id="user-konfirmasi"
            type="password"
            value={form.konfirmasi}
            aria-invalid={Boolean(errors.konfirmasi)}
            onChange={(event) => set("konfirmasi")(event.target.value)}
          />
          {errors.konfirmasi && <p className="text-xs text-destructive">{errors.konfirmasi}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Role</Label>
        <Select value={form.role} onValueChange={set("role")}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLES.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </Modal>
  );
}
