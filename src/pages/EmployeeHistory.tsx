import { useMemo, useState, type FormEvent } from "react";
import { addDoc, collection, orderBy, query, serverTimestamp, where } from "firebase/firestore";
import { CalendarDays, Clock3, FileEdit, MapPin, Plus } from "lucide-react";
import { useAuth } from "../auth";
import { EmptyState, FormField, FormMessage, Modal, StatusBadge, SubmitButton } from "../components";
import { useLiveQuery } from "../data";
import { db } from "../firebase";
import { formatDateTime, friendlyError } from "../lib";
import { PageHeader, SectionCard } from "../Shell";
import type { AttendanceRecord } from "../types";

interface Correction {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  requestedTime: string;
  type: "check-in" | "check-out";
  reason: string;
  status: "submitted" | "approved" | "rejected";
  createdAt?: { seconds: number };
}

export function EmployeeHistory() {
  const { firebaseUser, profile } = useAuth();
  const attendanceQuery = useMemo(() => query(collection(db, "attendance"), where("employeeId", "==", firebaseUser?.uid || "none"), orderBy("createdAt", "desc")), [firebaseUser?.uid]);
  const correctionQuery = useMemo(() => query(collection(db, "attendanceCorrections"), where("employeeId", "==", firebaseUser?.uid || "none"), orderBy("createdAt", "desc")), [firebaseUser?.uid]);
  const { data: allRecords } = useLiveQuery<AttendanceRecord>(attendanceQuery);
  const { data: allCorrections } = useLiveQuery<Correction>(correctionQuery);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), requestedTime: "08:00", type: "check-in" as "check-in" | "check-out", reason: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const records = useMemo(() => allRecords.filter((item) => item.employeeId === firebaseUser?.uid).sort((a, b) => b.clientTimestamp.localeCompare(a.clientTimestamp)), [allRecords, firebaseUser?.uid]);
  const corrections = useMemo(() => allCorrections.filter((item) => item.employeeId === firebaseUser?.uid).sort((a, b) => b.date.localeCompare(a.date)), [allCorrections, firebaseUser?.uid]);

  async function submitCorrection(event: FormEvent) {
    event.preventDefault();
    if (!firebaseUser) return;
    setSaving(true); setError("");
    try {
      await addDoc(collection(db, "attendanceCorrections"), { employeeId: firebaseUser.uid, employeeName: profile?.displayName || "Karyawan", ...form, status: "submitted", createdAt: serverTimestamp() });
      setOpen(false);
      setForm({ date: new Date().toISOString().slice(0, 10), requestedTime: "08:00", type: "check-in", reason: "" });
    } catch (submitError) { setError(friendlyError(submitError)); } finally { setSaving(false); }
  }

  return (
    <>
      <PageHeader eyebrow="My attendance" title="Riwayat kehadiran" description="Periksa waktu, lokasi, dan status attendance milikmu." actions={<button className="button button-primary" onClick={() => { setError(""); setOpen(true); }}><Plus size={17} /> Ajukan koreksi</button>} />
      <div className="employee-history-grid">
        <SectionCard title="Rekaman terbaru" description="Masuk dan pulang berdasarkan waktu server">
          {records.length ? <div className="history-timeline">{records.map((item) => (
            <article key={item.id}><span className={`timeline-icon ${item.type}`}><Clock3 size={17} /></span><div><strong>{item.type === "check-in" ? "Check-in" : "Check-out"}</strong><small>{formatDateTime(item.clientTimestamp)}</small></div><div className="history-location"><MapPin size={14} /> {item.distanceMeters || 0} m</div><StatusBadge status={item.status} /></article>
          ))}</div> : <EmptyState icon={<CalendarDays size={24} />} title="Riwayat masih kosong" description="Rekaman pertama akan muncul setelah kamu melakukan check-in." />}
        </SectionCard>
        <SectionCard title="Pengajuan koreksi" description="Status permintaan perubahan waktu">
          {corrections.length ? <div className="request-list">{corrections.map((item) => <article key={item.id}><span><FileEdit size={18} /></span><div><strong>{item.type === "check-in" ? "Koreksi jam masuk" : "Koreksi jam pulang"}</strong><small>{item.date} • {item.requestedTime}</small><p>{item.reason}</p></div><StatusBadge status={item.status} /></article>)}</div> : <EmptyState icon={<FileEdit size={24} />} title="Belum ada pengajuan" description="Gunakan koreksi jika lupa masuk/pulang atau waktu tidak sesuai." />}
        </SectionCard>
      </div>
      <Modal open={open} title="Ajukan koreksi kehadiran" description="HR akan melihat waktu yang diminta beserta alasanmu." onClose={() => setOpen(false)}>
        <form onSubmit={submitCorrection}><div className="form-grid two"><FormField label="Tanggal"><input type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></FormField><FormField label="Jenis"><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as "check-in" | "check-out" })}><option value="check-in">Jam masuk</option><option value="check-out">Jam pulang</option></select></FormField><FormField label="Waktu yang diminta"><input type="time" value={form.requestedTime} onChange={(event) => setForm({ ...form, requestedTime: event.target.value })} required /></FormField><FormField label="Alasan"><textarea rows={4} value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} placeholder="Jelaskan alasan koreksi…" required minLength={10} /></FormField></div><FormMessage error={error} /><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setOpen(false)}>Batal</button><SubmitButton loading={saving}>Kirim pengajuan</SubmitButton></div></form>
      </Modal>
    </>
  );
}
