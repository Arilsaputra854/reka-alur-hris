import { useEffect, useState } from "react";
import { collection, onSnapshot, type DocumentData, type Query } from "firebase/firestore";
import { db } from "./firebase";

export function useLiveCollection<T extends { id: string }>(path: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      setData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as T)));
      setLoading(false);
      setError("");
    }, (snapshotError) => {
      setError(snapshotError.message);
      setLoading(false);
    });
    return unsubscribe;
  }, [path]);

  return { data, loading, error };
}

export function useLiveQuery<T extends { id: string }>(queryRef: Query<DocumentData>) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => onSnapshot(queryRef, (snapshot) => {
    setData(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as T)));
    setLoading(false);
    setError("");
  }, (snapshotError) => {
    setError(snapshotError.message);
    setLoading(false);
  }), [queryRef]);

  return { data, loading, error };
}
