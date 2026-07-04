"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  Star,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Search,
  User,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetch("/api/admin/stats", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then((res) => res.json())
        .then(setStats)
        .catch(() => {});
    }
  }, [user]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  if (!user) return null;

  const quickStats = [
    {
      label: "Total Sessions",
      value: stats?.totalRequests || 0,
      icon: BookOpen,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Active Tutors",
      value: stats?.totalTutors || 0,
      icon: Users,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      label: "Completed",
      value: stats?.completedSessions || 0,
      icon: CheckCircle,
      color: "text-success",
      bg: "bg-success/10",
    },
    {
      label: "Avg Rating",
      value: stats?.averageRating ? Number(stats.averageRating).toFixed(1) : "0.0",
      icon: Star,
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold">
          Welcome, <span className="gradient-text">{user.username}</span>
        </h1>
        <p className="text-muted mt-1">Here's your dashboard overview</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {quickStats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border border-border animate-fade-in">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-3">
            <Link href="/search" className="flex items-center justify-between p-3 rounded-lg hover:bg-background transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><Search className="w-5 h-5 text-primary" /></div>
                <div><div className="font-medium text-sm">Find a Tutor</div><div className="text-xs text-muted">Search by subject, availability, and rating</div></div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted" />
            </Link>
            <Link href="/requests" className="flex items-center justify-between p-3 rounded-lg hover:bg-background transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"><MessageSquare className="w-5 h-5 text-accent" /></div>
                <div><div className="font-medium text-sm">My Requests</div><div className="text-xs text-muted">View and manage help requests</div></div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted" />
            </Link>
            <Link href="/profile" className="flex items-center justify-between p-3 rounded-lg hover:bg-background transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-info/10 flex items-center justify-center"><User className="w-5 h-5 text-info" /></div>
                <div><div className="font-medium text-sm">Update Profile</div><div className="text-xs text-muted">Edit your subjects, availability, and bio</div></div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted" />
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Top Requested Subjects</h2>
          {stats?.requestsBySubject?.length > 0 ? (
            <div className="space-y-3">
              {stats.requestsBySubject.slice(0, 5).map((item: any) => (
                <div key={item.subject} className="flex items-center justify-between">
                  <span className="text-sm">{item.subject}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 rounded-full bg-background overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (item._count / stats.totalRequests) * 100)}%` }} />
                    </div>
                    <span className="text-xs text-muted">{item._count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted text-sm">No requests yet. Start by finding a tutor!</div>
          )}
        </div>
      </div>
    </div>
  );
}
