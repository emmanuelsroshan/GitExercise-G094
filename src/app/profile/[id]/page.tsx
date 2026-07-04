"use client";

import { useAuth } from "@/components/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Star, MapPin, GraduationCap, Clock, DollarSign, Award, BookOpen, Calendar, MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UserProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [profileUser, setProfileUser] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user && params.id) {
      fetch(`/api/search?subject=`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then((res) => res.json())
        .then((users) => {
          const found = users.find((u: any) => u.id === params.id);
          if (found) setProfileUser(found);
        })
        .catch(() => {});
    }
  }, [user, params.id]);

  if (loading || !profileUser)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  if (!user) return null;

  const p = profileUser.profile || {};
  const availability = (() => {
    try {
      return typeof p.availability === "string" ? JSON.parse(p.availability) : p.availability || [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/search" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to search
      </Link>

      <div className="bg-white rounded-2xl border border-border overflow-hidden animate-slide-up">
        <div className="gradient-bg h-32" />
        <div className="px-6 pb-6">
          <div className="flex items-end -mt-12 mb-4">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-white flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">{profileUser.username?.charAt(0).toUpperCase()}</span>
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold">{p.fullName || profileUser.username}</h1>
              <div className="flex items-center gap-2 text-sm text-muted mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{p.university || "No university"}</span>
                <span>·</span>
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{p.course || "No course"}</span>
                <span>·</span>
                <span>{p.yearOfStudy || "N/A"}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-secondary/10 text-secondary px-3 py-1.5 rounded-full">
              <Star className="w-4 h-4 fill-current" />
              <span className="font-semibold">{profileUser.avgRating?.toFixed(1) || "New"}</span>
              <span className="text-xs">({profileUser.totalReviews})</span>
            </div>
          </div>

          {p.bio && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold mb-1">About</h3>
              <p className="text-sm text-muted">{p.bio}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" /> Academic Info
              </h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-muted">Subjects Studying:</span> <span className="font-medium">{p.subjectsStudying || "N/A"}</span></div>
                {p.subjectsTeaching && <div><span className="text-muted">Subjects Teaching:</span> <span className="font-medium">{p.subjectsTeaching}</span></div>}
                <div><span className="text-muted">Strengths:</span> <span className="font-medium">{p.academicStrengths || "N/A"}</span></div>
                <div><span className="text-muted">Learning Style:</span> <span className="font-medium">{p.learningStyle || "N/A"}</span></div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" /> Tutor Details
              </h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-muted">Type:</span> <span className="font-medium">{profileUser.role === "paid_tutor" ? "Paid Tutor" : profileUser.role === "volunteer_tutor" ? "Volunteer Tutor" : "Student"}</span></div>
                {p.hourlyRate > 0 && <div><span className="text-muted">Rate:</span> <span className="font-medium">${p.hourlyRate}/hr</span></div>}
                {p.teachingExperience && <div><span className="text-muted">Experience:</span> <span className="font-medium">{p.teachingExperience}</span></div>}
                {p.maxStudents > 0 && <div><span className="text-muted">Max Students:</span> <span className="font-medium">{p.maxStudents}</span></div>}
              </div>
            </div>
          </div>

          {availability.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" /> Availability
              </h3>
              <div className="flex flex-wrap gap-2">
                {availability.map((slot: string) => (
                  <span key={slot} className="bg-primary/5 text-primary text-xs px-3 py-1.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {slot}
                  </span>
                ))}
              </div>
            </div>
          )}

          {user.role === "student" && (
            <div className="mt-6 pt-4 border-t border-border">
              <button
                onClick={async () => {
                  const res = await fetch("/api/requests", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    body: JSON.stringify({
                      tutorId: profileUser.id,
                      subject: p.subjectsTeaching?.split(",")[0]?.trim() || "General",
                    }),
                  });
                  if (res.ok) router.push("/requests");
                }}
                className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors font-medium flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" /> Send Help Request
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
