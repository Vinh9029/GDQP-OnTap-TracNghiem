import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  getDocFromServer
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { UserProfile, UserStats, ExamResult } from "../types";

// Check if Firebase keys are fully defined
export const isFirebaseConfigured = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId
);

let firebaseApp;
let firestoreDb: any = null;
let firebaseAuth: any = null;

if (isFirebaseConfigured) {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firestoreDb = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId || "(default)");
    firebaseAuth = getAuth(firebaseApp);
    console.log("Firebase initialized successfully in application.");
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.log("Firebase is not fully configured yet. Running with high-performance Express server-side storage.");
}

export const db = firestoreDb;
export const auth = firebaseAuth;

// --- Error Handler Helper (Pillar 3 & Section 3 of Firebase Integration) ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Error details: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test Connection on Startup (Critical Constraint in Firebase Integration Skill)
if (isFirebaseConfigured && db) {
  async function testConnection() {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.warn("Please check your Firebase configuration or internet connection.");
      }
    }
  }
  testConnection();
}

// --- Hybrid Synced Storage API (Ensures 100% reliability in UI preview) ---

/**
 * Saves or updates user profile in Firestore AND/OR Express fallback DB
 */
export async function syncUserProfile(profile: UserProfile): Promise<UserProfile> {
  // 1. Try syncing to custom Express database (ensures we have working features in dev server right away)
  try {
    const res = await fetch("/api/leaderboard", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.profile) {
        console.log("User synchronized successfully with server database.");
      }
    }
  } catch (err) {
    console.error("Failed to sync user with fallback server DB:", err);
  }

  // 2. Try syncing to active Firestore
  if (isFirebaseConfigured && db) {
    const userPath = `users/${profile.uid}`;
    try {
      await setDoc(doc(db, "users", profile.uid), {
        uid: profile.uid,
        name: profile.name,
        email: profile.email,
        photoURL: profile.photoURL,
        xp: profile.xp,
        streak: profile.streak,
        avgExamScore: profile.avgExamScore,
        totalExams: profile.totalExams,
        createdAt: profile.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log("User synchronized successfully with Firestore.");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, userPath);
    }
  }

  return profile;
}

/**
 * Saves user progress stats (answered questions list) to Firestore
 */
export async function syncUserStats(uid: string, stats: UserStats): Promise<void> {
  if (isFirebaseConfigured && db) {
    const statsPath = `users/${uid}/stats/progress`;
    try {
      await setDoc(doc(db, "users", uid, "stats", "progress"), {
        uid,
        streak: stats.streak,
        lastActiveDate: stats.lastActiveDate,
        answeredQuestions: stats.answeredQuestions,
        updatedAt: new Date().toISOString()
      });
      console.log("User stats synchronized with Firestore.");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, statsPath);
    }
  }
}

/**
 * Saves exam history item to Firestore
 */
export async function syncExamResult(uid: string, exam: ExamResult): Promise<void> {
  if (isFirebaseConfigured && db) {
    const historyPath = `users/${uid}/history/${exam.id}`;
    try {
      await setDoc(doc(db, "users", uid, "history", exam.id), {
        id: exam.id,
        part: exam.part,
        score: exam.score,
        correctAnswers: exam.correctAnswers,
        totalQuestions: exam.totalQuestions,
        timeSpentSeconds: exam.timeSpentSeconds,
        passed: exam.passed,
        date: exam.date,
        updatedAt: new Date().toISOString()
      });
      console.log("Exam result synchronized with Firestore.");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, historyPath);
    }
  }
}

/**
 * Fetches the global leaderboard list (returns users from Firestore if configured, else fallback Express API)
 */
export async function fetchLeaderboardList(filter: string = "all"): Promise<any[]> {
  if (isFirebaseConfigured && db) {
    const pathForGetDocs = "users";
    try {
      const q = query(collection(db, "users"), orderBy("xp", "desc"), limit(100));
      const querySnapshot = await getDocs(q);
      const list: any[] = [];
      querySnapshot.forEach((doc) => {
        list.push(doc.data());
      });

      if (list.length > 0) {
        // Adjust statistics depending on filters to match server-side logic
        let filteredList = list;
        if (filter === "week") {
          filteredList = filteredList.map(u => ({ ...u, xp: Math.round(u.xp * 0.4) }));
        } else if (filter === "part1") {
          filteredList = filteredList.map(u => ({ ...u, xp: Math.round(u.xp * 0.55) }));
        } else if (filter === "part2") {
          filteredList = filteredList.map(u => ({ ...u, xp: Math.round(u.xp * 0.45) }));
        }

        filteredList.sort((a, b) => b.xp - a.xp);
        return filteredList.map((item, index) => ({
          ...item,
          rank: index + 1,
        }));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, pathForGetDocs);
    }
  }

  // Fallback to Express backend if Firebase not configured or returned zero records
  try {
    const res = await fetch(`/api/leaderboard?filter=${filter}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error("Leaderboard fallback fetch failed:", err);
  }
  
  return [];
}
