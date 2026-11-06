// db.js — Armazenamento permanente de audiolivros locais via IndexedDB
const DB_NAME = 'playbook_audiobooks_db';
const DB_VERSION = 1;
const META_STORE = 'audio_metadata';
const BLOB_STORE = 'audio_blobs';

let dbPromise = null;

export function openAudioDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB não suportado neste navegador.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(META_STORE)) {
        db.createObjectStore(META_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(BLOB_STORE)) {
        db.createObjectStore(BLOB_STORE, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Falha ao abrir banco local.'));
  });
  return dbPromise;
}

export async function saveAudioToStorage(file) {
  const db = await openAudioDB();
  const id = `local:${file.name}:${file.size}:${file.lastModified}`;
  const metadata = {
    id,
    name: file.name.replace(/\.[^/.]+$/, ''), // Nome limpo sem extensão
    fileName: file.name,
    size: Number(file.size),
    modifiedTime: String(file.lastModified),
    mimeType: file.type || 'audio/mpeg',
    source: 'local',
    addedAt: Date.now()
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction([META_STORE, BLOB_STORE], 'readwrite');
    tx.oncomplete = () => resolve(metadata);
    tx.onerror = () => reject(tx.error || new Error('Erro ao salvar no banco local.'));
    tx.onabort = () => reject(tx.error || new Error('Transação abortada.'));

    tx.objectStore(META_STORE).put(metadata);
    tx.objectStore(BLOB_STORE).put({ id, blob: file });
  });
}

export async function getAllStoredMetadata() {
  const db = await openAudioDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(META_STORE, 'readonly');
    const store = tx.objectStore(META_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error || new Error('Erro ao listar livros salvos.'));
  });
}

export async function getAudioBlob(id) {
  const db = await openAudioDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(BLOB_STORE, 'readonly');
    const store = tx.objectStore(BLOB_STORE);
    const request = store.get(id);
    request.onsuccess = () => {
      if (request.result && request.result.blob) {
        resolve(request.result.blob);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error || new Error('Erro ao carregar áudio do banco.'));
  });
}

export async function deleteAudioFromStorage(id) {
  const db = await openAudioDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([META_STORE, BLOB_STORE], 'readwrite');
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error('Erro ao excluir livro do banco.'));
    tx.onabort = () => reject(tx.error || new Error('Exclusão abortada.'));

    tx.objectStore(META_STORE).delete(id);
    tx.objectStore(BLOB_STORE).delete(id);
  });
}
