// app/principal/classes/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import {
  getClassStudents,
  getClassSubjects,
  getClassTeachers,
  ClassStudent,
  ClassSubject,
  ClassTeacher,
} from "@/api/principalClasses";

import ClassHeader from "@/components/class/header";
import ClassTeacherSection from "@/components/class/ClassTeacher";
import ClassStudentsTable from "@/components/class/ClassStudents";
import ClassSubjectsTable from "@/components/class/ClassSubjectsTable";

export default function ClassDetailsPage() {
  const params = useParams();
  const classId = Number(params.id);

  const { accessToken } = useAuth();

  const [teacher, setTeacher] = useState<ClassTeacher | null>(null);
  const [students, setStudents] = useState<ClassStudent[]>([]);
  const [subjects, setSubjects] = useState<ClassSubject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken || !classId) return;

    const load = async () => {
      setLoading(true);

      const [t, s, sub] = await Promise.all([
        getClassTeachers(accessToken, classId),
        getClassStudents(accessToken, classId),
        getClassSubjects(accessToken, classId),
      ]);

      if (t && t.length > 0) setTeacher(t[0]);
      if (s) setStudents(s);
      if (sub) setSubjects(sub);

      setLoading(false);
    };

    load();
  }, [accessToken, classId]);

  if (loading) {
    return <div className="p-6 text-black font-semibold">Loading…</div>;
  }

  return (
    <div className="h-screen overflow-y-auto">
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <ClassHeader classId={classId} />
        <ClassTeacherSection teacher={teacher} />
        <ClassStudentsTable students={students} classId={classId} />
        
        {/* Wrap ClassSubjectsTable with id for navigation */}
        <div id="chapter-progress-section">
          <ClassSubjectsTable subjects={subjects} token={accessToken!} />
        </div>
      </div>
    </div>
  );
}