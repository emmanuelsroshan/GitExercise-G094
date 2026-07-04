"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Filter, Star, MapPin, Clock, GraduationCap, DollarSign, Users, MessageSquare, Eye } from "lucide-react";
import Link from "next/link";

export default function SearchPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState({
    subject: "",
    tutorType: "",
    university: "",
    minRating: "0",
  });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const handleSearch = async () => {
    setSearching(true);
    try {
      const params = new URLSearchParams();
      if (filters.subject) params.set("subject", filters.subject);
      if (filters.tutorType) params.set("tutorType", filters.tutorType);
      if (filters.university) params.set("university", filters.university);
      if (filters.minRating && filters.minRating !== "0") params.set("minRating", filters.minRating);

      const res = await fetch(`/api/search?${params}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold">Find a Tutor</h1>
        <p className="text-muted mt-1">Search for the perfect tutor based on your needs</p>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-border mb-8 animate-slide-up">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium mb-2 text-muted">Subject</label>
            <input
              type="text"
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              placeholder="e.g. Programming"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2 text-muted">Tutor Type</label>
            <select
              value={filters.tutorType}
              onChange={(e) => setFilters({ ...filters, tutorType: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="">All Tutors</option>
              <option value="volunteer">Volunteer</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium mb-2 text-muted">University</label>
            <input
              type="text"
              value={filters.university}
              onChange={(e) => setFilters({ ...filters, university: e.target.value })}
              placeholder="Filter by university"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-2 text-muted">Min Rating</label>
            <select
              value={filters.minRating}
              onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="0">Any Rating</option>
              <option value="3">3+ Stars</option>
              <option value="4">4+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleSearch}
          disabled={searching}
          className="mt-4 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
        >
          <Search className="w-4 h-4" />
          {searching ? "Searching..." : "Search Tutors"}
        </button>
      </div>

      <div className="space-y-4">
        {searching ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-border">
            <Users className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">No tutors found matching your criteria</p>
            <p className="text-xs text-muted mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          results.map((tutor, index) => (
            <TutorCard key={tutor.id} tutor={tutor} index={index} userRole={user.role} />
          ))
        )}
      </div>
    </div>
  );
}

function TutorCard({ tutor, index, userRole }: { tutor: any; index: number; userRole: string }) {
  const [sending, setSending] = useState(false);
  const router = useRouter();

  const handleSendRequest = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          tutorId: tutor.id,
          subject: tutor.profile?.subjectsTeaching?.split(",")[0]?.trim() || "General",
        }),
      });
      if (res.ok) {
        router.push("/requests");
      }
    } catch {}
    setSending(false);
  };

  const score = tutor.matchScore?.score || 0;
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-success";
    if (s >= 60) return "text-secondary";
    return "text-muted";
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-border card-hover animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-primary">
            {tutor.username?.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">{tutor.profile?.fullName || tutor.username}</h3>
              <div className="flex items-center gap-2 text-sm text-muted mt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{tutor.profile?.university || "No university set"}</span>
                <span className="mx-1">·</span>
                <GraduationCap className="w-3.5 h-3.5" />
                <span>{tutor.profile?.course || "No course set"}</span>
              </div>
            </div>
            <div className="text-center flex-shrink-0">
              <div className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}%</div>
              <div className="text-xs text-muted">Match</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {tutor.profile?.subjectsTeaching?.split(",").map((s: string) => s.trim()).filter(Boolean).map((s: string) => (
              <span key={s} className="bg-primary/5 text-primary text-xs px-3 py-1 rounded-full">{s}</span>
            ))}
          </div>

          {tutor.matchScore?.details?.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted">
              {tutor.matchScore.details.map((d: string, i: number) => (
                <span key={i} className="text-success">{d}</span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-secondary fill-current" />
              <span className="font-medium">{tutor.avgRating?.toFixed(1) || "New"}</span>
              <span className="text-muted">({tutor.totalReviews})</span>
            </div>
            <div className="flex items-center gap-1 text-muted">
              <Clock className="w-3.5 h-3.5" />
              <span>{tutor.role === "paid_tutor" ? "Paid" : "Volunteer"}</span>
            </div>
            {tutor.profile?.hourlyRate > 0 && (
              <div className="flex items-center gap-1 text-muted">
                <DollarSign className="w-3.5 h-3.5" />
                <span>${tutor.profile.hourlyRate}/hr</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Link
              href={`/profile/${tutor.id}`}
              className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg border border-border hover:bg-background transition-colors"
            >
              <Eye className="w-4 h-4" /> View Profile
            </Link>
            {userRole === "student" && (
              <button
                onClick={handleSendRequest}
                disabled={sending}
                className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <MessageSquare className="w-4 h-4" />
                {sending ? "Sending..." : "Send Request"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
