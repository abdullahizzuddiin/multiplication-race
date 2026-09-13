# RANCANGAN GAME EDUKASI PERKALIAN
## "Jagoan Kali" — Dua Game, Dua Tujuan

**Dibuat untuk:** Johan (untuk putrinya, kelas 1–2 SD)
**Target pemain:** Anak usia 6–8 tahun, kelas 1–2 SD, sudah hafal sebagian tabel perkalian namun masih lambat/ragu-ragu
**Device utama:** HP & Tablet (layar sentuh)
**Platform:** Web-based (browser), sederhana, ringan

> Dokumen ini adalah **rancangan/spesifikasi desain**, bukan kode. Tujuannya agar bisa langsung dipakai sebagai acuan oleh AI/LLM lain untuk membangun game-nya.

---

## 1. Ringkasan Konsep

Karena ada dua tujuan pembelajaran yang berbeda sifatnya, rancangan ini memakai **dua game dalam satu aplikasi ("Jagoan Kali")**, dengan satu hub/menu utama:

| Game | Tujuan | Sifat |
|---|---|---|
| 🌱 **Kebun Kali** | Anak memahami **konsep** perkalian (kelompok berulang, array, komutatif) | Santai, eksploratif, minim tekanan waktu |
| 🏁 **Balap Kali** | Anak **hafal & cepat** mengingat seluruh 1×1–10×10 | Cepat, kompetitif dengan diri sendiri, time-based |

**Kenapa dua game terpisah?** Anak usia kelas 1–2 SD yang "sudah hafal sebagian tapi masih ragu" biasanya belum punya fondasi konsep yang benar-benar kokoh — hafalannya rentan hilang kalau tidak dipahami maknanya. Kebun Kali membangun pemahaman itu dulu secara visual; Balap Kali lalu mengubahnya jadi hafalan otomatis lewat repetisi yang menyenangkan. Keduanya terhubung lewat satu sistem skor dan satu peta kemajuan (lihat bagian 4).

---

## 2. Prinsip Desain Pedagogis

Beberapa prinsip mengajar perkalian yang saya terapkan di rancangan ini:

- **Urutan tabel dari mudah ke sulit** (bukan urut 1–10 begitu saja): 1, 2, 10 → 5 → 3, 4 → 6, 9 → 7, 8. Urutan ini mengikuti tingkat kesulitan alami — tabel 1/2/10/5 punya pola yang mudah dikenali, sedangkan 7 dan 8 biasanya paling sulit diingat anak.
- **Sifat komutatif ditunjukkan secara visual** (3×4 sama hasilnya dengan 4×3) — supaya anak tidak merasa harus menghafal 100 fakta terpisah, melainkan sekitar 55 fakta unik.
- **Scaffolding memudar (fading support)** — bantuan visual (gambar, array) diberikan penuh di awal, lalu berkurang bertahap seiring anak makin lancar, sampai akhirnya hanya angka murni.
- **Distraktor pilihan ganda tidak asal-acak** — jawaban salah dibuat menyerupai kesalahan umum anak (misal untuk 6×7=42, opsi salah bisa 36 [tertukar 6×6] atau 48 [tertukar 6×8]), supaya soal tetap melatih pemahaman, bukan menebak.
- **Repetisi adaptif (spaced repetition sederhana)** — fakta yang sering salah/lambat dijawab akan lebih sering muncul lagi, supaya latihan efisien menuju target "hafal semua 1×1–10×10", bukan hanya mengulang yang sudah dikuasai.
- **Growth mindset, bukan hukuman** — jawaban salah tidak diberi efek negatif keras (tidak ada buzzer kasar/wajah sedih besar); selalu ada nada mendukung ("Hampir benar, yuk coba lagi!").

---

## 3. GAME 1 — "Kebun Kali" (Pemahaman Konsep)

### Tema & Narasi
Anak berperan sebagai **Petani Kali** yang menumbuhkan kebun ajaib. Setiap soal yang dipahami dan dijawab benar menumbuhkan tanaman baru — kebun makin lebat dan indah seiring progres anak.

### Tujuan Pembelajaran
Anak memahami bahwa perkalian = "sejumlah kelompok, isi tiap kelompok sama", bisa membayangkan a×b sebagai susunan array (a baris × b kolom), dan mengenali bahwa a×b = b×a.

### Mekanika Gameplay — 3 Mode (dibuka bertahap dalam tiap level)

**Mode A – "Tanam Kelompok"** *(paling dasar, bantuan visual penuh)*
- Soal cerita bergambar: *"Ada 3 pot, tiap pot diisi 4 bibit. Berapa semua bibit?"*
- Anak tap tombol "+" pada tiap pot untuk mengisi bibit sesuai instruksi (angka besar, ikon jelas), lalu tekan "Hitung"
- Animasi hasil: susunan 3×4 bibit terbentuk + teks besar "3 × 4 = 12"

**Mode B – "Tebak Kebun"** *(array recognition, bantuan visual sebagian)*
- Ditampilkan grid visual (misal 5 baris × 6 kolom bunga)
- Anak memilih jawaban dari 3 pilihan besar (multiple choice)
- Feedback instan: benar → bunga mekar + confetti + suara ceria; salah → bunga layu ringan + jawaban benar ditunjukkan singkat, nada tetap suportif

**Mode C – "Kebun Kilat"** *(transisi ke kecepatan, tanpa bantuan visual)*
- Soal angka murni ("6 × 3 = ?"), 4 pilihan jawaban
- Ada batas waktu longgar (15–20 detik/soal) — bukan untuk menekan, tapi membiasakan anak menjawab tanpa perlu menghitung ulang dari nol

### Progresi Kesulitan

| Level | Tabel yang dilatih | Syarat naik level |
|---|---|---|
| 1 | 1, 2 | Akurasi ≥ 80% |
| 2 | 10, 5 | Akurasi ≥ 80% |
| 3 | 3, 4 | Akurasi ≥ 80% |
| 4 | 6, 9 | Akurasi ≥ 80% |
| 5 | 7, 8 | Akurasi ≥ 80% |

Setiap level baru = dekorasi kebun baru terbuka (jenis bunga/pohon baru).

### Skor & Gamifikasi
- Jawaban benar = +10 poin ("Benih Ajaib"), bonus +5 jika dijawab di Mode C (tanpa bantuan visual)
- Benih Ajaib dipakai untuk membuka dekorasi kebun baru
- 1–3 bintang di akhir tiap sesi berdasarkan akurasi

### Batasan Waktu
- Mode A & B: tanpa tekanan waktu per soal (fokus pemahaman) — namun ada "jam pasir sesi" opsional yang bisa diatur orang tua (misal 10–15 menit/hari) untuk kontrol screen time, ditampilkan lembut, bukan menekan
- Mode C: 15–20 detik per soal

### Customization
- Tema kebun: Bunga / Sayuran / Buah / Kebun Ajaib (fantasi warna-warni)
- Karakter maskot petani (kelinci, kucing, burung, dst — dipilih di awal)
- Orang tua bisa memilih tabel spesifik untuk difokuskan

---

## 4. GAME 2 — "Balap Kali" (Hafalan & Kecepatan)

### Tema & Narasi
Anak mengendarai kendaraan (mobil/roket/kapal, tergantung tema) dalam balapan melawan waktu. Jawaban benar = kendaraan melaju; jawaban salah/lambat = kendaraan tetap di tempat sebentar (**tidak pernah mundur**, supaya tidak memicu frustrasi).

### Tujuan Pembelajaran
Anak mampu mengingat hasil kali secara otomatis dan cepat, mencakup seluruh tabel 1–10, lewat repetisi terstruktur yang terasa seperti permainan.

### Mekanika Gameplay
- Soal muncul satu per satu ("6 × 7 = ?"), pilihan jawaban besar di bawah (3 opsi di level awal, 4 opsi mulai level 3 — makin kompleks seiring makin mahir)
- Progress bar waktu berwarna (hijau → kuning → merah) di setiap soal, bukan angka detik yang menegangkan
- 1 ronde = 10 soal atau ±60–90 detik (durasi pendek, sesuai rentang fokus anak kelas awal SD)
- Layar hasil di akhir ronde: skor, bintang, **serta tabel mana yang sudah lancar vs masih perlu latihan**, disampaikan dengan nada positif ("Kamu jago di tabel 2! Yuk latihan tabel 7 besok ya!")

### Progresi Kesulitan

| Level | Tabel | Waktu per soal | Syarat naik level |
|---|---|---|---|
| 1 | 1, 2, 10 | 10 detik | Akurasi ≥80%, rata-rata jawab <6 detik |
| 2 | 5 | 8 detik | sama |
| 3 | 3, 4 | 7 detik | sama |
| 4 | 6, 9 | 6 detik | sama |
| 5 | 7, 8 | 5 detik | sama |
| 6 "Master" | Campuran acak 1–10 | 4–5 detik | — (level akhir/pengulangan) |

### Sistem Adaptif (kunci untuk goal "hafal semua 1×1–10×10")
- Setiap fakta perkalian (ada 100, atau ~55 unik jika komutatif digabung) punya status: 🟢 Lancar / 🟡 Perlu Latihan / 🔴 Belum Dikuasai
- Fakta berstatus 🔴/🟡 muncul lebih sering di ronde berikutnya
- Status ini ditampilkan sebagai **peta 10×10** yang terisi warna — bisa dilihat anak (versi sederhana, memotivasi) maupun orang tua (versi detail)

### Skor & Gamifikasi
- Poin dasar per jawaban benar + bonus kecepatan
- **Sistem combo/streak**: jawaban benar berturut-turut memicu efek visual "on fire" + bonus poin
- Koleksi skin kendaraan yang dibuka dengan poin
- Leaderboard bersifat **personal-best saja** (bukan perbandingan sosial) — penting di usia ini agar tidak memicu tekanan berlebihan

### Batasan Waktu
Lihat tabel progresi di atas — waktu per soal makin ketat seiring level, tapi total sesi tetap pendek (1–2 menit) dengan opsi "Main Lagi" alih-alih sesi maraton panjang.

### Customization
- Tema balapan: Mobil / Luar Angkasa / Bawah Laut / Hutan
- Tingkat kesulitan waktu: Santai / Normal / Cepat
- Orang tua bisa mengatur fokus tabel tertentu untuk sesi hari itu (misal "hari ini fokus tabel 6 & 7")

### Streak Harian & Misi Harian (Daily Quest) — supaya main tiap hari

**Streak Harian ("Api Semangat")**
- Setiap hari anak menyelesaikan minimal 1 ronde Balap Kali (10 soal), hitungan streak bertambah 1
- Ditampilkan sebagai ikon api + angka hari di hub utama, plus kalender mini 7 hari terakhir (hari yang sudah dimainkan ditandai ceria)
- **Pelindung Streak**: 1× grace day gratis per minggu — kalau anak kelewatan sehari, streak tidak langsung hilang. Ini penting supaya sistem tidak memicu rasa bersalah/tekanan kalau sesekali lupa atau sedang sibuk
- Streak yang tetap terputus (melebihi pelindung) **tidak menghapus poin/koleksi yang sudah didapat** — hanya angka hari berturut-turut yang reset, dengan pesan tetap positif ("Yuk mulai streak baru hari ini!"), bukan pesan yang terasa seperti hukuman
- Milestone reward di hari ke-3, 7, 14, dan 30 berturut-turut → unlock skin kendaraan spesial / badge "Jagoan Konsisten"

**Misi Harian (Daily Quest)**
- Setiap hari muncul 1–2 misi baru (sengaja dibuat sedikit, supaya tidak membebani anak kecil), dipilih dari pool dan disesuaikan level anak saat ini. Contoh:
  - "Jawab 10 soal hari ini"
  - "Raih 3 bintang dalam 1 ronde"
  - "Coba tabel 6 hari ini"
  - "Jawab 5 soal berturut-turut tanpa salah"
- Setiap misi selesai → bonus Bintang Jagoan
- Misi reset otomatis tiap hari berdasarkan tanggal di device

**Catatan desain (supaya kebiasaan main tetap sehat):**
- Misi harian didesain agar bisa selesai dalam 1–2 ronde singkat, sejalan dengan batasan waktu sesi yang sudah ditetapkan orang tua — tujuannya membangun kebiasaan baik, bukan mendorong anak main lebih lama dari seharusnya
- Tidak ada notifikasi push yang agresif/memaksa; kalau nanti ditambahkan reminder, cukup satu kali sehari dan idealnya bisa diatur/dimatikan lewat pengaturan orang tua

---

## 5. Sistem yang Menghubungkan Kedua Game

- **Hub utama "Rumah Jagoan Kali"** — anak memilih mau ke Kebun Kali (santai) atau Balap Kali (menantang), dengan maskot yang sama sebagai pemandu di kedua game
- **Peta Penguasaan 10×10** — satu peta kemajuan gabungan dari performa di kedua game, jadi motivasi visual untuk anak ("sudah berapa kotak yang berwarna!")
- **Bintang Jagoan** — poin dari kedua game masuk ke satu sistem reward, bisa dipakai untuk dekorasi kebun ATAU skin balapan, supaya anak termotivasi main keduanya
- **Dashboard Orang Tua (opsional, direkomendasikan)** — layar terpisah (idealnya dengan kunci sederhana, misal jawab satu soal perkalian susah dulu, supaya anak tidak bisa masuk sendiri) yang menampilkan: tabel yang sudah dikuasai, waktu bermain, dan rekomendasi fokus latihan berikutnya. Ini sangat berguna bagi Johan untuk memantau progres tanpa harus duduk mendampingi setiap sesi.

---

## 6. Panduan UI/UX (khusus HP & Tablet, anak kelas 1–2 SD)

- **Target sentuh besar**: minimal setara 60–80px, dengan jarak antar tombol lebar (jari anak kurang presisi)
- **Orientasi**: disarankan mendukung keduanya — landscape untuk gameplay (Balap Kali), portrait untuk menu/Kebun Kali
- **Tipografi**: font besar, bulat, ramah anak (gaya seperti Baloo/Fredoka) — hindari font tipis yang sulit dibaca anak yang masih belajar membaca
- **Warna**: palet cerah & kontras tinggi, konsisten per tema
- **Minim teks, banyak visual & audio**: karena anak kelas 1-2 SD masih belajar membaca, instruksi sebaiknya disampaikan lewat gambar/animasi + voice-over singkat/efek suara, bukan teks panjang
- **Feedback selalu positif**: animasi & suara riang untuk jawaban benar; untuk salah, tetap lembut dan mendukung — tidak ada elemen visual yang terasa menghukum
- **Navigasi dangkal**: maksimal 2–3 level menu dari halaman utama ke gameplay; tombol "kembali" dan "ulangi" selalu terlihat
- **Sesi pendek & bisa dihentikan kapan saja**: progres tersimpan otomatis, tidak ada sesi yang memaksa anak menyelesaikan dalam satu waktu panjang

---

## 7. Contoh Alur Satu Sesi (Balap Kali)

1. Anak buka app → layar "Rumah Jagoan Kali" dengan 2 pintu: Kebun Kali & Balap Kali
2. Tap "Balap Kali" → pilih tema (misal Luar Angkasa) → otomatis mulai dari level sesuai progres tersimpan
3. Animasi loading singkat, maskot melambai
4. Soal pertama: "2 × 3 = ?", 3 pilihan jawaban besar, progress bar waktu mulai berjalan
5. Anak tap jawaban → feedback instan (benar: confetti + roket melaju; salah: efek lembut + jawaban benar ditampilkan sebentar)
6. Berlanjut sampai 10 soal atau waktu sesi habis
7. Layar hasil: skor, bintang, insight tabel mana yang kuat/lemah, tombol "Main Lagi" / "Kembali ke Rumah"
8. Progres otomatis tersimpan ke Peta Penguasaan 10×10

---

## 8. Rekomendasi Tahapan Pengembangan (untuk AI/LLM yang akan coding)

Karena cakupannya cukup luas, sarankan membangun bertahap:

1. **Fase 1 (MVP)** — Balap Kali dasar: soal pilihan ganda, timer, skor, level 1–3 (tabel 1,2,10,5,3,4), **+ streak harian dasar** (hitungan hari berturut-turut)
2. **Fase 2** — Tambahkan Kebun Kali (Mode A & B) untuk penguatan konsep, **+ Misi Harian (Daily Quest)**
3. **Fase 3** — Tambahkan sistem adaptif (repetisi fakta lemah) + Peta Penguasaan 10×10
4. **Fase 4** — Tambahkan Dashboard Orang Tua, customization penuh (tema, karakter, skin), dan sistem Bintang Jagoan lintas game

### Catatan teknis singkat (non-kode)
Dibangun sebagai aplikasi web sederhana satu halaman (HTML/CSS/JS atau framework ringan seperti React), **tanpa backend/server dan tanpa database** — seluruh pencatatan (progres, poin, streak, misi harian) disimpan di **localStorage browser**. Ini sesuai untuk skenario satu anak yang bermain di device yang sama secara konsisten.

Contoh struktur data yang disimpan di localStorage (level rancangan, bukan kode):
- `jagoanKali_progress` — peta penguasaan 10×10, level tiap game, total poin/bintang, koleksi item yang terbuka
- `jagoanKali_streak` — { currentStreak, lastPlayedDate, streakProtectionAvailable, longestStreak }
- `jagoanKali_dailyQuest` — { date, questList, completedQuestIds }
- `jagoanKali_settings` — preferensi customization (tema, karakter) & pengaturan orang tua (durasi sesi, fokus tabel)

**Catatan penting:** karena localStorage tersimpan per-browser/per-device, jika putri Johan bermain bergantian di HP dan tablet, progres dan streak **tidak otomatis sinkron** antar device (masing-masing device punya catatannya sendiri). Ini bukan bug, melainkan konsekuensi dari desain tanpa database — baik untuk diperhitungkan sejak awal, terutama karena fitur streak-nya berbasis "main tiap hari".

---

*Dokumen ini siap diberikan ke AI/LLM lain sebagai acuan pengembangan. Semua angka (poin, durasi waktu, syarat level) adalah rekomendasi awal — bisa disesuaikan setelah melihat respons langsung putri Johan saat mencoba game-nya.*
