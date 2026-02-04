"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getAllTeachers } from "../../../api/principalTeachers";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TeacherListPage() {
  const { accessToken } = useAuth();

  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeachers = async () => {
    if (!accessToken) return;

    setLoading(true);

    const res = await getAllTeachers(accessToken);
    if (res) setTeachers(res);

    setLoading(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, [accessToken]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">

      {/* ================= HEADER ================= */}
      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
        Teachers
      </h1>

      {/* ================= LOADING ================= */}
      {loading ? (
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-blue-600" size={45} />
        </div>
      ) : teachers.length === 0 ? (
        <p className="text-neutral-600 text-center text-lg">No teachers found.</p>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow border border-gray-200 overflow-x-auto">

          {/* ================= TEACHERS TABLE ================= */}
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3 text-left font-semibold">SL No</th>
                <th className="p-3 text-left font-semibold">Teacher</th>
                <th className="p-3 text-left font-semibold">Department</th>
                <th className="p-3 text-left font-semibold">Open</th>
              </tr>
            </thead>

            <tbody>
              {teachers.map((t, index) => {
                const displayName =
                  t.first_name || t.last_name
                    ? `${t.first_name || ""} ${t.last_name || ""}`.trim()
                    : `Teacher ${t.user_id}`;

                const department = t.department || t.department_name || "—";

                return (
                  <tr
                    key={t.user_id}
                    className="border-b border-gray-200 hover:bg-gray-100 transition-all"
                  >
                    {/* SERIAL NUMBER */}
                    <td className="p-3 font-semibold text-gray-900">
                      {index + 1}
                    </td>

                    {/* TEACHER + PHOTO */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shadow">
                          {t.profile_image_url ? (
                            <img
                              src={t.profile_image_url}
                              alt="Teacher"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-gray-700 font-bold">
                              {displayName.charAt(0)}
                            </span>
                          )}
                        </div>

                        <span className="font-semibold text-gray-900 text-lg">
                          {displayName}
                        </span>
                      </div>
                    </td>

                    {/* DEPARTMENT */}
                    <td className="p-3 text-gray-800 font-medium">
                      {department}
                    </td>

                    {/* OPEN LINK */}
                    <td className="p-3">
                      <Link
                        href={`/principal/teachers/${t.user_id}`}
                        className="text-blue-600 font-semibold flex items-center gap-1 hover:underline"
                      >
                        Open <ArrowRight size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

        </div>
      )}
    </div>
  );
}
