"use client";

import { useAuth } from "@/components/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Send, ArrowLeft, Check, CheckCheck } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [request, setRequest] = useState<any>(null);
  const [sending, setSending] = useState(false);
  const [review, setReview] = useState({ rating: 5, feedback: "" });
  const [reviewing, setReviewing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user && params.requestId) {
      fetch(`/api/requests/${params.requestId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
        .then((res) => res.json())
        .then((data) => {
          setRequest(data);
          setMessages(data.messages || []);
        })
        .catch(() => {});
    }
  }, [user, params.requestId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/messages/${params.requestId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content: newMessage.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setNewMessage("");
      }
    } catch {}
    setSending(false);
  };

  const submitReview = async () => {
    if (reviewing) return;
    setReviewing(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          requestId: params.requestId,
          tutorId: request.tutorId,
          rating: review.rating,
          feedback: review.feedback,
        }),
      });
      setRequest({ ...request, review: { rating: review.rating, feedback: review.feedback } });
    } catch {}
    setReviewing(false);
  };

  if (loading || !request)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  if (!user) return null;

  const otherUser = request.tutorId === user.id ? request.sender : request.tutor;
  const isStudent = user.role === "student";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/requests" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to requests
      </Link>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="font-bold text-primary">{otherUser?.username?.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <p className="font-medium text-sm">{otherUser?.username}</p>
            <p className="text-xs text-muted">{request.subject} · {request.status}</p>
          </div>
          <div className="ml-auto">
            <span className={`text-xs px-2 py-1 rounded-full ${
              request.status === "open" ? "bg-warning/10 text-warning" :
              request.status === "accepted" ? "bg-info/10 text-info" :
              request.status === "completed" ? "bg-success/10 text-success" : "bg-error/10 text-error"
            }`}>
              {request.status}
            </span>
          </div>
        </div>

        <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-background/50">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted text-sm">No messages yet. Start the conversation!</p>
            </div>
          )}
          {messages.map((msg) => {
            const isMine = msg.senderId === user.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-fade-in`}>
                <div className={`max-w-[75%] ${isMine ? "bg-primary text-white" : "bg-white border border-border"} rounded-2xl px-4 py-2.5`}>
                  <p className="text-sm">{msg.content}</p>
                  <div className={`flex items-center gap-1 mt-1 ${isMine ? "text-white/70" : "text-muted"}`}>
                    <span className="text-[10px]">{new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    {isMine && (msg.read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />)}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {request.status !== "cancelled" && (
          <div className="p-4 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sending}
                className="bg-primary text-white p-3 rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {request.status === "completed" && !request.review && isStudent && (
          <div className="p-4 border-t border-border bg-background/50">
            <h3 className="text-sm font-semibold mb-3">Leave a Review</h3>
            <div className="flex items-center gap-1 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setReview({ ...review, rating: star })}>
                  <StarIcon filled={star <= review.rating} />
                </button>
              ))}
            </div>
            <textarea
              value={review.feedback}
              onChange={(e) => setReview({ ...review, feedback: e.target.value })}
              placeholder="Share your experience..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none mb-3"
            />
            <button
              onClick={submitReview}
              disabled={reviewing}
              className="bg-secondary text-white px-6 py-2.5 rounded-xl hover:bg-secondary/90 transition-colors text-sm font-medium disabled:opacity-50"
            >
              {reviewing ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        )}

        {request.review && (
          <div className="p-4 border-t border-border bg-background/50">
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon key={star} filled={star <= request.review.rating} />
              ))}
              <span className="text-sm text-muted ml-2">{request.review.feedback}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg className={`w-5 h-5 ${filled ? "text-secondary fill-current" : "text-muted"}`} viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
