import { useMemo, useState, type FormEvent } from "react";
import { Calculator, CheckCircle2, ChevronRight, CircleDollarSign, FileText, Plus, Send, ShieldCheck, Users } from "lucide-react";
import { collection, doc, getDocs, query, serverTimestamp, where, writeBatch } from "firebase/firestore";
import { PageHeader, SectionCard } from "../Shell";
import { EmptyState, FormField, FormMessage, Modal, StatusBadge, SubmitButton } from "../components";
import { useLiveCollection } from "../data";
import { db } from "../firebase";
import { formatCurrency, friendlyError } from "../lib";
import type { Employee, PayrollRun, Payslip } from "../types";

export function AdminPayroll() {
  const { data: employees } = useLiveCollection<Employee>("employees");
  const { data: runs, loading } = useLiveCollection<PayrollRun>("payrollRuns");
  const { data: payslips } = useLiveCollection<Payslip>("payslips");
  const [open, setOpen] = useState(false);
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const sorted = useMemo(() => [...runs].sort((a, b) => b.period.localeCompare(a.period)), [runs]);
  const publishedTotal = runs.filter((item) => item.status === "published").reduce((sum, item) => sum + item.totalNet, 0);

  async function createRun(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (runs.some((item) => item.period === period)) throw new Error("Periode payroll tersebut sudah tersedia.");
      const activeEmployees = employees.filter((item) => item.status === "active");
      if (!activeEmployees.length) throw new Error("Tambahkan minimal satu karyawan aktif sebelum menghitung payroll.");
      if (activeEmployees.length > 490) throw new Error("Showcase membatasi satu payroll run hingga 490 karyawan.");

      const runRef = doc(collection(db, "payrollRuns"));
      const batch = writeBatch(db);
      let totalGross = 0;
      let totalNet = 0;
      activeEmployees.forEach((employee) => {
        const gross = (employee.baseSalary || 0) + (employee.allowance || 0);
        const deduction = 0;
        const net = gross - deduction;
        totalGross += gross;
        totalNet += net;
        const slipRef = doc(collection(db, "payslips"));
        batch.set(slipRef, {
          employeeId: employee.id,
          employeeName: employee.fullName,
          employeeCode: employee.employeeCode,
          period,
          baseSalary: employee.baseSalary || 0,
          allowance: employee.allowance || 0,
          attendanceAllowance: 0,
          overtime: 0,
          deduction,
          gross,
          net,
          status: "draft",
          payrollRunId: runRef.id,
          createdAt: serverTimestamp(),
        });
      });
      batch.set(runRef, {
        period,
        status: "review",
        employeeCount: activeEmployees.length,
        totalGross,
        totalDeduction: 0,
        totalNet,
        createdAt: serverTimestamp(),
      });
      await batch.commit();
      setOpen(false);
    } catch (payrollError) {
      setError(friendlyError(payrollError));
    } finally {
      setSaving(false);
    }
  }

  async function publishRun(run: PayrollRun) {
    if (!window.confirm(`Publikasikan payroll ${run.period}? Slip akan langsung terlihat oleh karyawan.`)) return;
    const snapshot = await getDocs(query(collection(db, "payslips"), where("payrollRunId", "==", run.id)));
    const batch = writeBatch(db);
    snapshot.docs.forEach((item) => batch.update(item.ref, { status: "published", publishedAt: serverTimestamp() }));
    batch.update(doc(db, "payrollRuns", run.id), { status: "published", publishedAt: serverTimestamp() });
    await batch.commit();
  }

  return (
    <>
      <PageHeader eyebrow="Compensation" title="Penggajian" description="Hitung dari profil gaji, review hasil, lalu publikasikan slip secara aman." actions={<button className="button button-primary" onClick={() => { setError(""); setOpen(true); }}><Plus size={17} /> Buat payroll</button>} />
      <div className="metrics-grid payroll-metrics">
        <article className="metric-card highlight"><div className="metric-icon teal"><CircleDollarSign size={20} /></div><div className="metric-copy"><span>Total telah dipublikasikan</span><strong>{formatCurrency(publishedTotal)}</strong><small>Akumulasi seluruh periode</small></div></article>
        <article className="metric-card"><div className="metric-icon navy"><Users size={20} /></div><div className="metric-copy"><span>Profil payroll</span><strong>{employees.filter((item) => item.status === "active").length}</strong><small>Karyawan aktif</small></div></article>
        <article className="metric-card"><div className="metric-icon amber"><Calculator size={20} /></div><div className="metric-copy"><span>Menunggu review</span><strong>{runs.filter((item) => item.status === "review").length}</strong><small>Run belum dipublish</small></div></article>
      </div>

      <SectionCard title="Periode payroll" description="Setiap periode menyimpan snapshot komponen agar hasil dapat diaudit.">
        {loading ? <div className="table-loading">Memuat payroll…</div> : sorted.length ? <div className="payroll-list">{sorted.map((run) => (
          <article key={run.id}>
            <div className="payroll-period"><span><FileText size={20} /></span><div><strong>{new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date(`${run.period}-01`))}</strong><small>{run.employeeCount} karyawan</small></div></div>
            <div className="payroll-amount"><span>Take home pay</span><strong>{formatCurrency(run.totalNet)}</strong></div>
            <StatusBadge status={run.status} />
            {run.status === "review" ? <button className="button button-primary compact" onClick={() => void publishRun(run)}><Send size={16} /> Publish slip</button> : <span className="published-check"><CheckCircle2 size={18} /> Terkirim</span>}
            <ChevronRight size={18} className="row-chevron" />
          </article>
        ))}</div> : <EmptyState icon={<CircleDollarSign size={25} />} title="Belum ada payroll" description="Tambahkan karyawan beserta gaji pokok, lalu buat periode payroll pertama." action={<button className="button button-primary" onClick={() => setOpen(true)}><Plus size={17} /> Buat payroll</button>} />}
      </SectionCard>

      <div className="simulation-note"><ShieldCheck size={20} /><div><strong>Mode showcase</strong><p>Perhitungan saat ini menggunakan gaji pokok + tunjangan tetap. Pajak, BPJS, lembur, dan potongan perlu dikonfigurasi dan divalidasi sebelum penggunaan produksi.</p></div></div>

      <Modal open={open} title="Buat payroll baru" description="Sistem mengambil profil seluruh karyawan aktif sebagai snapshot periode." onClose={() => setOpen(false)}>
        <form onSubmit={createRun}>
          <FormField label="Periode penggajian"><input type="month" value={period} onChange={(event) => setPeriod(event.target.value)} required /></FormField>
          <div className="payroll-preview-box"><div><span>Karyawan diproses</span><strong>{employees.filter((item) => item.status === "active").length}</strong></div><div><span>Estimasi bruto</span><strong>{formatCurrency(employees.filter((item) => item.status === "active").reduce((sum, item) => sum + (item.baseSalary || 0) + (item.allowance || 0), 0))}</strong></div></div>
          <FormMessage error={error} />
          <div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setOpen(false)}>Batal</button><SubmitButton loading={saving}>Hitung payroll</SubmitButton></div>
        </form>
      </Modal>
      <span className="sr-only">{payslips.length} slip tersedia</span>
    </>
  );
}
