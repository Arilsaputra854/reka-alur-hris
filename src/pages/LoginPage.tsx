import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, BadgeCheck, Copy, Eye, EyeOff, Fingerprint, MapPin, ShieldCheck, WalletCards } from "lucide-react";
import { useAuth } from "../auth";
import { friendlyError } from "../lib";
import { FormMessage } from "../components";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";

const demoAdmin = { email: "admin@rekahr.app", password: "RkH!7vQ2#M9pL4xS" };

export function LoginPage() {
  const { login, profile } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (profile) navigate(profile.role === "admin" ? "/admin" : "/employee", { replace: true });
  }, [navigate, profile]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const account = await login(email.trim(), password);
      navigate(account.role === "admin" ? "/admin" : "/employee", { replace: true });
    } catch (loginError) {
      setError(friendlyError(loginError));
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword() {
    setError("");
    setMessage("");
    if (!email.trim()) {
      setError("Masukkan email kerja terlebih dahulu untuk mengatur ulang password.");
      return;
    }
    setResetting(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setMessage("Tautan pengaturan password sudah dikirim. Periksa inbox atau folder spam.");
    } catch (resetError) {
      setError(friendlyError(resetError));
    } finally {
      setResetting(false);
    }
  }

  function useDemoAdmin() {
    setEmail(demoAdmin.email);
    setPassword(demoAdmin.password);
    setError("");
    setMessage("Kredensial admin demo sudah diisi. Tekan Masuk ke RekaHR.");
  }

  async function copyDemoAdmin() {
    await navigator.clipboard.writeText(`Email: ${demoAdmin.email}\nPassword: ${demoAdmin.password}`);
    setMessage("Kredensial admin demo berhasil disalin.");
  }

  return (
    <div className="login-page">
      <section className="login-story">
        <div className="login-brand"><div className="brand-mark large">R<span>•</span></div><span>RekaHR</span></div>
        <div className="story-content">
          <span className="story-kicker"><BadgeCheck size={16} /> HR operations, made visible</span>
          <h1>Satu alur untuk<br /><em>semua orang.</em></h1>
          <p>Kelola karyawan, kehadiran, payroll, dan aktivitas lapangan dalam ruang kerja yang tenang dan terukur.</p>
          <div className="story-features">
            <div><span><Fingerprint size={20} /></span><p><strong>Absensi terverifikasi</strong><small>Lokasi, wajah, dan waktu dalam satu bukti.</small></p></div>
            <div><span><WalletCards size={20} /></span><p><strong>Payroll terkoneksi</strong><small>Dari rekap ke slip gaji tanpa data ganda.</small></p></div>
            <div><span><MapPin size={20} /></span><p><strong>Lokasi saat absensi</strong><small>Satu titik lokasi hanya saat check-in atau check-out.</small></p></div>
          </div>
        </div>
        <footer>© 2026 Reka Alur Teknologi <span>•</span> Firebase secured</footer>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <span className="login-eyebrow">Selamat datang kembali</span>
          <h2>Masuk ke workspace</h2>
          <p>Gunakan akun yang diberikan oleh administrator perusahaan.</p>
          <div className="demo-admin-card">
            <div className="demo-admin-title"><span><ShieldCheck size={17} /></span><div><strong>Akun demo admin</strong><small>Khusus showcase — jangan gunakan untuk data produksi.</small></div></div>
            <dl><div><dt>Email</dt><dd>{demoAdmin.email}</dd></div><div><dt>Password</dt><dd>{demoAdmin.password}</dd></div></dl>
            <div className="demo-admin-actions"><button type="button" onClick={useDemoAdmin}>Isi otomatis</button><button type="button" onClick={() => void copyDemoAdmin()}><Copy size={14} /> Salin</button></div>
          </div>
          <form onSubmit={submit}>
            <label className="form-field">
              <span>Email kerja</span>
              <input type="email" autoComplete="email" placeholder="nama@perusahaan.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="form-field">
              <span>Password</span>
              <div className="password-input">
                <input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Masukkan password" value={password} onChange={(event) => setPassword(event.target.value)} required />
                <button type="button" aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </label>
            <div className="login-options"><label><input type="checkbox" /> Ingat saya</label><button type="button" onClick={() => void resetPassword()} disabled={resetting}>{resetting ? "Mengirim…" : "Lupa password?"}</button></div>
            <FormMessage error={error} success={message} />
            <button className="button button-primary login-submit" disabled={loading}>{loading ? "Memeriksa akun…" : <>Masuk ke RekaHR <ArrowRight size={18} /></>}</button>
          </form>
          <div className="login-help"><span>Butuh bantuan?</span> Hubungi administrator RekaHR di perusahaanmu.</div>
        </div>
      </section>
    </div>
  );
}
