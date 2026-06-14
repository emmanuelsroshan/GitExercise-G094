import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Calendar,
  MessageCircle,
  Star,
  Send,
  ArrowLeft,
  DollarSign,
  Users,
  Compass,
  AlertCircle,
  CheckCircle,
  FileText
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { profileAPI, requestsAPI, reviewsAPI, searchAPI } from "../api/client";
import Avatar from "../components/Avatar";
import Badge from "../components/Badge";
import MatchScore from "../components/MatchScore";
import ReviewForm from "../components/ReviewForm";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = [
  "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm",
  "4pm", "5pm", "6pm", "7pm", "8pm", "9pm"
];

export default function TutorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [tutorUser, setTutorUser] = useState(null);
  const [tutorProfile, setTutorProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [matchScore, setMatchScore] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Request Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqSubject, setReqSubject] = useState("");
  const [reqTopic, setReqTopic] = useState("");
  const [reqDesc, setReqDesc] = useState("");
  const [reqType, setReqType] = useState("General Learning");
  const [reqUrgency, setReqUrgency] = useState("Medium");
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Fetch tutor details and compatibility score
  const fetchData = async () => {
    try {
      setLoading(true);
      const [userRes, matchRes] = await Promise.all([
        profileAPI.getUser(id),
        searchAPI.match(id)
      ]);

      setTutorUser(userRes.data.user);
      setTutorProfile(userRes.data.profile);
      setReviews(userRes.data.reviews || []);
      setAvgRating(userRes.data.avg_rating);
      setMatchScore(matchRes.data);
    } catch (err) {
      setError("Failed to fetch tutor details. They may not have completed their profile yet.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!reqSubject || !reqTopic) {
      setError("Please fill out the Subject and Topic fields.");
      return;
    }

    setSubmittingRequest(true);
    try {
      await requestsAPI.create({
        tutor_id: Number(id),
        subject: reqSubject,
        topic: reqTopic,
        description: reqDesc,
        type: reqType,
        urgency: reqUrgency
      });
      setRequestSuccess(true);
      setTimeout(() => {
        setShowRequestModal(false);
        setRequestSuccess(false);
        setReqSubject("");
        setReqTopic("");
        setReqDesc("");
      }, 2000);
    } catch (err) {
      setError("Failed to submit request. Please try again.");
    } finally {
      setSubmittingRequest(false);
    }
  };

  const startChat = () => {
    navigate(`/chat?user=${id}`);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div className="loader">Loading Tutor Profile...</div>
      </div>
    );
  }

  if (error && !tutorUser) {
    return (
      <div className="glass" style={{ padding: "2rem", textAlign: "center", maxWidth: "500px", margin: "4rem auto" }}>
        <AlertCircle size={40} className="text-red" style={{ marginBottom: "1rem" }} />
        <h3 className="font-outfit" style={{ margin: 0 }}>Error Loading Profile</h3>
        <p style={{ color: "rgba(255,255,255,0.5)", margin: "0.5rem 0 1.5rem 0" }}>{error}</p>
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Back button */}
      <div>
        <button onClick={() => navigate(-1)} className="btn-secondary" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
          <ArrowLeft size={16} /> Back to Search
        </button>
      </div>

      {/* Profile Header Card */}
      <div className="glass" style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: "2rem", padding: "2rem", borderRadius: "24px", alignItems: "center" }}>
        <Avatar name={tutorUser?.username} size={96} />
        
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <h1 className="font-outfit" style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
              {tutorUser?.username}
            </h1>
            <Badge variant={tutorUser?.role === "paid" ? "amber" : "green"}>
              {tutorUser?.role === "paid" ? "Paid Tutor" : "Volunteer Tutor"}
            </Badge>
          </div>
          <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", margin: 0 }}>
            {tutorProfile?.course} · {tutorProfile?.year} at <strong style={{ color: "#fff" }}>{tutorProfile?.university}</strong>
          </p>
          <div style={{ display: "flex", gap: "1rem", color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
            {avgRating !== null && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Star size={16} className="text-amber" fill="var(--accent-amber)" />
                <strong>{avgRating.toFixed(1)}</strong> ({reviews.length} reviews)
              </span>
            )}
            <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
              <DollarSign size={16} />
              <strong>{tutorProfile?.rate > 0 ? `RM ${tutorProfile.rate}/hr` : "Free help"}</strong>
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <button onClick={startChat} className="btn-secondary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
            <MessageCircle size={18} /> Send Message
          </button>
          {currentUser?.id !== tutorUser?.id && (
            <button onClick={() => setShowRequestModal(true)} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
              <Send size={18} /> Request Help
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Bio, Match Stats, availability */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        
        {/* Left Column: Bio, availability, reviews */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          {/* Bio & Experience */}
          <div className="glass" style={{ padding: "1.5rem", borderRadius: "18px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 className="font-outfit" style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>About Me</h3>
            <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: 0 }}>
              {tutorProfile?.bio || "No biography provided."}
            </p>

            {tutorProfile?.experience && (
              <>
                <h4 className="font-outfit" style={{ margin: "0.5rem 0 0 0", fontSize: "1.1rem", fontWeight: 700 }}>Teaching Experience</h4>
                <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: 0 }}>
                  {tutorProfile.experience}
                </p>
              </>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
              <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>Subjects of Expertise:</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {tutorProfile?.subjects?.map((sub) => (
                  <Badge key={sub} variant="purple">{sub}</Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Availability Grid */}
          <div className="glass" style={{ padding: "1.5rem", borderRadius: "18px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 className="font-outfit" style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>Weekly Schedule</h3>
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: "650px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "90px repeat(14, 1fr)", gap: "4px", marginBottom: "8px" }}>
                  <div />
                  {HOURS.map((hr) => (
                    <div key={hr} style={{ fontSize: "0.7rem", textAlign: "center", color: "rgba(255,255,255,0.4)", fontWeight: "bold" }}>
                      {hr}
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {DAYS.map((day) => {
                    const activeSlots = tutorProfile?.schedule?.[day] || [];
                    return (
                      <div key={day} style={{ display: "grid", gridTemplateColumns: "90px repeat(14, 1fr)", gap: "4px", alignItems: "center" }}>
                        <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>{day}</div>
                        {HOURS.map((hr) => {
                          const active = activeSlots.includes(hr);
                          return (
                            <div
                              key={hr}
                              style={{
                                height: "20px",
                                background: active ? "rgba(16, 185, 129, 0.2)" : "rgba(255, 255, 255, 0.02)",
                                border: active ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid rgba(255, 255, 255, 0.05)",
                                borderRadius: "3px"
                              }}
                              title={active ? `${day} @ ${hr} (Available)` : ""}
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Reviews section */}
          <div className="glass" style={{ padding: "1.5rem", borderRadius: "18px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <h3 className="font-outfit" style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>
              Reviews ({reviews.length})
            </h3>
            
            {/* Review form */}
            {currentUser?.id !== tutorUser?.id && (
              <div style={{ paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <h4 className="font-outfit" style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", color: "rgba(255,255,255,0.6)" }}>Leave a Review</h4>
                <ReviewForm revieweeId={Number(id)} onSubmitted={fetchData} />
              </div>
            )}

            {/* List of reviews */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {reviews.length === 0 ? (
                <p style={{ color: "rgba(255,255,255,0.4)", margin: 0, fontSize: "0.9rem" }}>
                  No reviews yet. Be the first to rate this tutor!
                </p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} style={{ background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{rev.reviewer_name || "Student"}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={i < rev.rating ? "text-amber" : "text-muted"}
                            fill={i < rev.rating ? "var(--accent-amber)" : "transparent"}
                          />
                        ))}
                      </div>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", margin: 0, lineHeight: 1.4 }}>
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Compatibility Breakdown */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          <div className="glass" style={{ padding: "1.5rem", borderRadius: "18px", display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center", textAlign: "center" }}>
            <h3 className="font-outfit" style={{ margin: 0, fontSize: "1.2rem", fontWeight: 700 }}>Compatibility</h3>
            {matchScore && (
              <>
                <MatchScore score={matchScore.total} size={110} />
                
                {/* Breakdown details */}
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "0.5rem" }}>
                  {[
                    { label: "Subjects Match", val: matchScore.subject, color: "var(--accent-purple)" },
                    { label: "Availability", val: matchScore.schedule, color: "var(--accent-green)" },
                    { label: "University similarity", val: matchScore.university, color: "var(--accent-blue)" }
                  ].map((factor) => (
                    <div key={factor.label} style={{ textAlign: "left" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", marginBottom: "0.25rem", color: "rgba(255,255,255,0.6)" }}>
                        <span>{factor.label}</span>
                        <span>{factor.val}%</span>
                      </div>
                      <div style={{ height: "6px", background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${factor.val}%`, background: factor.color, borderRadius: "3px" }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Match Details List */}
                <div style={{ width: "100%", textAlign: "left", background: "rgba(255,255,255,0.02)", padding: "1rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: "bold", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: "0.5rem" }}>
                    COMPATIBILITY HIGHLIGHTS
                  </span>
                  <ul style={{ paddingLeft: "1.2rem", margin: 0, display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.85)" }}>
                    {matchScore.reasons?.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                    {(!matchScore.reasons || matchScore.reasons.length === 0) && (
                      <li style={{ listStyle: "none", paddingLeft: 0, color: "rgba(255,255,255,0.4)" }}>No overlaps found.</li>
                    )}
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Quick stats */}
          <div className="glass" style={{ padding: "1.5rem", borderRadius: "18px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 className="font-outfit" style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Tutor Capacity</h3>
            
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Users size={16} className="text-purple" />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Max Students Limit</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{tutorProfile?.max_students || 5} active slots</span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Compass size={16} className="text-blue" />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Learning Style Pref</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{tutorProfile?.learning_style || "Flexible"}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Help Request Modal Dialog */}
      <AnimatePresence>
        {showRequestModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.6)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: "1rem"
            }}
          >
            <motion.div
              className="glass"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{
                width: "100%",
                maxWidth: "500px",
                padding: "2rem",
                borderRadius: "20px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
              }}
            >
              {requestSuccess ? (
                <div style={{ textAlign: "center", padding: "2rem 0" }}>
                  <CheckCircle size={56} className="text-green" style={{ marginBottom: "1rem" }} />
                  <h3 className="font-outfit" style={{ margin: 0, fontSize: "1.4rem" }}>Help Request Sent!</h3>
                  <p style={{ color: "rgba(255,255,255,0.5)", marginTop: "0.5rem" }}>
                    The tutor will review your request and accept shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendRequest} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 className="font-outfit" style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800 }}>
                      Send Help Request
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowRequestModal(false)}
                      style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: "1.2rem" }}
                    >
                      &times;
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>Subject</label>
                    <select
                      value={reqSubject}
                      onChange={(e) => setReqSubject(e.target.value)}
                      required
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        padding: "0.6rem",
                        color: "#fff"
                      }}
                    >
                      <option value="">Select subject...</option>
                      {tutorProfile?.subjects?.map((sub) => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>Specific Topic</label>
                    <input
                      type="text"
                      placeholder="e.g. Calculus Derivatives"
                      value={reqTopic}
                      onChange={(e) => setReqTopic(e.target.value)}
                      required
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        padding: "0.6rem",
                        color: "#fff"
                      }}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      <label style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>Help Type</label>
                      <select
                        value={reqType}
                        onChange={(e) => setReqType(e.target.value)}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          padding: "0.6rem",
                          color: "#fff"
                        }}
                      >
                        <option value="General Learning">General Learning</option>
                        <option value="Exam Prep">Exam Prep</option>
                        <option value="Assignment Help">Assignment Help</option>
                        <option value="Project Support">Project Support</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                      <label style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>Urgency</label>
                      <select
                        value={reqUrgency}
                        onChange={(e) => setReqUrgency(e.target.value)}
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          padding: "0.6rem",
                          color: "#fff"
                        }}
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.6)" }}>Description & Problem Context</label>
                    <textarea
                      placeholder="Describe what help you need, equations you're stuck on, or files you want to review..."
                      value={reqDesc}
                      onChange={(e) => setReqDesc(e.target.value)}
                      rows={3}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "8px",
                        padding: "0.6rem",
                        color: "#fff",
                        resize: "none"
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingRequest}
                    style={{
                      background: "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))",
                      border: "none",
                      borderRadius: "10px",
                      padding: "0.75rem",
                      color: "#fff",
                      fontWeight: "bold",
                      cursor: "pointer",
                      marginTop: "0.5rem"
                    }}
                  >
                    {submittingRequest ? "Sending..." : "Submit Help Request"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
