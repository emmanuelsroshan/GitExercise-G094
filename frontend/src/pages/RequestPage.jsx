import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { requestsAPI } from "../api/client";
import { useAuth } from "../context/AuthContext";
import RequestCard from "../components/RequestCard";
import { FileText, AlertCircle, RefreshCw } from "lucide-react";

export default function RequestPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isTutor = user?.role === "volunteer" || user?.role === "paid" || user?.role?.includes("tutor");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const { data } = await requestsAPI.list();
      setRequests(data);
    } catch (err) {
      setError("Failed to load help requests. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const handleAction = async (id, status) => {
    try {
      await requestsAPI.update(id, status);
      // Update locally
      setRequests((prev) =>
        prev.map((req) => (req.id === id ? { ...req, status } : req))
      );
    } catch (err) {
      alert("Failed to update request status. Please try again.");
    }
  };

  // Group requests by status
  const openRequests = requests.filter((r) => r.status.toLowerCase() === "open");
  const acceptedRequests = requests.filter((r) => r.status.toLowerCase() === "accepted");
  const completedRequests = requests.filter(
    (r) => r.status.toLowerCase() === "completed" || r.status.toLowerCase() === "cancelled"
  );

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="font-outfit" style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
            {isTutor ? "Incoming Help Requests" : "My Help Requests"}
          </h1>
          <p style={{ color: "rgba(255, 255, 255, 0.5)", marginTop: "0.25rem", fontSize: "0.95rem" }}>
            {isTutor
              ? "Accept and manage learning requests sent by students."
              : "Track the status of help requests you've sent to tutors."}
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="btn-secondary"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 1rem" }}
          title="Refresh"
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

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <div className="loader">Loading requests...</div>
        </div>
      ) : requests.length === 0 ? (
        <div className="glass" style={{ padding: "4rem 2rem", textAlign: "center", borderRadius: "18px" }}>
          <FileText size={48} className="text-purple" style={{ marginBottom: "1rem", opacity: 0.6 }} />
          <h3 className="font-outfit" style={{ margin: 0 }}>No Requests Found</h3>
          <p style={{ color: "rgba(255, 255, 255, 0.4)", margin: "0.5rem 0 0 0", fontSize: "0.95rem" }}>
            {isTutor
              ? "You haven't received any help requests yet. Complete your profile and availability to get matched!"
              : "You haven't sent any help requests yet. Find a tutor on the search page to request help!"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
          {/* Active section */}
          {(openRequests.length > 0 || acceptedRequests.length > 0) && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h2 className="font-outfit" style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "var(--accent-purple)" }}>
                Active Sessions & Pending Requests
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem" }}>
                {openRequests.map((req) => (
                  <RequestCard key={req.id} request={req} onAction={handleAction} isTutor={isTutor} />
                ))}
                {acceptedRequests.map((req) => (
                  <RequestCard key={req.id} request={req} onAction={handleAction} isTutor={isTutor} />
                ))}
              </div>
            </div>
          )}

          {/* History section */}
          {completedRequests.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <h2 className="font-outfit" style={{ fontSize: "1.25rem", fontWeight: 700, margin: 0, color: "rgba(255,255,255,0.4)" }}>
                Request History
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1rem", opacity: 0.8 }}>
                {completedRequests.map((req) => (
                  <RequestCard key={req.id} request={req} onAction={handleAction} isTutor={isTutor} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
