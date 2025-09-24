// Minimal IndexedDB helper for storing audio blobs
// Store: 'quran-audio' DB, object store 'audio_blobs' with key 'key'

export async function openAudioDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('quran-audio', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('audio_blobs')) {
        db.createObjectStore('audio_blobs', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function putBlob(db, key, blob) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audio_blobs', 'readwrite');
    tx.objectStore('audio_blobs').put({ key, blob, ts: Date.now() });
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getBlob(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audio_blobs', 'readonly');
    const req = tx.objectStore('audio_blobs').get(key);
    req.onsuccess = () => resolve(req.result?.blob || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteBlob(db, key) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audio_blobs', 'readwrite');
    tx.objectStore('audio_blobs').delete(key);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

export async function countBlobs(db, prefix) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audio_blobs', 'readonly');
    const store = tx.objectStore('audio_blobs');
    const req = store.openCursor();
    let count = 0;
    req.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        if (!prefix || String(cursor.key).startsWith(prefix)) count++;
        cursor.continue();
      } else {
        resolve(count);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function iterateKeys(db, prefix, onItem) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('audio_blobs', 'readonly');
    const store = tx.objectStore('audio_blobs');
    const req = store.openCursor();
    req.onsuccess = (e) => {
      const cursor = e.target.result;
      if (cursor) {
        if (!prefix || String(cursor.key).startsWith(prefix)) onItem(cursor.key, cursor.value);
        cursor.continue();
      } else resolve();
    };
    req.onerror = () => reject(req.error);
  });
}
