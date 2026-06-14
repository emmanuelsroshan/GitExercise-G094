import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminAPI } from "../api/client";
import {
  Users,
  Shield,
  Trash2,
  Lock,
  Unlock,
  Activity,
  Award,
  BookOpen,
  PieChart,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import Avatar from "../components/Avatar";
import Badge from "../components/Badge";

export default function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Redirection guard
  useEffect(() => {
    if (user && user.role !== "admin") {
      navigate("/dashboard");
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, statsRes, analyticsRes] = await Promise.all([
        adminAPI.users(),
        adminAPI.stats(),
        adminAPI.analytics()
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      setError("Failed to load administration dashboards. Please verify you are logged in as admin.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "admin") {
      fetchData();
    }
  }, [user]);

  const handleToggleStatus = async (targetUser) => {
    setUpdatingId(targetUser.id);
    const updatedStatus = targetUser.is_active ? 0 : 1;
    try {
      await adminAPI.updateUser(targetUser.id, { is_active: updatedStatus });
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUser.id ? { ...u, is_active: updatedStatus } : u))
      );
      // Refresh stats
      const statsRes = await adminAPI.stats();
      setStats(statsRes.data);
    } catch (err) {
      alert("Failed to update user status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (uid) => {
    if (!window.confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    try {
      await adminAPI.deleteUser(uid);
      setUsers((prev) => prev.filter((u) => u.id !== uid));
      // Refresh stats and analytics
      const [statsRes, analyticsRes] = await Promise.all([adminAPI.stats(), adminAPI.analytics()]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  if (loading && !users.length) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div className="loader">Loading Admin Panel...</div>
      </div>
    );
  }

  // Helper variables for analytics charts
  const subjectDemand = analytics?.subject_demand || [];
  const registrationTrend = analytics?.registration_trend || [];
  const requestStatus = analytics?.request_status || {};
  const tutorPerformance = analytics?.tutor_performance || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="font-outfit" style={{ fontSize: "2rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Shield className="text-purple" /> Admin Administration Panel
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.5)", marginTop: "0.25rem", fontSize: "0.95rem" }}>
            Monitor matches, manage accounts, and analyze platform operations.
          </p>
        </div>
        <button
          onClick={fetchData}
          className="btn-secondary"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem" }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            padding: "0.75rem 1rem",
            borderRadius: "12px",
            color: "#fca5a5",
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards Row */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
          {[
            { label: "Total Accounts", val: stats.total_users, icon: Users, color: "purple" },
            { label: "Active Tutors", val: stats.active_tutors, icon: Award, color: "green" },
            { label: "Tutoring Sessions", val: stats.total_sessions, icon: Activity, color: "blue" },
            { label: "Pending Requests", val: stats.open_requests, icon: BookOpen, color: "amber" },
            { label: "Avg Platform Rating", val: stats.avg_rating ? `${stats.avg_rating.toFixed(1)} / 5.0` : "0.0", icon: PieChart, color: "purple" }
          ].map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                className="glass-sm"
                style={{
                  padding: "1.25rem",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem"
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: `rgba(124, 58, 237, 0.15)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Icon size={20} className="text-purple" />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>{card.label}</span>
                  <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "#fff" }}>{card.val}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Charts / Data Insights Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {/* Subject Demand Chart */}
        <div className="glass" style={{ padding: "1.5rem", borderRadius: "18px" }}>
          <h3 className="font-outfit" style={{ margin: "0 0 1.25rem 0", fontSize: "1.1rem", fontWeight: 700 }}>
            Subject Popularity & Demand
          </h3>
          {subjectDemand.length === 0 ? (
            <div style={{ height: "150px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.3)" }}>
              No subjects registered yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {subjectDemand.slice(0, 6).map((sub, idx) => {
                const maxVal = Math.max(...subjectDemand.map((d) => d.count)) || 1;
                const pct = (sub.count / maxVal) * 100;
                return (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
                      <span>{sub.subject}</span>
                      <span style={{ fontWeight: "bold" }}>{sub.count} tutors</span>
                    </div>
                    <div style={{ height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "4px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "var(--accent-purple)", borderRadius: "4px" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Requests Breakdown and Best Tutors */}
        <div className="glass" style={{ padding: "1.5rem", borderRadius: "18px", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h3 className="font-outfit" style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
            Session Requests Breakdown
          </h3>
          
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
            {[
              { label: "Open", key: "Open", color: "var(--accent-blue)" },
              { label: "Accepted", key: "Accepted", color: "var(--accent-purple)" },
              { label: "Completed", key: "Completed", color: "var(--accent-green)" },
              { label: "Cancelled", key: "Cancelled", color: "var(--error-red)" }
            ].map((stat) => {
              const val = requestStatus[stat.key] || 0;
              return (
                <div
                  key={stat.label}
                  style={{
                    flex: 1,
                    minWidth: "80px",
                    background: "rgba(255,255,255,0.02)",
                    padding: "0.75rem",
                    borderRadius: "10px",
                    border: "1px solid rgba(255,255,255,0.05)",
                    textAlign: "center"
                  }}
                >
                  <span style={{ display: "block", fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", textTransform: "uppercase" }}>
                    {stat.label}
                  </span>
                  <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: stat.color }}>{val}</span>
                </div>
              );
            })}
          </div>

          <h3 className="font-outfit" style={{ margin: "0.5rem 0 0 0", fontSize: "1.1rem", fontWeight: 700 }}>
            Top Rated Tutors
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {tutorPerformance.length === 0 ? (
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.35)", textAlign: "center", padding: "1rem" }}>
                No ratings submitted yet.
              </span>
            ) : (
              tutorPerformance.slice(0, 3).map((tut) => (
                <div
                  key={tut.reviewee_id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    background: "rgba(255,255,255,0.02)",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "8px"
                  }}
                >
                  <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{tut.username}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.8rem" }}>
                    <Star size={12} fill="var(--accent-amber)" className="text-amber" />
                    <strong>{tut.avg_rating}</strong> ({tut.review_count} ratings)
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="glass" style={{ padding: "1.5rem", borderRadius: "18px" }}>
        <h3 className="font-outfit" style={{ margin: "0 0 1.25rem 0", fontSize: "1.2rem", fontWeight: 700 }}>
          User Accounts Management ({users.length})
        </h3>
        
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontSize: "0.8rem" }}>
                <th style={{ padding: "0.75rem" }}>User</th>
                <th style={{ padding: "0.75rem" }}>Email</th>
                <th style={{ padding: "0.75rem" }}>Role</th>
                <th style={{ padding: "0.75rem" }}>University</th>
                <th style={{ padding: "0.75rem" }}>Status</th>
                <th style={{ padding: "0.75rem", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    fontSize: "0.9rem",
                    color: "rgba(255,255,255,0.8)"
                  }}
                >
                  <td style={{ padding: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Avatar name={u.username} size={30} />
                    <strong>{u.username}</strong>
                  </td>
                  <td style={{ padding: "0.75rem" }}>{u.email}</td>
                  <td style={{ padding: "0.75rem", textTransform: "capitalize" }}>
                    {u.role === "paid" ? "Paid Tutor" : u.role === "volunteer" ? "Volunteer Tutor" : u.role}
                  </td>
                  <td style={{ padding: "0.75rem" }}>{u.university || "-"}</td>
                  <td style={{ padding: "0.75rem" }}>
                    <Badge variant={u.is_active ? "green" : "red"}>
                      {u.is_active ? "Active" : "Suspended"}
                    </Badge>
                  </td>
                  <td style={{ padding: "0.75rem", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                      {u.role !== "admin" && (
                        <>
                          <button
                            onClick={() => handleToggleStatus(u)}
                            disabled={updatingId === u.id}
                            className="btn-secondary"
                            style={{
                              padding: "0.4rem",
                              borderRadius: "6px",
                              display: "inline-flex",
                              alignItems: "center"
                            }}
                            title={u.is_active ? "Suspend Account" : "Activate Account"}
                          >
                            {u.is_active ? <Lock size={14} /> : <Unlock size={14} />}
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="btn-secondary"
                            style={{
                              padding: "0.4rem",
                              borderRadius: "6px",
                              display: "inline-flex",
                              alignItems: "center",
                              borderColor: "rgba(239, 68, 68, 0.2)"
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--error-red)")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "")}
                            title="Delete Account"
                          >
                            <Trash2 size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
