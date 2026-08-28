import { useEffect, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { BadgeCheck, Building2, Fingerprint, KeyRound, Mail, Phone, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../auth";
import { FormMessage } from "../components";
import { auth, db } from "../firebase";
import { formatCurrency, friendlyError, initials } from "../lib";
import { PageHeader, SectionCard } from "../Shell";
import type { Employee } from "../types";

export function EmployeeProfile() {
  const { firebaseUser, profile } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseUser) return;
    void getDoc(doc(db, "employees", firebaseUser.uid)).then((snapshot) => snapshot.exists() && setEmployee({ id: snapshot.id, ...snapshot.data() } as Employee));
  }, [firebaseUser]);

  async function resetPassword() {
    if (!profile?.email) return;
    setError(""); setMessage("");
    try { await sendPasswordResetEmail(auth, profile.email); setMessage("Link perubahan password sudah dikirim ke email akun."); }
    catch (resetError) { setError(friendlyError(resetError)); }
  }

  return (
    <>
      <PageHeader eyebrow="My profile" title="Profil saya" description="Data kerja yang terhubung dengan akun employee." />
      <div className="profile-hero-card"><span className="avatar profile-avatar">{initials(profile?.displayName || "User")}</span><div><h2>{profile?.displayName}</h2><p>{employee?.position || "Karyawan"} • {employee?.department || "Departemen belum diatur"}</p><span><BadgeCheck size={15} /> Akun employee aktif</span></div></div>
      <div className="config-grid">
        <SectionCard title="Informasi kerja" description="Hubungi HR jika ada data yang perlu dikoreksi.">
          <div className="profile-details"><div><UserRound size={18} /><span><small>ID karyawan</small><strong>{employee?.employeeCode || "—"}</strong></span></div><div><Mail size={18} /><span><small>Email</small><strong>{employee?.email || profile?.email}</strong></span></div><div><Phone size={18} /><span><small>Telepon</small><strong>{employee?.phone || "Belum diisi"}</strong></span></div><div><Building2 size={18} /><span><small>Posisi</small><strong>{employee?.position || "Belum diatur"}</strong></span></div><div><Fingerprint size={18} /><span><small>Verifikasi wajah</small><strong>{employee?.faceEnrolled ? "Enrollment demo aktif" : "Belum enrollment"}</strong></span></div><div><ShieldCheck size={18} /><span><small>Gaji pokok tersimpan</small><strong>{employee ? formatCurrency(employee.baseSalary) : "—"}</strong></span></div></div>
        </SectionCard>
        <SectionCard title="Keamanan akun" description="Password dikelola oleh Firebase Authentication.">
          <div className="security-card"><span><KeyRound size={24} /></span><div><strong>Ganti password</strong><p>Kami akan mengirim tautan aman ke email yang terdaftar.</p></div><button className="button button-secondary" onClick={() => void resetPassword()}>Kirim link reset</button></div><FormMessage error={error} success={message} />
        </SectionCard>
      </div>
    </>
  );
}
