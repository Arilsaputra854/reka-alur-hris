import { useEffect, type FormEvent, type ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose, open]);

  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <header className="modal-header">
          <div>
            <h2 id="modal-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button className="icon-button" type="button" aria-label="Tutup" onClick={onClose}><X size={20} /></button>
        </header>
        {children}
      </section>
    </div>
  );
}

export function FormField({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase().replaceAll("_", "-");
  const label: Record<string, string> = {
    active: "Aktif",
    inactive: "Nonaktif",
    valid: "Valid",
    late: "Terlambat",
    outside: "Di luar area",
    review: "Perlu review",
    draft: "Draft",
    published: "Dipublikasikan",
    finished: "Selesai",
    submitted: "Diajukan",
    approved: "Disetujui",
    rejected: "Ditolak",
    completed: "Selesai",
  };
  return <span className={`status status-${normalized}`}>{label[normalized] || status}</span>;
}

export function SubmitButton({ loading, children }: { loading?: boolean; children: ReactNode }) {
  return <button className="button button-primary" type="submit" disabled={loading}>{loading ? "Memproses…" : children}</button>;
}

export function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (error) return <div className="form-message error" role="alert">{error}</div>;
  if (success) return <div className="form-message success" role="status">{success}</div>;
  return null;
}

export function stopForm(event: FormEvent) {
  event.preventDefault();
}
