import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useLocation, Navigate, Outlet } from "react-router-dom";
import { authClient } from "../lib/auth-client"; // Adjust path as needed
import type { Location } from "react-router-dom";

// === Interfaces ===

interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  username?: string | null;
  displayUsername?: string | null;
  role?: string | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface Session {
  id: string;
  userId: string;
  token: string;
  createdAt: Date;
  expiresAt: Date;
  updatedAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  impersonatedBy?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  logout: () => void;
}

// === Context ===
const AuthContext = createContext<AuthContextType | null>(null);

// === Custom Hook ===
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// === Auth Provider ===
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: sessionData, error } = await authClient.getSession();

        if (error || !sessionData) {
          console.warn("No valid session:", error);
          setUser(null);
          setSession(null);
          setIsLoading(false);
          return;
        }
        console.log(`session data : ${sessionData}`)
        const { user: userData, session: sessionObj } = sessionData;

        // Transform and sanitize user
        const transformedUser: User = {
          id: userData.id,
          name: userData.name ?? "Unknown User",
          email: userData.email,
          emailVerified: Boolean(userData.emailVerified),
          username: userData.username ?? null,
          displayUsername: userData.displayUsername ?? null,
          role: userData.role ?? null,
          banned: userData.banned ?? false,
          banReason: userData.banReason ?? null,
          banExpires: userData.banExpires ? new Date(userData.banExpires) : null,
          image: userData.image ?? null,
          createdAt: new Date(userData.createdAt),
          updatedAt: new Date(userData.updatedAt),
        };

        // Transform session
        const transformedSession: Session = {
          id: sessionObj.id,
          userId: sessionObj.userId,
          token: sessionObj.token,
          createdAt: new Date(sessionObj.createdAt),
          expiresAt: new Date(sessionObj.expiresAt),
          updatedAt: new Date(sessionObj.updatedAt),
          ipAddress: sessionObj.ipAddress ?? null,
          userAgent: sessionObj.userAgent ?? null,
          impersonatedBy: sessionObj.impersonatedBy ?? null,
        };

        setUser(transformedUser);
        setSession(transformedSession);
        // setUser(userData);
        // setSession(sessionObj)

      } catch (err) {
        console.error("Failed to initialize auth:", err);
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const logout = async () => {
    await authClient.signOut();
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    isLoading,
    setUser,
    setSession,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
interface RequireAuthLocationState {
  from: Location;
}

export const RequireAuth = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="loading">Loading...</div>; // Or a spinner
  }

   if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ from: location } as RequireAuthLocationState}
        replace
      />
    );
  }

  return <Outlet />;
};