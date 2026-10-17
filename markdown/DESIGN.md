# DESIGN.md

## Sistem Desain SIMSBH: Yayasan Sinar Bhakti Husada

| Item | Keterangan |
| --- | --- |
| Dokumen | Design System & UI Guidelines |
| Versi | 1.0 (Draft) |
| Komponen UI | **shadcn/ui** (Radix UI + Tailwind CSS) |
| Tema | **Hijau** (identitas kesehatan, kepedulian, dan pertumbuhan) |
| Pasangan dokumen | `PRD_SIM_Yayasan_Sinar_Bhakti_Husada.md`, `ARCHITECTURE.md` |

> Seluruh nilai warna adalah titik awal yang masuk akal. Jika yayasan sudah memiliki logo atau panduan identitas visual, sesuaikan `--primary` dengan warna logo dan pertahankan rasio kontras di bagian 9.

---

## 1. Karakter dan Prinsip Desain

SIMSBH adalah **alat kerja operasional** untuk organisasi kesehatan, bukan situs pemasaran. Antarmukanya harus tenang, jelas, dan dapat dipercaya.

| Prinsip | Penerapan |
| --- | --- |
| **Tenang dan bersih** | Latar terang, banyak ruang putih, hijau dipakai hemat sebagai penanda aksi dan status, bukan pewarna seluruh layar |
| **Jelas lebih penting daripada indah** | Hierarki teks tegas, label eksplisit (Bahasa Indonesia), tidak ada ikon tanpa teks untuk aksi penting |
| **Status selalu terlihat** | Dokumen, persetujuan, nomor surat, dan kegiatan selalu menampilkan status berwarna + teks |
| **Aman dari salah klik** | Aksi yang tidak dapat dibatalkan (Setujui, Tolak, Void nomor) meminta konfirmasi |
| **Ramah jaringan lemah dan ponsel** | Staf Lapangan di Papua: tombol besar, progres unggah, tata letak satu kolom di layar kecil |
| **Dapat diakses** | Kontras WCAG AA, fokus keyboard jelas, tidak mengandalkan warna saja |
| **Konsisten** | Satu pola untuk daftar, formulir, dan detail di semua modul |

**Nada visual:** profesional, hangat, dan terpercaya. Hindari warna neon, gradien mencolok, dan ilustrasi medis yang sensitif (tidak menampilkan data/gambar pasien).

---

## 2. Warna

### 2.1 Palet Dasar

| Peran | Nama | Nilai referensi | Kegunaan |
| --- | --- | --- | --- |
| Primary | Hijau 700 | `#15803D` | Tombol utama, tautan aktif, fokus |
| Primary hover | Hijau 800 | `#166534` | Hover/pressed tombol utama |
| Primary soft | Hijau 50/100 | `#F0FDF4` / `#DCFCE7` | Latar item aktif sidebar, badge hijau, highlight |
| Primary dark mode | Hijau 500 | `#22C55E` | Primary pada mode gelap |
| Netral | Abu kehijauan | lihat token | Latar, kartu, batas, teks |
| Sukses | Hijau 600 | `#16A34A` | Status Disetujui |
| Peringatan | Amber 600 | `#D97706` | Menunggu, kontrak segera berakhir |
| Bahaya | Merah 600 | `#DC2626` | Ditolak, hapus, void, galat |
| Info | Sky 600 | `#0284C7` | Informasi, status Draft/Berjalan |

> Hijau dipakai sekaligus sebagai warna merek dan warna "sukses". Agar tidak ambigu, status **Disetujui** selalu memakai ikon centang + teks, dan tombol utama biasa (*primary*) tetap solid hijau 700 tanpa ikon status.

### 2.2 Token CSS (shadcn, Tailwind v4)

Letakkan di `frontend/src/styles/globals.css`. Variabel mengikuti konvensi shadcn sehingga semua komponen otomatis bertema hijau.

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.625rem;

  /* Permukaan */
  --background: oklch(0.985 0.004 150);
  --foreground: oklch(0.215 0.02 155);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.215 0.02 155);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.215 0.02 155);

  /* Merek: hijau */
  --primary: oklch(0.527 0.154 150.07);            /* ≈ #15803D */
  --primary-foreground: oklch(0.985 0.012 155);
  --secondary: oklch(0.962 0.044 156.74);          /* hijau sangat muda */
  --secondary-foreground: oklch(0.393 0.095 152.5);
  --accent: oklch(0.962 0.044 156.74);
  --accent-foreground: oklch(0.393 0.095 152.5);

  /* Netral kehijauan */
  --muted: oklch(0.965 0.006 150);
  --muted-foreground: oklch(0.48 0.02 155);
  --border: oklch(0.915 0.01 150);
  --input: oklch(0.915 0.01 150);
  --ring: oklch(0.627 0.194 149.21);               /* ≈ #16A34A */

  /* Semantik */
  --destructive: oklch(0.577 0.245 27.33);
  --success: oklch(0.627 0.194 149.21);
  --warning: oklch(0.666 0.179 58.32);
  --info: oklch(0.588 0.158 241.97);

  /* Grafik (tetap selaras hijau) */
  --chart-1: oklch(0.527 0.154 150.07);
  --chart-2: oklch(0.723 0.219 149.58);
  --chart-3: oklch(0.588 0.158 241.97);
  --chart-4: oklch(0.666 0.179 58.32);
  --chart-5: oklch(0.577 0.245 27.33);

  /* Sidebar */
  --sidebar: oklch(0.99 0.004 150);
  --sidebar-foreground: oklch(0.215 0.02 155);
  --sidebar-primary: oklch(0.527 0.154 150.07);
  --sidebar-primary-foreground: oklch(0.985 0.012 155);
  --sidebar-accent: oklch(0.962 0.044 156.74);
  --sidebar-accent-foreground: oklch(0.393 0.095 152.5);
  --sidebar-border: oklch(0.915 0.01 150);
  --sidebar-ring: oklch(0.627 0.194 149.21);
}

.dark {
  --background: oklch(0.18 0.015 155);
  --foreground: oklch(0.96 0.008 150);
  --card: oklch(0.225 0.018 155);
  --card-foreground: oklch(0.96 0.008 150);
  --popover: oklch(0.225 0.018 155);
  --popover-foreground: oklch(0.96 0.008 150);

  --primary: oklch(0.723 0.219 149.58);            /* ≈ #22C55E */
  --primary-foreground: oklch(0.266 0.065 152.93);
  --secondary: oklch(0.28 0.04 153);
  --secondary-foreground: oklch(0.962 0.044 156.74);
  --accent: oklch(0.28 0.04 153);
  --accent-foreground: oklch(0.962 0.044 156.74);

  --muted: oklch(0.26 0.015 155);
  --muted-foreground: oklch(0.72 0.02 150);
  --border: oklch(1 0 0 / 12%);
  --input: oklch(1 0 0 / 16%);
  --ring: oklch(0.723 0.219 149.58);

  --destructive: oklch(0.704 0.191 22.22);
  --success: oklch(0.723 0.219 149.58);
  --warning: oklch(0.769 0.188 70.08);
  --info: oklch(0.746 0.16 232.66);

  --sidebar: oklch(0.205 0.016 155);
  --sidebar-foreground: oklch(0.96 0.008 150);
  --sidebar-primary: oklch(0.723 0.219 149.58);
  --sidebar-primary-foreground: oklch(0.266 0.065 152.93);
  --sidebar-accent: oklch(0.28 0.04 153);
  --sidebar-accent-foreground: oklch(0.962 0.044 156.74);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.723 0.219 149.58);
}

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-info: var(--info);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace;
}

@layer base {
  * { @apply border-border outline-ring/50; }
  body { @apply bg-background text-foreground font-sans antialiased; }
  /* Angka rata untuk tabel keuangan, absensi, nomor surat */
  .tabular { font-variant-numeric: tabular-nums; }
}
```

> Catatan: nilai OKLCH di atas dikalibrasi agar mendekati hijau Tailwind 700/600/500 dan perlu dicek ulang secara visual di layar nyata dan pada rasio kontras (bagian 9). Bila proyek memakai Tailwind v3, gunakan format HSL pada variabel dengan struktur nama yang sama.

### 2.3 Aturan Pemakaian Warna

| Aturan | Keterangan |
| --- | --- |
| Hijau pekat hanya untuk **aksi utama** | Maksimum satu tombol `default` (primary) per area/dialog |
| Latar halaman netral | Jangan mengecat area besar dengan hijau penuh; header halaman memakai putih/netral |
| Status = warna **+ ikon + teks** | Jangan mengandalkan warna saja (buta warna, cetak hitam-putih) |
| Merah hanya untuk bahaya | Hapus, tolak, void, error validasi |
| Tautan | `text-primary`, garis bawah saat hover/fokus |

### 2.4 Pemetaan Status ke Warna

Digunakan oleh komponen `StatusBadge` (lihat bagian 6).

| Domain | Status | Varian | Ikon (lucide) | Teks UI |
| --- | --- | --- | --- | --- |
| Dokumen | `draft` | netral/info | `FilePen` | Draf |
| Dokumen | `pending` | warning | `Clock` | Menunggu Persetujuan |
| Dokumen | `revision` | warning | `RotateCcw` | Perlu Revisi |
| Dokumen | `approved` | success | `CheckCircle2` | Disetujui |
| Dokumen | `rejected` | destructive | `XCircle` | Ditolak |
| Nomor surat | `reserved` | info | `Hash` | Direservasi |
| Nomor surat | `used` | success | `CheckCircle2` | Terpakai |
| Nomor surat | `void` | destructive (pudar) | `Ban` | Dibatalkan |
| Kegiatan | `planned` | netral | `CalendarClock` | Direncanakan |
| Kegiatan | `running` | info | `PlayCircle` | Berjalan |
| Kegiatan | `done` | success | `CheckCircle2` | Selesai |
| Absensi | `present` | success | `CheckCircle2` | Hadir |
| Absensi | `late` | warning | `AlertTriangle` | Terlambat |
| Absensi | `leave/sick` | info | `CalendarOff` | Izin / Sakit |
| Absensi | `absent` | destructive | `XCircle` | Belum Absen |
| Kontrak | berakhir ≤ 30 hari | destructive | `AlertTriangle` | Segera Berakhir |
| Kontrak | berakhir ≤ 90 hari | warning | `Clock` | Akan Berakhir |
| Bukti | `verified` / `needs_fix` | success / warning | `ShieldCheck` / `AlertCircle` | Terverifikasi / Perlu Perbaikan |

---

## 3. Tipografi

| Elemen | Font | Ukuran / Berat | Catatan |
| --- | --- | --- | --- |
| Keluarga utama | **Inter** (fallback sistem) | 400, 500, 600 | Sangat terbaca di layar kecil dan angka |
| Mono | **JetBrains Mono** | 400/500 | Khusus **nomor surat**, kode karyawan, ID teknis |
| Judul halaman (H1) | Inter | 24–30 px / 600 | `text-2xl font-semibold tracking-tight` |
| Judul seksi (H2) | Inter | 18–20 px / 600 | |
| Judul kartu | Inter | 16 px / 600 | |
| Teks isi | Inter | 14–16 px / 400 | **16 px di ponsel** (cegah zoom otomatis iOS) |
| Teks bantu/label kecil | Inter | 12–13 px / 500, `text-muted-foreground` | |
| Angka tabel | Inter + `tabular-nums` | – | Rata kanan untuk nominal |

Pemuatan font: self-host (via `@fontsource-variable/inter`) agar tidak bergantung CDN pihak ketiga dan tetap cepat pada jaringan lemah.

---

## 4. Tata Letak, Spasi, dan Bentuk

| Token | Nilai | Catatan |
| --- | --- | --- |
| Basis spasi | 4 px (skala Tailwind) | Pakai `gap-2/3/4/6`, `p-4/6` |
| Radius | `--radius: 0.625rem` | Kartu `rounded-xl`, input/tombol `rounded-md` |
| Elevasi | Utamakan **border** + bayangan tipis (`shadow-xs/sm`) | Hindari bayangan besar |
| Lebar konten maks | `max-w-7xl` (±1280 px) untuk halaman data; `max-w-3xl` untuk form | |
| Ketinggian kontrol | 40 px desktop, **44 px minimum area sentuh** di ponsel | |
| Breakpoint | `sm 640`, `md 768`, `lg 1024`, `xl 1280` | Desain *mobile-first* |

### 4.1 Kerangka Aplikasi (App Shell)

```
┌──────────────────────────────────────────────────────────────┐
│ Header: [☰] Logo SBH · Judul halaman      🔔  Avatar ▾        │
├───────────────┬──────────────────────────────────────────────┤
│ Sidebar       │  Breadcrumb                                  │
│  • Dashboard  │  Judul Halaman                [Aksi utama]   │
│  • Persetujuan│  ────────────────────────────────────────    │
│  • Dokumen    │  Filter / Pencarian                          │
│  • Karyawan   │  ┌────────────────────────────────────────┐  │
│  • …          │  │ Konten (Card / DataTable / Form)       │  │
│               │  └────────────────────────────────────────┘  │
│ [Keluar]      │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

- Desktop: sidebar tetap (lebar ±256 px), dapat diciutkan menjadi ikon.
- Tablet/ponsel: sidebar menjadi `Sheet` yang dibuka dengan tombol ☰.
- **Staf Lapangan** di ponsel mendapat **navigasi bawah** (bottom bar) tiga-empat item: Beranda, Kegiatan, Absensi, Logbook.
- Item sidebar aktif: latar `sidebar-accent` (hijau muda) + teks hijau tua + penanda kiri 3 px hijau.
- Identitas: logo Yayasan Sinar Bhakti Husada di kiri atas (versi ikon saat sidebar diciutkan), nama aplikasi "SIMSBH" sebagai teks sekunder.

---

## 5. Pemasangan shadcn/ui

### 5.1 Inisialisasi

```bash
cd frontend
npm create vite@latest . -- --template react-ts
npm install tailwindcss @tailwindcss/vite
npx shadcn@latest init
```

`components.json` (acuan):

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

Setelah `init`, **ganti isi variabel warna** di `globals.css` dengan token tema hijau pada bagian 2.2.

### 5.2 Komponen yang Dipasang

```bash
npx shadcn@latest add button input textarea label select checkbox radio-group switch \
  form card badge table tabs dialog alert-dialog sheet dropdown-menu popover \
  command calendar date-picker tooltip separator skeleton sonner avatar \
  breadcrumb sidebar pagination progress alert accordion scroll-area chart
```

> Nama komponen mengikuti registri shadcn saat ini. Bila ada yang berbeda pada versi yang Anda pasang (mis. `date-picker` dibuat dari `calendar` + `popover`), sesuaikan dengan dokumentasi resmi shadcn.

### 5.3 Pemetaan Komponen ke Fitur

| Kebutuhan UI | Komponen shadcn | Dipakai di |
| --- | --- | --- |
| Tombol aksi | `Button` (`default`, `secondary`, `outline`, `ghost`, `destructive`) | Semua |
| Formulir | `Form` + `Input`, `Textarea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Calendar`/`Popover` (tanggal) | Karyawan, kontrak, RAB, kegiatan, logbook |
| Daftar data | `Table` + TanStack Table, `Pagination`, `DropdownMenu` (aksi baris) | Semua modul |
| Pencarian/filter | `Input`, `Select`, `Popover`, `Command` (combobox karyawan) | Daftar dokumen, absensi |
| Status | `Badge` (dibungkus `StatusBadge`) | Dokumen, nomor surat, kegiatan |
| Konfirmasi | `AlertDialog` | Setujui, Tolak, Void nomor, Hapus |
| Detail samping | `Sheet` | Pratinjau cepat dokumen/bukti |
| Dialog formulir singkat | `Dialog` | Reservasi nomor surat, tolak dengan catatan |
| Navigasi | `Sidebar`, `Breadcrumb`, `Tabs` | App shell, detail dokumen (Detail / Versi / Riwayat) |
| Umpan balik | `Sonner` (toast), `Alert`, `Skeleton`, `Progress` | Simpan sukses, galat, unggah |
| Ringkasan | `Card` | Dashboard |
| Grafik | `Chart` (Recharts) | Rekap absensi, realisasi RAB |
| Tooltip | `Tooltip` | Tombol ikon |
| Avatar | `Avatar` | Header, daftar karyawan |

---

## 6. Komponen Kustom Domain

Dibuat di `src/components/shared/`, dibangun di atas primitif shadcn.

| Komponen | Fungsi | Catatan |
| --- | --- | --- |
| `StatusBadge` | Menampilkan status dengan warna + ikon + teks (tabel 2.4) | Satu sumber pemetaan status |
| `PageHeader` | Judul, deskripsi, breadcrumb, slot aksi utama | Konsisten di semua halaman |
| `DataTable` | Tabel server-side: sort, filter, paginasi, kolom aksi, state loading/kosong | Berbasis TanStack Table |
| `FilterBar` | Pencarian + filter + tombol reset | |
| `ApprovalTimeline` | Garis waktu riwayat: pengaju → revisi → keputusan Direktur | Ikon status per langkah |
| `VersionList` | Daftar versi dokumen (v1, v2, …) + unduh + tandai "Terbaru" | |
| `ApprovalActions` | Tombol **Setujui / Minta Revisi / Tolak** untuk Direktur dengan dialog catatan | Catatan wajib untuk Tolak/Revisi |
| `LetterNumberChip` | Menampilkan nomor surat dalam font mono + tombol salin | `font-mono tabular` |
| `FileUploader` | Seret-lepas/pilih berkas, kompresi gambar, progres, retry, validasi tipe/ukuran | Penting untuk Staf Lapangan |
| `EvidenceGallery` | Grid foto/berkas bukti + status verifikasi | |
| `AttendanceCard` | Kartu **Check-in / Check-out** besar dengan jam server | Tombol besar untuk ponsel |
| `StatCard` | Angka ringkasan + label + tren (opsional) + tautan | Dashboard |
| `EmptyState` | Ikon, judul, deskripsi, tombol tindakan | |
| `ConfirmDialog` | Pembungkus `AlertDialog` dengan teks konsekuensi | |
| `RoleGate` | Menyembunyikan UI sesuai permission | Bukan pengganti keamanan backend |
| `CurrencyText` | Format Rupiah (`Rp 1.250.000`), rata kanan, `tabular-nums` | RAB, LPJ, gaji |

Contoh `StatusBadge` (ringkas):

```tsx
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, FilePen, RotateCcw } from "lucide-react";

const MAP = {
  draft:    { label: "Draf",                 icon: FilePen,      cls: "bg-muted text-foreground" },
  pending:  { label: "Menunggu Persetujuan", icon: Clock,        cls: "bg-warning/15 text-warning-foreground" },
  revision: { label: "Perlu Revisi",         icon: RotateCcw,    cls: "bg-warning/15 text-warning-foreground" },
  approved: { label: "Disetujui",            icon: CheckCircle2, cls: "bg-success/15 text-success-foreground" },
  rejected: { label: "Ditolak",              icon: XCircle,      cls: "bg-destructive/10 text-destructive" },
} as const;

export function DocumentStatusBadge({ status }: { status: keyof typeof MAP }) {
  const { label, icon: Icon, cls } = MAP[status];
  return (
    <Badge variant="outline" className={cn("gap-1.5 font-medium border-transparent", cls)}>
      <Icon className="size-3.5" aria-hidden />
      {label}
    </Badge>
  );
}
```

> Tambahkan utilitas `text-warning-foreground` / `text-success-foreground` (versi lebih gelap dari warna semantik) di `@theme inline` agar kontras teks pada latar tint memenuhi AA.

---

## 7. Pola Halaman

### 7.1 Halaman Daftar (mis. Dokumen, Karyawan, Register Nomor Surat)

1. `PageHeader` (judul + tombol utama "Tambah/Buat").
2. `FilterBar` (cari, status, bagian, rentang tanggal).
3. `DataTable` dengan kolom: identitas → status → tanggal → aksi.
4. Baris dapat diklik menuju detail; menu `⋯` untuk aksi sekunder.
5. State: `Skeleton` saat memuat, `EmptyState` bila kosong, `Alert` bila galat + "Coba lagi".

### 7.2 Halaman Detail Dokumen

- Header: judul, `StatusBadge`, `LetterNumberChip`, pengaju, tanggal.
- `Tabs`: **Detail** · **Versi** · **Riwayat** · (opsional) **Komentar**.
- Panel kanan (desktop) / kartu bawah (ponsel): `ApprovalActions` (untuk Direktur) atau tombol **Kirim untuk Persetujuan** (untuk pengaju).
- Dokumen terkunci (menunggu/disetujui): tampilkan `Alert` informatif "Dokumen terkunci karena sedang menunggu persetujuan".

### 7.3 Antrean Persetujuan (Direktur)

- Daftar kartu/tabel ringkas diurutkan paling lama menunggu, penanda bagian (HR/Keuangan/Program) lewat `Badge` netral.
- Aksi cepat: **Buka**, **Setujui** (konfirmasi), **Minta Revisi/Tolak** (dialog + catatan wajib).
- Pratinjau dokumen lewat `Sheet` tanpa meninggalkan antrean.

### 7.4 Formulir (mis. Karyawan, Kontrak, RAB)

- Satu kolom di ponsel, dua kolom `md+`; kelompokkan dengan `Card` dan judul seksi.
- Label di atas input, teks bantu di bawah, galat inline berwarna merah + ikon.
- Tombol: **Simpan** (primary) di kanan, **Batal** (ghost/outline) di kiri; `disabled` + spinner saat menyimpan.
- Tombol "Simpan" tetap terlihat (sticky footer) pada formulir panjang di ponsel.
- RAB: tabel item editable (`uraian · volume · satuan · harga · subtotal`), total otomatis di bawah, nominal rata kanan.

### 7.5 Reservasi Nomor Surat

- `Dialog`: pilih jenis surat → pratinjau format → **Reservasi Nomor** → hasil ditampilkan besar dalam font mono dengan tombol **Salin**.
- Teks bantu: "Nomor ini langsung dikunci untuk Anda dan tidak akan diberikan ke orang lain."
- Register: tabel dengan `StatusBadge` Direservasi/Terpakai/Dibatalkan; nomor *void* tampil pudar dan dicoret ringan, alasan tersedia di tooltip.

### 7.6 Absensi dan Logbook

- **Absensi Hari Ini**: `AttendanceCard` besar menampilkan tanggal, jam server (WIT), tombol **Check-in** / **Check-out**; setelah check-in tombol berubah dan menampilkan jam masuk.
- **Logbook**: editor sederhana (tanggal, uraian aktivitas, jam); indikator "Terkunci" setelah batas edit.
- **Rekap Direktur**: tabel/heatmap karyawan × tanggal dengan warna status + ikon; filter bagian/karyawan; panel "Belum mengisi hari ini".

### 7.7 Unggah Bukti Kegiatan (Staf Lapangan)

- Layar sederhana: pilih kegiatan → **Ambil/Pilih Foto** (tombol lebar penuh) → keterangan singkat → **Kirim Bukti**.
- Progres per berkas, tombol **Coba Lagi** bila gagal, pesan pengingat: *"Jangan unggah data pasien atau identitas pasien."*
- Setelah sukses: toast + `EvidenceGallery` memperlihatkan hasil.

### 7.8 Dashboard

| Peran | Isi utama |
| --- | --- |
| Direktur | `StatCard`: Menunggu Persetujuan, Hadir Hari Ini, Logbook Belum Terisi, Kegiatan Berjalan, Kontrak Segera Berakhir; antrean persetujuan terbaru; grafik absensi mingguan; ringkasan RAB vs realisasi |
| Manajer bagian | Status dokumen bagiannya, tugas yang perlu tindakan |
| Karyawan | Kartu absensi/logbook hari ini, kegiatan yang ditugaskan |

Setiap `StatCard` dapat diklik menuju daftar terfilter.

---

## 8. Umpan Balik, Status Sistem, dan Mikrokopi

| Situasi | Pola | Contoh teks (Bahasa Indonesia) |
| --- | --- | --- |
| Berhasil | Toast (hijau, ikon centang) | "Dokumen berhasil dikirim untuk persetujuan." |
| Gagal | Toast/Alert merah + solusi | "Gagal mengunggah berkas. Periksa koneksi lalu coba lagi." |
| Validasi | Pesan inline di bawah field | "Tanggal berakhir harus setelah tanggal mulai." |
| Akses ditolak | Halaman/Alert 403 | "Anda tidak memiliki akses ke halaman ini." |
| Konfirmasi setuju | AlertDialog | "Setujui dokumen ini? Dokumen akan terkunci dan tidak dapat diubah." |
| Konfirmasi tolak | Dialog + catatan wajib | "Tulis alasan penolakan agar pengaju dapat memperbaikinya." |
| Kosong | `EmptyState` | "Belum ada dokumen. Mulai dengan membuat dokumen baru." |
| Memuat | `Skeleton` | – |
| Sesi habis | Redirect login | "Sesi Anda telah berakhir. Silakan masuk kembali." |

**Gaya bahasa:** Bahasa Indonesia baku yang ramah, kalimat pendek, kata kerja aktif, label tombol berupa kata kerja ("Simpan", "Kirim untuk Persetujuan", "Reservasi Nomor"). Istilah konsisten: *dokumen, persetujuan, nomor surat, kegiatan, bukti, logbook, absensi*. Format tanggal `16 Okt 2026`, jam 24 jam `08.30 WIT`, uang `Rp 1.250.000`.

---

## 9. Aksesibilitas (target WCAG 2.2 AA)

| Aspek | Ketentuan |
| --- | --- |
| Kontras teks | ≥ 4,5 : 1 (teks normal), ≥ 3 : 1 (teks besar dan komponen UI). Tombol primary hijau 700 + teks putih memenuhi AA; **verifikasi ulang tiap kali warna diubah** (mis. dengan alat kontras) |
| Fokus | Cincin fokus `ring` hijau selalu terlihat (`focus-visible`), jangan dihapus |
| Keyboard | Seluruh fungsi dapat dioperasikan dengan keyboard; urutan tab logis; dialog menjebak fokus (bawaan Radix) |
| Label | Setiap input punya `<Label>`; tombol ikon punya `aria-label` + `Tooltip` |
| Status | Warna + ikon + teks; `aria-live` untuk toast/galat form |
| Area sentuh | ≥ 44×44 px untuk kontrol utama di ponsel |
| Zoom/teks | Tata letak tetap utuh hingga zoom 200%; ukuran teks relatif (`rem`) |
| Gerak | Hormati `prefers-reduced-motion`; animasi singkat (≤ 200 ms) |
| Bahasa | `<html lang="id">` |

---

## 10. Responsif dan Mode Gelap

| Perangkat | Penyesuaian |
| --- | --- |
| Ponsel (< 640) | Satu kolom, tabel menjadi **daftar kartu** atau tabel dengan *scroll* horizontal di dalam kontainer, tombol penuh lebar untuk aksi utama, bottom bar untuk Staf Lapangan |
| Tablet (640–1024) | Sidebar sebagai `Sheet`, form dua kolom bila muat |
| Desktop (≥ 1024) | Sidebar tetap, tabel penuh, panel samping untuk aksi persetujuan |

Mode gelap disediakan lewat kelas `.dark` (token di 2.2) dengan pengalih tema di menu avatar; default mengikuti preferensi sistem. Gambar bukti tidak diubah warna.

---

## 11. Ikon, Ilustrasi, dan Branding

- **Ikon:** `lucide-react`, ukuran 16/20 px, `stroke 1.75–2`, warna mengikuti teks; ikon pendamping selalu dengan teks untuk aksi penting.
- **Logo:** gunakan logo resmi Yayasan Sinar Bhakti Husada (SVG). Siapkan varian horizontal (header), ikon saja (sidebar ciut, favicon), dan monokrom putih (latar hijau).
- **Halaman login:** layout dua panel desktop: kiri latar hijau tua (`green-900`) dengan logo + tagline singkat; kanan formulir masuk di kartu putih. Di ponsel hanya formulir.
- **Ilustrasi:** minimal, garis sederhana berwarna hijau untuk `EmptyState`. Jangan memakai foto pasien atau gambar medis eksplisit.
- **Favicon/PWA:** ikon hijau; `theme-color` `#15803D`.

---

## 12. Tampilan per Peran (Navigasi Ringkas)

| Peran | Item navigasi (sidebar) |
| --- | --- |
| Direktur | Dashboard · Persetujuan · Dokumen · Absensi · Logbook · Karyawan · Kegiatan · RAB/LPJ · Gaji · Register Surat · Audit Log |
| HR Manager / Staf HR | Dashboard · Karyawan · Kontrak · Akun · Dokumen · Register Surat · Absensi Saya · Logbook Saya |
| Finance Manager | Dashboard · Gaji · RAB · LPJ · Bukti Kegiatan · Dokumen · Register Surat · Absensi · Logbook |
| Program Manager / Officer | Dashboard · Kegiatan · Pelaksanaan · Bukti Kegiatan · Dokumen · Register Surat · Absensi · Logbook |
| Staf Lapangan | Beranda · Kegiatan Saya · Unggah Bukti · Absensi · Logbook (bottom bar di ponsel) |

Item yang tidak berhak **tidak ditampilkan**, dan rute tetap dilindungi backend. HR tidak pernah melihat menu **Gaji**.

---

## 13. Panduan Implementasi

1. Pasang tema hijau (bagian 2.2) **sebelum** menambah komponen agar tidak ada kode warna *hard-coded*.
2. Hanya gunakan token (`bg-primary`, `text-muted-foreground`, `border-border`), **jangan** `bg-green-700` langsung di komponen fitur.
3. Jangan mengedit file di `components/ui/` selain untuk penyesuaian tema global; logika domain masuk `components/shared/` atau `features/`.
4. Semua daftar memakai `DataTable`; semua form memakai `Form` + Zod; semua status memakai `StatusBadge`.
5. Setiap halaman wajib menangani state: memuat, kosong, galat, dan tanpa akses.
6. Tinjau di lebar 375 px (ponsel) dan 1280 px (desktop) sebelum menandai selesai.
7. Kunci versi `shadcn`, `tailwindcss`, dan `radix` di lockfile; perbarui terencana.

---

## 14. Checklist Desain (Definition of Done UI)

- [ ] Token tema hijau terpasang; mode terang dan gelap berfungsi.
- [ ] Kontras AA terverifikasi untuk primary, teks muted, badge status.
- [ ] Semua status memakai warna + ikon + teks.
- [ ] Aksi tak terbalikkan memakai `AlertDialog`; catatan wajib pada Tolak/Revisi.
- [ ] Nomor surat tampil mono + dapat disalin.
- [ ] Halaman Staf Lapangan nyaman di ponsel (bottom bar, tombol besar, progres unggah).
- [ ] Keyboard dan pembaca layar diuji pada alur utama (login, ajukan, setujui).
- [ ] Teks UI Bahasa Indonesia, konsisten dengan glosarium PRD.
- [ ] Tidak ada data pasien pada layar, contoh, atau seed data.
