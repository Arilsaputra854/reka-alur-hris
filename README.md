# RekaHR

Web/PWA HRIS untuk Reka Alur Teknologi dengan dua portal dalam satu deployment:

- Admin: `/admin`
- Employee: `/employee`

Fitur utama: manajemen karyawan, attendance dengan geofence dan liveness demo, koreksi attendance, pengajuan cuti/lembur/reimbursement beserta approval dan saldo cuti, pusat notifikasi, geo tracking berbasis sesi, payroll, serta slip gaji employee.

## Firebase project

- Project ID: `reka-alur-hris`
- Hosting: `https://reka-alur-hris.web.app`
- Firestore: `(default)`, region `asia-southeast2` (Jakarta)
- Authentication: Email/Password

Project ini terpisah dari `gajian-hris-app`.

## Menjalankan lokal

```powershell
npm install
npm run dev
```

Build dan test:

```powershell
npm run test
npm run build
```

Deploy:

```powershell
firebase use reka-alur-hris
npm run build
firebase deploy --only auth,firestore,hosting
```

Firebase web config menggunakan public web configuration milik project `reka-alur-hris`. Otorisasi data tetap dijaga oleh Firebase Authentication dan Firestore Security Rules.

## Struktur

```text
src/                  React application
src/pages/            Admin dan employee feature pages
firebase/             Firestore indexes serta Security Rules
public/               PWA manifest, icon, service worker
docs/PRD.md            Product Requirements Document
docs/FLOW-PENGGUNAAN.md Alur setup dan penggunaan
```

## Batas showcase

- Face verification menggunakan kamera, liveness challenge, dan mode verifikasi lokal untuk demonstrasi UX. Ini bukan biometric engine production-grade.
- Geo tracking web bekerja selama halaman tracking aktif. Browser/OS dapat menghentikan update ketika aplikasi ditutup atau dibatasi di background.
- Payroll menghitung gaji pokok dan tunjangan tetap. Pajak, BPJS, lembur, dan formula potongan harus divalidasi sebelum penggunaan produksi.
- Tidak ada data karyawan contoh. Data bisnis dimasukkan melalui Admin Dashboard.

## Keamanan

- Rules deny-by-default.
- Employee hanya membaca profil, attendance, tracking, dan slip miliknya.
- Event attendance dan tracking point tidak dapat diubah setelah dibuat.
- Payslip hanya dapat dibuat admin dan dibaca pemiliknya.
- Kredensial bootstrap tersimpan pada file lokal yang diabaikan Git.

Lihat [alur penggunaan](docs/FLOW-PENGGUNAAN.md) untuk urutan pengisian data.

Lihat [audit kesiapan publish](docs/PUBLISH-READINESS-AUDIT.md) untuk fitur yang sudah tersedia dan backlog sebelum penggunaan production riil.
