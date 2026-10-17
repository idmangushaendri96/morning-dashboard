# Panduan: foto pasien yang terlihat di semua perangkat

Foto disimpan di folder Google Drive Anda lewat skrip kecil (Google Apps Script). Setup sekali, ±5 menit.

1. Buka https://script.google.com → **Proyek baru**.
2. Hapus isi editor, tempel seluruh isi `Code.gs`.
3. Ganti `GANTI-PIN-INI` dengan PIN pilihan Anda (mis. 6 digit). Bagikan PIN ini hanya ke staf yang boleh melihat/mengunggah foto.
4. Pilih fungsi **setup** di dropdown atas → klik ▶ **Run** → izinkan akses Google Drive.
   (Muncul peringatan "Google belum memverifikasi aplikasi ini": pilih *Lanjutan* → *Buka ... (tidak aman)*. Ini skrip milik Anda sendiri.)
5. **Deploy** → **Deployment baru** → ikon roda gigi → **Aplikasi web**:
   - Jalankan sebagai: **Saya**
   - Yang memiliki akses: **Siapa saja**
   - Klik **Deploy**, salin **URL aplikasi web** (berakhiran `/exec`).
6. Kirim URL itu ke Claude (jangan kirim PIN di tempat umum) untuk dipasang di `index.html`
   — atau isi sendiri `PHOTO_API.URL` di `index.html`.
7. Di dashboard, saat pertama kali, klik tombol 🔒 **Foto** di pojok kanan bawah dan masukkan PIN (tersimpan di browser tersebut).

Catatan
- Jika kode skrip diubah, buat **Deployment baru** (versi baru) agar perubahan aktif.
- Foto lebih dari 30 hari otomatis dibuang ke Sampah Drive (ubah `KEEP_DAYS`).
- Foto bisa dilihat/dihapus langsung di folder Drive `MorningMeeting_Foto` oleh pemilik akun.
