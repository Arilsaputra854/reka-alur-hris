import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { collection, query, where } from "firebase/firestore";
import {
  Bell,
  BookOpenCheck,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  FileText,
  FileCheck2,
  Gauge,
  LogOut,
  MapPinned,
  Menu,
  Settings,
  ShieldCheck,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useAuth } from "./auth";
import { initials } from "./lib";
import { useLiveCollection, useLiveQuery } from "./data";
import { db } from "./firebase";
import type { Announcement, EmployeeRequest } from "./types";

type Icon = ComponentType<{ size?: number; strokeWidth?: number }>;

const adminNav: Array<{ label: string; to: string; icon: Icon }> = [
  { label: "Overview", to: "/admin", icon: Gauge },
  { label: "Karyawan", to: "/admin/karyawan", icon: Users },
  { label: "Kehadiran", to: "/admin/kehadiran", icon: Clock3 },
  { label: "Pengajuan", to: "/admin/pengajuan", icon: FileCheck2 },
  { label: "People Ops", to: "/admin/people-ops", icon: BriefcaseBusiness },
  { label: "Geo tracking", to: "/admin/tracking", icon: MapPinned },
  { label: "Penggajian", to: "/admin/payroll", icon: CircleDollarSign },
  { label: "Konfigurasi", to: "/admin/konfigurasi", icon: Settings },
];

const employeeNav: Array<{ label: string; to: string; icon: Icon }> = [
  { label: "Beranda", to: "/employee", icon: Gauge },
  { label: "Pengajuan", to: "/employee/pengajuan", icon: FileCheck2 },
  { label: "Workspace", to: "/employee/workspace", icon: BookOpenCheck },
  { label: "Riwayat", to: "/employee/riwayat", icon: CalendarDays },
  { label: "Tracking", to: "/employee/tracking", icon: MapPinned },
  { label: "Slip gaji", to: "/employee/slip-gaji", icon: WalletCards },
  { label: "Profil", to: "/employee/profil", icon: Users },
];

export function AppShell({ type, children }: { type: "admin" | "employee"; children: ReactNode }) {
  const { profile, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const location = useLocation();
  const nav = type === "admin" ? adminNav : employeeNav;
  const notificationQuery = useMemo(() => type === "admin"
    ? query(collection(db, "requests"))
    : query(collection(db, "requests"), where("employeeId", "==", profile?.employeeId || profile?.id || "none")), [profile?.employeeId, profile?.id, type]);
  const { data: requestNotifications } = useLiveQuery<EmployeeRequest>(notificationQuery);
  const { data: announcementNotifications } = useLiveCollection<Announcement>("announcements");
  const notifications = useMemo(() => [...requestNotifications]
    .filter((item) => type === "admin" ? item.status === "submitted" : true)
    .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    .slice(0, 5), [requestNotifications, type]);
  const announcements = useMemo(() => type === "employee" ? [...announcementNotifications].filter((item) => item.active && item.audience !== "admin").sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0)).slice(0,3) : [], [announcementNotifications, type]);
  const notificationCount = notifications.length + announcements.length;

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
    setNotificationOpen(false);
  }, [location.pathname]);
  useEffect(() => { const sync = () => setOnline(navigator.onLine); window.addEventListener("online", sync); window.addEventListener("offline", sync); return () => { window.removeEventListener("online", sync); window.removeEventListener("offline", sync); }; }, []);

  const sidebar = (
    <>
      <div className="brand">
        <div className="brand-mark">R<span>•</span></div>
        <div><strong>RekaHR</strong><small>people, in flow.</small></div>
      </div>
      <nav className="side-nav" aria-label="Navigasi utama">
        <span className="nav-eyebrow">{type === "admin" ? "Workspace HR" : "Employee space"}</span>
        {nav.map(({ label, to, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === `/${type}`} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            <Icon size={19} strokeWidth={1.9} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-card">
        <ShieldCheck size={20} />
        <div><strong>Firebase secured</strong><small>Data tersimpan pada project terpisah.</small></div>
      </div>
      <div className="sidebar-footer">
        <span className="avatar small">{initials(profile?.displayName || "User")}</span>
        <div><strong>{profile?.displayName}</strong><small>{type === "admin" ? "Administrator" : "Karyawan"}</small></div>
        <button className="icon-button ghost" aria-label="Keluar" onClick={() => void logout()}><LogOut size={18} /></button>
      </div>
    </>
  );

  return (
    <div className={`app-shell ${type}`}>
      <aside className="sidebar">{sidebar}</aside>
      {mobileOpen && <div className="mobile-drawer-backdrop" onClick={() => setMobileOpen(false)} />}
      <aside className={`mobile-drawer ${mobileOpen ? "open" : ""}`}>
        <button className="icon-button drawer-close" onClick={() => setMobileOpen(false)} aria-label="Tutup menu"><X size={20} /></button>
        {sidebar}
      </aside>
      <section className="main-column">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu" aria-label="Buka menu" onClick={() => setMobileOpen(true)}><Menu size={21} /></button>
            <div className="topbar-company">
              <span className="company-dot" />
              <span>Reka Alur Teknologi</span>
              <ChevronDown size={15} />
            </div>
          </div>
          <div className="topbar-actions">
            <div className="notification-wrap">
              <button className="icon-button notification-button" aria-label="Notifikasi" aria-expanded={notificationOpen} onClick={() => { setNotificationOpen((value) => !value); setProfileOpen(false); }}><Bell size={19} />{notificationCount > 0 && <i />}</button>
              {notificationOpen && <div className="notification-menu"><header><strong>Notifikasi</strong><span>{notificationCount} terbaru</span></header>{notificationCount ? <div>{announcements.map((item) => <NavLink key={`announcement-${item.id}`} to="/employee/workspace"><span className="notification-state approved"><Bell size={16}/></span><p><strong>{item.title}</strong><small>Pengumuman perusahaan</small></p></NavLink>)}{notifications.map((item) => <NavLink key={item.id} to={type === "admin" ? "/admin/pengajuan" : "/employee/pengajuan"}><span className={`notification-state ${item.status}`}><FileCheck2 size={16} /></span><p><strong>{type === "admin" ? item.employeeName : item.requestType}</strong><small>{type === "admin" ? `${item.requestType} menunggu keputusan` : `Status: ${item.status === "submitted" ? "menunggu persetujuan" : item.status === "approved" ? "disetujui" : "ditolak"}`}</small></p></NavLink>)}</div> : <p className="notification-empty">Belum ada notifikasi baru.</p>}<NavLink className="notification-all" to={type === "admin" ? "/admin/pengajuan" : "/employee/workspace"}>Buka pusat aktivitas</NavLink></div>}
            </div>
            <div className="profile-menu-wrap">
              <button className="profile-button" onClick={() => { setProfileOpen((value) => !value); setNotificationOpen(false); }}>
                <span className="avatar">{initials(profile?.displayName || "User")}</span>
                <span className="profile-label"><strong>{profile?.displayName}</strong><small>{profile?.email}</small></span>
                <ChevronDown size={16} />
              </button>
              {profileOpen && (
                <div className="profile-menu">
                  <div><strong>{profile?.displayName}</strong><small>{profile?.email}</small></div>
                  <button onClick={() => void logout()}><LogOut size={17} /> Keluar dari akun</button>
                </div>
              )}
            </div>
          </div>
        </header>
        {!online && <div className="offline-banner">Kamu sedang offline. Perubahan akan tersedia kembali setelah koneksi pulih.</div>}
        <main className="page-content">{children}</main>
        {type === "employee" && (
          <nav className="bottom-nav" aria-label="Navigasi karyawan">
            {employeeNav.filter((item) => ["/employee", "/employee/pengajuan", "/employee/workspace", "/employee/slip-gaji", "/employee/profil"].includes(item.to)).map(({ label, to, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === "/employee"} className={({ isActive }) => isActive ? "active" : ""}>
                <Icon size={20} /><span>{label}</span>
              </NavLink>
            ))}
          </nav>
        )}
      </section>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <span className="page-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

export function MetricCard({ label, value, delta, icon: Icon, tone = "navy" }: { label: string; value: string | number; delta?: string; icon: Icon; tone?: string }) {
  return (
    <article className="metric-card">
      <div className={`metric-icon ${tone}`}><Icon size={20} /></div>
      <div className="metric-copy"><span>{label}</span><strong>{value}</strong>{delta && <small>{delta}</small>}</div>
    </article>
  );
}

export function SectionCard({ title, description, action, children, className = "" }: { title?: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`section-card ${className}`}>
      {(title || action) && (
        <header className="section-header">
          <div>{title && <h2>{title}</h2>}{description && <p>{description}</p>}</div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}

export function FlowHint({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="flow-hint">
      <FileText size={18} />
      <div><strong>{title}</strong><p>{children}</p></div>
    </aside>
  );
}
