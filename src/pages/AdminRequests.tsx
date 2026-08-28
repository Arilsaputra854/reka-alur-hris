import { useMemo, useState } from "react";
import { collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { CalendarDays, Check, Clock3, FileCheck2, ReceiptText, Search, X } from "lucide-react";
import { EmptyState, FormField, FormMessage, Modal, StatusBadge } from "../components";
import { useLiveCollection } from "../data";
import { db } from "../firebase";
import { daysInclusive, formatCurrency, friendlyError, initials } from "../lib";
import { MetricCard, PageHeader, SectionCard } from "../Shell";
import type { Employee, EmployeeRequest, RequestCategory } from "../types";

const labels: Record<RequestCategory, string> = { leave: "Cuti / izin", overtime: "Lembur", reimbursement: "Reimbursement" };

export function AdminRequests() {
  const { data: requests, loading } = useLiveCollection<EmployeeRequest>("requests");
  const [queryText, setQueryText] = useState("");
  const [status, setStatus] = useState("submitted");
  const [selected, setSelected] = useState<EmployeeRequest | null>(null);
  const [decision, setDecision] = useState<"approved" | "rejected">("approved");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const filtered = useMemo(() => [...requests]
    .filter((item) => status === "all" || item.status === status)
    .filter((item) => !queryText || `${item.employeeName} ${item.requestType} ${item.reason}`.toLowerCase().includes(queryText.toLowerCase()))
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)), [queryText, requests, status]);

  function openDecision(item: EmployeeRequest, nextDecision: "approved" | "rejected") {
    setSelected(item);
    setDecision(nextDecision);
    setNote("");
    setError("");
  }

  async function submitDecision() {
    if (!selected) return;
    setSaving(true);
    setError("");
    try {
      const auditRef = doc(collection(db, "auditLogs"));
      await runTransaction(db, async (transaction) => {
        const requestRef = doc(db, "requests", selected.id);
        const currentRequest = await transaction.get(requestRef);
        if (!currentRequest.exists() || currentRequest.data().status !== "submitted") throw new Error("Pengajuan ini sudah diproses oleh admin lain.");

        if (decision === "approved" && selected.category === "leave") {
          const employeeRef = doc(db, "employees", selected.employeeId);
          const employeeSnapshot = await transaction.get(employeeRef);
          if (!employeeSnapshot.exists()) throw new Error("Profil karyawan tidak ditemukan.");
          const employee = employeeSnapshot.data() as Employee;
          const days = daysInclusive(selected.startDate, selected.endDate);
          const quota = employee.annualLeaveQuota ?? 12;
          const used = employee.annualLeaveUsed ?? 0;
          if (used + days > quota) throw new Error(`Saldo cuti tidak cukup. Tersedia ${Math.max(0, quota - used)} hari, diminta ${days} hari.`);
          transaction.update(employeeRef, { annualLeaveUsed: used + days, updatedAt: serverTimestamp() });
        }

        transaction.update(requestRef, { status: decision, decisionNote: note.trim(), decidedAt: serverTimestamp() });
        transaction.set(auditRef, {
          action: `request.${decision}`,
          entityId: selected.id,
          summary: `${labels[selected.category]} ${selected.employeeName} ${decision === "approved" ? "disetujui" : "ditolak"}`,
          createdAt: serverTimestamp(),
        });
      });
      setSelected(null);
    } catch (decisionError) {
      setError(friendlyError(decisionError));
    } finally {
      setSaving(false);
    }
  }

  const pending = requests.filter((item) => item.status === "submitted").length;
  const approved = requests.filter((item) => item.status === "approved").length;
  const reimbursementPending = requests.filter((item) => item.category === "reimbursement" && item.status === "submitted").reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <PageHeader eyebrow="Approval inbox" title="Pengajuan karyawan" description="Tinjau cuti, lembur, dan reimbursement dari satu antrean kerja." />
      <div className="metrics-grid request-metrics">
        <MetricCard label="Menunggu keputusan" value={pending} delta="Perlu tindakan admin" icon={Clock3} tone="amber" />
        <MetricCard label="Disetujui" value={approved} delta="Seluruh riwayat" icon={FileCheck2} tone="teal" />
        <MetricCard label="Reimbursement pending" value={formatCurrency(reimbursementPending)} delta="Belum disetujui" icon={ReceiptText} tone="purple" />
      </div>
      <SectionCard>
        <div className="table-toolbar">
          <div className="search-box"><Search size={18} /><input placeholder="Cari karyawan atau jenis pengajuan…" value={queryText} onChange={(event) => setQueryText(event.target.value)} /></div>
          <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="submitted">Menunggu persetujuan</option><option value="approved">Disetujui</option><option value="rejected">Ditolak</option><option value="all">Semua status</option></select>
        </div>
        {loading ? <div className="table-loading">Memuat pengajuan…</div> : filtered.length ? <div className="approval-list">{filtered.map((item) => (
          <article key={item.id}>
            <span className={`request-icon ${item.category}`}>{item.category === "leave" ? <CalendarDays size={19} /> : item.category === "overtime" ? <Clock3 size={19} /> : <ReceiptText size={19} />}</span>
            <div className="approval-person"><span className="avatar soft">{initials(item.employeeName)}</span><p><strong>{item.employeeName}</strong><small>{labels[item.category]} • {item.requestType}</small></p></div>
            <div className="approval-detail"><strong>{item.startDate}{item.category === "leave" && item.endDate !== item.startDate ? ` – ${item.endDate}` : ""}</strong><small>{item.category === "overtime" ? `${item.hours} jam` : item.category === "reimbursement" ? formatCurrency(item.amount) : `${daysInclusive(item.startDate, item.endDate)} hari`}</small><p>{item.reason}</p></div>
            <StatusBadge status={item.status} />
            {item.status === "submitted" && <div className="approval-actions"><button className="icon-button reject" title="Tolak" onClick={() => openDecision(item, "rejected")}><X size={17} /></button><button className="icon-button approve" title="Setujui" onClick={() => openDecision(item, "approved")}><Check size={17} /></button></div>}
          </article>
        ))}</div> : <EmptyState icon={<FileCheck2 size={25} />} title="Antrean kosong" description={status === "submitted" ? "Tidak ada pengajuan yang menunggu keputusan." : "Tidak ada pengajuan dengan filter ini."} />}
      </SectionCard>

      <Modal open={Boolean(selected)} title={decision === "approved" ? "Setujui pengajuan" : "Tolak pengajuan"} description={selected ? `${labels[selected.category]} • ${selected.employeeName}` : ""} onClose={() => !saving && setSelected(null)}>
        <div className="decision-content">
          {selected && <div className="decision-summary"><strong>{selected.requestType}</strong><span>{selected.startDate}{selected.endDate !== selected.startDate ? ` – ${selected.endDate}` : ""}</span><p>{selected.reason}</p></div>}
          <FormField label="Catatan untuk karyawan" hint={decision === "rejected" ? "Sebaiknya jelaskan alasan penolakan." : "Opsional."}><textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} required={decision === "rejected"} /></FormField>
          <FormMessage error={error} />
          <div className="modal-actions"><button className="button button-secondary" disabled={saving} onClick={() => setSelected(null)}>Batal</button><button className={`button ${decision === "approved" ? "button-primary" : "button-danger"}`} disabled={saving || (decision === "rejected" && !note.trim())} onClick={() => void submitDecision()}>{saving ? "Memproses…" : decision === "approved" ? "Setujui pengajuan" : "Tolak pengajuan"}</button></div>
        </div>
      </Modal>
    </>
  );
}
