"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Modal from "@/components/admin/Modal";
import StatusBadge from "@/components/admin/StatusBadge";
import RowActionsMenu from "@/components/admin/RowActionsMenu";
import { toast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";

export default function CategoriesClient({ initialCategories }) {
  const router = useRouter();
  const supabase = createClient();
  const [categories, setCategories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);
  const [openSections, setOpenSections] = useState({
    haji: true,
    tourHalal: true,
    umrah: true,
  });
  const [modal, setModal] = useState({ open: false, tab: "utama", parent: "", editing: null });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const openModal = (tab, parent = "") => setModal({ open: true, tab, parent, editing: null });

  const openEditCategoryModal = (category) => {
    setModal({
      open: true,
      tab: "utama",
      parent: "",
      editing: { kind: "category", category },
    });
  };

  const openEditSubModal = (category, sub) => {
    setModal({
      open: true,
      tab: "sub",
      parent: category.id,
      editing: { kind: "sub", category, sub },
    });
  };

  const removeCategory = async (category) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("categories").delete().eq("id", category.id);
      if (error) throw error;

      setCategories((prev) => prev.filter((item) => item.id !== category.id));
      toast.success(`Kategori ${category.title} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus kategori.");
    } finally {
      setLoading(false);
    }
  };

  const removeSubcategory = async (category, sub) => {
    setLoading(true);
    try {
      const nextSubs = (category.subcategories ?? []).filter((s) => s.name !== sub.name);
      const { error } = await supabase
        .from("categories")
        .update({ subcategories: nextSubs })
        .eq("id", category.id);
      if (error) throw error;

      setCategories((prev) =>
        prev.map((item) => (item.id === category.id ? { ...item, subcategories: nextSubs } : item))
      );
      toast.success(`Sub-kategori ${sub.name} berhasil dihapus.`);
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menghapus sub-kategori.");
    } finally {
      setLoading(false);
    }
  };

  const submitCategory = async ({ nama, aktif, parent }) => {
    setLoading(true);
    const editing = modal.editing;
    try {
      if (editing?.kind === "sub") {
        const { category, sub } = editing;
        const updatedSub = { ...sub, name: nama, status: aktif ? "Aktif" : "Nonaktif" };
        const nextSubs = (category.subcategories ?? []).map((s) =>
          s.name === sub.name ? updatedSub : s
        );
        const { error } = await supabase
          .from("categories")
          .update({ subcategories: nextSubs })
          .eq("id", category.id);
        if (error) throw error;

        setCategories((prev) =>
          prev.map((item) =>
            item.id === category.id ? { ...item, subcategories: nextSubs } : item
          )
        );
        toast.success(`Sub-kategori ${nama} berhasil diperbarui.`);
        setModal((prev) => ({ ...prev, open: false, editing: null }));
        router.refresh();
        return;
      }

      if (editing?.kind === "category") {
        const { category } = editing;
        const updated = {
          ...category,
          title: nama,
          status: aktif ? "Aktif" : "Nonaktif",
        };
        const { error } = await supabase
          .from("categories")
          .update({ title: updated.title, status: updated.status })
          .eq("id", category.id);
        if (error) throw error;

        setCategories((prev) => prev.map((item) => (item.id === category.id ? updated : item)));
        toast.success(`Kategori ${nama} berhasil diperbarui.`);
        setModal((prev) => ({ ...prev, open: false, editing: null }));
        router.refresh();
        return;
      }

      if (parent) {
        const parentCategory = categories.find((item) => item.id === parent);
        const newSub = { name: nama, count: 0, status: aktif ? "Aktif" : "Nonaktif" };
        const nextSubs = [newSub, ...(parentCategory?.subcategories ?? [])];
        const { error } = await supabase
          .from("categories")
          .update({ subcategories: nextSubs })
          .eq("id", parent);
        if (error) throw error;

        setCategories((prev) =>
          prev.map((category) =>
            category.id === parent ? { ...category, subcategories: nextSubs } : category
          )
        );
        toast.success(`Sub-kategori ${nama} berhasil ditambahkan.`);
      } else {
        const newCat = {
          id: nama.toLowerCase().replace(/\s+/g, "-"),
          title: nama,
          paketCount: 0,
          status: aktif ? "Aktif" : "Nonaktif",
          subcategories: [],
        };
        const { error } = await supabase.from("categories").insert([newCat]);
        if (error) throw error;

        setCategories((prev) => [newCat, ...prev]);
        toast.success(`Kategori ${nama} berhasil ditambahkan.`);
      }
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("Gagal menyimpan kategori.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Kategori</h1>
        <Button size="sm" onClick={() => openModal("utama")} disabled={loading}>
          <Plus className="size-3.5" />
          Tambah Kategori
        </Button>
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const isOpen = openSections[category.id] !== false;
          return (
            <div key={category.id} className="overflow-hidden rounded-xl border border-white/10 bg-card shadow-xs">
              <div
                onClick={() => toggleSection(category.id)}
                className="flex cursor-pointer select-none items-center justify-between p-4 transition-colors hover:bg-accent/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-foreground">{category.title}</span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {category.paketCount} paket
                  </span>
                </div>

                <div
                  className="flex items-center gap-3"
                  onClick={(event) => event.stopPropagation()}
                >
                  <StatusBadge value={category.status} />
                  <RowActionsMenu
                    name={category.title}
                    onEdit={() => openEditCategoryModal(category)}
                    onDelete={() => removeCategory(category)}
                  />
                  <span className="text-muted-foreground">
                    {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                  </span>
                </div>
              </div>

              {isOpen && (
                <div className="space-y-2 border-t border-white/10 bg-muted/30 p-4">
                  {category.subcategories?.map((sub, idx) => (
                    <div
                      key={`${sub.name}-${idx}`}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-card p-3 transition-colors hover:border-white/20"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-foreground">{sub.name}</span>
                        <span className="text-[11px] text-muted-foreground">{sub.count} paket</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge value={sub.status} />
                        <RowActionsMenu
                          name={sub.name}
                          onEdit={() => openEditSubModal(category, sub)}
                          onDelete={() => removeSubcategory(category, sub)}
                        />
                      </div>
                    </div>
                  ))}

                  <div className="flex justify-end pt-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => openModal("sub", category.id)}
                      disabled={loading}
                    >
                      <Plus className="size-3.5" />
                      Tambah Sub Kategori
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CategoryFormModal
        key={
          modal.editing
            ? `edit-${modal.editing.kind}-${modal.editing.category.id}-${modal.editing.sub?.name ?? ""}`
            : `${modal.tab}-${modal.parent}`
        }
        open={modal.open}
        onOpenChange={(next) =>
          setModal((prev) => ({ ...prev, open: next, editing: next ? prev.editing : null }))
        }
        initialTab={modal.tab}
        initialParent={modal.parent}
        editing={modal.editing}
        categories={categories}
        onSubmit={submitCategory}
      />
    </div>
  );
}

function CategoryFormModal({
  open,
  onOpenChange,
  initialTab,
  initialParent,
  editing,
  categories,
  onSubmit,
}) {
  const [tab, setTab] = useState(initialTab);
  const [form, setForm] = useState(() =>
    editing
      ? editing.kind === "category"
        ? {
            nama: editing.category.title,
            induk: editing.category.id,
            aktif: editing.category.status !== "Nonaktif",
          }
        : {
            nama: editing.sub.name,
            induk: editing.category.id,
            aktif: editing.sub.status !== "Nonaktif",
          }
      : {
          nama: "",
          induk: initialParent || categories[0]?.id || "",
          aktif: true,
        }
  );
  const [error, setError] = useState("");

  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    if (!form.nama.trim()) {
      setError("Nama kategori wajib diisi.");
      toast.error("Nama kategori wajib diisi.");
      return;
    }
    setError("");
    onSubmit({
      nama: form.nama.trim(),
      aktif: form.aktif,
      parent: tab === "sub" ? form.induk : "",
    });
    setForm({ nama: "", induk: form.induk, aktif: true });
    onOpenChange(false);
  };

  const editingCategory = editing?.kind === "category";
  const modalTitle = editing
    ? editingCategory
      ? "Edit Kategori"
      : "Edit Sub Kategori"
    : "Tambah Kategori";

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={submit}
      title={modalTitle}
      description="Kategori utama mengelompokkan paket, sub-kategori memfilter varian paket."
      submitLabel={editing ? "Simpan Perubahan" : "Simpan"}
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full justify-center">
          <TabsTrigger value="utama" disabled={editing && !editingCategory}>
            Kategori Utama
          </TabsTrigger>
          <TabsTrigger value="sub" disabled={editing && editingCategory}>
            Sub-Kategori
          </TabsTrigger>
        </TabsList>

        <TabsContent value="utama" className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="kategori-nama">Nama *</Label>
            <Input
              id="kategori-nama"
              value={form.nama}
              aria-invalid={Boolean(error)}
              onChange={(event) => set("nama")(event.target.value)}
              placeholder="Umrah, Haji, Tour"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </TabsContent>

        <TabsContent value="sub" className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Induk Kategori</Label>
            <Select value={form.induk} onValueChange={set("induk")}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Pilih kategori..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subkategori-nama">Nama *</Label>
            <Input
              id="subkategori-nama"
              value={form.nama}
              aria-invalid={Boolean(error)}
              onChange={(event) => set("nama")(event.target.value)}
              placeholder="Reguler, Plus, VIP"
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        </TabsContent>
      </Tabs>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <Checkbox checked={form.aktif} onCheckedChange={set("aktif")} />
        Aktifkan
      </label>
    </Modal>
  );
}
