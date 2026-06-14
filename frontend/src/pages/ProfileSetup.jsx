import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, ArrowRight, Save, Calendar, Check, AlertCircle } from "lucide-react";

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Programming",
  "English",
  "Chemistry",
  "Biology",
  "Economics",
  "Accounting",
  "Data Science",
  "Statistics"
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const HOURS = [
  "8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm",
  "4pm", "5pm", "6pm", "7pm", "8pm", "9pm"
];

const LEARNING_STYLES = ["Visual", "Auditory", "Reading/Writing", "Kinesthetic"];

export default function ProfileSetup() {
  const { user, profile, saveProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form States
  const [username, setUsername] = useState(user?.username || "");
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [year, setYear] = useState("1st Year");
  const [bio, setBio] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [strengths, setStrengths] = useState("");
  const [learningStyle, setLearningStyle] = useState("Visual");
  const [schedule, setSchedule] = useState({});

  // Tutor Specific
  const [rate, setRate] = useState(0);
  const [experience, setExperience] = useState("");
  const [maxStudents, setMaxStudents] = useState(5);

  // Pre-fill profile data if it already exists
  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
    if (profile) {
      setUniversity(profile.university || "");
      setCourse(profile.course || "");
      setYear(profile.year || "1st Year");
      setBio(profile.bio || "");
      setSelectedSubjects(profile.subjects || []);
      setStrengths(profile.strengths || "");
      setLearningStyle(profile.learning_style || "Visual");
      setSchedule(profile.schedule || {});
      setRate(profile.rate || 0);
      setExperience(profile.experience || "");
      setMaxStudents(profile.max_students || 5);
    }
  }, [profile, user]);

  const isTutor = user?.role === "volunteer" || user?.role === "paid" || user?.role?.includes("tutor");
  const totalSteps = isTutor ? 4 : 3;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      setError("");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setError("");
    }
  };

  const toggleSubject = (sub) => {
    if (selectedSubjects.includes(sub)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const toggleSlot = (day, hour) => {
    const newSchedule = { ...schedule };
    if (!newSchedule[day]) {
      newSchedule[day] = [];
    }

    if (newSchedule[day].includes(hour)) {
      newSchedule[day] = newSchedule[day].filter((h) => h !== hour);
      if (newSchedule[day].length === 0) {
        delete newSchedule[day];
      }
    } else {
      newSchedule[day] = [...newSchedule[day], hour];
    }
    setSchedule(newSchedule);
  };

  const handleSave = async () => {
    setError("");
    setLoading(true);

    const payload = {
      username,
      university,
      course,
      year,
      bio,
      subjects: selectedSubjects,
      strengths,
      learning_style: learningStyle,
      schedule,
      rate: isTutor ? Number(rate) : 0,
      experience: isTutor ? experience : "",
      max_students: isTutor ? Number(maxStudents) : 5
    };

    try {
      await saveProfile(payload);
      navigate("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to save profile. Please check your network connection.");
    } finally {
      setLoading(false);
    }
  };

  // Slide Animation Variants
  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir) => ({
      x: dir < 0 ? 100 : -100,
      opacity: 0
    })
  };

  const [dir, setDir] = useState(1);

  const navigateStep = (newStep) => {
    setDir(newStep > step ? 1 : -1);
    setStep(newStep);
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem 1rem",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: "2rem"
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center" }}>
        <h1 className="gradient-text font-outfit" style={{ fontSize: "2.2rem", fontWeight: 800, margin: 0 }}>
          Setup Your Academic Profile
        </h1>
        <p style={{ color: "rgba(255, 255, 255, 0.5)", marginTop: "0.5rem" }}>
          Tell us about yourself to discover your compatible matches.
        </p>
      </div>

      {/* Step Indicator */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "relative",
          background: "rgba(255, 255, 255, 0.02)",
          padding: "1rem 1.5rem",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.05)"
        }}
      >
        {/* Connection lines */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "10%",
            right: "10%",
            height: "2px",
            background: "rgba(255, 255, 255, 0.08)",
            zIndex: 1
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "10%",
            width: `${((step - 1) / (totalSteps - 1)) * 80}%`,
            height: "2px",
            background: "var(--accent-purple)",
            zIndex: 2,
            transition: "width 0.4s ease"
          }}
        />

        {Array.from({ length: totalSteps }).map((_, index) => {
          const sNum = index + 1;
          const isCompleted = sNum < step;
          const isActive = sNum === step;

          return (
            <button
              key={sNum}
              onClick={() => sNum <= step && navigateStep(sNum)}
              disabled={sNum > step}
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: isCompleted
                  ? "var(--accent-purple)"
                  : isActive
                  ? "rgba(124, 58, 237, 0.2)"
                  : "rgba(255, 255, 255, 0.05)",
                border: isActive
                  ? "2px solid var(--accent-purple)"
                  : isCompleted
                  ? "2px solid var(--accent-purple)"
                  : "2px solid rgba(255, 255, 255, 0.1)",
                color: isCompleted || isActive ? "#fff" : "rgba(255,255,255,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                fontSize: "0.9rem",
                cursor: sNum <= step ? "pointer" : "default",
                zIndex: 3,
                boxShadow: isActive ? "0 0 15px rgba(124, 58, 237, 0.4)" : "none",
                transition: "all 0.3s ease"
              }}
            >
              {isCompleted ? <Check size={16} /> : sNum}
            </button>
          );
        })}
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

      {/* Step Container with Slide Animation */}
      <div className="glass" style={{ borderRadius: "24px", padding: "2.5rem 2rem", position: "relative", minHeight: "350px" }}>
        <AnimatePresence custom={dir} mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              <h2 className="font-outfit" style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>
                Step 1: Personal Info
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label className="text-muted" style={{ fontSize: "0.85rem", fontWeight: 500 }}>Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "10px",
                      padding: "0.75rem 1rem",
                      color: "#fff",
                      outline: "none"
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label className="text-muted" style={{ fontSize: "0.85rem", fontWeight: 500 }}>University</label>
                  <input
                    type="text"
                    placeholder="e.g. Monash University"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "10px",
                      padding: "0.75rem 1rem",
                      color: "#fff",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label className="text-muted" style={{ fontSize: "0.85rem", fontWeight: 500 }}>Course / Major</label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "10px",
                      padding: "0.75rem 1rem",
                      color: "#fff",
                      outline: "none"
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label className="text-muted" style={{ fontSize: "0.85rem", fontWeight: 500 }}>Academic Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "10px",
                      padding: "0.75rem 1rem",
                      color: "#fff",
                      outline: "none"
                    }}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label className="text-muted" style={{ fontSize: "0.85rem", fontWeight: 500 }}>Short Biography</label>
                <textarea
                  placeholder="Share details about your academic interests, hobby or what help you're seeking..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    padding: "0.75rem 1rem",
                    color: "#fff",
                    outline: "none",
                    resize: "none"
                  }}
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              <h2 className="font-outfit" style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>
                Step 2: Subjects & Learning Style
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <label className="text-muted" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                  Subjects of Interest (Select all that apply)
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {SUBJECTS.map((sub) => {
                    const selected = selectedSubjects.includes(sub);
                    return (
                      <button
                        key={sub}
                        type="button"
                        onClick={() => toggleSubject(sub)}
                        style={{
                          background: selected ? "rgba(124, 58, 237, 0.15)" : "rgba(255, 255, 255, 0.02)",
                          border: selected ? "1px solid var(--accent-purple)" : "1px solid rgba(255,255,255,0.08)",
                          borderRadius: "20px",
                          padding: "0.5rem 1rem",
                          color: selected ? "#fff" : "rgba(255,255,255,0.6)",
                          cursor: "pointer",
                          transition: "all 0.2s"
                        }}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "0.5rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label className="text-muted" style={{ fontSize: "0.85rem", fontWeight: 500 }}>Learning Style</label>
                  <select
                    value={learningStyle}
                    onChange={(e) => setLearningStyle(e.target.value)}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "10px",
                      padding: "0.75rem 1rem",
                      color: "#fff",
                      outline: "none"
                    }}
                  >
                    {LEARNING_STYLES.map((style) => (
                      <option key={style} value={style}>
                        {style}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label className="text-muted" style={{ fontSize: "0.85rem", fontWeight: 500 }}>Strengths & Skills</label>
                  <input
                    type="text"
                    placeholder="e.g. Calculus, Web dev, essay writing"
                    value={strengths}
                    onChange={(e) => setStrengths(e.target.value)}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "10px",
                      padding: "0.75rem 1rem",
                      color: "#fff",
                      outline: "none"
                    }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 className="font-outfit" style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>
                  Step 3: Weekly Availability
                </h2>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>
                  <Calendar size={14} /> Click slots to select
                </div>
              </div>

              {/* Scrollable grid container */}
              <div
                style={{
                  overflowX: "auto",
                  background: "rgba(0,0,0,0.15)",
                  padding: "1rem",
                  borderRadius: "14px",
                  border: "1px solid rgba(255,255,255,0.05)"
                }}
              >
                <div style={{ minWidth: "750px" }}>
                  {/* Hours Header */}
                  <div style={{ display: "grid", gridTemplateColumns: "100px repeat(14, 1fr)", gap: "4px", marginBottom: "8px" }}>
                    <div />
                    {HOURS.map((hr) => (
                      <div
                        key={hr}
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: "bold",
                          textAlign: "center",
                          color: "rgba(255,255,255,0.4)"
                        }}
                      >
                        {hr}
                      </div>
                    ))}
                  </div>

                  {/* Day rows */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    {DAYS.map((day) => (
                      <div
                        key={day}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "100px repeat(14, 1fr)",
                          gap: "4px",
                          alignItems: "center"
                        }}
                      >
                        <div style={{ fontSize: "0.8rem", fontWeight: 500, color: "rgba(255,255,255,0.7)" }}>{day}</div>
                        {HOURS.map((hr) => {
                          const active = schedule[day]?.includes(hr);
                          return (
                            <button
                              key={hr}
                              type="button"
                              onClick={() => toggleSlot(day, hr)}
                              className={`avail-cell ${active ? "active" : ""}`}
                              style={{
                                height: "26px",
                                background: active ? "var(--accent-purple)" : "rgba(255, 255, 255, 0.02)",
                                border: "1px solid rgba(255,255,255,0.05)",
                                borderRadius: "4px",
                                cursor: "pointer",
                                transition: "all 0.1s"
                              }}
                              title={`${day} @ ${hr}`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 4 && isTutor && (
            <motion.div
              key="step-4"
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
              style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
            >
              <h2 className="font-outfit" style={{ fontSize: "1.4rem", fontWeight: 700, margin: 0 }}>
                Step 4: Tutor Details & Settings
              </h2>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label className="text-muted" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                    Hourly Rate (RM / hour)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter 0 if volunteering free help"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "10px",
                      padding: "0.75rem 1rem",
                      color: "#fff",
                      outline: "none"
                    }}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <label className="text-muted" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                    Max Simultaneous Students
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(e.target.value)}
                    style={{
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      borderRadius: "10px",
                      padding: "0.75rem 1rem",
                      color: "#fff",
                      outline: "none"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label className="text-muted" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                  Teaching Experience & Credentials
                </label>
                <textarea
                  placeholder="Tell us about your teaching style, achievements, past tutoring experience..."
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  rows={4}
                  style={{
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "10px",
                    padding: "0.75rem 1rem",
                    color: "#fff",
                    outline: "none",
                    resize: "none"
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions / Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          onClick={handleBack}
          disabled={step === 1}
          style={{
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "12px",
            padding: "0.75rem 1.25rem",
            color: step === 1 ? "rgba(255,255,255,0.2)" : "#fff",
            cursor: step === 1 ? "default" : "pointer",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.2s"
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {step < totalSteps ? (
          <button
            onClick={handleNext}
            style={{
              background: "rgba(124, 58, 237, 0.15)",
              border: "1px solid rgba(124, 58, 237, 0.3)",
              borderRadius: "12px",
              padding: "0.75rem 1.25rem",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 0 10px rgba(124, 58, 237, 0.15)",
              transition: "all 0.2s"
            }}
          >
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))",
              border: "none",
              borderRadius: "12px",
              padding: "0.75rem 1.5rem",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)",
              transition: "all 0.2s"
            }}
          >
            <Save size={16} /> {loading ? "Saving..." : "Save Profile"}
          </button>
        )}
      </div>
    </div>
  );
}
