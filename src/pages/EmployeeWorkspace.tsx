import { useMemo, useState } from "react";
import { collection, doc, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { BookOpenCheck, ExternalLink, FileText, Megaphone, Target } from "lucide-react";
import { useAuth } from "../auth";
import { EmptyState, FormMessage, StatusBadge } from "../components";
import { useLiveCollection, useLiveQuery } from "../data";
import { db } from "../firebase";
import { friendlyError } from "../lib";
import { PageHeader, SectionCard } from "../Shell";
import type { Announcement, HrDocument, PerformanceGoal } from "../types";

export function EmployeeWorkspace() {
  const { firebaseUser } = useAuth();
  const { data: announcements } = useLiveCollection<Announcement>("announcements");
  const { data: documents } = useLiveCollection<HrDocument>("hrDocuments");
  const goalQuery = useMemo(() => query(collection(db, "performanceGoals"), where("employeeId", "==", firebaseUser?.uid || "none")), [firebaseUser?.uid]);
  const { data: goals } = useLiveQuery<PerformanceGoal>(goalQuery);
  return <>
    <PageHeader eyebrow="Company hub" title="Workspace saya" description="Informasi perusahaan, dokumen kerja, dan sasaran dalam satu tempat." />
    <div className="workspace-grid">
      <SectionCard title="Pengumuman" description="Informasi terbaru dari perusahaan">
        {announcements.filter((item)=>item.active && item.audience !== "admin").length ? <div className="announcement-feed">{announcements.filter((item)=>item.active && item.audience !== "admin").sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).map((item)=><article key={item.id}><span><Megaphone size={18}/></span><div><strong>{item.title}</strong><p>{item.body}</p></div></article>)}</div> : <EmptyState icon={<Megaphone size={24}/>} title="Belum ada pengumuman" description="Informasi perusahaan akan muncul di sini."/>}
      </SectionCard>
      <SectionCard title="Dokumen perusahaan" description="SOP, kebijakan, dan formulir">
        {documents.filter((item)=>item.active && item.audience !== "admin").length ? <div className="document-list">{documents.filter((item)=>item.active && item.audience !== "admin").map((item)=><a key={item.id} href={item.url} target="_blank" rel="noreferrer"><span><FileText size={18}/></span><p><strong>{item.title}</strong><small>{item.category}</small></p><ExternalLink size={15}/></a>)}</div> : <EmptyState icon={<BookOpenCheck size={24}/>} title="Belum ada dokumen" description="Dokumen yang dibagikan HR akan tampil di sini."/>}
      </SectionCard>
    </div>
    <SectionCard title="Sasaran kinerja" description="Perbarui progres agar HR dan atasan melihat perkembangan terkini.">
      {goals.length ? <div className="employee-goals">{goals.map((goal)=><GoalProgress key={goal.id} goal={goal}/>)}</div> : <EmptyState icon={<Target size={25}/>} title="Belum ada sasaran" description="Sasaran yang ditetapkan HR akan muncul di sini."/>}
    </SectionCard>
  </>;
}

function GoalProgress({ goal }: { goal: PerformanceGoal }) {
  const [progress, setProgress] = useState(goal.progress);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  async function save() { setSaving(true); setError(""); try { await updateDoc(doc(db,"performanceGoals",goal.id),{progress,status:progress>=100?"completed":"active",updatedAt:serverTimestamp()}); } catch (saveError) { setError(friendlyError(saveError)); } finally { setSaving(false); } }
  return <article><span><Target size={20}/></span><div><div className="goal-title"><strong>{goal.title}</strong><StatusBadge status={progress>=100?"completed":"active"}/></div><p>{goal.description}</p><small>Target {goal.dueDate}</small><div className="goal-control"><input type="range" min="0" max="100" step="5" value={progress} onChange={(event)=>setProgress(Number(event.target.value))}/><b>{progress}%</b><button className="button button-secondary compact" disabled={saving || progress===goal.progress} onClick={()=>void save()}>{saving?"Menyimpan…":"Simpan progres"}</button></div><FormMessage error={error}/></div></article>;
}
