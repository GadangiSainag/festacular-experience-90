
import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { AuthState, LoginCredentials, SignupCredentials } from "@/types/auth";
import { toast } from "sonner";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  requestRoleElevation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    // Check for active session on mount
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) throw error;
          
          setAuthState({
            user: userData,
            session,
            isLoading: false,
            error: null,
          });
        } else {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error("Session check error:", error);
        setAuthState({
          user: null,
          session: null,
          isLoading: false,
          error: "Failed to retrieve session",
        });
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (!error) {
            setAuthState({
              user: userData,
              session,
              isLoading: false,
              error: null,
            });
          }
        } else {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            error: null,
          });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) throw error;
      
      toast.success("Logged in successfully");
      navigate("/profile");
    } catch (error: any) {
      console.error("Login error:", error);
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || "Failed to login" 
      }));
      toast.error(error.message || "Failed to login");
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
          },
        },
      });
      
      if (error) throw error;
      
      toast.success("Account created successfully! Please check your email for verification.");
    } catch (error: any) {
      console.error("Signup error:", error);
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || "Failed to sign up" 
      }));
      toast.error(error.message || "Failed to sign up");
    }
  };

  const logout = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        error: null,
      });
      
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error: any) {
      console.error("Logout error:", error);
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || "Failed to logout" 
      }));
      toast.error(error.message || "Failed to logout");
    }
  };

  const requestRoleElevation = async () => {
    try {
      if (!authState.user) {
        throw new Error("You must be logged in to request role elevation");
      }
      
      const { error } = await supabase
        .from('users')
        .update({ role_elevation_requested: true })
        .eq('id', authState.user.id);
      
      if (error) throw error;
      
      // Update local state
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, role_elevation_requested: true } : null,
      }));
      
      toast.success("Role elevation requested successfully");
    } catch (error: any) {
      console.error("Role elevation request error:", error);
      toast.error(error.message || "Failed to request role elevation");
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        ...authState, 
        login, 
        signup, 
        logout,
        requestRoleElevation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
