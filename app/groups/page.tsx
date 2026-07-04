"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Users, Plus, X, MapPin, BookOpen } from "lucide-react";
import Link from "next/link";

export default function GroupsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [groups, setGroups] = useState<any[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [filters, setFilters] = useState({ subject: "", university: "" });
  const [form, setForm] = useState({
    name: "",
    subject: "",
    description: "",
    university: "",
    meetingTime: "",
    maxMembers: "6",
  });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const fetchGroups = async () => {
    setLoadingGroups(true);
    try {
      const params = new URLSearchParams();
      if (filters.subject) params.set("subject", filters.subject);
      if (filters.university) params.set("university", filters.university);
      const res = await fetch(`/api/groups?${params}`);
      const data = await res.json();
      setGroups(data);
    } catch {
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (user) fetchGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...form,
          maxMembers: parseInt(form.maxMembers) || 6,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create group");
        return;
      }
      setShowCreate(false);
      setForm({ name: "", subject: "", description: "", university: "", meetingTime: "", maxMembers: "6" });
      router.push(`/groups/${data.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (groupId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) router.push(`/groups/${groupId}`);
    } catch {}
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-start justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Study Groups</h1>
          <p className="text-muted mt-1">Join a group or start your own to study together</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-3 rounded-xl hover:bg-primary-dark transition-colors font-medium flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> New Group
        </button>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-border mb-8 animate-slide-up">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-2 text-muted">Subject</label>
            <input
              type="text"
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              placeholder="e.g. Calculus"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
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
        </div>
        <button
          onClick={fetchGroups}
          className="mt-4 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-colors font-medium"
        >
          Search Groups
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {loadingGroups ? (
          <div className="col-span-2 flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : groups.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-2xl border border-border">
            <Users className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">No study groups found</p>
            <p className="text-xs text-muted mt-1">Be the first to start one</p>
          </div>
        ) : (
          groups.map((group, index) => {
            const isMember = group.members?.some((m: any) => m.userId === user.id);
            const isFull = group.members?.length >= group.maxMembers;
            return (
              <div
                key={group.id}
                className="bg-white rounded-2xl p-6 border border-border card-hover animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold">{group.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted mt-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{group.subject}</span>
                    </div>
                  </div>
                  <span className="text-xs px-3 py-1 rounded-full bg-primary/5 text-primary flex-shrink-0">
                    {group.members?.length || 0}/{group.maxMembers} members
                  </span>
                </div>

                {group.description && (
                  <p className="text-sm text-muted mt-3 line-clamp-2">{group.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted">
                  {group.university && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {group.university}
                    </span>
                  )}
                  {group.meetingTime && <span>· {group.meetingTime}</span>}
                  <span>· Created by {group.creator?.username}</span>
                </div>

                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/groups/${group.id}`}
                    className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg border border-border hover:bg-background transition-colors"
                  >
                    View
                  </Link>
                  {!isMember && !isFull && (
                    <button
                      onClick={() => handleJoin(group.id)}
                      className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors"
                    >
                      Join Group
                    </button>
                  )}
                  {isMember && (
                    <span className="flex items-center text-sm px-4 py-2 rounded-lg bg-success/10 text-success">
                      You're a member
                    </span>
                  )}
                  {!isMember && isFull && (
                    <span className="flex items-center text-sm px-4 py-2 rounded-lg bg-error/10 text-error">
                      Full
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md animate-slide-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">New Study Group</h2>
              <button onClick={() => setShowCreate(false)}>
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>

            {error && (
              <div className="bg-error/10 text-error text-sm p-3 rounded-lg mb-4">{error}</div>
            )}

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Group Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Calculus Study Squad"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subject</label>
                <input
                  type="text"
                  required
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="e.g. Calculus"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What will this group focus on?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">University</label>
                  <input
                    type="text"
                    value={form.university}
                    onChange={(e) => setForm({ ...form, university: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Max Members</label>
                  <input
                    type="number"
                    min={2}
                    max={50}
                    value={form.maxMembers}
                    onChange={(e) => setForm({ ...form, maxMembers: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Meeting Time</label>
                <input
                  type="text"
                  value={form.meetingTime}
                  onChange={(e) => setForm({ ...form, meetingTime: e.target.value })}
                  placeholder="e.g. Tuesdays 6pm"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-primary text-white py-3 rounded-xl hover:bg-primary-dark transition-colors font-medium disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Group"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
