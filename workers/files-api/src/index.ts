import { createRemoteJWKSet, jwtVerify } from "jose";

interface Env {
  FILES: R2Bucket;
  FIREBASE_PROJECT_ID: string;
  ALLOWED_ORIGINS: string;
}

type Account = { uid: string; role: "admin" | "employee"; active: boolean };
const googleKeys = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
const allowedTypes = new Set(["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"]);

function corsHeaders(request: Request, env: Env) {
  const origin = request.headers.get("Origin") || "";
  const allowed = env.ALLOWED_ORIGINS.split(",").map((item) => item.trim());
  return {
    "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : allowed[0],
    "Access-Control-Allow-Headers": "Authorization, Content-Type, X-File-Name",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(request: Request, env: Env, body: unknown, status = 200) {
  return Response.json(body, { status, headers: corsHeaders(request, env) });
}

async function authenticate(request: Request, env: Env): Promise<Account> {
  const token = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) throw new Response("Unauthorized", { status: 401 });
  const { payload } = await jwtVerify(token, googleKeys, {
    issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
    audience: env.FIREBASE_PROJECT_ID,
  });
  if (!payload.sub) throw new Response("Unauthorized", { status: 401 });
  const profileResponse = await fetch(`https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/users/${payload.sub}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!profileResponse.ok) throw new Response("Forbidden", { status: 403 });
  const profile = await profileResponse.json() as { fields?: Record<string, { stringValue?: string; booleanValue?: boolean }> };
  const role = profile.fields?.role?.stringValue;
  if (role !== "admin" && role !== "employee") throw new Response("Forbidden", { status: 403 });
  return { uid: payload.sub, role, active: profile.fields?.active?.booleanValue !== false };
}

function safeName(name: string) {
  return name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "document.pdf";
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    if (url.pathname === "/health") return json(request, env, { ok: true, service: "rekahr-files" });
    try {
      const account = await authenticate(request, env);
      if (!account.active) return json(request, env, { error: "Akun tidak aktif." }, 403);

      if (request.method === "POST" && url.pathname === "/files/upload") {
        if (account.role !== "admin") return json(request, env, { error: "Hanya admin yang dapat mengunggah dokumen." }, 403);
        const scope = url.searchParams.get("scope");
        const ownerId = url.searchParams.get("ownerId")?.trim();
        const fileName = safeName(decodeURIComponent(request.headers.get("X-File-Name") || "document.pdf"));
        const contentType = request.headers.get("Content-Type") || "application/octet-stream";
        const contentLength = Number(request.headers.get("Content-Length") || 0);
        if (!ownerId || !["candidates", "contracts"].includes(scope || "")) return json(request, env, { error: "Target dokumen tidak valid." }, 400);
        if (!allowedTypes.has(contentType)) return json(request, env, { error: "Gunakan file PDF, DOC, atau DOCX." }, 415);
        if (contentLength > 8 * 1024 * 1024) return json(request, env, { error: "Ukuran dokumen maksimal 8 MB." }, 413);
        const body = await request.arrayBuffer();
        if (!body.byteLength || body.byteLength > 8 * 1024 * 1024) return json(request, env, { error: "Ukuran dokumen tidak valid." }, 413);
        const key = `${scope}/${ownerId}/${crypto.randomUUID()}-${fileName}`;
        await env.FILES.put(key, body, { httpMetadata: { contentType }, customMetadata: { uploadedBy: account.uid, originalName: fileName } });
        return json(request, env, { key, fileName, contentType, size: body.byteLength }, 201);
      }

      if (request.method === "GET" && url.pathname.startsWith("/files/")) {
        const key = decodeURIComponent(url.pathname.slice("/files/".length));
        const contractOwnerId = key.startsWith("contracts/") ? key.split("/")[1] : "";
        if (account.role !== "admin" && contractOwnerId !== account.uid) return json(request, env, { error: "Dokumen tidak dapat diakses." }, 403);
        const object = await env.FILES.get(key);
        if (!object) return json(request, env, { error: "Dokumen tidak ditemukan." }, 404);
        const headers = new Headers(corsHeaders(request, env));
        object.writeHttpMetadata(headers);
        headers.set("Content-Disposition", `inline; filename=\"${object.customMetadata?.originalName || "document.pdf"}\"`);
        headers.set("Cache-Control", "private, no-store");
        return new Response(object.body, { headers });
      }

      return json(request, env, { error: "Endpoint tidak ditemukan." }, 404);
    } catch (error) {
      if (error instanceof Response) return new Response(error.body, { status: error.status, headers: corsHeaders(request, env) });
      return json(request, env, { error: "Autentikasi atau pemrosesan dokumen gagal." }, 401);
    }
  },
} satisfies ExportedHandler<Env>;
