# Verifikasi adapter Supabase–Vercel

21 Oktober 2026.

Selesai:

- Build statis menghasilkan dist dengan allowlist. Admin HTML, skema SQL, data seed privat, file server, .env, dan database tidak menjadi berkas statis publik.
- Pemeriksaan sintaks Node pada adapter API, store Supabase, validasi media, translator cloud, server cloud lokal, dan handler Vercel lulus.
- Uji integrasi HTTP dengan Supabase tiruan memeriksa header server-key, pembacaan katalog publik, proteksi admin, idempotensi request tiket tamu, pembatasan origin, signed upload, pembatasan URL ke bucket sendiri, konflik versi, pagination dan ekspor CSV.
- Uji browser dengan Supabase tiruan lulus untuk login admin, unggah file langsung ke Storage, konfirmasi upload, simpan katalog, daftar tamu dan galeri demo.
- SQL menyiapkan RLS, mencabut izin anon/authenticated pada tabel, dan memberikan akses fungsi transaksi hanya kepada service_role. Peninjauan SQL dilakukan pada berkas; belum dieksekusi pada Postgres proyek pengguna.

Batas verifikasi:

Proyek Supabase gzsrjjwwkzgzzqzbvqlo belum dihubungkan melalui kredensial server dan sesi browser yang tersedia belum login. Tidak ada SQL, unggahan nyata, atau migrasi tamu yang dijalankan pada proyek tersebut. Belum dilakukan build/deploy menggunakan runtime Vercel, pengujian CORS Storage nyata, atau perubahan DNS domain. Uji tiruan memeriksa perilaku adapter; tidak menggantikan uji menyeluruh setelah environment dan skema cloud dipasang.

Jalankan pemeriksaan akhir di bagian Verifikasi sesudah deploy pada DEPLOY-SUPABASE-VERCEL.md sebelum menerima kunjungan publik. Tidak ada akun berbayar, subscription, domain, atau kredensial baru yang dibuat oleh paket ini.
