import { createContext, useContext, useState, useEffect } from "react";
import apiService from "../utils/apiService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data and token on app load
    const storedUser = localStorage.getItem("eventpro_user");
    const storedToken = localStorage.getItem("eventpro_token");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      apiService.setToken(storedToken);

      // Verify token is still valid
      apiService
        .getCurrentUser()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem("eventpro_user", JSON.stringify(userData));
        })
        .catch(() => {
          // Token is invalid, clear stored data
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiService.login(email, password);
      setUser(response.user);
      localStorage.setItem("eventpro_user", JSON.stringify(response.user));
      return response;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password, role = "subscriber") => {
    try {
      const response = await apiService.register(name, email, password, role);
      setUser(response.user);
      localStorage.setItem("eventpro_user", JSON.stringify(response.user));
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("eventpro_user");
      localStorage.removeItem("eventpro_token");
    }
  };

  const updateUser = async (updatedData) => {
    if (!user) return;

    try {
      const updatedUserData = await apiService.updateUser(user.id, updatedData);

      // Merge updated fields with the existing user
      const newUser = { ...user, ...updatedUserData };
      setUser(newUser);
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isOrganizer: user?.role === "organizer" || user?.role === "admin",
    isSubscriber:
      user?.role === "subscriber" ||
      user?.role === "organizer" ||
      user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
