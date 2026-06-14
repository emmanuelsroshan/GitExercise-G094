import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, CheckCircle } from "lucide-react";
import { reviewsAPI } from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function ReviewForm({ revieweeId, onSubmitted }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const effectiveRating = hovered || rating;

  async function handleSubmit(e) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await reviewsAPI.add({
        reviewee_id: revieweeId,
        rating,
        comment: comment.trim(),
      });
      setSubmitted(true);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setError(
        err?.response?.data?.error || "Failed to submit review. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0.75rem",
            padding: "2rem 1rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #10b981, #059669)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 16px rgba(16,185,129,0.35)",
            }}
          >
            <CheckCircle size={28} color="#fff" strokeWidth={2.5} />
          </div>
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            Review submitted!
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Thank you for your feedback.
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {/* Star rating */}
          <div>
            <label className="label" style={{ display: "block", marginBottom: "0.5rem" }}>
              Rating
            </label>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "2px",
                    cursor: "pointer",
                    transition: "transform 0.12s",
                    transform:
                      star <= effectiveRating ? "scale(1.18)" : "scale(1)",
                  }}
                  aria-label={`${star} star`}
                >
                  <Star
                    size={28}
                    strokeWidth={1.8}
                    fill={star <= effectiveRating ? "#f59e0b" : "none"}
                    color={star <= effectiveRating ? "#f59e0b" : "var(--text-tertiary)"}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="label" style={{ display: "block", marginBottom: "0.5rem" }}>
              Comment <span style={{ color: "var(--text-tertiary)" }}>(optional)</span>
            </label>
            <textarea
              className="input"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              style={{ resize: "vertical", minHeight: 80 }}
              maxLength={500}
            />
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--text-tertiary)",
                textAlign: "right",
                marginTop: "0.25rem",
              }}
            >
              {comment.length}/500
            </div>
          </div>

          {error && (
            <p
              style={{
                fontSize: "0.82rem",
                color: "#f87171",
                background: "rgba(248,113,113,0.08)",
                borderRadius: "8px",
                padding: "0.5rem 0.75rem",
              }}
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || rating === 0}
          >
            {loading ? "Submitting…" : "Submit Review"}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
