import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageSquare, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { messagesAPI, profileAPI } from "../api/client";
import { usePolling } from "../hooks/usePolling";
import Avatar from "../components/Avatar";

export default function ChatPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const targetUserId = searchParams.get("user");

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(targetUserId ? Number(targetUserId) : null);
  const [activeUser, setActiveUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  // Poll conversation list every 5 seconds
  const fetchConversations = async () => {
    try {
      const { data } = await messagesAPI.getConversations();
      
      // If we have a query parameter for a user that is NOT in the list, pre-populate them
      if (targetUserId) {
        const targetIdNum = Number(targetUserId);
        const exists = data.some((c) => c.other_id === targetIdNum);
        
        if (!exists && !activeUser && targetIdNum !== user?.id) {
          // Fetch target user details to show in sidebar
          try {
            const res = await profileAPI.getById(targetIdNum);
            const dummyConversation = {
              other_id: targetIdNum,
              other_name: res.data.user.username,
              other_role: res.data.user.role,
              last_message: "New conversation - send a message to start",
              unread_count: 0,
              is_dummy: true
            };
            setConversations([dummyConversation, ...data]);
            setActiveUser(res.data.user);
          } catch (err) {
            console.error("Failed to load target user details for chat initiation", err);
          }
        } else {
          setConversations(data);
        }
      } else {
        setConversations(data);
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  };

  usePolling(fetchConversations, 5000, !!user);

  // Fetch active thread
  const fetchThread = async () => {
    if (!activeId) return;
    try {
      const { data } = await messagesAPI.getThread(activeId);
      setMessages(data);
    } catch (err) {
      console.error("Failed to load message thread", err);
    }
  };

  usePolling(fetchThread, 3000, !!activeId);

  // When changing active user
  useEffect(() => {
    if (activeId) {
      setLoading(true);
      // Fetch details of active user if not in list
      const existingConv = conversations.find((c) => c.other_id === activeId);
      if (existingConv) {
        setActiveUser({
          id: existingConv.other_id,
          username: existingConv.other_name,
          role: existingConv.other_role
        });
      }
      fetchThread().then(() => setLoading(false));
      
      // Mark read locally in sidebar unread counts
      setConversations((prev) =>
        prev.map((c) => (c.other_id === activeId ? { ...c, unread_count: 0 } : c))
      );
    } else {
      setActiveUser(null);
      setMessages([]);
    }
  }, [activeId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const content = newMsg.trim();
    if (!content || !activeId) return;

    setSending(true);
    try {
      await messagesAPI.send(activeId, content);
      setNewMsg("");
      // Add local message representation temporarily
      const localMsg = {
        id: Date.now(),
        sender_id: user.id,
        receiver_id: activeId,
        content,
        created_at: new Date().toISOString(),
        sender_name: user.username
      };
      setMessages((prev) => [...prev, localMsg]);

      // Remove the query param once first message is sent
      if (searchParams.get("user")) {
        setSearchParams({});
      }

      // Refresh conversations list to update last message
      fetchConversations();
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const handleSelectConv = (convId) => {
    setActiveId(convId);
    if (searchParams.get("user")) {
      setSearchParams({});
    }
  };

  return (
    <div
      className="glass"
      style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr",
        height: "calc(100vh - 8rem)",
        borderRadius: "24px",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "0 8px 32px 0 rgba(109, 40, 217, 0.1)"
      }}
    >
      {/* Sidebar - Conversation list */}
      <div
        style={{
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          background: "rgba(255, 255, 255, 0.01)"
        }}
      >
        <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <h2 className="font-outfit" style={{ fontSize: "1.2rem", fontWeight: 700, margin: 0 }}>
            Conversations
          </h2>
        </div>

        <div style={{ flexGrow: 1, overflowY: "auto", display: "flex", flexDirection: "column", padding: "0.5rem" }}>
          {conversations.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "rgba(255, 255, 255, 0.35)", fontSize: "0.85rem" }}>
              No active chats. Start one from a tutor profile!
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = conv.other_id === activeId;
              return (
                <button
                  key={conv.other_id}
                  onClick={() => handleSelectConv(conv.other_id)}
                  style={{
                    background: isActive ? "rgba(124, 58, 237, 0.12)" : "transparent",
                    border: "none",
                    borderLeft: isActive ? "3px solid var(--accent-purple)" : "3px solid transparent",
                    borderRadius: "8px",
                    padding: "0.75rem 1rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    textAlign: "left",
                    transition: "all 0.2s"
                  }}
                >
                  <Avatar name={conv.other_name} size={40} />
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                      <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#fff" }}>{conv.other_name}</span>
                      {conv.unread_count > 0 && (
                        <span
                          className="badge badge-purple"
                          style={{
                            fontSize: "0.7rem",
                            padding: "0.1rem 0.4rem",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            background: "var(--accent-purple)"
                          }}
                        >
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        margin: "0.2rem 0 0 0",
                        fontSize: "0.75rem",
                        color: isActive ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {conv.last_message}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Thread Area */}
      <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "rgba(0,0,0,0.1)" }}>
        {activeUser ? (
          <>
            {/* Chat Header */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                background: "rgba(255,255,255,0.01)"
              }}
            >
              <Avatar name={activeUser.username} size={44} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 600, color: "#fff" }}>{activeUser.username}</span>
                <span style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", textTransform: "capitalize" }}>
                  {activeUser.role === "paid"
                    ? "Paid Tutor"
                    : activeUser.role === "volunteer"
                    ? "Volunteer Tutor"
                    : activeUser.role}
                </span>
              </div>
            </div>

            {/* Messages Bubbles */}
            <div style={{ flexGrow: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              {loading && messages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.4)" }}>
                  Loading chat history...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "rgba(255,255,255,0.3)" }}>
                  No messages yet. Say hello!
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender_id === user?.id;
                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: "flex",
                        justifyContent: isOwn ? "flex-end" : "flex-start"
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "65%",
                          padding: "0.75rem 1rem",
                          borderRadius: isOwn ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                          background: isOwn
                            ? "linear-gradient(135deg, var(--accent-purple), #5b21b6)"
                            : "rgba(255, 255, 255, 0.06)",
                          border: isOwn ? "none" : "1px solid rgba(255, 255, 255, 0.05)",
                          color: "#fff",
                          boxShadow: isOwn ? "0 4px 12px rgba(124, 58, 237, 0.25)" : "none"
                        }}
                      >
                        <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.4, wordBreak: "break-word" }}>
                          {msg.content}
                        </p>
                        <span
                          style={{
                            display: "block",
                            fontSize: "0.65rem",
                            color: isOwn ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.35)",
                            textAlign: "right",
                            marginTop: "0.3rem"
                          }}
                        >
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <form
              onSubmit={handleSend}
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                background: "rgba(255,255,255,0.01)",
                display: "flex",
                gap: "0.75rem",
                alignItems: "center"
              }}
            >
              <input
                type="text"
                placeholder="Type your message here..."
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                disabled={sending}
                style={{
                  flexGrow: 1,
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "10px",
                  padding: "0.75rem 1rem",
                  color: "#fff",
                  outline: "none",
                  fontSize: "0.9rem"
                }}
              />
              <button
                type="submit"
                disabled={sending || !newMsg.trim()}
                style={{
                  background: "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))",
                  border: "none",
                  borderRadius: "10px",
                  width: "44px",
                  height: "44px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                  boxShadow: "0 4px 10px rgba(124,58,237,0.3)"
                }}
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "rgba(255, 255, 255, 0.3)",
              gap: "1rem"
            }}
          >
            <MessageSquare size={48} />
            <span>Select a conversation to start chatting</span>
          </div>
        )}
      </div>
    </div>
  );
}
