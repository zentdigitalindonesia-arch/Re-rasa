# RE’RASA: Supabase + Vercel

Proyek Supabase: https://gzsrjjwwkzgzzqzbvqlo.supabase.co

SQL Editor: https://supabase.com/dashboard/project/gzsrjjwwkzgzzqzbvqlo/sql/new

Repository: https://github.com/zentdigitalindonesia-arch/Re-rasa

Domain tujuan: rerasa.web.id. Konfigurasi DNS dilakukan setelah proyek Vercel memberikan instruksi record domain yang tepat. Tidak ada kredensial di paket ini. Database Supabase belum dipasang otomatis; sesi browser yang dapat diakses agen belum login.

## 1. Pasang skema Supabase

Di SQL Editor, buka query baru. Salin seluruh isi supabase/00-setup.sql, lalu klik Run. Berkas ini menggabungkan 01-schema.sql dan 02-seed.sql; tidak perlu menjalankan ketiganya. Pilihan terpisah: jalankan 01-schema.sql dahulu, kemudian 02-seed.sql.

SQL membuat tiga tabel rerasa_guests, rerasa_instruments, rerasa_translations, dua fungsi transaksi, serta bucket rerasa-media. Seed berisi 9 instrumen dari katalog bawaan dan cache terjemahan, tanpa data pengunjung. Tabel menggunakan RLS dan tidak memberikan akses kepada anon/authenticated. API server dengan service_role menjadi satu-satunya jalur aplikasi membaca/mengubah data. Bucket bersifat publik khusus media pameran; jangan menyimpan database, kontak, atau backup di dalamnya. Tidak ada izin upload anonim; editor meminta tautan unggah sementara dari API admin.

Setelah Success, pastikan Table Editor memperlihatkan ketiga tabel dan Storage memperlihatkan rerasa-media. SQL aman dijalankan ulang untuk setup ini: seed tidak menggantikan edit katalog yang sudah ada. Jika nama tabel/bucket telah dipakai untuk aplikasi lain, periksa dulu agar tidak berbagi izin maupun isi.

## 2. Unggah paket baru ke GitHub

Gunakan isi folder RE-RASA-SUPABASE-VERCEL (ekstrak ZIP bila perlu). Jangan memakai ZIP Render sebelumnya. Berkas vercel.json, package.json, index.html, folder api, assets, public, dan supabase harus berada pada tingkat yang sesuai di root repository. Jangan unggah ZIP sebagai satu berkas website. Unggah bertahap jika GitHub membatasi jumlah file per commit.

Folder dist dihasilkan saat build; tidak perlu diunggah. Database SQLite, data tamu lokal, .env, log, dan folder cadangan tidak disertakan. File SQL berisi struktur dan katalog awal saja, sehingga boleh masuk repository. Jangan menaruh kunci service_role di SQL atau kode browser.

## 3. Import di Vercel

Buat akun/masuk Vercel → Add New → Project → import repository Re-rasa. Pilih Framework Preset Other dan Node.js 24. Build Command: node build-vercel.cjs. Output Directory: dist. Pengaturan ini juga tersedia di vercel.json; jangan memilih static export yang membuang folder api.

API berada di api/handler.js. Adapter ini tidak menjalankan server.cjs, tidak membuka SQLite, dan tidak menulis filesystem Vercel. Aset demo bawaan dibundel sebagai berkas statis; unggahan baru berada di Supabase Storage.

Tambahkan environment berikut di Settings → Environment Variables untuk Production:

| Nama | Isi |
|---|---|
| SUPABASE_URL | https://gzsrjjwwkzgzzqzbvqlo.supabase.co |
| SUPABASE_SERVICE_ROLE_KEY | legacy service_role key dari Project Settings → API Keys; rahasiakan |
| SUPABASE_STORAGE_BUCKET | rerasa-media |
| PUBLIC_ORIGIN | alamat Production HTTPS persis, contoh https://nama-proyek.vercel.app |
| ADMIN_USERNAME | pengelola, atau nama lain minimal 3 karakter |
| ADMIN_PASSWORD | password pilihan Anda, minimal 16 karakter |

Jangan mengirim nilai kunci/password ke chat, screenshot publik, atau repository. Jangan memakai prefix NEXT_PUBLIC_, VITE_, atau PUBLIC_ pada kunci Supabase. Integrasi ini menggunakan legacy service_role JWT; publishable/anon key bukan penggantinya. Kunci tidak diperlukan pada browser pengunjung.

Saat import pertama, Anda dapat menetapkan nama proyek untuk mengetahui domain Production. Jika domain belum pasti, deploy dahulu, lihat domain Production di dashboard, isi PUBLIC_ORIGIN, lalu Redeploy. Sebelum konfigurasi lengkap, API sengaja menampilkan pesan layanan belum siap. Perubahan environment memerlukan redeploy. Preview deployment tidak otomatis diizinkan menulis ke database Production; gunakan environment dan proyek database terpisah jika ingin menguji preview.

## 4. Gunakan domain rerasa.web.id

Setelah situs bekerja pada domain vercel.app, buka Vercel Project → Settings → Domains → Add rerasa.web.id. Salin record DNS yang ditampilkan Vercel ke panel DNS penyedia domain. Gunakan nilai yang benar-benar tampil pada proyek; jangan menebak IP/CNAME dari contoh lama. Pembelian/pendaftaran domain yang terlihat Active belum berarti DNS sudah mengarah ke Vercel.

Tunggu status domain valid dan sertifikat HTTPS aktif. Jadikan rerasa.web.id domain utama; arahkan domain alternatif/www ke domain utama melalui pengaturan Vercel. Ubah PUBLIC_ORIGIN menjadi https://rerasa.web.id lalu Redeploy. Gunakan alamat utama itu untuk pengunjung dan admin; operasi POST/PUT dari origin lain akan ditolak untuk melindungi login admin.

## 5. Admin dan unggahan

Buka https://rerasa.web.id/admin.html (atau alamat Production sementara). Browser meminta username/password pengelola. Ini menggunakan HTTP Basic di atas HTTPS, bukan Supabase Auth; pengunjung tidak memerlukan akun. Browser dapat menyimpan sesi Basic sampai ditutup; gunakan jendela privat pada perangkat bersama. Rotasi ADMIN_PASSWORD di Vercel dan redeploy bila perlu mencabut akses.

Editor menyiapkan izin upload melalui API admin, lalu browser mengirim file langsung ke bucket Supabase. File besar tidak melewati Vercel Functions yang membatasi payload. Batas aplikasi: gambar 10 MB, audio 25 MB, GLB 40 MB, video 50 MB. Gunakan GLB mandiri dengan tekstur tertanam tanpa Draco. Bila jaringan terputus, coba ulang; implementasi ini menggunakan signed standard upload, belum TUS/resume.

URL media publik Supabase disimpan bersama konten. Hanya URL bucket proyek yang dikonfigurasi diterima. Berkas statis bawaan tetap boleh dipakai. Model GLB unggahan dapat diambil dari origin Storage yang sama dengan modelnya. Halaman galeri dan detail memakai katalog API yang sama dengan editor. Aset simulasi lokal hanya fallback yang dapat dinonaktifkan per instrumen. Baca ADMIN-KONTEN.md untuk draf, pratinjau, hotspot, dan penerbitan. Skema JSONB yang sudah dipasang mendukung kolom CMS tambahan tanpa menjalankan ulang SQL.

Ekspor buku tamu CSV dibatasi 2.000 baris per permintaan. Persempit tanggal atau gunakan ekspor privat Supabase untuk jumlah lebih besar. Tidak ada backup cloud otomatis yang dikonfigurasi dalam paket ini; periksa fitur backup/retensi paket Supabase dan simpan salinan database serta objek Storage sesuai kebutuhan.

## 6. Data lokal lama dan mode lokal

Data SQLite lama tidak diunggah otomatis. Database cloud awal memakai seed dan buku tamu kosong. Jika perlu memindahkan konten editor terbaru, unggahan lama, atau kunjungan sebelumnya, lakukan migrasi privat yang terpisah; jangan memasukkan database/kontak ke GitHub.

npm start tetap menjalankan server SQLite lokal di port 8080. Untuk menguji Supabase dari komputer, atur environment yang sama dengan PUBLIC_ORIGIN=http://localhost:8081 dan jalankan npm run dev:cloud. Pengecualian HTTP hanya berlaku pada loopback dalam mode development, bukan deployment Vercel. Anda dapat memakai Node.js 24 dengan --env-file=.env; .env tidak di-commit. Pengujian cloud lokal menulis ke Supabase nyata jika memakai kunci proyek nyata; gunakan proyek uji bila diperlukan.

## 7. Verifikasi sesudah deploy

Periksa /healthz dan /api/catalog; health memeriksa konfigurasi, sedangkan katalog membuktikan tabel dapat dibaca. Buka buku tamu, terbitkan tiket uji, lalu pastikan hanya admin yang dapat membaca kontak. Upload satu gambar, simpan katalog, muat ulang halaman, dan pastikan perubahan tetap tersedia. Uji viewer/video di HP. Akses anonim ke /api/admin/catalog harus menghasilkan 401. Jangan membagikan kunci ketika melaporkan kegagalan.

Dokumentasi: https://supabase.com/docs/guides/database/connecting-to-postgres/serverless-drivers , https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl , https://vercel.com/docs/functions/limitations , https://vercel.com/docs/project-configuration/vercel-json . Integrasi memakai Data API HTTPS sehingga tidak memerlukan password Postgres atau pooler TCP pada Vercel.
