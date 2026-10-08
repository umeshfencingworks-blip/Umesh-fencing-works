import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch,
  onSnapshot,
} from "firebase/firestore";

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBIXnzGHc8RTMkB5tgNFmWLsTbtHg7xGv0",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "umesh-fencing-works.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "umesh-fencing-works",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "umesh-fencing-works.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "66574805383",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:66574805383:web:af43e91fd748a1a2050b22",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XVFLVR83GJ",
};

// Initialize Firebase App safely (singleton)
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth Instance
export const auth = typeof window !== "undefined" ? getAuth(app) : null;

// Cloud Firestore Instance (Connects to default database, zero latency)
export const firestore =
  typeof window !== "undefined"
    ? (() => {
        try {
          return getFirestore(app);
        } catch (e) {
          console.warn("[Firestore] Primary getFirestore fallback:", e);
          try {
            return getFirestore(app, "default");
          } catch {
            return null;
          }
        }
      })()
    : null;

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export const PRIMARY_ADMIN_EMAIL = "umeshfencingworks@gmail.com";

// Only umeshfencingworks@gmail.com is granted administrator privileges
export const AUTHORIZED_ADMIN_EMAILS = [
  PRIMARY_ADMIN_EMAIL,
];

export const FIREBASE_CONSOLE_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers`;
export const FIRESTORE_CONSOLE_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/-default-/data`;
export const FIRESTORE_RULES_URL = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/rules`;

// Standard Firebase Firestore Security Rules for copy-pasting
export const RECOMMENDED_FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Development / Testing Mode: Allows full read & write access
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

export const PRODUCTION_FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

/**
 * Sanitizes object so Firestore doesn't reject undefined values
 */
export function cleanForFirestore(obj) {
  if (!obj || typeof obj !== "object") return obj;
  return JSON.parse(JSON.stringify(obj, (k, v) => (v === undefined ? null : v)));
}

/**
 * Checks if a given email is strictly umeshfencingworks@gmail.com
 */
export function isAuthorizedAdminEmail(email) {
  if (!email) return false;
  return email.trim().toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
}

/**
 * Sign in with Google Popup with strict single-admin authorization
 */
export async function signInWithGoogle() {
  if (!auth) {
    throw new Error("Firebase Auth is only accessible in browser environment.");
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const email = user.email ? user.email.toLowerCase() : "";

    if (!isAuthorizedAdminEmail(email)) {
      await signOut(auth);
      const error = new Error(`Access Denied: You don't have access to this page.`);
      error.code = "auth/unauthorized-admin-email";
      error.attemptedEmail = email;
      error.requiredEmail = PRIMARY_ADMIN_EMAIL;
      throw error;
    }

    return { success: true, user, email };
  } catch (error) {
    if (error.code === "auth/configuration-not-found") {
      error.isConfigNotFound = true;
      error.friendlyMessage = `Firebase Authentication is not yet enabled for project "${firebaseConfig.projectId}". Please enable Google Sign-In in your Firebase Console under Authentication > Sign-in method.`;
      error.consoleUrl = FIREBASE_CONSOLE_URL;
    }
    console.error("Firebase Google Auth Error:", error);
    throw error;
  }
}

/**
 * Sign out current admin user
 */
export async function logoutAdminAuth() {
  if (!auth) return true;
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Firebase Sign-Out Error:", error);
    throw error;
  }
}

// =========================================================================
// FIRESTORE SYNC & PUSH UTILITIES (High Reliability & Real-Time Sync)
// =========================================================================

/**
 * Push or update single customer in Cloud Firestore
 */
export async function syncCustomerToFirestore(customer) {
  if (!firestore || !customer || !customer.id) return false;
  try {
    const docRef = doc(firestore, "customers", customer.id);
    const payload = cleanForFirestore({
      ...customer,
      _syncedAt: new Date().toISOString(),
    });
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.warn(`[Firestore] Failed to sync customer ${customer.id}:`, err);
    return false;
  }
}

/**
 * Delete customer from Cloud Firestore
 */
export async function deleteCustomerFromFirestore(customerId) {
  if (!firestore || !customerId) return false;
  try {
    const docRef = doc(firestore, "customers", customerId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn(`[Firestore] Failed to delete customer ${customerId}:`, err);
    return false;
  }
}

/**
 * Push or update single invoice or retail bill in Cloud Firestore
 */
export async function syncDocumentToFirestore(document) {
  if (!firestore || !document || !document.id) return false;
  try {
    const docRef = doc(firestore, "documents", document.id);
    const payload = cleanForFirestore({
      ...document,
      _syncedAt: new Date().toISOString(),
    });
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.warn(`[Firestore] Failed to sync document ${document.id}:`, err);
    return false;
  }
}

/**
 * Delete invoice or retail bill from Cloud Firestore
 */
export async function deleteDocumentFromFirestore(documentId) {
  if (!firestore || !documentId) return false;
  try {
    const docRef = doc(firestore, "documents", documentId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn(`[Firestore] Failed to delete document ${documentId}:`, err);
    return false;
  }
}

/**
 * Push or update single payment record in Cloud Firestore
 */
export async function syncPaymentToFirestore(payment) {
  if (!firestore || !payment || !payment.id) return false;
  try {
    const docRef = doc(firestore, "payments", payment.id);
    const payload = cleanForFirestore({
      ...payment,
      _syncedAt: new Date().toISOString(),
    });
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.warn(`[Firestore] Failed to sync payment ${payment.id}:`, err);
    return false;
  }
}

/**
 * Delete payment record from Cloud Firestore
 */
export async function deletePaymentFromFirestore(paymentId) {
  if (!firestore || !paymentId) return false;
  try {
    const docRef = doc(firestore, "payments", paymentId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn(`[Firestore] Failed to delete payment ${paymentId}:`, err);
    return false;
  }
}

/**
 * Push single audit log record to Cloud Firestore
 */
export async function syncAuditLogToFirestore(auditLog) {
  if (!firestore || !auditLog || !auditLog.id) return false;
  try {
    const docRef = doc(firestore, "auditLogs", auditLog.id);
    const payload = cleanForFirestore({
      ...auditLog,
      _syncedAt: new Date().toISOString(),
    });
    await setDoc(docRef, payload, { merge: true });
    try {
      const aliasRef = doc(firestore, "audit_logs", auditLog.id);
      await setDoc(aliasRef, payload, { merge: true });
    } catch (_) {}
    return true;
  } catch (err) {
    console.warn(`[Firestore] Failed to sync audit log ${auditLog.id}:`, err);
    return false;
  }
}

/**
 * Push or update counter document in Cloud Firestore
 */
export async function syncCounterToFirestore(counterId, counterData) {
  if (!firestore || !counterId || !counterData) return false;
  try {
    const docRef = doc(firestore, "counters", counterId);
    const payload = cleanForFirestore({
      ...counterData,
      _syncedAt: new Date().toISOString(),
    });
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.warn(`[Firestore] Failed to sync counter ${counterId}:`, err);
    return false;
  }
}

/**
 * Push or update single purchase record in Cloud Firestore under 'purchase ledger'
 */
export async function syncPurchaseToFirestore(purchase) {
  if (!firestore || !purchase || !purchase.id) return false;
  try {
    const payload = cleanForFirestore({
      ...purchase,
      _syncedAt: new Date().toISOString(),
    });

    // 1. Primary: Save directly to 'purchase ledger' collection
    const ledgerDocRef = doc(firestore, "purchase ledger", purchase.id);
    await setDoc(ledgerDocRef, payload, { merge: true });

    // 2. Backward compatibility alias to 'purchases'
    try {
      const aliasDocRef = doc(firestore, "purchases", purchase.id);
      await setDoc(aliasDocRef, payload, { merge: true });
    } catch (_) {}

    return true;
  } catch (err) {
    console.warn(`[Firestore] Failed to sync purchase ${purchase.id}:`, err);
    return false;
  }
}

/**
 * Delete purchase record from Cloud Firestore
 */
export async function deletePurchaseFromFirestore(purchaseId) {
  if (!firestore || !purchaseId) return false;
  try {
    const ledgerDocRef = doc(firestore, "purchase ledger", purchaseId);
    await deleteDoc(ledgerDocRef);
    try {
      const aliasDocRef = doc(firestore, "purchases", purchaseId);
      await deleteDoc(aliasDocRef);
    } catch (_) {}
    return true;
  } catch (err) {
    console.warn(`[Firestore] Failed to delete purchase ${purchaseId}:`, err);
    return false;
  }
}

/**
 * Push or update material item with full stock & stock sales in Cloud Firestore 'materials' collection
 */
export async function syncMaterialToFirestore(material) {
  if (!firestore || !material || !material.id) return false;
  try {
    const docRef = doc(firestore, "materials", material.id);
    const payload = cleanForFirestore({
      ...material,
      // Provide both explicit keys so stock sales are immediately visible in Firestore
      stockSales: material.stockSales || material.salesDeductions || [],
      salesDeductions: material.salesDeductions || material.stockSales || [],
      _syncedAt: new Date().toISOString(),
    });
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.warn(`[Firestore] Failed to sync material ${material.id}:`, err);
    return false;
  }
}

/**
 * Delete material item from Cloud Firestore
 */
export async function deleteMaterialFromFirestore(materialId) {
  if (!firestore || !materialId) return false;
  try {
    const docRef = doc(firestore, "materials", materialId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn(`[Firestore] Failed to delete material ${materialId}:`, err);
    return false;
  }
}

/**
 * Push or update single scrap/wastage record in Cloud Firestore
 */
export async function syncScrapEntryToFirestore(scrapEntry) {
  if (!firestore || !scrapEntry || !scrapEntry.id) return false;
  try {
    const docRef = doc(firestore, "scrapEntries", scrapEntry.id);
    const payload = cleanForFirestore({
      ...scrapEntry,
      _syncedAt: new Date().toISOString(),
    });
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.warn(`[Firestore] Failed to sync scrap entry ${scrapEntry.id}:`, err);
    return false;
  }
}

/**
 * Delete scrap record from Cloud Firestore
 */
export async function deleteScrapEntryFromFirestore(scrapId) {
  if (!firestore || !scrapId) return false;
  try {
    const docRef = doc(firestore, "scrapEntries", scrapId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn(`[Firestore] Failed to delete scrap entry ${scrapId}:`, err);
    return false;
  }
}

/**
 * Seed Cloud Firestore with 8–10 comprehensive, realistic, fully-traceable business entries
 * across customers, documents (tax invoices & retail bills), payments, purchases, materials, and scrap.
 */
export async function seedFirestoreWithDemoData(dataset) {
  if (!firestore) {
    throw new Error("Firestore is not initialized in the browser.");
  }

  const results = {
    customers: 0,
    documents: 0,
    payments: 0,
    auditLogs: 0,
    purchases: 0,
    materials: 0,
    scrapEntries: 0,
    errors: [],
  };

  const customers = dataset?.customers || [];
  const documents = dataset?.documents || [];
  const payments = dataset?.payments || [];
  const auditLogs = dataset?.auditLogs || [];
  const purchases = dataset?.purchases || [];
  const materials = dataset?.materials || [];
  const scrapEntries = dataset?.scrapEntries || [];

  // 1. Seed Customers
  for (const cust of customers) {
    try {
      const docRef = doc(firestore, "customers", cust.id);
      await setDoc(docRef, cleanForFirestore({ ...cust, _syncedAt: new Date().toISOString() }), { merge: true });
      results.customers++;
    } catch (e) {
      results.errors.push(`Customer ${cust.id}: ${e.message}`);
    }
  }

  // 2. Seed Invoices & Bills
  for (const d of documents) {
    try {
      const docRef = doc(firestore, "documents", d.id);
      await setDoc(docRef, cleanForFirestore({ ...d, _syncedAt: new Date().toISOString() }), { merge: true });
      results.documents++;
    } catch (e) {
      results.errors.push(`Document ${d.id}: ${e.message}`);
    }
  }

  // 3. Seed Payments
  for (const p of payments) {
    try {
      const docRef = doc(firestore, "payments", p.id);
      await setDoc(docRef, cleanForFirestore({ ...p, _syncedAt: new Date().toISOString() }), { merge: true });
      results.payments++;
    } catch (e) {
      results.errors.push(`Payment ${p.id}: ${e.message}`);
    }
  }

  // 4. Seed Audit Logs
  for (const a of auditLogs) {
    try {
      const docRef = doc(firestore, "auditLogs", a.id);
      await setDoc(docRef, cleanForFirestore({ ...a, _syncedAt: new Date().toISOString() }), { merge: true });
      results.auditLogs++;
    } catch (e) {
      results.errors.push(`AuditLog ${a.id}: ${e.message}`);
    }
  }

  // 5. Seed Purchases (Raw Materials & Supplies) into 'purchase ledger' and 'purchases'
  for (const pur of purchases) {
    try {
      const payload = cleanForFirestore({ ...pur, _syncedAt: new Date().toISOString() });
      await setDoc(doc(firestore, "purchase ledger", pur.id), payload, { merge: true });
      try {
        await setDoc(doc(firestore, "purchases", pur.id), payload, { merge: true });
      } catch (_) {}
      results.purchases++;
    } catch (e) {
      results.errors.push(`Purchase ${pur.id}: ${e.message}`);
    }
  }

  // 6. Seed Materials Inventory (full record, stock, stock sales)
  for (const mat of materials) {
    try {
      const payload = cleanForFirestore({
        ...mat,
        stockSales: mat.stockSales || mat.salesDeductions || [],
        salesDeductions: mat.salesDeductions || mat.stockSales || [],
        _syncedAt: new Date().toISOString(),
      });
      await setDoc(doc(firestore, "materials", mat.id), payload, { merge: true });
      results.materials++;
    } catch (e) {
      results.errors.push(`Material ${mat.id}: ${e.message}`);
    }
  }

  // 7. Seed Scrap Entries
  for (const scrap of scrapEntries) {
    try {
      const docRef = doc(firestore, "scrapEntries", scrap.id);
      await setDoc(docRef, cleanForFirestore({ ...scrap, _syncedAt: new Date().toISOString() }), { merge: true });
      results.scrapEntries++;
    } catch (e) {
      results.errors.push(`ScrapEntry ${scrap.id}: ${e.message}`);
    }
  }

  if (results.errors.length > 0 && results.customers === 0 && results.documents === 0 && results.purchases === 0 && results.materials === 0) {
    const errorMsg = results.errors[0] || "Firestore write permission denied.";
    const err = new Error(errorMsg);
    err.details = results.errors;
    throw err;
  }

  return results;
}

/**
 * Fetch all purchases from Cloud Firestore (primary: 'purchase ledger', fallback: 'purchases')
 */
export async function fetchPurchasesFromFirestore() {
  if (!firestore) return [];
  try {
    let colRef = collection(firestore, "purchase ledger");
    let snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      colRef = collection(firestore, "purchases");
      snapshot = await getDocs(colRef);
    }
    if (snapshot.empty) return [];
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (err) {
    console.warn("[Firestore] Failed to fetch purchases:", err);
    return [];
  }
}

/**
 * Fetch all materials with stock and stock sales from Cloud Firestore
 */
export async function fetchMaterialsFromFirestore() {
  if (!firestore) return [];
  try {
    const colRef = collection(firestore, "materials");
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) return [];
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (err) {
    console.warn("[Firestore] Failed to fetch materials:", err);
    return [];
  }
}

/**
 * Wipe documents, payments, purchases, materials, scrap and optionally customers from Cloud Firestore
 */
export async function clearFirestorePortalEntries({ wipeCustomers = false } = {}) {
  if (!firestore) return { success: false, reason: "Firestore not initialized" };

  const collectionsToClear = ["documents", "payments", "purchase ledger", "purchases", "materials", "scrapEntries"];
  if (wipeCustomers) {
    collectionsToClear.push("customers");
  }

  const results = { cleared: 0, errors: [] };

  for (const colName of collectionsToClear) {
    try {
      const colRef = collection(firestore, colName);
      const snapshot = await getDocs(colRef);
      if (!snapshot.empty) {
        const batch = writeBatch(firestore);
        snapshot.docs.forEach((docSnap) => {
          batch.delete(docSnap.ref);
          results.cleared++;
        });
        await batch.commit();
      }
    } catch (err) {
      console.warn(`[Firestore] Failed to clear collection ${colName}:`, err);
      results.errors.push(`${colName}: ${err.message}`);
    }
  }

  return results;
}

export { onAuthStateChanged, onSnapshot, collection, doc };

