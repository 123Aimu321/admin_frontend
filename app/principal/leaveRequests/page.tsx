"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import {
  listLeaveRequests,
  updateLeaveStatus,
  LeaveRequest,
} from "../../../api/principalLeave";
import LeaveDetailsModal from "../../../components/modals/Student_leave";

import { Loader2, Check, X, FileText, Clock, Users, GraduationCap, ChevronRight, ChevronLeft } from "lucide-react";

export default function PrincipalLeaveRequestsPage() {
  const { accessToken, user } = useAuth();

  const [pending, setPending] = useState<LeaveRequest[]>([]);
  const [history, setHistory] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
const [detailsLoading, setDetailsLoading] = useState(false);

  const [viewMode, setViewMode] = useState<"side" | "pending" | "history">(
    typeof window !== "undefined" && window.innerWidth < 1024 ? "pending" : "side"
  );

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && viewMode === "side") {
        setViewMode("pending");
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [viewMode]);

  const fetchRequests = async () => {
    if (!accessToken || !user?.school_id) return;

    setLoading(true);

    // Always fetch student requests only
    const res = await listLeaveRequests(accessToken, {
      school_id: user.school_id,
      limit: 200,
      sort_desc: true,
  
    });

    if (res) {
      setPending(res.items.filter((r) => r.status === "pending"));
      setHistory(res.items.filter((r) => r.status !== "pending"));
    }

    setLoading(false);
  };

  // removed activeTab from deps since fetchRequests is locked to students
  useEffect(() => {
    fetchRequests();
  }, [accessToken, user]);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    const ok = confirm(`Are you sure you want to ${action} this student leave request?`);
    if (!ok) return;

    const res = await updateLeaveStatus(accessToken!, id, { action });
    if (res) fetchRequests();
  };
const openDetails = (req: LeaveRequest) => {
  setSelectedRequest(req);
};

const closeDetails = () => setSelectedRequest(null);

  const getStatusBadge = (status: string) => {
    const config = {
      approved: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
      rejected: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
      pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" }
    };
    
    const style = config[status as keyof typeof config] || { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style.bg} ${style.text} ${style.border} border`}>
        {status.toUpperCase()}
      </span>
    );
  };
const EmptyState = ({ type }: { type: "pending" | "history" }) => (
  <div className="text-center py-12">
    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
      {type === "pending" ? (
        <Clock className="h-8 w-8 text-gray-400" />
      ) : (
        <FileText className="h-8 w-8 text-gray-400" />
      )}
    </div>

    <h3 className="text-lg font-medium text-gray-900 mb-2">
      No {type} student leave requests
    </h3>

    <p className="text-gray-500 max-w-md mx-auto">
      {type === "pending"
        ? "All requests have been processed. Check back later."
        : "No processed leave history yet."}
    </p>
  </div>
);

  const PendingTable = () => (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
          <tr>
<th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
  Student
</th>

            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Leave Period
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Duration
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Attachment
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {pending.map((req) => (
            <tr
  key={req.id}
  onClick={() => openDetails(req)}
  className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
  <GraduationCap className="h-5 w-5 text-blue-600" />
</div>

<div className="ml-4">
  <div className="text-sm font-medium text-gray-900">
    {req.student_name || `ID: ${req.student_id}`}
  </div>
  <div className="text-sm text-gray-500">
    {req.class_name || "—"}
  </div>
</div>

                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{req.from_date}</div>
                <div className="flex items-center text-xs text-gray-500">
                  <ChevronRight className="h-3 w-3 mx-1" />
                  {req.till_date}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
  {Math.max(
    1,
    Math.ceil(
      (new Date(req.till_date).getTime() -
        new Date(req.from_date).getTime()) /
        (1000 * 60 * 60 * 24)
    ) + 1
  )}{" "}
  days
</span>


              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {req.attachment_url ? (
                  <a
                    href={req.attachment_url}
                    target="_blank"
                    className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    View
                  </a>
                ) : (
                  <span className="text-sm text-gray-400">—</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
<button
  onClick={(e) => {
    e.stopPropagation();
    handleAction(req.id, "approve");
  }}
  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg"
>

                    <Check className="h-4 w-4" />
                    Approve
                  </button>
<button
  onClick={(e) => {
    e.stopPropagation();
    handleAction(req.id, "reject");
  }}
  className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg"
>

                    <X className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

const HistoryTable = () => (
  <div className="overflow-x-auto rounded-lg border border-gray-200">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gradient-to-r from-purple-600 to-purple-700">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
            Student
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
            Leave Period
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
            Reason
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase tracking-wider">
            Processed On
          </th>
        </tr>
      </thead>

      <tbody className="bg-white divide-y divide-gray-100">
        {history.map((req) => (
<tr
  key={req.id}
  onClick={() => openDetails(req)}
  className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
>

            {/* Student */}
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">
                    {req.student_name || `ID: ${req.student_id}`}
                  </div>
                </div>
              </div>
            </td>

            {/* Leave Period */}
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">{req.from_date}</div>
              <div className="flex items-center text-xs text-gray-500">
                <ChevronRight className="h-3 w-3 mx-1" />
                {req.till_date}
              </div>
            </td>

            {/* Reason */}
            <td className="px-6 py-4">
              <div
                className="text-sm text-gray-600 max-w-xs truncate"
                title={req.reason ?? ""}
              >
                {req.reason || "—"}
              </div>
            </td>

            {/* Status */}
            <td className="px-6 py-4 whitespace-nowrap">
              {req.status ? getStatusBadge(req.status) : "—"}
            </td>

            {/* Processed Date */}
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  {(() => {
    const dateStr = req.updated_at ?? req.created_at;
    return dateStr ? new Date(dateStr).toLocaleDateString() : "—";
  })()}
</td>

          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Leave Request Management
              </h1>
              <p className="text-gray-600 mt-2">
               Review and manage student leave requests
              </p>
            </div>
            
            {/* Request Type Toggle */}
            
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Total Requests</p>
                  <p className="text-2xl font-bold text-blue-900 mt-1">
                    {pending.length + history.length}
                  </p>
                </div>
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700">Pending Review</p>
                  <p className="text-2xl font-bold text-amber-900 mt-1">{pending.length}</p>
                </div>
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700">Processed</p>
                  <p className="text-2xl font-bold text-emerald-900 mt-1">{history.length}</p>
                </div>
                <div className="h-10 w-10 bg-white rounded-lg flex items-center justify-center">
                  <Check className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">View Mode:</h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("pending")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  viewMode === "pending" ? "bg-white shadow text-blue-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Pending Only
              </button>
              <button
                onClick={() => setViewMode("history")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  viewMode === "history" ? "bg-white shadow text-purple-600" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                History Only
              </button>

            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Showing student requests</span>
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl shadow-lg">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Loading student leave requests...</p>
          </div>
        ) : (
          <>
            {viewMode === "side" ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <Clock className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-white">Pending Requests</h2>
                          <p className="text-blue-100 text-sm">Awaiting your approval</p>
                        </div>
                      </div>
                      <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {pending.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    {pending.length === 0 ? (
                      <EmptyState type="pending" />
                    ) : (
                      <PendingTable />
                    )}
                  </div>
                </div>

                {/* History Section */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-white">Request History</h2>
                          <p className="text-purple-100 text-sm">Previously processed</p>
                        </div>
                      </div>
                      <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                        {history.length}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    {history.length === 0 ? (
                      <EmptyState type="history" />
                    ) : (
                      <HistoryTable />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className={`px-6 py-4 ${
                  viewMode === "pending" 
                    ? "bg-gradient-to-r from-blue-600 to-blue-700" 
                    : "bg-gradient-to-r from-purple-600 to-purple-700"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                        {viewMode === "pending" ? (
                          <Clock className="h-5 w-5 text-white" />
                        ) : (
                          <FileText className="h-5 w-5 text-white" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-white">
                          {viewMode === "pending" ? "Pending Requests" : "Request History"}
                        </h2>
                        <p className="text-white/80 text-sm">
                          {viewMode === "pending" ? "Awaiting your approval" : "Previously processed"}
                        </p>
                      </div>
                    </div>
                    <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {viewMode === "pending" ? pending.length : history.length}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  {viewMode === "pending" ? (
                    pending.length === 0 ? (
                      <EmptyState type="pending" />
                    ) : (
                      <PendingTable />
                    )
                  ) : history.length === 0 ? (
                    <EmptyState type="history" />
                  ) : (
                    <HistoryTable />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    {selectedRequest && (
      <LeaveDetailsModal
        request={selectedRequest}
        onClose={closeDetails}
      />
    )}
  </div>
  );
}
