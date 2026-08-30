import { auth } from "./firebase";

const apiBase = import.meta.env.VITE_FILES_API_URL || "https://reka-alur-hris-files.arilsaputra854.workers.dev";

async function authorizedFetch(path: string, init?: RequestInit) {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error("Sesi login tidak tersedia.");
  const response = await fetch(`${apiBase}${path}`, {
    ...init,
    headers: { ...init?.headers, Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ error: "Layanan dokumen gagal memproses permintaan." })) as { error?: string };
    throw new Error(payload.error || "Layanan dokumen gagal memproses permintaan.");
  }
  return response;
}

export async function uploadPrivateFile(file: File, scope: "candidates" | "contracts", ownerId: string) {
  const response = await authorizedFetch(`/files/upload?scope=${scope}&ownerId=${encodeURIComponent(ownerId)}`, {
    method: "POST",
    headers: { "Content-Type": file.type, "X-File-Name": encodeURIComponent(file.name) },
    body: file,
  });
  return response.json() as Promise<{ key: string; fileName: string; contentType: string; size: number }>;
}

export async function openPrivateFile(key: string) {
  const preview = window.open("about:blank", "_blank");
  try {
    const response = await authorizedFetch(`/files/${encodeURIComponent(key)}`);
    const objectUrl = URL.createObjectURL(await response.blob());
    if (preview) preview.location.href = objectUrl;
    else {
      const link = document.createElement("a"); link.href = objectUrl; link.target = "_blank"; link.rel = "noopener noreferrer"; link.click();
    }
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
  } catch (error) {
    preview?.close();
    window.alert(error instanceof Error ? error.message : "Dokumen tidak dapat dibuka.");
  }
}
