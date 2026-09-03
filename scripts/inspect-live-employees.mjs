import fs from "node:fs";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, getDocs, getFirestore } from "firebase/firestore";

const credentials = fs.readFileSync(new URL("../docs/ADMIN-CREDENTIALS.local.md", import.meta.url), "utf8");
const email = credentials.match(/Email:\s*(\S+)/)?.[1];
const password = credentials.match(/Password sementara:\s*(\S+)/)?.[1];
if (!email || !password) throw new Error("Kredensial admin lokal tidak ditemukan.");

const app = initializeApp({
  apiKey: "AIzaSyDt02Qa3iO3LidH7Q84bneP_krGkFxDmN4",
  authDomain: "reka-alur-hris.firebaseapp.com",
  projectId: "reka-alur-hris",
  appId: "1:400289301130:web:82c0225944364029a1a373",
});
await signInWithEmailAndPassword(getAuth(app), email, password);
const snapshot = await getDocs(collection(getFirestore(app), "employees"));
console.log(JSON.stringify(snapshot.docs.map((item) => ({ id: item.id, employeeCode: item.data().employeeCode, fullName: item.data().fullName, email: item.data().email, status: item.data().status })), null, 2));
