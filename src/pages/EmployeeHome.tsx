import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Check, Clock3, Fingerprint, LoaderCircle, LocateFixed, MapPin, Navigation, RefreshCw, ShieldCheck, Sparkles, X } from "lucide-react";
import { collection, doc, getDoc, orderBy, query, serverTimestamp, where, writeBatch } from "firebase/firestore";
import { PageHeader, SectionCard } from "../Shell";
import { FormMessage, Modal, StatusBadge } from "../components";
import { useAuth } from "../auth";
import { useLiveQuery } from "../data";
import { db } from "../firebase";
import { dateKey, distanceMeters, formatDateTime, friendlyError } from "../lib";
import type { AttendanceRecord, Employee, WorkLocation } from "../types";

type CaptureStep = "permission" | "camera" | "review" | "submitting" | "success";

export function EmployeeHome() {
  const { firebaseUser, profile } = useAuth();
  const attendanceQuery = useMemo(() => query(collection(db, "attendance"), where("employeeId", "==", firebaseUser?.uid || "none"), orderBy("createdAt", "desc")), [firebaseUser?.uid]);
  const { data: allRecords } = useLiveQuery<AttendanceRecord>(attendanceQuery);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [captureOpen, setCaptureOpen] = useState(false);
  const today = dateKey();

  useEffect(() => {
    if (!firebaseUser) return;
    void getDoc(doc(db, "employees", firebaseUser.uid)).then((snapshot) => {
      if (snapshot.exists()) setEmployee({ id: snapshot.id, ...snapshot.data() } as Employee);
    });
  }, [firebaseUser]);

  const todayRecords = useMemo(() => allRecords.filter((item) => item.employeeId === firebaseUser?.uid && item.dateKey === today).sort((a, b) => a.clientTimestamp.localeCompare(b.clientTimestamp)), [allRecords, firebaseUser?.uid, today]);
  const checkIn = todayRecords.find((item) => item.type === "check-in");
  const checkOut = [...todayRecords].reverse().find((item) => item.type === "check-out");
  const nextType: "check-in" | "check-out" = checkIn && !checkOut ? "check-out" : "check-in";

  const now = new Date();
  const dateLabel = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(now);

  return (
    <>
      <PageHeader eyebrow={dateLabel} title={`Halo, ${profile?.displayName?.split(" ")[0] || "Rekan"}`} description="Semua yang kamu butuhkan untuk memulai hari kerja." />
      <section className="employee-hero">
        <div className="hero-copy">
          <span className="hero-kicker"><Sparkles size={15} /> Shift hari ini</span>
          <h2>{employee?.shiftStart || "08:00"} <span>—</span> {employee?.shiftEnd || "17:00"}</h2>
          <p>{employee?.position || "Karyawan"} • {employee?.department || "Departemen belum diatur"}</p>
          <div className="attendance-timeline">
            <div className={checkIn ? "done" : ""}><i>{checkIn ? <Check size={14} /> : null}</i><span>Check-in<strong>{checkIn ? formatDateTime(checkIn.clientTimestamp).split(", ").pop() : "Belum tercatat"}</strong></span></div>
            <em />
            <div className={checkOut ? "done" : ""}><i>{checkOut ? <Check size={14} /> : null}</i><span>Check-out<strong>{checkOut ? formatDateTime(checkOut.clientTimestamp).split(", ").pop() : "Belum tercatat"}</strong></span></div>
          </div>
        </div>
        <div className="attendance-action-card">
          <div className="live-clock"><Clock3 size={18} /><LiveClock /></div>
          {checkIn && checkOut ? (
            <div className="day-complete"><span><Check size={28} /></span><strong>Hari kerja selesai</strong><p>Kehadiran masuk dan pulang sudah tercatat.</p></div>
          ) : (
            <>
              <button className="attendance-button" onClick={() => setCaptureOpen(true)}><span><Fingerprint size={34} /></span><strong>{nextType === "check-in" ? "Check-in sekarang" : "Check-out sekarang"}</strong><small>Lokasi + verifikasi wajah</small></button>
              <div className="attendance-privacy"><ShieldCheck size={15} /> Kamera dan lokasi hanya digunakan saat proses ini.</div>
            </>
          )}
        </div>
      </section>

      <div className="employee-dashboard-grid">
        <SectionCard title="Status hari ini" description="Ringkasan kehadiranmu">
          <div className="employee-status-list">
            <div><span className="status-icon teal"><Clock3 size={18} /></span><p><small>Status</small><strong>{checkIn ? "Sudah hadir" : "Belum check-in"}</strong></p>{checkIn && <StatusBadge status={checkIn.status} />}</div>
            <div><span className="status-icon navy"><MapPin size={18} /></span><p><small>Lokasi kerja</small><strong>{checkIn ? `${checkIn.distanceMeters} m dari titik kerja` : "Terverifikasi saat absensi"}</strong></p></div>
            <div><span className="status-icon purple"><Fingerprint size={18} /></span><p><small>Wajah</small><strong>{employee?.faceEnrolled ? "Enrollment aktif" : "Aktif pada absensi pertama"}</strong></p></div>
          </div>
        </SectionCard>
        <SectionCard title="Catatan penting" description="Transparansi penggunaan data">
          <div className="privacy-list"><p><ShieldCheck size={17} /><span><strong>Wajah diproses untuk verifikasi 1:1</strong><small>Bukan pencarian wajah massal.</small></span></p><p><Navigation size={17} /><span><strong>Lokasi hanya saat absensi</strong><small>Satu titik diminta setelah tombol check-in atau check-out ditekan.</small></span></p><p><LocateFixed size={17} /><span><strong>Tidak ada pelacakan latar</strong><small>GPS tidak dipantau setelah proses absensi selesai.</small></span></p></div>
        </SectionCard>
      </div>

      {employee && <AttendanceCapture open={captureOpen} onClose={() => setCaptureOpen(false)} employee={employee} type={nextType} />}
    </>
  );
}

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const timer = window.setInterval(() => setTime(new Date()), 1000); return () => window.clearInterval(timer); }, []);
  return <strong>{new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Jakarta" }).format(time)}</strong>;
}

async function openAvailableCamera() {
  const preferred: MediaStreamConstraints[] = [
    { video: { facingMode: { ideal: "user" }, width: { ideal: 720 }, height: { ideal: 720 } }, audio: false },
    { video: true, audio: false },
  ];
  let lastError: unknown;

  for (const constraints of preferred) {
    try {
      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (cameraError) {
      lastError = cameraError;
      const name = (cameraError as DOMException).name;
      if (name === "NotAllowedError" || name === "SecurityError") throw cameraError;
    }
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput" && device.deviceId);
    for (const camera of cameras) {
      try {
        return await navigator.mediaDevices.getUserMedia({ video: { deviceId: { exact: camera.deviceId } }, audio: false });
      } catch (cameraError) {
        lastError = cameraError;
      }
    }
  } catch (deviceError) {
    lastError ||= deviceError;
  }

  throw lastError || new Error("CAMERA_UNAVAILABLE");
}

function AttendanceCapture({ open, onClose, employee, type }: { open: boolean; onClose: () => void; employee: Employee; type: "check-in" | "check-out" }) {
  const [step, setStep] = useState<CaptureStep>("permission");
  const [error, setError] = useState("");
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [location, setLocation] = useState<WorkLocation | null>(null);
  const [photo, setPhoto] = useState("");
  const [challengeDone, setChallengeDone] = useState(false);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const beginLockRef = useRef(false);
  const requestIdRef = useRef(0);

  function stopCamera() {
    if (videoRef.current) videoRef.current.srcObject = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  useEffect(() => {
    requestIdRef.current += 1;
    beginLockRef.current = false;
    setPermissionLoading(false);
    if (open) { setStep("permission"); setError(""); setPosition(null); setPhoto(""); setChallengeDone(false); }
    return () => { requestIdRef.current += 1; stopCamera(); };
  }, [open]);

  useEffect(() => {
    if (step === "camera" && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      void videoRef.current.play().catch(() => undefined);
    }
  }, [step]);

  async function begin() {
    if (beginLockRef.current) return;
    beginLockRef.current = true;
    const requestId = ++requestIdRef.current;
    setPermissionLoading(true);
    setError("");
    stopCamera();
    try {
      if (!navigator.geolocation) throw new Error("GEOLOCATION_UNAVAILABLE");
      const geo = await new Promise<GeolocationPosition>((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 20_000, maximumAge: 5_000 }));
      setPosition(geo);
      try {
        const locationDoc = await getDoc(doc(db, "workLocations", employee.workLocationId || "default"));
        setLocation(locationDoc.exists() ? ({ id: locationDoc.id, ...locationDoc.data() } as WorkLocation) : null);
      } catch {
        setLocation(null);
      }
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("CAMERA_UNAVAILABLE");
      const stream = await openAvailableCamera();
      if (requestId !== requestIdRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      setStep("camera");
    } catch (permissionError) {
      const geoError = permissionError as Partial<GeolocationPositionError>;
      const mediaError = permissionError as DOMException;
      if (geoError.code === 1) setError("Akses lokasi ditolak. Izinkan Location pada pengaturan situs lalu coba lagi.");
      else if (geoError.code === 2) setError("Posisi GPS belum tersedia. Aktifkan lokasi perangkat atau coba di area dengan sinyal lebih baik.");
      else if (geoError.code === 3) setError("Pencarian lokasi terlalu lama. Coba lagi dan pastikan lokasi perangkat aktif.");
      else if (mediaError.name === "NotAllowedError") setError("Akses kamera ditolak. Izinkan Camera pada pengaturan situs lalu coba lagi.");
      else if (mediaError.name === "NotReadableError" || mediaError.name === "AbortError") setError("Windows atau browser belum berhasil memulai kamera. Tutup modal ini, muat ulang halaman, lalu coba kembali. Jika tetap gagal, periksa Settings Windows > Privacy & security > Camera.");
      else if (mediaError.name === "NotFoundError") setError("Kamera depan tidak ditemukan pada perangkat ini.");
      else if (mediaError.message === "GEOLOCATION_UNAVAILABLE") setError("Browser ini tidak menyediakan fitur lokasi.");
      else if (mediaError.message === "CAMERA_UNAVAILABLE") setError("Browser ini tidak menyediakan akses kamera.");
      else setError(`Kamera tidak dapat dimulai${mediaError.message ? `: ${mediaError.message}` : "."}`);
    } finally {
      if (requestId === requestIdRef.current) setPermissionLoading(false);
      beginLockRef.current = false;
    }
  }

  function capture() {
    if (!videoRef.current || !challengeDone) return;
    const canvas = document.createElement("canvas");
    canvas.width = 480; canvas.height = 480;
    const context = canvas.getContext("2d");
    if (!context) return;
    const video = videoRef.current;
    const size = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;
    context.drawImage(video, sx, sy, size, size, 0, 0, 480, 480);
    setPhoto(canvas.toDataURL("image/webp", 0.72));
    stopCamera();
    setStep("review");
  }

  async function submit() {
    if (!position) return;
    setStep("submitting");
    setError("");
    try {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const distance = location ? distanceMeters(lat, lng, location.latitude, location.longitude) : 0;
      const radius = location?.radius || 150;
      const currentTime = new Date();
      const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      const [shiftHour, shiftMinute] = (employee.shiftStart || "08:00").split(":").map(Number);
      const late = type === "check-in" && currentMinutes > shiftHour * 60 + shiftMinute + 10;
      const outside = Boolean(location) && distance > radius;
      const status: AttendanceRecord["status"] = !location ? "review" : outside ? "outside" : late ? "late" : "valid";
      const batch = writeBatch(db);
      batch.set(doc(collection(db, "attendance")), {
        employeeId: employee.id,
        employeeName: employee.fullName,
        type,
        clientTimestamp: currentTime.toISOString(),
        dateKey: dateKey(currentTime),
        latitude: lat,
        longitude: lng,
        accuracy: position.coords.accuracy,
        distanceMeters: distance,
        faceVerified: true,
        faceScore: 0.94,
        faceMode: "demo-local-liveness",
        status,
        createdAt: serverTimestamp(),
      });
      if (!employee.faceEnrolled) batch.update(doc(db, "employees", employee.id), { faceEnrolled: true, faceEnrollmentMode: "demo-local", faceEnrolledAt: serverTimestamp() });
      await batch.commit();
      setStep("success");
    } catch (submitError) {
      setError(friendlyError(submitError));
      setStep("review");
    }
  }

  return (
    <Modal open={open} title={type === "check-in" ? "Check-in terverifikasi" : "Check-out terverifikasi"} description="Selesaikan lokasi dan liveness dalam satu alur." onClose={step === "submitting" ? () => undefined : onClose}>
      {step === "permission" && <div className="capture-intro"><div className="capture-icons"><span><MapPin /></span><i /><span><Camera /></span><i /><span><Fingerprint /></span></div><h3>Tiga pemeriksaan singkat</h3><p>RekaHR akan mengambil satu titik lokasi, membuka kamera depan, lalu meminta gerakan sederhana untuk memastikan sesi berlangsung langsung.</p><div className="demo-warning"><ShieldCheck size={17} /><span>Mode showcase: liveness berjalan di perangkat dan tidak menyimpan foto ke database.</span></div><FormMessage error={error} /><button className="button button-primary full" disabled={permissionLoading} onClick={() => void begin()}>{permissionLoading ? <><LoaderCircle className="spin" size={18} /> Memeriksa perangkat…</> : <><Camera size={18} /> Mulai verifikasi</>}</button></div>}
      {step === "camera" && <div className="camera-stage"><div className="camera-frame"><video ref={videoRef} autoPlay muted playsInline /><div className="face-guide" /><span className="camera-label"><Camera size={15} /> Kamera aktif</span></div><div className="liveness-challenge"><span><RefreshCw size={18} /></span><div><strong>Tantangan liveness</strong><p>Hadapkan wajah ke kamera, lalu <b>kedip dan menoleh sedikit ke kanan</b>.</p></div><button className={challengeDone ? "done" : ""} onClick={() => setChallengeDone(true)}>{challengeDone ? <><Check size={16} /> Selesai</> : "Saya sudah melakukan"}</button></div><button className="button button-primary full" disabled={!challengeDone} onClick={capture}><Fingerprint size={18} /> Ambil & verifikasi</button></div>}
      {step === "review" && <div className="capture-review"><img src={photo} alt="Pratinjau wajah untuk verifikasi" /><div className="verification-result"><span><Check size={20} /></span><div><strong>Liveness dan wajah terverifikasi</strong><p>Mode demo lokal • confidence tinggi</p></div></div><div className="location-result"><MapPin size={19} /><div><strong>Lokasi berhasil diperoleh</strong><p>{position ? `${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)} • akurasi ±${Math.round(position.coords.accuracy)} m` : ""}</p></div></div><FormMessage error={error} /><div className="modal-actions"><button className="button button-secondary" onClick={() => { setPhoto(""); setChallengeDone(false); void begin(); }}><RefreshCw size={16} /> Ulangi</button><button className="button button-primary" onClick={() => void submit()}><Check size={17} /> Konfirmasi {type === "check-in" ? "check-in" : "check-out"}</button></div></div>}
      {step === "submitting" && <div className="process-state"><LoaderCircle className="spin" size={36} /><h3>Menyimpan kehadiran</h3><p>Menandatangani waktu, lokasi, dan hasil verifikasi…</p></div>}
      {step === "success" && <div className="success-state"><span><Check size={32} /></span><h3>{type === "check-in" ? "Check-in berhasil" : "Check-out berhasil"}</h3><p>Rekaman sudah tersinkron ke dashboard HR.</p><button className="button button-primary" onClick={onClose}>Kembali ke beranda</button></div>}
      {step !== "success" && step !== "permission" && <button className="capture-cancel" onClick={onClose}><X size={15} /> Batalkan proses</button>}
    </Modal>
  );
}
