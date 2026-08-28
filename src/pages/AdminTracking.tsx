import { Activity, LocateFixed, Navigation, Radio, Route } from "lucide-react";
import { PageHeader, SectionCard } from "../Shell";
import { EmptyState, StatusBadge } from "../components";
import { useLiveCollection } from "../data";
import { formatDateTime, initials } from "../lib";
import type { TrackingSession } from "../types";

export function AdminTracking() {
  const { data: sessions, loading } = useLiveCollection<TrackingSession>("trackingSessions");
  const active = sessions.filter((item) => item.status === "active");

  return (
    <>
      <PageHeader eyebrow="Field visibility" title="Geo tracking" description="Pantau hanya sesi kerja lapangan yang dinyalakan secara sadar oleh karyawan." />
      <div className="tracking-layout">
        <SectionCard className="live-map-card" title="Live map" description={`${active.length} sesi sedang mengirim lokasi`} action={<span className="live-indicator"><i /> Live</span>}>
          <div className="map-canvas">
            <div className="map-grid-lines" />
            <div className="map-road road-one" /><div className="map-road road-two" /><div className="map-road road-three" />
            <span className="map-label label-a">Jakarta Pusat</span><span className="map-label label-b">Kuningan</span><span className="map-label label-c">Menteng</span>
            {active.map((session, index) => (
              <div className={`map-person point-${(index % 4) + 1}`} key={session.id} title={session.employeeName}>
                <i /><span>{initials(session.employeeName)}</span><em>{session.employeeName}</em>
              </div>
            ))}
            {!active.length && <div className="map-empty"><LocateFixed size={30} /><strong>Belum ada posisi aktif</strong><span>Posisi muncul saat employee memulai sesi.</span></div>}
            <div className="map-privacy"><Radio size={14} /> Tracking hanya selama sesi aktif</div>
          </div>
        </SectionCard>

        <SectionCard title="Sesi aktif" description="Posisi terbaru dan kualitas sinyal">
          {loading ? <div className="table-loading">Memuat sesi…</div> : active.length ? <div className="session-list">{active.map((session) => (
            <article key={session.id}>
              <span className="avatar soft">{initials(session.employeeName)}</span>
              <div><strong>{session.employeeName}</strong><small>{session.lastUpdatedAt ? `Update ${formatDateTime(session.lastUpdatedAt.toDate())}` : "Menunggu titik pertama"}</small></div>
              <div className="signal"><i /><span>±{Math.round(session.lastAccuracy || 0)} m</span></div>
            </article>
          ))}</div> : <EmptyState icon={<Navigation size={24} />} title="Tidak ada sesi aktif" description="Sesi yang berjalan akan tampil beserta posisi terakhirnya." />}
        </SectionCard>
      </div>

      <SectionCard title="Riwayat sesi" description="Audit aktivitas tracking yang dimulai dan dihentikan employee">
        {sessions.length ? <div className="table-wrap"><table><thead><tr><th>Karyawan</th><th>Mulai</th><th>Selesai</th><th>Titik</th><th>Status</th></tr></thead><tbody>{[...sessions].sort((a, b) => (b.startedAt?.seconds || 0) - (a.startedAt?.seconds || 0)).map((session) => (
          <tr key={session.id}><td><div className="person-cell"><span className="avatar soft">{initials(session.employeeName)}</span><strong>{session.employeeName}</strong></div></td><td>{session.startedAt ? formatDateTime(session.startedAt.toDate()) : "—"}</td><td>{session.endedAt ? formatDateTime(session.endedAt.toDate()) : "Sedang berjalan"}</td><td><span className="inline-icon"><Route size={15} /> {session.pointCount || 0} titik</span></td><td><StatusBadge status={session.status} /></td></tr>
        ))}</tbody></table></div> : <EmptyState icon={<Activity size={24} />} title="Riwayat masih kosong" description="Belum ada employee yang memulai sesi tracking." />}
      </SectionCard>
    </>
  );
}
