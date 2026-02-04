// app/principal/event-requests/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  getAllEvents,
  approveEvent,
  rejectEvent,
  Event,
} from "@/api/principalEvents";
import { useRouter } from "next/navigation";
import styles from "./eventRequests.module.css";

type TabType = "upcoming" | "history";

export default function EventRequestsPage() {
  const { accessToken } = useAuth();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("upcoming");
  const [toast, setToast] = useState<string | null>(null);

  /* ---------------- Toast ---------------- */
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  /* ---------------- Load Events ---------------- */
  useEffect(() => {
    if (!accessToken) return;

    let cancelled = false;

    const fetchEvents = async () => {
      try {
        const data = await getAllEvents(accessToken);
        if (!cancelled) {
          setEvents(data);
        }
      } catch {
        if (!cancelled) {
          showToast("Failed to load event requests");
        }
      }
    };

    fetchEvents();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  /* ---------------- Approve / Reject ---------------- */
  const handleApprove = async (id: number) => {
    if (!accessToken) return;
    try {
      await approveEvent(id, accessToken);
      showToast("Event approved successfully");

      const data = await getAllEvents(accessToken);
      setEvents(data);
    } catch {
      showToast("Approval failed");
    }
  };

  const handleReject = async (id: number) => {
    if (!accessToken) return;
    try {
      await rejectEvent(id, accessToken);
      showToast("Event rejected");

      const data = await getAllEvents(accessToken);
      setEvents(data);
    } catch {
      showToast("Rejection failed");
    }
  };

  /* ---------------- Filters ---------------- */
  const today = new Date().toISOString().split("T")[0];

  const upcomingEvents = events.filter(
    (e) => e.event_date >= today && e.status === "pending"
  );

  const historyEvents = events.filter(
    (e) => e.event_date < today || e.status !== "pending"
  );

  return (
    <div className={styles["requests-page"]}>
      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}

      {/* Back */}
      <button
        className={styles["back-btn"]}
        onClick={() => router.push("/principal/events")}
      >
        ← Back to Events
      </button>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "upcoming" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("upcoming")}
        >
          Upcoming Requests
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "history" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("history")}
        >
          Event History
        </button>
      </div>

      {/* CONTENT */}
      <div className={styles["sections-grid"]}>
        {/* ================= UPCOMING ================= */}
        {activeTab === "upcoming" && (
          <div className={styles["section-card"]}>
            <h3 className={styles["section-title"]}>
              Upcoming Event Requests
            </h3>

            <div className={styles["table-wrapper"]}>
              {upcomingEvents.length === 0 ? (
                <p className={styles.empty}>No pending event requests</p>
              ) : (
                <table className={styles.table}>
                  <thead className={styles.thead}>
                    <tr>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Created By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className={styles.tbody}>
                    {upcomingEvents.map((e) => (
                      <tr key={e.event_id}>
                        <td>{e.title || "Untitled Event"}</td>
                        <td>{e.event_date}</td>
                        <td>{e.created_by ?? "—"}</td>
                        <td>
                          <button
                            className={styles.approve}
                            onClick={() => handleApprove(e.event_id)}
                          >
                            Approve
                          </button>
                          <button
                            className={styles.reject}
                            onClick={() => handleReject(e.event_id)}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ================= HISTORY ================= */}
        {activeTab === "history" && (
          <div className={styles["section-card"]}>
            <h3 className={styles["section-title"]}>Event History</h3>

            <div className={styles["table-wrapper"]}>
              {historyEvents.length === 0 ? (
                <p className={styles.empty}>No event history available</p>
              ) : (
                <table className={styles.table}>
                  <thead className={styles.thead}>
                    <tr>
                      <th>Title</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Approved By</th>
                    </tr>
                  </thead>
                  <tbody className={styles.tbody}>
                    {historyEvents.map((e) => (
                      <tr key={e.event_id}>
                        <td>{e.title || "Untitled Event"}</td>
                        <td>{e.event_date}</td>
                        <td>
                          <span
                            className={`${styles.badge} ${styles[e.status]}`}
                          >
                            {e.status}
                          </span>
                        </td>
                        <td>{e.approved_by ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
