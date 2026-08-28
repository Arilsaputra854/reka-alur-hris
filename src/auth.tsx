import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { AppUser } from "./types";

interface AuthContextValue {
  firebaseUser: User | null;
  profile: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function loadProfile(uid: string): Promise<AppUser | null> {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as AppUser) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          setProfile(await loadProfile(user.uid));
        } catch {
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    firebaseUser,
    profile,
    loading,
    login: async (email, password) => {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      const userProfile = await loadProfile(credential.user.uid);
      if (!userProfile?.active) {
        await signOut(auth);
        throw new Error("Akun tidak aktif atau belum terhubung dengan profil RekaHR.");
      }
      setProfile(userProfile);
      return userProfile;
    },
    logout: () => signOut(auth),
    refreshProfile: async () => {
      if (auth.currentUser) setProfile(await loadProfile(auth.currentUser.uid));
    },
  }), [firebaseUser, loading, profile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
