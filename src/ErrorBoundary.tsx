import { Component, type ErrorInfo, type ReactNode } from "react";
import { RefreshCw, TriangleAlert } from "lucide-react";

export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error("RekaHR UI error", error, info.componentStack); }
  render() {
    if (this.state.failed) return <main className="fatal-error"><TriangleAlert size={38}/><h1>Halaman tidak dapat ditampilkan</h1><p>Data tetap aman. Muat ulang aplikasi untuk mencoba kembali.</p><button className="button button-primary" onClick={()=>window.location.reload()}><RefreshCw size={17}/> Muat ulang</button></main>;
    return this.props.children;
  }
}
