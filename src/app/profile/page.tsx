"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Save, Camera, Plus, X } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = ["8AM-10AM", "10AM-12PM", "12PM-2PM", "2PM-4PM", "4PM-6PM", "6PM-8PM", "8PM-10PM"];

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [profile, setProfile] = useState<any>({
    fullName: "",
    university: "",
    course: "",
    yearOfStudy: "",
    bio: "",
    subjectsStudying: "",
    subjectsTeaching: "",
    academicStrengths: "",
    learningStyle: "",
    tutorType: "",
    hourlyRate: 0,
    teachingExperience: "",
    maxStudents: 1,
    availability: [],
  });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/profile", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.id) {
            try {
              const avail = typeof data.availability === "string" ? JSON.parse(data.availability) : data.availability || [];
              setProfile({ ...data, availability: avail });
            } catch {
              setProfile({ ...data, availability: [] });
            }
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const toggleAvailability = (day: string, slot: string) => {
    const key = `${day} ${slot}`;
    setProfile((prev: any) => ({
      ...prev,
      availability: prev.availability.includes(key)
        ? prev.availability.filter((s: string) => s !== key)
        : [...prev.availability, key],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const payload = {
        ...profile,
        availability: JSON.stringify(profile.availability),
      };
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setMessage("Profile saved successfully!");
      } else {
        setMessage("Failed to save profile");
      }
    } catch {
      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  if (!user) return null;

  const isTutor = user.role === "volunteer_tutor" || user.role === "paid_tutor";

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold">Edit Profile</h1>
        <p className="text-muted mt-1">Set up your profile to get the best matches</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl mb-6 text-sm ${message.includes("success") ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
          {message}
        </div>
      )}

      <div className="space-y-6 animate-slide-up">
        <div className="bg-white rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input type="text" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">University/College</label>
              <input type="text" value={profile.university} onChange={(e) => setProfile({ ...profile, university: e.target.value })} placeholder="University of Example" className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Course/Major</label>
              <input type="text" value={profile.course} onChange={(e) => setProfile({ ...profile, course: e.target.value })} placeholder="Computer Science" className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Year of Study</label>
              <select value={profile.yearOfStudy} onChange={(e) => setProfile({ ...profile, yearOfStudy: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                <option value="">Select year</option>
                <option value="Freshman">Freshman</option>
                <option value="Sophomore">Sophomore</option>
                <option value="Junior">Junior</option>
                <option value="Senior">Senior</option>
                <option value="Graduate">Graduate</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Bio / About Me</label>
            <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell us about yourself, your academic interests, and what you're looking for..." rows={3} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Learning Style</label>
            <select value={profile.learningStyle} onChange={(e) => setProfile({ ...profile, learningStyle: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
              <option value="">Select preferred style</option>
              <option value="Visual">Visual</option>
              <option value="Auditory">Auditory</option>
              <option value="Reading/Writing">Reading/Writing</option>
              <option value="Kinesthetic">Kinesthetic</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Academic Information</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Subjects Studying (comma-separated)</label>
              <input type="text" value={profile.subjectsStudying} onChange={(e) => setProfile({ ...profile, subjectsStudying: e.target.value })} placeholder="Mathematics, Physics, Programming" className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
            {isTutor && (
              <div>
                <label className="block text-sm font-medium mb-2">Subjects You Can Teach (comma-separated)</label>
                <input type="text" value={profile.subjectsTeaching} onChange={(e) => setProfile({ ...profile, subjectsTeaching: e.target.value })} placeholder="Programming, Mathematics" className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Academic Strengths</label>
              <input type="text" value={profile.academicStrengths} onChange={(e) => setProfile({ ...profile, academicStrengths: e.target.value })} placeholder="Problem solving, Essay writing, Research" className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
            </div>
          </div>
        </div>

        {isTutor && (
          <div className="bg-white rounded-2xl p-6 border border-border">
            <h2 className="text-lg font-semibold mb-4">Tutor Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tutor Type</label>
                <select value={profile.tutorType} onChange={(e) => setProfile({ ...profile, tutorType: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                  <option value="">Select type</option>
                  <option value="volunteer">Volunteer (Free)</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hourly Rate ($)</label>
                <input type="number" value={profile.hourlyRate} onChange={(e) => setProfile({ ...profile, hourlyRate: parseFloat(e.target.value) || 0 })} placeholder="0" className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Teaching Experience</label>
                <input type="text" value={profile.teachingExperience} onChange={(e) => setProfile({ ...profile, teachingExperience: e.target.value })} placeholder="2 years tutoring calculus" className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Students</label>
                <input type="number" value={profile.maxStudents} onChange={(e) => setProfile({ ...profile, maxStudents: parseInt(e.target.value) || 1 })} min={1} className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Availability Schedule</h2>
          <p className="text-sm text-muted mb-4">Select your available time slots</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2"></th>
                  {TIME_SLOTS.map((slot) => (
                    <th key={slot} className="p-2 text-xs font-medium text-muted text-center">{slot}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => (
                  <tr key={day}>
                    <td className="p-2 font-medium text-sm">{day}</td>
                    {TIME_SLOTS.map((slot) => {
                      const key = `${day} ${slot}`;
                      const selected = profile.availability.includes(key);
                      return (
                        <td key={slot} className="p-1">
                          <button
                            onClick={() => toggleAvailability(day, slot)}
                            className={`w-full h-8 rounded-lg text-xs transition-all ${
                              selected
                                ? "bg-primary text-white"
                                : "bg-background hover:bg-primary/10 text-muted"
                            }`}
                          >
                            {selected ? "✓" : ""}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {profile.availability.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.availability.map((slot: string) => (
                <span key={slot} className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-full">
                  {slot}
                  <button onClick={() => setProfile({ ...profile, availability: profile.availability.filter((s: string) => s !== slot) })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary text-white font-medium py-3.5 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
