# Product Requirements Document — Reka Alur HRIS

> Nama produk sementara: **RekaHR**
> Pemilik produk: **Reka Alur Teknologi**
> Platform: **Web/PWA**
> Versi: **1.1 — Scope diperluas, draft siap implementasi**
> Tanggal: **28 Agustus 2026**
> Fokus rilis: **Admin Dashboard + Absensi + Payroll/Slip Gaji + Verifikasi Wajah + Geo Tracking**
> Status: kebutuhan awal disusun berdasarkan brief pemilik produk dan riset produk GreatDay HR. Nama, logo, warna merek, domain, dan kebijakan absensi final masih dapat dikonfigurasi.

---

## 1. Ringkasan eksekutif

RekaHR adalah core base HRIS berbasis web untuk mendemonstrasikan digitalisasi operasional HR kepada calon client. Produk menggabungkan dua pengalaman dalam satu aplikasi:

1. **Portal Admin** untuk memantau tenaga kerja, mengelola karyawan, lokasi kerja, shift, kebijakan absensi, koreksi, payroll, slip gaji, geo tracking, dan laporan.
2. **Portal Karyawan** yang mobile-first untuk melihat jadwal, check-in/check-out dengan verifikasi wajah, memeriksa riwayat, menjalankan sesi geo tracking, mengajukan koreksi, dan membuka slip gaji.

Inspirasi produk berasal dari pola yang sudah terbukti pada GreatDay HR: data HR terpusat, employee self-service, absensi real-time berbasis lokasi dan wajah, pengaturan shift, koreksi kehadiran, payroll terintegrasi, slip gaji digital, geo tracking, serta laporan admin. Produk ini **bukan salinan tampilan, merek, teks, atau aset GreatDay**. RekaHR menggunakan alur dan identitas visual orisinal.

Versi pertama ditujukan sebagai showcase yang terasa nyata, aman, responsif, dan mudah dikembangkan menjadi produk multi-client. Backend menggunakan ekosistem Firebase agar deployment, authentication, database, file, hosting, dan observability berada dalam satu fondasi terkelola.

## 2. Latar belakang dan masalah

Calon client sering masih mengandalkan spreadsheet, grup chat, mesin fingerprint terpisah, dan rekap manual. Dampaknya:

- HR tidak mempunyai satu tampilan kondisi kehadiran hari ini.
- Data karyawan, lokasi, shift, dan absensi tersebar serta mudah tidak sinkron.
- Karyawan tidak dapat memastikan apakah check-in/check-out sudah tercatat.
- Koreksi absensi sulit ditelusuri dan rawan perubahan tanpa bukti.
- Rekap bulanan memerlukan pekerjaan manual dan sulit dipresentasikan kepada manajemen.
- Produk demo yang hanya berisi tabel statis tidak cukup menunjukkan nilai bisnis sebuah HRIS.

RekaHR harus memperlihatkan alur end-to-end yang meyakinkan: admin mengonfigurasi organisasi dan jadwal, karyawan melakukan absensi, sistem memvalidasi lokasi dan bukti, dashboard berubah secara real-time, lalu admin menangani anomali dan mengekspor laporan.

## 3. Visi produk

**Menjadi fondasi HRIS modular yang membuat aktivitas HR harian terlihat, tertib, dan dapat ditelusuri—dimulai dari absensi.**

### 3.1 Nilai utama

- **Cepat dipahami:** calon client memahami manfaat produk dalam demo kurang dari 10 menit.
- **Cepat digunakan:** karyawan dapat melakukan absensi dalam maksimal tiga aksi utama setelah membuka aplikasi.
- **Terlihat real-time:** perubahan absensi segera muncul pada dashboard admin.
- **Dapat dipercaya:** setiap rekaman menyimpan waktu, lokasi, bukti, status validasi, dan audit trail.
- **Reusable:** branding, kebijakan, lokasi, shift, dan data demo dapat diganti tanpa mengubah core aplikasi.

## 4. Sasaran dan indikator keberhasilan

### 4.1 Sasaran MVP showcase

1. Menampilkan satu alur demo lengkap dari login sampai laporan absensi.
2. Menyediakan pengalaman admin desktop dan pengalaman karyawan mobile dalam satu codebase.
3. Menyediakan data demo yang realistis tanpa memakai data pribadi asli.
4. Menjadikan Firebase sebagai backend utama dan sumber data tunggal.
5. Menyiapkan struktur yang dapat dinaikkan dari single-company demo menjadi multi-tenant.

### 4.2 KPI produk

| Sasaran | Indikator |
|---|---|
| Kejelasan demo | Minimal 80% peserta demo dapat menjelaskan tiga manfaat utama tanpa bantuan setelah sesi |
| Kecepatan absensi | Median waktu dari halaman beranda sampai sukses check-in ≤ 20 detik, di luar izin kamera/lokasi pertama kali |
| Keberhasilan tugas | ≥ 95% skenario UAT utama selesai tanpa error blocker |
| Sinkronisasi | Absensi online muncul di dashboard admin ≤ 5 detik pada koneksi normal |
| Kualitas UX | Tidak ada horizontal scroll pada viewport mobile 360 px; seluruh aksi utama dapat digunakan dengan keyboard |
| Keamanan | 0 akses data lintas organisasi dan 0 perubahan role dari client SDK |
| Performa | p75 LCP ≤ 2,5 detik pada halaman login dan employee home; p75 INP ≤ 200 ms |

## 5. Ruang lingkup rilis

### 5.1 P0 — wajib pada showcase pertama

- Login email/password dan reset password.
- Pemilihan tampilan berdasarkan role.
- Admin dashboard real-time.
- Struktur organisasi sederhana: perusahaan, departemen, jabatan, lokasi kerja.
- Data karyawan: daftar, detail, tambah, edit, aktif/nonaktif, foto profil.
- Pengaturan shift dan jadwal karyawan.
- Pengaturan lokasi/geofence dan toleransi radius.
- Employee home: status shift hari ini dan tombol check-in/check-out.
- Pengambilan lokasi browser dan selfie kamera.
- Validasi jadwal, urutan check-in/out, radius, dan kelengkapan bukti.
- Riwayat absensi karyawan.
- Daftar kehadiran admin dengan filter dan detail bukti.
- Status terlambat, pulang awal, tidak hadir, belum check-out, di luar radius, dan perlu ditinjau.
- Pengajuan serta approval/rejection koreksi absensi.
- Notifikasi dalam aplikasi.
- Laporan kehadiran dan ekspor CSV.
- Enrollment wajah karyawan, liveness challenge sederhana, dan verifikasi wajah 1:1 pada check-in/check-out.
- Geo tracking berbasis sesi kerja dengan start/stop, breadcrumb lokasi, peta admin, dan activity checkpoint.
- Master komponen gaji, profil gaji karyawan, periode/cut-off payroll, kalkulasi dari attendance, review, approval, publish, dan lock.
- Slip gaji digital privat yang dapat dilihat/diunduh karyawan.
- Dashboard payroll dan ringkasan biaya tenaga kerja menggunakan data demo.
- Audit log untuk aksi sensitif.
- PWA installable, responsive, loading/error/empty states.
- Seed data dan akun demo untuk presentasi.

### 5.2 P1 — setelah showcase pertama stabil

- Cuti/izin/sakit dan saldo cuti.
- Lembur dan approval.
- Pengumuman perusahaan.
- Import karyawan dan jadwal via CSV/XLSX.
- Ekspor XLSX/PDF.
- Web push notification melalui Firebase Cloud Messaging.
- Mode offline dengan antrean sinkronisasi yang terverifikasi.
- Multi-level approval dan scope supervisor.
- Multi-organization aktif untuk beberapa client.
- Perhitungan PPh 21/BPJS versi produksi setelah formula dan kewajiban regulasi divalidasi ahli payroll/legal.
- Provider managed liveness/face verification dan anti-spoof yang production-grade.
- Native wrapper untuk background geo tracking yang lebih andal.

### 5.3 P2 — ekspansi produk

- Reimbursement/claim.
- Rekrutmen dan onboarding.
- Performance/KPI.
- Daily activity.
- Kiosk attendance.
- Integrasi WhatsApp/email, mesin absensi, ERP, dan payroll eksternal.
- Transfer bank/multibank dan rekonsiliasi pembayaran.

### 5.4 Di luar scope MVP

- Transfer bank nyata dan pelaporan pajak/BPJS resmi.
- Native Android/iOS.
- Klaim “100% anti-fraud”.
- Face identification 1:N massal, pencarian seseorang dari seluruh database wajah, atau pemantauan CCTV.
- Pelacakan lokasi tersembunyi, di luar sesi kerja aktif, atau tanpa indikator yang terlihat oleh karyawan.
- Chat internal.

## 6. Persona dan peran

| Persona | Tujuan | Kebutuhan utama |
|---|---|---|
| Super Admin | Menyiapkan tenant dan akses | organisasi, role, pengaturan global, audit |
| HR Admin | Mengelola data dan kehadiran | karyawan, shift, monitoring, koreksi, laporan |
| Payroll Admin | Menjalankan penggajian | komponen gaji, periode, kalkulasi, review, publish slip |
| Supervisor | Memantau anggota tim | kehadiran tim, anomali, approval koreksi |
| Karyawan | Mencatat dan memeriksa kehadiran | jadwal, absensi wajah, tracking aktif, riwayat, koreksi, slip gaji |
| Demo Viewer | Memahami nilai produk | data realistis, alur mulus, insight visual |

### 6.1 Model role awal

- `SUPER_ADMIN`
- `HR_ADMIN`
- `PAYROLL_ADMIN`
- `SUPERVISOR`
- `EMPLOYEE`

Satu akun dapat mempunyai beberapa role, misalnya Payroll Admin yang juga Employee. Membership menyimpan `roles[]`, role utama/default portal, serta scope departemen/tim. Model data menyediakan `organizationId`, `departmentId`, dan `supervisorId` agar akses dapat diperluas tanpa migrasi besar.

## 7. Prinsip pengalaman pengguna

1. **Mobile-first untuk karyawan, desktop-first untuk admin.**
2. Tombol absensi adalah aksi paling menonjol di employee home.
3. Status harus memakai teks dan ikon, tidak hanya warna.
4. Sistem selalu menjelaskan mengapa absensi diterima, ditolak, atau perlu review.
5. Bukti sensitif tidak tampil pada tabel; hanya pada drawer/detail dengan akses sesuai role.
6. Konfirmasi dipakai untuk aksi berisiko, bukan untuk setiap perubahan kecil.
7. Data demo harus jelas ditandai “Demo” agar tidak dianggap data produksi.
8. Desain terinspirasi kategori HRIS modern, tetapi tidak menyalin layout atau trade dress GreatDay.

## 8. Information architecture

### 8.1 Navigasi Admin

- Overview
- Karyawan
  - Daftar Karyawan
  - Departemen & Jabatan
- Kehadiran
  - Monitor Hari Ini
  - Riwayat Kehadiran
  - Koreksi Kehadiran
  - Jadwal & Shift
  - Lokasi Kerja
- Geo Tracking
  - Live Map
  - Riwayat Perjalanan
  - Activity Checkpoint
- Penggajian
  - Dashboard Payroll
  - Komponen Gaji
  - Data Gaji Karyawan
  - Periode & Payroll Run
  - Slip Gaji
- Laporan
- Notifikasi
- Pengaturan
  - Profil Perusahaan
  - Pengguna & Role
  - Kebijakan Kehadiran
  - Audit Log

### 8.2 Navigasi Karyawan

- Beranda
- Riwayat
- Pengajuan
- Tracking
- Slip Gaji
- Notifikasi
- Profil

Pada mobile, empat menu utama menggunakan bottom navigation; Profil dapat diakses dari avatar. Tombol check-in/check-out tetap berada di beranda dan tidak menjadi item navigasi.

## 9. Alur demo utama

### 9.1 Happy path presentasi

1. Presenter login sebagai HR Admin.
2. Dashboard menunjukkan headcount, hadir, terlambat, belum hadir, dan perlu review.
3. Presenter membuka lokasi kantor serta shift reguler.
4. Presenter membuka jendela/incognito atau perangkat kedua dan login sebagai karyawan.
5. Karyawan melihat shift hari ini, memberi izin lokasi/kamera, menyelesaikan liveness challenge, lalu check-in.
6. Sistem melakukan verifikasi wajah 1:1, kemudian menunjukkan waktu, jarak dari kantor, skor/status verifikasi, dan status berhasil.
7. Dashboard admin memperbarui counter serta daftar aktivitas tanpa refresh manual.
8. Admin membuka detail rekaman dan melihat bukti, peta, serta hasil validasi.
9. Karyawan mengajukan koreksi pada data contoh yang belum check-out.
10. Supervisor/Admin menyetujui koreksi; riwayat dan audit log berubah.
11. Karyawan memulai sesi kerja lapangan; admin melihat posisi terbaru dan breadcrumb pada live map, lalu karyawan menghentikan sesi.
12. Payroll Admin membuka periode gaji, menghitung payroll dari snapshot attendance dan komponen gaji, mereview, lalu mem-publish.
13. Karyawan membuka slip gaji privat dan mengunduh PDF.
14. Admin memfilter periode lalu mengunduh laporan CSV.

### 9.2 Skenario exception yang wajib dapat didemokan

- Lokasi tidak diizinkan oleh browser.
- Kamera tidak tersedia atau izin ditolak.
- Karyawan berada di luar radius.
- Check-in terlambat.
- Check-out tanpa check-in.
- Duplikasi klik atau request terkirim ulang.
- Jadwal belum tersedia.
- Rekaman perlu review admin.
- Koneksi terputus sebelum upload selesai.
- Wajah tidak cocok atau liveness gagal.
- Permission geo tracking dicabut ketika sesi aktif.
- Payroll mempunyai komponen tidak lengkap atau selisih yang harus direview.

## 10. Kebutuhan fungsional

### 10.1 Authentication dan session

| ID | Requirement | Acceptance criteria |
|---|---|---|
| AUTH-01 | Login email/password | Kredensial valid mengarahkan user ke portal sesuai role; error tidak membocorkan apakah email terdaftar |
| AUTH-02 | Reset password | User dapat meminta email reset dan melihat konfirmasi generik |
| AUTH-03 | Protected routes | Route admin menolak role employee dan sebaliknya |
| AUTH-04 | Status akun | Akun nonaktif tidak dapat mengakses data walau token lama masih ada setelah refresh/revocation diproses |
| AUTH-05 | Session | Logout membersihkan state lokal dan mengarahkan ke login |
| AUTH-06 | Demo access | Akun demo tersedia melalui dokumentasi internal, bukan ditampilkan sebagai password publik di UI produksi |

### 10.2 Admin dashboard

Dashboard harus menjawab “apa yang terjadi hari ini?” tanpa membuka laporan.

Komponen:

- Salam, tanggal lokal, dan nama organisasi.
- KPI: total karyawan aktif, hadir, terlambat, belum hadir, izin/cuti, perlu review.
- Donut/status distribution.
- Tren kehadiran tujuh hari.
- Aktivitas check-in/out terbaru secara real-time.
- Daftar anomali prioritas.
- Ringkasan departemen.
- Quick actions: tambah karyawan, atur shift, lihat laporan.
- Filter lokasi dan departemen.

| ID | Acceptance criteria |
|---|---|
| DASH-01 | Angka KPI menggunakan hari dan zona waktu organisasi yang aktif |
| DASH-02 | Klik KPI membuka daftar yang sudah terfilter |
| DASH-03 | Update attendance online terlihat tanpa reload manual |
| DASH-04 | Empty state menyediakan CTA membuat karyawan/shift/lokasi |
| DASH-05 | Skeleton tampil saat loading; kegagalan satu widget tidak merusak seluruh dashboard |

### 10.3 Manajemen karyawan

Data P0:

- employee ID/NIK internal
- nama lengkap
- email kerja
- nomor telepon opsional
- foto profil opsional
- departemen
- jabatan
- supervisor
- lokasi kerja utama
- shift default
- tanggal bergabung
- status `ACTIVE`, `INACTIVE`, atau `INVITED`
- Firebase Auth UID setelah akun dibuat

Fitur:

- daftar dengan pencarian, filter, sort, pagination/cursor
- tambah dan edit via form
- invite/create account
- detail profil dan ringkasan kehadiran
- nonaktifkan akun dengan konfirmasi
- validasi employee ID dan email unik per organisasi

Data sensitif seperti gaji, rekening, NIK kependudukan, dan NPWP tidak dimasukkan ke model MVP.

### 10.4 Organisasi, departemen, dan jabatan

- Admin mengubah nama organisasi, logo, zona waktu, locale, dan warna merek.
- Admin membuat departemen dan jabatan.
- Penghapusan master yang masih dipakai ditolak; gunakan status arsip.
- Zona waktu default: `Asia/Jakarta`.
- Semua perhitungan hari kerja memakai zona waktu organisasi/lokasi, sedangkan timestamp disimpan dalam UTC.

### 10.5 Shift dan jadwal

Data shift:

- nama dan kode
- warna
- jam mulai dan selesai
- durasi istirahat
- toleransi terlambat
- toleransi pulang awal
- apakah melewati tengah malam
- hari kerja default
- status aktif

Fitur jadwal:

- assign shift ke satu atau banyak karyawan
- tampilan kalender mingguan/bulanan
- salin jadwal minggu sebelumnya
- hari libur/off day
- konflik jadwal terlihat sebelum simpan
- perubahan jadwal menyimpan actor dan waktu perubahan

Pada P0, satu karyawan hanya mempunyai satu assignment aktif per tanggal. Shift lintas tengah malam tetap dihitung berdasarkan tanggal mulai shift.

### 10.6 Lokasi kerja dan geofence

Data lokasi:

- nama lokasi
- alamat teks
- latitude dan longitude
- radius dalam meter
- timezone
- status aktif
- opsi “boleh di luar radius tetapi perlu review”

Aturan:

- Radius default data demo: 150 meter.
- Aplikasi menghitung jarak menggunakan koordinat lokasi dan koordinat event.
- Akurasi GPS disimpan dan ikut menentukan status review.
- Jika accuracy lebih buruk daripada batas kebijakan, event dapat diterima sebagai `NEEDS_REVIEW`, bukan dianggap valid penuh.
- Lokasi hanya diminta ketika user membuka flow absensi; tidak ada background tracking.

### 10.7 Employee home

Konten utama:

- nama dan avatar
- tanggal dan jam lokal
- kartu shift hari ini
- status absensi hari ini
- tombol kontekstual `Check-in` atau `Check-out`
- waktu masuk/keluar yang sudah tercatat
- lokasi kerja dan indikator jarak
- shortcut riwayat dan koreksi
- daftar notifikasi terbaru

Jika tidak ada jadwal, tampilkan pesan jelas dan arahkan karyawan menghubungi admin. Sistem tidak membuat absensi tanpa shift kecuali kebijakan organisasi mengizinkannya.

### 10.8 Rekam kehadiran

#### Urutan flow

1. User menekan tombol check-in/check-out.
2. Sistem memeriksa authentication, employee aktif, jadwal, dan event sebelumnya.
3. Browser meminta lokasi presisi.
4. Sistem menampilkan lokasi, akurasi, dan estimasi jarak.
5. Browser meminta kamera depan.
6. User mengambil selfie dan dapat mengulang foto.
7. User mengonfirmasi.
8. Media diunggah ke Cloud Storage pada path privat.
9. Request finalisasi dikirim dengan idempotency key.
10. Backend menyimpan timestamp server, hasil geofence, status, dan audit event.
11. UI menampilkan receipt keberhasilan atau instruksi pemulihan.

#### Data event

- `organizationId`
- `employeeId`
- `scheduleId`
- `type`: `CHECK_IN` atau `CHECK_OUT`
- `capturedAtClient`
- `receivedAtServer`
- koordinat dan accuracy
- lokasi kerja serta jarak meter
- path selfie privat
- device/browser metadata minimum
- network status
- validation flags
- status review
- idempotency key

#### Aturan bisnis

- Waktu resmi adalah `receivedAtServer`; `capturedAtClient` disimpan untuk investigasi dan mode offline.
- Tidak boleh ada dua check-in terbuka untuk satu jadwal.
- Check-out ditolak bila tidak ada check-in, kecuali dibuat melalui koreksi yang disetujui.
- Klik berulang dengan idempotency key sama menghasilkan satu event.
- Selfie dipakai sebagai bukti dan input verifikasi wajah 1:1 terhadap enrollment milik employee yang sedang login.
- Hasil verifikasi dari client tidak boleh menjadi satu-satunya dasar penerimaan; backend menyimpan provider/model version, threshold, score band, liveness result, dan alasan exception.
- Gagal geofence tidak selalu berarti gagal absensi. Kebijakan menentukan `REJECTED` atau `NEEDS_REVIEW`.
- Foto tidak boleh dapat dibaca melalui URL publik permanen.

### 10.9 Status kehadiran

Status tampilan memakai istilah yang mudah dipahami:

| Code | Label | Kondisi ringkas |
|---|---|---|
| `PRESENT` | Hadir | Check-in/out valid |
| `LATE` | Terlambat | Check-in setelah batas toleransi |
| `EARLY_OUT` | Pulang awal | Check-out sebelum batas toleransi |
| `MISSING_IN` | Belum check-in | Jadwal berjalan/selesai tanpa check-in |
| `MISSING_OUT` | Belum check-out | Ada check-in tetapi belum ada check-out setelah shift |
| `ABSENT` | Tidak hadir | Shift selesai tanpa event atau izin |
| `OFF` | Libur | Tidak ada kewajiban hadir |
| `NEEDS_REVIEW` | Perlu ditinjau | Lokasi, akurasi, bukti, atau waktu tidak memenuhi kebijakan |
| `CORRECTED` | Dikoreksi | Hasil akhir berasal dari koreksi yang disetujui |

Satu hari dapat memiliki flag tambahan seperti `OUTSIDE_GEOFENCE` dan `LOW_GPS_ACCURACY`; UI menampilkan satu status utama ditambah badges penyebab.

### 10.10 Monitor dan riwayat admin

- Tabel/daftar kehadiran dengan filter tanggal, status, lokasi, departemen, dan karyawan.
- Detail drawer menampilkan timeline, jadwal, selfie, peta, jarak, accuracy, dan audit ringkas.
- Admin dapat memberi catatan dan menandai `VALID`/`NEEDS_REVIEW`/`REJECTED` sesuai hak akses.
- Perubahan hasil tidak menimpa event mentah.
- Bulk action P0 hanya untuk assign reviewer/export; approval massal ditunda untuk menghindari salah klik.

### 10.11 Koreksi kehadiran

Karyawan dapat mengajukan koreksi jika lupa check-in/out atau waktu tidak sesuai.

Data pengajuan:

- tanggal dan jadwal
- jenis koreksi
- waktu sebelum (jika ada)
- waktu yang diminta
- alasan
- lampiran opsional
- approver
- status

State machine:

`DRAFT → SUBMITTED → APPROVED | REJECTED | CANCELLED`

Aturan:

- Pengaju tidak dapat menyetujui pengajuannya sendiri.
- Setelah submit, perubahan harus dilakukan melalui cancel dan submit ulang.
- Approval membuat derived attendance baru/versi koreksi; event asli tetap immutable.
- Rejection wajib memiliki catatan.
- Semua transisi menyimpan actor, timestamp, dan alasan.

### 10.12 Notifikasi

P0 menggunakan notification center dalam aplikasi untuk:

- check-in/check-out berhasil
- absensi perlu review
- pengajuan koreksi dibuat
- koreksi disetujui/ditolak
- jadwal diubah
- karyawan belum check-out mendekati batas waktu (in-app saat aktif)

Setiap notifikasi mempunyai status read/unread dan deep link. Web push masuk P1.

### 10.13 Laporan

Laporan P0:

- rekap kehadiran per periode
- detail event
- ringkasan per departemen/lokasi
- daftar keterlambatan
- daftar anomali/perlu review

Filter: rentang tanggal, karyawan, departemen, lokasi, dan status. Ekspor CSV harus mengikuti filter aktif, memakai UTF-8 BOM agar mudah dibuka di Excel, dan mencantumkan zona waktu laporan.

### 10.14 Audit log

Aksi yang wajib diaudit:

- login admin yang relevan terhadap keamanan
- membuat/mengubah/nonaktifkan karyawan
- perubahan role
- perubahan shift, jadwal, lokasi, dan kebijakan
- review event kehadiran
- submit/approve/reject koreksi
- enrollment/reset wajah dan review kegagalan verifikasi
- mulai/berhenti sesi tracking serta akses riwayat lokasi
- perubahan komponen/profil gaji, kalkulasi, approval, publish, dan pembatalan payroll
- membuka/mengunduh slip gaji oleh actor administratif
- ekspor laporan

Audit menyimpan actor, aksi, entity, entity ID, waktu server, organisasi, request/correlation ID, serta ringkasan perubahan. UI audit bersifat read-only.

### 10.15 Face enrollment, liveness, dan verifikasi wajah

Untuk alur absensi, kebutuhan sebenarnya adalah **verifikasi 1:1**: sistem membandingkan wajah pada sesi saat ini dengan template milik employee yang sudah login. **Identifikasi 1:N**—mencari siapa seseorang dari seluruh database—tidak diperlukan untuk absensi dan berada di luar MVP karena risiko privasi, false match, serta biaya komputasinya lebih besar.

#### Enrollment

1. Admin mengaktifkan kebutuhan face verification pada employee.
2. Employee membaca privacy notice dan menyatakan acknowledgment/consent bila dasar pemrosesan yang dipilih memang memerlukan consent.
3. Kamera mengambil beberapa frame dengan panduan pencahayaan, posisi, dan satu wajah saja.
4. Liveness challenge meminta aksi acak sederhana, misalnya kedip dan menoleh.
5. Sistem membuat template/embedding wajah, mengenkripsi atau melindungi penyimpanannya, lalu menghapus frame enrollment sementara sesuai kebijakan.
6. Enrollment berstatus `ACTIVE`, mempunyai model version, quality score, waktu, dan audit record.

#### Verifikasi saat attendance

1. Setelah lokasi diperoleh, sistem menampilkan challenge liveness acak.
2. Capture ditolak bila tidak ada wajah, terdapat lebih dari satu wajah, terlalu gelap, blur, atau challenge gagal.
3. Template sesi dibandingkan hanya dengan template employee yang sedang login.
4. Backend menghasilkan `VERIFIED`, `NOT_MATCHED`, atau `NEEDS_REVIEW` berdasarkan threshold terversi.
5. Admin hanya melihat score band seperti Tinggi/Sedang/Rendah; raw embedding dan detail model tidak ditampilkan di UI umum.

#### Batas implementasi showcase

- Mode `DEMO_LOCAL`: model berjalan di browser untuk menunjukkan UX; hasil ditandai tidak production-grade dan event masuk review bila kebijakan memerlukan kepastian backend.
- Mode `MANAGED_PROVIDER`: callable Function memanggil provider liveness/face verification yang telah disetujui; credential disimpan di Secret Manager, bukan frontend.
- Google/Firebase tidak menyediakan identity face recognition siap pakai sebagai fitur native Firebase. Karena itu, implementasi produksi membutuhkan model/provider tambahan meskipun orchestration, auth, database, storage, dan API tetap berada di Firebase.
- Tidak ada keputusan disipliner otomatis hanya berdasarkan skor wajah. Selalu tersedia exception/review manusia.
- Admin dapat melakukan reset enrollment, tetapi tidak dapat mengunduh raw template.

### 10.16 Geo tracking dan aktivitas lapangan

Geo tracking dipisahkan dari geofence absensi. Geofence hanya memeriksa satu titik saat check-in/out; tracking menyimpan rangkaian titik selama **sesi kerja lapangan yang terlihat dan aktif**.

#### Flow employee

1. Employee membuka menu Tracking dan melihat tujuan, jadwal, interval, serta informasi privasi.
2. Employee menekan `Mulai Sesi`; sistem meminta izin lokasi dan mencatat status permission.
3. Selama halaman/PWA aktif, aplikasi mengambil `watchPosition`, menyaring titik berakurasi buruk, dan mengirim batch secara periodik.
4. UI selalu menampilkan indikator “Tracking aktif”, durasi, jumlah titik tersinkron, serta tombol `Hentikan`.
5. Employee dapat menambahkan checkpoint aktivitas berupa catatan/foto.
6. Sesi berhenti otomatis pada batas shift plus toleransi, logout, atau tindakan employee; alasan berhenti dicatat.

#### Admin live map

- Hanya employee dengan sesi aktif yang tampil.
- Tampilkan posisi terbaru, umur data, accuracy, status online/offline, dan breadcrumb terbatas.
- Filter lokasi, departemen, supervisor, dan status sesi.
- Riwayat menampilkan rute, jarak estimasi, checkpoint, gap data, dan waktu mulai/selesai.
- Tidak ada leaderboard jarak atau produktivitas otomatis pada MVP.

#### Aturan privasi dan teknis

- Default sampling showcase: 30–60 detik atau perubahan jarak minimum; konfigurabel sesuai kebutuhan dan konsumsi baterai.
- Titik mentah hanya dapat diakses oleh role dan scope yang berwenang.
- Retensi default titik mentah: 30 hari; ringkasan sesi dapat disimpan lebih lama.
- Employee dapat melihat riwayat lokasi miliknya sendiri dan kapan data terakhir dikirim.
- Web/PWA **tidak menjamin background tracking** ketika tab ditutup, browser dihentikan, atau OS menghemat baterai. UI harus menampilkan gap secara jujur. Native app/wrapper menjadi opsi P1 bila tracking background wajib.
- Fake GPS tidak dapat dideteksi secara sempurna dari web. Sistem hanya menyimpan anomaly signals seperti teleport speed, accuracy ekstrem, timestamp tidak wajar, dan pola titik; hasilnya `NEEDS_REVIEW`.

### 10.17 Payroll dan slip gaji

Payroll P0 adalah alur showcase end-to-end yang deterministic dan auditable. Data uang disimpan sebagai integer rupiah; perhitungan memakai arithmetic decimal/integer, bukan floating point JavaScript.

#### Master payroll

- payment type/frequency: bulanan pada P0
- tanggal pembayaran dan cut-off
- periode gaji dan periode attendance
- komponen earning: gaji pokok, tunjangan tetap, tunjangan kehadiran, lembur, bonus
- komponen deduction: keterlambatan/ketidakhadiran bila kebijakan mengizinkan, pinjaman/adjustment demo, BPJS/PPh 21 demo
- formula/version, taxable flag, prorate rule, rounding rule, dan status aktif
- profil gaji employee dengan effective date; perubahan tidak menimpa riwayat

#### Payroll run

State machine:

`DRAFT → CALCULATING → NEEDS_REVIEW → APPROVED → PUBLISHED → LOCKED`

Jalur pembatalan hanya sebelum publish: `DRAFT/NEEDS_REVIEW → CANCELLED`. Setelah publish, koreksi dilakukan melalui adjustment pada periode berikutnya atau reversal run berotorisasi khusus; data tidak diedit diam-diam.

Flow:

1. Payroll Admin membuat periode dan memilih rentang attendance.
2. Sistem memvalidasi profil gaji, attendance unresolved, dan komponen wajib.
3. Function mengambil snapshot employee, attendance, overtime/correction, formula version, dan komponen.
4. Kalkulasi menghasilkan baris earning, deduction, gross, dan net per employee.
5. UI menampilkan summary, variance terhadap periode sebelumnya, dan exception.
6. Payroll Admin memperbaiki data sumber atau menambahkan adjustment beralasan, lalu reprocess employee tertentu.
7. Approver berbeda menyetujui run (maker-checker).
8. Publish membuat payslip immutable dan notification employee.
9. Lock mencegah perubahan input snapshot dan hasil.

#### Slip gaji employee

- Daftar slip dari terbaru ke terlama.
- Detail: organisasi, employee, periode, tanggal bayar, earning, deduction, gross, net pay, catatan, dan document ID.
- Tampilan web dan unduhan PDF A4.
- File privat; employee hanya mengakses slip miliknya.
- Optional re-authentication sebelum membuka slip.
- Payroll Admin dapat melihat slip dalam scope untuk support, dan akses tersebut diaudit.
- PDF mempunyai version/checksum agar dokumen yang diunduh dapat dilacak ke payroll run.

#### Batas finansial showcase

- Sistem dapat menampilkan komponen PPh 21 dan BPJS pada data sintetis, tetapi labelnya `SIMULASI` sampai formula, PTKP, metode pajak, batas upah, regulasi, dan kebijakan perusahaan divalidasi oleh ahli payroll/pajak.
- Tidak ada transfer uang, file bank produksi, pelaporan pajak, atau rekonsiliasi bank pada P0.
- Net pay negatif, profil tidak lengkap, attendance belum final, atau variance di atas threshold wajib memblokir publish atau masuk exception review.

### 10.18 Requirement traceability tambahan

| ID | Requirement | Acceptance ringkas |
|---|---|---|
| FACE-01 | Enrollment wajah terversi | hanya employee terkait melalui flow sah; quality/liveness lulus; reset menginvalidasi versi lama |
| FACE-02 | Verifikasi attendance 1:1 | membandingkan hanya dengan template employee login; menyimpan model, threshold, result, dan audit |
| FACE-03 | Human review | hasil gagal/ambigu tidak menghasilkan hukuman atau penolakan final tanpa jalur review |
| GEO-01 | Tracking session transparan | start/stop eksplisit, indikator selalu terlihat, auto-stop, dan history milik employee |
| GEO-02 | Live map scoped | admin/supervisor hanya melihat sesi dalam scope, posisi mempunyai age/accuracy, gap tidak diinterpolasi sebagai fakta |
| GEO-03 | Retensi | titik mentah kedaluwarsa otomatis sesuai policy dan cleanup dapat diaudit |
| PAY-01 | Payroll deterministic | input snapshot + formula version yang sama menghasilkan output sama |
| PAY-02 | Maker-checker | pembuat perubahan material tidak menjadi satu-satunya approver publish |
| PAY-03 | Payroll immutable | run published/locked tidak dapat diedit; koreksi memakai adjustment/reversal resmi |
| PAY-04 | Payslip privat | hanya employee pemilik dan role payroll scoped dapat membaca; akses administratif diaudit |
| PAY-05 | Simulation guardrail | komponen pajak/BPJS demo diberi label simulasi sampai validasi ahli selesai |

## 11. Matriks izin

| Kemampuan | Super Admin | HR Admin | Payroll Admin | Supervisor | Employee |
|---|:---:|:---:|:---:|:---:|:---:|
| Lihat dashboard organisasi | ✓ | ✓ | Payroll | Tim sendiri | — |
| Kelola organisasi/role | ✓ | Terbatas | — | — | — |
| Kelola karyawan | ✓ | ✓ | Data payroll minimum | Lihat tim | Profil sendiri terbatas |
| Kelola shift/lokasi | ✓ | ✓ | Lihat | Lihat | Lihat jadwal sendiri |
| Lihat attendance | ✓ | ✓ | Rekap payroll | Tim sendiri | Sendiri |
| Review attendance | ✓ | ✓ | — | Tim sendiri | — |
| Rekam attendance | Jika juga employee | Jika juga employee | Jika juga employee | Jika juga employee | ✓ |
| Kelola face enrollment | ✓ | ✓ | — | Reset request tim | Milik sendiri via flow |
| Lihat live/riwayat tracking | ✓ | ✓ | — | Tim sendiri | Sendiri |
| Ajukan koreksi | Jika memiliki employee profile | Jika memiliki employee profile | Jika memiliki employee profile | Jika memiliki employee profile | ✓ |
| Approve koreksi | ✓ | ✓ | — | Tim sendiri | — |
| Kelola komponen/profil gaji | ✓ | Terbatas | ✓ | — | — |
| Kalkulasi dan review payroll | ✓ | Read-only | ✓ | — | — |
| Approve/publish payroll | ✓ dengan maker-checker | Approver bila ditunjuk | Bukan pembuat run yang sama | — | — |
| Lihat slip gaji | Semua dalam scope | Terbatas/support | Semua dalam scope | Milik sendiri | Milik sendiri |
| Ekspor laporan | ✓ | ✓ | Payroll | Tim sendiri | — |
| Lihat audit | ✓ | Sesuai scope | Payroll scope | — | — |

Rules backend dan Firestore harus memvalidasi izin; menyembunyikan tombol di frontend saja tidak dianggap kontrol akses.

## 12. Spesifikasi UI dan visual

### 12.1 Arah visual

- Karakter: profesional, hangat, modern, tidak terasa seperti template admin generik.
- Layout admin: sidebar collapsible, top bar, content max-width adaptif.
- Layout employee: single-column, touch-first, bottom navigation.
- Warna merek dikonfigurasi sebagai design tokens; fallback menggunakan navy/indigo dengan accent teal.
- Radius komponen sedang, shadow tipis, kepadatan data nyaman.
- Font: sans-serif open-source dengan dukungan Bahasa Indonesia.
- Chart tidak menggunakan lebih dari enam warna kategorikal.

### 12.2 Komponen inti

- Button, input, select, combobox, date picker
- data table, pagination, filter bar
- KPI card, chart card
- badge status
- dialog, drawer, toast
- avatar dan upload
- camera capture
- face enrollment/liveness guidance
- map/location preview
- live map dan route timeline
- payroll review grid dan exception panel
- payslip viewer/print layout
- timeline
- empty, loading, error, offline states

### 12.3 Accessibility

- Target WCAG 2.2 AA untuk flow utama.
- Rasio kontras teks minimum 4.5:1.
- Focus indicator terlihat.
- Semua form memiliki label dan error terkait.
- Dialog mengunci fokus dengan benar.
- Tap target minimum 44×44 px.
- Status tidak bergantung pada warna.
- Kamera dan lokasi mempunyai alternatif/pesan bantuan ketika tidak tersedia.

## 13. Arsitektur teknologi

### 13.1 Frontend

- React + TypeScript + Vite.
- React Router untuk pemisahan route admin dan employee.
- PWA service worker untuk installability dan cache app shell.
- Library query/state yang mendukung Firestore listener dan optimistic feedback secara terkontrol.
- Schema validation bersama untuk form dan payload.
- CSS utility/design system yang themeable.
- Chart library ringan dan accessible.

Versi dependency dipilih dan dikunci saat implementasi, bukan dipatok di PRD agar keputusan mengikuti kompatibilitas aktual.

### 13.2 Firebase services

| Kebutuhan | Layanan |
|---|---|
| Login dan identitas | Firebase Authentication |
| Data transaksional | Cloud Firestore |
| Foto profil, selfie, lampiran | Cloud Storage for Firebase |
| Operasi tepercaya dan agregasi | Cloud Functions for Firebase 2nd gen |
| Web deployment | Firebase Hosting |
| Proteksi penyalahgunaan client | Firebase App Check |
| Push notification P1 | Firebase Cloud Messaging |
| Error/performance | Crashlytics/Performance Monitoring bila cocok untuk web; Google Cloud Logging untuk Functions |
| Local development | Firebase Emulator Suite |

Region target: `asia-southeast2` (Jakarta) jika seluruh layanan yang dipakai mendukung dan project provisioning mengizinkan. Region final harus ditetapkan sebelum data produksi dibuat karena lokasi Firestore tidak mudah dipindahkan.

Face verification tetap diorkestrasi melalui Firebase. Untuk showcase Firebase-only, model ringan dapat berjalan di browser dan hanya hasil/quality signals yang dikirim ke Function. Untuk produksi, adaptor provider berada di Cloud Functions sehingga frontend dan model data tidak berubah. Provider biometrik bukan sumber identitas atau database utama; Firebase tetap menjadi system of record.

### 13.3 Topologi aplikasi

Satu deployment web melayani route berbasis role:

- `/login`
- `/admin/*`
- `/employee/*`

URL default showcase:

- `https://<firebase-project-id>.web.app`
- `https://<firebase-project-id>.firebaseapp.com`

Custom domain opsional:

- `https://hris.<domain-reka-alur>`

Subdomain admin dan employee terpisah tidak diperlukan pada MVP. Pemisahan route menjaga deployment dan session sederhana.

### 13.4 Environment configuration

Konfigurasi disimpan dalam `.env.local` dan secret deployment, tidak di-hardcode:

```dotenv
VITE_APP_NAME=RekaHR
VITE_APP_ENV=development
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_FUNCTIONS_REGION=asia-southeast2
```

Firebase web config bukan pengganti security dan pada dasarnya dapat terlihat di browser. Perlindungan utama tetap Authentication, Security Rules, App Check, dan backend authorization. Karena menggunakan Firestore, `databaseURL` Realtime Database tidak dibutuhkan. Bila di masa depan RTDB dipakai, tambahkan `VITE_FIREBASE_DATABASE_URL` secara eksplisit.

### 13.5 Mode billing

Cloud Functions dan penggunaan Cloud Storage/fitur tertentu memerlukan project Blaze sesuai ketentuan Firebase yang berlaku. Implementasi showcase direkomendasikan memakai Blaze dengan:

- budget alert
- quota/usage monitoring
- lifecycle media
- pembatasan ukuran upload
- App Check
- pemisahan project dev dan showcase

Jangan memakai rules terbuka demi menghindari billing setup.

## 14. Model data Firestore

Semua entity bisnis membawa `organizationId`. ID dokumen menggunakan auto-ID atau UUID non-sekuensial.

```text
organizations/{organizationId}
organizations/{organizationId}/members/{uid}
departments/{departmentId}
positions/{positionId}
employees/{employeeId}
workLocations/{locationId}
shiftTemplates/{shiftId}
schedules/{scheduleId}
attendanceEvents/{eventId}
attendanceDays/{attendanceDayId}
attendanceCorrections/{correctionId}
faceEnrollments/{employeeId}
faceVerificationAttempts/{attemptId}
trackingSessions/{sessionId}
trackingSessions/{sessionId}/points/{pointId}
trackingCheckpoints/{checkpointId}
payrollComponents/{componentId}
employeeCompensations/{compensationId}
payrollPeriods/{periodId}
payrollRuns/{runId}
payrollRuns/{runId}/items/{employeeId}
payslips/{payslipId}
notifications/{notificationId}
auditLogs/{auditId}
dashboardDaily/{organizationId_date}
```

### 14.1 Dokumen penting

#### `organizations/{id}`

- `name`, `slug`, `logoPath`
- `timezone`, `locale`
- `brand.primary`, `brand.accent`
- `attendancePolicy`
- `createdAt`, `updatedAt`

#### `organizations/{orgId}/members/{uid}`

- `roles[]`, `defaultRole`
- `employeeId`
- `departmentId`
- `status`
- `createdAt`, `updatedAt`

Dokumen membership menjadi sumber scope bagi Security Rules. Role juga dapat dicerminkan pada custom claims untuk operasi tertentu, tetapi perubahan role hanya dilakukan backend.

#### `employees/{id}`

- `organizationId`
- `employeeCode`
- `fullName`, `email`, `phone`
- `profilePhotoPath`
- `departmentId`, `positionId`, `supervisorId`
- `primaryLocationId`, `defaultShiftId`
- `joinDate`, `status`, `authUid`
- `createdAt`, `createdBy`, `updatedAt`, `updatedBy`

#### `schedules/{id}`

- `organizationId`, `employeeId`, `dateKey`
- `shiftId`, `locationId`
- snapshot jam shift dan policy penting
- `status`
- audit fields

Snapshot mencegah riwayat berubah ketika master shift diedit kemudian.

#### `attendanceEvents/{id}`

- field event mentah sebagaimana bagian 10.8
- `validation.geofence`
- `validation.schedule`
- `validation.gpsAccuracy`
- `reviewStatus`
- `createdAt`

Event mentah immutable setelah finalisasi. Catatan review berada pada field/backend subrecord atau koleksi terkait yang hanya dapat ditulis oleh role berwenang.

#### `attendanceDays/{id}`

Materialized/derived document untuk satu employee dan satu `dateKey`:

- snapshot schedule
- waktu check-in/out efektif
- status utama dan flags
- menit terlambat/pulang awal/kerja
- source event IDs
- correction version
- `computedAt`

ID disarankan deterministik: hash/komposit aman dari `organizationId + employeeId + dateKey` agar operasi idempotent.

### 14.2 Pemisahan data sensitif

Firestore membaca dokumen secara utuh; rules tidak menyembunyikan beberapa field dari dokumen yang sama. Karena itu, informasi privat harus dipisah bila kelak ditambahkan, misalnya:

```text
employees/{employeeId}                 # profil kerja umum
employeePrivate/{employeeId}           # data privat dengan rules lebih ketat
```

Selfie tidak disimpan sebagai base64 di Firestore. Firestore hanya menyimpan path dan metadata; file berada di Storage privat.

Template wajah, data payroll, dan titik lokasi tidak digabung dengan profil employee umum. Ketiganya berada pada koleksi terpisah dengan rules, retensi, dan audit yang lebih ketat. Template biometrik tidak boleh dapat di-query lintas employee untuk pencarian 1:N.

### 14.3 Index awal

- employees: `organizationId + status + fullName`
- schedules: `organizationId + employeeId + dateKey`
- attendanceEvents: `organizationId + receivedAtServer desc`
- attendanceEvents: `organizationId + employeeId + receivedAtServer desc`
- attendanceDays: `organizationId + dateKey + primaryStatus`
- attendanceDays: `organizationId + departmentId + dateKey`
- corrections: `organizationId + status + submittedAt desc`
- notifications: `recipientUid + read + createdAt desc`
- trackingSessions: `organizationId + employeeId + startedAt desc`
- trackingSessions: `organizationId + status + lastPointAt desc`
- payrollRuns: `organizationId + periodStart desc + status`
- payslips: `organizationId + employeeId + payDate desc`

Index final mengikuti query nyata; hindari indexing field besar atau yang tidak pernah dicari.

## 15. Cloud Functions/API tepercaya

Callable/HTTP functions minimum:

- `createEmployeeAccount`
- `setMemberRole`
- `finalizeAttendance`
- `createFaceEnrollmentSession`
- `finalizeFaceEnrollment`
- `verifyAttendanceFace`
- `startTrackingSession`
- `appendTrackingPointBatch`
- `stopTrackingSession`
- `reviewAttendance`
- `submitAttendanceCorrection`
- `decideAttendanceCorrection`
- `rebuildAttendanceDay`
- `generateAttendanceCsv`
- `calculatePayrollRun`
- `reprocessPayrollEmployee`
- `approvePayrollRun`
- `publishPayrollRun`
- `generatePayslipPdf`
- `expireBiometricAndLocationData`
- `seedShowcaseData` — hanya emulator/dev atau admin break-glass

Prinsip:

- validasi auth, App Check, role, organization scope, schema, dan ukuran payload
- gunakan server timestamp
- idempotent untuk request yang dapat terkirim ulang
- transaction/batch untuk perubahan lintas dokumen
- log correlation ID tanpa mencetak token atau data sensitif
- derived metrics tidak dipercaya dari client
- role/custom claims tidak dapat ditulis langsung oleh browser

## 16. Security Rules dan keamanan

### 16.1 Baseline

- Deny by default.
- Semua read/write memerlukan authentication kecuali halaman login/config publik minimum.
- User hanya membaca organisasi tempat ia menjadi member aktif.
- Employee membaca profil kerja dan attendance miliknya.
- Supervisor hanya membaca anggota tim yang berada dalam scope.
- HR Admin membaca/mengelola data organisasi sesuai matriks.
- Attendance event final tidak dapat diubah atau dihapus dari client.
- Face template/verification attempt hanya dapat ditulis melalui backend dan tidak dapat di-list oleh employee lain.
- Tracking point hanya dapat ditambahkan ke sesi aktif milik employee dan tidak dapat diubah setelah diterima.
- Employee membaca payslip miliknya; payroll result hanya dapat dibuat dan dipublish melalui backend maker-checker.
- Audit log tidak dapat ditulis dari client.
- Storage rules mencocokkan organization, owner, purpose, content type, dan size.

### 16.2 Upload

- Selfie: JPEG/WebP, maksimum 2 MB setelah kompresi client.
- Foto profil: JPEG/PNG/WebP, maksimum 2 MB.
- Lampiran koreksi: image/PDF, maksimum 5 MB.
- Source frame enrollment/verifikasi: format image tervalidasi, maksimum 2 MB per frame dan segera dikenai lifecycle sesuai retensi.
- Payslip PDF: hanya ditulis service account dari Function.
- Path contoh: `organizations/{orgId}/attendance/{employeeId}/{eventId}/selfie.webp`.
- Download menggunakan SDK/auth atau signed URL berumur pendek dari backend; tidak menyimpan public URL permanen.

### 16.3 App Check

Aktifkan provider web yang tersedia, monitor enforcement lebih dulu, lalu enforce setelah telemetry menunjukkan client sah tidak terblokir. App Check mengurangi penyalahgunaan tetapi tidak menggantikan Authentication dan Rules.

### 16.4 Privacy

- Tampilkan notice terpisah sebelum kamera/wajah, geofence, dan tracking pertama kali digunakan.
- Jelaskan tujuan, dasar pemrosesan, data yang dikumpulkan, siapa yang dapat mengakses, retensi, konsekuensi bila tidak tersedia, serta kanal hak subjek/penghapusan.
- Jangan meminta lokasi ketika tidak diperlukan.
- Retensi showcase: selfie 90 hari, raw frame enrollment sesingkat mungkin, titik lokasi mentah 30 hari, dan konfigurabel per organisasi.
- Scheduled cleanup menghapus file kedaluwarsa dan mencatat hasil.
- Gunakan data sintetis untuk demo.
- Data wajah yang memungkinkan identifikasi unik adalah data biometrik dan termasuk data pribadi spesifik menurut UU PDP. Face verification produksi memerlukan DPIA/penilaian dampak, dasar pemrosesan yang sesuai, transparansi, kontrol akses ketat, vendor assessment, retensi, prosedur hak subjek, dan jalur alternatif/manual yang disetujui.
- Data lokasi/pergerakan dapat membentuk profil perilaku. Tracking harus purpose-limited, aktif hanya dalam konteks kerja yang sah, terlihat oleh employee, dan tidak digunakan ulang untuk tujuan lain tanpa assessment serta pemberitahuan baru.
- Data keuangan pada payroll juga memerlukan scope ketat, re-authentication untuk aksi sensitif, audit akses, dan pemisahan tugas.

## 17. Offline dan ketahanan koneksi

P0 tidak menjanjikan absensi offline penuh. Perilaku minimum:

- app shell dan halaman terakhir dapat dibuka bila sudah pernah dimuat
- status offline terlihat
- sebelum final submit, data form sementara dapat dipertahankan lokal
- kegagalan upload menyediakan retry tanpa membuat duplikat
- idempotency key tetap sama pada retry

P1 dapat menambahkan antrean IndexedDB. Event offline harus menyimpan waktu client, status `PENDING_SYNC`, dan sinyal integritas. Setelah online, backend tetap menentukan hasil `VALID` atau `NEEDS_REVIEW`. Sistem tidak boleh menyamakan waktu client dengan waktu server tanpa penanda.

## 18. Non-functional requirements

### 18.1 Performa

- Route-based code splitting.
- Gambar dikompresi sebelum upload.
- Pagination/cursor untuk daftar besar.
- Listener real-time hanya untuk dataset kecil dan aktif.
- Dashboard memakai dokumen agregat, bukan scan seluruh event.
- Tracking points dikirim dalam batch dan tidak memakai satu listener per employee pada dashboard.
- Payroll run memproses employee secara chunked/idempotent serta menyimpan progress.
- Batas awal showcase: 500 karyawan, 100 user aktif bersamaan, 50 event absensi/menit tanpa duplikasi, 100 sesi tracking bersamaan, dan payroll 500 employee selesai dalam target 10 menit.

### 18.2 Reliability

- Semua mutation menampilkan status pending/success/error.
- Retry aman pada operasi idempotent.
- Scheduled recomputation dapat memperbaiki derived attendance.
- Project dev dan showcase terpisah.
- Export Firestore/backup disiapkan sebelum data client nyata.

### 18.3 Observability

- Structured logs untuk Functions.
- Error boundary frontend.
- Metrik: login failure, attendance success/failure, upload latency, function latency/error, App Check rejection.
- Alert untuk lonjakan error finalisasi attendance dan biaya.
- Jangan merekam selfie, token, koordinat lengkap, atau isi lampiran di log.

### 18.4 Compatibility

- Dua versi terbaru Chrome, Edge, Safari, dan Firefox.
- Android Chrome menjadi prioritas employee flow.
- iOS Safari didukung dengan pesan yang jujur untuk keterbatasan PWA/permission.
- Responsive minimum 360×640 px sampai desktop 1440 px.

## 19. Analytics produk

Event tanpa data pribadi sensitif:

- `login_succeeded`, `login_failed`
- `dashboard_viewed`
- `attendance_flow_started`
- `location_permission_granted/denied`
- `camera_permission_granted/denied`
- `attendance_submitted/succeeded/failed`
- `attendance_retry_clicked`
- `face_enrollment_started/completed/failed`
- `face_verification_completed` dengan status generik tanpa score mentah
- `tracking_session_started/stopped/interrupted`
- `correction_submitted/decided`
- `payroll_run_calculated/approved/published`
- `payslip_viewed/downloaded`
- `report_exported`

Property dibatasi pada role, environment, status generik, latency bucket, dan error code. Jangan mengirim nama, email, koordinat, atau path selfie ke analytics.

## 20. Seed data showcase

Dataset demo wajib deterministik dan dapat di-reset:

- 1 organisasi: Reka Alur Teknologi Demo
- 3 departemen: Engineering, Operations, People & Finance
- 6 jabatan
- 2 lokasi: Kantor Pusat Jakarta dan Remote/Client Site
- 3 shift: Regular, Morning, Evening
- 24 karyawan sintetis
- 2 admin, 3 supervisor, 19 employee
- 30 hari attendance history
- 8 employee mempunyai enrollment wajah sintetis/demo
- 6 sesi tracking dengan rute sintetis dan checkpoint
- kombinasi hadir, terlambat, missing out, absent, dan needs review
- 5 koreksi dengan berbagai status
- 2 periode payroll; satu `PUBLISHED`, satu `NEEDS_REVIEW`
- profil gaji dan komponen sintetis untuk seluruh employee
- slip gaji privat untuk periode yang sudah publish
- notifikasi dan audit log contoh

Akun demo:

- HR Admin
- Supervisor
- Employee normal
- Employee dengan kasus anomali
- Payroll Admin

Password dibuat saat seed/deployment dan disimpan melalui mekanisme internal; jangan commit password aktif ke repository.

## 21. Acceptance criteria end-to-end

### 21.1 Skenario A — konfigurasi admin

- Admin membuat lokasi dan shift.
- Admin membuat karyawan dan menetapkan jadwal.
- Karyawan baru dapat login setelah akun/invite aktif.
- Semua perubahan muncul pada audit log.

### 21.2 Skenario B — check-in valid

- Karyawan terjadwal berada dalam radius.
- Lokasi dan selfie berhasil diambil.
- Satu event check-in tersimpan walau tombol diklik ulang.
- Receipt menampilkan waktu server dan status.
- Dashboard admin terbarui maksimal lima detik.

### 21.3 Skenario C — di luar radius

- Jarak melebihi kebijakan.
- Sistem menampilkan jarak dan alasan.
- Berdasarkan config demo, event masuk `NEEDS_REVIEW`.
- Admin dapat melihat bukti dan mengambil keputusan.

### 21.4 Skenario D — koreksi

- Employee mengajukan missing check-out dengan alasan.
- Supervisor menerima notifikasi dan menyetujui.
- Attendance day diperbarui menjadi `CORRECTED`.
- Event asli tidak berubah dan audit lengkap tersedia.

### 21.5 Skenario E — akses ilegal

- Employee tidak dapat membuka route admin melalui URL langsung.
- Employee A tidak dapat membaca attendance Employee B lewat SDK/REST.
- Supervisor tidak dapat melihat departemen di luar scope.
- Client tidak dapat menulis audit log atau role.

### 21.6 Skenario F — laporan

- Filter periode/status menghasilkan data sesuai tabel.
- CSV memuat data yang sama dengan filter, zona waktu tercantum, dan dapat dibuka benar di Excel.
- Aksi ekspor tercatat di audit log.

### 21.7 Skenario G — verifikasi wajah

- Employee dengan enrollment aktif menyelesaikan liveness challenge.
- Verifikasi 1:1 berhasil dan event menyimpan model/threshold version tanpa mengekspos raw template.
- Percobaan dengan wajah tidak cocok atau multi-face tidak diterima otomatis dan masuk `NOT_MATCHED`/`NEEDS_REVIEW`.
- Reset enrollment menginvalidasi template lama dan tercatat di audit.

### 21.8 Skenario H — geo tracking

- Employee memulai sesi dan selalu melihat indikator aktif.
- Titik tersinkron secara batch dan live map menunjukkan posisi terbaru beserta umur datanya.
- Saat permission dicabut atau browser menghentikan update, sesi menampilkan gap dan tidak mengarang rute.
- Setelah sesi berhenti, titik baru ditolak dan employee dapat melihat riwayat miliknya.

### 21.9 Skenario I — payroll dan slip gaji

- Payroll Admin membuat periode, mengambil snapshot attendance, dan menghitung seluruh employee demo.
- Employee dengan data tidak lengkap atau attendance unresolved masuk exception.
- Pembuat run tidak dapat menjadi satu-satunya approver.
- Setelah publish, payroll item tidak dapat diedit dan slip muncul pada akun employee terkait.
- Employee A tidak dapat membaca slip Employee B; download dan akses admin diaudit.

## 22. Strategi pengujian

- Unit test: kalkulasi jarak, status waktu, validasi shift lintas malam, format dateKey, payroll formula/rounding, tracking anomaly, dan face quality state.
- Component test: form, permission states, camera/location fallback, payslip, dan payroll exceptions.
- Rules test dengan Emulator Suite: allow dan deny untuk setiap role serta lintas organisasi.
- Functions integration test: idempotency, transaction, invalid payload, inactive employee, payroll locking, maker-checker, dan tracking session ownership.
- E2E: sembilan skenario acceptance menggunakan browser desktop dan viewport mobile.
- Accessibility: automated scan ditambah keyboard/manual screen-reader smoke test.
- Performance: Lighthouse/field instrumentation dan load test endpoint finalisasi.
- Visual regression untuk halaman login, admin dashboard, employee home, attendance detail.

## 23. Tahapan implementasi

### Sprint 0 — fondasi dan desain

- konfirmasi branding, domain, timezone, dan kebijakan demo
- setup repository, quality gates, Firebase projects, emulator
- design tokens dan wireframe flow utama
- data model, rules skeleton, seed contract

### Sprint 1 — identity dan master data

- auth, route guard, role/membership
- shell admin dan employee
- organisasi, department, position, employee CRUD
- seed data dasar

### Sprint 2 — shift, lokasi, dan employee home

- master shift
- schedule assignment
- work location/geofence
- employee home dan status jadwal

### Sprint 3 — attendance end-to-end

- camera/location capture
- Storage upload privat
- finalizeAttendance
- attendance day computation
- dashboard real-time dan detail bukti

### Sprint 4 — face verification dan koreksi

- face enrollment dan liveness UX
- adaptor demo/provider serta verification policy
- correction workflow
- audit akses biometrik

### Sprint 5 — geo tracking

- tracking session dan batched points
- employee tracking UI dan checkpoint
- admin live map dan route history
- retention serta anomaly signals

### Sprint 6 — payroll dan slip gaji

- master component dan employee compensation
- period, calculation snapshot, exception review
- maker-checker, publish, lock
- payslip web/PDF dan employee access

### Sprint 7 — laporan dan polish

- notifications
- attendance/payroll CSV report
- audit UI
- responsive, accessibility, empty/error states

### Sprint 8 — hardening dan showcase

- rules tests dan security review
- E2E serta performance pass
- data demo 30 hari
- deployment custom domain
- demo script dan handoff

## 24. Definition of Ready

Implementasi dianggap siap dimulai setelah keputusan berikut tersedia atau fallback PRD diterima:

- Nama produk final; fallback `RekaHR`.
- Logo dan warna; fallback theme navy/indigo + teal.
- Domain; fallback Firebase Hosting URL.
- Policy geofence; fallback 150 m dan di luar radius menjadi `NEEDS_REVIEW`.
- Toleransi terlambat; fallback 10 menit.
- Bukti selfie wajib; fallback wajib untuk check-in dan check-out.
- Timezone; fallback `Asia/Jakarta`.
- Approver koreksi; fallback HR Admin.
- Face verification mode; fallback `DEMO_LOCAL` dengan badge non-production.
- Retensi biometrik/lokasi; fallback 90/30 hari untuk data showcase sintetis.
- Tracking interval; fallback 45 detik saat sesi dan halaman aktif.
- Komponen/formula payroll; fallback komponen sintetis yang jelas berlabel simulasi.
- Approver payroll; fallback Super Admin yang berbeda dari pembuat run.
- Privacy notice dan legal owner untuk biometrik/tracking; showcase hanya memakai data sintetis sampai assessment disetujui.

## 25. Definition of Done MVP

- Seluruh requirement P0 dan sembilan acceptance scenario lulus.
- Tidak ada error typecheck/lint/test/build.
- Firestore dan Storage Rules deny-by-default serta memiliki negative tests.
- Tidak ada secret, password aktif, data pribadi asli, atau media demo sensitif di Git.
- Deployment showcase dapat dibuka melalui HTTPS.
- Admin dan employee demo flow berjalan pada desktop dan Android Chrome.
- Monitoring, budget alert, dan prosedur reset seed tersedia.
- Retention cleanup biometrik/lokasi teruji dan privacy notice tampil pada flow pertama.
- Semua nilai pajak/BPJS showcase diberi label simulasi.
- README berisi setup lokal, environment, emulator, deploy, akun demo, dan demo script.

## 26. Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Permission lokasi/kamera ditolak | Flow demo berhenti | pre-demo permission check, pesan pemulihan, data skenario cadangan |
| Akurasi GPS buruk di dalam gedung | false outside geofence | simpan accuracy, tolerance policy, `NEEDS_REVIEW` |
| PWA dianggap setara native anti-fraud/tracking | ekspektasi salah | jelaskan batas browser, badge mode demo, anomaly review, tawarkan native/provider untuk produksi |
| Rules terlalu longgar | kebocoran data | deny-by-default, emulator negative tests, App Check |
| Query Firestore mahal | biaya tak terduga | aggregate docs, pagination, listener terbatas, budget alert |
| Biometrik dan geo trail menjadi risiko privasi | dampak legal/reputasi | data sintetis, DPIA, purpose limitation, private storage, retention, access log, notice, jalur alternatif |
| False match/false reject wajah | absensi salah | threshold terversi, liveness, quality gate, human review, reset enrollment |
| Tracking web berhenti di background | rute berlubang | indikator/gap jujur, batch sync, foreground-only scope, native P1 bila wajib |
| Formula payroll demo dianggap siap produksi | salah bayar/kepatuhan | label simulasi, test fixtures, maker-checker, validasi ahli payroll/pajak sebelum data nyata |
| Payroll dan face memperbesar scope | keterlambatan | bangun vertical slice berurutan, kunci acceptance P0, provider/tax production tetap P1 |
| Meniru GreatDay terlalu dekat | risiko IP/brand | gunakan prinsip/alur generik, visual dan copy orisinal |

## 27. Keputusan produk yang dikunci oleh PRD ini

1. MVP adalah web/PWA, bukan native app.
2. Persona utama adalah HR Admin, Payroll Admin, Supervisor, dan Employee.
3. Produk memakai satu codebase dan route berbasis role.
4. Firebase menjadi backend utama: Auth, Firestore, Storage, Functions, Hosting, dan App Check.
5. Firestore dipilih; Realtime Database tidak digunakan pada baseline.
6. Attendance memakai liveness dan verifikasi wajah 1:1; identifikasi massal 1:N tidak digunakan.
7. Event kehadiran mentah immutable; koreksi menghasilkan versi/derived result.
8. Data showcase sintetis dan dapat di-reset.
9. Payroll/slip gaji showcase berada di P0; transfer bank, formula pajak/BPJS production, recruitment, dan performance berada di luar MVP.
10. Arsitektur membawa `organizationId` sejak awal agar core dapat digunakan ulang untuk client lain.
11. Geo tracking hanya berjalan dalam sesi kerja yang terlihat; web tidak menjanjikan background tracking saat aplikasi ditutup.
12. Data biometrik, lokasi, dan payroll dipisahkan dari profil umum serta mempunyai akses/retensi khusus.

## 28. Temuan riset dan referensi

Pola yang diadopsi dari riset kategori dan GreatDay HR:

- GreatDay memosisikan HRIS sebagai sistem cloud terintegrasi yang mencakup attendance, leave/overtime, payroll, performance, employee self-service, face recognition/liveness, dan live tracking. RekaHR mengadopsi subset yang paling kuat untuk showcase dengan copy serta visual orisinal. [GreatDay HR — fitur](https://greatdayhr.com/id-id/fitur/)
- GreatDay menonjolkan absensi real-time, GPS, face recognition, liveness, payroll otomatis, slip digital, dan GPS tracking. RekaHR memasukkan pengalaman tersebut dengan batas teknis web dan kontrol privasi yang eksplisit. [GreatDay HR — halaman utama](https://greatdayhr.com/id-id/)
- Riwayat GreatDay menampilkan detail seperti selfie, tanggal, waktu masuk/keluar, dan lokasi. Ini menjadi dasar kebutuhan attendance detail RekaHR. [GreatDay Help — riwayat kehadiran](https://help.greatdayhr.com/id/absensi-kehadiran/memeriksa-riwayat-kehadiran/)
- Alur koreksi GreatDay mencakup alasan, waktu sebelum/sesudah, shift, lampiran, dan submission ke approver. Struktur yang sama diadaptasi menjadi state machine yang auditable. [GreatDay Help — koreksi kehadiran](https://help.greatdayhr.com/id/absensi-kehadiran/mengajukan-koreksi-kehadiran/)
- GreatDay mempertahankan waktu tangkapan pada mode offline dan mengirimnya setelah koneksi kembali. RekaHR menempatkan offline penuh di P1 dan membedakan waktu client dari waktu server. [GreatDay Help — attendance offline](https://help.greatdayhr.com/id/absensi-kehadiran/merekam-kehadiran-mode-ofline/)
- Shift GreatDay dapat dibuat, diubah, dijadwalkan, dan diunggah massal. RekaHR memasukkan shift dan calendar assignment pada P0, sementara bulk upload berada di P1. [GreatDay Help — shift](https://help.greatdayhr.com/id/shift/menambah-mengubah-shift/)
- Flow payroll GreatDay menggunakan payment type, jadwal bayar, cut-off, periode attendance, komponen, kalkulasi/review, lalu publish agar employee dapat melihat slip. Pola ini diadaptasi menjadi state machine payroll yang immutable dan maker-checker. [GreatDay Help — proses payroll](https://help.greatdayhr.com/id/penggajian/proses-penggajian/)
- Employee GreatDay dapat membuka daftar dan rincian slip gaji melalui web/mobile. RekaHR menyediakan employee payslip privat, re-authentication opsional, PDF terversi, dan audit akses admin. [GreatDay Help — slip gaji](https://help.greatdayhr.com/id/penggajian/memeriksa-slip-gaji/)
- GreatDay menyediakan laporan tracking berbasis Google Maps serta fitur patrol/live tracking untuk melihat pergerakan dan progres petugas. RekaHR mengadaptasinya sebagai sesi tracking yang terlihat dan purpose-limited. [GreatDay Help — tracking karyawan](https://help.greatdayhr.com/id/karyawan/melihat-tracking-karyawan/)
- UU No. 27 Tahun 2022 menggolongkan data biometrik sebagai data pribadi spesifik; penjelasannya mencakup gambar wajah yang memungkinkan identifikasi unik. Karena itu, face verification bukan sekadar fitur kamera dan membutuhkan governance khusus. [BPK — UU Pelindungan Data Pribadi](https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022)
- Penjelasan UU PDP juga mengaitkan pemrofilan dengan lokasi atau pergerakan subjek data. Ini menjadi dasar product guardrail untuk geo tracking yang transparan, terbatas, dan memiliki retensi. [JDIH Kemkomdigi — UU No. 27 Tahun 2022](https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/undangundang%2Bnomor%2B27%2Btahun%2B2022)
- Firebase merekomendasikan Authentication bersama Firestore Security Rules untuk akses berbasis user/role dan App Check untuk membantu memastikan request berasal dari aplikasi yang sah. [Firebase — secure Firestore](https://firebase.google.com/docs/firestore/security/overview)
- Firestore Rules bukan filter; query aplikasi harus sesuai dengan constraint authorization. Hal ini memengaruhi desain membership, organization scope, dan index. [Firebase — secure queries](https://firebase.google.com/docs/firestore/security/rules-query)
- Firestore membaca dokumen secara utuh, sehingga data privat perlu dipisahkan ke dokumen/koleksi berbeda. [Firebase — field access](https://firebase.google.com/docs/firestore/security/rules-fields)
- Firebase menyediakan Spark dan Blaze; Cloud Functions memerlukan Blaze. Implementasi harus memakai budget controls dan memeriksa pricing aktual sebelum deployment. [Firebase — pricing plans](https://firebase.google.com/docs/projects/billing/firebase-pricing-plans)

---

## 29. Catatan handoff implementasi

Urutan pembangunan yang paling aman adalah satu vertical slice terlebih dahulu:

`login employee → lihat shift → lokasi + liveness + verifikasi wajah → finalize attendance → dashboard admin real-time → detail bukti`

Setelah vertical slice attendance lulus rules test dan E2E, implementasi dilanjutkan menjadi dua slice independen: `start tracking → live map → stop/history` dan `create payroll run → calculate/review → approve/publish → employee payslip`. PRD ini menjadi source of truth produk; detail kontrak koleksi, rules, callable functions, formula payroll, dan adaptor face verification dibuat sebagai dokumen teknis terpisah saat coding dimulai.
