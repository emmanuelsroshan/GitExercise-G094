import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI, profileAPI, messagesAPI } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [profile, setProfile] = useState(null);
  const [unread,  setUnread]  = useState(0);
  const [loading, setLoading] = useState(true);

  // ── Restore session from localStorage ────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("sc_token");
    if (!token) { setLoading(false); return; }
    profileAPI.getOwn()
      .then(({ data }) => {
        setUser(data.user);
        setProfile(data.profile);
      })
      .catch(() => localStorage.removeItem("sc_token"))
      .finally(() => setLoading(false));
  }, []);

  // ── Poll unread count every 10 s ─────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    const tick = () =>
      messagesAPI.unread()
        .then(({ data }) => setUnread(data.count))
        .catch(() => {});
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, [user]);

  // ── Auth actions ──────────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    localStorage.setItem("sc_token", data.token);
    setUser(data.user);
    const pRes = await profileAPI.getOwn();
    setProfile(pRes.data.profile);
    return data.user;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authAPI.register(formData);
    localStorage.setItem("sc_token", data.token);
    setUser(data.user);
    setProfile(data.profile || null);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sc_token");
    setUser(null);
    setProfile(null);
    setUnread(0);
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data } = await profileAPI.getOwn();
    setUser(data.user);
    setProfile(data.profile);
    return data;
  }, []);

  const saveProfile = useCallback(async (profileData) => {
    const { data } = await profileAPI.update(profileData);
    setProfile(data.profile);
    if (data.user) setUser(data.user);
    return data;
  }, []);

  return (
    <AuthContext.Provider value={{
      user, profile, unread, loading,
      login, register, logout, refreshProfile, saveProfile,
      setUnread,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
