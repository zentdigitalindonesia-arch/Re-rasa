# Pembaruan kode RE RASA
Website utama: https://rerasa.web.id
QR umum: qr.html atau public/qr-rerasa.svg. QR menunjuk beranda, tanpa hash instrumen.

Sekali saja, login melalui terminal:
  gh auth login --hostname github.com --web --git-protocol https
  gh auth setup-git
Gunakan akun zentdigitalindonesia-arch atau kolaborator dengan izin Write. Jangan menyimpan token dalam kode.

Setelah kode diperbarui dan diuji, jalankan PUBLIKASIKAN.cmd dari folder proyek. Ini menyalin kode/aset yang diizinkan ke checkout terpisah, commit dan push main tanpa force. Database lokal, env, data tamu dan unggahan privat tidak disertakan. Penghapusan file sumber tidak otomatis menghapus file GitHub; tinjau penghapusan secara terpisah.
Vercel yang terhubung ke main menjalankan deployment setelah push. Pastikan status Ready. Menyimpan file saja tidak otomatis mempublikasikannya; publikasi adalah langkah eksplisit agar perubahan setengah jadi tidak tayang.
Jika push gagal setelah commit, checkout publikasi menyimpan commit. Setelah akses diperbaiki, jalankan ulang.

Perubahan teks/media melalui admin disimpan langsung di Supabase dan tidak perlu commit GitHub. Pembaruan katalog publik dapat mengikuti cache server hingga sekitar 30 detik, dan cache lama dapat ditampilkan sementara saat server lambat.
PUBLIC_ORIGIN Production Vercel harus https://rerasa.web.id setelah HTTPS domain aktif. Mengubah environment membutuhkan redeploy.
