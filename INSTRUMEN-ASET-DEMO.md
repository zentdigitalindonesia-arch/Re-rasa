> Pembaruan CMS: data pengunjung sekarang diambil dari katalog API bersama editor admin. Konfigurasi demo pada berkas JS hanya fallback, bukan sumber utama konten terbit. Lihat ADMIN-KONTEN.md.

# Paket siap demo — empat instrumen

Modul kini berisi empat ilustrasi SVG, empat model GLB, empat nada WAV sintetis, empat video animasi WebM tanpa suara, empat transkrip, dan catatan asal aset untuk setiap instrumen. Semua dibuat secara prosedural untuk proyek ini, tanpa foto atau rekaman pihak ketiga. Model dan ilustrasi hanya bentuk generik; label SIMULASI selalu ditampilkan.

## Membuka

Jalankan JALANKAN.cmd seperti biasa. Pilih Empat instrumen di menu, atau buka http://localhost:8080/instruments.html . Pilih instrumen lalu Buka model 3D. Hotspot, orbit, zoom, pan, reset, dan putar otomatis siap dicoba. Tiga model dapat dibongkar-rakit; Gong tetap satu badan dan memakai diagram penampang. Tab Audio-Video memuat media lokal yang diputar atas tindakan pengunjung.

Halaman instrumen Gandrang, Kacaping, Pui-pui/Puik-puik, dan Gong pada alur pameran lama diarahkan ke modul baru; kunjungan tetap ditandai pada peta. Katalog dan editor lama tetap menyimpan datanya sendiri. Data demo diatur pada instruments-data.js dan simulation-parts.js.

## Menjaga batas dokumentasi

Bagian simulasi memakai verificationStatus: simulation dan disimpan terpisah dalam simulationParts. Bagian objek asli tetap berstatus draft pada parts, dengan anchor dan nama mesh kosong. Tidak ada status reviewed yang diberikan kepada konten budaya hanya untuk mengaktifkan demo. approved pada aset menyatakan aset buatan proyek dapat ditampilkan, bukan verifikasi keaslian objek.

Untuk mengganti aset demo dengan dokumentasi nyata, ubah src, credit, license, approved dan hapus kind: simulation pada aset yang diganti. Model autentik kemudian menggunakan parts yang sudah ditelaah, bukan simulationParts. Jangan mengganti nama model simulasi menjadi model autentik. Catat spesimen, varian, ukuran, narasumber, foto banyak sudut dan izin pemilik.

## Sumber yang dapat diedit

- generate-assets.mjs: geometri GLB, ilustrasi SVG, WAV dan transkrip; jalankan dengan Node dari root proyek. Menjalankannya ulang menulis ulang file demo bernama demo.*; tidak menyentuh file dokumentasi lain.
- simulation-parts.js: anchor lokal node dan offset bagian demo; angka ini hanya benar terhadap model geometris yang dibundel.
- public/instruments/<slug>/references/demo.svg: ilustrasi vektor yang dapat diedit.
- public/instruments/<slug>/model/demo.glb: model tanpa decoder/tekstur eksternal.
- public/instruments/<slug>/media/demo.wav dan demo.webm: media siap putar.
- validate-instruments.mjs: memeriksa konfigurasi, berkas lokal dan nama node.

Video dirender sebagai animasi ilustrasi vektor lokal dan diberi teks SIMULASI dalam frame. Audio tidak meniru atau mengklaim bunyi autentik. Tidak diperlukan koneksi internet untuk galeri, model, atau media ini.

Panduan INSTRUMEN-PANDUAN.md tetap menjelaskan pemasangan dokumentasi asli. Pernyataan awal tentang aset kosong pada panduan/QA lama menggambarkan versi sebelum paket demo ini; paket ini melengkapinya dengan simulasi berlabel, bukan dokumentasi pengganti.

