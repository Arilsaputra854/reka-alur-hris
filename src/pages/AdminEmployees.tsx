import { useMemo, useState, type FormEvent } from "react";
import { deleteApp, initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, inMemoryPersistence, setPersistence } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { addDoc, collection, doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { Copy, Eye, EyeOff, KeyRound, MoreHorizontal, Plus, Search, UserPlus, Users } from "lucide-react";
import { PageHeader, SectionCard } from "../Shell";
import { EmptyState, FormField, FormMessage, Modal, StatusBadge, SubmitButton } from "../components";
import { useLiveCollection } from "../data";
import { db, firebaseConfig, functions } from "../firebase";
import { formatCurrency, friendlyError, generatePassword, initials } from "../lib";
import type { Employee } from "../types";

interface EmployeeForm {
  employeeCode: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  joinDate: string;
  shiftStart: string;
  shiftEnd: string;
  baseSalary: string;
  allowance: string;
  annualLeaveQuota: string;
  taxRate: string;
  bpjsHealthRate: string;
  bpjsEmploymentRate: string;
  password: string;
}

const initialForm: EmployeeForm = {
  employeeCode: "",
  fullName: "",
  email: "",
  phone: "",
  department: "",
  position: "",
  joinDate: new Date().toISOString().slice(0, 10),
  shiftStart: "08:00",
  shiftEnd: "17:00",
  baseSalary: "",
  allowance: "0",
  annualLeaveQuota: "12",
  taxRate: "0",
  bpjsHealthRate: "1",
  bpjsEmploymentRate: "3",
  password: "",
};

export function AdminEmployees() {
  const { data: employees, loading } = useLiveCollection<Employee>("employees");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<EmployeeForm>(initialForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);
  const [editing, setEditing] = useState<Employee | null>(null);

  const filtered = useMemo(() => employees.filter((employee) => `${employee.fullName} ${employee.email} ${employee.employeeCode} ${employee.department}`.toLowerCase().includes(search.toLowerCase())), [employees, search]);

  function openCreate() {
    setForm({ ...initialForm, password: generatePassword() });
    setCreatedCredentials(null);
    setError("");
    setOpen(true);
  }

  function patch<K extends keyof EmployeeForm>(key: K, value: EmployeeForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function createEmployee(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const secondaryApp = initializeApp(firebaseConfig, `employee-create-${Date.now()}`);
    try {
      const secondaryAuth = getAuth(secondaryApp);
      await setPersistence(secondaryAuth, inMemoryPersistence);
      const credential = await createUserWithEmailAndPassword(secondaryAuth, form.email.trim(), form.password);
      const employee: Omit<Employee, "id"> = {
        employeeCode: form.employeeCode.trim(),
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        department: form.department.trim(),
        position: form.position.trim(),
        status: "active",
        joinDate: form.joinDate,
        shiftStart: form.shiftStart,
        shiftEnd: form.shiftEnd,
        workLocationId: "default",
        baseSalary: Math.round(Number(form.baseSalary) || 0),
        allowance: Math.round(Number(form.allowance) || 0),
        annualLeaveQuota: Math.max(0, Math.round(Number(form.annualLeaveQuota) || 0)),
        annualLeaveUsed: 0,
        taxRate: Math.max(0, Number(form.taxRate) || 0),
        bpjsHealthRate: Math.max(0, Number(form.bpjsHealthRate) || 0),
        bpjsEmploymentRate: Math.max(0, Number(form.bpjsEmploymentRate) || 0),
        faceEnrolled: false,
        createdAt: serverTimestamp() as never,
      };
      await setDoc(doc(db, "employees", credential.user.uid), employee);
      await setDoc(doc(db, "users", credential.user.uid), {
        email: employee.email,
        displayName: employee.fullName,
        role: "employee",
        active: true,
        employeeId: credential.user.uid,
        createdAt: serverTimestamp(),
      });
      await addDoc(collection(db, "auditLogs"), {
        action: "employee.created",
        entityId: credential.user.uid,
        summary: `${employee.fullName} ditambahkan sebagai karyawan`,
        createdAt: serverTimestamp(),
      });
      setCreatedCredentials({ email: employee.email, password: form.password });
    } catch (createError) {
      setError(friendlyError(createError));
    } finally {
      await deleteApp(secondaryApp);
      setSaving(false);
    }
  }

  async function toggleStatus(employee: Employee) {
    const nextStatus = employee.status === "active" ? "inactive" : "active";
    await updateDoc(doc(db, "employees", employee.id), { status: nextStatus, updatedAt: serverTimestamp() });
    await updateDoc(doc(db, "users", employee.id), { active: nextStatus === "active", updatedAt: serverTimestamp() });
  }

  async function copyCredentials() {
    if (!createdCredentials) return;
    await navigator.clipboard.writeText(`Email: ${createdCredentials.email}\nPassword sementara: ${createdCredentials.password}`);
  }

  return (
    <>
      <PageHeader eyebrow="People directory" title="Karyawan" description="Kelola profil, akses employee, jadwal, dan komponen gaji dasar." actions={<button className="button button-primary" onClick={openCreate}><Plus size={17} /> Tambah karyawan</button>} />
      <SectionCard>
        <div className="table-toolbar">
          <div className="search-box"><Search size={18} /><input placeholder="Cari nama, email, ID, departemen…" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
          <div className="table-count">{filtered.length} karyawan</div>
        </div>
        {loading ? <div className="table-loading">Memuat data karyawan…</div> : filtered.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Karyawan</th><th>ID</th><th>Departemen</th><th>Jabatan</th><th>Gaji pokok</th><th>Status</th><th aria-label="Aksi" /></tr></thead>
              <tbody>{filtered.map((employee) => (
                <tr key={employee.id}>
                  <td><div className="person-cell"><span className="avatar soft">{initials(employee.fullName)}</span><div><strong>{employee.fullName}</strong><small>{employee.email}</small></div></div></td>
                  <td><span className="mono">{employee.employeeCode}</span></td>
                  <td>{employee.department || "—"}</td>
                  <td>{employee.position || "—"}</td>
                  <td>{formatCurrency(employee.baseSalary)}</td>
                  <td><StatusBadge status={employee.status} /></td>
                  <td><button className="icon-button" title="Edit karyawan" onClick={() => setEditing(employee)}><MoreHorizontal size={18} /></button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <EmptyState icon={<Users size={25} />} title={search ? "Karyawan tidak ditemukan" : "Belum ada karyawan"} description={search ? "Coba kata kunci lain." : "Tambahkan karyawan pertama. Sistem akan membuat akun employee dan password sementara."} action={!search ? <button className="button button-primary" onClick={openCreate}><UserPlus size={17} /> Tambah karyawan</button> : undefined} />}
      </SectionCard>

      <Modal open={open} title={createdCredentials ? "Akun karyawan berhasil dibuat" : "Tambah karyawan"} description={createdCredentials ? "Salin kredensial dan kirimkan melalui kanal yang aman." : "Data ini menjadi profil employee dan dasar payroll."} onClose={() => setOpen(false)}>
        {createdCredentials ? (
          <div className="credential-result">
            <div className="success-orb"><KeyRound size={26} /></div>
            <div className="credential-box"><div><span>Email</span><strong>{createdCredentials.email}</strong></div><div><span>Password sementara</span><strong className="mono">{createdCredentials.password}</strong></div></div>
            <div className="modal-actions"><button className="button button-secondary" onClick={() => void copyCredentials()}><Copy size={17} /> Salin kredensial</button><button className="button button-primary" onClick={() => setOpen(false)}>Selesai</button></div>
          </div>
        ) : (
          <form onSubmit={createEmployee}>
            <div className="form-grid two">
              <FormField label="ID karyawan"><input value={form.employeeCode} onChange={(event) => patch("employeeCode", event.target.value)} placeholder="RAT-001" required /></FormField>
              <FormField label="Nama lengkap"><input value={form.fullName} onChange={(event) => patch("fullName", event.target.value)} placeholder="Nama karyawan" required /></FormField>
              <FormField label="Email login"><input type="email" value={form.email} onChange={(event) => patch("email", event.target.value)} placeholder="nama@perusahaan.com" required /></FormField>
              <FormField label="Nomor telepon"><input value={form.phone} onChange={(event) => patch("phone", event.target.value)} placeholder="08xxxxxxxxxx" /></FormField>
              <FormField label="Departemen"><input value={form.department} onChange={(event) => patch("department", event.target.value)} placeholder="Operations" required /></FormField>
              <FormField label="Jabatan"><input value={form.position} onChange={(event) => patch("position", event.target.value)} placeholder="Staff" required /></FormField>
              <FormField label="Tanggal bergabung"><input type="date" value={form.joinDate} onChange={(event) => patch("joinDate", event.target.value)} required /></FormField>
              <FormField label="Password sementara" hint="Karyawan dapat menggantinya setelah login."><div className="input-action"><input value={form.password} onChange={(event) => patch("password", event.target.value)} required minLength={8} /><button type="button" onClick={() => patch("password", generatePassword())}>Generate</button></div></FormField>
              <FormField label="Jam masuk"><input type="time" value={form.shiftStart} onChange={(event) => patch("shiftStart", event.target.value)} required /></FormField>
              <FormField label="Jam pulang"><input type="time" value={form.shiftEnd} onChange={(event) => patch("shiftEnd", event.target.value)} required /></FormField>
              <FormField label="Gaji pokok"><input type="number" min="0" value={form.baseSalary} onChange={(event) => patch("baseSalary", event.target.value)} placeholder="5000000" required /></FormField>
              <FormField label="Tunjangan tetap"><input type="number" min="0" value={form.allowance} onChange={(event) => patch("allowance", event.target.value)} /></FormField>
              <FormField label="Jatah cuti tahunan"><input type="number" min="0" value={form.annualLeaveQuota} onChange={(event) => patch("annualLeaveQuota", event.target.value)} required /></FormField>
              <FormField label="Tarif PPh 21 efektif (%)" hint="Isi sesuai kategori TER/PTKP karyawan."><input type="number" min="0" max="34" step="0.01" value={form.taxRate} onChange={(event) => patch("taxRate", event.target.value)} /></FormField>
              <FormField label="BPJS Kesehatan pekerja (%)"><input type="number" min="0" max="10" step="0.01" value={form.bpjsHealthRate} onChange={(event) => patch("bpjsHealthRate", event.target.value)} /></FormField>
              <FormField label="BPJS TK pekerja (%)"><input type="number" min="0" max="10" step="0.01" value={form.bpjsEmploymentRate} onChange={(event) => patch("bpjsEmploymentRate", event.target.value)} /></FormField>
            </div>
            <FormMessage error={error} />
            <div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setOpen(false)}>Batal</button><SubmitButton loading={saving}>Buat akun karyawan</SubmitButton></div>
          </form>
        )}
      </Modal>
      {editing && <EditEmployeeModal employee={editing} onClose={() => setEditing(null)} onToggleStatus={() => void toggleStatus(editing).then(() => setEditing(null))} />}
    </>
  );
}

function EditEmployeeModal({ employee, onClose, onToggleStatus }: { employee: Employee; onClose: () => void; onToggleStatus: () => void }) {
  const [form, setForm] = useState({
    fullName: employee.fullName,
    phone: employee.phone || "",
    department: employee.department || "",
    position: employee.position || "",
    shiftStart: employee.shiftStart || "08:00",
    shiftEnd: employee.shiftEnd || "17:00",
    baseSalary: String(employee.baseSalary || 0),
    allowance: String(employee.allowance || 0),
    annualLeaveQuota: String(employee.annualLeaveQuota ?? 12),
    taxRate: String(employee.taxRate ?? 0),
    bpjsHealthRate: String(employee.bpjsHealthRate ?? 1),
    bpjsEmploymentRate: String(employee.bpjsEmploymentRate ?? 3),
  });
  const [saving, setSaving] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState(() => generatePassword());
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError(""); setMessage("");
    try {
      await updateDoc(doc(db, "employees", employee.id), { ...form, baseSalary: Math.round(Number(form.baseSalary) || 0), allowance: Math.round(Number(form.allowance) || 0), annualLeaveQuota: Math.max(0, Math.round(Number(form.annualLeaveQuota) || 0)), taxRate: Math.max(0, Number(form.taxRate) || 0), bpjsHealthRate: Math.max(0, Number(form.bpjsHealthRate) || 0), bpjsEmploymentRate: Math.max(0, Number(form.bpjsEmploymentRate) || 0), updatedAt: serverTimestamp() });
      await updateDoc(doc(db, "users", employee.id), { displayName: form.fullName, updatedAt: serverTimestamp() });
      onClose();
    } catch (saveError) { setError(friendlyError(saveError)); } finally { setSaving(false); }
  }

  async function setEmployeePassword() {
    setResettingPassword(true);
    setError("");
    setMessage("");
    try {
      const changePassword = httpsCallable<{ employeeId: string; password: string }, { success: boolean }>(functions, "setEmployeePassword");
      await changePassword({ employeeId: employee.id, password: newPassword });
      setMessage(`Password ${employee.fullName} berhasil diperbarui. Sesi login lamanya telah dicabut.`);
    } catch (resetError) {
      setError(friendlyError(resetError));
    } finally {
      setResettingPassword(false);
    }
  }

  return (
    <Modal open title={`Edit ${employee.fullName}`} description={`${employee.employeeCode} • ${employee.email}`} onClose={onClose}>
      <form onSubmit={save}><div className="form-grid two"><FormField label="Nama lengkap"><input value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} required /></FormField><FormField label="Nomor telepon"><input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></FormField><FormField label="Departemen"><input value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })} required /></FormField><FormField label="Jabatan"><input value={form.position} onChange={(event) => setForm({ ...form, position: event.target.value })} required /></FormField><FormField label="Jam masuk"><input type="time" value={form.shiftStart} onChange={(event) => setForm({ ...form, shiftStart: event.target.value })} /></FormField><FormField label="Jam pulang"><input type="time" value={form.shiftEnd} onChange={(event) => setForm({ ...form, shiftEnd: event.target.value })} /></FormField><FormField label="Gaji pokok"><input type="number" min="0" value={form.baseSalary} onChange={(event) => setForm({ ...form, baseSalary: event.target.value })} /></FormField><FormField label="Tunjangan tetap"><input type="number" min="0" value={form.allowance} onChange={(event) => setForm({ ...form, allowance: event.target.value })} /></FormField><FormField label="Jatah cuti tahunan"><input type="number" min="0" value={form.annualLeaveQuota} onChange={(event) => setForm({ ...form, annualLeaveQuota: event.target.value })} /></FormField><FormField label="Tarif PPh 21 efektif (%)"><input type="number" min="0" max="34" step="0.01" value={form.taxRate} onChange={(event) => setForm({ ...form, taxRate: event.target.value })} /></FormField><FormField label="BPJS Kesehatan pekerja (%)"><input type="number" min="0" max="10" step="0.01" value={form.bpjsHealthRate} onChange={(event) => setForm({ ...form, bpjsHealthRate: event.target.value })} /></FormField><FormField label="BPJS TK pekerja (%)"><input type="number" min="0" max="10" step="0.01" value={form.bpjsEmploymentRate} onChange={(event) => setForm({ ...form, bpjsEmploymentRate: event.target.value })} /></FormField></div><div className="password-reset-panel"><span><KeyRound size={20} /></span><div className="password-reset-content"><strong>Atur password langsung</strong><p>Tentukan password baru untuk {employee.email}. Password tidak disimpan dan sesi lama akan dicabut.</p><div className="input-action"><input type={showPassword ? "text" : "password"} value={newPassword} minLength={8} autoComplete="new-password" aria-label="Password baru karyawan" onChange={(event) => setNewPassword(event.target.value)} /><button type="button" title={showPassword ? "Sembunyikan password" : "Tampilkan password"} onClick={() => setShowPassword((current) => !current)}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button><button type="button" onClick={() => setNewPassword(generatePassword())}>Generate</button><button type="button" title="Salin password" onClick={() => void navigator.clipboard.writeText(newPassword)}><Copy size={15} /></button></div></div><button type="button" className="button button-secondary compact" disabled={resettingPassword || newPassword.length < 8} onClick={() => void setEmployeePassword()}>{resettingPassword ? "Menyimpan…" : "Atur password"}</button></div><FormMessage error={error} success={message} /><div className="modal-actions split-actions"><button type="button" className="button button-danger-ghost" onClick={onToggleStatus}>{employee.status === "active" ? "Nonaktifkan akun" : "Aktifkan akun"}</button><span /><button type="button" className="button button-secondary" onClick={onClose}>Batal</button><SubmitButton loading={saving}>Simpan perubahan</SubmitButton></div></form>
    </Modal>
  );
}
