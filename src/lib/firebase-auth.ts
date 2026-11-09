import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import type { Session } from "./lunova-store";

// Firebase's public web-app configuration; it does not grant administrative access.
const firebaseConfig = {
  apiKey: "AIzaSyBpLc2fqE0ZGq9JIJHobaTEmtWVbpuEThE",
  authDomain: "lunova-90e60.firebaseapp.com",
  projectId: "lunova-90e60",
  storageBucket: "lunova-90e60.firebasestorage.app",
  messagingSenderId: "8335261906",
  appId: "1:8335261906:web:11a5a4c6279028a94a6d0b",
};

export function getFirebaseAuth() {
  if (typeof window === "undefined") {
    throw new Error("Authentication is available in the browser.");
  }
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getAuth(app);
}

export function firebaseSession(user: User): Session {
  return {
    uid: user.uid,
    name: user.displayName || user.email?.split("@")[0] || "User",
    email: user.email || "",
    mode: "firebase",
    emailVerified: user.emailVerified,
    hasPassword: user.providerData.some((provider) => provider.providerId === "password"),
  };
}

export async function loginWithGoogle() {
  const auth = getFirebaseAuth();
  await setPersistence(auth, browserLocalPersistence);
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  return (await signInWithPopup(auth, provider)).user;
}

export async function loginWithGitHub() {
  const auth = getFirebaseAuth();
  await setPersistence(auth, browserLocalPersistence);
  const provider = new GithubAuthProvider();
  // Request an account email, including when it is private on GitHub.
  provider.addScope("user:email");
  return (await signInWithPopup(auth, provider)).user;
}

export async function loginWithEmail(email: string, password: string, remember: boolean) {
  const auth = getFirebaseAuth();
  await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
  return (await signInWithEmailAndPassword(auth, email.trim(), password)).user;
}

export async function registerWithEmail(name: string, email: string, password: string) {
  const auth = getFirebaseAuth();
  await setPersistence(auth, browserLocalPersistence);
  const { user } = await createUserWithEmailAndPassword(auth, email.trim(), password);
  // Creating the account has already succeeded. A profile update failure must
  // not tell the user to register the same email again.
  try {
    await updateProfile(user, { displayName: name.trim() });
  } catch {
    // The account remains usable with its email-derived display name.
  }
  return user;
}

export async function requestPasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
  } catch (error) {
    // Keep the same response for unknown addresses to avoid account enumeration.
    if ((error as { code?: string })?.code !== "auth/user-not-found") throw error;
  }
}

export async function logoutFirebase() {
  await signOut(getFirebaseAuth());
}

export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | null)?.code;
  switch (code) {
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "The email or password is incorrect.";
    case "auth/email-already-in-use":
      return "This email already has an account. Sign in or reset your password.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
    case "auth/password-does-not-meet-requirements":
      return "Choose a stronger password that meets the account requirements.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled. You can try again.";
    case "auth/popup-blocked":
      return "Allow the sign-in popup in your browser, then try again.";
    case "auth/unauthorized-domain":
      return "Social sign-in is not available on this site address yet. You can sign in with email.";
    case "auth/account-exists-with-different-credential":
      return "Use the sign-in method you previously used for this email.";
    case "auth/network-request-failed":
      return "Check your internet connection and try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a little and try again.";
    case "auth/user-disabled":
      return "This account is disabled. Contact support for help.";
    case "auth/user-token-expired":
      return "Your sign-in session changed. Please try again.";
    case "auth/operation-not-allowed":
      return "This sign-in method is currently unavailable.";
    default:
      return "We could not complete this request. Please try again.";
  }
}
