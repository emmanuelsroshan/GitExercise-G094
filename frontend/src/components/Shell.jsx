import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Home,
  Search,
  MessageCircle,
  FileText,
  User,
  Shield,
  LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Avatar from "./Avatar";

export default function Shell({ children }) {
  const { user, profile, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // If no user, we shouldn't show the shell
  if (!user) return <>{children}</>;

  const menuItems = [
    { label: "Dashboard", path: "/dashboard", icon: Home },
    { label: "Find Tutors", path: "/search", icon: Search },
    {
      label: "Messages",
      path: "/chat",
      icon: MessageCircle,
      badge: profile?.unreadCount || 0
    },
    { label: "Requests", path: "/requests", icon: FileText },
    { label: "My Profile", path: "/profile", icon: User }
  ];

  if (user.role === "admin") {
    menuItems.push({ label: "Admin Panel", path: "/admin", icon: Shield });
  }

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  const currentPath = location.pathname;

  return (
    <div className="app-container" style={{ display: "flex", minHeight: "100vh" }}>
      {/* Decorative Orbs */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>

      {/* Sidebar navigation */}
      <motion.aside
        className="sidebar"
        initial={{ x: -280, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="sidebar-brand">
          <GraduationCap size={32} className="text-purple" style={{ marginRight: "0.75rem" }} />
          <span className="gradient-text font-outfit" style={{ fontSize: "1.4rem", fontWeight: "bold" }}>
            StudyConnect
          </span>
        </div>

        <nav className="sidebar-nav" style={{ flexGrow: 1, marginTop: "2rem" }}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || currentPath.startsWith(item.path + "/");
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`nav-item ${isActive ? "active" : ""}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      textDecoration: "none",
                      color: isActive ? "#ffffff" : "rgba(255,255,255,0.6)",
                      backgroundColor: isActive ? "rgba(124, 58, 237, 0.15)" : "transparent",
                      transition: "all 0.2s ease",
                      border: isActive ? "1px solid rgba(124, 58, 237, 0.25)" : "1px solid transparent"
                    }}
                  >
                    <Icon size={20} style={{ marginRight: "1rem" }} />
                    <span style={{ fontSize: "0.95rem", fontWeight: 500 }}>{item.label}</span>
                    {item.badge > 0 && (
                      <span
                        className="badge badge-purple"
                        style={{
                          marginLeft: "auto",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "10px",
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          background: "var(--accent-purple)",
                          boxShadow: "0 0 10px rgba(124, 58, 237, 0.5)"
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer User Details */}
        <div
          className="sidebar-footer"
          style={{
            paddingTop: "1.5rem",
            borderTop: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Avatar name={user.username} size={42} />
            <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  color: "#fff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}
              >
                {user.username}
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "capitalize"
                }}
              >
                {user.role === "tutor_paid"
                  ? "Paid Tutor"
                  : user.role === "tutor_volunteer"
                  ? "Volunteer Tutor"
                  : user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              style={{
                marginLeft: "auto",
                background: "transparent",
                border: "none",
                color: "rgba(255,255,255,0.4)",
                cursor: "pointer",
                padding: "0.5rem",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--error-red)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </motion.aside>

      <main className="main-content" style={{ flexGrow: 1, padding: "2rem", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
