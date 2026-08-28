import { useMemo, useState } from "react";
import { Check, Clock3, Download, MapPin, Search, ShieldAlert, X } from "lucide-react";
import { collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { PageHeader, SectionCard } from "../Shell";
import { EmptyState, StatusBadge } from "../components";
import { useLiveCollection } from "../data";
import { db } from "../firebase";
import { formatDateTime, initials } from "../lib";
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
}

export function AdminAttendance() {
  const { data: records, loading } = useLiveCollection<AttendanceRecord>("attendance");
  const { data: corrections } = useLiveCollection<Correction>("attendanceCorrections");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [tab, setTab] = useState<"records" | "corrections">("records");

  const filtered = useMemo(() => [...records]
    .filter((item) => !query || item.employeeName.toLowerCase().includes(query.toLowerCase()))
    .filter((item) => status === "all" || item.status === status)
    .sort((a, b) => b.clientTimestamp.localeCompare(a.clientTimestamp)), [query, records, status]);

  function exportCsv() {
    const rows = [
      ["Nama", "Jenis", "Waktu", "Status", "Latitude", "Longitude", "Akurasi", "Jarak", "Wajah"],
      ...filtered.map((item) => [item.employeeName, item.type, item.clientTimestamp, item.status, item.latitude, item.longitude, item.accuracy, item.distanceMeters, item.faceVerified ? "Terverifikasi" : "Review"]),
    ];
    const csv = `\uFEFF${rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n")}`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = `rekahr-attendance-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function decide(correction: Correction, decision: "approved" | "rejected") {
    const correctionRef = doc(db, "attendanceCorrections", correction.id);
    const attendanceRef = doc(db, "attendance", `correction-${correction.id}`);
    const auditRef = doc(collection(db, "auditLogs"));
    await runTransaction(db, async (transaction) => {
      const current = await transaction.get(correctionRef);
      if (!current.exists() || current.data().status !== "submitted") throw new Error("Koreksi ini sudah diproses.");
      transaction.update(correctionRef, { status: decision, decidedAt: serverTimestamp() });
      if (decision === "approved") {
        transaction.set(attendanceRef, {
          employeeId: correction.employeeId,
          employeeName: correction.employeeName,
          type: correction.type,
          clientTimestamp: new Date(`${correction.date}T${correction.requestedTime}:00+07:00`).toISOString(),
          dateKey: correction.date,
          latitude: 0,
          longitude: 0,
          accuracy: 0,
          distanceMeters: 0,
          faceVerified: false,
          faceScore: 0,
          faceMode: "manual-correction",
          status: "valid",
          source: "approved-correction",
          correctionId: correction.id,
          createdAt: serverTimestamp(),
        });
      }
      transaction.set(auditRef, { action: `attendance_correction.${decision}`, entityId: correction.id, summary: `Koreksi ${correction.employeeName} ${decision === "approved" ? "disetujui" : "ditolak"}`, createdAt: serverTimestamp() });
    });
  }

  return (
    <>
      <PageHeader eyebrow="Time & attendance" title="Kehadiran" description="Pantau bukti lokasi, verifikasi wajah, anomali, dan permintaan koreksi." actions={<button className="button button-secondary" onClick={exportCsv} disabled={!filtered.length}><Download size={17} /> Ekspor CSV</button>} />
      <div className="tab-bar"><button className={tab === "records" ? "active" : ""} onClick={() => setTab("records")}>Rekaman kehadiran</button><button className={tab === "corrections" ? "active" : ""} onClick={() => setTab("corrections")}>Koreksi <span>{corrections.filter((item) => item.status === "submitted").length}</span></button></div>
      {tab === "records" ? (
        <SectionCard>
          <div className="table-toolbar">
            <div className="search-box"><Search size={18} /><input placeholder="Cari nama karyawan…" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
            <select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Semua status</option><option value="valid">Valid</option><option value="late">Terlambat</option><option value="outside">Di luar area</option><option value="review">Perlu review</option></select>
          </div>
          {loading ? <div className="table-loading">Memuat rekaman…</div> : filtered.length ? (
            <div className="table-wrap"><table><thead><tr><th>Karyawan</th><th>Jenis</th><th>Waktu</th><th>Lokasi</th><th>Verifikasi</th><th>Status</th></tr></thead><tbody>{filtered.map((item) => (
              <tr key={item.id}>
                <td><div className="person-cell"><span className="avatar soft">{initials(item.employeeName)}</span><strong>{item.employeeName}</strong></div></td>
                <td><span className={`event-type ${item.type}`}>{item.type === "check-in" ? "Masuk" : "Pulang"}</span></td>
                <td>{formatDateTime(item.clientTimestamp)}</td>
                <td><div className="location-cell"><MapPin size={15} /><span>{item.distanceMeters ?? 0} m<small>±{Math.round(item.accuracy || 0)} m akurasi</small></span></div></td>
                <td>{item.faceVerified ? <span className="verified"><Check size={15} /> Wajah cocok</span> : <span className="review-text"><ShieldAlert size={15} /> Review</span>}</td>
                <td><StatusBadge status={item.status} /></td>
              </tr>
            ))}</tbody></table></div>
          ) : <EmptyState icon={<Clock3 size={25} />} title="Belum ada rekaman" description="Absensi karyawan akan muncul real-time setelah mereka check-in atau check-out." />}
        </SectionCard>
      ) : (
        <SectionCard>
          {corrections.length ? <div className="correction-list">{[...corrections].sort((a, b) => b.date.localeCompare(a.date)).map((item) => (
            <article className="correction-card" key={item.id}>
              <span className="avatar soft">{initials(item.employeeName)}</span>
              <div className="correction-main"><div><strong>{item.employeeName}</strong><StatusBadge status={item.status} /></div><p>{item.reason}</p><small>{item.date} • Koreksi {item.type === "check-in" ? "jam masuk" : "jam pulang"} menjadi {item.requestedTime}</small></div>
              {item.status === "submitted" && <div className="correction-actions"><button className="button button-danger-ghost" onClick={() => void decide(item, "rejected")}><X size={16} /> Tolak</button><button className="button button-primary" onClick={() => void decide(item, "approved")}><Check size={16} /> Setujui</button></div>}
            </article>
          ))}</div> : <EmptyState icon={<ShieldAlert size={25} />} title="Tidak ada koreksi" description="Permintaan koreksi dari employee akan tampil di sini." />}
        </SectionCard>
      )}
    </>
  );
}
