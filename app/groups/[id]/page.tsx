"use client";

import { useAuth } from "@/components/AuthProvider";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Send, ArrowLeft, Users, MapPin, LogOut, Trash2 } from "lucide-react";
import Link from "next/link";

export default function GroupDetailPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const groupId = params.id as string;

  const [group, setGroup] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  const fetchGroup = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      const data = await res.json();
      setGroup(data);
    } catch {}
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch {}
  };

  useEffect(() => {
    if (user && groupId) {
      Promise.all([fetchGroup(), fetchMessages()]).finally(() => setLoadingGroup(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, groupId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isMember = group?.members?.some((m: any) => m.userId === user?.id);
  const isCreator = group?.creatorId === user?.id;

  const handleJoin = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}/join`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) {
        await fetchGroup();
        await fetchMessages();
      }
    } catch {}
  };

  const handleLeave = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}/join`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) router.push("/groups");
    } catch {}
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (res.ok) router.push("/groups");
    } catch {}
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/messages`, {
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

  if (loading || loadingGroup || !group)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
      </div>
    );
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/groups" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to groups
      </Link>

      <div className="bg-white rounded-2xl border border-border overflow-hidden mb-6">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{group.name}</h1>
              <p className="text-sm text-muted mt-1">{group.subject}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {!isMember && (
                <button
                  onClick={handleJoin}
                  disabled={group.members?.length >= group.maxMembers}
                  className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {group.members?.length >= group.maxMembers ? "Full" : "Join Group"}
                </button>
              )}
              {isMember && !isCreator && (
                <button
                  onClick={handleLeave}
                  className="flex items-center gap-1 text-sm px-4 py-2 rounded-xl border border-border hover:bg-background transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Leave
                </button>
              )}
              {isCreator && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 text-sm px-4 py-2 rounded-xl border border-error/30 text-error hover:bg-error/5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              )}
            </div>
          </div>

          {group.description && <p className="text-sm text-muted mt-4">{group.description}</p>}

          <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" /> {group.members?.length || 0}/{group.maxMembers} members
            </span>
            {group.university && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {group.university}
              </span>
            )}
            {group.meetingTime && <span>Meets: {group.meetingTime}</span>}
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {group.members?.map((m: any) => (
              <span key={m.id} className="bg-primary/5 text-primary text-xs px-3 py-1 rounded-full">
                {m.user?.username}
                {m.userId === group.creatorId ? " (creator)" : ""}
              </span>
            ))}
          </div>
        </div>
      </div>

      {isMember ? (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <p className="font-medium text-sm">Group Chat</p>
          </div>

          <div className="h-[400px] overflow-y-auto p-4 space-y-4 bg-background/50">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted text-sm">No messages yet. Say hello to the group!</p>
              </div>
            )}
            {messages.map((msg) => {
              const isMine = msg.senderId === user.id;
              return (
                <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"} animate-fade-in`}>
                  <div className={`max-w-[75%] ${isMine ? "bg-primary text-white" : "bg-white border border-border"} rounded-2xl px-4 py-2.5`}>
                    {!isMine && <p className="text-xs font-medium mb-0.5 opacity-70">{msg.sender?.username}</p>}
                    <p className="text-sm">{msg.content}</p>
                    <div className={`mt-1 ${isMine ? "text-white/70" : "text-muted"}`}>
                      <span className="text-[10px]">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

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
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-2xl border border-border">
          <p className="text-muted text-sm">Join this group to see the chat and participate.</p>
        </div>
      )}
    </div>
  );
}
