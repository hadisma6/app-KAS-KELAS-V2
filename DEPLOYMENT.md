# 🚀 Deployment Guide - KasKelas PWA

Aplikasi **KasKelas** didesain sebagai **Single-File Complete PWA App** (`index.html`), sehingga dapat di-deploy secara mudah dan gratis menggunakan platform hosting statis seperti **GitHub Pages**.

---

## 📋 Langkah Deploy ke GitHub Pages

### Step 1: Persiapkan Repository GitHub
1. Buat repositori baru di GitHub (misalnya: `kas-kelas-pwa`).
2. Upload file `index.html` beserta file dokumentasi (`README.md`, `SECURITY.md`, `DEPLOYMENT.md`) ke repositori tersebut.

### Step 2: Aktifkan GitHub Pages
1. Buka tab **Settings** di repositori GitHub Anda.
2. Buka menu **Pages** di sidebar kiri.
3. Pada bagian **Build and deployment > Branch**:
   - Pilih Branch: `main` (atau `master`)
   - Pilih Folder: `/ (root)`
4. Klik **Save**.

### Step 3: Akses & Install Aplikasi
1. Tunggu 1–2 menit hingga proses build GitHub Pages selesai.
2. Buka URL GitHub Pages yang diberikan (contoh: `https://<username>.github.io/kas-kelas-pwa/`).
3. Pada smartphone atau browser komputer:
   - **Android / Chrome**: Klik menu titik tiga ➔ *Add to Home screen* / *Install App*.
   - **iOS / Safari**: Klik tombol Share ➔ *Add to Home Screen*.

---

## ⚙️ Integrasi Pertama Kali (Setting & Database)
1. Setelah aplikasi dibuka, masuk ke tab **Setting & Database**.
2. Masukkan **App ID** dan **Application Access Key** yang diambil dari AppSheet Integration Manager.
3. Simpan kredensial.
4. Aplikasi siap digunakan secara offline dan disinkronkan kapan saja ke Google Sheets/AppSheet!
