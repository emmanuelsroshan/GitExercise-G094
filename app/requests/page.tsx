"use client";

import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageSquare, CheckCircle, XCircle, Clock, AlertCircle, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-warning/10 text-warning",
  accepted: "bg-info/10 text-info",
  completed: "bg-success/10 text-success",
  cancelled: "bg-error/10 text-error",
};

export default function RequestsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading_req, setLoadingReq] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const fetchRequests = async () => {
    setLoadingReq(true);
    try {
      const res = await fetch("/api/requests", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setRequests(data);
    } catch {}
    setLoadingReq(false);
  };

  useEffect(() => {
    if (user) fetchRequests();
  }, [user]);

  const handleStatus = async (id: string, status: string) => {
    await fetch(`/api/requests/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ status }),
    });
    fetchRequests();
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold">Help Requests</h1>
        <p className="text-muted mt-1">
          {isTutor ? "Manage requests from students" : "Track your help requests"}
        </p>
      </div>

      {loading_req ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-border">
          <MessageSquare className="w-12 h-12 text-muted mx-auto mb-4" />
          <p className="text-muted">No requests yet</p>
          <p className="text-xs text-muted mt-1">
            {isTutor ? "Requests from students will appear here" : "Find a tutor and send your first request"}
          </p>
          {!isTutor && (
            <Link href="/search" className="inline-flex items-center gap-1 text-primary text-sm mt-4 hover:underline">
              Find a Tutor <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl p-6 border border-border card-hover animate-fade-in">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-primary">
                      {(isTutor ? req.sender?.username : req.tutor?.username)?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {isTutor ? req.sender?.username : req.tutor?.username || req.tutor?.profile?.fullName}
                    </h3>
                    <p className="text-sm text-muted">{req.subject}</p>
                    {req.topic && <p className="text-sm text-muted mt-1">{req.topic}</p>}
                    {req.description && <p className="text-sm text-muted mt-2">{req.description}</p>}
                    <div className="flex items-center gap-3 mt-3 text-xs">
                      <span className={`px-2 py-1 rounded-full ${STATUS_COLORS[req.status] || "bg-muted/10 text-muted"}`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                      <span className="flex items-center gap-1 text-muted">
                        <Clock className="w-3 h-3" />
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1 text-muted">
                        <AlertCircle className="w-3 h-3" />
                        {req.urgency}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                {isTutor && req.status === "open" && (
                  <>
                    <button onClick={() => handleStatus(req.id, "accepted")} className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors">
                      <CheckCircle className="w-4 h-4" /> Accept
                    </button>
                    <button onClick={() => handleStatus(req.id, "cancelled")} className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg border border-border hover:bg-background transition-colors">
                      <XCircle className="w-4 h-4" /> Decline
                    </button>
                  </>
                )}
                {req.status === "accepted" && (
                  <>
                    <Link href={`/chat/${req.id}`} className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors">
                      <MessageSquare className="w-4 h-4" /> Chat
                    </Link>
                    {isTutor ? (
                      <button onClick={() => handleStatus(req.id, "completed")} className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg bg-success text-white hover:bg-success/90 transition-colors">
                        <CheckCircle className="w-4 h-4" /> Mark Complete
                      </button>
                    ) : (
                      <button onClick={() => handleStatus(req.id, "completed")} className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg bg-success text-white hover:bg-success/90 transition-colors">
                        <CheckCircle className="w-4 h-4" /> Complete
                      </button>
                    )}
                  </>
                )}
                {req.status === "completed" && !req.review && !isTutor && (
                  <Link href={`/chat/${req.id}`} className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg bg-secondary text-white hover:bg-secondary/90 transition-colors">
                    <Star className="w-4 h-4" /> Leave Review
                  </Link>
                )}
                {(req.status === "accepted" || req.status === "completed") && (
                  <Link href={`/chat/${req.id}`} className="flex items-center gap-1 text-sm px-4 py-2 rounded-lg border border-border hover:bg-background transition-colors">
                    <MessageSquare className="w-4 h-4" /> View Chat
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
