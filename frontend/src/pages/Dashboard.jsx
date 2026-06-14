import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, TrendingUp, MessageCircle, Star, Clock, BookOpen,
  ArrowRight, Zap, Users
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { searchAPI, messagesAPI, requestsAPI } from "../api/client";
import Avatar from "../components/Avatar";
import MatchScore from "../components/MatchScore";
import StatCard from "../components/StatCard";

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function Dashboard() {
  const { user, profile, unread } = useAuth();
  const navigate = useNavigate();
  const [matches,       setMatches]       = useState([]);
  const [conversations, setConversations] = useState([]);
  const [requests,      setRequests]      = useState([]);
  const [loading,       setLoading]       = useState(true);

  const load = useCallback(async () => {
    try {
      const [mRes, cRes, rRes] = await Promise.all([
        searchAPI.search({}),
        messagesAPI.conversations(),
        requestsAPI.list(),
      ]);
      setMatches(mRes.data.slice(0, 4));
      setConversations(cRes.data.slice(0, 4));
      setRequests(rRes.data.filter((r) => r.status === "Open" || r.status === "Accepted").slice(0, 3));
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const isStudent = user?.role === "student";
  const isTutor   = user?.role === "volunteer" || user?.role === "paid";

  const profileCompletion = (() => {
    if (!profile) return 0;
    let s = 0;
    if (profile.university)              s += 20;
    if (profile.course)                  s += 20;
    if ((profile.subjects || []).length) s += 30;
    if (Object.keys(profile.schedule || {}).length) s += 30;
    return s;
  })();

  if (loading) return (
    <div style={{ padding: 32 }}>
      {[1,2,3].map(i => <div key={i} className="shimmer glass" style={{ height: 80, marginBottom: 16, borderRadius: 12 }} />)}
    </div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ maxWidth: 900 }}
    >
      {/* Header */}
      <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: "1.6rem", fontFamily: "var(--font-heading)", marginBottom: 4 }}>
          Welcome back, <span className="gradient-text">{user?.username}</span> 👋
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          {isStudent ? "Your personalized tutor matches are ready" : "Here's what's happening with your tutoring"}
        </p>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={itemVariants} className="grid-3" style={{ marginBottom: 32 }}>
        <StatCard icon={TrendingUp} label="Profile Complete" value={`${profileCompletion}%`} color="purple" />
        <StatCard icon={Users}       label={isStudent ? "Tutor Matches" : "Total Tutors"} value={matches.length} color="blue" />
        <StatCard icon={MessageCircle} label="Unread Messages" value={unread} color="amber" />
      </motion.div>

      {/* Profile completion bar */}
      {profileCompletion < 100 && (
        <motion.div variants={itemVariants} className="glass" style={{ padding: 20, marginBottom: 24, cursor: "pointer" }} onClick={() => navigate("/setup")}>
          <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
            <p style={{ fontSize: "0.875rem", fontWeight: 500 }}>Complete your profile for better matches</p>
            <span style={{ fontSize: "0.8rem", color: "var(--accent-light)" }}>{profileCompletion}%</span>
          </div>
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${profileCompletion}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            />
          </div>
          <p style={{ fontSize: "0.78rem", color: "var(--text-tertiary)", marginTop: 8 }}>Click to edit profile →</p>
        </motion.div>
      )}

      {/* Recommended Tutors (students only) */}
      {isStudent && (
        <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
            <p className="section-title" style={{ margin: 0 }}>Recommended Tutors</p>
            <button className="btn btn-ghost btn-xs" onClick={() => navigate("/search")}>
              See all <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <AnimatePresence>
              {matches.length === 0 && (
                <div className="empty-state glass-sm">
                  <BookOpen size={32} />
                  <p style={{ marginTop: 8 }}>No tutors registered yet.</p>
                  <p style={{ fontSize: "0.78rem", marginTop: 4 }}>Check back soon or invite a tutor!</p>
                </div>
              )}
              {matches.map(({ user: tutor, profile: tProf, score, avg_rating, review_count }, i) => (
                <motion.div
                  key={tutor.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="glass-sm"
                  style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}
                >
                  <Avatar name={tutor.username} size={44} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: 3 }}>
                      <p style={{ fontWeight: 600, fontSize: "0.9rem" }}>{tutor.username}</p>
                      <span className={`badge ${tutor.role === "paid" ? "badge-yellow" : "badge-green"}`}>
                        {tutor.role === "paid" ? `RM${tProf?.rate || "?"}/hr` : "Free"}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                      {(tProf?.subjects || []).slice(0, 3).join(" · ")} {tProf?.university ? `· ${tProf.university}` : ""}
                    </p>
                    {avg_rating && (
                      <div className="flex items-center gap-1" style={{ marginTop: 3 }}>
                        <Star size={12} fill="var(--warning)" color="var(--warning)" />
                        <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{avg_rating.toFixed(1)} ({review_count})</span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <MatchScore score={score.total} size={52} />
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <button className="btn btn-primary btn-xs" onClick={() => navigate(`/tutor/${tutor.id}`)}>View</button>
                      <button className="btn btn-ghost btn-xs" onClick={() => navigate(`/chat?user=${tutor.id}`)}>Chat</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* Active Requests */}
      {requests.length > 0 && (
        <motion.div variants={itemVariants} style={{ marginBottom: 32 }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
            <p className="section-title" style={{ margin: 0 }}>Active Requests</p>
            <button className="btn btn-ghost btn-xs" onClick={() => navigate("/requests")}>
              See all <ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {requests.map((req) => (
              <div key={req.id} className="glass-sm" style={{ padding: "12px 16px" }}>
                <div className="flex items-center justify-between">
                  <div>
                    <p style={{ fontWeight: 500, fontSize: "0.875rem" }}>{req.topic}</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginTop: 2 }}>
                      {req.subject} · {isTutor ? req.student_name : req.tutor_name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className={`badge ${req.urgency === "High" ? "badge-red" : req.urgency === "Medium" ? "badge-yellow" : "badge-green"}`}>{req.urgency}</span>
                    <span className={`badge ${req.status === "Open" ? "badge-blue" : "badge-purple"}`}>{req.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Chats */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
          <p className="section-title" style={{ margin: 0 }}>Recent Conversations</p>
          <button className="btn btn-ghost btn-xs" onClick={() => navigate("/chat")}>
            See all <ArrowRight size={12} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {conversations.length === 0 && (
            <div className="empty-state glass-sm">
              <MessageCircle size={28} />
              <p style={{ marginTop: 8 }}>No conversations yet.</p>
              <p style={{ fontSize: "0.78rem", marginTop: 4 }}>Find a tutor and start chatting!</p>
            </div>
          )}
          {conversations.map((conv) => (
            <motion.div
              key={conv.other_id}
              whileHover={{ scale: 1.005 }}
              className="glass-sm"
              style={{ padding: "12px 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 12 }}
              onClick={() => navigate(`/chat?user=${conv.other_id}`)}
            >
              <div style={{ position: "relative" }}>
                <Avatar name={conv.other_name} size={36} />
                {conv.unread_count > 0 && (
                  <span style={{ position: "absolute", top: -2, right: -2, background: "var(--danger)", borderRadius: "50%", width: 14, height: 14, fontSize: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700 }}>
                    {conv.unread_count}
                  </span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 500, fontSize: "0.875rem" }}>{conv.other_name}</p>
                <p className="truncate" style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>{conv.last_message || "Say hello!"}</p>
              </div>
              <ArrowRight size={14} style={{ color: "var(--text-tertiary)", flexShrink: 0 }} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
