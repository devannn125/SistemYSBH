# Panduan Desain & Sistem Komponen (Design System) — SIMSBH
**Yayasan Sinar Bhakti Husada (YSBH)**  
*Fondasi antarmuka operasional untuk mendukung eliminasi malaria di Papua.*  
*Status: Fondasi Desain · Oktober 2026 | Versi 1.0*

---

## 1. Filosofi & Prinsip Desain
- **Karakter Visual:** Tenang, tepercaya, terstruktur, dan fungsional.
- **Tujuan:** Antarmuka operasional harian yang nyaman digunakan dalam jangka waktu lama, ramah koneksi internet terbatas di Papua, serta responsif di desktop maupun perangkat seluler (*mobile-first* untuk Staf Lapangan).
- **Aksesibilitas (A11y):** Makna antarmuka tidak boleh bergantung pada warna semata; selalu padukan warna dengan ikon dan teks penjelas.
- **Hirarki Aksi:** Tepat **satu aksi utama (hijau)** per area kerja. Aksi sekunder bergaris tepi (*outline*), dan aksi berbahaya/destruktif menggunakan warna merah.

---

## 2. Palet Warna (Color Palette)

### 2.1 Warna Identitas (Brand Primary)
Warna hijau digunakan sebagai penanda tindakan utama, elemen fokus, dan penunjuk navigasi aktif.

| Nama Token | Hex Code | Peran / Penggunaan | Preview / Tailwind Class |
|---|---|---|---|
| `primary` (Utama) | `#15803D` | Tombol utama, tautan penting, indikator status aktif | `bg-emerald-700` / `#15803D` |
| `primary-hover` (Saat Diarahkan) | `#166534` | Respons penunjuk (*hover/active state*) pada tombol utama | `bg-emerald-800` / `#166534` |
| `primary-soft` (Hijau Lembut) | `#F0FDF4` | Latar kontekstual, baris tabel terpilih, sorotan informasi | `bg-emerald-50` / `#F0FDF4` |
| `primary-soft-dark` (Hijau Lembut Pekat) | `#DCFCE7` | Latar badge/lencana aktif, latar item navigasi aktif | `bg-emerald-100` / `#DCFCE7` |

### 2.2 Warna Netral (Surface & Neutral)
Permukaan bersih, garis batas tipis, dan tingkat kontras teks yang nyaman di mata untuk pekerjaan administratif harian.

| Nama Token | Hex Code | Peran / Penggunaan |
|---|---|---|
| `bg-page` (Latar Halaman) | `#F7FAF8` | Latar belakang seluruh kanvas aplikasi |
| `bg-surface` (Kartu & Panel) | `#FFFFFF` | Latar belakang kartu (*card*), modal, tabel, dan formulir |
| `border-default` (Garis Batas) | `#E3EAE5` | Garis pembatas tipis 1px pada kartu, tabel, dan divider |
| `text-primary` (Teks Utama) | `#14201A` | Warna tipografi untuk judul, label formulir, dan isi utama |
| `text-secondary` (Teks Sekunder) | `#586862` | Warna tipografi untuk petunjuk (*helper*), metadata, tanggal, placeholder |

### 2.3 Warna Semantik (Status & Feedback)
*Aturan: Wajib digabungkan antara warna, ikon, dan teks status.*

| Kategori | Hex Code | Ikon Acuan (Lucide) | Penggunaan |
|---|---|---|---|
| **Berhasil** | `#16A34A` | `CheckCircle2` | Berkas terunggah, persetujuan sukses, data tersimpan |
| **Peringatan** | `#D97706` | `AlertTriangle` | Perlu revisi, masa kontrak hampir berakhir, batas waktu logbook |
| **Bahaya** | `#DC2626` | `XCircle` / `AlertCircle` | Dokumen ditolak, pembatalan nomor surat, hapus draf |
| **Informasi** | `#0284C7` | `Info` | Petunjuk pengisian, notifikasi sistem, nomor surat dicadangkan |

---

## 3. Tipografi & Format Data

### 3.1 Pilihan Font
- **Antarmuka Utama:** `Inter` (sans-serif) — keterbacaan tinggi di berbagai resolusi layar.
- **Kode & Data Khusus:** `JetBrains Mono` (monospace) — untuk kode karyawan, nomor surat resmi, dan data berlebar tetap (*tabular figures*).

### 3.2 Skala Tipografi

| Hierarki | Font & Gaya | Ukuran / Line-height | Berat (*Weight*) | Contoh Penerapan |
|---|---|---|---|---|
| **Judul Halaman** | `Inter` | `24px / 32px` | SemiBold (600) | *Kelola operasional dengan jelas* |
| **Judul Bagian** | `Inter` | `18px / 26px` | SemiBold (600) | *Dokumen dan persetujuan* |
| **Isi Antarmuka** | `Inter` | `14px / 22px` | Regular (400) | *Survei Entomologi Merauke dijadwalkan pada 16 Okt 2026.* |
| **Teks Kecil / Metadata** | `Inter` | `12px / 18px` | Regular (400) | *Diperbarui pada 16 Okt 2026, 08.30 WIT oleh Ayu Wulandari.* |
| **Kode & Nomor Surat** | `JetBrains Mono` | `14px / 22px` | Medium (500) | `YSBH-0024 · 014/KEU/YSBH/X/2026` |

### 3.3 Format Data & Angka Tabular
- **Format Keuangan:** Menggunakan format mata uang Indonesia dan perataan kanan (*right-aligned*), misal: `Rp 1.250.000`.
- **Rasio Presensi:** Angka ringkas berlebar tetap: `24 / 28 hadir`.
- **Format Waktu:** Format baku dengan zona waktu resmi YSBH (Papua = WIT / Kantor lain = WIB):  
  `16 Okt 2026 · 08.30 WIT`.

---

## 4. Ritme Ruang, Sudut & Bayangan (Spacing & Elevation)

### 4.1 Sistem Grid & Spacing (Kelipatan 8px)
Gunakan kelipatan 8px secara konsisten untuk padding, margin, jarak antar elemen (*gap*), dan susunan otomatis (*auto-layout*):
- `8px` (`p-2`, `gap-2`) — Jarak dalam komponen kecil (badge, tombol ikon).
- `16px` (`p-4`, `gap-4`) — Jarak standar antar elemen formulir, padding kartu seluler.
- `24px` (`p-6`, `gap-6`) — Padding standar kartu desktop dan panel modul.
- `32px` (`p-8`, `gap-8`) — Jarak antar bagian dalam satu halaman.
- `48px` / `64px` — Jarak vertikal makro antar kontainer utama.

### 4.2 Dimensi Tata Letak (Layout Bounds)
- **Lebar Bilah Samping (Sidebar Desktop):** `256px` (`w-64`) tetap.
- **Bingkai Kanvas Desktop Acuan:** `1440px × 900px` (responsif ke layar laptop & monitor besar).
- **Breakpoint Seluler:** Tata letak berubah menjadi drawer / bottom-sheet / kartu bertumpuk pada lebar layar `< 768px`.

### 4.3 Sudut, Garis Pembatas, dan Bayangan
- **Sudut Lengkung (*Border Radius*):** `10px` (`rounded-[10px]`) seragam di seluruh tombol, input, kartu, dan modal.
- **Garis Batas (*Border*):** Solid `1px` menggunakan warna `#E3EAE5`.
- **Bayangan Halus (*Elevation / Soft Shadow*):**
  - CSS: `box-shadow: 0 2px 4px rgba(20, 32, 26, 0.03);`
  - Ringan, halus, dan tidak berlebihan sehingga antarmuka tetap bersih.
- **Ikonografi:** Menggunakan set ikon **Lucide React** dengan ketebalan garis konsisten `strokeWidth = 1.75`.

---

## 5. Katalog Komponen & Status Interaksi

### 5.1 Tombol (Buttons)
Sudut melengkung `10px`, tinggi standar `40px` (desktop) atau `44px` (touch-target mobile):
1. **Utama (*Primary*):** Latar `#15803D`, teks `#FFFFFF`. Hover `#166534`. Digunakan hanya untuk satu aksi terpenting per area.
2. **Sekunder (*Outline*):** Latar `#FFFFFF`, garis batas 1px `#15803D`, teks `#15803D`.
3. **Tersier (*Ghost / Neutral*):** Latar `#FFFFFF` atau transparan, garis batas 1px `#E3EAE5`, teks `#14201A`.
4. **Destruktif (*Danger*):** Latar `#DC2626`, teks `#FFFFFF`. Hover `#B91C1C`. Untuk aksi berbahaya seperti Hapus atau Batalkan.
5. **Tombol Ikon (*Icon Only*):** Kotak berukuran `40×40px`, sudut `10px`, garis batas 1px `#E3EAE5`, memuat ikon Lucide `1.75px`.
6. **Keadaan Memuat (*Loading*):** Menampilkan spinner pemutar halus dan teks *"Memuat..."*, tombol dinonaktifkan sementara.
7. **Dinonaktifkan (*Disabled*):** Latar abu-abu pudar `#E3EAE5`, teks `#586862`, kursor `not-allowed`.

### 5.2 Formulir & Pemilih Tanggal (Form Inputs & Datepicker)
- **Label Formulir:** Font `Inter 14px SemiBold (600)` diletakkan di atas input.
- **Field Input:** Tinggi `40px`, latar `#FFFFFF`, border 1px `#E3EAE5`, sudut `10px`, placeholder `#586862`.
- **Fokus (*Focus State*):** Ring halus warna `#15803D` dengan ketebalan 2px tanpa merusak posisi layout.
- **Status Validasi Error:** Border berganti warna ke `#DC2626`, disertai pesan bantuan di bawah kolom teks berwarna merah dengan ikon kecil `AlertCircle`.
- **Pemilih Tanggal (*Datepicker*):** Kalender mengambang dengan tanggal terpilih dilingkari warna hijau `#15803D`.

### 5.3 Kotak Centang, Radio, & Sakelar (Checkboxes, Radios, Switches)
- **Checkbox:** Kotak ukuran `18×18px`, sudut `4px`, tercentang warna hijau `#15803D`.
- **Radio Button:** Lingkaran dengan titik pusat hijau `#15803D` saat dipilih.
- **Switch / Toggle:** Sakelar geser dengan latar hijau `#15803D` saat aktif dan abu-abu netral `#E3EAE5` saat nonaktif.

### 5.4 Tab & Tombol Berkelompok (Tabs & Segmented Controls)
- Segmentasi kapsul dengan latar netral `#F7FAF8` dan border 1px `#E3EAE5`.
- Tab aktif memiliki latar putih penuh `#FFFFFF` dengan bayangan tipis 0 2px 4px, teks tegas `#14201A`.
- Filter chips: Pil filter cepat (misal: *Semua*, *Program*, *HR*, *Keuangan*).

### 5.5 Lencana Status (Status Badges)
Semua lencana menggunakan kombinasi: **Latar lembut + Teks tegas senada + Ikon status berukuran 14px**:

| Status | Tampilan Visual | Contoh Kode Hex |
|---|---|---|
| **Draf / Konsep** | Latar abu-abu netral, teks abu-abu tua | Latar `#F3F4F6`, Teks `#4B5563` |
| **Menunggu Persetujuan** | Latar kuning/amber muda, teks amber, ikon jam | Latar `#FEF3C7`, Teks `#D97706` |
| **Perlu Revisi** | Latar oranye muda, teks oranye, ikon putar/revisi | Latar `#FFEDD5`, Teks `#EA580C` |
| **Disetujui / Terbit** | Latar hijau muda, teks hijau tua, ikon centang | Latar `#DCFCE7`, Teks `#15803D` |
| **Ditolak / Batal** | Latar merah muda, teks merah tua, ikon silang | Latar `#FEE2E2`, Teks `#DC2626` |
| **Dicadangkan (Surat)** | Latar biru muda, teks biru tua, ikon gembok/tiket | Latar `#E0F2FE`, Teks `#0284C7` |

### 5.6 Tabel Data & Paginasi (Data Table & Pagination)
- **Header:** Latar `#F7FAF8`, teks `12px SemiBold` warna `#586862`, garis bawah 1px `#E3EAE5`.
- **Baris Data:** Tinggi baris nyaman (padding vertikal 12px), garis pemisah 1px `#E3EAE5`.
- **Interaksi Hover:** Baris yang disorot berubah latar ke `#F0FDF4`.
- **Format Kode:** Kolom nomor surat atau kode pegawai wajib menggunakan font monospace `JetBrains Mono`.
- **Aksi Cepat:** Tombol menu titik tiga (`MoreHorizontal`) di sisi kanan baris.
- **Paginasi:** Teks counter *"Menampilkan 1 - 10 dari 45 dokumen"*, tombol navigasi angka dengan halaman aktif berlatar `#15803D` teks putih.

### 5.7 Kartu Ringkasan & Statistik (Cards & Metric Widgets)
- Menggunakan latar putih `#FFFFFF`, sudut `10px`, border 1px `#E3EAE5`, padding `20px` atau `24px`.
- **Kartu Statistik:**
  - Label metrik kecil di atas (`Inter 12px` abu-abu).
  - Nilai angka besar tebal tabular (misal: `Rp 1.250.000` atau `24 / 28 hadir`).
  - Baris informasi perbandingan atau status progress bar di bagian bawah.

### 5.8 Kotak Dialog & Peringatan (Modals)
- **Dialog Standar:** Judul tebal, tombol penutup silang di pojok kanan atas, tombol Batal (sekunder) dan tombol Simpan (hijau utama).
- **Dialog Destruktif / Peringatan:** Menampilkan ikon segitiga bahaya merah di samping judul (*"Hapus draf dokumen?"*), teks penjelas dampak, dan tombol aksi tegas merah `#DC2626` berdampingan dengan tombol Batal.

### 5.9 Notifikasi Singkat & Banner Pesan (Alert Banners & Toasts)
- Sudut `10px`, border 1px, latar lembut, ikon di sebelah kiri, dan tombol tutup silang di kanan:
  - **Sukses:** Latar `#F0FDF4`, border `#DCFCE7`, teks `#15803D`, ikon centang.
  - **Info:** Latar `#F0F9FF`, border `#BAE6FD`, teks `#0284C7`, ikon info.

### 5.10 Keadaan Kosong & Kerangka Pemuat (Empty State & Skeleton)
- **Keadaan Kosong (*Empty State*):** Ilustrasi kotak lembut dengan ikon di tengah (misal ikon folder atau dokumen), teks utama *"Belum ada dokumen"*, teks bantuan, dan tombol aksi utama (*"+ Buat dokumen"*).
- **Skeleton Pemuat:** Balok abu-abu pudar beranimasi pulsa halus (*pulse*) menggantikan posisi teks, kartu, atau baris tabel saat data sedang diambil dari server.

### 5.11 Unggah Berkas & Bilah Progres (File Upload & Progress)
- **Area Dropzone:** Garis putus-putus (`border-dashed 1px #E3EAE5`), sudut `10px`, ikon upload hijau, petunjuk *"Tarik berkas ke sini atau klik untuk unggah"*, serta batas format (*PDF, JPG, PNG maks 10 MB*).
- **Indikator Progres:** Menampilkan nama berkas, ukuran unggahan (`1.2 MB dari 3.4 MB`), bilah kemajuan (*progress bar*) hijau, dan tombol batalkan.

### 5.12 Avatar & Identitas Pengguna
- **Avatar:** Lingkaran inisial dengan latar belakang hijau muda `#DCFCE7` dan teks hijau tua `#15803D` (misal: "AW", "IK").
- **User Pill:** Menampilkan avatar, nama staf lengkap, serta peran dan divisi (misal: *"Ayu Wulandari — Direktur Operasional · Divisi Kesehatan"*).

---

## 6. Token Desain untuk Tailwind CSS (Konfigurasi Referensi)

File konfigurasi `tailwind.config.js` di direktori `frontend/` dapat menggunakan pemetaan token berikut:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#15803D',
          hover: '#166534',
          soft: '#F0FDF4',
          accent: '#DCFCE7',
        },
        surface: {
          page: '#F7FAF8',
          card: '#FFFFFF',
          border: '#E3EAE5',
        },
        ink: {
          primary: '#14201A',
          secondary: '#586862',
        },
        semantic: {
          success: '#16A34A',
          warning: '#D97706',
          danger: '#DC2626',
          info: '#0284C7',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'simsbh': '10px',
      },
      boxShadow: {
        'soft': '0 2px 4px rgba(20, 32, 26, 0.03)',
      }
    },
  },
  plugins: [],
}
```

