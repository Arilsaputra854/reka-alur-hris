import { useMemo, useState } from "react";
import { collection, orderBy, query, where } from "firebase/firestore";
import { Download, FileText, LockKeyhole, Printer, ReceiptText, WalletCards, X } from "lucide-react";
import { useAuth } from "../auth";
import { EmptyState, StatusBadge } from "../components";
import { useLiveQuery } from "../data";
import { db } from "../firebase";
import { formatCurrency } from "../lib";
import { PageHeader, SectionCard } from "../Shell";
import type { Payslip } from "../types";
import { downloadPayslipPdf } from "../payslipPdf";

export function EmployeePayslips() {
  const { firebaseUser } = useAuth();
  const payslipQuery = useMemo(() => query(collection(db, "payslips"), where("employeeId", "==", firebaseUser?.uid || "none"), orderBy("createdAt", "desc")), [firebaseUser?.uid]);
  const { data: slips, loading } = useLiveQuery<Payslip>(payslipQuery);
  const published = slips.filter((item) => item.status === "published");
  const [selected, setSelected] = useState<Payslip | null>(null);

  return (
    <>
      <PageHeader eyebrow="My compensation" title="Slip gaji" description="Slip yang sudah dipublikasikan hanya dapat dibaca oleh akunmu." />
      <div className="payslip-security"><LockKeyhole size={19} /><div><strong>Dokumen privat</strong><span>Akses employee lain ditolak oleh Firebase Security Rules.</span></div></div>
      <SectionCard title="Dokumen penggajian" description={`${published.length} slip tersedia`}>
        {loading ? <div className="table-loading">Memuat slip gaji…</div> : published.length ? <div className="employee-payslip-list">{published.map((slip) => (
          <button key={slip.id} onClick={() => setSelected(slip)}>
            <span className="payslip-icon"><ReceiptText size={22} /></span>
            <div><strong>{new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(`${slip.period}-01`))}</strong><small>{slip.employeeCode} • Reka Alur Teknologi</small></div>
            <div className="payslip-net"><span>Take home pay</span><strong>{formatCurrency(slip.net)}</strong></div>
            <StatusBadge status={slip.status} />
            <FileText size={18} />
          </button>
        ))}</div> : <EmptyState icon={<WalletCards size={26} />} title="Belum ada slip gaji" description="Slip akan muncul setelah Payroll Admin mempublikasikan periode penggajian." />}
      </SectionCard>

      {selected && (
        <div className="payslip-overlay" onMouseDown={() => setSelected(null)}>
          <article className="payslip-document" onMouseDown={(event) => event.stopPropagation()}>
            <header><div className="payslip-brand"><span>R•</span><div><strong>RekaHR</strong><small>REKA ALUR TEKNOLOGI</small></div></div><button className="icon-button no-print" onClick={() => setSelected(null)}><X size={20} /></button></header>
            <div className="payslip-title"><div><span>SLIP GAJI</span><h2>{new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(`${selected.period}-01`))}</h2></div><StatusBadge status="published" /></div>
            <div className="payslip-employee"><div><span>Nama karyawan</span><strong>{selected.employeeName}</strong></div><div><span>ID karyawan</span><strong>{selected.employeeCode}</strong></div><div><span>Periode</span><strong>{selected.period}</strong></div></div>
            <div className="payslip-lines"><h3>Penghasilan</h3><div><span>Gaji pokok</span><strong>{formatCurrency(selected.baseSalary)}</strong></div><div><span>Tunjangan tetap</span><strong>{formatCurrency(selected.allowance)}</strong></div><div><span>Tunjangan kehadiran</span><strong>{formatCurrency(selected.attendanceAllowance)}</strong></div><div><span>Lembur</span><strong>{formatCurrency(selected.overtime)}</strong></div><div><span>Reimbursement</span><strong>{formatCurrency(selected.reimbursement || 0)}</strong></div><div className="subtotal"><span>Penghasilan bruto</span><strong>{formatCurrency(selected.gross)}</strong></div><h3>Potongan</h3><div><span>BPJS Kesehatan (pekerja)</span><strong>- {formatCurrency(selected.bpjsHealth || 0)}</strong></div><div><span>BPJS Ketenagakerjaan (pekerja)</span><strong>- {formatCurrency(selected.bpjsEmployment || 0)}</strong></div><div><span>PPh Pasal 21</span><strong>- {formatCurrency(selected.incomeTax || 0)}</strong></div><div className="subtotal"><span>Total potongan</span><strong>- {formatCurrency(selected.deduction)}</strong></div></div>
            <div className="payslip-total"><span>TAKE HOME PAY</span><strong>{formatCurrency(selected.net)}</strong></div>
            <footer><p>Dokumen dibuat otomatis oleh RekaHR berdasarkan profil tarif karyawan dan pengajuan yang telah disetujui. Validasi akhir tetap menjadi tanggung jawab Payroll Admin.</p><small>Document ID: {selected.id}</small></footer>
            <div className="payslip-actions no-print"><button className="button button-secondary" onClick={() => window.print()}><Printer size={17}/> Cetak</button><button className="button button-primary" onClick={() => void downloadPayslipPdf(selected)}><Download size={17} /> Unduh PDF</button></div>
          </article>
        </div>
      )}
    </>
  );
}
