import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Star, DollarSign, Heart, SlidersHorizontal, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { searchAPI } from "../api/client";
import Avatar from "../components/Avatar";
import MatchScore from "../components/MatchScore";

const SUBJECTS = ["Mathematics","Physics","Programming","English","Chemistry","Biology","Economics","Accounting","Data Science","Statistics"];

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function SearchPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [results,     setResults]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [subject,     setSubject]     = useState("");
  const [tutorType,   setTutorType]   = useState("all");
  const [university,  setUniversity]  = useState("");
  const [minRating,   setMinRating]   = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searched,    setSearched]    = useState(false);

  const doSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);
    try {
      const params = { subject, type: tutorType };
      if (university) params.university = university;
      if (minRating)  params.min_rating = minRating;
      const { data } = await searchAPI.search(params);
      setResults(data);
    } catch (_) { setResults([]); }
    setLoading(false);
  }, [subject, tutorType, university, minRating]);

  useEffect(() => { doSearch(); }, []);

  const clearFilters = () => {
    setSubject(""); setTutorType("all"); setUniversity(""); setMinRating("");
  };

  const hasFilters = subject || tutorType !== "all" || university || minRating;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.5rem", fontFamily: "var(--font-heading)", marginBottom: 4 }}>
          Find a <span className="gradient-text">Tutor</span>
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
          Matched by subject, schedule, and rating
        </p>
      </div>

      {/* Search bar */}
      <div className="glass" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: showFilters ? 16 : 0 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--text-tertiary)" }} />
            <select
              className="input"
              style={{ paddingLeft: 36 }}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="">All Subjects</option>
              {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="btn btn-primary"
            onClick={doSearch}
            disabled={loading}
          >
            {loading ? "Searching…" : <><Search size={15} /> Search</>}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="btn btn-ghost"
            onClick={() => setShowFilters((v) => !v)}
            style={{ position: "relative" }}
          >
            <SlidersHorizontal size={15} />
            Filters
            {hasFilters && <span className="notif-dot" style={{ top: 4, right: 4, width: 7, height: 7 }} />}
          </motion.button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div className="divider" style={{ marginTop: 0 }} />
              <div className="grid-3" style={{ gap: 12 }}>
                <div>
                  <label className="label">Tutor Type</label>
                  <select className="input" value={tutorType} onChange={(e) => setTutorType(e.target.value)}>
                    <option value="all">All Types</option>
                    <option value="volunteer">Volunteer (Free)</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="label">University</label>
                  <input className="input" placeholder="e.g. Sunway University" value={university} onChange={(e) => setUniversity(e.target.value)} />
                </div>
                <div>
                  <label className="label">Min. Rating</label>
                  <select className="input" value={minRating} onChange={(e) => setMinRating(e.target.value)}>
                    <option value="">Any Rating</option>
                    <option value="3">3+ ★</option>
                    <option value="4">4+ ★</option>
                    <option value="4.5">4.5+ ★</option>
                  </select>
                </div>
              </div>
              {hasFilters && (
                <button className="btn btn-ghost btn-xs" style={{ marginTop: 12 }} onClick={clearFilters}>
                  <X size={12} /> Clear filters
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Subject chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
        <button className={`chip ${!subject ? "active" : ""}`} onClick={() => { setSubject(""); doSearch(); }}>All</button>
        {SUBJECTS.slice(0, 6).map((s) => (
          <button key={s} className={`chip ${subject === s ? "active" : ""}`} onClick={() => { setSubject(s); setTimeout(doSearch, 0); }}>{s}</button>
        ))}
      </div>

      {/* Results count */}
      {searched && (
        <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginBottom: 16 }}>
          {loading ? "Searching…" : `${results.length} tutor${results.length !== 1 ? "s" : ""} found`}
        </p>
      )}

      {/* Results */}
      <motion.div
        variants={{ show: { transition: { staggerChildren: 0.06 } } }}
        initial="hidden" animate="show"
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <AnimatePresence mode="popLayout">
          {!loading && results.length === 0 && searched && (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="empty-state glass">
              <Search size={36} />
              <p style={{ marginTop: 12, fontWeight: 500 }}>No tutors found</p>
              <p style={{ marginTop: 4, fontSize: "0.8rem" }}>Try adjusting your filters or check back later.</p>
            </motion.div>
          )}

          {results.map(({ user: tutor, profile: tProf, score, avg_rating, review_count }) => (
            <motion.div
              key={tutor.id}
              variants={itemVariants}
              layout
              whileHover={{ y: -2, boxShadow: "0 8px 32px rgba(124,58,237,0.15)" }}
              className="glass"
              style={{ padding: "18px 22px", display: "flex", alignItems: "flex-start", gap: 16, cursor: "pointer" }}
              onClick={() => navigate(`/tutor/${tutor.id}`)}
            >
              <Avatar name={tutor.username} size={48} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
                  <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>{tutor.username}</p>
                  <span className={`badge ${tutor.role === "paid" ? "badge-yellow" : "badge-green"}`}>
                    {tutor.role === "paid" ? <><DollarSign size={10} />RM{tProf?.rate || "?"}/hr</> : <><Heart size={10} />Free</>}
                  </span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: 8 }}>
                  {tProf?.course || "—"} · {tProf?.university || "—"} · {tProf?.year || ""}
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {(tProf?.subjects || []).map((s) => <span key={s} className="badge badge-purple">{s}</span>)}
                </div>
                {avg_rating && (
                  <div className="flex items-center gap-1" style={{ marginTop: 8 }}>
                    {[1,2,3,4,5].map((n) => (
                      <Star key={n} size={12} fill={n <= Math.round(avg_rating) ? "var(--warning)" : "none"} color="var(--warning)" />
                    ))}
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginLeft: 4 }}>
                      {avg_rating.toFixed(1)} ({review_count} review{review_count !== 1 ? "s" : ""})
                    </span>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <MatchScore score={score.total} size={64} />
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <button
                    className="btn btn-primary btn-xs"
                    onClick={(e) => { e.stopPropagation(); navigate(`/tutor/${tutor.id}`); }}
                  >
                    Profile
                  </button>
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/chat?user=${tutor.id}`);
                    }}
                  >
                    Message
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
