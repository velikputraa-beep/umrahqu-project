# Spesifikasi Perilaku — admin.umrahqu.com

Hasil inspeksi read-only pada 2026-11-14. Sumber: situs produksi, diakses lewat browser.
Tidak ada data produksi yang dibuat, diubah, atau dihapus selama inspeksi.

## 1. Stack & kerangka

| Aspek | Nilai produksi | Catatan lokal |
| --- | --- | --- |
| Framework | Next.js `16.3.1-canary.13` + Turbopack | lokal `16.4.6` — setara |
| UI kit | shadcn/radix, `data-slot` di semua primitif | sudah dipakai (`style: radix-nova`) |
| CSS | Tailwind v4 | sudah |
| Font | Geist + **Outfit** (`--font-body-family`) | belum dipasang |
| Tema | dark default, primary **emerald-500**, `--radius: .4rem`, header 48px | primary lokal masih netral |

`data-slot` yang terlihat: `sidebar-wrapper`, `sidebar`, `sidebar-menu`, `sidebar-menu-item`,
`sidebar-menu-button`, `sidebar-menu-sub`, `sidebar-menu-sub-item`, `sidebar-menu-sub-button`,
`collapsible`/`collapsible-trigger`/`collapsible-content`, `chip`, `badge`, `button`, `input`,
`kbd`, `table-container`, `table`, `table-header`, `table-row`, `table-head`, `table-cell`,
`select-trigger`, `select-value`, `popover-trigger`, `avatar`, `dropdown-menu-trigger`.

## 2. Peta rute (25)

| URL produksi | Judul sidebar | `<title>` |
| --- | --- | --- |
| `/` | Dashboard | Ringkasan & analitik platform |
| `/bookings` | Pesanan › Dashboard | Dashboard pesanan umrah |
| `/bookings/list` | Pesanan › Daftar Pesanan | Daftar pesanan umrah |
| `/bookings/{id}` | (dari tombol aksi) | Detail pesanan |
| `/finance` | Keuangan › Dashboard | Ringkasan keuangan platform |
| `/transactions` | Keuangan › Transaksi | Riwayat transaksi pembayaran |
| `/invoices` | Keuangan › Invoice | Invoice |
| `/invoices/new` | (tombol "Buat Invoice") | Formulir Faktur |
| `/banks` | Keuangan › Rekening | Rekening Bank |
| `/deposits` | Keuangan › Saldo Travel › Deposit | Kelola deposit travel agency |
| `/withdraws` | Keuangan › Saldo Travel › Pencairan | Pencairan Dana Jamaah |
| `/registrations` | Kemitraan › Pengajuan | Pendaftaran travel agency |
| `/travels` | Kemitraan › Travel | Kelola Travel Agency |
| `/travels/documents` | Kemitraan › Dokumen | Verifikasi Dokumen Legalitas |
| `/domains` | Kemitraan › Web & Domain › Domain | — |
| `/websites` | Kemitraan › Web & Domain › Website | — |
| `/packages` | Master Data › Paket | Kelola Paket Umrah |
| `/packages/{slug}` | (baris tabel paket) | Detail paket |
| `/categories` | Master Data › Kategori | Kategori Paket |
| `/hotels` | Master Data › Hotel | Kelola Hotel |
| `/airlines` | Master Data › Maskapai | Kelola Maskapai |
| `/complaints` | Dukungan › Keluhan | Kelola pengaduan jamaah |
| `/reviews` | Dukungan › Ulasan | Moderasi Ulasan Jamaah |
| `/faqs` | Dukungan › FAQ | FAQ |
| `/users` | Administrator › Pengguna | Kelola daftar pengguna |
| `/logs` | Administrator › Aktivitas | Log Aktivitas |
| `/analytics` | Analitik | Analitik Platform |
| `/settings` | Pengaturan | Pengaturan Akun & Platform |
| `/login` | — | Masuk ke akun admin |

Catatan: `Pengaturan` adalah **satu halaman dengan tab**, bukan rute terpisah.
`Web & Domain` dan `Saldo Travel` adalah sub-group di dalam grup induknya.

## 3. Shell aplikasi

- Sidebar kiri: logo → grup accordion → footer profil (nama, email, avatar).
- Header: tombol toggle sidebar, input "Cari..." dengan badge `Ctrl + k`, lonceng notifikasi (badge angka), toggle theme, avatar.
- `Ctrl/Cmd + K` membuka **command palette** dengan hasil tergrup: `Halaman & Navigasi`, lalu hasil entity (mis. `Paket Umrah (4)`).
- Toast/notifikasi dirender di region `Notifications alt+T` (pola sonner).
- Dialog pertama: "Izin Audio Notifikasi" dengan tombol **Aktifkan Suara** / **Nanti Saja**.

## 4. Anatomy halaman daftar (pola umum)

Urutan toolbar, kiri ke kanan:
1. `<h1>` judul halaman
2. Input pencarian (placeholder spesifik per modul)
3. Tombol **Filter** (`aria-label="Toggle Filter"`, teks tetap `Filter`) — membuka **baris filter inline**, bukan popover
4. Tombol **Export CSV**
5. Tombol rentang tanggal `Oct 16, 2026 - Nov 14, 2026` (dialog preset + kalender)

Baris filter inline `/bookings/list`: combobox `Pilih mitra travel...` + 3 tombol multi-select
(`Status`, `Pembayaran`, `Sumber`) yang masing-masing membuka dialog berisi checkbox + opsi **Pilih Semua**.

Footer tabel: label `Per halaman` + select (10 default), teks `Page {n} / {total}`, tombol
first/prev/next/last. **Halaman aktif tersimpan di URL** → `?page=1`.

Tabel kosong menampilkan satu baris dengan teks **"Tidak ada data."**

## 5. Enum status

| Domain | Nilai |
| --- | --- |
| Status Pesanan | `Menunggu`, `Dikonfirmasi`, `Selesai`, `Dibatalkan` |
| Pembayaran | `Belum Bayar`, `Lunas`, `Belum Lunas` |
| Sumber (filter) | `Marketplace`, `Web Travel`, `Offline` |
| Sumber (badge dashboard) | `Marketplace`, `Langsung`, `Website Travel` — **tidak konsisten dengan filter**, pertahankan keduanya |
| Transaksi | `Terbayar`, `Menunggu` |
| Verifikasi dokumen | status per jenis dokumen, ada kolom `Masa Berlaku` |

## 6. Kolom per halaman

| Rute | Kolom |
| --- | --- |
| `/bookings/list` | ID Pesanan, Paket & Travel, Biaya & Sisa, Pembayaran, Status Pesanan, Sumber, Tgl. Pesan, Aksi |
| `/transactions` | No. Invoice, Deskripsi, Channel, Nominal, Tanggal, Status, Aksi |
| `/invoices` | No. Faktur, Jamaah, Jumlah, Tanggal, Status, Aksi |
| `/banks` | Bank, Nomor Rekening, Aksi |
| `/deposits` | Agensi Travel, Saldo Deposit, Batas Min. Operasional, Status Saldo, Aksi |
| `/withdraws` | Jamaah Penerima, Metode & Rekening, Nominal Cashback, Agensi & Pesanan, Status, Tanggal, Aksi |
| `/registrations` | Travel, PPIU, Rekening, Status, Kontak, Pengajuan |
| `/travels` | Travel, Alamat, Total Paket, Legalitas, Status, Aksi |
| `/travels/documents` | Agensi Travel, Jenis Dokumen, Nomor Dokumen, Berkas, Masa Berlaku, Status, Aksi |
| `/packages` | Paket, Biaya, Kategori, Status, Kuota, Aksi |
| `/hotels` | Hotel, Kota, Bintang, Mitra Travel, Status, Aksi |
| `/airlines` | Maskapai, Kode IATA, Mitra Travel, Status, Aksi |
| `/complaints` | Komplain & Kategori, Jamaah Pelapor, Agensi Terlapor, Tingkat Keparahan, Status, Tanggal, Aksi |
| `/reviews` | Jamaah, Agensi Travel, Paket Umrah, Rating, Ulasan Jamaah, Status, Tanggal, Aksi |
| `/faqs` | Urutan, No., Pertanyaan, Kategori, Status, Halaman Utama, Aksi |
| `/users` | Pengguna, Email, Travel, Role, Tgl. Daftar, Terakhir Login |
| `/logs` | Deskripsi, Aktor, Aksi, Entity, Kapan |

Placeholder pencarian per halaman: `Cari ID pesanan / nama paket...`, `Cari no. referensi / gateway...`,
`Cari no. invoice...`, `Cari no rek, dan bank`, `Cari agensi travel...`, `Cari nama, email, bank...`,
`Cari nama travel, nama PT resmi, nomor PPIU...`, `Cari nama travel, kota, atau email...`,
`Cari travel atau nomor SK/dokumen...`, `Cari paket atau travel...`, `Cari nama hotel...`,
`Cari nama maskapai / kode IATA...`, `Cari komplain, travel, jamaah...`, `Cari isi ulasan jamaah...`,
`Cari pertanyaan...`, `Cari nama atau email...`, `Cari deskripsi aktivitas...`.

## 7. Perilaku yang terverifikasi

- **Search real-time**: mengetik di input langsung memfilter baris (tanpa tombol apply).
  Hasil nol → satu baris "Tidak ada data."
- **Pagination**: `?page=1` di URL; tombol prev disabled di halaman pertama.
- **Filter collapsible**: teks tombol tetap `Filter`; hanya `aria-expanded` (`false` ⇄ `true`) yang berubah
  saat baris filter dibuka/tutup. `aria-label="Toggle Filter"`.
- **Date range**: dialog dengan preset `Hari ini`, `Minggu ini`, `Minggu lalu`, `Bulan ini`,
  `Bulan lalu`, `30 hari terakhir`, `Tahun ini`, `Tahun lalu`, `Semua` + grid kalender.
- **Modal**: form di-render dalam `[role="dialog"]` dengan tombol `Close` di kanan atas,
  `Batal` + `Simpan` di footer. Elemen dialog `position: fixed`.
- ** Kolom "Mitra Travel"** pada hotel/maskapai punya pola "* Kosongkan untuk seluruh travel."
- **`/categories`** bukan tabel: kartu per kategori (`{nama} {jumlah} paket {status} Menu aksi`)
  dengan dua tab form `Kategori Utama` / `Sub-Kategori`.
- **`/packages/{slug}`** punya tab: `Ringkasan`, `Itinerary (n)`, `Jamaah (n)`, `Ulasan (n)` + tombol `Edit`/`Menu Aksi`.
- **`/bookings/{id}`** punya stepper fase: `Pemesanan` → `Pembayaran` → `Dokumen & Perlengkapan` →
  `Pra-Keberangkatan` → `Keberangkatan` → `Pelaksanaan` → `Pulang` → `Selesai`, plus tab
  `Catatan internal` / `Catatan eksternal` dengan editor rich-text (bold/italic/underline/strike/list)
  dan dropzone lampiran, tombol `Kirim catatan`, serta blok `Timeline`.

## 8. Spesifikasi form

**Tambah Hotel** — combobox `Pilih travel...` (opsional), `Hotel *`, Kota (select, default Makkah),
Bintang (select, default 4), `Jarak ke Masjid` (number, contoh 150), `Alamat` (textarea),
fasilitas (input "Tambah fasilitas lain..." + tombol Tambah), `Catatan Lokasi`, `Catatan Konsumsi`,
upload berkas, checkbox `Aktifkan`. Footer: `Batal` / `Simpan Hotel`.

**Tambah Maskapai** — combobox `Pilih travel...`, upload logo, `Nama` (contoh: Garuda Indonesia),
`Kode IATA` (contoh: GA), checkbox `Aktifkan`. Footer: `Batal` / `Simpan`.

**Tambah Kategori** — `Nama *` (required, contoh: Umrah, Haji, Tour), tab `Kategori Utama`/`Sub-Kategori`,
checkbox `Aktifkan`. Footer: `Batal` / `Simpan`.

**Tambah FAQ** — `Pertanyaan *` (required), jawaban (2 field teks), kategori (select, default Umum),
`Urutan` (number, default 0), checkbox `Tampilkan di Halaman Utama`. Footer: `Batal` / `Tambah`.

**Tambah Pengguna** — `Nama Lengkap`, `Email` (`user@umrahqu.id`), `Password` (min 6),
`Konfirmasi Password`, role (select, default Customer). Footer: `Batal` / `Submit`.

**Tambah Rekening** — pencarian bank (`Cari nama atau kode bank...`), `No. Rekening *`,
`Pemilik Rekening *`, checkbox `Aktifkan`, checkbox `Jadikan Rekening Utama`. Footer: `Batal` / `Simpan`.

**`/invoices/new`** — satu halaman penuh (bukan modal) dengan 8 seksi:
`Data Penyelenggara / Travel`, `Data Jamaah / Pelanggan`, `Periode & Jatuh Tempo`, `Paket Umrah`,
`Skema Pembayaran & Rekening`, `Catatan & Ketentuan`, `Tanda Tangan & Pengesahan`.

## 9. Yang belum diverifikasi

Form **create/update** belum diuji tulis (pembuatan data produksi berisiko memicu notifikasi ke staf
asli dan meninggalkan jejak di `/logs`). Validasi client-side, format toast sukses, dan perilaku
hapus/batalkan belum dicatat. Perlu keputusan terpisah sebelum ditiru di lokal.
