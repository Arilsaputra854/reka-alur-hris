import { useEffect, useMemo, useState, type FormEvent } from "react";
import { addDoc, collection, doc, getDoc, query, serverTimestamp, where } from "firebase/firestore";
import { CalendarDays, CheckCircle2, Clock3, FilePlus2, Plus, ReceiptText } from "lucide-react";
import { useAuth } from "../auth";
import { EmptyState, FormField, FormMessage, Modal, StatusBadge, SubmitButton } from "../components";
import { useLiveQuery } from "../data";
import { db } from "../firebase";
import { friendlyError, formatCurrency } from "../lib";
import { MetricCard, PageHeader, SectionCard } from "../Shell";
import type { Employee, EmployeeRequest, RequestCategory } from "../types";

const today = () => new Date().toISOString().slice(0, 10);

const requestLabels: Record<RequestCategory, string> = {
  leave: "Cuti / izin",
  overtime: "Lembur",
  reimbursement: "Reimbursement",
};

const initialForm = {
  category: "leave" as RequestCategory,
  requestType: "Cuti tahunan",
  startDate: today(),
  endDate: today(),
  hours: "1",
  amount: "0",
  reason: "",
};

export function EmployeeRequests() {
  const { firebaseUser, profile } = useAuth();
  const requestQuery = useMemo(() => query(collection(db, "requests"), where("employeeId", "==", firebaseUser?.uid || "none")), [firebaseUser?.uid]);
  const { data: requests, loading } = useLiveQuery<EmployeeRequest>(requestQuery);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!firebaseUser) return;
    void getDoc(doc(db, "employees", firebaseUser.uid)).then((snapshot) => {
      if (snapshot.exists()) setEmployee({ id: snapshot.id, ...snapshot.data() } as Employee);
    });
  }, [firebaseUser]);

  const sorted = useMemo(() => [...requests].sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)), [requests]);
  const pending = requests.filter((item) => item.status === "submitted").length;
  const approved = requests.filter((item) => item.status === "approved").length;
  const leaveRemaining = Math.max(0, (employee?.annualLeaveQuota ?? 12) - (employee?.annualLeaveUsed ?? 0));

  function openCreate(category: RequestCategory = "leave") {
    setForm({ ...initialForm, category, requestType: category === "leave" ? "Cuti tahunan" : category === "overtime" ? "Lembur hari kerja" : "Transportasi" });
    setError("");
    setOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!firebaseUser) return;
    setSaving(true);
    setError("");
    try {
      if (form.category === "leave" && form.endDate < form.startDate) throw new Error("Tanggal selesai tidak boleh sebelum tanggal mulai.");
      await addDoc(collection(db, "requests"), {
        employeeId: firebaseUser.uid,
        employeeName: profile?.displayName || employee?.fullName || "Karyawan",
        category: form.category,
        requestType: form.requestType.trim(),
        startDate: form.startDate,
        endDate: form.category === "leave" ? form.endDate : form.startDate,
        hours: form.category === "overtime" ? Math.max(0, Number(form.hours) || 0) : 0,
        amount: form.category === "reimbursement" ? Math.max(0, Math.round(Number(form.amount) || 0)) : 0,
        reason: form.reason.trim(),
        status: "submitted",
        createdAt: serverTimestamp(),
      });
      setOpen(false);
    } catch (submitError) {
      setError(friendlyError(submitError));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Employee self-service" title="Pengajuan saya" description="Ajukan cuti, lembur, dan reimbursement tanpa formulir manual." actions={<button className="button button-primary" onClick={() => openCreate()}><Plus size={17} /> Buat pengajuan</button>} />
      <div className="metrics-grid request-metrics">
        <MetricCard label="Sisa cuti" value={`${leaveRemaining} hari`} delta={`${employee?.annualLeaveUsed || 0} hari telah digunakan`} icon={CalendarDays} tone="teal" />
        <MetricCard label="Menunggu persetujuan" value={pending} delta="Sedang ditinjau HR" icon={Clock3} tone="amber" />
        <MetricCard label="Disetujui" value={approved} delta="Seluruh jenis pengajuan" icon={CheckCircle2} tone="navy" />
      </div>

      <div className="request-shortcuts">
        <button onClick={() => openCreate("leave")}><CalendarDays size={20} /><span><strong>Cuti / izin</strong><small>Cek saldo dan ajukan tanggal</small></span></button>
        <button onClick={() => openCreate("overtime")}><Clock3 size={20} /><span><strong>Lembur</strong><small>Catat tanggal dan durasi</small></span></button>
        <button onClick={() => openCreate("reimbursement")}><ReceiptText size={20} /><span><strong>Reimbursement</strong><small>Ajukan penggantian biaya</small></span></button>
      </div>

      <SectionCard title="Riwayat pengajuan" description="Status berubah otomatis setelah HR memberikan keputusan.">
        {loading ? <div className="table-loading">Memuat pengajuan…</div> : sorted.length ? <div className="request-list employee-request-list">{sorted.map((item) => (
          <article key={item.id}>
            <span><FilePlus2 size={18} /></span>
            <div><strong>{requestLabels[item.category]} • {item.requestType}</strong><small>{item.startDate}{item.category === "leave" && item.endDate !== item.startDate ? ` – ${item.endDate}` : ""}{item.category === "overtime" ? ` • ${item.hours} jam` : ""}{item.category === "reimbursement" ? ` • ${formatCurrency(item.amount)}` : ""}</small><p>{item.reason}</p>{item.decisionNote && <em>Catatan HR: {item.decisionNote}</em>}</div>
            <StatusBadge status={item.status} />
          </article>
        ))}</div> : <EmptyState icon={<FilePlus2 size={25} />} title="Belum ada pengajuan" description="Gunakan pintasan di atas untuk membuat pengajuan pertamamu." />}
      </SectionCard>

      <Modal open={open} title={`Ajukan ${requestLabels[form.category]}`} description="Pengajuan akan dikirim ke inbox persetujuan HR." onClose={() => setOpen(false)}>
        <form onSubmit={submit}>
          <div className="form-grid two">
            <FormField label="Kategori"><select value={form.category} onChange={(event) => { const category = event.target.value as RequestCategory; setForm({ ...form, category, requestType: category === "leave" ? "Cuti tahunan" : category === "overtime" ? "Lembur hari kerja" : "Transportasi" }); }}><option value="leave">Cuti / izin</option><option value="overtime">Lembur</option><option value="reimbursement">Reimbursement</option></select></FormField>
            <FormField label="Jenis"><input value={form.requestType} onChange={(event) => setForm({ ...form, requestType: event.target.value })} required /></FormField>
            <FormField label={form.category === "leave" ? "Tanggal mulai" : "Tanggal kegiatan"}><input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} required /></FormField>
            {form.category === "leave" && <FormField label="Tanggal selesai"><input type="date" min={form.startDate} value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} required /></FormField>}
            {form.category === "overtime" && <FormField label="Durasi (jam)"><input type="number" min="0.5" max="24" step="0.5" value={form.hours} onChange={(event) => setForm({ ...form, hours: event.target.value })} required /></FormField>}
            {form.category === "reimbursement" && <FormField label="Nominal"><input type="number" min="1" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required /></FormField>}
          </div>
          <FormField label="Alasan / keterangan"><textarea rows={4} minLength={10} value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Jelaskan kebutuhan pengajuan agar mudah ditinjau…" required /></FormField>
          <FormMessage error={error} />
          <div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setOpen(false)}>Batal</button><SubmitButton loading={saving}>Kirim pengajuan</SubmitButton></div>
        </form>
      </Modal>
    </>
  );
}
