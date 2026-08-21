# 📱 KasKelas (H2i) - Rekap Kas Siswa & Talangan LKPD (PWA Offline-First)

Aplikasi **KasKelas** adalah web app Progressive Web Application (PWA) berorientasi *Offline-First* yang terintegrasi langsung dengan Google Sheets melalui **Google Apps Script (Web App URL)** dan **AppSheet REST API v2**.

---

## 🌟 Fitur Unggulan

- **Offline-First & PWA Installable**: Dapat diinstal langsung ke layar utama HP Android (Chrome), iOS (Safari), maupun Laptop/PC tanpa melalui Play Store. Tetap dapat digunakan saat tanpa koneksi internet.
- **Pencatatan Kas Harian & Lunas Mingguan**: Memudahkan bendahara mencatat setoran harian (Senin–Jumat) serta tombol instan pelunasan mingguan.
- **Sistem Talangan LKPD & Cicilan Pengembalian**: Mendukung pemisahan jenis transaksi:
  - 🔴 Belanja Operasional Kelas
  - 🟡 Dana Talangan Kelas (LKPD, Buku, Seragam)
  - 🟢 Pengembalian/Cicilan Talangan Siswa
- **SOP 2 Bendahara (Anti-Konflik / Smart Merge)**: Sistem sinkronisasi batch aman yang mencegah timpa data antar bendahara.
- **Buku Panduan Interaktif Lengkap**: Tab panduan lengkap langsung di dalam aplikasi (Bab 1 s.d. Bab 7).
- **Laporan Resmi & Cetak PDF**: Format neraca pertanggungjawaban lengkap yang siap ditandatangani Wali Kelas dan Bendahara.
- **Google Sheets Backend (`Code.gs`)**: Database mandiri dan gratis menggunakan Google Apps Script.

---

## 📁 Struktur File Proyek

- `index.html` - Aplikasi antarmuka utama (PWA, Tailwind CSS, Lucide Icons, jsPDF).
- `manifest.json` - Konfigurasi Web App Manifest PWA (ikon, nama, tema, orientasi).
- `sw.js` - Service Worker untuk caching offline dan PWA handler.
- `server.js` - Web server Node.js dengan penanganan MIME-type PWA.
- `Code.gs` - Script Google Apps Script untuk backend Google Sheets (CRUD & Sync).
- `icon.svg`, `icon-192.png`, `icon-512.png` - Ikon branding aplikasi resmi H2i.
- `DEPLOYMENT.md` - Panduan deployment ke GitHub Pages / Vercel / Cloud Run.
- `SECURITY.md` - Panduan keamanan data dan API.

---

## 🚀 Cara Menghubungkan ke GitHub & Deployment

### 1. Hubungkan ke Repositori GitHub Anda:
```bash
git init
git add .
git commit -m "feat: upgrade KasKelas PWA dengan sistem talangan LKPD & panduan interaktif"
git branch -M main
git remote add origin https://github.com/USERNAME_ANDA/NAMA_REPO_ANDA.git
git push -u origin main
```

### 2. Export Langsung dari Google AI Studio:
Anda dapat mengekspor atau menghubungkan repositori ini secara otomatis melalui menu **Settings (ikon gerigi) / Export** di Google AI Studio Build $\rightarrow$ pilih **Export to GitHub** atau **Download ZIP**.

