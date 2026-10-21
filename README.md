> Versi CMS terpadu: editor, galeri, dan detail memakai katalog yang sama. Mulai dari ADMIN-KONTEN.md dan DEPLOY-SUPABASE-VERCEL.md. SQL yang sudah berhasil dipasang tidak perlu dijalankan ulang untuk kolom CMS ini.

# RE’RASA — Supabase + Vercel

Paket ini memakai Supabase Postgres untuk database, Supabase Storage untuk unggahan, dan Vercel Functions untuk API.

Ikuti [DEPLOY-SUPABASE-VERCEL.md](DEPLOY-SUPABASE-VERCEL.md). Gunakan konfigurasi vercel.json; petunjuk Render lama bukan jalur deployment paket ini.

`npm start` tetap menjalankan SQLite lokal. `npm run dev:cloud` menjalankan adapter Supabase setelah environment diatur. Data lokal tidak disinkronkan otomatis. Jangan unggah data pengunjung atau kunci server ke GitHub.

