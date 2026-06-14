import { motion } from "framer-motion";
import { Clock, BookOpen, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

const URGENCY_LABEL = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const STATUS_LABEL = {
  open: "Open",
  accepted: "Accepted",
  completed: "Completed",
  cancelled: "Cancelled",
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function RequestCard({ request, onAction, isTutor = false }) {
  const {
    id,
    subject,
    topic,
    description,
    type,
    urgency,
    status,
    student_name,
    tutor_name,
    created_at,
  } = request || {};

  const statusLower = (status || "").toLowerCase();
  const urgencyLower = (urgency || "").toLowerCase();

  function handleAction(action) {
    if (onAction) onAction(id, action);
  }

  return (
    <motion.div
      className="glass-sm"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        padding: "1.25rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
      }}
    >
      {/* Top row: badges */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        {subject && (
          <span className="badge badge-purple">{subject}</span>
        )}
        {urgency && (
          <span className={`badge urgency-${urgencyLower}`}>
            {URGENCY_LABEL[urgencyLower] || urgency} Priority
          </span>
        )}
        {status && (
          <span className={`badge status-${statusLower}`}>
            {STATUS_LABEL[statusLower] || status}
          </span>
        )}
        {type && (
          <span className="badge badge-blue" style={{ marginLeft: "auto" }}>
            {type}
          </span>
        )}
      </div>

      {/* Topic heading */}
      <div>
        <h3
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {topic || "Untitled Request"}
        </h3>
        {description && (
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--text-secondary)",
              margin: "0.35rem 0 0",
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Meta row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        {isTutor && student_name && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.78rem",
              color: "var(--text-tertiary)",
            }}
          >
            <BookOpen size={13} />
            <span>Student: {student_name}</span>
          </div>
        )}
        {!isTutor && tutor_name && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.78rem",
              color: "var(--text-tertiary)",
            }}
          >
            <BookOpen size={13} />
            <span>Tutor: {tutor_name}</span>
          </div>
        )}
        {created_at && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              fontSize: "0.78rem",
              color: "var(--text-tertiary)",
              marginLeft: "auto",
            }}
          >
            <Clock size={13} />
            <span>{timeAgo(created_at)}</span>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {onAction && (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            borderTop: "1px solid var(--border)",
            paddingTop: "0.75rem",
            marginTop: "0.1rem",
          }}
        >
          {isTutor && statusLower === "open" && (
            <>
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleAction("accept")}
                style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                <CheckCircle2 size={14} />
                Accept
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleAction("decline")}
                style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
              >
                <XCircle size={14} />
                Decline
              </button>
            </>
          )}

          {isTutor && statusLower === "accepted" && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleAction("complete")}
              style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
            >
              <CheckCircle2 size={14} />
              Mark Complete
            </button>
          )}

          {!isTutor && statusLower === "open" && (
            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleAction("cancel")}
              style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}
            >
              <XCircle size={14} />
              Cancel Request
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
