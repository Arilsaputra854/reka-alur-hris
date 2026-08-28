import { useMemo, useState, type FormEvent } from "react";
import { addDoc, collection, doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Activity, BarChart3, BriefcaseBusiness, Building2, FileText, Megaphone, Plus, Target } from "lucide-react";
import { EmptyState, FormField, FormMessage, Modal, StatusBadge, SubmitButton } from "../components";
import { useLiveCollection } from "../data";
import { db } from "../firebase";
import { friendlyError, initials } from "../lib";
import { PageHeader, SectionCard } from "../Shell";
import type { Announcement, Candidate, Employee, HrDocument, PerformanceGoal } from "../types";

type OpsTab = "organization" | "announcements" | "documents" | "performance" | "recruitment" | "audit";
type AuditLog = { id: string; action: string; entityId: string; summary: string; createdAt?: { seconds: number } };

export function AdminPeopleOps() {
  const { data: employees } = useLiveCollection<Employee>("employees");
  const { data: announcements } = useLiveCollection<Announcement>("announcements");
  const { data: documents } = useLiveCollection<HrDocument>("hrDocuments");
  const { data: goals } = useLiveCollection<PerformanceGoal>("performanceGoals");
  const { data: candidates } = useLiveCollection<Candidate>("candidates");
  const { data: auditLogs } = useLiveCollection<AuditLog>("auditLogs");
  const [tab, setTab] = useState<OpsTab>("organization");
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", body: "", audience: "all", category: "Kebijakan", url: "", employeeId: "", dueDate: "", fullName: "", email: "", position: "", notes: "" });
  const departments = useMemo(() => Object.entries(employees.filter((item) => item.status === "active").reduce<Record<string, Employee[]>>((groups, item) => { const key = item.department || "Tanpa departemen"; (groups[key] ||= []).push(item); return groups; }, {})), [employees]);

  function createFor(activeTab: OpsTab) {
    setTab(activeTab); setError(""); setForm({ title: "", body: "", audience: "all", category: "Kebijakan", url: "", employeeId: employees[0]?.id || "", dueDate: "", fullName: "", email: "", position: "", notes: "" }); setOpen(true);
  }

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError("");
    try {
      if (tab === "announcements") await addDoc(collection(db, "announcements"), { title: form.title.trim(), body: form.body.trim(), audience: form.audience, active: true, createdAt: serverTimestamp() });
      if (tab === "documents") { if (!/^https:\/\//i.test(form.url.trim())) throw new Error("URL dokumen harus memakai HTTPS."); await addDoc(collection(db, "hrDocuments"), { title: form.title.trim(), category: form.category.trim(), url: form.url.trim(), audience: form.audience, active: true, createdAt: serverTimestamp() }); }
      if (tab === "performance") {
        const employee = employees.find((item) => item.id === form.employeeId); if (!employee) throw new Error("Pilih karyawan.");
        await addDoc(collection(db, "performanceGoals"), { employeeId: employee.id, employeeName: employee.fullName, title: form.title.trim(), description: form.body.trim(), dueDate: form.dueDate, progress: 0, status: "active", createdAt: serverTimestamp() });
      }
      if (tab === "recruitment") await addDoc(collection(db, "candidates"), { fullName: form.fullName.trim(), email: form.email.trim(), position: form.position.trim(), stage: "applied", notes: form.notes.trim(), createdAt: serverTimestamp() });
      setOpen(false);
    } catch (submitError) { setError(friendlyError(submitError)); } finally { setSaving(false); }
  }

  return <>
    <PageHeader eyebrow="People operations" title="Organisasi & talent" description="Kelola komunikasi, dokumen, sasaran kinerja, dan pipeline kandidat." />
    <div className="tab-bar ops-tabs">{([['organization','Organisasi'],['announcements','Pengumuman'],['documents','Dokumen'],['performance','Kinerja'],['recruitment','Recruitment'],['audit','Audit']] as Array<[OpsTab,string]>).map(([value,label]) => <button key={value} className={tab === value ? "active" : ""} onClick={() => setTab(value)}>{label}</button>)}</div>

    {tab === "organization" && <SectionCard title="Struktur organisasi" description={`${employees.filter((item) => item.status === "active").length} karyawan aktif dalam ${departments.length} departemen`}><div className="org-grid">{departments.map(([department, members]) => <article key={department}><header><span><Building2 size={18} /></span><div><strong>{department}</strong><small>{members?.length || 0} anggota</small></div></header><div>{members?.map((employee) => <p key={employee.id}><span className="avatar soft">{initials(employee.fullName)}</span><span><strong>{employee.fullName}</strong><small>{employee.position}</small></span></p>)}</div></article>)}</div></SectionCard>}
    {tab === "announcements" && <SectionCard title="Pengumuman perusahaan" description="Informasi tampil pada workspace karyawan." action={<button className="button button-primary compact" onClick={() => createFor("announcements")}><Plus size={16}/> Pengumuman</button>}>{announcements.length ? <div className="ops-list">{announcements.map((item) => <article key={item.id}><span><Megaphone size={19}/></span><div><strong>{item.title}</strong><p>{item.body}</p><small>Audience: {item.audience}</small></div><StatusBadge status={item.active ? "active" : "inactive"}/></article>)}</div> : <EmptyState icon={<Megaphone size={24}/>} title="Belum ada pengumuman" description="Publikasikan informasi pertama untuk seluruh karyawan."/>}</SectionCard>}
    {tab === "documents" && <SectionCard title="Dokumen & kebijakan" description="Pusat tautan SOP, kontrak, formulir, dan kebijakan." action={<button className="button button-primary compact" onClick={() => createFor("documents")}><Plus size={16}/> Dokumen</button>}>{documents.length ? <div className="ops-list">{documents.map((item) => <article key={item.id}><span><FileText size={19}/></span><div><strong>{item.title}</strong><p>{item.category}</p><a href={item.url} target="_blank" rel="noreferrer">Buka dokumen</a></div><StatusBadge status={item.active ? "active" : "inactive"}/></article>)}</div> : <EmptyState icon={<FileText size={24}/>} title="Belum ada dokumen" description="Tambahkan tautan dokumen perusahaan yang dapat diakses employee."/>}</SectionCard>}
    {tab === "performance" && <SectionCard title="KPI & sasaran" description="Tetapkan sasaran dan pantau progres employee." action={<button className="button button-primary compact" onClick={() => createFor("performance")}><Plus size={16}/> Sasaran</button>}>{goals.length ? <div className="goal-list">{goals.map((item) => <article key={item.id}><span><Target size={19}/></span><div><strong>{item.title}</strong><small>{item.employeeName} • target {item.dueDate}</small><div className="progress-track"><i style={{width:`${item.progress}%`}}/></div></div><b>{item.progress}%</b><StatusBadge status={item.status}/></article>)}</div> : <EmptyState icon={<BarChart3 size={24}/>} title="Belum ada sasaran" description="Buat KPI atau sasaran kerja pertama."/>}</SectionCard>}
    {tab === "recruitment" && <SectionCard title="Pipeline kandidat" description="Kelola kandidat dari lamaran hingga onboarding." action={<button className="button button-primary compact" onClick={() => createFor("recruitment")}><Plus size={16}/> Kandidat</button>}>{candidates.length ? <div className="candidate-board">{candidates.map((item) => <article key={item.id}><span className="avatar soft">{initials(item.fullName)}</span><div><strong>{item.fullName}</strong><small>{item.position} • {item.email}</small><p>{item.notes}</p></div><select value={item.stage} onChange={(event) => void updateDoc(doc(db,"candidates",item.id),{stage:event.target.value,updatedAt:serverTimestamp()})}><option value="applied">Applied</option><option value="screening">Screening</option><option value="interview">Interview</option><option value="offer">Offer</option><option value="hired">Hired / onboarding</option><option value="rejected">Rejected</option></select></article>)}</div> : <EmptyState icon={<BriefcaseBusiness size={24}/>} title="Pipeline kosong" description="Tambahkan kandidat untuk memulai proses recruitment."/>}</SectionCard>}
    {tab === "audit" && <SectionCard title="Audit aktivitas" description="Jejak perubahan penting yang dilakukan admin dan workflow.">{auditLogs.length ? <div className="ops-list">{[...auditLogs].sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).slice(0,100).map((item)=><article key={item.id}><span><Activity size={19}/></span><div><strong>{item.summary}</strong><p>{item.action}</p><small>Entity: {item.entityId}</small></div></article>)}</div> : <EmptyState icon={<Activity size={24}/>} title="Audit masih kosong" description="Aktivitas penting akan tercatat otomatis."/>}</SectionCard>}

    <Modal open={open} title={tab === "announcements" ? "Buat pengumuman" : tab === "documents" ? "Tambah dokumen" : tab === "performance" ? "Buat sasaran kinerja" : "Tambah kandidat"} onClose={() => setOpen(false)}><form onSubmit={submit}>
      {tab === "announcements" && <><FormField label="Judul"><input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} required/></FormField><FormField label="Isi"><textarea rows={5} value={form.body} onChange={(e)=>setForm({...form,body:e.target.value})} required/></FormField><FormField label="Audience"><select value={form.audience} onChange={(e)=>setForm({...form,audience:e.target.value})}><option value="all">Semua</option><option value="employee">Employee</option><option value="admin">Admin</option></select></FormField></>}
      {tab === "documents" && <><div className="form-grid two"><FormField label="Judul"><input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} required/></FormField><FormField label="Kategori"><input value={form.category} onChange={(e)=>setForm({...form,category:e.target.value})} required/></FormField></div><FormField label="URL dokumen"><input type="url" value={form.url} onChange={(e)=>setForm({...form,url:e.target.value})} placeholder="https://..." required/></FormField><FormField label="Audience"><select value={form.audience} onChange={(e)=>setForm({...form,audience:e.target.value})}><option value="all">Semua</option><option value="employee">Employee</option><option value="admin">Admin</option></select></FormField></>}
      {tab === "performance" && <><FormField label="Karyawan"><select value={form.employeeId} onChange={(e)=>setForm({...form,employeeId:e.target.value})} required>{employees.filter((item)=>item.status==="active").map((item)=><option key={item.id} value={item.id}>{item.fullName}</option>)}</select></FormField><FormField label="Judul sasaran"><input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} required/></FormField><FormField label="Deskripsi"><textarea rows={3} value={form.body} onChange={(e)=>setForm({...form,body:e.target.value})}/></FormField><FormField label="Target selesai"><input type="date" value={form.dueDate} onChange={(e)=>setForm({...form,dueDate:e.target.value})} required/></FormField></>}
      {tab === "recruitment" && <><div className="form-grid two"><FormField label="Nama kandidat"><input value={form.fullName} onChange={(e)=>setForm({...form,fullName:e.target.value})} required/></FormField><FormField label="Email"><input type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} required/></FormField><FormField label="Posisi"><input value={form.position} onChange={(e)=>setForm({...form,position:e.target.value})} required/></FormField></div><FormField label="Catatan"><textarea rows={3} value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})}/></FormField></>}
      <FormMessage error={error}/><div className="modal-actions"><button type="button" className="button button-secondary" onClick={()=>setOpen(false)}>Batal</button><SubmitButton loading={saving}>Simpan</SubmitButton></div>
    </form></Modal>
  </>;
}
