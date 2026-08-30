import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";

initializeApp();

const db = getFirestore();

export const setEmployeePassword = onCall(
  { region: "asia-southeast2", cors: true },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Silakan login sebagai admin.");

    const adminDoc = await db.doc(`users/${request.auth.uid}`).get();
    const adminData = adminDoc.data();
    if (!adminDoc.exists || adminData?.role !== "admin" || adminData?.active === false) {
      throw new HttpsError("permission-denied", "Hanya admin aktif yang dapat mengatur password karyawan.");
    }

    const employeeId = typeof request.data?.employeeId === "string" ? request.data.employeeId.trim() : "";
    const password = typeof request.data?.password === "string" ? request.data.password : "";
    if (!employeeId) throw new HttpsError("invalid-argument", "Karyawan tidak valid.");
    if (password.length < 8 || password.length > 128) {
      throw new HttpsError("invalid-argument", "Password harus terdiri dari 8–128 karakter.");
    }

    const employeeUserDoc = await db.doc(`users/${employeeId}`).get();
    const employeeUser = employeeUserDoc.data();
    if (!employeeUserDoc.exists || employeeUser?.role !== "employee") {
      throw new HttpsError("not-found", "Akun karyawan tidak ditemukan.");
    }

    await getAuth().updateUser(employeeId, { password });
    await getAuth().revokeRefreshTokens(employeeId);
    await db.collection("auditLogs").add({
      action: "employee.password_changed",
      actorId: request.auth.uid,
      entityId: employeeId,
      summary: `Password ${employeeUser.displayName || employeeUser.email || employeeId} diubah oleh admin`,
      createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
  },
);
