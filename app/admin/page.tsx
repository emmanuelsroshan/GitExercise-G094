"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Users,
  BookOpen,
  Star,
  MessageSquare,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react";

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== "paid_tutor")) router.push("/");
  }, [user, loading, router]);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const [statsRes, usersRes] = await Promise.all([
      fetch("/api/admin/stats", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/admin/users", { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    if (statsRes.ok) setStats(await statsRes.json());
    if (usersRes.ok) setUsers(await usersRes.json());
  };

  useEffect(() => {
    if (user?.role === "paid_tutor") fetchData();
  }, [user]);

  const handleAction = async (userId: string, action: string) => {
    await fetch("/api/admin/users", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ userId, action }),
    });
    fetchData();
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  if (!user || user.role !== "paid_tutor") return null;

  const cards = [
    { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-primary", bg: "bg-primary/10" },
    { label: "Students", value: stats?.totalStudents || 0, icon: BookOpen, color: "text-info", bg: "bg-info/10" },
    { label: "Tutors", value: stats?.totalTutors || 0, icon: TrendingUp, color: "text-accent", bg: "bg-accent/10" },
    { label: "Sessions", value: stats?.totalRequests || 0, icon: MessageSquare, color: "text-secondary", bg: "bg-secondary/10" },
    { label: "Completed", value: stats?.completedSessions || 0, icon: CheckCircle, color: "text-success", bg: "bg-success/10" },
    { label: "Avg Rating", value: stats?.averageRating ? Number(stats.averageRating).toFixed(1) : "0.0", icon: Star, color: "text-secondary", bg: "bg-secondary/10" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-in">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>
        <p className="text-muted">Manage users and view platform analytics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-4 border border-border">
            <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-2`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <div className="text-xl font-bold">{card.value}</div>
            <div className="text-xs text-muted">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Top Subjects</h2>
          {stats?.requestsBySubject?.length > 0 ? (
            <div className="space-y-3">
              {stats.requestsBySubject.map((item: any) => (
                <div key={item.subject} className="flex items-center justify-between">
                  <span className="text-sm">{item.subject}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 rounded-full bg-background overflow-hidden">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (item._count / stats.totalRequests) * 100)}%` }} />
                    </div>
                    <span className="text-xs text-muted w-6 text-right">{item._count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No data yet</p>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 border border-border">
          <h2 className="text-lg font-semibold mb-4">Recent Users</h2>
          {stats?.recentUsers?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentUsers.map((u: any) => (
                <div key={u.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">{u.username?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.username}</p>
                    <p className="text-xs text-muted">{u.email} · {u.role}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${u.accountStatus === "active" ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                    {u.accountStatus}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted">No users yet</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-background/50">
                <th className="text-left p-4 font-medium text-muted">User</th>
                <th className="text-left p-4 font-medium text-muted">Role</th>
                <th className="text-left p-4 font-medium text-muted">Status</th>
                <th className="text-left p-4 font-medium text-muted">University</th>
                <th className="text-right p-4 font-medium text-muted">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-border hover:bg-background/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary">{u.username?.charAt(0).toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-medium">{u.username}</p>
                        <p className="text-xs text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{u.role}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${u.accountStatus === "active" ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                      {u.accountStatus}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-muted">{u.profile?.university || "-"}</td>
                  <td className="p-4 text-right">
                    <div className="flex gap-2 justify-end">
                      {u.accountStatus === "active" ? (
                        <button onClick={() => handleAction(u.id, "suspend")} className="text-xs px-3 py-1.5 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Suspend
                        </button>
                      ) : (
                        <button onClick={() => handleAction(u.id, "activate")} className="text-xs px-3 py-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Activate
                        </button>
                      )}
                      <button onClick={() => handleAction(u.id, "delete")} className="text-xs px-3 py-1.5 rounded-lg bg-error/10 text-error hover:bg-error/20 transition-colors flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
