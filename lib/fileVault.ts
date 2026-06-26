// Project document vault — blobs live in IndexedDB (shared across every tool on
// this origin, survives reloads). Ported from the Claude Design prototype.
const DB_NAME = "tencent.files.v1";
const STORE = "files";

export type FileRec = { id: string; name: string; type: string; size: number; addedAt: number; blob: Blob; projectId?: string };

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const rid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `f${Math.random().toString(36).slice(2)}`;

export async function filesAdd(list: FileList | File[], projectId?: string): Promise<number> {
  const arr = Array.from(list);
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    arr.forEach((f) => store.put({ id: rid(), name: f.name, type: f.type || "", size: f.size, addedAt: Date.now(), blob: f, projectId }));
    tx.oncomplete = () => res(arr.length);
    tx.onerror = () => rej(tx.error);
  });
}

// Returns files for a project. Legacy files (saved before per-project scoping,
// with no projectId) are shown everywhere so nothing is ever lost.
export async function filesAll(projectId?: string): Promise<FileRec[]> {
  try {
    const db = await openDB();
    return await new Promise<FileRec[]>((res, rej) => {
      const out: FileRec[] = [];
      const tx = db.transaction(STORE, "readonly");
      const cur = tx.objectStore(STORE).openCursor();
      cur.onsuccess = () => {
        const c = cur.result;
        if (c) {
          const rec = c.value as FileRec;
          if (!projectId || !rec.projectId || rec.projectId === projectId) out.push(rec);
          c.continue();
        } else {
          out.sort((a, b) => b.addedAt - a.addedAt);
          res(out);
        }
      };
      cur.onerror = () => rej(cur.error);
    });
  } catch {
    return [];
  }
}

export async function filesDelete(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((res) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => res();
    tx.onerror = () => res();
  });
}

export async function filesGet(id: string): Promise<FileRec | null> {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readonly");
    const rq = tx.objectStore(STORE).get(id);
    rq.onsuccess = () => res((rq.result as FileRec) || null);
    rq.onerror = () => rej(rq.error);
  });
}

export const fileExt = (name: string) => (/\.([a-z0-9]+)$/i.exec(name)?.[1].toUpperCase() ?? "FILE");
export const fileSize = (b: number) => (b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(b < 10240 ? 1 : 0)} KB` : `${(b / 1048576).toFixed(b < 10485760 ? 1 : 0)} MB`);
