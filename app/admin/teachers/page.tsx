// app/admin/teachers/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { TeacherTable } from '@/components/admin/TeacherTable';
import { TeacherDetailsModal } from '@/components/modals/TeacherDetailsModal';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { adminApi, Teacher } from '@/api/admin';
import { useAuth } from '@/hooks/useAuth';

export default function TeachersPage() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    if (user?.school_id) {
      loadTeachers();
    }
  }, [user, page]);

  useEffect(() => {
    filterTeachers();
  }, [teachers, searchTerm, statusFilter]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getTeachers(user!.school_id, {
        page,
        limit: itemsPerPage,
      });
      setTeachers(response || []);
      
      const total = 50; // Replace with actual total from API
      setTotalPages(Math.ceil(total / itemsPerPage));
    } catch (error) {
      console.error('Failed to load teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTeachers = () => {
    let filtered = [...teachers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(teacher =>
        teacher.first_name.toLowerCase().includes(term) ||
        teacher.last_name.toLowerCase().includes(term) ||
        teacher.email.toLowerCase().includes(term) ||
        teacher.subject_specialization?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(teacher => 
        statusFilter === 'active' ? teacher.is_active : !teacher.is_active
      );
    }

    setFilteredTeachers(filtered);
  };

  const handleViewDetails = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailsModal(true);
  };

  const handleDeleteTeacher = async (teacherId: number) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    try {
      // Note: This endpoint might not exist in your API yet
      // You'll need to add it to adminApi
      await adminApi.deleteTeacher(user!.school_id, teacherId);
      setTeachers(teachers.filter(t => t.user_id !== teacherId));
    } catch (error) {
      console.error('Failed to delete teacher:', error);
      alert('Failed to delete teacher. Please try again.');
    }
  };

  const handleExport = () => {
    // Implement export functionality
    alert('Export functionality coming soon!');
  };

  const handleRefresh = () => {
    loadTeachers();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teachers Management</h1>
          <p className="text-gray-600 mt-2">Manage all teachers in your school</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleRefresh}>
            Refresh
          </Button>
          <a href="/admin/teachers/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Teacher
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
                placeholder="Search teachers..."
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

      {/* Teachers Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Teachers List</CardTitle>
            <p className="text-sm text-gray-600">
              Showing {filteredTeachers.length} of {teachers.length} teachers
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <TeacherTable
            teachers={filteredTeachers}
            loading={loading}
            onViewDetails={handleViewDetails}
            onDelete={handleDeleteTeacher}
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
      {selectedTeacher && (
        <TeacherDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedTeacher(null);
          }}
          teacher={selectedTeacher}
        />
      )}
    </div>
  );
}