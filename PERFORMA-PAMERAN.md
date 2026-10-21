# Optimasi pemuatan untuk pameran

Perubahan ini tidak mengubah skema Supabase; SQL tidak perlu dijalankan ulang.

- Pintu masuk dirender memakai katalog bawaan/tersimpan tanpa menunggu permintaan Supabase.
- Katalog publik disinkronkan di latar belakang dengan batas tunggu 6 detik. Katalog terakhir yang valid disimpan di browser selama maksimum 24 jam; nama/kontak pengunjung dan respons admin tidak disimpan dalam cache ini.
- Three.js dan pemuat GLB untuk viewer lama dimuat saat viewer dibuka, bukan saat pintu masuk dibuka. Viewer baru empat instrumen tetap dimuat setelah tombol Buka model 3D.
- Formulir buku tamu yang sedang diisi tidak dirender ulang saat katalog selesai disinkronkan.
- Respons katalog publik mendapat cache CDN 30 detik; respons buku tamu dan admin tetap no-store. Perubahan katalog di publik dapat memerlukan waktu cache sebelum terlihat.
- Berkas media statis mempunyai pengaturan cache CDN. Browser tetap melakukan validasi ulang karena nama file belum memakai hash versi.

## Hasil uji lokal

Pada Chromium headless dengan viewport HP 390 × 844, pintu masuk tampil sekitar 218 ms ketika API katalog sengaja ditunda 3,5 detik. Tidak ada permintaan Three.js/GLTFLoader sebelum viewer dibuka. Isian formulir bertahan saat sinkronisasi. Viewer lama berhasil dimuat secara lazy, kontrol bekerja, dan canvas dilepas ketika keluar dari halaman.

Regresi adapter Supabase memakai backend tiruan HTTP dan uji browser: login admin, tiket tamu idempoten, izin upload sementara, unggah langsung Storage, penyimpanan katalog, konflik versi, daftar tamu/CSV, serta galeri lulus. Ini belum merupakan uji performa Supabase dan Vercel nyata. Angka waktu lokal tidak menjadi SLA internet maupun bukti kapasitas pengunjung serentak.

## Penerapan

Gunakan paket lengkap RE-RASA-PAMERAN jika belum mengunggah kode. Jika paket Supabase–Vercel sebelumnya sudah terunggah, unggah isi PATCH-PERFORMA-PAMERAN ke root repository, termasuk model-lazy.js yang baru. Selesaikan Commit changes. Setelah proyek Vercel tersedia, deploy commit terbaru; jika sudah live, redeploy setelah update. Mode SQLite lokal tetap bekerja setelah aplikasi dimuat ulang.

Untuk memastikan kesiapan acara, pengukuran berikutnya harus memakai deployment nyata dan jaringan lokasi: waktu pintu masuk, waktu membuka model pertama, pengisian tiket, unggah/simpan admin, serta pengujian bersamaan sesuai perkiraan pengunjung. Koneksi venue, perangkat pengunjung, ukuran media, cold start API, dan paket layanan menentukan hasil akhir. Hosting belum diaktifkan atau ditingkatkan oleh pembaruan ini.
