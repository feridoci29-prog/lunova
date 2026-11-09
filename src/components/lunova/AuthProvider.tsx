import {
  createContext,
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import {
  authErrorMessage,
  firebaseSession,
  getFirebaseAuth,
  loginWithEmail,
  loginWithGoogle,
  loginWithGitHub,
  logoutFirebase,
  registerWithEmail,
  requestPasswordReset,
} from "@/lib/firebase-auth";
import { setSession, type Session } from "@/lib/lunova-store";

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  signInWithEmail: (email: string, password: string, remember: boolean) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const guestSession: Session = { name: "Guest", email: "guest@draftwink.local", mode: "guest" };
const guestKey = "lunova.guest";

function isGuest() {
  try {
    return sessionStorage.getItem(guestKey) === "1";
  } catch {
    return false;
  }
}

function rememberGuest(guest: boolean) {
  try {
    if (guest) sessionStorage.setItem(guestKey, "1");
    else sessionStorage.removeItem(guestKey);
  } catch {
    // Guest exploration still works when browser storage is unavailable.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, updateSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const publish = useCallback((next: Session | null) => {
    setSession(next);
    updateSession(next);
    setLoading(false);
    setError(null);
  }, []);
  const acceptUser = useCallback(
    (user: User) => {
      rememberGuest(false);
      publish(firebaseSession(user));
    },
    [publish],
  );

  const finishSignIn = (user: User) => {
    // Another tab may switch accounts while a popup/profile request is pending.
    // A completed older request must never replace the SDK's current identity.
    const current = getFirebaseAuth().currentUser;
    if (!current || current.uid !== user.uid) {
      throw { code: "auth/user-token-expired" };
    }
    acceptUser(current);
  };

  useEffect(() => {
    let active = true;
    const fail = (failure: unknown) => {
      if (!active) return;
      setSession(null);
      updateSession(null);
      setLoading(false);
      setError(authErrorMessage(failure));
    };
    try {
      const auth = getFirebaseAuth();
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          if (!active) return;
          if (user) acceptUser(user);
          else publish(isGuest() ? guestSession : null);
        },
        fail,
      );
      return () => {
        active = false;
        unsubscribe();
      };
    } catch (failure) {
      fail(failure);
      return () => {
        active = false;
      };
    }
  }, [acceptUser, publish]);

  const signOut = async () => {
    const wasGuest = isGuest();
    rememberGuest(false);
    try {
      await logoutFirebase();
      const current = getFirebaseAuth().currentUser;
      if (current) acceptUser(current);
      else publish(null);
    } catch (failure) {
      rememberGuest(wasGuest);
      throw failure;
    }
  };
  const continueAsGuest = async () => {
    const wasGuest = isGuest();
    rememberGuest(true);
    try {
      await logoutFirebase();
      const current = getFirebaseAuth().currentUser;
      if (current) acceptUser(current);
      else publish(guestSession);
    } catch (failure) {
      rememberGuest(wasGuest);
      throw failure;
    }
  };

  const value: AuthContextValue = {
    session,
    loading,
    error,
    signInWithGoogle: async () => finishSignIn(await loginWithGoogle()),
    signInWithGitHub: async () => finishSignIn(await loginWithGitHub()),
    signInWithEmail: async (email, password, remember) =>
      finishSignIn(await loginWithEmail(email, password, remember)),
    signUpWithEmail: async (name, email, password) =>
      finishSignIn(await registerWithEmail(name, email, password)),
    resetPassword: requestPasswordReset,
    signOut,
    continueAsGuest,
  };
  // Remount route state when identity changes, so a mounted project editor never
  // keeps another account's files or effects after sign-out/account switching.
  const identity = loading ? "restoring" : session?.uid || session?.mode || "signed-out";
  return (
    <AuthContext.Provider value={value}>
      <Fragment key={identity}>{children}</Fragment>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider.");
  return context;
}
