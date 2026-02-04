"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getChatMessages,
  sendDirectMessage,
  deleteMessage,
  Chat,
  Message,
} from "@/api/chat";
import "./teachers.css";

interface Teacher {
  user_id: number;
  first_name: string;
  email: string;
  profile_image_url?: string;
}

export default function TeacherChatsPage() {
  const { user, accessToken } = useAuth();
  const currentUserId = user?.user_id;

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [menuOpenFor, setMenuOpenFor] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadedChatIdsRef = useRef<Set<number>>(new Set());

  /* ================= LOAD TEACHERS ================= */
  useEffect(() => {
    if (!accessToken) return;

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/principal/allTeachers`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => res.json())
      .then((data) => setTeachers(Array.isArray(data) ? data : []))
      .catch(() => setTeachers([]));
  }, [accessToken]);

  /* ================= LOAD MESSAGES (ONCE) ================= */
  useEffect(() => {
    if (!activeChat?.chat_id) return;

    if (loadedChatIdsRef.current.has(activeChat.chat_id)) return;
    loadedChatIdsRef.current.add(activeChat.chat_id);

    getChatMessages(activeChat.chat_id).then(setMessages);
    setMenuOpenFor(null);
  }, [activeChat?.chat_id]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= SELECT TEACHER (KEY FIX) ================= */
  const handleSelectTeacher = async (teacher: Teacher) => {
    if (!currentUserId) return;

    setMessages([]);
    loadedChatIdsRef.current.clear();

    // 🔑 Ensure chat exists BEFORE fetching messages
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/chat/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          user1_id: currentUserId,
          user2_id: teacher.user_id,
        }),
      }
    );

    const data = await res.json();

    setActiveChat({
      chat_id: data.chat_id,
      is_group: false,
      other_user: teacher,
    });
  };

  /* ================= SEND MESSAGE ================= */
  const handleSend = async () => {
    if (!input.trim() || !currentUserId || !activeChat?.other_user) return;

    const msg = await sendDirectMessage(
      currentUserId,
      activeChat.other_user.user_id,
      input.trim()
    );

    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  /* ================= DELETE MESSAGE ================= */
  const handleDelete = async (message_id: number) => {
    setMessages((prev) => prev.filter((m) => m.message_id !== message_id));
    setMenuOpenFor(null);
    await deleteMessage(message_id);
  };

  return (
    <div className="chat-page">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">Teacher Chats</div>

        <div className="chat-sidebar-list">
          {teachers.map((t) => (
            <div
              key={t.user_id}
              className={`chat-item ${
                activeChat?.other_user?.user_id === t.user_id
                  ? "active"
                  : ""
              }`}
              onClick={() => handleSelectTeacher(t)}
            >
              <div className="chat-avatar">
                {t.first_name.charAt(0).toUpperCase()}
              </div>
              <div className="chat-info">
                <strong>{t.first_name}</strong>
                <span className="chat-subtext">{t.email}</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className="chat-window">
        {!activeChat ? (
          <div className="chat-empty">
            Select a teacher to start messaging
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="chat-avatar large">
                {activeChat.other_user!.first_name.charAt(0)}
              </div>
              <strong>{activeChat.other_user!.first_name}</strong>
            </div>

            <div
              className="chat-messages"
              onClick={() => setMenuOpenFor(null)}
            >
              {messages.map((msg) => {
                const mine = msg.sender_id === currentUserId;
                return (
                  <div
                    key={msg.message_id}
                    className={`chat-bubble ${
                      mine ? "sent" : "received"
                    }`}
                  >
                    <span className="bubble-text">{msg.content}</span>

                    {mine && (
                      <button
                        className="bubble-menu-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenFor(
                            menuOpenFor === msg.message_id
                              ? null
                              : msg.message_id
                          );
                        }}
                      >
                        ⋮
                      </button>
                    )}

                    {menuOpenFor === msg.message_id && (
                      <div className="bubble-menu">
                        <button
                          className="danger"
                          onClick={() =>
                            handleDelete(msg.message_id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    <div className="time">
                      {new Date(msg.sent_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message…"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button onClick={handleSend}>Send</button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
