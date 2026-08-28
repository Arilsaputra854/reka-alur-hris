import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { addDoc, collection, doc, getDoc, getDocs, setDoc, Timestamp, updateDoc } from "firebase/firestore";

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "reka-alur-hris-rules-test",
    firestore: { rules: readFileSync(resolve("firebase/firestore.rules"), "utf8") },
  });
});

beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await setDoc(doc(db, "users", "admin-1"), { displayName: "Admin", email: "admin@test.dev", role: "admin", active: true });
    await setDoc(doc(db, "users", "employee-1"), { displayName: "Employee One", email: "one@test.dev", role: "employee", active: true });
    await setDoc(doc(db, "users", "employee-2"), { displayName: "Employee Two", email: "two@test.dev", role: "employee", active: true });
    await setDoc(doc(db, "employees", "employee-1"), { fullName: "Employee One", status: "active" });
    await setDoc(doc(db, "employees", "employee-2"), { fullName: "Employee Two", status: "active" });
    await setDoc(doc(db, "payslips", "slip-1"), { employeeId: "employee-1", status: "published", net: 5_000_000 });
    await setDoc(doc(db, "payslips", "slip-2"), { employeeId: "employee-2", status: "published", net: 6_000_000 });
  });
});

afterAll(async () => env.cleanup());

describe("Firestore authorization", () => {
  it("denies unauthenticated data access", async () => {
    const db = env.unauthenticatedContext().firestore();
    await assertFails(getDocs(collection(db, "employees")));
  });

  it("allows an active admin to manage employees", async () => {
    const db = env.authenticatedContext("admin-1").firestore();
    await assertSucceeds(getDocs(collection(db, "employees")));
    await assertSucceeds(setDoc(doc(db, "employees", "employee-3"), { fullName: "Employee Three", status: "active" }));
  });

  it("lets employees read only their own profile and payslip", async () => {
    const db = env.authenticatedContext("employee-1").firestore();
    await assertSucceeds(getDoc(doc(db, "employees", "employee-1")));
    await assertFails(getDoc(doc(db, "employees", "employee-2")));
    await assertSucceeds(getDoc(doc(db, "payslips", "slip-1")));
    await assertFails(getDoc(doc(db, "payslips", "slip-2")));
  });

  it("accepts immutable attendance from its employee owner", async () => {
    const db = env.authenticatedContext("employee-1").firestore();
    const ref = await assertSucceeds(addDoc(collection(db, "attendance"), {
      employeeId: "employee-1",
      employeeName: "Employee One",
      type: "check-in",
      clientTimestamp: new Date().toISOString(),
      dateKey: "2026-08-28",
      latitude: -6.2,
      longitude: 106.8,
      accuracy: 12,
      distanceMeters: 8,
      faceVerified: true,
      status: "valid",
      createdAt: Timestamp.now(),
    }));
    await assertFails(updateDoc(ref, { status: "review" }));
  });
});
