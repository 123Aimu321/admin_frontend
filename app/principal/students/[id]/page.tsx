// app/principal/students/[id]/page.tsx
"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useAuth } from "../../../../context/AuthContext";

import {
  getStudentDetails,
  getStudentAcademic,
  getStudentAttendance,
  StudentDetail,
  GradeRecord,
  AttendanceRecord,
} from "../../../../api/principalStudents";

import {
  listLeaveRequests,
  LeaveRequest,
} from "../../../../api/principalLeave";

import {
  getStudentFees,
  StudentFee,
  FeeStatus,
} from "../../../../api/studentfees";

// Import teacher remark API
import {
  getTeacherRemarks,
  createTeacherRemark,
  updateTeacherRemark,
  deleteTeacherRemark,
  TeacherRemark as TeacherRemarkType,
  CreateTeacherRemarkPayload,
  UpdateTeacherRemarkPayload,
  formatRemarkDate,
  getSubjectColor,
} from "../../../../api/teacherRemark";

// Import teacher data
import { getAllTeachers, TeacherListOut } from "../../../../api/principalTeachers";

/* ================= TYPES ================= */

interface Props {
  params: Promise<{ id: string }>;
}

type Tab = "personal" | "academics" | "attendance" | "fees" | "remarks";
type ExamKey = "FA1" | "FA2" | "FA3" | "SA1";

type AcademicTableMap = Record<string, Partial<Record<ExamKey, number>>>;

interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
}

interface MonthlyAttendance {
  date: string;
  status: boolean;
}

interface MonthOption {
  value: string; // YYYY-MM format
  label: string; // Month name only
  monthIndex: number; // 1-12
  year: number;
}

/* ================= PAGE ================= */

export default function StudentProfilePage({ params }: Props) {
  const { id } = React.use(params);
  const studentId = Number(id);
  const { accessToken } = useAuth();

  const [details, setDetails] = useState<StudentDetail | null>(null);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [remarks, setRemarks] = useState<TeacherRemarkType[]>([]);
  const [teachers, setTeachers] = useState<TeacherListOut[]>([]);
  const [tab, setTab] = useState<Tab>("personal");
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [showAddRemarkModal, setShowAddRemarkModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // Get month options from attendance records
  const monthOptions = useMemo((): MonthOption[] => {
    const monthMap = new Map<string, { year: number; monthIndex: number }>();
    
    attendance.forEach(record => {
      const date = new Date(record.date);
      const year = date.getFullYear();
      const monthIndex = date.getMonth() + 1; // 1-12
      const value = `${year}-${monthIndex.toString().padStart(2, '0')}`;
      
      monthMap.set(value, { year, monthIndex });
    });
    
    // Convert to array and sort by year and month (most recent first)
    return Array.from(monthMap.entries())
      .map(([value, { year, monthIndex }]) => ({
        value,
        label: new Date(year, monthIndex - 1).toLocaleDateString('en-US', { month: 'long' }),
        monthIndex,
        year
      }))
      .sort((a, b) => {
        // Sort by year descending, then by month descending
        if (b.year !== a.year) return b.year - a.year;
        return b.monthIndex - a.monthIndex;
      });
  }, [attendance]);

  // Filter attendance by selected month and calculate monthly attendance data
  const monthlyAttendance = useMemo((): MonthlyAttendance[] => {
    if (!selectedMonth || !attendance.length) {
      return [];
    }

    const [selectedYear, selectedMonthIndex] = selectedMonth.split('-').map(Number);
    
    return attendance.filter(record => {
      const date = new Date(record.date);
      const recordYear = date.getFullYear();
      const recordMonthIndex = date.getMonth() + 1;
      
      return recordYear === selectedYear && recordMonthIndex === selectedMonthIndex;
    }).map(record => ({
      date: record.date,
      status: record.status
    }));
  }, [selectedMonth, attendance]);

  // Calculate monthly summary
  const monthlySummary = useMemo((): AttendanceSummary => {
    if (!selectedMonth || !monthlyAttendance.length) {
      return { total: 0, present: 0, absent: 0 };
    }

    const total = monthlyAttendance.length;
    const present = monthlyAttendance.filter(r => r.status).length;
    return { total, present, absent: total - present };
  }, [selectedMonth, monthlyAttendance]);

  // Get display name for selected month
  const getSelectedMonthName = useCallback((): string => {
    if (!selectedMonth) return "Select Month";
    
    const option = monthOptions.find(opt => opt.value === selectedMonth);
    if (!option) return "Select Month";
    
    return option.label;
  }, [selectedMonth, monthOptions]);

  // Get teacher name by ID
  const getTeacherName = useCallback((teacherId: number): string => {
    const teacher = teachers.find(t => t.user_id === teacherId);
    if (!teacher) return `Teacher #${teacherId}`;
    
    return `${teacher.first_name} ${teacher.last_name || ''}`.trim();
  }, [teachers]);

  // Handle attendance data update
  const handleAttendanceDataUpdate = useCallback((attendanceData: AttendanceRecord[]) => {
    setAttendance(attendanceData);
    // Set default selected month to current month or most recent month
    if (attendanceData.length > 0) {
      const monthMap = new Map<string, { year: number; monthIndex: number }>();
      
      attendanceData.forEach(record => {
        const date = new Date(record.date);
        const year = date.getFullYear();
        const monthIndex = date.getMonth() + 1;
        const value = `${year}-${monthIndex.toString().padStart(2, '0')}`;
        
        monthMap.set(value, { year, monthIndex });
      });
      
      // Get the most recent month
      const sortedMonths = Array.from(monthMap.entries())
        .map(([value, { year, monthIndex }]) => ({ value, year, monthIndex }))
        .sort((a, b) => {
          if (b.year !== a.year) return b.year - a.year;
          return b.monthIndex - a.monthIndex;
        });
      
      if (sortedMonths.length > 0 && !selectedMonth) {
        setSelectedMonth(sortedMonths[0].value); // Most recent month first
      }
    }
  }, [selectedMonth]);

  useEffect(() => {
    if (!accessToken || Number.isNaN(studentId)) return;

    (async () => {
      setLoading(true);

      const [d, g, a, l, f, r, t] = await Promise.allSettled([
        getStudentDetails(accessToken, studentId),
        getStudentAcademic(accessToken, studentId),
        getStudentAttendance(accessToken, studentId),
        listLeaveRequests(accessToken, { student_id: studentId }),
        getStudentFees(accessToken, { student_id: studentId }),
        getTeacherRemarks(accessToken, { student_id: studentId }),
        getAllTeachers(accessToken),
      ]);

      if (d.status === "fulfilled") setDetails(d.value);
      if (g.status === "fulfilled") setGrades(g.value ?? []);
      if (a.status === "fulfilled") {
        const attendanceData = a.value ?? [];
        handleAttendanceDataUpdate(attendanceData);
      }
      if (l.status === "fulfilled") setLeaveRequests(l.value?.items ?? []);
      if (f.status === "fulfilled") setFees(f.value ?? []);
      if (r.status === "fulfilled") setRemarks(r.value ?? []);
      if (t.status === "fulfilled") setTeachers(t.value ?? []);

      setLoading(false);
    })();
  }, [accessToken, studentId, handleAttendanceDataUpdate]);

  const handleAddRemark = async (remarkData: { subject: string; remark: string }) => {
    if (!accessToken) return;

    try {
      const payload: CreateTeacherRemarkPayload = {
        school_id: 1,
        student_id: studentId,
        teacher_id: 1, // Default teacher ID
        subject: remarkData.subject,
        remark: remarkData.remark,
      };

      const newRemark = await createTeacherRemark(accessToken, payload);
      setRemarks([newRemark, ...remarks]);
      setShowAddRemarkModal(false);
    } catch (error) {
      console.error("Failed to add remark:", error);
      alert("Failed to add remark. Please try again.");
    }
  };

  const handleUpdateRemark = async (remarkId: number, payload: UpdateTeacherRemarkPayload) => {
    if (!accessToken) return;

    try {
      const updatedRemark = await updateTeacherRemark(accessToken, remarkId, payload);
      setRemarks(remarks.map(r => r.remark_id === remarkId ? updatedRemark : r));
    } catch (error) {
      console.error("Failed to update remark:", error);
      alert("Failed to update remark. Please try again.");
    }
  };

  const handleDeleteRemark = async (remarkId: number) => {
    if (!accessToken) return;

    if (!confirm("Are you sure you want to delete this remark?")) return;

    try {
      await deleteTeacherRemark(accessToken, remarkId);
      setRemarks(remarks.filter(r => r.remark_id !== remarkId));
    } catch (error) {
      console.error("Failed to delete remark:", error);
      alert("Failed to delete remark. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!details) {
    return (
      <div className="p-10 text-center text-gray-800 font-semibold">
        No student found
      </div>
    );
  }

  const academicTable = buildAcademicTable(grades);

  return (
    <div className="h-screen overflow-y-auto bg-gray-100">
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        <Header details={details} />
        <Tabs tab={tab} setTab={setTab} />

        <div className="rounded-xl border bg-white p-6 shadow">
          {tab === "personal" && <Personal details={details} />}

          {tab === "academics" && (
            <Section title="Academic Performance">
              {Object.keys(academicTable).length === 0 ? (
                <Empty text="No academic records available" />
              ) : (
                <AcademicTableView table={academicTable} />
              )}
            </Section>
          )}

          {tab === "attendance" && (
            <AttendanceSection
              monthlySummary={monthlySummary}
              selectedMonth={selectedMonth}
              monthOptions={monthOptions}
              getSelectedMonthName={getSelectedMonthName}
              onMonthChange={setSelectedMonth}
              onViewReport={() => setShowReport(true)}
              leaveRequests={leaveRequests}
              monthlyAttendance={monthlyAttendance}
            />
          )}

          {tab === "fees" && (
            <Section title="Fees">
              {fees.length === 0 ? (
                <Empty text="No fee records found" />
              ) : (
                <>
                  <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FeeStatCard
                        label="Total Fees"
                        value={`₹${fees.reduce(
                          (s, f) => s + Number(f.amount),
                          0
                        ).toLocaleString()}`}
                      />
                      <FeeStatCard
                        label="Paid"
                        value={`₹${fees
                          .filter(f => f.status === FeeStatus.paid)
                          .reduce((s, f) => s + Number(f.amount), 0)
                          .toLocaleString()}`}
                      />
                      <FeeStatCard
                        label="Due"
                        value={`₹${fees
                          .filter(f => f.status !== FeeStatus.paid)
                          .reduce((s, f) => s + Number(f.amount), 0)
                          .toLocaleString()}`}
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-gray-800">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="p-3 text-left font-semibold">Type</th>
                          <th className="p-3 text-left font-semibold">Amount</th>
                          <th className="p-3 text-left font-semibold">Due Date</th>
                          <th className="p-3 text-left font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fees.map(fee => (
                          <tr key={fee.fee_id} className="border-t hover:bg-gray-50">
                            <td className="p-3 font-medium">{fee.fee_type}</td>
                            <td className="p-3">₹{Number(fee.amount).toLocaleString()}</td>
                            <td className="p-3">{fee.due_date}</td>
                            <td className="p-3">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                fee.status === FeeStatus.paid 
                                  ? 'bg-green-100 text-green-800'
                                  : fee.status === FeeStatus.pending
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {fee.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </Section>
          )}

          {tab === "remarks" && (
            <Section title="Teacher Remarks">
              <RemarksSection
                remarks={remarks}
                getTeacherName={getTeacherName}
                onAddRemark={() => setShowAddRemarkModal(true)}
                onUpdateRemark={handleUpdateRemark}
                onDeleteRemark={handleDeleteRemark}
              />
            </Section>
          )}
        </div>
      </div>

      {showReport && (
        <AttendanceModal
          records={attendance}
          selectedMonth={selectedMonth}
          monthOptions={monthOptions}
          getSelectedMonthName={getSelectedMonthName}
          onClose={() => setShowReport(false)}
        />
      )}

      {showAddRemarkModal && (
        <AddRemarkModal
          onClose={() => setShowAddRemarkModal(false)}
          onSubmit={handleAddRemark}
        />
      )}
    </div>
  );
}

/* ================= ATTENDANCE SECTION ================= */

function AttendanceSection({
  monthlySummary,
  selectedMonth,
  monthOptions,
  getSelectedMonthName,
  onMonthChange,
  onViewReport,
  leaveRequests,
  monthlyAttendance,
}: {
  monthlySummary: AttendanceSummary;
  selectedMonth: string;
  monthOptions: MonthOption[];
  getSelectedMonthName: () => string;
  onMonthChange: (monthYear: string) => void;
  onViewReport: () => void;
  leaveRequests: LeaveRequest[];
  monthlyAttendance: MonthlyAttendance[];
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-gray-900">Attendance</h2>
      
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-3">
            <label htmlFor="attendance-month" className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Select Month:
            </label>
            <select
              id="attendance-month"
              aria-label="Select attendance month"
              title="Select attendance month"
              className="rounded-md border border-gray-300 px-4 py-2 text-gray-900 bg-white min-w-[180px]"
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
            >
              <option value="">Select Month</option>
              {monthOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <button
            onClick={onViewReport}
            className="rounded-md bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700 whitespace-nowrap"
          >
            View Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AttendanceStatCard 
            label="Days Worked" 
            value={monthlySummary.total.toString()} 
            icon={
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
          <AttendanceStatCard 
            label="Present" 
            value={monthlySummary.present.toString()} 
            icon={
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <AttendanceStatCard 
            label="Absent" 
            value={monthlySummary.absent.toString()} 
            icon={
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        </div>

        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leave Requests</h3>
          
          {leaveRequests.length === 0 ? (
            <div className="text-center py-8 border border-gray-200 rounded-lg">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">No leave requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full text-gray-800">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="p-4 text-left font-semibold text-gray-700">SL</th>
                    <th className="p-4 text-left font-semibold text-gray-700">From Date</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Till Date</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Reason</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Status</th>
                    <th className="p-4 text-left font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRequests.map((r, i) => {
                    // Find matching attendance for this leave period
                    const matchingAttendance = monthlyAttendance.filter(att => {
                      if (!r.from_date || !r.till_date) return false;
                      const leaveFrom = new Date(r.from_date);
                      const leaveTill = new Date(r.till_date);
                      const attDate = new Date(att.date);
                      return attDate >= leaveFrom && attDate <= leaveTill && !att.status;
                    });

                    return (
                      <tr key={r.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="p-4 font-medium">{i + 1}</td>
                        <td className="p-4">{r.from_date || "-"}</td>
                        <td className="p-4">{r.till_date || "-"}</td>
                        <td className="p-4">
                          <div className="max-w-xs">
                            <p className="truncate">{r.reason || "-"}</p>
                            {r.description && (
                              <p className="text-xs text-gray-500 mt-1 truncate" title={r.description}>
                                {r.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            r.status === 'approved' 
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : r.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                              : 'bg-red-100 text-red-800 border border-red-200'
                          }`}>
                            {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                          </span>
                        </td>
                        <td className="p-4">
                          {matchingAttendance.length > 0 ? (
                            <button
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              onClick={() => {
                                // You can implement a modal or dropdown to show matching attendance
                                alert(`${matchingAttendance.length} matching absent days found for this leave`);
                              }}
                            >
                              View ({matchingAttendance.length})
                            </button>
                          ) : (
                            <span className="text-gray-400 text-sm">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedMonth && monthlySummary.total > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-800">
                Showing attendance for <strong>{getSelectedMonthName()}</strong>. 
                {" "}Attendance Rate: <strong>{((monthlySummary.present / monthlySummary.total) * 100).toFixed(1)}%</strong>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ================= ATTENDANCE STAT CARD ================= */
function AttendanceStatCard({ 
  label, 
  value, 
  icon 
}: { 
  label: string; 
  value: string; 
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col items-center">
        <div className="mb-3 p-2 bg-gray-50 rounded-lg">
          {icon}
        </div>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="mt-2 font-semibold text-gray-700">{label}</p>
      </div>
    </div>
  );
}

/* ================= REMARKS SECTION ================= */

function RemarksSection({
  remarks,
  getTeacherName,
  onAddRemark,
  onUpdateRemark,
  onDeleteRemark,
}: {
  remarks: TeacherRemarkType[];
  getTeacherName: (teacherId: number) => string;
  onAddRemark: () => void;
  onUpdateRemark: (remarkId: number, payload: UpdateTeacherRemarkPayload) => Promise<void>;
  onDeleteRemark: (remarkId: number) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const handleEdit = (remark: TeacherRemarkType) => {
    setEditingId(remark.remark_id);
    setEditText(remark.remark);
  };

  const handleSave = async (remarkId: number) => {
    if (!editText.trim()) return;
    await onUpdateRemark(remarkId, { remark: editText });
    setEditingId(null);
    setEditText("");
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditText("");
  };

  if (remarks.length === 0) {
    return (
      <div className="space-y-6">
        <Empty text="No remarks added yet" />
        <button
          onClick={onAddRemark}
          className="rounded-md bg-blue-600 px-5 py-2 font-semibold text-white hover:bg-blue-700"
        >
          Add First Remark
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          All Remarks ({remarks.length})
        </h3>
        <button
          onClick={onAddRemark}
          className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
        >
          + Add Remark
        </button>
      </div>

      <div className="space-y-4">
        {remarks.map((remark) => (
          <div
            key={remark.remark_id}
            className="border rounded-lg p-4 hover:bg-gray-50"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSubjectColor(remark.subject)}`}>
                  {remark.subject || "General"}
                </span>
                <span className="text-sm text-gray-500">
                  {formatRemarkDate(remark.created_at)}
                </span>
                <span className="text-sm text-blue-600 font-medium">
                  By: {getTeacherName(remark.teacher_id)}
                </span>
              </div>
              <div className="flex gap-2">
                {editingId === remark.remark_id ? (
                  <>
                    <button
                      onClick={() => handleSave(remark.remark_id)}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancel}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(remark)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDeleteRemark(remark.remark_id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            {editingId === remark.remark_id ? (
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full border rounded p-2 mt-2"
                rows={3}
                autoFocus
                placeholder="Edit remark text..."
              />
            ) : (
              <p className="text-gray-800 mt-2 whitespace-pre-wrap">{remark.remark}</p>
            )}

            <div className="mt-3 text-xs text-gray-500">
              Last updated: {formatRemarkDate(remark.updated_at)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= ADD REMARK MODAL ================= */

function AddRemarkModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: { subject: string; remark: string }) => Promise<void>;
}) {
  const [subject, setSubject] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!subject.trim() || !remark.trim()) {
      alert("Please fill in both subject and remark");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({ subject, remark });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          Add New Remark
        </h2>

        <div className="space-y-4">
          <div>
            <label htmlFor="subject-input" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              id="subject-input"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border rounded p-2"
              placeholder="e.g., Mathematics, English, Science"
              title="Enter subject name"
            />
          </div>

          <div>
            <label htmlFor="remark-textarea" className="block text-sm font-medium text-gray-700 mb-1">
              Remark
            </label>
            <textarea
              id="remark-textarea"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="w-full border rounded p-2"
              rows={4}
              placeholder="Enter your remark about the student..."
              title="Enter remark text"
            />
          </div>
          
          <div className="text-sm text-gray-500">
            <p>Teacher: You (will be saved under your name)</p>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-md px-4 py-2 font-semibold text-gray-700 hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Remark"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= HELPERS ================= */

function buildAcademicTable(grades: GradeRecord[]): AcademicTableMap {
  const table: AcademicTableMap = {};
  for (const g of grades) {
    if (!["FA1", "FA2", "FA3", "SA1"].includes(g.test_name)) continue;
    table[g.subject_name] ??= {};
    table[g.subject_name][g.test_name as ExamKey] = g.obtained_marks;
  }
  return table;
}

/* ================= FEE STAT CARD ================= */
function FeeStatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-2 font-semibold text-gray-700">{label}</p>
    </div>
  );
}

/* ================= MODAL ================= */

function AttendanceModal({
  records,
  selectedMonth,
  monthOptions,
  getSelectedMonthName,
  onClose,
}: {
  records: AttendanceRecord[];
  selectedMonth: string;
  monthOptions: MonthOption[];
  getSelectedMonthName: () => string;
  onClose: () => void;
}) {
  const filteredRecords = selectedMonth 
    ? records.filter(record => {
        const date = new Date(record.date);
        const [selectedYear, selectedMonthIndex] = selectedMonth.split('-').map(Number);
        const recordYear = date.getFullYear();
        const recordMonthIndex = date.getMonth() + 1;
        
        return recordYear === selectedYear && recordMonthIndex === selectedMonthIndex;
      })
    : records;

  const totalRecords = filteredRecords.length;
  const presentCount = filteredRecords.filter(r => r.status).length;
  const absentCount = totalRecords - presentCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          Attendance Report {selectedMonth && `- ${getSelectedMonthName()}`}
        </h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{totalRecords}</div>
            <div className="text-sm text-blue-600">Total Days</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{presentCount}</div>
            <div className="text-sm text-green-600">Present</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-700">{absentCount}</div>
            <div className="text-sm text-red-600">Absent</div>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto text-gray-800 border rounded-lg">
          {filteredRecords.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No attendance records found</div>
          ) : (
            filteredRecords.map((r, i) => (
              <div key={i} className="flex justify-between border-b py-2 px-4 hover:bg-gray-50">
                <span>{r.date}</span>
                <span className={`font-medium ${
                  r.status ? 'text-green-600' : 'text-red-600'
                }`}>
                  {r.status ? "Present" : "Absent"}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= SHARED UI ================= */

function AcademicTableView({ table }: { table: AcademicTableMap }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-gray-800">
        <thead className="bg-slate-900 text-white">
          <tr>
            <th className="p-3 text-left font-semibold">Subject</th>
            <th className="p-3 text-left font-semibold">FA1</th>
            <th className="p-3 text-left font-semibold">FA2</th>
            <th className="p-3 text-left font-semibold">FA3</th>
            <th className="p-3 text-left font-semibold">SA1</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(table).map(([s, e]) => (
            <tr key={s} className="border-t hover:bg-gray-50">
              <td className="p-3 font-semibold">{s}</td>
              <td className="p-3">{e.FA1?.toFixed(2) ?? "-"}</td>
              <td className="p-3">{e.FA2?.toFixed(2) ?? "-"}</td>
              <td className="p-3">{e.FA3?.toFixed(2) ?? "-"}</td>
              <td className="p-3">{e.SA1?.toFixed(2) ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Header({ details }: { details: StudentDetail }) {
  return (
    <div className="flex items-center gap-6 rounded-xl border bg-blue-50 p-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl font-bold text-blue-600">
        {details.first_name?.charAt(0)}
      </div>
      <div className="text-gray-900">
        <h1 className="text-xl font-bold">
          {details.first_name} {details.last_name}
        </h1>
        <p className="text-gray-700">{details.email}</p>
      </div>
    </div>
  );
}

function Tabs({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  return (
    <div className="flex gap-2 rounded-lg border bg-white p-2">
      {(["personal", "academics", "attendance", "fees", "remarks"] as Tab[]).map(
        t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-5 py-2 font-semibold ${
              tab === t
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
            title={`View ${t} information`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        )
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {children}
    </div>
  );
}

function Personal({ details }: { details: StudentDetail }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 text-gray-800">
      <Info label="Father Name" value={details.father_name} />
      <Info label="Mother Name" value={details.mother_name} />
      <Info label="Guardian Name" value={details.guardian_name} />
      <Info label="Phone" value={details.phone} />
      <Info label="Address" value={details.address} full />
    </div>
  );
}

function Info({
  label,
  value,
  full = false,
}: {
  label: string;
  value?: string | null;
  full?: boolean;
}) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-semibold text-gray-900">{value || "-"}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="py-16 text-center text-gray-600 font-medium">
      {text}
    </div>
  );
}