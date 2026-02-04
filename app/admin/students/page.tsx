// app/admin/students/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { StudentTable } from '@/components/admin/StudentTable';
import { StudentDetailsModal } from '@/components/modals/StudentDetailsModal';
import { StudentLeaveModal } from '@/components/modals/StudentLeaveModal';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { adminApi, Student } from '@/api/admin';
import { useAuth } from '@/hooks/useAuth';

export default function StudentsPage() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    if (user?.school_id) {
      loadStudents();
    }
  }, [user, page]);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, statusFilter]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getStudents(user!.school_id, {
        page,
        limit: itemsPerPage,
      });
      setStudents(response || []);
      
      // Calculate total pages (this would normally come from API)
      const total = 100; // Replace with actual total from API
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(student =>
        student.first_name.toLowerCase().includes(term) ||
        student.last_name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => 
        statusFilter === 'active' ? student.is_active : !student.is_active
      );
    }

    setFilteredStudents(filtered);
  };

  const handleViewDetails = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const handleManageLeave = (student: Student) => {
    setSelectedStudent(student);
    setShowLeaveModal(true);
  };

  const handleDeleteStudent = async (studentId: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;

    try {
      await adminApi.deleteStudent(user!.school_id, studentId);
      setStudents(students.filter(s => s.user_id !== studentId));
    } catch (error) {
      console.error('Failed to delete student:', error);
      alert('Failed to delete student. Please try again.');
    }
  };

  const handleExport = () => {
    // Implement export functionality
    alert('Export functionality coming soon!');
  };

  const handleRefresh = () => {
    loadStudents();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
          <p className="text-gray-600 mt-2">Manage all students in your school</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleRefresh}>
            Refresh
          </Button>
          <a href="/admin/students/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </a>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </Select>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Students List</CardTitle>
            <p className="text-sm text-gray-600">
              Showing {filteredStudents.length} of {students.length} students
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <StudentTable
            students={filteredStudents}
            loading={loading}
            onViewDetails={handleViewDetails}
            onManageLeave={handleManageLeave}
            onDelete={handleDeleteStudent}
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-6 border-t">
              <div>
                <p className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {selectedStudent && (
        <>
          <StudentDetailsModal
            isOpen={showDetailsModal}
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedStudent(null);
            }}
            student={selectedStudent}
          />
          <StudentLeaveModal
            isOpen={showLeaveModal}
            onClose={() => {
              setShowLeaveModal(false);
              setSelectedStudent(null);
            }}
            studentId={selectedStudent.user_id}
          />
        </>
      )}
    </div>
  );
}