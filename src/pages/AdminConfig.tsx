import { useEffect, useState, type FormEvent } from "react";
import { Building2, Clock3, MapPin, Plus, Save, ShieldCheck } from "lucide-react";
import { addDoc, collection, doc, serverTimestamp, setDoc } from "firebase/firestore";
import { PageHeader, SectionCard } from "../Shell";
import { EmptyState, FormField, FormMessage, Modal, StatusBadge, SubmitButton } from "../components";
import { useLiveCollection } from "../data";
import { db } from "../firebase";
import { friendlyError } from "../lib";
import type { CompanySettings, Shift, WorkLocation } from "../types";

const defaultSettings: CompanySettings = {
  name: "Reka Alur Teknologi",
  address: "",
  timezone: "Asia/Jakarta",
  attendanceRadius: 150,
  faceVerification: true,
  geoTracking: false,
  payrollCutoffDay: 25,
  requestApprovalLevels: 1,
};

export function AdminConfig() {
  const settingsCollection = useLiveCollection<CompanySettings & { id: string }>("settings");
  const locations = useLiveCollection<WorkLocation>("workLocations");
  const shifts = useLiveCollection<Shift>("shifts");
  const [settings, setSettings] = useState(defaultSettings);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [shiftOpen, setShiftOpen] = useState(false);
  const [location, setLocation] = useState({ name: "", address: "", latitude: "", longitude: "", radius: "150" });
  const [shift, setShift] = useState({ name: "", start: "08:00", end: "17:00", lateTolerance: "10" });

  useEffect(() => {
    const company = settingsCollection.data.find((item) => item.id === "company");
    if (company) setSettings(company);
  }, [settingsCollection.data]);

  async function saveSettings(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await setDoc(doc(db, "settings", "company"), { ...settings, updatedAt: serverTimestamp() }, { merge: true });
      setMessage("Pengaturan perusahaan berhasil disimpan.");
    } catch (saveError) {
      setError(friendlyError(saveError));
    } finally {
      setSaving(false);
    }
  }

  async function addLocation(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = { name: location.name.trim(), address: location.address.trim(), latitude: Number(location.latitude), longitude: Number(location.longitude), radius: Number(location.radius), active: true, createdAt: serverTimestamp() };
      if (!locations.data.length) await setDoc(doc(db, "workLocations", "default"), payload);
      else await addDoc(collection(db, "workLocations"), payload);
      setLocationOpen(false);
      setLocation({ name: "", address: "", latitude: "", longitude: "", radius: "150" });
    } catch (saveError) {
      setError(friendlyError(saveError));
    } finally { setSaving(false); }
  }

  async function addShift(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await addDoc(collection(db, "shifts"), { name: shift.name.trim(), start: shift.start, end: shift.end, lateTolerance: Number(shift.lateTolerance), active: true, createdAt: serverTimestamp() });
      setShiftOpen(false);
      setShift({ name: "", start: "08:00", end: "17:00", lateTolerance: "10" });
    } catch (saveError) { setError(friendlyError(saveError)); } finally { setSaving(false); }
  }

  return (
    <>
      <PageHeader eyebrow="Workspace setup" title="Konfigurasi" description="Atur identitas perusahaan, kebijakan attendance, lokasi, dan shift." />
      <form onSubmit={saveSettings}>
        <div className="config-grid">
          <SectionCard title="Profil perusahaan" description="Ditampilkan pada admin, employee, dan slip gaji.">
            <div className="form-grid two">
              <FormField label="Nama perusahaan"><input value={settings.name} onChange={(event) => setSettings({ ...settings, name: event.target.value })} required /></FormField>
              <FormField label="Zona waktu"><select value={settings.timezone} onChange={(event) => setSettings({ ...settings, timezone: event.target.value })}><option>Asia/Jakarta</option><option>Asia/Makassar</option><option>Asia/Jayapura</option></select></FormField>
              <FormField label="Alamat perusahaan"><textarea rows={3} value={settings.address} onChange={(event) => setSettings({ ...settings, address: event.target.value })} placeholder="Alamat kantor pusat" /></FormField>
              <FormField label="Tanggal cut-off payroll"><input type="number" min="1" max="28" value={settings.payrollCutoffDay} onChange={(event) => setSettings({ ...settings, payrollCutoffDay: Number(event.target.value) })} /></FormField>
              <FormField label="Jumlah approval pengajuan"><select value={settings.requestApprovalLevels || 1} onChange={(event) => setSettings({ ...settings, requestApprovalLevels: Number(event.target.value) })}><option value="1">1 tingkat</option><option value="2">2 tingkat (admin berbeda)</option><option value="3">3 tingkat (admin berbeda)</option></select></FormField>
            </div>
          </SectionCard>
          <SectionCard title="Kebijakan verifikasi" description="Kontrol bukti yang diminta saat kehadiran.">
            <div className="setting-list">
              <label><span><ShieldCheck size={19} /><div><strong>Verifikasi wajah</strong><small>Liveness demo dan pencocokan 1:1 pada perangkat.</small></div></span><input type="checkbox" checked={settings.faceVerification} onChange={(event) => setSettings({ ...settings, faceVerification: event.target.checked })} /></label>
              <label><span><MapPin size={19} /><div><strong>Geofence attendance</strong><small>Bandingkan titik employee dengan lokasi kerja.</small></div></span><input type="checkbox" checked readOnly /></label>
            </div>
            <FormField label="Radius default (meter)"><input type="number" min="25" max="5000" value={settings.attendanceRadius} onChange={(event) => setSettings({ ...settings, attendanceRadius: Number(event.target.value) })} /></FormField>
          </SectionCard>
        </div>
        <FormMessage error={error} success={message} />
        <div className="config-save"><SubmitButton loading={saving}><Save size={17} /> Simpan perubahan</SubmitButton></div>
      </form>

      <div className="config-grid master-grid">
        <SectionCard title="Lokasi kerja" description="Titik geofence untuk memvalidasi attendance." action={<button className="button button-secondary compact" onClick={() => { setError(""); setLocationOpen(true); }}><Plus size={16} /> Lokasi</button>}>
          {locations.data.length ? <div className="master-list">{locations.data.map((item) => <article key={item.id}><span className="master-icon"><MapPin size={19} /></span><div><strong>{item.name}</strong><small>{item.address || `${item.latitude}, ${item.longitude}`}</small></div><span>{item.radius} m</span><StatusBadge status={item.active ? "active" : "inactive"} /></article>)}</div> : <EmptyState icon={<MapPin size={24} />} title="Belum ada lokasi" description="Tambahkan lokasi pertama sebelum employee melakukan attendance." />}
        </SectionCard>
        <SectionCard title="Shift kerja" description="Template jam kerja yang dapat dipakai saat menambah employee." action={<button className="button button-secondary compact" onClick={() => { setError(""); setShiftOpen(true); }}><Plus size={16} /> Shift</button>}>
          {shifts.data.length ? <div className="master-list">{shifts.data.map((item) => <article key={item.id}><span className="master-icon"><Clock3 size={19} /></span><div><strong>{item.name}</strong><small>Toleransi terlambat {item.lateTolerance} menit</small></div><span>{item.start}–{item.end}</span><StatusBadge status={item.active ? "active" : "inactive"} /></article>)}</div> : <EmptyState icon={<Clock3 size={24} />} title="Belum ada shift" description="Employee tetap dapat memakai jam kerja pada profil masing-masing." />}
        </SectionCard>
      </div>

      <Modal open={locationOpen} title="Tambah lokasi kerja" description="Ambil latitude/longitude dari Google Maps atau perangkat lokasi." onClose={() => setLocationOpen(false)}>
        <form onSubmit={addLocation}><div className="form-grid two"><FormField label="Nama lokasi"><input value={location.name} onChange={(event) => setLocation({ ...location, name: event.target.value })} required /></FormField><FormField label="Radius (meter)"><input type="number" min="25" value={location.radius} onChange={(event) => setLocation({ ...location, radius: event.target.value })} required /></FormField><FormField label="Latitude"><input type="number" step="any" value={location.latitude} onChange={(event) => setLocation({ ...location, latitude: event.target.value })} placeholder="-6.200000" required /></FormField><FormField label="Longitude"><input type="number" step="any" value={location.longitude} onChange={(event) => setLocation({ ...location, longitude: event.target.value })} placeholder="106.816666" required /></FormField><FormField label="Alamat"><textarea rows={3} value={location.address} onChange={(event) => setLocation({ ...location, address: event.target.value })} /></FormField></div><FormMessage error={error} /><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setLocationOpen(false)}>Batal</button><SubmitButton loading={saving}>Simpan lokasi</SubmitButton></div></form>
      </Modal>
      <Modal open={shiftOpen} title="Tambah shift" description="Buat template shift untuk referensi jadwal." onClose={() => setShiftOpen(false)}>
        <form onSubmit={addShift}><FormField label="Nama shift"><input value={shift.name} onChange={(event) => setShift({ ...shift, name: event.target.value })} placeholder="Regular" required /></FormField><div className="form-grid two"><FormField label="Jam masuk"><input type="time" value={shift.start} onChange={(event) => setShift({ ...shift, start: event.target.value })} /></FormField><FormField label="Jam pulang"><input type="time" value={shift.end} onChange={(event) => setShift({ ...shift, end: event.target.value })} /></FormField><FormField label="Toleransi terlambat"><input type="number" min="0" value={shift.lateTolerance} onChange={(event) => setShift({ ...shift, lateTolerance: event.target.value })} /></FormField></div><FormMessage error={error} /><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setShiftOpen(false)}>Batal</button><SubmitButton loading={saving}>Simpan shift</SubmitButton></div></form>
      </Modal>
      <div className="sr-only"><Building2 /></div>
    </>
  );
}
