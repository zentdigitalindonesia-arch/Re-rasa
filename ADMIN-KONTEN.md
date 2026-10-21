# Mengelola konten RE’RASA dari admin

Satu katalog kini dipakai bersama oleh editor, galeri dan halaman detail. Nama, ringkasan, narasi, perkembangan, varian, gambar, audio, video, model, sumber, serta hotspot dibaca dari API. Alias lama pui-pui diarahkan ke puik-puik pada galeri.

## Alur kerja pengelola

1. Masuk melalui /admin.html. Pada Vercel, gunakan akun admin yang diatur melalui environment; mode SQLite lokal tetap memakai akses localhost.
2. Pilih Editor koleksi, lalu instrumen yang akan diubah atau Instrumen baru.
3. Isi identitas, teks, dan sumber. Sumber ditulis satu per baris sebagai Judul | https://alamat. Urutan baris menentukan nomor sumber hotspot (dimulai 1).
4. Unggah foto, audio, video, GLB, atau poster. Pada cloud, editor meminta signed URL lalu mengirim berkas langsung ke Supabase Storage. Kolom jalur terisi otomatis. Pada server lokal, unggahan tetap memakai folder lokal.
5. Isi kredit/pemilik media, lisensi/izin penggunaan, transkrip audio/video, dan keterangan hak penggunaan. Kredit dan lisensi pada versi ini berlaku bersama untuk media instrumen; sebutkan rincian tiap media di dalam teks kredit bila berbeda.
6. Bila perlu, isi teks Inggris secara manual. Jika kolom Inggris kosong, teks Indonesia digunakan sebagai fallback. Terjemahan otomatis dapat diaktifkan; tanpa itu, penyimpanan tidak bergantung pada MyMemory.
7. Hilangkan centang Terbitkan untuk pengunjung lalu Simpan perubahan untuk menyimpan draf. Tombol Pratinjau versi terakhir disimpan membuka halaman privat yang meminta login pengelola; perubahan yang belum disimpan belum masuk pratinjau ini.
8. Setelah memeriksa hasil, isi kredit dan izin serta centang konfirmasi hak penggunaan. Centang Terbitkan untuk pengunjung, kemudian Simpan perubahan. Halaman publik mengambil data dari katalog yang sama. Cache katalog cloud dapat menunda perubahan selama masa cache (30 detik + stale revalidation).

Draf tidak ditampilkan oleh API katalog publik. Pada versi ini setiap instrumen mempunyai satu record konten: menyimpannya sebagai draf akan menghilangkannya dari katalog publik. Belum ada dua salinan terpisah untuk mempertahankan versi terbit sambil mengerjakan revisi draf. Pratinjau tidak dibagikan ke pengunjung. Tidak ada penjadwalan terbit otomatis.

## Hotspot dan model

- Upload GLB mandiri dengan tekstur tertanam, tanpa kompresi Draco. Periksa orientasi dan bentuk pada pratinjau.
- Tambah/hapus hotspot, pilih nomor yang aktif, dan seret penandanya ke permukaan yang sesuai. Fokus pada penanda lalu tombol panah juga dapat mengubah posisi. Posisi disimpan dalam ruang tampilan yang sudah dinormalisasi; viewer publik menggunakan ruang yang sama.
- Isi nama bagian, penjelasan/fungsi, bahan, dan nomor sumber. Status awal Draf/perlu verifikasi. Untuk mengubah ke Sudah ditelaah, wajib ada sumber yang valid, bahan, dan posisi yang sudah ditentukan. Label bagian publik hanya memakai bagian yang ditelaah pada model unggahan biasa. Klaim telaah merupakan tanggung jawab pengelola/ahli yang memeriksa objek.
- Nama node GLB diperlukan bila ingin menyorot mesh tertentu atau memakai bongkar-rakit. Posisi hotspot bisa tetap dipakai tanpa nama node; kamera fokus pada titik tampilan tersebut.
- Bongkar-rakit hanya diaktifkan bila pengelola mencentangnya serta semua bagian yang dipakai mempunyai node unik, offset, dan tidak berupa hubungan induk-anak. Offset X/Y/Z memakai satuan dan ruang induk node GLB, bukan koordinat hotspot yang dinormalisasi. Jangan membuat pemisahan internal berdasarkan dugaan. Gong tetap tidak dibongkar.
- Saat GLB diganti, posisi hotspot direset agar pengelola menentukannya ulang. Koordinat lama tidak dianggap cocok untuk model lain.

## Simulasi dan aset kosong

Untuk Gandrang, Kacaping, Puik-puik dan Gong, pilihan Gunakan aset simulasi bawaan memakai aset demo hanya pada kolom media yang kosong. Unggahan admin mengambil prioritas. Matikan pilihan ini jika ingin placeholder saat media belum tersedia. Model simulasi diberi label tersendiri; audio/video/gambar memiliki kredit masing-masing. Model unggahan dapat diberi jenis Simulasi geometris bila memang merupakan demo.

Jika API tidak dapat dihubungi, galeri menampilkan demo bawaan dengan pesan bahwa itu bukan versi terbaru pengelola. Tidak ada data tamu atau draf admin yang digunakan sebagai cache publik. Galeri yang berhasil tersinkron mengikuti status terbit dari API, termasuk jika tidak ada instrumen yang diterbitkan.

## Verifikasi dan batas kesiapan

Uji browser dengan backend Supabase tiruan lulus untuk unggah gambar dan GLB, posisi hotspot dengan keyboard, metadata bahan/sumber/status, simpan draf, pratinjau privat, terbitkan, lalu teks dan hotspot yang sama pada halaman pengunjung. Uji API mencakup idempotensi tiket, konflik versi dan pembatasan origin.

Skema SQL Supabase sebelumnya tidak perlu diubah karena konten instrumen disimpan sebagai JSONB. Data SQLite lokal dipertahankan. Pengujian ini belum memverifikasi kredensial Supabase asli, deployment Vercel, DNS, ataupun kapasitas 200 perangkat serentak. Lakukan tahap online setelah repository dan environment tersedia.
