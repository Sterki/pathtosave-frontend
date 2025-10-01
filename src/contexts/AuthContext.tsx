import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string
  ) => Promise<{ data: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  getAccessToken: () => string | null;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  clearCorruptedSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener la sesión inicial
    const getInitialSession = async () => {
      try {
        // Verificar localStorage antes de llamar getSession
        const allKeys = Object.keys(localStorage);
        const supabaseKeys = allKeys.filter((key) => key.includes("sb-"));

        // Si hay datos en localStorage, intentar restaurar la sesión manualmente
        if (supabaseKeys.length > 0) {
          // Intentar restaurar la sesión desde localStorage
          const authTokenKey = supabaseKeys.find((key) =>
            key.includes("auth-token")
          );
          if (authTokenKey) {
            try {
              const tokenData = JSON.parse(
                localStorage.getItem(authTokenKey) || "{}"
              );
              if (
                tokenData.access_token &&
                tokenData.user &&
                tokenData.expires_at
              ) {
                // Verificar si el token está expirado
                if (isTokenExpired(tokenData.expires_at)) {
                  // Si está expirado, intentar usar el refresh token
                  if (tokenData.refresh_token) {
                    try {
                      const { data, error } =
                        await supabase.auth.refreshSession({
                          refresh_token: tokenData.refresh_token,
                        });
                      if (error) {
                        console.error("Token refresh failed:", error);
                      } else {
                        setSession(data.session);
                        setUser(data.user);
                        setLoading(false);
                        return;
                      }
                    } catch (refreshError) {
                      console.error("Error refreshing token:", refreshError);
                    }
                  }
                  // Si el refresh falla, limpiar la sesión
                  localStorage.removeItem(authTokenKey);
                  setSession(null);
                  setUser(null);
                  setLoading(false);
                  return;
                } else {
                  // Crear una sesión temporal para evitar el signOut automático
                  setSession({
                    access_token: tokenData.access_token,
                    refresh_token: tokenData.refresh_token,
                    expires_in: tokenData.expires_in,
                    expires_at: tokenData.expires_at,
                    user: tokenData.user,
                    token_type: tokenData.token_type,
                  } as any);
                  setUser(tokenData.user);
                  setLoading(false);
                  return; // Salir temprano si la restauración manual fue exitosa
                }
              }
            } catch (error) {
              console.error("Error in manual session restoration:", error);
            }
          }
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          setSession(null);
          setUser(null);
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error("Error in getInitialSession:", error);
        setSession(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Escuchar cambios en el estado de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Ignorar SIGNED_OUT automático si hay datos válidos en localStorage
      if (
        event === "SIGNED_OUT" &&
        Object.keys(localStorage).some((key) => key.includes("sb-"))
      ) {
        return; // Ignorar este evento automático
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Manejar eventos específicos
      if (event === "SIGNED_OUT") {
        setSession(null);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const getAccessToken = () => {
    return session?.access_token ?? null;
  };

  // Método para verificar si un token está expirado
  const isTokenExpired = (expiresAt: number): boolean => {
    const now = Math.floor(Date.now() / 1000);
    return now >= expiresAt;
  };

  // Método para limpiar tokens corruptos
  const clearCorruptedSession = async () => {
    try {
      // Limpiar localStorage de Supabase
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.includes("sb-") && key.includes("auth-token")) {
          localStorage.removeItem(key);
        }
      });

      // Forzar sign out
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
    } catch (error) {
      console.error("Error clearing corrupted session:", error);
    }
  };

  const resendConfirmation = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    getAccessToken,
    resendConfirmation,
    clearCorruptedSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
