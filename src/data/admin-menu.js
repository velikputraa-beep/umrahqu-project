export const adminMenu = [
  {
    title: "Dashboard",
    url: "/",
    icon: "LayoutDashboard",
  },
  {
    title: "Pesanan",
    icon: "ShoppingBag",
    submenu: [
      {
        title: "Dashboard",
        url: "/bookings",
      },
      {
        title: "Daftar Pesanan",
        url: "/bookings/list",
      },
    ],
  },
  {
    title: "Keuangan",
    icon: "Wallet",
    submenu: [
      {
        title: "Dashboard",
        url: "/finance",
      },
      {
        title: "Transaksi",
        url: "/transactions",
      },
      {
        title: "Invoice",
        url: "/invoices",
      },
      {
        title: "Rekening",
        url: "/banks",
      },
      {
        title: "Saldo Travel",
        submenu: [
          {
            title: "Deposit",
            url: "/deposits",
          },
          {
            title: "Pencairan",
            url: "/withdraws",
          },
        ],
      },
    ],
  },
  {
    title: "Kemitraan",
    icon: "Users",
    submenu: [
      {
        title: "Pengajuan",
        url: "/registrations",
      },
      {
        title: "Travel",
        url: "/travels",
      },
      {
        title: "Dokumen",
        url: "/travels/documents",
      },
      {
        title: "Web & Domain",
        submenu: [
          {
            title: "Domain",
            url: "/domains",
          },
          {
            title: "Website",
            url: "/websites",
          },
        ],
      },
    ],
  },
  {
    title: "Master Data",
    icon: "Database",
    submenu: [
      {
        title: "Paket",
        url: "/packages",
      },
      {
        title: "Kategori",
        url: "/categories",
      },
      {
        title: "Hotel",
        url: "/hotels",
      },
      {
        title: "Maskapai",
        url: "/airlines",
      },
    ],
  },
  {
    title: "Dukungan",
    icon: "Headphones",
    submenu: [
      {
        title: "Keluhan",
        url: "/complaints",
      },
      {
        title: "Ulasan",
        url: "/reviews",
      },
      {
        title: "FAQ",
        url: "/faqs",
      },
    ],
  },
  {
    title: "Administrator",
    icon: "ShieldCheck",
    submenu: [
      {
        title: "Pengguna",
        url: "/users",
      },
      {
        title: "Aktivitas",
        url: "/logs",
      },
    ],
  },
  {
    title: "Analitik",
    url: "/analytics",
    icon: "BarChart3",
  },
  {
    title: "Pengaturan",
    icon: "Settings",
    submenu: [
      {
        title: "Profil Saya",
        url: "/settings/profil",
      },
      {
        title: "Profil Perusahaan",
        url: "/settings/perusahaan",
      },
      {
        title: "Konfigurasi Platform",
        url: "/settings/platform",
      },
      {
        title: "Akun Pengguna",
        url: "/settings/akun",
      },
      {
        title: "Tampilan",
        url: "/settings/tampilan",
      },
      {
        title: "Notifikasi",
        url: "/settings/notifikasi",
      },
    ],
  },
];
