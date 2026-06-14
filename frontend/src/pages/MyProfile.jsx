import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { reviewsAPI } from "../api/client";
import Avatar from "../components/Avatar";
import Badge from "../components/Badge";
import { Star, Edit3, Award, Calendar, Users, DollarSign, Compass, MessageSquare } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const HOURS = [
  "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm",
  "4pm", "5pm", "6pm", "7pm", "8pm", "9pm"
];

export default function MyProfile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const isTutor = user?.role === "volunteer" || user?.role === "paid" || user?.role?.includes("tutor");

  useEffect(() => {
    if (user) {
      setLoadingReviews(true);
      reviewsAPI
        .get(user.id)
        .then(({ data }) => {
          setReviews(data.reviews || []);
          setAvgRating(data.avg_rating);
        })
        .catch((err) => console.error("Failed to load reviews", err))
        .finally(() => setLoadingReviews(false));
    }
  }, [user]);

  const handleEdit = () => {
    navigate("/setup");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "900px", margin: "0 auto" }}>
      {/* Profile Header Card */}
      <div
        className="glass"
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          gap: "2rem",
          padding: "2rem",
          borderRadius: "24px",
          alignItems: "center"
        }}
      >
        <Avatar name={user?.username} size={90} />

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <h1 className="font-outfit" style={{ fontSize: "2rem", fontWeight: 800, margin: 0 }}>
              {user?.username}
            </h1>
            <Badge variant={user?.role === "paid" ? "amber" : user?.role === "volunteer" ? "green" : "purple"}>
              {user?.role === "paid"
                ? "Paid Tutor"
                : user?.role === "volunteer"
                ? "Volunteer Tutor"
                : "Student"}
            </Badge>
          </div>
          <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.7)", margin: 0 }}>
            {profile?.course || "Course not set"} · {profile?.year || "Year not set"} at{" "}
            <strong style={{ color: "#fff" }}>{profile?.university || "University not set"}</strong>
          </p>

          <div style={{ display: "flex", gap: "1rem", color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
            {avgRating !== null && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <Star size={16} className="text-amber" fill="var(--accent-amber)" />
                <strong>{avgRating.toFixed(1)}</strong> ({reviews.length} reviews)
              </span>
            )}
            {isTutor && (
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <DollarSign size={16} />
                <strong>{profile?.rate > 0 ? `RM ${profile.rate}/hr` : "Free help"}</strong>
              </span>
            )}
          </div>
        </div>

        <div>
          <button
            onClick={handleEdit}
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <Edit3 size={16} /> Edit Profile
          </button>
        </div>
      </div>

      {/* Main Grid: Details, availability, reviews */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
        
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Biography */}
          <div className="glass" style={{ padding: "1.5rem", borderRadius: "18px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 className="font-outfit" style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>My Biography</h3>
            <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: 0 }}>
              {profile?.bio || "No biography provided. Click Edit Profile to add one!"}
            </p>

            {isTutor && profile?.experience && (
              <>
                <h4 className="font-outfit" style={{ margin: "0.5rem 0 0 0", fontSize: "1.1rem", fontWeight: 700 }}>
                  Teaching Experience
                </h4>
                <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.6, margin: 0 }}>{profile.experience}</p>
              </>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "0.5rem" }}>
              <span style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)" }}>
                {isTutor ? "Subjects I Teach:" : "Subjects I Need Help With:"}
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {profile?.subjects && profile.subjects.length > 0 ? (
                  profile.subjects.map((sub) => (
                    <Badge key={sub} variant="purple">
                      {sub}
                    </Badge>
                  ))
                ) : (
                  <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.35)" }}>No subjects selected</span>
                )}
              </div>
            </div>
          </div>

          {/* Availability schedule */}
          <div className="glass" style={{ padding: "1.5rem", borderRadius: "18px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 className="font-outfit" style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700 }}>My Schedule</h3>
            <div style={{ overflowX: "auto" }}>
              <div style={{ minWidth: "600px" }}>
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
                    const activeSlots = profile?.schedule?.[day] || [];
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
                                background: active ? "rgba(124, 58, 237, 0.25)" : "rgba(255, 255, 255, 0.02)",
                                border: active ? "1px solid rgba(124, 58, 237, 0.4)" : "1px solid rgba(255, 255, 255, 0.05)",
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
        </div>

        {/* Right Column: reviews list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* User preferences */}
          <div className="glass" style={{ padding: "1.5rem", borderRadius: "18px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 className="font-outfit" style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>Preferences</h3>
            
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Compass size={16} className="text-purple" />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Learning Style</span>
                <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{profile?.learning_style || "Visual"}</span>
              </div>
            </div>

            {profile?.strengths && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Award size={16} className="text-blue" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Strengths</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "150px" }}>
                    {profile.strengths}
                  </span>
                </div>
              </div>
            )}

            {isTutor && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <Users size={16} className="text-green" />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.4)" }}>Student Capacity</span>
                    <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{profile?.max_students || 5} active limit</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Reviews list */}
          <div className="glass" style={{ padding: "1.5rem", borderRadius: "18px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h3 className="font-outfit" style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
              Reviews ({reviews.length})
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "300px", overflowY: "auto" }}>
              {loadingReviews ? (
                <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)" }}>Loading reviews...</span>
              ) : reviews.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", color: "rgba(255,255,255,0.3)", padding: "1rem 0" }}>
                  <MessageSquare size={24} />
                  <span style={{ fontSize: "0.8rem" }}>No reviews received yet</span>
                </div>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      background: "rgba(255,255,255,0.02)",
                      padding: "0.75rem",
                      borderRadius: "10px",
                      border: "1px solid rgba(255,255,255,0.04)"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.8rem" }}>{rev.reviewer_name}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.1rem", fontSize: "0.8rem", fontWeight: "bold" }}>
                        <Star size={12} className="text-amber" fill="var(--accent-amber)" /> {rev.rating}
                      </span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", margin: 0, lineHeight: 1.3 }}>
                      {rev.comment}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
