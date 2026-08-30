import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);

  const checkAuthentication = async () => {
    try {
      const response = await api.get("/api/auth/me");

      setUser(response.data.user);
      console.log(
        "👤 CURRENT USER:",
        JSON.stringify(response.data.user, null, 2)
      );
      setIsAuthenticated(true);

      return true;
    } catch (error) {
      setUser(null);
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
        user,
        setUser,
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