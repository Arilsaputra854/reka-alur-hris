import { useMemo, useState, type DragEvent, type FormEvent } from "react";
import { deleteApp, initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, inMemoryPersistence, setPersistence } from "firebase/auth";
import { collection, doc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { FileText, GripVertical, Plus, Search, UserCheck } from "lucide-react";
import { FormField, FormMessage, Modal, SubmitButton } from "../components";
import { useLiveCollection } from "../data";
import { db, firebaseConfig } from "../firebase";
import { friendlyError, generatePassword, initials } from "../lib";
import { openPrivateFile, uploadPrivateFile } from "../privateFiles";
import { PageHeader } from "../Shell";
import type { Candidate, Employee } from "../types";

const stages = [
  { id: "applied", label: "Baru masuk", tone: "slate" },
  { id: "screening", label: "Screening", tone: "blue" },
  { id: "interview", label: "Interview", tone: "amber" },
  { id: "offer", label: "Penawaran", tone: "purple" },
  { id: "hired", label: "Diterima", tone: "green" },
  { id: "rejected", label: "Ditolak", tone: "red" },
] as const;

type Stage = Candidate["stage"];
const emptyCandidate = { fullName: "", email: "", phone: "", position: "", source: "LinkedIn", experienceYears: "0", expectedSalary: "", skills: "", notes: "" };

export function AdminRecruitment() {
  const { data: candidates, loading } = useLiveCollection<Candidate>("candidates");
  const { data: employees } = useLiveCollection<Employee>("employees");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyCandidate);
  const [cv, setCv] = useState<File | null>(null);
  const [convertCandidate, setConvertCandidate] = useState<Candidate | null>(null);
  const filtered = useMemo(() => candidates.filter((item) => `${item.fullName} ${item.position} ${item.email}`.toLowerCase().includes(search.toLowerCase())), [candidates, search]);

  async function createCandidate(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    const candidateRef = doc(collection(db, "candidates"));
    try {
      let cvData: { key: string; fileName: string } | null = null;
      if (cv) cvData = await uploadPrivateFile(cv, "candidates", candidateRef.id);
      await setDoc(candidateRef, {
        fullName: form.fullName.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim(), position: form.position.trim(), source: form.source.trim(),
        experienceYears: Math.max(0, Number(form.experienceYears) || 0), expectedSalary: Math.max(0, Number(form.expectedSalary) || 0),
        skills: form.skills.split(",").map((item) => item.trim()).filter(Boolean), notes: form.notes.trim(), stage: "applied",
        ...(cvData ? { cvKey: cvData.key, cvName: cvData.fileName } : {}), createdAt: serverTimestamp(),
      });
      setOpen(false); setForm(emptyCandidate); setCv(null);
    } catch (submitError) { setError(friendlyError(submitError)); } finally { setSaving(false); }
  }

  async function moveCandidate(candidate: Candidate, stage: Stage) {
    if (candidate.stage === stage) return;
    await updateDoc(doc(db, "candidates", candidate.id), { stage, updatedAt: serverTimestamp() });
  }

  function allowDrop(event: DragEvent) { event.preventDefault(); event.dataTransfer.dropEffect = "move"; }
  function drop(event: DragEvent, stage: Stage) {
    event.preventDefault();
    const candidate = candidates.find((item) => item.id === event.dataTransfer.getData("text/candidate-id"));
    if (candidate) void moveCandidate(candidate, stage);
  }

  return <>
    <PageHeader eyebrow="Talent acquisition" title="Recruitment pipeline" description="Kanban kandidat dari lamaran, screening, interview, penawaran, hingga menjadi karyawan." actions={<button className="button button-primary" onClick={() => { setError(""); setOpen(true); }}><Plus size={17}/> Tambah kandidat</button>} />
    <div className="recruitment-toolbar"><div className="search-box"><Search size={18}/><input placeholder="Cari kandidat atau posisi…" value={search} onChange={(event)=>setSearch(event.target.value)}/></div><span>{filtered.length} kandidat • {employees.length} master karyawan</span></div>
    {loading ? <div className="table-loading">Memuat pipeline…</div> : <div className="kanban-board">{stages.map((stage) => {
      const items = filtered.filter((item) => item.stage === stage.id);
      return <section className={`kanban-column ${stage.tone}`} key={stage.id} onDragOver={allowDrop} onDrop={(event)=>drop(event, stage.id)}>
        <header><div><i/><strong>{stage.label}</strong></div><span>{items.length}</span></header>
        <div>{items.map((candidate) => <article className="candidate-card" key={candidate.id} draggable onDragStart={(event)=>event.dataTransfer.setData("text/candidate-id", candidate.id)}>
          <div className="candidate-card-head"><span className="avatar soft">{initials(candidate.fullName)}</span><div><strong>{candidate.fullName}</strong><small>{candidate.position}</small></div><GripVertical size={16}/></div>
          <p>{candidate.email}{candidate.phone ? ` • ${candidate.phone}` : ""}</p>
          {!!candidate.skills?.length && <div className="skill-chips">{candidate.skills.slice(0,3).map((skill)=><span key={skill}>{skill}</span>)}</div>}
          <footer><span>{candidate.source || "Direct"}</span><div>{candidate.cvKey && <button title="Buka CV" onClick={()=>void openPrivateFile(candidate.cvKey!)}><FileText size={15}/></button>}{candidate.stage === "hired" && !candidate.hiredEmployeeId && <button className="hire-action" title="Jadikan karyawan" onClick={()=>setConvertCandidate(candidate)}><UserCheck size={15}/></button>}</div></footer>
        </article>)}</div>
        {!items.length && <p className="kanban-empty">Tarik kandidat ke tahap ini</p>}
      </section>;
    })}</div>}

    <Modal open={open} title="Tambah kandidat" description="Simpan profil, pengalaman, dan CV kandidat ke pipeline." onClose={()=>setOpen(false)}><form onSubmit={createCandidate}>
      <div className="form-grid two"><FormField label="Nama lengkap"><input value={form.fullName} onChange={(e)=>setForm({...form,fullName:e.target.value})} required/></FormField><FormField label="Email"><input type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required/></FormField><FormField label="Telepon"><input value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})}/></FormField><FormField label="Posisi dilamar"><input value={form.position} onChange={(e)=>setForm({...form,position:e.target.value})} required/></FormField><FormField label="Sumber kandidat"><input value={form.source} onChange={(e)=>setForm({...form,source:e.target.value})}/></FormField><FormField label="Pengalaman (tahun)"><input type="number" min="0" value={form.experienceYears} onChange={(e)=>setForm({...form,experienceYears:e.target.value})}/></FormField><FormField label="Ekspektasi gaji"><input type="number" min="0" value={form.expectedSalary} onChange={(e)=>setForm({...form,expectedSalary:e.target.value})}/></FormField><FormField label="Keahlian" hint="Pisahkan dengan koma"><input value={form.skills} onChange={(e)=>setForm({...form,skills:e.target.value})} placeholder="React, Payroll, Excel"/></FormField></div>
      <FormField label="CV kandidat" hint="PDF, DOC, atau DOCX • maksimal 8 MB"><input type="file" accept=".pdf,.doc,.docx,application/pdf" onChange={(e)=>setCv(e.target.files?.[0] || null)}/></FormField><FormField label="Catatan recruiter"><textarea rows={3} value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})}/></FormField>
      <FormMessage error={error}/><div className="modal-actions"><button type="button" className="button button-secondary" onClick={()=>setOpen(false)}>Batal</button><SubmitButton loading={saving}>Simpan kandidat</SubmitButton></div>
    </form></Modal>
    {convertCandidate && <ConvertCandidateModal candidate={convertCandidate} onClose={()=>setConvertCandidate(null)}/>} 
  </>;
}

function ConvertCandidateModal({ candidate, onClose }: { candidate: Candidate; onClose: () => void }) {
  const [form, setForm] = useState({ employeeCode: `RAT-${String(Date.now()).slice(-4)}`, department: "", position: candidate.position, joinDate: new Date().toISOString().slice(0,10), baseSalary: String(candidate.expectedSalary || ""), allowance: "0", password: generatePassword() });
  const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  async function convert(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    const secondaryApp = initializeApp(firebaseConfig, `candidate-hire-${Date.now()}`);
    try {
      const secondaryAuth = getAuth(secondaryApp); await setPersistence(secondaryAuth, inMemoryPersistence);
      const credential = await createUserWithEmailAndPassword(secondaryAuth, candidate.email, form.password);
      const employee = { employeeCode: form.employeeCode.trim(), fullName: candidate.fullName, email: candidate.email, phone: candidate.phone || "", department: form.department.trim(), position: form.position.trim(), status: "active", joinDate: form.joinDate, shiftStart: "08:00", shiftEnd: "17:00", workLocationId: "default", baseSalary: Math.round(Number(form.baseSalary)||0), allowance: Math.round(Number(form.allowance)||0), annualLeaveQuota: 12, annualLeaveUsed: 0, taxRate: 0, bpjsHealthRate: 1, bpjsEmploymentRate: 3, faceEnrolled: false, recruitmentCandidateId: candidate.id, createdAt: serverTimestamp() };
      await setDoc(doc(db,"employees",credential.user.uid),employee);
      await setDoc(doc(db,"users",credential.user.uid),{email:candidate.email,displayName:candidate.fullName,role:"employee",active:true,employeeId:credential.user.uid,createdAt:serverTimestamp()});
      await updateDoc(doc(db,"candidates",candidate.id),{stage:"hired",hiredEmployeeId:credential.user.uid,hiredAt:serverTimestamp(),updatedAt:serverTimestamp()});
      await setDoc(doc(collection(db,"auditLogs")),{action:"candidate.converted_to_employee",entityId:credential.user.uid,summary:`${candidate.fullName} diterima dan masuk master karyawan`,createdAt:serverTimestamp()});
      await navigator.clipboard.writeText(`Email: ${candidate.email}\nPassword sementara: ${form.password}`);
      window.alert("Karyawan berhasil dibuat. Kredensial login sudah disalin."); onClose();
    } catch (convertError) { setError(friendlyError(convertError)); } finally { await deleteApp(secondaryApp); setSaving(false); }
  }
  return <Modal open title={`Terima ${candidate.fullName}`} description="Buat akun dan profil master karyawan dari data recruitment." onClose={onClose}><form onSubmit={convert}><div className="form-grid two"><FormField label="ID karyawan"><input value={form.employeeCode} onChange={(e)=>setForm({...form,employeeCode:e.target.value})} required/></FormField><FormField label="Departemen"><input value={form.department} onChange={(e)=>setForm({...form,department:e.target.value})} required/></FormField><FormField label="Jabatan"><input value={form.position} onChange={(e)=>setForm({...form,position:e.target.value})} required/></FormField><FormField label="Tanggal bergabung"><input type="date" value={form.joinDate} onChange={(e)=>setForm({...form,joinDate:e.target.value})} required/></FormField><FormField label="Gaji pokok"><input type="number" min="0" value={form.baseSalary} onChange={(e)=>setForm({...form,baseSalary:e.target.value})} required/></FormField><FormField label="Tunjangan tetap"><input type="number" min="0" value={form.allowance} onChange={(e)=>setForm({...form,allowance:e.target.value})}/></FormField><FormField label="Password sementara" hint="Kredensial otomatis disalin setelah akun dibuat."><div className="input-action"><input value={form.password} minLength={8} onChange={(e)=>setForm({...form,password:e.target.value})} required/><button type="button" onClick={()=>setForm({...form,password:generatePassword()})}>Generate</button></div></FormField></div><FormMessage error={error}/><div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Batal</button><SubmitButton loading={saving}>Buat master karyawan</SubmitButton></div></form></Modal>;
}
