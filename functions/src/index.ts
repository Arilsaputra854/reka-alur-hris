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

export const deleteEmployeeData = onCall(
  { region: "asia-southeast2", cors: true, timeoutSeconds: 120 },
  async (request) => {
    if (!request.auth) throw new HttpsError("unauthenticated", "Silakan login sebagai admin.");
    const adminDoc = await db.doc(`users/${request.auth.uid}`).get();
    const adminData = adminDoc.data();
    if (!adminDoc.exists || adminData?.role !== "admin" || adminData?.active === false) {
      throw new HttpsError("permission-denied", "Hanya admin aktif yang dapat menghapus data karyawan.");
    }

    const employeeId = typeof request.data?.employeeId === "string" ? request.data.employeeId.trim() : "";
    const confirmEmail = typeof request.data?.confirmEmail === "string" ? request.data.confirmEmail.trim().toLowerCase() : "";
    if (!employeeId || employeeId === request.auth.uid) throw new HttpsError("invalid-argument", "Target karyawan tidak valid.");
    const [employeeDoc, userDoc] = await Promise.all([db.doc(`employees/${employeeId}`).get(), db.doc(`users/${employeeId}`).get()]);
    const employee = employeeDoc.data();
    const employeeUser = userDoc.data();
    if (!employeeDoc.exists || employeeUser?.role !== "employee") throw new HttpsError("not-found", "Karyawan tidak ditemukan.");
    if (String(employee?.email || employeeUser.email || "").toLowerCase() !== confirmEmail) {
      throw new HttpsError("failed-precondition", "Konfirmasi email tidak cocok.");
    }

    const collectionNames = ["attendance", "attendanceCorrections", "requests", "performanceGoals", "trackingSessions", "payslips", "employeeContracts"];
    const snapshots = await Promise.all(collectionNames.map((name) => db.collection(name).where("employeeId", "==", employeeId).get()));
    const fileKeys = snapshots[6].docs.map((item) => item.data().fileKey).filter((value): value is string => typeof value === "string");
    const deleted: Record<string, number> = {};
    for (let index = 0; index < snapshots.length; index += 1) {
      const snapshot = snapshots[index];
      deleted[collectionNames[index]] = snapshot.size;
      for (const item of snapshot.docs) await db.recursiveDelete(item.ref);
    }

    const candidateSnapshot = await db.collection("candidates").where("hiredEmployeeId", "==", employeeId).get();
    for (const candidate of candidateSnapshot.docs) {
      await candidate.ref.update({ hiredEmployeeId: FieldValue.delete(), hiredAt: FieldValue.delete(), updatedAt: FieldValue.serverTimestamp() });
    }

    try { await getAuth().deleteUser(employeeId); }
    catch (error) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "auth/user-not-found") throw error;
    }
    await Promise.all([employeeDoc.ref.delete(), userDoc.ref.delete()]);
    await db.collection("auditLogs").add({
      action: "employee.deleted",
      actorId: request.auth.uid,
      entityId: employeeId,
      summary: `Data karyawan ${employee?.fullName || confirmEmail} dihapus oleh admin`,
      deleted,
      createdAt: FieldValue.serverTimestamp(),
    });
    return { success: true, employeeName: employee?.fullName || confirmEmail, deleted, fileKeys };
  },
);
