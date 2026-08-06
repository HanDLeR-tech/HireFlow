import { useEffect, useMemo, useState } from "react";
import AuthContext from "./authContext.jsx";
import { setAxiosAuthTokenGetter } from "../lib/axios.js";
import axiosInstance from "../lib/axios.js";

export default function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Keep axios in sync with the latest access token
  useEffect(() => {
    setAxiosAuthTokenGetter(() => accessToken);
  }, [accessToken]);

  // Restore session when the app starts
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data } = await axiosInstance.post("/auth/refresh");

        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch (error) {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Logout
  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      accessToken,
      setAccessToken,

      user,
      setUser,

      loading,
      setLoading,

      isAuthenticated: !!accessToken,

      logout,
    }),
    [accessToken, user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}