import nacl from "tweetnacl";
import * as util from "tweetnacl-util";

export function generateKeyPair() {
  const keyPair = nacl.box.keyPair();

  return {
    publicKey: util.encodeBase64(keyPair.publicKey),
    privateKey: util.encodeBase64(keyPair.secretKey),
  };
}

export function encryptMessage(message, receiverPublicKey, senderPrivateKey) {
  const nonce = nacl.randomBytes(24);

  const encrypted = nacl.box(
    util.decodeUTF8(message),
    nonce,
    util.decodeBase64(receiverPublicKey),
    util.decodeBase64(senderPrivateKey),
  );  

  return {
    ciphertext: util.encodeBase64(encrypted),
    nonce: util.encodeBase64(nonce),
  };
}

export function decryptMessage(
  ciphertext,
  nonce,
  senderPublicKey,
  myPrivateKey,
) {
  const decrypted = nacl.box.open(
    util.decodeBase64(ciphertext),
    util.decodeBase64(nonce),
    util.decodeBase64(senderPublicKey),
    util.decodeBase64(myPrivateKey),
  );

  return util.encodeUTF8(decrypted);
}

export const createDB = () => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("Converse", 3);
    request.onerror = (event) => {
      console.error("IndexedDB error:", event.target.error);
      reject(event.target.error);
    };
    request.onsuccess = () => {
      resolve({ success: true, message: "IndexedDB setup complete" });
    };
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys", { keyPath: "id" });
      }
    };
  });
};

export const writeKeysToDB = (id, privateKey, publicKey, deviceID) => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("Converse", 3);

    request.onerror = () => reject("DB open failed");

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys", { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("keys")) {
        // Just in case it's still missing, though onupgradeneeded should catch it
        return reject("Store 'keys' missing");
      }

      const tx = db.transaction("keys", "readwrite");
      const store = tx.objectStore("keys");

      const addRequest = store.put({ id, privateKey, publicKey, deviceID });

      addRequest.onsuccess = () => resolve({ success: true });

      addRequest.onerror = () => reject({ success: false });
    };
  });
};

export const getKeysFromDB = (id) => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("Converse", 3);
    request.onerror = () => reject("DB open failed");

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys", { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("keys")) {
        return resolve(null); // the store doesn't exist so there are no keys
      }
      const tx = db.transaction("keys", "readonly");
      const store = tx.objectStore("keys");
      const getReq = store.get(id);
      getReq.onsuccess = () => resolve(getReq.result || null);
      getReq.onerror = () => reject("Failed to get keys");
    };
  });
};
