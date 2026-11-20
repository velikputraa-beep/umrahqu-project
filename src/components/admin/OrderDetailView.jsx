"use client";

import React, { useState } from "react";
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  List,
  ListOrdered,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Paperclip,
  HelpCircle,
  User,
} from "lucide-react";
import StatusBadge from "@/components/admin/StatusBadge";

export default function OrderDetailView({ order, onBack }) {
  const [activeTab, setActiveTab] = useState("internal");
  const [noteText, setNoteText] = useState("");
  const [notes, setNotes] = useState([]);
  const [expandedStep, setExpandedStep] = useState("dokumen");

  // Fallback defaults matching screenshot
  const orderData = {
    id: order?.id || "MP-261112RPFD301",
    paket: order?.paket?.replace(/^\d+x\s*/, "") || "UMROH PLUS AN-NAHL",
    status: order?.status || "Dikonfirmasi",
    tglPesan: order?.tglPesan || "12 Nov 2026",
    tglBerangkat: order?.tglBerangkat || "11 Agu 2027",
    pemesan: order?.pemesan || "User Jamaah 1",
    telpon: order?.telpon || "+6281234000333",
    email: order?.email || "user1@gmail.com",
    sumber: order?.sumber || "Marketplace",
    dikonfirmasiOleh: order?.dikonfirmasiOleh || "Budiono",
    kodeReferral: order?.kodeReferral || "-",
    skemaPembayaran: order?.skemaPembayaran || "Cicilan",
    biaya: order?.biaya || "Rp 35.000.000",
    dibayar: order?.dibayar || "Rp 35.000.000",
    kekurangan: order?.sisa || "Rp 0",
    jatuhTempo: order?.jatuhTempo || "12 Des 2026",
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setNotes([
      ...notes,
      {
        id: Date.now(),
        author: "Admin",
        time: "Baru saja",
        text: noteText,
        type: activeTab,
      },
    ]);
    setNoteText("");
  };

  const toggleStep = (stepKey) => {
    setExpandedStep(expandedStep === stepKey ? null : stepKey);
  };

  return (
    <div className="space-y-6">
      {/* Top action header: Back button, Order ID, Title & Print */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Kembali ke Daftar Pesanan</span>
            </button>
          )}
          <div className="text-xs font-mono font-medium text-muted-foreground tracking-wider">
            {orderData.id}
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight mt-0.5">
            {orderData.paket}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2.5 bg-card hover:bg-muted border border-border rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            title="Cetak Pesanan"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Left details (~68%) + Right Timeline (~32%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Ringkasan Pesanan & Jamaah */}
          <div className="bg-card border border-border rounded-xl p-6">
            {/* RINGKASAN PESANAN */}
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">
              RINGKASAN PESANAN
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3.5 text-xs">
              {/* Left Sub-Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status Pesanan</span>
                  <StatusBadge value={orderData.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tgl. pesan</span>
                  <span className="font-medium text-foreground">
                    {orderData.tglPesan}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tgl. Berangkat</span>
                  <span className="font-medium text-foreground">
                    {orderData.tglBerangkat}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pemesan</span>
                  <span className="font-medium text-foreground">
                    {orderData.pemesan}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">No. Telpon pemesan</span>
                  <span className="font-medium text-foreground font-mono">
                    {orderData.telpon}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email Pemesan</span>
                  <span className="font-medium text-foreground">
                    {orderData.email}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Sumber</span>
                  <span className="font-medium text-foreground">
                    {orderData.sumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Dikonfirmasi oleh</span>
                  <span className="font-medium text-foreground">
                    {orderData.dikonfirmasiOleh}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Kode referral</span>
                  <span className="font-medium text-muted-foreground">
                    {orderData.kodeReferral}
                  </span>
                </div>
              </div>

              {/* Right Sub-Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Skema Pembayaran</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    {orderData.skemaPembayaran}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Biaya</span>
                  <span className="font-medium text-foreground">
                    {orderData.biaya}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Dibayar</span>
                  <span className="font-medium text-foreground">
                    {orderData.dibayar}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Kekurangan bayar</span>
                  <span className="font-medium text-foreground">
                    {orderData.kekurangan}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Jatuh tempo</span>
                  <span className="font-medium text-foreground">
                    {orderData.jatuhTempo}
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border my-7" />

            {/* JAMAAH */}
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-5">
              JAMAAH
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3.5 text-xs">
              {/* Left Sub-Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Nama</span>
                  <span className="font-medium text-foreground">User Jamaah 1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">No. Telpon</span>
                  <span className="font-medium text-foreground font-mono">
                    +6281234000333
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Gender</span>
                  <span className="font-medium text-foreground">Laki-laki</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Umur</span>
                  <span className="text-muted-foreground">-</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground whitespace-nowrap">
                    Kelengkapan data
                  </span>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-1.5 rounded-full w-0" />
                    </div>
                    <span className="font-medium text-muted-foreground text-[11px]">
                      0/5
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Alamat</span>
                  <span className="text-muted-foreground">-</span>
                </div>

                <div className="pt-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    RIWAYAT PENYAKIT
                  </div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] bg-muted text-muted-foreground border border-border font-medium">
                    Tidak Ada
                  </span>
                </div>

                <div className="pt-2">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    LAMPIRAN
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Belum ada dokumen
                  </span>
                </div>
              </div>

              {/* Right Sub-Column */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Tiket Pesawat</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Belum Selesai
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ruang Hotel</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    Belum Selesai
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Paspor</span>
                  <span className="text-muted-foreground">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Visa</span>
                  <span className="text-muted-foreground">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Vaksin Meningitis</span>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] bg-muted text-muted-foreground border border-border font-medium">
                    Belum
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground whitespace-nowrap">
                    Perlengkapan
                  </span>
                  <div className="flex items-center gap-2 flex-1 justify-end">
                    <div className="w-24 bg-muted rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-1.5 rounded-full w-full" />
                    </div>
                    <span className="font-medium text-primary text-[11px]">
                      7/7
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Catatan Internal / Eksternal Tabs */}
          <div className="space-y-3">
            <div className="flex items-center gap-6 border-b border-border pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("internal")}
                className={`flex items-center gap-2 text-xs font-semibold pb-2 -mb-2.5 transition-colors border-b-2 ${
                  activeTab === "internal"
                    ? "text-foreground border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[10px] text-amber-300 font-bold">
                  <User className="w-3 h-3" />
                </div>
                <span>Catatan internal</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("eksternal")}
                className={`text-xs font-semibold pb-2 -mb-2.5 transition-colors border-b-2 ${
                  activeTab === "eksternal"
                    ? "text-foreground border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                Catatan eksternal
              </button>
            </div>

            {/* Note Editor Box */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Text formatting toolbar */}
              <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-muted text-muted-foreground">
                <button
                  type="button"
                  className="p-1 hover:text-foreground hover:bg-muted rounded"
                  title="List"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1 hover:text-foreground hover:bg-muted rounded"
                  title="Numbered List"
                >
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-3.5 bg-border mx-1" />
                <button
                  type="button"
                  className="p-1 hover:text-foreground hover:bg-muted rounded"
                  title="Bold"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1 hover:text-foreground hover:bg-muted rounded"
                  title="Italic"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1 hover:text-foreground hover:bg-muted rounded"
                  title="Underline"
                >
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  className="p-1 hover:text-foreground hover:bg-muted rounded"
                  title="Strikethrough"
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Textarea */}
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Catatan..."
                rows={3}
                className="w-full bg-transparent px-3.5 py-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
              />

              {/* Footer toolbar */}
              <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-border bg-muted/50 text-xs">
                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                  <Paperclip className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Drop file disini atau</span>
                  <label className="text-primary hover:underline cursor-pointer">
                    pilih file
                    <input type="file" className="hidden" />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={handleAddNote}
                  className="px-3.5 py-1.5 bg-primary hover:bg-primary/80 text-primary-foreground rounded-md text-xs font-medium transition-colors"
                >
                  Kirim catatan
                </button>
              </div>
            </div>

            {/* Note items or Empty State */}
            {notes.filter((n) => n.type === activeTab).length === 0 ? (
              <div className="border border-dashed border-border rounded-xl p-8 text-center bg-muted/30">
                <div className="w-8 h-8 rounded-full border border-border bg-muted flex items-center justify-center mx-auto mb-2 text-muted-foreground">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-semibold text-foreground mb-0.5">
                  Belum ada catatan
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Belum ada catatan {activeTab} antar staf untuk pesanan ini.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {notes
                  .filter((n) => n.type === activeTab)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-card border border-border rounded-lg text-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1">
                        <span className="font-semibold text-foreground">
                          {item.author}
                        </span>
                        <span>{item.time}</span>
                      </div>
                      <p className="text-foreground">{item.text}</p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-4">
          <div className="bg-card border border-border rounded-xl p-5 sticky top-24">
            <h2 className="text-sm font-semibold text-foreground mb-5">Timeline</h2>

            <div className="space-y-0 text-xs">
              {/* 1. Pemesanan (Completed) */}
              <div className="relative pl-6 pb-6">
                <div className="absolute left-[7px] top-3 bottom-0 w-px bg-border" />
                <div className="absolute left-0 top-0.5 w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                </div>
                <button
                  type="button"
                  onClick={() => toggleStep("pemesanan")}
                  className="w-full flex items-center justify-between text-left font-medium text-foreground"
                >
                  <span>Pemesanan</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* 2. Pembayaran (Completed) */}
              <div className="relative pl-6 pb-6">
                <div className="absolute left-[7px] top-3 bottom-0 w-px bg-border" />
                <div className="absolute left-0 top-0.5 w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                </div>
                <button
                  type="button"
                  onClick={() => toggleStep("pembayaran")}
                  className="w-full flex items-center justify-between text-left font-medium text-foreground"
                >
                  <span>Pembayaran</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>

              {/* 3. Dokumen & Perlengkapan (Current / In-Progress / Expanded) */}
              <div className="relative pl-6 pb-6">
                <div className="absolute left-[7px] top-3 bottom-0 w-px bg-border" />
                <div className="absolute left-0 top-0.5 w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                </div>
                <button
                  type="button"
                  onClick={() => toggleStep("dokumen")}
                  className="w-full flex items-center justify-between text-left font-semibold text-foreground"
                >
                  <span>Dokumen & Perlengkapan</span>
                  {expandedStep === "dokumen" ? (
                    <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  )}
                </button>

                {expandedStep === "dokumen" && (
                  <div className="mt-3.5 pl-2 space-y-3.5 border-l border-dashed border-border ml-1">
                    {/* Sub-item 1 */}
                    <div className="relative pl-4">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full border border-muted-foreground/40 bg-background" />
                      <div className="font-medium text-foreground">
                        Melengkapi Berkas & Paspor
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Verifikasi paspor dan identitas jamaah
                      </div>
                    </div>

                    {/* Sub-item 2 */}
                    <div className="relative pl-4">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full border border-muted-foreground/40 bg-background" />
                      <div className="font-medium text-foreground">
                        Pengurusan Visa
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Penerbitan visa umrah resmi
                      </div>
                    </div>

                    {/* Sub-item 3 */}
                    <div className="relative pl-4">
                      <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full border border-muted-foreground/40 bg-background" />
                      <div className="font-medium text-foreground">
                        Pembagian Peralatan
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        Penyerahan koper, kain ihram, dan perlengkapan
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Pra-Keberangkatan */}
              <div className="relative pl-6 pb-6">
                <div className="absolute left-[7px] top-3 bottom-0 w-px bg-border" />
                <div className="absolute left-0.5 top-1 w-3 h-3 rounded-full border border-muted-foreground/40 bg-card" />
                <button
                  type="button"
                  onClick={() => toggleStep("pra-keberangkatan")}
                  className="w-full flex items-center justify-between text-left text-muted-foreground hover:text-foreground"
                >
                  <span>Pra-Keberangkatan</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/70" />
                </button>
              </div>

              {/* 5. Keberangkatan */}
              <div className="relative pl-6 pb-6">
                <div className="absolute left-[7px] top-3 bottom-0 w-px bg-border" />
                <div className="absolute left-0.5 top-1 w-3 h-3 rounded-full border border-muted-foreground/40 bg-card" />
                <button
                  type="button"
                  onClick={() => toggleStep("keberangkatan")}
                  className="w-full flex items-center justify-between text-left text-muted-foreground hover:text-foreground"
                >
                  <span>Keberangkatan</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/70" />
                </button>
              </div>

              {/* 6. Pelaksanaan */}
              <div className="relative pl-6 pb-6">
                <div className="absolute left-[7px] top-3 bottom-0 w-px bg-border" />
                <div className="absolute left-0.5 top-1 w-3 h-3 rounded-full border border-muted-foreground/40 bg-card" />
                <button
                  type="button"
                  onClick={() => toggleStep("pelaksanaan")}
                  className="w-full flex items-center justify-between text-left text-muted-foreground hover:text-foreground"
                >
                  <span>Pelaksanaan</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/70" />
                </button>
              </div>

              {/* 7. Pulang */}
              <div className="relative pl-6 pb-6">
                <div className="absolute left-[7px] top-3 bottom-0 w-px bg-border" />
                <div className="absolute left-0.5 top-1 w-3 h-3 rounded-full border border-muted-foreground/40 bg-card" />
                <button
                  type="button"
                  onClick={() => toggleStep("pulang")}
                  className="w-full flex items-center justify-between text-left text-muted-foreground hover:text-foreground"
                >
                  <span>Pulang</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/70" />
                </button>
              </div>

              {/* 8. Selesai */}
              <div className="relative pl-6">
                <div className="absolute left-0.5 top-1 w-3 h-3 rounded-full border border-muted-foreground/40 bg-card" />
                <button
                  type="button"
                  onClick={() => toggleStep("selesai")}
                  className="w-full flex items-center justify-between text-left text-muted-foreground hover:text-foreground"
                >
                  <span>Selesai</span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/70" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

