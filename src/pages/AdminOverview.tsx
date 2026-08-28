import { useMemo } from "react";
import { Activity, ArrowUpRight, Clock3, MapPinned, Sparkles, UserRoundCheck, Users, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { MetricCard, PageHeader, SectionCard } from "../Shell";
import { EmptyState, StatusBadge } from "../components";
import { useLiveCollection } from "../data";
import { dateKey, formatCurrency, formatDateTime, initials } from "../lib";
import type { AttendanceRecord, Employee, PayrollRun, TrackingSession } from "../types";

export function AdminOverview() {
  const employees = useLiveCollection<Employee>("employees");
  const attendance = useLiveCollection<AttendanceRecord>("attendance");
  const payroll = useLiveCollection<PayrollRun>("payrollRuns");
  const tracking = useLiveCollection<TrackingSession>("trackingSessions");
  const today = dateKey();

  const todayRecords = useMemo(() => attendance.data.filter((item) => item.dateKey === today), [attendance.data, today]);
  const presentIds = new Set(todayRecords.filter((item) => item.type === "check-in").map((item) => item.employeeId));
  const late = todayRecords.filter((item) => item.status === "late").length;
  const activeEmployees = employees.data.filter((item) => item.status === "active");
  const latest = [...todayRecords].sort((a, b) => b.clientTimestamp.localeCompare(a.clientTimestamp)).slice(0, 6);
  const publishedPayroll = payroll.data.filter((item) => item.status === "published");
  const payrollTotal = publishedPayroll.reduce((sum, item) => sum + item.totalNet, 0);

  return (
    <>
      <PageHeader eyebrow="Jumat, 28 Agustus 2026" title="Selamat datang di RekaHR" description="Ringkasan aktivitas tenaga kerja dan operasi HR hari ini." actions={<Link className="button button-primary" to="/admin/karyawan"><Users size={17} /> Tambah karyawan</Link>} />
      <div className="metrics-grid">
        <MetricCard label="Karyawan aktif" value={activeEmployees.length} delta={employees.data.length ? `${employees.data.length} total terdaftar` : "Belum ada data"} icon={Users} tone="navy" />
        <MetricCard label="Hadir hari ini" value={presentIds.size} delta={activeEmployees.length ? `${Math.round((presentIds.size / activeEmployees.length) * 100)}% dari karyawan aktif` : "Menunggu data karyawan"} icon={UserRoundCheck} tone="teal" />
        <MetricCard label="Terlambat" value={late} delta={late ? "Perlu ditinjau" : "Tidak ada keterlambatan"} icon={Clock3} tone="amber" />
        <MetricCard label="Payroll terbit" value={formatCurrency(payrollTotal)} delta={`${publishedPayroll.length} periode dipublikasikan`} icon={WalletCards} tone="purple" />
      </div>

      <div className="dashboard-grid">
        <SectionCard title="Kehadiran hari ini" description="Komposisi check-in real-time" className="attendance-visual-card">
          <div className="attendance-visual">
            <div className="donut" style={{ "--progress": activeEmployees.length ? `${Math.min(100, Math.round((presentIds.size / activeEmployees.length) * 100))}%` : "0%" } as React.CSSProperties}>
              <div><strong>{presentIds.size}</strong><span>hadir</span></div>
            </div>
            <div className="legend-list">
              <div><i className="legend-dot teal" /><span>Hadir</span><strong>{presentIds.size}</strong></div>
              <div><i className="legend-dot amber" /><span>Terlambat</span><strong>{late}</strong></div>
              <div><i className="legend-dot gray" /><span>Belum hadir</span><strong>{Math.max(0, activeEmployees.length - presentIds.size)}</strong></div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Aktivitas terbaru" description="Masuk dan pulang yang baru tercatat" action={<Link className="text-link" to="/admin/kehadiran">Lihat semua <ArrowUpRight size={15} /></Link>}>
          {latest.length ? <div className="activity-list">{latest.map((item) => (
            <div className="activity-item" key={item.id}>
              <span className="avatar soft">{initials(item.employeeName)}</span>
              <div><strong>{item.employeeName}</strong><small>{item.type === "check-in" ? "Check-in" : "Check-out"} • {formatDateTime(item.clientTimestamp)}</small></div>
              <StatusBadge status={item.status} />
            </div>
          ))}</div> : <EmptyState icon={<Activity size={24} />} title="Belum ada aktivitas" description="Rekaman karyawan akan muncul di sini secara real-time." />}
        </SectionCard>

        <SectionCard title="Geo tracking aktif" description="Sesi lapangan yang sedang berjalan" action={<Link className="text-link" to="/admin/tracking">Buka live map <ArrowUpRight size={15} /></Link>}>
          {tracking.data.filter((item) => item.status === "active").length ? (
            <div className="tracking-summary">
              <div className="tracking-pulse"><MapPinned size={25} /><i /></div>
              <div><strong>{tracking.data.filter((item) => item.status === "active").length} karyawan sedang aktif</strong><p>Posisi diperbarui selama sesi employee berjalan.</p></div>
            </div>
          ) : <EmptyState icon={<MapPinned size={24} />} title="Tidak ada sesi aktif" description="Sesi tracking lapangan akan muncul saat karyawan menekan Mulai Sesi." />}
        </SectionCard>

        <SectionCard title="Mulai dari sini" description="Tiga langkah menyiapkan workspace kosong">
          <ol className="setup-steps">
            <li><span>1</span><div><strong>Atur lokasi & kebijakan</strong><small>Tentukan titik kantor, radius, dan jam kerja.</small></div><Link to="/admin/konfigurasi"><ArrowUpRight size={17} /></Link></li>
            <li><span>2</span><div><strong>Tambahkan karyawan</strong><small>Sistem membuat akun dan password sementara.</small></div><Link to="/admin/karyawan"><ArrowUpRight size={17} /></Link></li>
            <li><span>3</span><div><strong>Jalankan payroll</strong><small>Setelah absensi dan komponen gaji tersedia.</small></div><Link to="/admin/payroll"><ArrowUpRight size={17} /></Link></li>
          </ol>
        </SectionCard>
      </div>

      <div className="product-note"><Sparkles size={18} /><span><strong>Workspace siap dikonfigurasi.</strong> Data contoh tidak dimasukkan agar kamu dapat membangun struktur perusahaan dari nol.</span></div>
    </>
  );
}
