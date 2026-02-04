// app/admin/classrooms/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ClassroomTable } from '@/components/admin/ClassroomTable';
import { ClassroomDetailsModal } from '@/components/modals/ClassroomDetailsModal';
import { Plus, Search, Filter } from 'lucide-react';
import { adminApi, Classroom } from '@/api/admin';
import { useAuth } from '@/hooks/useAuth';

export default function ClassroomsPage() {
  const { user } = useAuth();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [filteredClassrooms, setFilteredClassrooms] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [academicYears, setAcademicYears] = useState<string[]>([]);

  useEffect(() => {
    if (user?.school_id) {
      loadClassrooms();
    }
  }, [user]);

  useEffect(() => {
    filterClassrooms();
  }, [classrooms, searchTerm, statusFilter, yearFilter]);

  const loadClassrooms = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getClassrooms(user!.school_id);
      setClassrooms(response || []);
      
      // Extract unique academic years
      const years = [...new Set(response?.map(c => c.academic_year).filter(Boolean))] as string[];
      setAcademicYears(years);
    } catch (error) {
      console.error('Failed to load classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClassrooms = () => {
    let filtered = [...classrooms];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(classroom =>
        classroom.name.toLowerCase().includes(term) ||
        classroom.section?.toLowerCase().includes(term) ||
        classroom.room_number?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(classroom => 
        statusFilter === 'active' ? classroom.is_active : !classroom.is_active
      );
    }

    if (yearFilter !== 'all') {
      filtered = filtered.filter(classroom => classroom.academic_year === yearFilter);
    }

    setFilteredClassrooms(filtered);
  };

  const handleViewDetails = (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setShowDetailsModal(true);
  };

  const handleDeleteClassroom = async (classId: number) => {
    if (!confirm('Are you sure you want to delete this classroom?')) return;

    try {
      await adminApi.deleteClassroom(user!.school_id, classId);
      setClassrooms(classrooms.filter(c => c.class_id !== classId));
    } catch (error) {
      console.error('Failed to delete classroom:', error);
      alert('Failed to delete classroom. Please try again.');
    }
  };

  const handleRefresh = () => {
    loadClassrooms();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classrooms Management</h1>
          <p className="text-gray-600 mt-2">Manage all classrooms in your school</p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleRefresh}>
            Refresh
          </Button>
          <a href="/admin/classrooms/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Classroom
            </Button>
          </a>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search classrooms..."
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
            <div>
              <Select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="all">All Years</option>
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </Select>
            </div>
            <div>
              <Button variant="outline" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Classrooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredClassrooms.length > 0 ? (
          filteredClassrooms.map((classroom) => (
            <Card key={classroom.class_id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {classroom.name} {classroom.section && `- ${classroom.section}`}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {classroom.medium} • {classroom.academic_year}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${classroom.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {classroom.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Room:</span>
                    <span className="text-sm font-medium">{classroom.room_number || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Capacity:</span>
                    <span className="text-sm font-medium">{classroom.capacity || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewDetails(classroom)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDeleteClassroom(classroom.class_id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 mb-4">
              <div className="inline-block p-3 bg-gray-100 rounded-full">
                <Plus className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No classrooms found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || statusFilter !== 'all' || yearFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating your first classroom'}
            </p>
            <a href="/admin/classrooms/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Classroom
              </Button>
            </a>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedClassroom && (
        <ClassroomDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedClassroom(null);
          }}
          classroom={selectedClassroom}
        />
      )}
    </div>
  );
}