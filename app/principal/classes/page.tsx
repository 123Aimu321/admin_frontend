//app/principal/classes/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { getClasses, ClassItem } from "@/api/principalClasses";
import Link from "next/link";
import { 
  Loader2, 
  ExternalLink, 
  Users, 
  BookOpen, 
  Hash, 
  FileText,
  Calendar,
  Search,
  Filter
} from "lucide-react";

export default function ClassesPage() {
  const { accessToken } = useAuth();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMedium, setFilterMedium] = useState("all");

  useEffect(() => {
    if (!accessToken) return;

    const fetchClasses = async () => {
      setLoading(true);
      const res = await getClasses(accessToken);
      if (res) setClasses(res);
      setLoading(false);
    };

    fetchClasses();
  }, [accessToken]);

  // Get unique mediums for filter
  const mediums = Array.from(new Set(classes.map(cls => cls.medium).filter((m): m is string => m !== null && m !== undefined)));

  // Filter classes based on search and medium
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (cls.section && cls.section.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMedium = filterMedium === "all" || cls.medium === filterMedium;
    return matchesSearch && matchesMedium;
  });

  // Stats
  const totalClasses = classes.length;
  const uniqueMediums = mediums.length;

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-blue-50 overflow-y-auto">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                Classes Management
              </h1>
              <p className="text-gray-600 mt-2">Manage and view all classes in your institution</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="font-semibold text-gray-700">{totalClasses}</span>
                <span className="text-gray-500">Classes</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
                <FileText className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-gray-700">{uniqueMediums}</span>
                <span className="text-gray-500">Mediums</span>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search classes by name or section..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3">
                <div className="relative min-w-[180px]">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    value={filterMedium}
                    onChange={(e) => setFilterMedium(e.target.value)}
                  >
                    <option value="all">All Mediums</option>
                    {mediums.map(medium => (
                      <option key={medium} value={medium}>{medium}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-600">Loading classes...</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hash className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Class List</h2>
                    <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full">
                      {filteredClasses.length} {filteredClasses.length === 1 ? 'class' : 'classes'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Showing {filteredClasses.length} of {totalClasses} classes
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Hash className="h-4 w-4" />
                          No.
                        </div>
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Class 
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Medium
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Section
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredClasses.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center">
                            <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {searchTerm || filterMedium !== "all" ? "No matching classes found" : "No classes available"}
                            </h3>
                            <p className="text-gray-500">
                              {searchTerm || filterMedium !== "all" 
                                ? "Try adjusting your search or filter" 
                                : "Classes will appear here once added"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredClasses.map((cls, index) => (
                        <tr 
                          key={cls.class_id} 
                          className="hover:bg-blue-50 transition-colors duration-150 group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-700 font-semibold rounded-lg">
                                {index + 1}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                                {cls.name}
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                ID: {cls.class_id}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${cls.medium ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {cls.medium || "Not specified"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {cls.section ? (
                                <>
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  <span className="text-gray-700">{cls.section}</span>
                                </>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              href={`/principal/classes/${cls.class_id}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md"
                            >
                              <span>View Details</span>
                              <ExternalLink className="h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer */}
              {filteredClasses.length > 0 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Last updated: {new Date().toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">{filteredClasses.length}</span> classes displayed
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Additional Information */}
        {!loading && filteredClasses.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Quick Stats</h3>
              </div>
              <p className="text-sm text-gray-600">
                You have {totalClasses} total classes across {uniqueMediums} different mediums.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Filter className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Filter Active</h3>
              </div>
              <p className="text-sm text-gray-600">
                {filterMedium === "all" ? "Showing all mediums" : `Filtered by: ${filterMedium}`}
                {searchTerm && `, searching for: "${searchTerm}"`}
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-800">Need Help?</h3>
              </div>
              <p className="text-sm text-gray-600">
                Click on any class's "View Details" to see students, attendance, and more detailed information.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}