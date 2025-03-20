
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { toast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  requestRoleElevation: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        // Get current auth user
        const { data: authData } = await supabase.auth.getUser();
        
        if (authData.user) {
          // If we have an auth user, get their profile data
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("auth_id", authData.user.id)
            .single();
          
          if (error) {
            console.error("Error fetching user profile:", error);
            setUser(null);
          } else {
            setUser(data);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth error:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        // Fetch user profile when signed in
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("auth_id", session.user.id)
          .single();
        
        if (!error) {
          setUser(data);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in.",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error("Sign in error:", error);
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password 
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error("Failed to create user");
      
      // Create user profile
      const { error: profileError } = await supabase
        .from("users")
        .insert([{ 
          auth_id: authData.user.id,
          email,
          name: userData.name || '',
          phone: userData.phone,
          passout_year: userData.passout_year,
          admission_year: userData.admission_year,
          course: userData.course,
          department: userData.department,
          college: userData.college,
          type: 'attendee', // Default role
          role_elevation_requested: false
        }]);
      
      if (profileError) throw profileError;
      
      toast({
        title: "Account created!",
        description: "Welcome to NextFest. You've successfully signed up.",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error("Sign up error:", error);
      toast({
        title: "Sign up failed",
        description: error.message || "Please try again with different credentials.",
        variant: "destructive",
      });
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
      navigate("/login");
    } catch (error: any) {
      console.error("Sign out error:", error);
      toast({
        title: "Sign out failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("users")
        .update(data)
        .eq("id", user.id);
      
      if (error) throw error;
      
      // Update local user state
      setUser(prev => prev ? { ...prev, ...data } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      console.error("Update profile error:", error);
      toast({
        title: "Update failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  const requestRoleElevation = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ role_elevation_requested: true })
        .eq("id", user.id);
      
      if (error) throw error;
      
      // Update local user state
      setUser(prev => prev ? { ...prev, role_elevation_requested: true } : null);
      
      toast({
        title: "Request submitted",
        description: "Your request for role elevation has been submitted and is pending approval.",
      });
    } catch (error: any) {
      console.error("Role elevation request error:", error);
      toast({
        title: "Request failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        signIn, 
        signUp, 
        signOut, 
        updateProfile,
        requestRoleElevation
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
