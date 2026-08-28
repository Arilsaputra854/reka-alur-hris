import { useEffect, useMemo, useRef, useState } from "react";
import { addDoc, collection, doc, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { Activity, Check, LocateFixed, MapPinned, Navigation, Play, Radio, Route, Square, TimerReset } from "lucide-react";
import { useAuth } from "../auth";
import { EmptyState, FormMessage, StatusBadge } from "../components";
import { useLiveQuery } from "../data";
import { db } from "../firebase";
import { formatDateTime, friendlyError } from "../lib";
import { PageHeader, SectionCard } from "../Shell";
import type { TrackingSession } from "../types";

export function EmployeeTracking() {
  const { firebaseUser, profile } = useAuth();
  const sessionQuery = useMemo(() => query(collection(db, "trackingSessions"), where("employeeId", "==", firebaseUser?.uid || "none"), orderBy("startedAt", "desc")), [firebaseUser?.uid]);
  const { data: allSessions } = useLiveQuery<TrackingSession>(sessionQuery);
  const [activeId, setActiveId] = useState("");
  const [pointCount, setPointCount] = useState(0);
  const [lastPosition, setLastPosition] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const watchRef = useRef<number | null>(null);
  const lastWriteRef = useRef(0);

  const sessions = useMemo(() => allSessions.filter((item) => item.employeeId === firebaseUser?.uid).sort((a, b) => (b.startedAt?.seconds || 0) - (a.startedAt?.seconds || 0)), [allSessions, firebaseUser?.uid]);

  useEffect(() => () => { if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current); }, []);

  async function writePoint(sessionId: string, coordinates: GeolocationCoordinates) {
    const now = Date.now();
    if (now - lastWriteRef.current < 10_000) return;
    lastWriteRef.current = now;
    await addDoc(collection(db, "trackingSessions", sessionId, "points"), { latitude: coordinates.latitude, longitude: coordinates.longitude, accuracy: coordinates.accuracy, capturedAt: new Date().toISOString(), createdAt: serverTimestamp() });
    setPointCount((count) => {
      const next = count + 1;
      void updateDoc(doc(db, "trackingSessions", sessionId), { lastLatitude: coordinates.latitude, lastLongitude: coordinates.longitude, lastAccuracy: coordinates.accuracy, lastUpdatedAt: serverTimestamp(), pointCount: next });
      return next;
    });
  }

  async function start() {
    if (!firebaseUser || !navigator.geolocation) return;
    setBusy(true); setError("");
    try {
      const sessionRef = await addDoc(collection(db, "trackingSessions"), { employeeId: firebaseUser.uid, employeeName: profile?.displayName || "Karyawan", status: "active", pointCount: 0, startedAt: serverTimestamp(), lastUpdatedAt: serverTimestamp() });
      setActiveId(sessionRef.id); setPointCount(0);
      watchRef.current = navigator.geolocation.watchPosition((position) => {
        setLastPosition(position.coords);
        void writePoint(sessionRef.id, position.coords);
      }, (watchError) => setError(watchError.message || "Lokasi tidak dapat diperbarui."), { enableHighAccuracy: true, maximumAge: 5_000, timeout: 20_000 });
    } catch (startError) { setError(friendlyError(startError)); } finally { setBusy(false); }
  }

  async function stop() {
    if (!activeId) return;
    setBusy(true);
    try {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
      await updateDoc(doc(db, "trackingSessions", activeId), { status: "finished", endedAt: serverTimestamp(), lastUpdatedAt: serverTimestamp(), pointCount });
      setActiveId(""); setLastPosition(null);
    } catch (stopError) { setError(friendlyError(stopError)); } finally { setBusy(false); }
  }

  return (
    <>
      <PageHeader eyebrow="Field activity" title="Tracking sesi kerja" description="Kamu memegang kendali penuh kapan lokasi mulai dan berhenti direkam." />
      <section className={`employee-tracking-hero ${activeId ? "is-active" : ""}`}>
        <div className="tracking-hero-icon">{activeId ? <Radio size={34} /> : <MapPinned size={34} />}</div>
        <div><span className="tracking-kicker">{activeId ? "SESI SEDANG AKTIF" : "TRACKING NONAKTIF"}</span><h2>{activeId ? "Lokasi sedang dibagikan" : "Mulai saat pekerjaan lapangan dimulai"}</h2><p>{activeId ? "Biarkan halaman ini aktif. Kamu dapat menghentikan sesi kapan saja." : "RekaHR hanya merekam titik setelah kamu menekan Mulai Sesi."}</p></div>
        {activeId ? <button className="button button-stop" onClick={() => void stop()} disabled={busy}><Square size={17} /> Hentikan sesi</button> : <button className="button button-primary" onClick={() => void start()} disabled={busy}><Play size={17} /> {busy ? "Memulai…" : "Mulai sesi"}</button>}
      </section>
      <FormMessage error={error} />

      {activeId && <div className="tracking-live-stats"><div><span><LocateFixed size={18} /></span><p><small>Akurasi terakhir</small><strong>{lastPosition ? `±${Math.round(lastPosition.accuracy)} m` : "Mencari GPS…"}</strong></p></div><div><span><Route size={18} /></span><p><small>Titik tersinkron</small><strong>{pointCount}</strong></p></div><div><span><TimerReset size={18} /></span><p><small>Status</small><strong>Live</strong></p></div></div>}

      <div className="employee-history-grid">
        <SectionCard title="Bagaimana tracking bekerja" description="Batas penggunaan yang transparan">
          <ol className="tracking-how"><li><span>1</span><div><strong>Mulai secara eksplisit</strong><p>Browser meminta izin lokasi setelah tombol ditekan.</p></div></li><li><span>2</span><div><strong>Titik dikirim bertahap</strong><p>Posisi, waktu, dan akurasi muncul pada admin live map.</p></div></li><li><span>3</span><div><strong>Hentikan kapan saja</strong><p>Titik baru langsung ditolak setelah sesi selesai.</p></div></li></ol>
        </SectionCard>
        <SectionCard title="Riwayat sesi" description="Sesi tracking yang pernah kamu jalankan">
          {sessions.length ? <div className="tracking-history-list">{sessions.map((session) => <article key={session.id}><span><Navigation size={18} /></span><div><strong>{session.startedAt ? formatDateTime(session.startedAt.toDate()) : "Baru dimulai"}</strong><small>{session.pointCount || 0} titik • {session.lastAccuracy ? `±${Math.round(session.lastAccuracy)} m` : "menunggu GPS"}</small></div><StatusBadge status={session.status} /></article>)}</div> : <EmptyState icon={<Activity size={24} />} title="Belum ada sesi" description="Riwayat muncul setelah sesi tracking pertama." />}
        </SectionCard>
      </div>
      <div className="tracking-consent"><Check size={17} /><span>Dengan memulai sesi, kamu memahami bahwa lokasi digunakan untuk aktivitas kerja yang sedang berlangsung dan dapat dilihat oleh HR selama masa retensi perusahaan.</span></div>
    </>
  );
}
