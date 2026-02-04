"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "../../../../context/AuthContext";
import {
  getTeachersSubjects,
  getTeacherDetails,
} from "../../../../api/principalTeachers";
import { Loader2 } from "lucide-react";

export default function TeacherDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { accessToken } = useAuth();
  const { id } = use(params);
  const teacherId = Number(id);

  const [teacher, setTeacher] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("details");

  const loadData = async () => {
    if (!accessToken) return;

    setLoading(true);

    const info = await getTeacherDetails(accessToken, teacherId);
    const sub = await getTeachersSubjects(accessToken, teacherId);

    setTeacher(info || null);
    setSubjects(sub || []);

    setLoading(false);
  };

  useEffect(() => {
    if (teacherId) loadData();
  }, [accessToken, teacherId]);

  if (!teacherId)
    return (
      <div className="p-6 text-red-600 text-xl font-bold">
        Invalid Teacher ID.
      </div>
    );

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={50} />
      </div>
    );

  if (!teacher)
    return (
      <div className="p-6 text-red-600 text-xl font-bold">Teacher not found.</div>
    );

  return (
    <div className="p-6 space-y-10">
      
      {/* ================= HEADER WITH PHOTO ================= */}
      <div className="flex items-center gap-6 bg-white p-6 rounded-xl shadow border border-gray-200">

        <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-300 shadow">
          {teacher.profile_image_url ? (
            <img
              src={teacher.profile_image_url}
              alt="Teacher Photo"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-600 text-3xl font-bold">
              {teacher.first_name?.charAt(0)}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
            {teacher.first_name} {teacher.last_name}
          </h1>
          <p className="text-lg text-gray-700">{teacher.email}</p>
        </div>
      </div>

      {/* ================= TABS ================= */}
      <div className="flex gap-4 border-b pb-3">
        {["details", "subjects"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg font-semibold transition-all ${
              tab === t
                ? "bg-blue-600 text-white shadow"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* ================= DETAILS TAB ================= */}
      {tab === "details" && (
        <div className="bg-white border border-gray-300 shadow-lg rounded-xl p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Teacher Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
            <p><b>Email:</b> {teacher.email}</p>
            <p>
              <b>Status:</b>{" "}
              {teacher.is_active ? (
                <span className="text-green-600 font-semibold">Active</span>
              ) : (
                <span className="text-red-600 font-semibold">Inactive</span>
              )}
            </p>

            <p><b>Qualification:</b> {teacher.qualification || "Not provided"}</p>
            <p><b>Experience:</b> {teacher.experience_years} years</p>

            <p><b>Specialization:</b> {teacher.subject_specialization || "None"}</p>
            <p><b>Date Joined:</b> {teacher.date_joined}</p>
          </div>
        </div>
      )}

      {/* ================= SUBJECTS TAB ================= */}
      {tab === "subjects" && (
        <div className="bg-white border border-gray-300 shadow-lg rounded-xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Subjects Taught</h2>

          {subjects.length === 0 ? (
            <p className="text-gray-700">No subjects assigned.</p>
          ) : (
            <div className="space-y-4">
              {subjects.map((s) => (
                <div
                  key={s.id}
                  className="bg-gray-100 p-4 rounded-lg border border-gray-300 shadow-sm"
                >
                  <p className="text-gray-900">
                    <b>{s.subject_name}</b>
                  </p>

                  <p className="text-gray-800">
                    Class:{" "}
                    <span className="font-semibold text-blue-600">
                      {s.class_name} 
                      {s.section ? ` (${s.section})` : ""} 
                      {s.medium ? ` • ${s.medium}` : ""}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
