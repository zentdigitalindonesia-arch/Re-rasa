# FMTI — Registrasi dan pemindai konser

Alamat produksi:
- Registrasi: https://rerasa.web.id/registrasi
- Pemindai panitia: https://rerasa.web.id/scan-konser (memerlukan tautan akses khusus)
- Dashboard: https://rerasa.web.id/admin.html#konser

Acara diatur 28–29 Oktober 2026, zona waktu Asia/Makassar (WITA / UTC+8). Satu tiket berlaku untuk kedua hari, satu check-in resmi setiap hari sejak 00.00 sampai 23.59 WITA. Nama acara dan informasi venue ada di concert-config.json; lokasi belum diberikan sehingga ditampilkan sebagai informasi dari panitia. Registrasi memerlukan internet dan ditutup pada 30 Oktober 00.00 WITA.

## Aktivasi Supabase
Jalankan supabase/04-konser-fmti.sql satu kali melalui SQL Editor. Aman diulang untuk skema yang sama. SQL membuat tabel rerasa_concert_guests, rerasa_concert_scanners, rerasa_concert_checkins, rerasa_concert_scan_events, view attendance, dan fungsi transaksi. Tidak mengubah data pameran. RLS aktif; anon/authenticated tidak dapat membaca kontak/IP/token hash. Backend service_role menjadi jalur akses. Tidak ada kunci server baru yang perlu ditempel ke browser.

## Alur pengunjung
1. Buka /registrasi; isi nama, nomor kontak/WhatsApp, kota/daerah. Pengunjung luar negeri memilih International dan mengisi negara; kota opsional.
2. Setujui pencatatan data acara, termasuk IP jaringan.
3. Tiket unik terbit. Simpan JPG atau screenshot QR. QR berisi tautan dengan token acak 256 bit; nomor kontak dan IP tidak dimasukkan ke QR.
4. Tunjukkan QR kepada panitia. QR pameran/instrumen bukan tiket konser.

## Alur admin dan panitia
1. Login dashboard admin. Tab Pengunjung pameran dan Penonton konser memiliki tabel/filter terpisah.
2. Pada tab konser, buat akses untuk setiap HP, misalnya Gerbang A — HP 1. Tautan akses ditampilkan sekali. Bagikan sendiri hanya kepada panitia; tidak perlu memberi password admin utama.
3. Pada HP panitia, buka tautan akses dengan koneksi internet/data seluler. Beri izin kamera. Tekan Unduh / perbarui daftar dan tunggu keterangan halaman siap dibuka offline. Daftar hanya berisi nama, asal, kode tiket, hash QR, dan status hari; tidak memuat nomor kontak atau IP.
4. Periksa tanggal/jam HP; hari pemindaian harus cocok dengan tanggal WITA acara. Tidak dapat melakukan check-in resmi pada hari di luar 28/29 Oktober.
5. Buka kamera, scan satu tiket, baca hasil, lalu tekan Scan berikutnya. Input manual tersedia jika kamera gagal. Kamera tidak merekam/mengunggah foto atau video.
6. Online: hasil server checked_in dihitung resmi. already_checked_in menandakan tiket sudah dipakai pada hari yang sama.
7. Tanpa internet: tiket yang cocok dengan daftar ditandai Diterima sementara — offline. Antrean disimpan di IndexedDB dan bertahan saat halaman dimuat ulang. Tiket baru bertanda tangan tetap dapat diverifikasi menggunakan kunci yang diunduh; tiket tanpa kecocokan daftar atau tanda tangan harus menunggu konfirmasi server.
8. Saat tersambung kembali, buka/biarkan pemindai terbuka dan tekan Sinkronkan antrean. Tunggu angka antrean menjadi 0. Tinjau hasil konflik. Sinkronisasi bukan proses latar belakang yang dijamin saat browser ditutup.
9. Jangan menghapus data browser, memakai mode privat, mengganti akses, atau mencabut akses sebelum antrean tersinkron. Keluar perangkat menghapus data offline setelah antrean kosong. Akses pemindai berakhir 6 November 2026 pukul 00.00 WITA. Sinkronisasi terlambat dibatasi 7 hari dari waktu scan.

## Batas mode offline dan pertanggungjawaban
- Dua HP yang sama-sama offline tidak dapat mengetahui pemakaian tiket satu sama lain. Server menerima paling banyak satu check-in per tiket per hari; pemindaian lain menjadi scan ulang setelah sinkronisasi. Untuk mengurangi risiko masuk ganda di lapangan, gunakan koneksi seluler atau pembagian antrean/gate yang dikendalikan panitia.
- Angka dashboard resmi hanya berasal dari check-in yang telah diterima server. Satu tiket check-in dua hari = satu tiket unik dan dua check-in. Identitas orang tidak diverifikasi melalui OTP.
- IP adalah alamat jaringan yang dilihat server, bukan identitas perangkat/orang. NAT, hotspot, operator seluler, dan VPN dapat membuat banyak orang memiliki IP yang sama atau satu orang berubah IP. Kontak dan nama merupakan data yang diisi pengunjung, belum diverifikasi OTP/identitas.
- Bukti operasional: nomor tiket, waktu registrasi server, IP registrasi, hasil check-in, hari acara, waktu scan HP, waktu diterima server, ID akses pemindai, IP jaringan panitia, serta penanda online/offline. Waktu HP saat offline dilaporkan perangkat; bukan waktu server saat kejadian.
- Admin dapat memfilter data, mengunduh CSV daftar penonton, dan melihat 200 log scan terakhir sesuai hari. Data lengkap juga tetap di tabel Supabase untuk audit privat. Token tiket dan akses panitia hanya disimpan sebagai hash di server; token asli ada pada tiket/HP yang diberi akses.

## Pengujian dan operasi
Pengujian memakai database terpisah dan kamera simulasi: RLS, fungsi SQL PostgreSQL, idempotensi registrasi, dua hari acara, scan ganda, antrean offline, muat ulang offline, konflik dua HP, penyimpanan IP, pemisahan data pameran/konser, dan batas izin panitia. Pengujian tidak membuat penonton palsu pada database produksi. Sebelum gerbang dibuka, lakukan gladi lapangan dengan HP dan operator sebenarnya, cek izin kamera, kondisi cahaya, koneksi data, dan kesiapan daftar offline.

Dokumentasi teknis:
- https://vercel.com/docs/headers/request-headers
- https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector

QR tiket baru dilengkapi tanda tangan digital. Setelah mengunduh daftar/kunci verifikasi, pemindai dapat memeriksa tiket bertanda tangan walaupun registrasinya lebih baru daripada daftar offline. Tiket tanpa tanda tangan yang cocok tetap memerlukan daftar atau koneksi. Duplikasi antar-HP offline baru direkonsiliasi saat sinkronisasi.

Lokasi: Benteng Rotterdam, Makassar. Semua pendaftar tampil pada tabel konser tanpa harus scan. Jika kamera gagal, admin dapat mencari nama/kode tiket dan menekan Konfirmasi hadir setelah memeriksa tiket serta kehadiran pengunjung di gerbang. Hanya dapat dicatat pada hari acara WITA; menggunakan aturan satu check-in per tiket per hari yang sama dengan scanner. Audit operator diberi label Konfirmasi manual admin.
