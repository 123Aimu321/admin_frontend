"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  listAnnouncements,
  createAnnouncement,
  deleteAnnouncement,
} from "../../../api/principalAnnouncements";

import { Loader2, Plus, Trash, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PrincipalAnnouncementsPage() {
  const { accessToken, user } = useAuth();

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);

  /* FETCH ANNOUNCEMENTS */
  const fetchData = async () => {
    if (!accessToken || !user?.school_id) return;

    setLoading(true);
    const data = await listAnnouncements(accessToken, user.school_id);

    setAnnouncements(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [accessToken, user]);

  /* CREATE ANNOUNCEMENT */
  const handleCreate = async () => {
    if (!title.trim()) return;

    setCreating(true);

    const payload = {
      title,
      content,
      school_id: user?.school_id,
      target_audience: "all",
      priority: "normal",
    };

    const res = await createAnnouncement(accessToken!, payload);

    if (res) {
      setTitle("");
      setContent("");
      fetchData();
    }

    setCreating(false);
  };

  /* DELETE ANNOUNCEMENT */
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this announcement?")) return;

    await deleteAnnouncement(accessToken!, id);
    fetchData();
  };

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold text-black">📢 Announcements</h1>

      {/* CREATE FORM */}
      <div className="border border-neutral-300 rounded-xl p-4 space-y-3 bg-white shadow-md">
        <h2 className="text-xl font-bold text-black flex items-center gap-2">
          <Plus size={20} /> Create New Announcement
        </h2>

        <input
          className="w-full border border-neutral-300 rounded-lg p-2 text-black placeholder-neutral-500"
          placeholder="Announcement title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border border-neutral-300 rounded-lg p-2 text-black placeholder-neutral-500"
          placeholder="Description (optional)"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 font-semibold"
          onClick={handleCreate}
          disabled={creating}
        >
          {creating && <Loader2 className="animate-spin" />}
          Create
        </button>
      </div>

      {/* ANNOUNCEMENT LIST */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : announcements.length === 0 ? (
        <p className="text-neutral-700 text-center py-10 font-medium">
          No announcements yet.
        </p>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div
              key={a.announcement_id}
              className="border border-neutral-300 rounded-xl p-4 bg-white shadow-md flex justify-between items-center hover:shadow-lg transition-all"
            >
              <div>
                <h3 className="font-semibold text-lg text-black">{a.title}</h3>
                <p className="text-neutral-700 text-sm">{a.content}</p>

                <Link
                  href={`/principal/announcements/${a.announcement_id}`}
                  className="text-blue-600 font-semibold flex items-center gap-1 mt-1 hover:underline text-sm"
                >
                  View Details <ArrowRight size={14} />
                </Link>
              </div>

              <button
                onClick={() => handleDelete(a.announcement_id)}
                className="p-2 rounded-full hover:bg-red-200 text-red-600 transition"
              >
                <Trash size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
