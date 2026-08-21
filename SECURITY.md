# 🛡️ Panduan Keamanan Integrasi API AppSheet & PWA

## 1. Tantangan Keamanan di Pure Client-Side PWA
Aplikasi PWA KasKelas berjalan secara murni di sisi browser (Client-Side HTML/JS) tanpa membutuhkan backend server perantara (middleman).
Jika `App ID` atau `Application Access Key` hardcoded di dalam source code HTML/JS:
- Kredensial dapat dengan mudah ditemukan via Inspect Element / View Source.
- Siapa pun bisa mengambil Access Key tersebut untuk mengubah data di Google Sheets / AppSheet.

---

## 2. Solusi: Method 1 - User Input & Local Storage Encryption
Untuk menjaga integritas dan keamanan kredensial:
1. **Penyimpanan Mandiri (Decentralized Credentials)**:
   Wali Kelas / Bendahara memasukkan `App ID` dan `Access Key` secara mandiri melalui menu **Setting & Database**.
2. **Local Storage**:
   Kredensial disimpan secara lokal di memori browser pengguna (`localStorage`) dan **tidak pernah** dikirimkan ke server mana pun selain langsung ke endpoint resmi Google AppSheet REST API:
   `https://www.appsheet.com/api/v2/apps/{appId}/tables/{tableName}/Action`
3. **Praktik Terbaik Penggunaan**:
   - Berikan hak akses terbatas pada Google Sheets pengampu.
   - Aktifkan `Enable AppSheet API v2` di AppSheet Editor hanya untuk tabel `Kas_Harian` dan `Pengeluaran_Kas`.
