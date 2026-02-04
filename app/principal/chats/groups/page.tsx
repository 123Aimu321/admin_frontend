"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Chat,
  Message,
  User,
  getUserChats,
  getChatMessages,
  createGroupChat,
  renameGroupChat,
  addUserToGroup,
  removeUserFromGroup,
  deleteMessage,
} from "@/api/chat";
import "./group.css";

/* ================= TYPES ================= */

interface SchoolUser extends User {
  role: "teacher" | "student";
  class_name?: string;
  section?: string;
}

/* ================= COMPONENT ================= */

export default function GroupChatsPage() {
  const { user, accessToken } = useAuth();
  const currentUserId = user?.user_id;

  const [groups, setGroups] = useState<Chat[]>([]);
  const [activeGroup, setActiveGroup] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  /* CREATE GROUP FLOW */
  const [createStep, setCreateStep] = useState<1 | 2 | null>(null);
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  /* USERS */
  const [users, setUsers] = useState<SchoolUser[]>([]);
  const [memberIds, setMemberIds] = useState<Set<number>>(new Set());

  /* UI */
  const [groupMenuOpen, setGroupMenuOpen] = useState(false);
  const [manageMembersOpen, setManageMembersOpen] = useState(false);

  /* MESSAGE */
  const [input, setInput] = useState("");
  const [msgMenuOpen, setMsgMenuOpen] = useState<number | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  /* ================= LOAD GROUPS ================= */

  useEffect(() => {
    if (!currentUserId) return;
    getUserChats(currentUserId).then((res) => {
      if (Array.isArray(res)) {
        setGroups(res.filter((c) => c.is_group));
      }
    });
  }, [currentUserId]);

  /* ================= LOAD USERS ================= */

  useEffect(() => {
    if (!accessToken) return;

    const headers = { Authorization: `Bearer ${accessToken}` };

    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/principal/allTeachers`, { headers }),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/principal/allStudents`, { headers }),
    ])
      .then(async ([tRes, sRes]) => {
        const teachers = tRes.ok ? await tRes.json() : [];
        const students = sRes.ok ? await sRes.json() : [];

        const map = new Map<number, SchoolUser>();

        teachers.forEach((t: any) =>
          map.set(t.user_id, { ...t, role: "teacher" })
        );

        students.forEach((s: any) =>
          map.set(s.user_id, {
            ...s,
            role: "student",
            class_name: s.class_name,
            section: s.section,
          })
        );

        setUsers([...map.values()]);
      })
      .catch(() => setUsers([]));
  }, [accessToken]);

  /* ================= LOAD MESSAGES ================= */

  useEffect(() => {
    if (!activeGroup) return setMessages([]);
    getChatMessages(activeGroup.chat_id).then((res) => {
      if (Array.isArray(res)) setMessages(res);
    });
  }, [activeGroup]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ================= GROUP MEMBERS ================= */

  const loadMembers = async (chatId: number) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/chats/${chatId}/info`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return;
    const data = await res.json();
    setMemberIds(new Set(data.participants.map((p: User) => p.user_id)));
  };

  /* ================= CREATE GROUP ================= */

  const handleCreateGroup = async () => {
    if (!groupName || selectedUsers.length === 0 || !currentUserId) return;

    await createGroupChat(groupName, [currentUserId, ...selectedUsers]);

    setCreateStep(null);
    setGroupName("");
    setSelectedUsers([]);

    const updated = await getUserChats(currentUserId);
    setGroups(updated.filter((c) => c.is_group));
  };

  /* ================= SEND MESSAGE ================= */

  const handleSend = async () => {
    if (!input.trim() || !activeGroup || !currentUserId) return;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/message/send_to_chat` +
        `?chat_id=${activeGroup.chat_id}` +
        `&sender_id=${currentUserId}` +
        `&content=${encodeURIComponent(input.trim())}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) return;
    const msg = await res.json();
    setMessages((m) => [...m, msg]);
    setInput("");
  };

  /* ================= LEAVE GROUP ================= */

  const handleLeaveGroup = async () => {
    if (!activeGroup || !currentUserId) return;
    await removeUserFromGroup(activeGroup.chat_id, currentUserId);
    setGroups((g) => g.filter((x) => x.chat_id !== activeGroup.chat_id));
    setActiveGroup(null);
    setGroupMenuOpen(false);
  };

  /* ================= UI ================= */

  return (
    <div className="chat-page">
      {/* SIDEBAR */}
      <aside className="chat-sidebar">
        <div className="chat-sidebar-header">
          Group Chats
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCreateStep(1);
            }}
          >
            ＋
          </button>
        </div>

        <div className="chat-sidebar-list">
          {groups.map((g) => (
            <div
              key={g.chat_id}
              className={`chat-item ${
                activeGroup?.chat_id === g.chat_id ? "active" : ""
              }`}
              onClick={() => setActiveGroup(g)}
            >
              <div className="chat-avatar">{g.chat_name?.[0]}</div>
              <div className="chat-info">
                <strong>{g.chat_name}</strong>
                <span className="chat-subtext">{g.member_count} members</span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* CHAT WINDOW */}
      <section className="chat-window">
        {!activeGroup ? (
          <div className="chat-empty">Select a group</div>
        ) : (
          <>
            <div className="chat-header">
              <strong>{activeGroup.chat_name}</strong>
              <button onClick={() => setGroupMenuOpen((v) => !v)}>⋮</button>

              {groupMenuOpen && (
                <div className="group-menu">
                  <button
                    onClick={async () => {
                      await loadMembers(activeGroup.chat_id);
                      setManageMembersOpen(true);
                    }}
                  >
                    Manage members
                  </button>
                  <button
                    onClick={async () => {
                      const name = prompt("New group name");
                      if (name) {
                        await renameGroupChat(activeGroup.chat_id, name);
                        setActiveGroup({ ...activeGroup, chat_name: name });
                      }
                    }}
                  >
                    Rename group
                  </button>
                  <button className="danger" onClick={handleLeaveGroup}>
                    Leave group
                  </button>
                </div>
              )}
            </div>

            <div className="chat-messages">
              {messages.map((m) => {
                const mine = m.sender_id === currentUserId;
                return (
                  <div
                    key={m.message_id}
                    className={`chat-bubble ${mine ? "sent" : "received"}`}
                  >
                    {m.content}
                    {mine && (
                      <button
                        className="message-menu-btn"
                        onClick={() =>
                          setMsgMenuOpen(
                            msgMenuOpen === m.message_id ? null : m.message_id
                          )
                        }
                      >
                        ⋮
                      </button>
                    )}
                    {msgMenuOpen === m.message_id && (
                      <div className="message-menu">
                        <button
                          className="danger"
                          onClick={async () => {
                            await deleteMessage(m.message_id);
                            setMessages((x) =>
                              x.filter((y) => y.message_id !== m.message_id)
                            );
                            setMsgMenuOpen(null);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={bottomRef} />
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

      {/* CREATE GROUP – STEP 1 */}
      {createStep === 1 && (
        <div className="modal">
          <div className="modal-step">
            <div className="modal-header">Create group</div>
            <div className="modal-body">
              <input
                placeholder="Group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="secondary" onClick={() => setCreateStep(null)}>
                Cancel
              </button>
              <button className="primary" onClick={() => setCreateStep(2)}>
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE GROUP – STEP 2 */}
      {createStep === 2 && (
        <div className="modal">
          <div className="modal-step">
            <div className="modal-header">Add members</div>
            <div className="modal-body">
              {users.map((u) => (
                <label key={u.user_id} className="user-row">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(u.user_id)}
                    onChange={() =>
                      setSelectedUsers((p) =>
                        p.includes(u.user_id)
                          ? p.filter((id) => id !== u.user_id)
                          : [...p, u.user_id]
                      )
                    }
                  />
                  <span>
                    {u.first_name}{" "}
                    {u.role === "student"
                      ? `(Class ${u.class_name}-${u.section})`
                      : `(Teacher)`}
                  </span>
                </label>
              ))}
            </div>
            <div className="modal-footer">
              <button className="secondary" onClick={() => setCreateStep(1)}>
                Back
              </button>
              <button className="primary" onClick={handleCreateGroup}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE MEMBERS */}
      {manageMembersOpen && activeGroup && (
        <div className="modal">
          <div className="modal-step">
            <div className="modal-header">Manage members</div>
            <div className="modal-body">
              {users.map((u) => {
                const isMember = memberIds.has(u.user_id);
                return (
                  <div key={u.user_id} className="member-row">
                    <span>
                      {u.first_name}{" "}
                      {u.role === "student"
                        ? `(Class ${u.class_name}-${u.section})`
                        : `(Teacher)`}
                    </span>
                    <button
                      className={isMember ? "danger" : ""}
                      onClick={async () => {
                        if (isMember) {
                          await removeUserFromGroup(activeGroup.chat_id, u.user_id);
                          setMemberIds((p) => {
                            const n = new Set(p);
                            n.delete(u.user_id);
                            return n;
                          });
                        } else {
                          await addUserToGroup(activeGroup.chat_id, u.user_id);
                          setMemberIds((p) => new Set(p).add(u.user_id));
                        }
                      }}
                    >
                      {isMember ? "Remove" : "Add"}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="modal-footer">
              <button className="primary" onClick={() => setManageMembersOpen(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
