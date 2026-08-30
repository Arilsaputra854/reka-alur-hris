import { useMemo } from "react";
import { collection, query, where } from "firebase/firestore";
import { CalendarDays, FileText, ShieldCheck } from "lucide-react";
import { EmptyState, StatusBadge } from "../components";
import { useAuth } from "../auth";
import { useLiveQuery } from "../data";
import { db } from "../firebase";
import { openPrivateFile } from "../privateFiles";
import { PageHeader, SectionCard } from "../Shell";
import type { EmployeeContract } from "../types";

export function EmployeeContracts(){ const {firebaseUser}=useAuth(); const contractQuery=useMemo(()=>query(collection(db,"employeeContracts"),where("employeeId","==",firebaseUser?.uid||"none")),[firebaseUser?.uid]); const {data,loading}=useLiveQuery<EmployeeContract>(contractQuery); const contracts=[...data].sort((a,b)=>b.startDate.localeCompare(a.startDate)); return <><PageHeader eyebrow="My employment" title="Kontrak saya" description="Riwayat hubungan kerja dan dokumen kontrak pribadimu."/><div className="payslip-security"><ShieldCheck size={19}/><div><strong>Dokumen privat</strong><span>Kontrak hanya dapat dibuka oleh akunmu dan administrator HR.</span></div></div><SectionCard title="Riwayat kontrak" description={`${contracts.length} dokumen`}>{loading?<div className="table-loading">Memuat kontrak…</div>:contracts.length?<div className="employee-contract-list">{contracts.map((item)=><article key={item.id}><span><FileText size={21}/></span><div><strong>{item.type} • {item.contractNumber}</strong><small><CalendarDays size={13}/>{item.startDate} — {item.endDate||"Tidak terbatas"}</small></div><StatusBadge status={item.status}/>{item.fileKey?<button className="button button-secondary compact" onClick={()=>void openPrivateFile(item.fileKey!)}>Buka dokumen</button>:<small>Dokumen belum diunggah</small>}</article>)}</div>:<EmptyState icon={<FileText size={25}/>} title="Belum ada kontrak" description="Kontrak yang diberikan HR akan muncul di sini."/>}</SectionCard></>; }
