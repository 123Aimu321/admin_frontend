// app/admin/reports/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { ReportCharts } from '@/components/admin/ReportCharts';
import { Download, Calendar, Users, BookOpen, TrendingUp } from 'lucide-react';
import { adminApi } from '@/api/admin';
import { useAuth } from '@/hooks/useAuth';

export default function ReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState('month');
  const [reportData, setReportData] = useState<any>(null);
  const [summaryStats, setSummaryStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    attendanceRate: 0,
    academicPerformance: 0,
  });

  useEffect(() => {
    if (user?.school_id) {
      loadReports();
    }
  }, [user, reportType, dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);

      // Load summary stats
      const [studentsData, teachersData] = await Promise.allSettled([
        adminApi.getStudents(user!.school_id),
        adminApi.getTeachers(user!.school_id),
      ]);

      const totalStudents = studentsData.status === 'fulfilled' ? studentsData.value?.length || 0 : 0;
      const totalTeachers = teachersData.status === 'fulfilled' ? teachersData.value?.length || 0 : 0;

      setSummaryStats({
        totalStudents,
        totalTeachers,
        attendanceRate: 85, // Mock data - replace with actual calculation
        academicPerformance: 78, // Mock data - replace with actual calculation
      });

      // Load report data based on type
      const data = await adminApi.generateReport(reportType, {
        date_range: dateRange,
        school_id: user.school_id,
      });
      
      setReportData(data || {});

    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format: string) => {
    alert(`Exporting ${reportType} report in ${format} format...`);
    // Implement actual export functionality
  };

  const reportTypes = [
    { value: 'attendance', label: 'Attendance Report', icon: Users },
    { value: 'academic', label: 'Academic Performance', icon: BookOpen },
    { value: 'financial', label: 'Financial Report', icon: TrendingUp },
    { value: 'student-progress', label: 'Student Progress', icon: TrendingUp },
    { value: 'teacher-performance', label: 'Teacher Performance', icon: Users },
  ];

  const dateRanges = [
    { value: 'week', label: 'Last Week' },
    { value: 'month', label: 'Last Month' },
    { value: 'quarter', label: 'Last Quarter' },
    { value: 'year', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const getReportTitle = () => {
    const type = reportTypes.find(t => t.value === reportType);
    return type?.label || 'Report';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Generate insights and reports for your school</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-3xl font-bold mt-2">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    summaryStats.totalStudents.toLocaleString()
                  )}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                <p className="text-3xl font-bold mt-2">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    summaryStats.totalTeachers.toLocaleString()
                  )}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                <p className="text-3xl font-bold mt-2">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    `${summaryStats.attendanceRate}%`
                  )}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Performance</p>
                <p className="text-3xl font-bold mt-2">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded"></div>
                  ) : (
                    `${summaryStats.academicPerformance}%`
                  )}
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <Select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                {dateRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={loadReports} className="w-full">
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>{getReportTitle()}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Generating report...</p>
              </div>
            </div>
          ) : reportData ? (
            <ReportCharts data={reportData} type={reportType} />
          ) : (
            <div className="h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500">No data available for this report</p>
                <p className="text-sm text-gray-400 mt-2">
                  Try selecting a different report type or date range
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Table (if applicable) */}
      {reportData?.table && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {Object.keys(reportData.table[0] || {}).map((key) => (
                      <th key={key} className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                        {key.replace(/_/g, ' ').toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.table.map((row: any, index: number) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      {Object.values(row).map((value: any, i: number) => (
                        <td key={i} className="py-3 px-4 text-sm">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}