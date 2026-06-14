import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, BookOpen, Heart, DollarSign, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login"); // "login" | "register"
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("student"); // "student" | "tutor_volunteer" | "tutor_paid"

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError("");
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (activeTab === "login") {
        const user = await login(email, password);
        // Redirect logic based on profile completeness
        // If profile details (like university/subjects) are empty, send to setup
        const token = localStorage.getItem("sc_token");
        if (user) {
          navigate("/dashboard");
        }
      } else {
        const user = await register({ username, email, password, role });
        if (user) {
          navigate("/setup");
        }
      }
    } catch (err) {
      setError(
        err?.response?.data?.error || 
        "Authentication failed. Please verify your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="auth-bg"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Decorative Orbs */}
      <div className="orb orb-1" style={{ top: "-10%", left: "-10%", width: "400px", height: "400px" }}></div>
      <div className="orb orb-2" style={{ bottom: "-10%", right: "-10%", width: "450px", height: "450px" }}></div>

      <motion.div
        className="glass"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          width: "100%",
          maxWidth: "450px",
          padding: "2.5rem 2rem",
          borderRadius: "24px",
          zIndex: 10,
          boxShadow: "0 8px 32px 0 rgba(109, 40, 217, 0.15)",
          border: "1px solid rgba(255, 255, 255, 0.08)"
        }}
      >
        {/* Branding header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "60px",
              height: "60px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))",
              boxShadow: "0 0 20px rgba(124, 58, 237, 0.4)",
              marginBottom: "1rem"
            }}
          >
            <GraduationCap size={32} color="#fff" />
          </div>
          <h1 className="gradient-text font-outfit" style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            StudyConnect
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.95rem", marginTop: "0.25rem" }}>
            Connect. Learn. Grow.
          </p>
        </div>

        {/* Auth Tabs */}
        <div
          style={{
            display: "flex",
            background: "rgba(255, 255, 255, 0.04)",
            padding: "0.25rem",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            marginBottom: "2rem",
            position: "relative"
          }}
        >
          <button
            onClick={() => handleTabChange("login")}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: activeTab === "login" ? "#fff" : "rgba(255,255,255,0.4)",
              padding: "0.75rem 0.5rem",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.95rem",
              position: "relative",
              zIndex: 2,
              transition: "color 0.2s"
            }}
          >
            Login
            {activeTab === "login" && (
              <motion.div
                layoutId="activeTabIndicator"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(124, 58, 237, 0.15)",
                  border: "1px solid rgba(124, 58, 237, 0.3)",
                  borderRadius: "10px",
                  zIndex: -1
                }}
              />
            )}
          </button>
          <button
            onClick={() => handleTabChange("register")}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              color: activeTab === "register" ? "#fff" : "rgba(255,255,255,0.4)",
              padding: "0.75rem 0.5rem",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: "0.95rem",
              position: "relative",
              zIndex: 2,
              transition: "color 0.2s"
            }}
          >
            Register
            {activeTab === "register" && (
              <motion.div
                layoutId="activeTabIndicator"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(124, 58, 237, 0.15)",
                  border: "1px solid rgba(124, 58, 237, 0.3)",
                  borderRadius: "10px",
                  zIndex: -1
                }}
              />
            )}
          </button>
        </div>

        {/* Error Notification */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.25)",
                padding: "0.75rem 1rem",
                borderRadius: "12px",
                color: "#fca5a5",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1.5rem"
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Authentication Form */}
        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <AnimatePresence mode="wait">
            {activeTab === "register" && (
              <motion.div
                key="register-fields"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: "hidden", display: "flex", flexDirection: "column", gap: "1.25rem" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>Username</label>
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={activeTab === "register"}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "10px",
                      padding: "0.75rem 1rem",
                      color: "#fff",
                      outline: "none",
                      fontSize: "0.95rem"
                    }}
                  />
                </div>

                {/* Role Cards Selector */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label style={{ fontSize: "0.85rem", fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>Select Role</label>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {[
                      { id: "student", label: "Student", icon: BookOpen, desc: "Seek help" },
                      { id: "tutor_volunteer", label: "Volunteer", icon: Heart, desc: "Teach free" },
                      { id: "tutor_paid", label: "Paid Tutor", icon: DollarSign, desc: "Paid tuition" }
                    ].map((roleOpt) => {
                      const Icon = roleOpt.icon;
                      const isSelected = role === roleOpt.id;
                      return (
                        <button
                          key={roleOpt.id}
                          type="button"
                          onClick={() => setRole(roleOpt.id)}
                          style={{
                            flex: 1,
                            background: isSelected ? "rgba(124, 58, 237, 0.15)" : "rgba(255, 255, 255, 0.02)",
                            border: isSelected ? "1.5px solid var(--accent-purple)" : "1.5px solid rgba(255, 255, 255, 0.05)",
                            borderRadius: "12px",
                            padding: "0.75rem 0.5rem",
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "0.25rem",
                            textAlign: "center",
                            transition: "all 0.2s"
                          }}
                        >
                          <Icon size={18} color={isSelected ? "var(--accent-purple)" : "rgba(255,255,255,0.4)"} />
                          <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: isSelected ? "#fff" : "rgba(255,255,255,0.7)" }}>
                            {roleOpt.label}
                          </span>
                          <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.4)" }}>
                            {roleOpt.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>Email Address</label>
            <input
              type="email"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                padding: "0.75rem 1rem",
                color: "#fff",
                outline: "none",
                fontSize: "0.95rem"
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                padding: "0.75rem 1rem",
                color: "#fff",
                outline: "none",
                fontSize: "0.95rem"
              }}
            />
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))",
              border: "none",
              borderRadius: "12px",
              padding: "0.85rem",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: "pointer",
              marginTop: "0.5rem",
              boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "filter 0.2s"
            }}
          >
            {loading ? "Authenticating..." : activeTab === "login" ? "Log In" : "Create Account"}
          </motion.button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <span style={{ fontSize: "0.75rem", color: "rgba(255, 255, 255, 0.35)" }}>
            Tip: Demo credentials. All passwords work on setup.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
