# Flow Penggunaan RekaHR

## 1. Setup awal oleh Admin

1. Buka URL Admin dan login menggunakan akun bootstrap.
2. Masuk ke **Konfigurasi**.
3. Lengkapi nama, alamat, zona waktu, tanggal cut-off, dan kebijakan attendance.
4. Tambahkan **Lokasi Kerja** pertama. Lokasi pertama otomatis menjadi lokasi default employee.
5. Isi latitude, longitude, dan radius geofence.
6. Tambahkan template shift bila diperlukan.

## 2. Memasukkan karyawan

1. Buka **Karyawan → Tambah Karyawan**.
2. Isi ID karyawan, nama, email, telepon, departemen, jabatan, tanggal masuk, jam kerja, gaji pokok, dan tunjangan.
3. Gunakan password yang di-generate atau ganti dengan password sementara sendiri.
4. Klik **Buat akun karyawan**.
5. Salin email dan password sementara, kemudian kirim melalui kanal yang aman.
6. Untuk mengubah profil/gaji atau menonaktifkan akun, klik menu titik tiga pada baris karyawan.

Admin tidak perlu membuat user lagi melalui Firebase Console. Form ini membuat Firebase Authentication account dan profil Firestore sekaligus.

## 3. Flow Employee — attendance

1. Employee membuka URL Employee dan login.
2. Beranda menampilkan shift serta status attendance hari ini.
3. Klik **Check-in sekarang**.
4. Izinkan lokasi dan kamera.
5. Selesaikan liveness challenge lalu ambil wajah.
6. Periksa titik lokasi dan konfirmasi.
7. Dashboard Admin menerima event secara real-time.
8. Saat pulang, tombol berubah menjadi **Check-out sekarang**.

Attendance pertama mengaktifkan enrollment wajah mode showcase. Foto kamera dipakai pada sesi lokal dan tidak disimpan sebagai file pada baseline showcase.

## 4. Flow koreksi attendance

1. Employee membuka **Riwayat → Ajukan Koreksi**.
2. Pilih tanggal, jenis check-in/check-out, waktu yang diminta, dan alasan.
3. Admin membuka **Kehadiran → Koreksi**.
4. Admin menyetujui atau menolak permintaan.
5. Status dapat dilihat kembali oleh employee.

## 5. Flow geo tracking

1. Employee membuka **Tracking** hanya ketika pekerjaan lapangan dimulai.
2. Tekan **Mulai Sesi** dan izinkan lokasi.
3. Biarkan halaman aktif selama sesi.
4. Admin membuka **Geo Tracking** untuk melihat posisi terbaru, akurasi, dan jumlah titik.
5. Employee menekan **Hentikan Sesi** setelah pekerjaan selesai.
6. Riwayat sesi tersimpan untuk employee dan admin.

Tracking tidak berjalan tersembunyi dan tidak otomatis menyala saat login.

## 6. Flow payroll dan slip gaji

1. Pastikan gaji pokok serta tunjangan seluruh karyawan sudah benar.
2. Admin membuka **Penggajian → Buat Payroll**.
3. Pilih periode.
4. Sistem membuat snapshot dan draft slip seluruh karyawan aktif.
5. Admin memeriksa total serta jumlah karyawan.
6. Klik **Publish Slip**.
7. Employee membuka **Slip Gaji** untuk melihat detail.
8. Employee dapat memilih **Simpan / Cetak PDF** dari tampilan slip.

Pada baseline showcase:

`Take home pay = gaji pokok + tunjangan tetap - potongan`

Potongan awal bernilai nol. PPh 21, BPJS, lembur, dan aturan attendance belum dianggap formula produksi.

## 7. Urutan input data yang disarankan

```text
Konfigurasi perusahaan
→ lokasi kerja
→ shift
→ karyawan & profil gaji
→ bagikan akun employee
→ attendance/tracking berjalan
→ review koreksi
→ hitung payroll
→ publish slip gaji
```

## 8. Penggantian akses admin

Akun bootstrap ditujukan untuk serah terima awal. Setelah menerima aplikasi:

1. Ganti password admin.
2. Bila email bootstrap bukan email operasional, ubah akun melalui Firebase Authentication atau buat fitur admin-user management lanjutan.
3. Jangan membagikan akun admin kepada employee.
## 9. Pengajuan employee dan approval admin

1. Employee membuka **Pengajuan** dari navigasi utama atau bottom navigation.
2. Employee melihat saldo cuti dan status pengajuan sebelumnya.
3. Employee memilih **Cuti / izin**, **Lembur**, atau **Reimbursement**, lalu mengisi detail dan alasan.
4. Admin menerima indikator pada bel notifikasi dan membuka **Pengajuan**.
5. Admin menyetujui atau menolak dengan catatan. Untuk cuti tahunan, sistem memeriksa saldo dan menguranginya dalam satu transaksi.
6. Employee melihat status dan catatan keputusan pada halaman yang sama.

## 10. Pemulihan password

- Dari halaman login, masukkan email kerja lalu pilih **Lupa password?**.
- Dari Admin → Karyawan → Edit, admin dapat mengirim tautan reset ke email akun.
- Password baru diproses oleh Firebase Authentication dan tidak disimpan di Firestore.
