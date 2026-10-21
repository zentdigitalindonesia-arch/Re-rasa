> Pembaruan: paket SIMULASI siap digunakan telah dipasang. Baca INSTRUMEN-ASET-DEMO.md. Keterangan aset kosong di bawah merekam versi awal; model asli dan verifikasi budaya tetap belum tersedia.

# Modul empat instrumen

Buka `http://localhost:3000/instruments.html` (sesuaikan port server), atau pilih **Empat instrumen** pada menu pameran. Halaman ini dapat dibaca tanpa tiket; alur tiket pameran utama tetap berlaku.

## Audit dan keputusan integrasi

Proyek menggunakan HTML/CSS/JavaScript biasa, routing hash, server Node.js, dan SQLite untuk katalog/buku tamu. Tidak ada bundler, lint atau TypeScript dalam proyek awal. Modul baru memakai ES modules dan JSDoc tanpa menambahkan React atau proses build. Three.js dan GLTFLoader memakai berkas vendor lokal yang sudah tersedia. Viewer dimuat dinamis setelah tombol Buka model 3D ditekan; galeri tidak meminta model atau video.

Katalog empat instrumen berada di `instruments-data.js`, terpisah dari database editor lama. Editor lama tidak mengubah data modul ini. Menu utama mendapat satu tautan ke galeri baru. Seluruh data awal berstatus draf, tanpa foto/model/audio/video yang diizinkan. Berkas JPG dan animasi lama tidak dianggap dokumentasi berizin secara otomatis.

## Menambah aset

1. Pilih spesimen, catat varian, asal, pemilik, dimensi, narasumber, dan izin publikasi. Foto banyak sudut diperlukan sebelum pemodelan final.
2. Tempatkan file pada `public/instruments/<slug>/references/`, `model/`, atau `media/`. Slug: `gandrang`, `kacaping`, `puik-puik`, `gong`. Server proyek menyajikan folder `public` sebagai bagian URL, jadi jalur dimulai `public/instruments/`, bukan `/instruments/`.
3. Ubah properti `thumbnail`, `model`, `audio`, `video` dari `null` pada record yang sesuai. Gunakan bentuk berikut hanya setelah izin selesai:

```js
{ src: 'public/instruments/gandrang/model/model.glb',
  credit: 'Nama pemilik / pembuat model', license: 'Izin tertulis atau lisensi',
  approved: true }
```

Audio/video memerlukan `transcript` (teks), boleh memakai `poster` (jalur foto lokal) dan `captions` (jalur WebVTT lokal). Bila memakai WebVTT, tambahkan `'.vtt':'text/vtt; charset=utf-8'` pada tabel MIME server; format ini belum tersedia dalam server awal. Player menyediakan kontrol suara, tanpa autoplay. Disarankan video MP4 H.264 dan audio MP3. Cantumkan kredit pencipta, pemain, dan pemegang hak dalam `credit`; perbarui `rights` setiap record.

Gunakan GLB mandiri dengan tekstur tertanam, tanpa Draco/KTX2 (decoder tidak dibundel). Optimalkan ukuran tekstur dan jumlah poligon sebelum menaruh model. Aset lintas origin ditolak. Viewer menampilkan progres transfer jika ukuran tersedia; kegagalan file atau WebGL menampilkan pesan, dengan opsi mencoba lagi.

## Konfigurasi organologi

Edit `parts` secara manual pada `instruments-data.js`. `meshName` harus cocok persis dengan nama node unik dari Blender. `anchor: [x,y,z]` adalah koordinat **lokal node** sebelum normalisasi tampilan. `explodeOffset: [x,y,z]` memakai koordinat **induk node**. Semua nilai awal `null`; tidak ada koordinat yang diada-adakan.

Nama, bahan, fungsi, sourceIds, dan koordinat harus ditelaah terhadap objek. Tambahkan bukti halaman/nomor objek ke catatan sumber. Sesudah pemeriksaan ahli, ubah `verificationStatus` menjadi `reviewed`; hanya bagian ini ditampilkan sebagai label publik. Draf tersedia pada tab Organologi → Catatan editorial, dengan status Perlu verifikasi.

Aktifkan `explodable: true` hanya untuk model dengan setidaknya dua bagian yang benar-benar dapat dipisah. Semua bagian reviewed harus memetakan node unik, offset harus terisi, dan node terpilih tidak boleh mempunyai hubungan induk-anak. Transform posisi diinterpolasi dari posisi asli; rotasi dan skala asli tetap utuh. Offset nol dapat digunakan pada bagian yang tidak bergerak. Jangan membuat bagian internal berdasarkan dugaan. Untuk Gong, bongkar-rakit selalu nonaktif; diagram yang tersedia diberi label SIMULASI dan tidak mewakili spesimen koleksi.

## Pemeriksaan

Jalankan `node validate-instruments.mjs` dari root untuk memeriksa konfigurasi, file, izin, referensi, serta nama node pada GLB. Jalankan `node --check instruments-app.js` dan `node --check instruments-viewer.js` untuk pemeriksaan sintaks. Tidak ada build/lint/typecheck framework yang dapat dijalankan pada proyek awal ini.

Periksa di browser: pencarian, filter, deep link, navigasi tab keyboard, status file hilang, mobile, tombol layar penuh, dan reduced motion. Setelah GLB nyata tersedia, lakukan pemeriksaan visual terhadap anchor, orientasi, bahan, dan offset bersama ahli; pengujian model sintetis hanya memeriksa mekanisme viewer.

