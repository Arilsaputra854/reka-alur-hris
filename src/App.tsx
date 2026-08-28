import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { LoaderCircle, ShieldAlert } from "lucide-react";
import { useAuth } from "./auth";
import { AppShell } from "./Shell";
import { LoginPage } from "./pages/LoginPage";
import { AdminOverview } from "./pages/AdminOverview";
import { AdminEmployees } from "./pages/AdminEmployees";
import { AdminAttendance } from "./pages/AdminAttendance";
import { AdminTracking } from "./pages/AdminTracking";
import { AdminPayroll } from "./pages/AdminPayroll";
import { AdminConfig } from "./pages/AdminConfig";
import { EmployeeHome } from "./pages/EmployeeHome";
import { EmployeeHistory } from "./pages/EmployeeHistory";
import { EmployeeTracking } from "./pages/EmployeeTracking";
import { EmployeePayslips } from "./pages/EmployeePayslips";
import { EmployeeProfile } from "./pages/EmployeeProfile";
import { AdminRequests } from "./pages/AdminRequests";
import { EmployeeRequests } from "./pages/EmployeeRequests";
import type { Role } from "./types";

function Protected({ role, children }: { role: Role; children: React.ReactNode }) {
  const { firebaseUser, profile, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="app-loading"><div className="brand-mark large">R<span>•</span></div><LoaderCircle className="spin" size={24} /><span>Menyiapkan workspace…</span></div>;
  if (!firebaseUser) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!profile) return <div className="account-error"><ShieldAlert size={34} /><h1>Profil belum tersedia</h1><p>Akun Firebase ini belum terhubung dengan profil RekaHR. Hubungi administrator.</p></div>;
  if (!profile.active) return <div className="account-error"><ShieldAlert size={34} /><h1>Akun dinonaktifkan</h1><p>Akses workspace telah dinonaktifkan. Hubungi administrator perusahaan.</p></div>;
  if (profile.role !== role) return <Navigate to={profile.role === "admin" ? "/admin" : "/employee"} replace />;
  return <>{children}</>;
}

function AdminLayout({ children }: { children: React.ReactNode }) {
  return <Protected role="admin"><AppShell type="admin">{children}</AppShell></Protected>;
}

function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return <Protected role="employee"><AppShell type="employee">{children}</AppShell></Protected>;
}

export default function App() {
  const { profile, loading } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminLayout><AdminOverview /></AdminLayout>} />
      <Route path="/admin/karyawan" element={<AdminLayout><AdminEmployees /></AdminLayout>} />
      <Route path="/admin/kehadiran" element={<AdminLayout><AdminAttendance /></AdminLayout>} />
      <Route path="/admin/pengajuan" element={<AdminLayout><AdminRequests /></AdminLayout>} />
      <Route path="/admin/tracking" element={<AdminLayout><AdminTracking /></AdminLayout>} />
      <Route path="/admin/payroll" element={<AdminLayout><AdminPayroll /></AdminLayout>} />
      <Route path="/admin/konfigurasi" element={<AdminLayout><AdminConfig /></AdminLayout>} />
      <Route path="/employee" element={<EmployeeLayout><EmployeeHome /></EmployeeLayout>} />
      <Route path="/employee/riwayat" element={<EmployeeLayout><EmployeeHistory /></EmployeeLayout>} />
      <Route path="/employee/pengajuan" element={<EmployeeLayout><EmployeeRequests /></EmployeeLayout>} />
      <Route path="/employee/tracking" element={<EmployeeLayout><EmployeeTracking /></EmployeeLayout>} />
      <Route path="/employee/slip-gaji" element={<EmployeeLayout><EmployeePayslips /></EmployeeLayout>} />
      <Route path="/employee/profil" element={<EmployeeLayout><EmployeeProfile /></EmployeeLayout>} />
      <Route path="/" element={loading ? <div className="app-loading"><LoaderCircle className="spin" size={24} /></div> : <Navigate to={profile ? (profile.role === "admin" ? "/admin" : "/employee") : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
