import { useEffect, useState, type FormEvent } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { BadgeCheck, Building2, Fingerprint, KeyRound, Mail, Pencil, Phone, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../auth";
import { FormField, FormMessage, Modal, SubmitButton } from "../components";
import { auth, db } from "../firebase";
import { formatCurrency, friendlyError, initials } from "../lib";
import { PageHeader, SectionCard } from "../Shell";
import type { Employee } from "../types";

export function EmployeeProfile() {
  const { firebaseUser, profile } = useAuth();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [contact, setContact] = useState({ phone: "", emergencyContact: "" });

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

  function openEdit() { setContact({ phone: employee?.phone || "", emergencyContact: employee?.emergencyContact || "" }); setError(""); setMessage(""); setEditOpen(true); }
  async function saveContact(event: FormEvent) { event.preventDefault(); if (!firebaseUser) return; setSaving(true); setError(""); try { await updateDoc(doc(db,"employees",firebaseUser.uid),{phone:contact.phone.trim(),emergencyContact:contact.emergencyContact.trim(),updatedAt:serverTimestamp()}); setEmployee((current)=>current?{...current,...contact}:current); setEditOpen(false); setMessage("Informasi kontak berhasil diperbarui."); } catch (saveError) { setError(friendlyError(saveError)); } finally { setSaving(false); } }

  return (
    <>
      <PageHeader eyebrow="My profile" title="Profil saya" description="Data kerja yang terhubung dengan akun employee." actions={<button className="button button-secondary" onClick={openEdit}><Pencil size={16}/> Edit kontak</button>} />
      <div className="profile-hero-card"><span className="avatar profile-avatar">{initials(profile?.displayName || "User")}</span><div><h2>{profile?.displayName}</h2><p>{employee?.position || "Karyawan"} • {employee?.department || "Departemen belum diatur"}</p><span><BadgeCheck size={15} /> Akun employee aktif</span></div></div>
      <div className="config-grid">
        <SectionCard title="Informasi kerja" description="Hubungi HR jika ada data yang perlu dikoreksi.">
          <div className="profile-details"><div><UserRound size={18} /><span><small>ID karyawan</small><strong>{employee?.employeeCode || "—"}</strong></span></div><div><Mail size={18} /><span><small>Email</small><strong>{employee?.email || profile?.email}</strong></span></div><div><Phone size={18} /><span><small>Telepon</small><strong>{employee?.phone || "Belum diisi"}</strong></span></div><div><Phone size={18} /><span><small>Kontak darurat</small><strong>{employee?.emergencyContact || "Belum diisi"}</strong></span></div><div><Building2 size={18} /><span><small>Posisi</small><strong>{employee?.position || "Belum diatur"}</strong></span></div><div><Fingerprint size={18} /><span><small>Verifikasi wajah</small><strong>{employee?.faceEnrolled ? "Enrollment demo aktif" : "Belum enrollment"}</strong></span></div><div><ShieldCheck size={18} /><span><small>Gaji pokok tersimpan</small><strong>{employee ? formatCurrency(employee.baseSalary) : "—"}</strong></span></div></div>
        </SectionCard>
        <SectionCard title="Keamanan akun" description="Password dikelola oleh Firebase Authentication.">
          <div className="security-card"><span><KeyRound size={24} /></span><div><strong>Ganti password</strong><p>Kami akan mengirim tautan aman ke email yang terdaftar.</p></div><button className="button button-secondary" onClick={() => void resetPassword()}>Kirim link reset</button></div><FormMessage error={error} success={message} />
        </SectionCard>
      </div>
      <Modal open={editOpen} title="Perbarui informasi kontak" description="Data pekerjaan tetap dikelola oleh HR." onClose={()=>setEditOpen(false)}><form onSubmit={saveContact}><FormField label="Nomor telepon"><input value={contact.phone} onChange={(event)=>setContact({...contact,phone:event.target.value})} placeholder="08xxxxxxxxxx"/></FormField><FormField label="Kontak darurat"><input value={contact.emergencyContact} onChange={(event)=>setContact({...contact,emergencyContact:event.target.value})} placeholder="Nama • nomor telepon"/></FormField><FormMessage error={error}/><div className="modal-actions"><button type="button" className="button button-secondary" onClick={()=>setEditOpen(false)}>Batal</button><SubmitButton loading={saving}>Simpan kontak</SubmitButton></div></form></Modal>
    </>
  );
}
