// app/principal/students/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getAllStudents } from "../../../api/principalStudents";
import { getClasses } from "../../../api/principalClasses";
import { Search, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Student {
  user_id: number;
  first_name: string | null;
  last_name: string | null;
  class_name: string | null;
  section: string | null;
  medium: string | null;
}

interface ClassItem {
  class_id: number;
  name?: string;
  class_name?: string;
  section?: string | null;
}

export default function StudentsPage() {
  const { accessToken } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!accessToken) return;

    const load = async () => {
      setLoading(true);

      const [cls, std] = await Promise.allSettled([
        getClasses(accessToken),
        getAllStudents(accessToken, {
          class_id: selectedClass || undefined,
        }),
      ]);

      if (cls.status === "fulfilled") setClasses(cls.value ?? []);
      if (std.status === "fulfilled") setStudents(std.value ?? []);

      setLoading(false);
    };

    load();
  }, [accessToken, selectedClass]);

  const filtered = students.filter((s) => {
    const name = `${s.first_name ?? ""} ${s.last_name ?? ""}`.toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="p-6 space-y-6 text-gray-900">

      <h1 className="text-3xl font-bold">Students</h1>

      {/* Search + Filter */}
      <div className="bg-white p-5 rounded-xl shadow-md border space-y-4">
        <div className="flex flex-col md:flex-row gap-4">

          <div className="flex items-center bg-gray-100 p-3 rounded-lg flex-1 border">
            <Search className="w-5 h-5 mr-2 text-gray-700" />
            <input
              type="text"
              placeholder="Search student name..."
              className="bg-transparent outline-none w-full text-gray-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            aria-label="Filter students by class"
            className="border p-3 rounded-lg w-full md:w-60 bg-gray-50 text-gray-900"
            value={selectedClass}
            onChange={(e) =>
              setSelectedClass(e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">All Classes</option>
            {classes.map((c) => (
              <option key={c.class_id} value={c.class_id}>
                {c.name || c.class_name || "Class"}
                {c.section ? ` - ${c.section}` : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table with Vertical Scroll */}
      <div className="bg-white rounded-xl shadow-md border">
        <div className="max-h-[70vh] overflow-y-auto overflow-x-auto">
          <table className="w-full text-left text-gray-900">
            <thead className="bg-gray-100 border-b sticky top-0 z-10">
              <tr>
                <th className="p-3">Sl No</th>
                <th className="p-3">Student Name</th>
                <th className="p-3">Class</th>
                <th className="p-3">Medium</th>
                <th className="p-3">Section</th>
                <th className="p-3 text-right">Open</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center">
                    {loading ? "Loading..." : "No students found"}
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr
                    key={s.user_id}
                    className="border-b hover:bg-blue-50 transition"
                  >
                    <td className="p-3">{i + 1}</td>
                    <td className="p-3 font-medium">
                      {s.first_name} {s.last_name}
                    </td>
                    <td className="p-3">{s.class_name ?? "-"}</td>
                    <td className="p-3">{s.medium ?? "-"}</td>
                    <td className="p-3">{s.section ?? "-"}</td>
                    <td className="p-3 text-right">
                      <Link
                        href={`/principal/students/${s.user_id}`}
                        className="flex items-center justify-end gap-1 font-medium text-blue-700 hover:text-blue-900"
                      >
                        View <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
