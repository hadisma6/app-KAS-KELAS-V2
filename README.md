# 📱 KasKelas - Rekap Keuangan Kas Kelas (PWA + AppSheet API v2)

Aplikasi **KasKelas** adalah web app Progressive Web Application (PWA) berorientasi *Offline-First* yang terintegrasi dengan Google Sheets melalui **AppSheet REST API v2**.

---

## 🌟 Fitur Utama

- **Offline-First Storage**: Menggunakan `localStorage` browser sehingga tetap dapat mencatat kas & pengeluaran tanpa jaringan internet.
- **Dynamic Data Flattening**: Mengubah matriks kas mingguan (Nama Siswa vs Hari Senin-Jumat) menjadi format baris terstruktur untuk AppSheet.
- **Batch Push / Upsert**: Menggunakan composite key `ID_Kas = {Minggu_Ke}-{Nama_Siswa}` dengan metode HTTP `Edit` (upsert) untuk memperbarui atau menambah data tanpa duplikasi.
- **Keamanan Kredensial (Method 1: User Input)**: Kredensial `App ID` dan `Access Key` disimpan secara aman di perangkat lokal pengguna dan dikirim langsung ke endpoint resmi Google AppSheet.
- **Laporan & Export**: Mendukung cetak PDF laporan kas dan ekspor CSV.

---

## 📁 Struktur Repositori

- `index.html` - Aplikasi utama (Single-File Complete App).
- `SECURITY.md` - Dokumentasi dan analisis keamanan koneksi API.
- `DEPLOYMENT.md` - Panduan deployment cepat ke GitHub Pages.
- `aplikasi_kas_keuangan_kelas_pwa_appsheet_api_integrated.html` - File master cadangan.

---

## 🚀 Panduan Penggunaan
1. Buka `index.html` di browser web atau deploy ke GitHub Pages (lihat [DEPLOYMENT.md](file:///c:/Users/MIA/Downloads/kas/DEPLOYMENT.md)).
2. Buka menu **Setting & Database** untuk mengonfigurasi `App ID` dan `Access Key` AppSheet.
3. Mulai input kas dan klik **Sync ke Database** ketika terhubung ke internet.
