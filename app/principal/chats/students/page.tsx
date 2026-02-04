"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import {
  getChatMessages,
  sendDirectMessage,
  deleteMessage,
  Chat,
  Message,
} from "@/api/chat";
import "./students.css";

export default function StudentChatsPage() {
  const { user, accessToken } = useAuth();
  const currentUserId = user?.user_id;

  const params = useSearchParams();
  const classId = params.get("class");
  const section = params.get("section");

  const [students, setStudents] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [menuOpenFor, setMenuOpenFor] = useState<number | null>(null);
  const [isChatReady, setIsChatReady] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);

  /* ================= LOAD STUDENTS ================= */
  useEffect(() => {
    if (!accessToken || !classId || !section) return;

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/principal/allStudents?class_id=${classId}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )
      .then((r) => r.json())
      .then((data) => {
        const list: Chat[] = data
          .filter((s: any) => String(s.section) === String(section))
          .map((s: any) => ({
            chat_id: undefined,
            is_group: false,
            other_user: {
              user_id: s.user_id,
              first_name: s.first_name,
              email: s.email,
            },
          }));

        setStudents(list);
      })
      .catch(() => setStudents([]));
  }, [accessToken, classId, section]);

  /* ================= LOAD CHAT + MESSAGES (STRICT ORDER) ================= */
  useEffect(() => {
    if (!activeChat || !currentUserId) return;

    const loadChatAndMessages = async () => {
      setIsChatReady(false);
      setMessages([]);

      let chatId = activeChat.chat_id;

      // 1️⃣ Ensure chat exists
      if (!chatId) {
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
              user2_id: activeChat.other_user!.user_id,
            }),
          }
        );

        const data = await res.json();
        chatId = data.chat_id;

        setActiveChat((prev) =>
          prev ? { ...prev, chat_id: chatId } : prev
        );
      }

      // 2️⃣ Load previous messages BEFORE enabling send
      const msgs = await getChatMessages(chatId);
      setMessages(msgs);

      // 3️⃣ Now chat is ready
      setIsChatReady(true);
      setMenuOpenFor(null);
    };

    loadChatAndMessages();
  }, [activeChat?.other_user?.user_id]);

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= SEND MESSAGE ================= */
  const handleSend = async () => {
    if (
      !isChatReady ||
      !input.trim() ||
      !activeChat ||
      !currentUserId
    )
      return;

    try {
      const msg = await sendDirectMessage(
        currentUserId,
        activeChat.other_user!.user_id,
        input.trim()
      );

      setMessages((prev) => [...prev, msg]);
      setInput("");
    } catch (err) {
      console.error("Failed to send message", err);
    }
  };

  /* ================= DELETE MESSAGE ================= */
  const handleDelete = async (id: number) => {
    setMessages((prev) => prev.filter((m) => m.message_id !== id));
    setMenuOpenFor(null);

    try {
      await deleteMessage(id);
    } catch {
      if (activeChat?.chat_id) {
        const msgs = await getChatMessages(activeChat.chat_id);
        setMessages(msgs);
      }
    }
  };

  return (
    <div className="chat-page">
      {/* SIDEBAR */}
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">Students</div>

        <div className="chat-sidebar-list">
          {students.map((s) => (
            <div
              key={s.other_user!.user_id}
              className={`chat-item ${
                activeChat?.other_user?.user_id ===
                s.other_user?.user_id
                  ? "active"
                  : ""
              }`}
              onClick={() => setActiveChat(s)}
            >
              <div className="chat-avatar">
                {s.other_user!.first_name.charAt(0)}
              </div>
              <div className="chat-info">
                <strong>{s.other_user!.first_name}</strong>
                <span className="chat-subtext">
                  {s.other_user!.email}
                </span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* CHAT WINDOW */}
      <section className="chat-window">
        {!activeChat ? (
          <div className="chat-empty">Select a student</div>
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
              {messages.map((m) => {
                const mine = m.sender_id === currentUserId;

                return (
                  <div
                    key={m.message_id}
                    className={`chat-bubble ${
                      mine ? "sent" : "received"
                    }`}
                  >
                    <span className="bubble-text">{m.content}</span>

                    {mine && (
                      <button
                        className="bubble-menu-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpenFor(
                            menuOpenFor === m.message_id
                              ? null
                              : m.message_id
                          );
                        }}
                      >
                        ⋮
                      </button>
                    )}

                    {menuOpenFor === m.message_id && (
                      <div className="bubble-menu">
                        <button
                          className="danger"
                          onClick={() =>
                            handleDelete(m.message_id)
                          }
                        >
                          Delete
                        </button>
                      </div>
                    )}

                    <div className="time">
                      {new Date(m.sent_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="chat-input">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && handleSend()
                }
                placeholder="Type a message..."
                disabled={!isChatReady}
              />
              <button onClick={handleSend} disabled={!isChatReady}>
                Send
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
