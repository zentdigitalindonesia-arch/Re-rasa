# Verifikasi modul — 21 Oktober 2026

- Validasi data: 4 record valid, ID unik, sumber bagian terikat, semua aset kosong dan tidak dianggap disetujui.
- Pemeriksaan sintaks Node: data, aplikasi, viewer, dan berkas navigasi visitor lulus.
- Chromium desktop 1365 × 900 dan mobile 390 × 844: galeri empat kartu, pencarian cocok/tidak cocok, filter, deep link, tab keyboard, placeholder, diagram gong, dan tidak ada overflow horizontal.
- Galeri tidak meminta viewer JS atau GLB sebelum aksi pengguna.
- Model sintetis dua node (hanya untuk QA): pemuatan GLB, dua hotspot, pemilihan panel, tombol bongkar, reset slider, kontrol keyboard, perpindahan tab, dan pelepasan canvas saat kembali ke galeri lulus.
- Preferensi reduced motion menonaktifkan putar otomatis; kehilangan konteks WebGL dan coba ulang lulus; GLB 404 kembali ke placeholder; tidak ada pageerror JavaScript selama uji.
- Model sintetis tidak dipasang sebagai aset pameran.

Tidak ada build/lint/typecheck framework karena proyek awal tidak menyediakannya. Data menggunakan tipe JSDoc dan pemeriksaan konfigurasi runtime/CLI. Buku tamu, database, katalog editor, serta model lama tidak dimigrasikan. Integrasi navigasi hanya menambah tautan ke galeri.

Belum dapat diverifikasi: kesesuaian budaya, varian spesimen, hak aset, label bagian, orientasi dan offset model nyata, serta rekaman audio/video karena aset tersebut belum disediakan. Fullscreen memakai API browser dan pesan fallback; hasil dapat berbeda di iOS. Pengujian model mekanis tidak menggantikan telaah ahli.

## Pembaruan paket demo
Empat SVG, empat GLB, empat WAV, empat animasi WebM dan transkrip ditambahkan. Semua berlabel SIMULASI; data bagian demo terpisah dari draf organologi asli. Uji browser memeriksa model setiap instrumen, hotspot, bongkar-rakit tiga model, penguncian badan Gong, pemutaran WAV/WebM, galeri, serta lebar mobile 390 piksel. Tidak ada status reviewed yang diberikan pada data budaya untuk mengaktifkan demo.

Video akhir memiliki metadata durasi 7,02–7,12 detik. Pengujian HTTP Range (sama dengan server pameran) membuktikan keempat video dapat diputar dan seek ke detik kedua. Keempat WAV dapat diputar. Pengujian browser modul final lulus dengan nol pageerror. Galeri dan viewer telah diperiksa pada desktop dan mobile.
