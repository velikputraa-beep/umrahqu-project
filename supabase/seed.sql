insert into public.hotels (id, nama, kota, bintang, mitra, jarak, alamat, fasilitas, "catatanLokasi", "catatanKonsumsi", status) values
('htl-1', 'Al Kiswah Towers', 'Makkah', 3, 'Semua Travel', '1,2 km dari Masjidil Haram', 'Ajyad, Makkah', $jb$["Katering 3x sehari","Bus sholawat","Wi-Fi"]$jb$::jsonb, 'Dekat pintu King Fahd', 'Menu Indonesia', 'Aktif'),
('htl-2', 'Anwar Al Madinah Mofareeh', 'Madinah', 5, 'An-Nahl', '350 m dari Masjid Nabawi', 'Al Manakhah, Madinah', $jb$["Katering 3x sehari","Lift","Laundry"]$jb$::jsonb, 'Gerbang 21', 'Prasmanan', 'Aktif'),
('htl-3', 'Daff Abraj Taqwa', 'Makkah', 4, 'Batik Travel', '800 m dari Masjidil Haram', 'Misfalah, Makkah', $jb$["Katering 2x sehari","Wi-Fi"]$jb$::jsonb, 'Menara 3', '-', 'Aktif'),
('htl-4', 'Frontier Hotel Madinah', 'Madinah', 4, 'Persada Indonesia', '600 m dari Masjid Nabawi', 'Al Aqrar, Madinah', $jb$["Katering 3x sehari","Pool"]$jb$::jsonb, '-', 'Menu Asia', 'Nonaktif'),
('htl-5', 'Olaya Anwar Hotel', 'Makkah', 3, 'Semua Travel', '1,8 km dari Masjidil Haram', 'Al Olaya, Makkah', $jb$["Wi-Fi","Laundry"]$jb$::jsonb, 'Butuh shuttle', '-', 'Aktif');
insert into public.airlines (id, nama, iata, mitra, status) values
('garuda', 'Garuda Indonesia', 'GA', 'Semua Travel', 'Aktif'),
('saudia', 'Saudia Airlines', 'SV', 'An-Nahl', 'Aktif'),
('etihad', 'Etihad Airways', 'EY', 'Batik Travel', 'Aktif'),
('qatar', 'Qatar Airways', 'QR', 'Persada Indonesia', 'Nonaktif');
insert into public.categories (id, title, "paketCount", status, subcategories) values
('reguler', 'Umrah Reguler', 12, 'Aktif', $jb$[{"name":"9 Hari","count":5,"status":"Aktif"},{"name":"12 Hari","count":4,"status":"Aktif"},{"name":"Hemat","count":3,"status":"Nonaktif"}]$jb$::jsonb),
('plus', 'Umrah Plus', 5, 'Aktif', $jb$[{"name":"Turki","count":3,"status":"Aktif"},{"name":"Dubai","count":2,"status":"Aktif"}]$jb$::jsonb),
('ramadhan', 'Umrah Ramadhan', 8, 'Aktif', $jb$[{"name":"Awal Ramadhan","count":3,"status":"Aktif"},{"name":"Akhir Ramadhan","count":5,"status":"Aktif"}]$jb$::jsonb),
('badal', 'Badal Umrah', 3, 'Draft', $jb$[]$jb$::jsonb);
-- role stores the slug from the 9-role system in src/lib/roles.js, never the display label
insert into public.users (id, nama, email, travel, role, "tglDaftar", "terakhirLogin") values
('usr-1', 'Super Admin', 'admin@umrahqu.com', 'UmrahQu Pusat', 'admin', '02 Jan 2026', 'Hari ini'),
('usr-2', 'Siti Nurhaliza', 'siti.nur@annahil.co.id', 'An-Nahl', 'operational', '14 Feb 2026', 'Kemarin'),
('usr-3', 'Ahmad Fauzi', 'ahmad.fauzi@batiktravel.id', 'Batik Travel', 'travel_admin', '27 Mar 2026', '3 hari lalu'),
('usr-4', 'Dewi Lestari', 'dewi.lestari@persadaindonesia.id', 'Persada Indonesia', 'travel_admin', '09 Mei 2026', 'Minggu lalu');
insert into public.travels (id, nama, "alamatKota", "alamatDetail", "totalPaket", legalitas, status, initial, color) values
('trv-1', 'Persada Indonesia', 'Kediri, Jawa Timur', 'Jl. Mastrip Kav. 12', 4, 'Lengkap', 'Aktif', 'PI', 'bg-red-950/70 border-red-800/60 text-red-400'),
('trv-2', 'An-Nahl', 'Kota Malang, Jawa Timur', 'Blk. 43A-D, Jl. Letjend S. Parman', 13, 'Lengkap', 'Aktif', 'AN', 'bg-amber-950/70 border-amber-800/60 text-amber-400'),
('trv-3', 'Batik Travel', 'Solo, Jawa Tengah', 'Jl. Slamet Riyadi No. 88', 6, 'Lengkap', 'Aktif', 'BT', 'bg-emerald-950/70 border-emerald-800/60 text-emerald-400'),
('trv-4', 'Cahaya Suci', 'Surabaya, Jawa Timur', 'Jl. Darmo Permai Selatan II/15', 2, 'Belum Lengkap', 'Masa Tenggang', 'CS', 'bg-purple-950/70 border-purple-800/60 text-purple-400');
insert into public.packages (slug, nama, travel, biaya, cashback, kategori, status, terisi, total, persen, "imgColor") values
('umrah-reguler-9-hari', 'Umrah Reguler 9 Hari', 'An-Nahl', 'Rp 32.500.000', 'Rp 500.000', 'Umrah Reguler', 'Aktif', 34, 45, 76, 'from-emerald-700 to-teal-900'),
('umrah-plus-turki-14-hari', 'Umrah Plus Turki 14 Hari', 'Batik Travel', 'Rp 45.900.000', 'Rp 1.000.000', 'Umrah Plus', 'Aktif', 18, 30, 60, 'from-amber-700 to-orange-900'),
('umrah-ramadhan-awal', 'Umrah Ramadhan Awal', 'Persada Indonesia', 'Rp 38.750.000', 'Rp 750.000', 'Umrah Ramadhan', 'Menunggu', 5, 40, 13, 'from-red-700 to-rose-900'),
('umrah-vip-bintang-5', 'Umrah VIP Bintang 5', 'An-Nahl', 'Rp 62.000.000', '-', 'Umrah Reguler', 'Nonaktif', 0, 20, 0, 'from-slate-700 to-gray-900');
insert into public.bookings (id, paket, travel, biaya, sisa, pembayaran, status, sumber, tgl, "tglPesan", "tglBerangkat", pemesan, telpon, email, "dikonfirmasiOleh", "kodeReferral", "skemaPembayaran", dibayar, "jatuhTempo") values
('BRS-26111401', 'Umrah Reguler 9 Hari', 'An-Nahl', 'Rp 32.500.000', 'Rp 8.500.000', 'DP', 'Dikonfirmasi', 'Website', '2 jam lalu', '12 Nov 2026', '20 Jan 2027', 'Agus Priyanto', '+6281234567810', 'agus.priyanto@gmail.com', 'Siti Nurhaliza', '-', 'DP + Cicilan', 'Rp 24.000.000', '25 Nov 2026'),
('BRS-26111402', 'Umrah Plus Turki 14 Hari', 'Batik Travel', 'Rp 45.900.000', 'Rp 45.900.000', 'Belum Bayar', 'Menunggu Konfirmasi', 'Marketplace', '5 jam lalu', '13 Nov 2026', '02 Feb 2027', 'Rina Marlina', '+6281377889900', 'rina.marlina@gmail.com', '-', 'APPX25', '-', 'Rp 0', '-'),
('BRS-26111403', 'Umrah Reguler 9 Hari', 'Persada Indonesia', 'Rp 32.500.000', 'Rp 0', 'Lunas', 'Selesai', 'Travel', '1 hari lalu', '11 Nov 2026', '18 Jan 2027', 'Hendra Wijaya', '+6281987654321', 'hendra.w@gmail.com', 'Super Admin', '-', 'Penuh', 'Rp 32.500.000', '-'),
('BRS-26111404', 'Umrah Ramadhan Awal', 'Cahaya Suci', 'Rp 38.750.000', 'Rp 20.000.000', 'DP', 'Dibatalkan', 'Website', '3 hari lalu', '10 Nov 2026', '05 Apr 2027', 'Rizky Hidayat', '+6281556677889', 'rizky.hidayat@gmail.com', 'Sistem', '-', 'DP + Cicilan', 'Rp 18.750.000', '11 Des 2026');
insert into public.banks (id, bank, norek, pemilik, utama, status) values
('bnk-1', 'Bank Syariah Indonesia', '7100 8822 1345 009', 'PT UmrahQu Travel Mandiri', true, 'Aktif'),
('bnk-2', 'Bank Muamalat Indonesia', '3210 0044 5566 01', 'PT UmrahQu Travel Mandiri', false, 'Aktif'),
('bnk-3', 'Bank Mandiri', '1370 0067 8899 02', 'CV Berkah Wisata', false, 'Nonaktif');
insert into public.faqs (id, no, pertanyaan, jawaban, "jawabanPendukung", kategori, urutan, "isHomepage", status) values
('faq-1', '#1', 'Berapa lama proses keberangkatan umrah?', 'Rata-rata 3-6 minggu setelah pelunasan, tergantung kuota maskapai.', 'Musim puncak bisa lebih lama.', 'Keberangkatan', 1, true, 'Tayang'),
('faq-2', '#2', 'Apakah bisa membayar dengan cicilan?', 'Bisa, DP minimal Rp 10.000.000 lalu dicicil sampai H-45 keberangkatan.', '-', 'Pembayaran', 2, true, 'Tayang'),
('faq-3', '#3', 'Dokumen apa saja yang harus disiapkan jamaah?', 'KTP, KK, paspor, buku kuning suntik meningitis, dan pas foto berwarna.', 'Paspor minimal 8 bulan sebelum keberangkatan.', 'Dokumen', 3, false, 'Draft');
insert into public.complaints (id, komplain, "kategoriBadge", jamaah, email, agensi, "agensiHandle", keparahan, status, tanggal) values
('cpl-1', 'AC kamar hotel mati dua malam berturut-turut', 'Akomodasi', 'Nur Hidayah', 'nur.hidayah@gmail.com', 'An-Nahl', '@annahil_travel', 'Tinggi', 'Diproses', '12 Nov 2026'),
('cpl-2', 'Katering tidak sesuai menu Indonesia', 'Konsumsi', 'Slamet Riyadi', 'slamet.riyadi@gmail.com', 'Batik Travel', '@batiktravel', 'Sedang', 'Baru', '11 Nov 2026'),
('cpl-3', 'Delay bus sholawat lebih dari 40 menit', 'Transportasi', 'Yuni Astuti', 'yuni.astuti@gmail.com', 'Persada Indonesia', '@persada_umrah', 'Rendah', 'Selesai', '08 Nov 2026');
insert into public.deposits (id, nama, handle, saldo, "saldoTone", "minSaldo", "batasOperasional", status) values
('dep-1', 'An-Nahl', '@annahil_travel', 'Rp 128.400.000', 'text-emerald-400', 'Rp 25.000.000', 'Rp 500.000.000', 'Aktif'),
('dep-2', 'Batik Travel', '@batiktravel', 'Rp 42.150.000', 'text-emerald-400', 'Rp 20.000.000', 'Rp 300.000.000', 'Aktif'),
('dep-3', 'Cahaya Suci', '@cahayasuci_id', 'Rp 6.900.000', 'text-amber-400', 'Rp 15.000.000', 'Rp 150.000.000', 'Perlu Top Up');
insert into public.domains (id, agensi, "customDomain", cname, "statusDns", "statusSsl", tanggal) values
('dom-1', 'An-Nahl', 'umrah.annahil.co.id', 'cname.umrahqu.com', 'Terverifikasi', 'Aktif', '02 Mar 2026'),
('dom-2', 'Batik Travel', 'daftar.batiktravel.id', 'cname.umrahqu.com', 'Menunggu Propagasi', 'Belum Diterbitkan', '10 Nov 2026');
insert into public.invoices (id, "noFaktur", jamaah, jumlah, tanggal, status) values
('inv-1', 'FTR/2026/11/0142', 'Agus Priyanto', 'Rp 8.500.000', '12 Nov 2026', 'Menunggu Pembayaran'),
('inv-2', 'FTR/2026/11/0141', 'Hendra Wijaya', 'Rp 32.500.000', '11 Nov 2026', 'Lunas'),
('inv-3', 'FTR/2026/11/0138', 'Rizky Hidayat', 'Rp 20.000.000', '10 Nov 2026', 'Kedaluwarsa');
insert into public.logs (id, deskripsi, aktor, aksi, entity, kapan) values
('log-1', 'Memperbarui biaya Paket Umrah Reguler 9 Hari', 'Siti Nurhaliza', 'Update', 'Paket', '12 Nov 2026 09:14'),
('log-2', 'Menambahkan hotel Anwar Al Madinah Mofareeh', 'Super Admin', 'Create', 'Hotel', '11 Nov 2026 16:02'),
('log-3', 'Menghapus mitra airlines Qatar Airways', 'Ahmad Fauzi', 'Delete', 'Airlines', '10 Nov 2026 11:47');
insert into public.registrations (id, nama, pt, ppiu, "ppiuExp", rekening, email, telp, status, tanggal) values
('reg-1', 'Rudi Hartono', 'PT Barokah Tour Mandiri', '1120009876', 'Agustus 2028', 'BSI 7100 2233 4455', 'rudi@barokahhost.com', '+628112233444', 'Menunggu Review', '13 Nov 2026'),
('reg-2', 'Lina Marlina', 'CV Safa Marwa Wisata', '1120004567', 'Januari 2027', 'Muamalat 3210 7788 9900', 'lina@safamarwa.id', '+6282111222333', 'Diterima', '09 Nov 2026'),
('reg-3', 'Bagus Prasetyo', 'PT Nur Hidayah Travel', '-', '-', 'Mandiri 1370 5566 7788', 'bagus@nurhidayah.co.id', '+6285333444555', 'Ditolak', '05 Nov 2026');
insert into public.reviews (id, jamaah, travel, paket, rating, ulasan, status, tanggal) values
('rvw-1', 'Nur Hidayah', 'An-Nahl', 'Umrah Reguler 9 Hari', 5, 'Muthawwif sabar dan hotel sangat dekat dengan Masjidil Haram.', 'Diterbitkan', '12 Nov 2026'),
('rvw-2', 'Slamet Riyadi', 'Batik Travel', 'Umrah Plus Turki 14 Hari', 4, 'Turki menyenangkan, tapi katering di Madinah perlu diperbaiki.', 'Menunggu Moderasi', '10 Nov 2026'),
('rvw-3', 'Yuni Astuti', 'Persada Indonesia', 'Umrah Ramadhan Awal', 3, 'Bus sholawat sering terlambat saat puncak Ramadhan.', 'Ditolak', '07 Nov 2026');
insert into public.transactions (id, invoice, deskripsi, channel, nominal, tanggal, status) values
('trx-1', 'FTR/2026/11/0141', 'Pembayaran penuh Umrah Reguler 9 Hari', 'Transfer Bank Syariah Indonesia', 'Rp 32.500.000', '11 Nov 2026', 'Berhasil'),
('trx-2', 'FTR/2026/11/0142', 'Cicilan kedua umrah reguler', 'Virtual Account Mandiri', 'Rp 5.000.000', '12 Nov 2026', 'Berhasil'),
('trx-3', 'FTR/2026/11/0138', 'DP Umrah Ramadhan Awal', 'QRIS', 'Rp 18.750.000', '10 Nov 2026', 'Gagal');
insert into public.documents (id, agensi, subdomain, jenis, nomor, berkas, "masaBerlaku", "statusBerlaku", status) values
('doc-1', 'An-Nahl', 'annahil', 'SK PPIU Kemenag', '1120007788', 'sk-ppiu-annahil.pdf', '12 Agustus 2028', 'Verifikasi', 'Terverifikasi'),
('doc-2', 'Batik Travel', 'batiktravel', 'NPWP Badan Usaha', '09.876.543.2-415.000', 'npwp-batik.pdf', '-', 'Verifikasi', 'Menunggu Review'),
('doc-3', 'Cahaya Suci', 'cahayasuci', 'NIB (Izin Berusaha)', '8120099887766', 'nib-cahayasuci.pdf', '30 April 2026', 'Kedaluwarsa', 'Menunggu Review');
insert into public.websites (id, nama, subdomain, "customDomain", tema, "temaBadge", "modePemeliharaan", initial, color) values
('web-1', 'An-Nahl Umrah', 'annahil', 'umrah.annahil.co.id', 'Emerald', 'Unggulan', 'Online', 'AN', 'bg-amber-950/70 border-amber-800/60 text-amber-400'),
('web-2', 'Batik Travel Umrah', 'batiktravel', '-', 'Sand', 'Standar', 'Pemeliharaan', 'BT', 'bg-emerald-950/70 border-emerald-800/60 text-emerald-400'),
('web-3', 'Persada Indonesia', 'persada', 'persadaumrah.id', 'Ocean', 'Baru', 'Online', 'PI', 'bg-red-950/70 border-red-800/60 text-red-400');
insert into public.withdraws (id, jamaah, email, metode, keterangan, nominal, agensi, pesanan, status, tanggal) values
('wdw-1', 'Rizky Hidayat', 'rizky.hidayat@gmail.com', 'Transfer BSI', 'Refund sebagian pesanan dibatalkan', 'Rp 18.750.000', 'Cahaya Suci', 'BRS-26111404', 'Menunggu Approval', '13 Nov 2026'),
('wdw-2', 'Hendra Wijaya', 'hendra.w@gmail.com', 'Transfer Mandiri', 'Sisa lebih pembayaran katering', 'Rp 1.200.000', 'Persada Indonesia', 'BRS-26111403', 'Ditransfer', '11 Nov 2026');
insert into public.analytics_stats (title, value, delta, trend, note, icon) values
('Pendapatan', 'Rp 1,42 M', '+18,4%', 'up', 'vs. periode sebelumnya', 'pendapatan'),
('Pesanan', '148', '+12,1%', 'up', '17 menunggu konfirmasi', 'pesanan'),
('Jamaah', '1.204', '+9,6%', 'up', '4 keberangkatan aktif', 'jamaah'),
('Tingkat Konversi', '3,8%', '-0,4%', 'down', 'dari 31.402 pengunjung', 'konversi');
insert into public.analytics_trend (bulan, pesanan, pendapatan) values
('Apr', 9, 78500000),
('Mei', 14, 121000000),
('Jun', 11, 96400000),
('Jul', 22, 214800000),
('Agu', 18, 173200000),
('Sep', 26, 268900000),
('Okt', 21, 198600000),
('Nov', 27, 271300000);
insert into public.analytics_sources (label, value, color) values
('Marketplace', 60, '#10b981'),
('Langsung', 40, '#8b5cf6'),
('Website Travel', 30, '#eab308'),
('Referral', 18, '#38bdf8');
insert into public.analytics_top (nama, travel, pesanan, pendapatan) values
('UMROH PLUS AN-NAHL 12Hari', 'An-Nahl', 34, 1190000000),
('Paket Umrah VIP Bintang 5', 'Persada Indonesia', 26, 1027000000),
('UMROH REGULER AN-NAHL', 'An-Nahl', 21, 525000000),
('UMRAH HEMAT FEBRUARI', 'Batik Travel', 15, 337500000),
('PAKET RAMADHAN LAST SEAT', 'PT. Fio Amanah Perdana', 11, 429000000);
insert into public.finance_stats (title, value, badge) values
('Pendapatan Kotor', 'Rp 39.8 Jt', '+106.2%'),
('Pendapatan Bersih', 'Rp 13.7 Jt', '+48.2%'),
('Alokasi Cashback', 'Rp 26.1 Jt', '+148.7%'),
('Volume Pembayaran', 'Rp 255.7 Jt', '+100.9%');
insert into public.booking_stats (title, value, badge) values
('Pesanan', '17', '+100.0%'),
('Masa Pembayaran', '10', '+100.0%'),
('Lunas', '3', '+100.0%'),
('Dibatalkan', '4', '+100.0%');
