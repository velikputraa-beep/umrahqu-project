drop table if exists public.hotels cascade;
drop table if exists public.airlines cascade;
drop table if exists public.categories cascade;
drop table if exists public.users cascade;
drop table if exists public.travels cascade;
drop table if exists public.packages cascade;
drop table if exists public.bookings cascade;
drop table if exists public.banks cascade;
drop table if exists public.faqs cascade;
drop table if exists public.complaints cascade;
drop table if exists public.deposits cascade;
drop table if exists public.domains cascade;
drop table if exists public.invoices cascade;
drop table if exists public.logs cascade;
drop table if exists public.registrations cascade;
drop table if exists public.reviews cascade;
drop table if exists public.transactions cascade;
drop table if exists public.documents cascade;
drop table if exists public.websites cascade;
drop table if exists public.withdraws cascade;
drop table if exists public.analytics_stats cascade;
drop table if exists public.analytics_trend cascade;
drop table if exists public.analytics_sources cascade;
drop table if exists public.analytics_top cascade;
drop table if exists public.finance_stats cascade;
drop table if exists public.booking_stats cascade;

create table public.hotels (
  id text primary key,
  nama text,
  kota text,
  bintang int,
  mitra text,
  jarak text,
  alamat text,
  fasilitas jsonb,
  "catatanLokasi" text,
  "catatanKonsumsi" text,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.airlines (
  id text primary key,
  nama text,
  iata text,
  mitra text,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.categories (
  id text primary key,
  title text,
  "paketCount" int,
  status text,
  subcategories jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.users (
  id text primary key,
  nama text,
  email text,
  travel text,
  role text,
  "tglDaftar" text,
  "terakhirLogin" text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.travels (
  id text primary key,
  nama text,
  "alamatKota" text,
  "alamatDetail" text,
  "totalPaket" int,
  legalitas text,
  status text,
  initial text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.packages (
  slug text primary key,
  nama text,
  travel text,
  biaya text,
  cashback text,
  kategori text,
  status text,
  terisi int,
  total int,
  persen int,
  "imgColor" text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.bookings (
  id text primary key,
  paket text,
  travel text,
  biaya text,
  sisa text,
  pembayaran text,
  status text,
  sumber text,
  tgl text,
  "tglPesan" text,
  "tglBerangkat" text,
  pemesan text,
  telpon text,
  email text,
  "dikonfirmasiOleh" text,
  "kodeReferral" text,
  "skemaPembayaran" text,
  dibayar text,
  "jatuhTempo" text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.banks (
  id text primary key,
  bank text,
  norek text,
  pemilik text,
  utama bool,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.faqs (
  id text primary key,
  no text,
  pertanyaan text,
  jawaban text,
  "jawabanPendukung" text,
  kategori text,
  urutan int,
  "isHomepage" bool,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.complaints (
  id text primary key,
  komplain text,
  "kategoriBadge" text,
  jamaah text,
  email text,
  agensi text,
  "agensiHandle" text,
  keparahan text,
  status text,
  tanggal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.deposits (
  id text primary key,
  nama text,
  handle text,
  saldo text,
  "saldoTone" text,
  "minSaldo" text,
  "batasOperasional" text,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.domains (
  id text primary key,
  agensi text,
  "customDomain" text,
  cname text,
  "statusDns" text,
  "statusSsl" text,
  tanggal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.invoices (
  id text primary key,
  "noFaktur" text,
  jamaah text,
  jumlah text,
  tanggal text,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.logs (
  id text primary key,
  deskripsi text,
  aktor text,
  aksi text,
  entity text,
  kapan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.registrations (
  id text primary key,
  nama text,
  pt text,
  ppiu text,
  "ppiuExp" text,
  rekening text,
  email text,
  telp text,
  status text,
  tanggal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.reviews (
  id text primary key,
  jamaah text,
  travel text,
  paket text,
  rating int,
  ulasan text,
  status text,
  tanggal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.transactions (
  id text primary key,
  invoice text,
  deskripsi text,
  channel text,
  nominal text,
  tanggal text,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.documents (
  id text primary key,
  agensi text,
  subdomain text,
  jenis text,
  nomor text,
  berkas text,
  "masaBerlaku" text,
  "statusBerlaku" text,
  status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.websites (
  id text primary key,
  nama text,
  subdomain text,
  "customDomain" text,
  tema text,
  "temaBadge" text,
  "modePemeliharaan" text,
  initial text,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.withdraws (
  id text primary key,
  jamaah text,
  email text,
  metode text,
  keterangan text,
  nominal text,
  agensi text,
  pesanan text,
  status text,
  tanggal text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.analytics_stats (
  title text primary key,
  value text,
  delta text,
  trend text,
  note text,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.analytics_trend (
  bulan text primary key,
  pesanan int,
  pendapatan bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.analytics_sources (
  label text primary key,
  value int,
  color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.analytics_top (
  nama text primary key,
  travel text,
  pesanan int,
  pendapatan bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.finance_stats (
  title text primary key,
  value text,
  badge text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.booking_stats (
  title text primary key,
  value text,
  badge text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
