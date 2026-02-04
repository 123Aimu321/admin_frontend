"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getAllEvents, Event } from "@/api/principalEvents";
import {
  getMyReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  Reminder,
} from "@/api/reminder";
import styles from "./events.module.css";

/* ===============================
   CONSTANTS
=============================== */
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

/* ===============================
   COMPONENT
=============================== */
export default function EventsPage() {
  const { accessToken } = useAuth();
  const router = useRouter();

  const today = new Date();
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<string>(toISODate(today));

  const [events, setEvents] = useState<Event[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  /* MODAL */
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<{
    title: string;
    note: string;
    remind_at: string;
    event_id: number | null;
  }>({
    title: "",
    note: "",
    remind_at: "",
    event_id: null,
  });

  /* ===============================
     LOAD DATA
  =============================== */
  useEffect(() => {
    if (!accessToken) return;

    Promise.all([
      getAllEvents(accessToken),
      getMyReminders(accessToken),
    ])
      .then(([ev, rm]) => {
        setEvents(ev);
        setReminders(rm);
      })
      .catch(console.error);
  }, [accessToken]);

  /* ===============================
     CALENDAR LOGIC
  =============================== */
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthEvents = events.filter(
    e =>
      new Date(e.event_date).getMonth() === month &&
      new Date(e.event_date).getFullYear() === year
  );

  const monthReminders = reminders.filter(
    r =>
      new Date(r.remind_at).getMonth() === month &&
      new Date(r.remind_at).getFullYear() === year
  );

  const selectedEvents = events.filter(e => e.event_date === selectedDate);
  const selectedReminders = reminders.filter(
    r => toISODate(new Date(r.remind_at)) === selectedDate
  );

  const hasReminderForEvent = (eventId: number) =>
    reminders.some(r => r.event_id === eventId);

  /* ===============================
     REMINDER ACTIONS
  =============================== */
  const saveReminder = async () => {
    if (!accessToken || !form.title || !form.remind_at) return;

    if (editingId) {
      const updated = await updateReminder(editingId, form, accessToken);
      setReminders(p =>
        p.map(r => (r.reminder_id === editingId ? updated : r))
      );
    } else {
      const created = await createReminder(form, accessToken);
      setReminders(p => [...p, created]);
    }

    setShowModal(false);
    setEditingId(null);
    setForm({ title: "", note: "", remind_at: "", event_id: null });
  };

  const deleteReminderHandler = async (id: number) => {
    if (!accessToken || !confirm("Delete this reminder?")) return;
    await deleteReminder(id, accessToken);
    setReminders(p => p.filter(r => r.reminder_id !== id));
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div className={styles["events-page"]}>
      {/* ================= HEADER SECTION ================= */}
      <div className={styles["page-header"]}>
        <div className={styles["header-left"]}>
          <h1 className={styles["page-title"]}>Calendar</h1>
          <p className={styles["page-subtitle"]}>Manage your events and reminders</p>
        </div>
        <div className={styles["header-right"]}>
          <button
            className={styles["header-btn"]}
            onClick={() => router.push("/principal/event-requests")}
          >
            <span className={styles["btn-icon"]}>📋</span>
            Event Requests
          </button>
          <button
            className={`${styles["header-btn"]} ${styles["primary-btn"]}`}
            onClick={() => {
              setEditingId(null);
              setForm({
                title: "",
                note: "",
                remind_at: `${selectedDate}T09:00`,
                event_id: null,
              });
              setShowModal(true);
            }}
          >
            <span className={styles["btn-icon"]}>+</span>
            Create Reminder
          </button>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className={styles["content-wrapper"]}>
        {/* ================= CALENDAR SECTION ================= */}
        <div className={styles["calendar-section"]}>
          <div className={styles["calendar-header"]}>
            <div className={styles["month-selector"]}>
              <button 
                className={styles["nav-btn"]}
                onClick={() => setMonth(m => (m === 0 ? 11 : m - 1))}
              >
                ←
              </button>
              <div className={styles["month-display"]}>
                <span className={styles["month-name"]}>{MONTHS[month]}</span>
                <span className={styles["year-display"]}>{year}</span>
              </div>
              <button 
                className={styles["nav-btn"]}
                onClick={() => setMonth(m => (m === 11 ? 0 : m + 1))}
              >
                →
              </button>
            </div>
            <div className={styles["calendar-controls"]}>
              <select
                className={styles["month-select"]}
                value={month}
                onChange={e => setMonth(+e.target.value)}
              >
                {MONTHS.map((m, i) => (
                  <option key={m} value={i}>{m}</option>
                ))}
              </select>
              <select
                className={styles["year-select"]}
                value={year}
                onChange={e => setYear(+e.target.value)}
              >
                {Array.from({ length: 7 }).map((_, i) => {
                  const y = today.getFullYear() - 3 + i;
                  return <option key={y} value={y}>{y}</option>;
                })}
              </select>
            </div>
          </div>

          <div className={styles["calendar-wrapper"]}>
            <div className={styles["calendar-grid-header"]}>
              {DAYS.map(d => (
                <div key={d} className={styles["day-header"]}>
                  {d}
                </div>
              ))}
            </div>

            <div className={styles["calendar-days-container"]}>
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className={styles["calendar-day-empty"]} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateISO = toISODate(new Date(year, month, day));
                const isToday = dateISO === toISODate(today);
                const isSelected = selectedDate === dateISO;

                return (
                  <div
                    key={day}
                    className={`${styles["calendar-day"]} ${
                      isToday ? styles["today"] : ""
                    } ${isSelected ? styles["selected"] : ""}`}
                    onClick={() => setSelectedDate(dateISO)}
                  >
                    <div className={styles["day-number-container"]}>
                      <span className={styles["day-number"]}>{day}</span>
                      {isToday && <span className={styles["today-indicator"]} />}
                    </div>

                    <div className={styles["day-events"]}>
                      {monthEvents
                        .filter(e => e.event_date === dateISO)
                        .map(e => (
                          <div key={e.event_id} className={styles["event-badge"]}>
                            <span className={styles["event-dot"]} />
                            <span className={styles["event-title"]}>
                              {e.title}
                              {hasReminderForEvent(e.event_id) && (
                                <span className={styles["reminder-indicator"]}>🔔</span>
                              )}
                            </span>
                          </div>
                        ))}

                      {monthReminders
                        .filter(r => toISODate(new Date(r.remind_at)) === dateISO)
                        .map(r => (
                          <div key={r.reminder_id} className={`${styles["event-badge"]} ${styles["reminder-badge"]}`}>
                            <span className={styles["reminder-dot"]}>🔔</span>
                            <span className={styles["event-title"]}>{r.title}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ================= DETAILS SIDEBAR ================= */}
        <div className={styles["details-sidebar"]}>
          <div className={styles["sidebar-header"]}>
            <h2 className={styles["sidebar-title"]}>
              <span className={styles["title-icon"]}>📌</span>
              Details
            </h2>
            <div className={styles["selected-date"]}>
              <span className={styles["date-icon"]}>📅</span>
              {new Date(selectedDate).toDateString()}
            </div>
          </div>

          <div className={styles["sidebar-content"]}>
            {selectedEvents.length === 0 && selectedReminders.length === 0 ? (
              <div className={styles["empty-state"]}>
                <div className={styles["empty-icon"]}>📅</div>
                <h3 className={styles["empty-title"]}>No events or reminders</h3>
                <p className={styles["empty-message"]}>
                  There are no events or reminders scheduled for this day.
                </p>
              </div>
            ) : (
              <>
                {selectedEvents.map(ev => (
                  <div key={ev.event_id} className={styles["detail-card"]}>
                    <div className={styles["card-header"]}>
                      <div className={styles["card-title-section"]}>
                        <span className={styles["event-icon"]}>🎯</span>
                        <h3 className={styles["card-title"]}>{ev.title}</h3>
                      </div>
                      {!hasReminderForEvent(ev.event_id) && (
                        <button
                          className={styles["action-btn"]}
                          onClick={() => {
                            setEditingId(null);
                            setForm({
                              title: "",
                              note: "",
                              remind_at: `${ev.event_date}T09:00`,
                              event_id: ev.event_id,
                            });
                            setShowModal(true);
                          }}
                        >
                          + Add Reminder
                        </button>
                      )}
                    </div>
                    <p className={styles["card-description"]}>
                      {ev.description || "No description provided"}
                    </p>
                    <div className={styles["card-footer"]}>
                      <span className={styles["date-time"]}>
                        📅 {new Date(ev.event_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}

                {selectedReminders.map(r => (
                  <div key={r.reminder_id} className={`${styles["detail-card"]} ${styles["reminder-card"]}`}>
                    <div className={styles["card-header"]}>
                      <div className={styles["card-title-section"]}>
                        <span className={styles["reminder-icon"]}>🔔</span>
                        <h3 className={styles["card-title"]}>{r.title}</h3>
                      </div>
                      <div className={styles["action-buttons"]}>
                        <button
                          className={`${styles["action-btn"]} ${styles["edit-btn"]}`}
                          onClick={() => {
                            setEditingId(r.reminder_id);
                            setForm({
                              title: r.title,
                              note: r.note ?? "",
                              remind_at: r.remind_at.slice(0, 16),
                              event_id: r.event_id ?? null,
                            });
                            setShowModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className={`${styles["action-btn"]} ${styles["delete-btn"]}`}
                          onClick={() => deleteReminderHandler(r.reminder_id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {r.note && (
                      <p className={styles["card-description"]}>{r.note}</p>
                    )}
                    <div className={styles["card-footer"]}>
                      <span className={styles["date-time"]}>
                        ⏰ {new Date(r.remind_at).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles["modal-header"]}>
              <h3 className={styles["modal-title"]}>
                {editingId ? "Edit Reminder" : "Create Reminder"}
              </h3>
              <button 
                className={styles["modal-close"]}
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className={styles["modal-body"]}>
              <div className={styles["form-group"]}>
                <label className={styles["form-label"]} htmlFor="title">
                  Reminder Title *
                </label>
                <input
                  id="title"
                  className={styles["form-input"]}
                  type="text"
                  placeholder="Enter reminder title"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["form-label"]} htmlFor="note">
                  Description
                </label>
                <textarea
                  id="note"
                  className={styles["form-textarea"]}
                  placeholder="Add a description (optional)"
                  rows={3}
                  value={form.note}
                  onChange={e => setForm({ ...form, note: e.target.value })}
                />
              </div>

              <div className={styles["form-group"]}>
                <label className={styles["form-label"]} htmlFor="time">
                  Date & Time *
                </label>
                <input
                  id="time"
                  className={styles["form-input"]}
                  type="datetime-local"
                  value={form.remind_at}
                  onChange={e => setForm({ ...form, remind_at: e.target.value })}
                />
              </div>
            </div>

            <div className={styles["modal-footer"]}>
              <button
                className={`${styles["modal-btn"]} ${styles["secondary-btn"]}`}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className={`${styles["modal-btn"]} ${styles["primary-btn"]}`}
                onClick={saveReminder}
                disabled={!form.title || !form.remind_at}
              >
                {editingId ? "Update Reminder" : "Create Reminder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}