import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  const checkAuthentication = async () => {
    try {
      await api.get("/api/auth/me");

      setIsAuthenticated(true);
      return true;
    } catch (error) {
      setIsAuthenticated(false);
      return false;
    }
  };

  useEffect(() => {
    checkAuthentication();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        checkAuthentication,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}