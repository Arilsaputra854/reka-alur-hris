# Audit Kesiapan Publish RekaHR

Tanggal audit: 28 Agustus 2026

## Kesimpulan

RekaHR layak dipublikasikan sebagai **showcase HRIS operasional** setelah paket peningkatan ini. Produk sudah mempunyai alur utama admin dan employee: data karyawan, kehadiran, koreksi, cuti/izin, lembur, reimbursement, approval, saldo cuti, geo tracking, payroll sederhana, slip gaji, notifikasi, konfigurasi, dan pengamanan akses berbasis role.

Produk belum boleh diposisikan sebagai mesin payroll atau biometrik production-grade. Kalkulasi PPh 21/BPJS, maker-checker payroll, face matching sesungguhnya, retensi bukti biometrik, App Check, backend privileged, multi-tenancy, dan observability produksi masih memerlukan tahap hardening terpisah.

## Gap yang ditemukan dan tindakan

| Area | Temuan awal | Tindakan |
|---|---|---|
| Employee self-service | Hanya koreksi kehadiran | Ditambah pengajuan cuti/izin, lembur, dan reimbursement |
| Approval admin | Tidak ada inbox terpadu | Ditambah antrean, filter status, keputusan, catatan, dan audit log |
| Cuti | Tidak ada kuota atau saldo | Ditambah kuota per karyawan dan pengurangan saldo transaksional saat disetujui |
| Notifikasi | Ikon hanya dekoratif | Bel menampilkan pengajuan pending untuk admin dan perubahan status untuk employee |
| Password | Reset hanya tersedia setelah login | Ditambah lupa password pada halaman login dan reset dari modal admin |
| Akun nonaktif | Sesi lama tidak bereaksi langsung | Profil user dipantau real-time dan route menolak profil nonaktif |
| Dashboard | Tanggal ditulis statis | Menggunakan tanggal Jakarta aktual dan CTA approval saat ada antrean |
| Mobile UX | Modul baru belum ada di navigasi bawah | Bottom navigation diperluas menjadi lima aksi inti |
| Rules | Belum ada kontrak akses request | Ditambah aturan owner-only untuk employee, admin-only decision, immutable business fields |
| Koreksi attendance | Approval hanya mengubah label | Approval kini menghasilkan attendance turunan dan audit log tanpa mengubah event asli |
| Payroll | Gaji pokok + tunjangan saja | Ditambah lembur/reimbursement approved, BPJS dan tarif PPh configurable, breakdown dan review sebelum publish |
| Approval | Satu keputusan tanpa tahapan | Ditambah konfigurasi 1–3 tingkat dengan admin berbeda dan riwayat keputusan |
| People operations | Belum tersedia | Ditambah struktur organisasi, pengumuman, dokumen, KPI/progress, recruitment dan onboarding pipeline |
| Employee workspace | Informasi tersebar | Ditambah company hub, dokumen, sasaran, update progress, serta edit kontak mandiri |
| Resilience | Tidak ada fallback UI global | Ditambah error boundary dan indikator offline |
| App Check | Belum ada integrasi | Fondasi reCAPTCHA Enterprise aktif otomatis setelah site key dikonfigurasi |

## Benchmark produk

- [GreatDay HR](https://greatdayhr.com/id-id/fitur/) menempatkan attendance, payroll, leave/overtime, performance, employee self-service, notifikasi, dan approval sebagai satu sistem terintegrasi.
- [Mekari Talenta](https://mekari.com/produk/talenta/) menekankan database karyawan, attendance, cuti/lembur, payroll, workflow, ESS, notifikasi, dokumen, dan analitik.
- Prioritas RekaHR mengikuti kebutuhan operasional yang paling mudah terlihat dalam demo: satu sumber data, employee self-service, approval yang jelas, status real-time, dan payroll/slip yang terkoneksi.

## Backlog sebelum penggunaan produksi riil

### P0 production hardening

1. Pindahkan pembuatan user, perubahan role/status Auth, audit log, finalisasi attendance, dan keputusan finansial ke Cloud Functions/Admin SDK.
2. Aktifkan Firebase App Check, monitoring error, budget alert, backup, dan lingkungan staging.
3. Tambahkan `organizationId` ke seluruh dokumen dan rules untuk isolasi multi-client.
4. Ganti demo liveness dengan penyedia verifikasi wajah 1:1 yang tervalidasi, consent, retensi, dan jalur manual.
5. Validasi formula payroll, PPh 21, BPJS, lembur, prorata, THR, dan pembulatan bersama praktisi payroll Indonesia.
6. Tambahkan maker-checker, locking, exception review, dan pembatalan terkontrol pada payroll.

### P1 product completeness

1. Kalender shift/cuti, hari libur, break, dan roster massal.
2. Tanda tangan elektronik dan policy acknowledgement tervalidasi.
3. Push notification/email transaksional melalui backend.
4. Laporan analitik, pagination, import/export master data, dan audit viewer.

## Prinsip UX yang dikunci

- Aksi employee paling umum tersedia dari navigasi bawah.
- Setiap mutation mempunyai status loading, success, atau error.
- Admin melihat pekerjaan yang membutuhkan tindakan sebelum laporan pasif.
- Employee selalu dapat melihat status dan catatan keputusan tanpa bertanya ke HR.
- Password, biometrik, dan data finansial tidak disimpan sebagai teks biasa di Firestore.

## Blocker eksternal yang terverifikasi

- Firebase Cloud Storage pada project baru memerlukan paket Blaze. Karena project saat ini belum memiliki bucket dan belum terhubung billing, lampiran menggunakan tautan HTTPS privat (misalnya Google Drive/Dropbox). Rules dan fondasi Storage sudah tersedia untuk diaktifkan setelah billing disetujui pemilik project.
- Cloud Functions/Admin SDK untuk operasi privileged juga membutuhkan upgrade project dan deployment backend.
- App Check memerlukan pembuatan reCAPTCHA Enterprise site key di console; frontend sudah membaca `VITE_RECAPTCHA_ENTERPRISE_SITE_KEY` bila tersedia.
- Face matching production memerlukan vendor/model tervalidasi, consent, threshold, retensi, serta pengujian bias/false match. Mode sekarang tetap diberi label demo dan tidak mengaku sebagai biometrik production.
- Browser web tidak dapat menjamin geo tracking setelah tab/aplikasi ditutup. Kebutuhan background kontinu memerlukan aplikasi native atau wrapper dengan izin background location.
