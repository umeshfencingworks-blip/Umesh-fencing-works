"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  initializeDatabase,
  subscribeToDb,
  getDocumentsSync,
  getCustomersWithStatsSync,
  getCustomersSync,
  getAllPaymentsSync,
  getAuditLogsSync,
  getUnifiedFinancialLedgerSync,
  getDashboardMetricsSync,
  getAllPurchasesSync,
  savePurchase,
  recordPurchasePayment,
  deletePurchase,
  getPurchaseSummary,
  exportPurchaseLedgerCSV,
  getMaterialsWithStockSync,
  getScrapEntriesSync,
  saveMaterial,
  addMaterialStock,
  deleteMaterial,
  saveScrapEntry,
  deleteScrapEntry,
  getInventoryAndScrapSummary,
  exportMaterialsAndScrapCSV,
  pushAllToFirestore,
  seedFirestoreDummyEntries,
} from "@/lib/db";
import {
  auth,
  firestore,
  signInWithGoogle,
  logoutAdminAuth,
  isAuthorizedAdminEmail,
  PRIMARY_ADMIN_EMAIL,
  AUTHORIZED_ADMIN_EMAILS,
  FIREBASE_CONSOLE_URL,
  FIRESTORE_CONSOLE_URL,
  FIRESTORE_RULES_URL,
  RECOMMENDED_FIRESTORE_RULES,
  PRODUCTION_FIRESTORE_RULES,
  onAuthStateChanged,
} from "@/lib/firebase";

const UIContext = createContext(null);

export function UIProvider({ children }) {
  // Ultra-Fast Zero-Latency Client-Side Routing State
  const initialPath = usePathname();
  const [currentPath, setCurrentPath] = useState(initialPath || "/");

  // DB & State Synchronization
  const [dbReady, setDbReady] = useState(false);
  const [dbTick, setDbTick] = useState(0);

  // Admin Auth State (Firebase Google Authentication)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [adminAuthLoading, setAdminAuthLoading] = useState(true);
  const [adminAuthError, setAdminAuthError] = useState(null);

  // Toast / Alert Notifications
  const [toasts, setToasts] = useState([]);

  // Modal States
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerModalData, setCustomerModalData] = useState(null); // for editing

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentModalDoc, setPaymentModalDoc] = useState(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);

  const [isCustomerProfileOpen, setIsCustomerProfileOpen] = useState(false);
  const [customerProfileData, setCustomerProfileData] = useState(null);

  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppDocument, setWhatsAppDocument] = useState(null);


  // Initialize DB and Firebase Auth Listener on Mount
  useEffect(() => {
    initializeDatabase().then(() => {
      setDbReady(true);
    });

    const unsubscribeDb = subscribeToDb(() => {
      setDbTick((prev) => prev + 1);
    });

    // Check localStorage cached admin session first
    if (typeof window !== "undefined") {
      const cachedAuth = localStorage.getItem("ufw_admin_auth");
      const cachedEmail = localStorage.getItem("ufw_admin_email");
      if (cachedAuth === "true" && cachedEmail && isAuthorizedAdminEmail(cachedEmail)) {
        setIsAdminAuthenticated(true);
        setAdminUser({ email: cachedEmail, displayName: "Admin: " + cachedEmail });
      }
    }

    // Listen to Firebase Auth state changes
    let unsubscribeAuth = () => {};
    if (auth) {
      try {
        unsubscribeAuth = onAuthStateChanged(auth, (user) => {
          if (user && isAuthorizedAdminEmail(user.email)) {
            setIsAdminAuthenticated(true);
            setAdminUser(user);
            if (typeof window !== "undefined") {
              localStorage.setItem("ufw_admin_auth", "true");
              localStorage.setItem("ufw_admin_email", user.email);
            }
          }
          setAdminAuthLoading(false);
        });
      } catch (e) {
        console.warn("Firebase Auth listener error:", e);
        setAdminAuthLoading(false);
      }
    } else {
      setAdminAuthLoading(false);
    }

    return () => {
      unsubscribeDb();
      unsubscribeAuth();
    };
  }, []);

  // Synchronize route with browser popstate and URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname + window.location.search);
      const onPopState = () => {
        setCurrentPath(window.location.pathname + window.location.search);
      };
      window.addEventListener("popstate", onPopState);
      return () => window.removeEventListener("popstate", onPopState);
    }
  }, []);

  const navigate = useCallback((to) => {
    if (!to) return;
    if (typeof window !== "undefined") {
      const currentFull = window.location.pathname + window.location.search;
      if (to !== currentFull) {
        window.history.pushState(null, "", to);
      }
      setCurrentPath(to);
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, []);

  // Toast Notification Trigger
  const showToast = useCallback((message, type = "success") => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Unauthorized Email Attempt Modal State
  const [unauthorizedEmailAttempt, setUnauthorizedEmailAttempt] = useState(null);
  const dismissUnauthorizedModal = useCallback(() => {
    setUnauthorizedEmailAttempt(null);
  }, []);

  // Admin Google Login (Strict: Only umeshfencingworks@gmail.com)
  const loginWithGoogle = useCallback(async () => {
    setAdminAuthError(null);
    setUnauthorizedEmailAttempt(null);
    try {
      const { user, email } = await signInWithGoogle();
      setIsAdminAuthenticated(true);
      setAdminUser(user);
      if (typeof window !== "undefined") {
        localStorage.setItem("ufw_admin_auth", "true");
        localStorage.setItem("ufw_admin_email", email);
      }
      showToast(`Welcome, ${user.displayName || email}! Admin session authenticated.`, "success");
      return true;
    } catch (err) {
      if (err.code === "auth/unauthorized-admin-email") {
        setUnauthorizedEmailAttempt(err.attemptedEmail || "this account");
        setAdminAuthError({
          code: err.code,
          message: err.message,
          attemptedEmail: err.attemptedEmail,
        });
        showToast(`Access Denied: ${err.attemptedEmail || "Your account"} does not have admin access.`, "error");
      } else if (err.code === "auth/configuration-not-found" || err.isConfigNotFound) {
        setAdminAuthError({
          code: "auth/configuration-not-found",
          message: "Firebase Authentication has not been initialized in Firebase Console for 'umesh-fencing-works'. Please enable Google Sign-In in Firebase Console under Authentication > Sign-in method.",
          consoleUrl: err.consoleUrl || "https://console.firebase.google.com/project/umesh-fencing-works/authentication/providers",
        });
        showToast("Firebase Auth not yet configured in Firebase Console. See instructions below.", "error");
      } else if (err.code === "auth/popup-closed-by-user") {
        showToast("Google sign-in popup was closed.", "info");
      } else {
        setAdminAuthError({
          code: err.code || "unknown",
          message: err.message || "Authentication failed.",
        });
        showToast(err.message || "Failed to sign in with Google.", "error");
      }
      return false;
    }
  }, [showToast]);

  // Admin Passkey Login removed per user request - Google Auth is the sole access method
  const loginWithPasskey = useCallback(() => {
    return false;
  }, []);

  // Admin Logout - Automatically redirects to customer web portal (landing page)
  const logoutAdmin = useCallback(async () => {
    try {
      await logoutAdminAuth();
      setIsAdminAuthenticated(false);
      setAdminUser(null);
      setAdminAuthError(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("ufw_admin_auth");
        localStorage.removeItem("ufw_admin_email");
      }
      showToast("Signed out of Admin Panel. Redirected to customer portal.", "info");
      navigate("/");
    } catch (err) {
      console.error(err);
      setIsAdminAuthenticated(false);
      setAdminUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("ufw_admin_auth");
        localStorage.removeItem("ufw_admin_email");
      }
      showToast("Signed out. Redirected to customer portal.", "info");
      navigate("/");
    }
  }, [showToast, navigate]);

  // Modal Control Methods
  const openCreateInvoice = useCallback(() => setIsInvoiceModalOpen(true), []);
  const closeCreateInvoice = useCallback(() => setIsInvoiceModalOpen(false), []);

  const openCreateBill = useCallback(() => setIsBillModalOpen(true), []);
  const closeCreateBill = useCallback(() => setIsBillModalOpen(false), []);

  const openCustomerModal = useCallback((customer = null) => {
    setCustomerModalData(customer);
    setIsCustomerModalOpen(true);
  }, []);
  const closeCustomerModal = useCallback(() => {
    setCustomerModalData(null);
    setIsCustomerModalOpen(false);
  }, []);

  const openPaymentModal = useCallback((document = null) => {
    setPaymentModalDoc(document);
    setIsPaymentModalOpen(true);
  }, []);
  const closePaymentModal = useCallback(() => {
    setPaymentModalDoc(null);
    setIsPaymentModalOpen(false);
  }, []);

  const openPreview = useCallback((document) => {
    setPreviewDocument(document);
    setIsPreviewModalOpen(true);
  }, []);
  const closePreview = useCallback(() => {
    setPreviewDocument(null);
    setIsPreviewModalOpen(false);
  }, []);

  const openCustomerProfile = useCallback((customer) => {
    setCustomerProfileData(customer);
    setIsCustomerProfileOpen(true);
  }, []);
  const closeCustomerProfile = useCallback(() => {
    setCustomerProfileData(null);
    setIsCustomerProfileOpen(false);
  }, []);

  const openWhatsAppModal = useCallback((document) => {
    setWhatsAppDocument(document);
    setIsWhatsAppModalOpen(true);
  }, []);
  const closeWhatsAppModal = useCallback(() => {
    setWhatsAppDocument(null);
    setIsWhatsAppModalOpen(false);
  }, []);


  // Cloud Firestore Sync Actions
  const handlePushAllToFirestore = useCallback(async () => {
    try {
      const res = await pushAllToFirestore();
      showToast(
        `Successfully synced ${res.documents} documents, ${res.customers} customers & ${res.payments} payments to Cloud Firestore!`,
        "success"
      );
      return res;
    } catch (err) {
      console.error("[Firestore Push Error]:", err);
      showToast(err.message || "Failed to push to Cloud Firestore. Check security rules.", "error");
      throw err;
    }
  }, [showToast]);

  const handleSeedFirestoreDummyData = useCallback(async () => {
    try {
      const res = await seedFirestoreDummyEntries();
      showToast(
        `Successfully seeded ${res.documents} sample invoices/bills, ${res.customers} customers & ${res.payments} payments into Cloud Firestore!`,
        "success"
      );
      return res;
    } catch (err) {
      console.error("[Firestore Seed Error]:", err);
      showToast(err.message || "Failed to seed Cloud Firestore. Check security rules.", "error");
      throw err;
    }
  }, [showToast]);

  // Synchronous Data Accessors with re-render trigger (dbTick)
  const documents = getDocumentsSync();
  const customers = getCustomersSync();
  const customersWithStats = getCustomersWithStatsSync();
  const payments = getAllPaymentsSync();
  const auditLogs = getAuditLogsSync();
  const ledger = getUnifiedFinancialLedgerSync();
  const metrics = getDashboardMetricsSync();
  const purchases = getAllPurchasesSync();
  const purchaseSummary = getPurchaseSummary();
  const materials = getMaterialsWithStockSync();
  const scrapEntries = getScrapEntriesSync();
  const inventorySummary = getInventoryAndScrapSummary();

  const handleSavePurchase = useCallback(async (purchaseData) => {
    try {
      const res = await savePurchase(purchaseData);
      showToast(`Purchase voucher ${res.purchaseNumber} saved successfully.`, "success");
      return res;
    } catch (err) {
      showToast(err.message || "Failed to save purchase voucher", "error");
      throw err;
    }
  }, [showToast]);

  const handleRecordPurchasePayment = useCallback(async (purchaseId, paymentData) => {
    try {
      const res = await recordPurchasePayment(purchaseId, paymentData);
      showToast(`Payment of ₹${paymentData.amount} recorded for purchase ${res.purchase?.purchaseNumber}.`, "success");
      return res;
    } catch (err) {
      showToast(err.message || "Failed to record purchase payment", "error");
      throw err;
    }
  }, [showToast]);

  const handleDeletePurchase = useCallback(async (purchaseId) => {
    try {
      await deletePurchase(purchaseId);
      showToast("Purchase voucher deleted.", "info");
      return true;
    } catch (err) {
      showToast(err.message || "Failed to delete purchase", "error");
      throw err;
    }
  }, [showToast]);

  // Materials & Scrap Handlers
  const handleSaveMaterial = useCallback(async (materialData) => {
    try {
      const res = await saveMaterial(materialData);
      showToast(`Material "${res.name}" saved successfully.`, "success");
      return res;
    } catch (err) {
      showToast(err.message || "Failed to save material", "error");
      throw err;
    }
  }, [showToast]);

  const handleAddMaterialStock = useCallback(async (materialId, qty, notes) => {
    try {
      const res = await addMaterialStock(materialId, qty, notes);
      showToast(`Added ${qty} ${res.unit} to "${res.name}". Total in stock updated.`, "success");
      return res;
    } catch (err) {
      showToast(err.message || "Failed to add stock", "error");
      throw err;
    }
  }, [showToast]);

  const handleDeleteMaterial = useCallback(async (materialId) => {
    try {
      await deleteMaterial(materialId);
      showToast("Material removed from catalog.", "info");
      return true;
    } catch (err) {
      showToast(err.message || "Failed to delete material", "error");
      throw err;
    }
  }, [showToast]);

  const handleSaveScrapEntry = useCallback(async (scrapData) => {
    try {
      const res = await saveScrapEntry(scrapData);
      showToast(`Logged ${res.qty} ${res.unit} scrap for "${res.materialName}".`, "success");
      return res;
    } catch (err) {
      showToast(err.message || "Failed to log scrap", "error");
      throw err;
    }
  }, [showToast]);

  const handleDeleteScrapEntry = useCallback(async (scrapId) => {
    try {
      await deleteScrapEntry(scrapId);
      showToast("Scrap record deleted.", "info");
      return true;
    } catch (err) {
      showToast(err.message || "Failed to delete scrap record", "error");
      throw err;
    }
  }, [showToast]);

  const value = {
    currentPath,
    setCurrentPath,
    navigate,
    dbReady,
    dbTick,
    metrics,
    documents,
    customers,
    customersWithStats,
    payments,
    auditLogs,
    ledger,
    purchases,
    purchaseSummary,
    savePurchase: handleSavePurchase,
    recordPurchasePayment: handleRecordPurchasePayment,
    deletePurchase: handleDeletePurchase,
    exportPurchaseLedgerCSV,
    materials,
    scrapEntries,
    inventorySummary,
    saveMaterial: handleSaveMaterial,
    addMaterialStock: handleAddMaterialStock,
    deleteMaterial: handleDeleteMaterial,
    saveScrapEntry: handleSaveScrapEntry,
    deleteScrapEntry: handleDeleteScrapEntry,
    exportMaterialsAndScrapCSV,
    isAdminAuthenticated,
    adminUser,
    adminAuthLoading,
    adminAuthError,
    unauthorizedEmailAttempt,
    dismissUnauthorizedModal,
    primaryAdminEmail: PRIMARY_ADMIN_EMAIL,
    loginWithGoogle,
    loginWithPasskey,
    logoutAdmin,
    authorizedAdminEmails: AUTHORIZED_ADMIN_EMAILS,
    firebaseConsoleUrl: FIREBASE_CONSOLE_URL,
    firestoreConsoleUrl: FIRESTORE_CONSOLE_URL,
    firestoreRulesUrl: FIRESTORE_RULES_URL,
    recommendedFirestoreRules: RECOMMENDED_FIRESTORE_RULES,
    productionFirestoreRules: PRODUCTION_FIRESTORE_RULES,
    pushAllToFirestore: handlePushAllToFirestore,
    seedFirestoreDummyEntries: handleSeedFirestoreDummyData,
    toasts,
    showToast,
    removeToast,
    // Modals
    isInvoiceModalOpen,
    openCreateInvoice,
    closeCreateInvoice,
    isBillModalOpen,
    openCreateBill,
    closeCreateBill,
    isCustomerModalOpen,
    customerModalData,
    openCustomerModal,
    closeCustomerModal,
    isPaymentModalOpen,
    paymentModalDoc,
    openPaymentModal,
    closePaymentModal,
    isPreviewModalOpen,
    previewDocument,
    openPreview,
    closePreview,
    isCustomerProfileOpen,
    customerProfileData,
    openCustomerProfile,
    closeCustomerProfile,
    isWhatsAppModalOpen,
    whatsAppDocument,
    openWhatsAppModal,
    closeWhatsAppModal,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
