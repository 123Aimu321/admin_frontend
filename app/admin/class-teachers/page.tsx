'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import ClassTeachersTable from '@/components/tables/ClassTeachersTable';
import AssignTeacherModal from '@/components/modals/AssignTeacherModal';
import { classTeachersApi } from '@/api/classTeachers';
import { getClasses, Class as ApiClass } from '@/api/classes';
import { ClassTeacher } from '@/types/subject';

export default function ClassTeachersPage() {
  const { user } = useAuth();
  const schoolId = user?.school_id || 0;
  
  const [classTeachers, setClassTeachers] = useState<ClassTeacher[]>([]);
  const [classes, setClasses] = useState<ApiClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | ''>('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch classes on component mount
  useEffect(() => {
    if (schoolId) {
      fetchClasses();
    }
  }, [schoolId]);
  
  // Fetch class teachers when a class is selected
  useEffect(() => {
    if (selectedClassId && schoolId) {
      fetchClassTeachers();
    } else {
      setClassTeachers([]);
    }
  }, [selectedClassId, schoolId]);
  
  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await getClasses(schoolId);
      setClasses(response || []);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch classes');
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchClassTeachers = async () => {
    if (!selectedClassId) return;
    
    try {
      setRefreshing(true);
      const response = await classTeachersApi.getClassTeachers(schoolId, selectedClassId as number);
      setClassTeachers(response || []);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          'Failed to fetch class teachers. The endpoint might not be implemented yet.';
      setError(errorMessage);
      console.error('Error fetching class teachers:', err);
      setClassTeachers([]);
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleAssignTeacher = async (data: { class_id: number; teacher_id: number }) => {
    try {
      await classTeachersApi.assignTeacher(schoolId, data);
      await fetchClassTeachers();
      return Promise.resolve();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to assign teacher';
      throw new Error(errorMsg);
    }
  };
  
  const handleRemoveTeacher = async (teacherId: number) => {
    if (!selectedClassId || !confirm('Are you sure you want to remove this teacher from the class?')) {
      return;
    }
    
    try {
      await classTeachersApi.removeTeacher(schoolId, selectedClassId as number, teacherId);
      await fetchClassTeachers();
      alert('Teacher removed successfully!');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to remove teacher';
      alert(errorMsg);
    }
  };
  
  const handleClassChange = (classId: number) => {
    setSelectedClassId(classId);
    setError(null);
  };
  
  const handleRefresh = () => {
    if (selectedClassId) {
      fetchClassTeachers();
    }
  };
  
  const selectedClass = classes.find(c => c.class_id === selectedClassId) || null;
  const existingTeachers = classTeachers.map(ct => ct.teacher_id);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Loading classes...</p>
      </div>
    );
  }
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Class Teachers Management</h1>
            <p className="text-gray-600 mt-2">Assign and manage teachers for each class</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">
              School ID: <span className="font-semibold">{schoolId}</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={!selectedClassId || refreshing}
              className="flex items-center px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-medium transition-colors border border-blue-200"
            >
              <svg 
                className={`w-5 h-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 text-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column - Class Selection */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Class</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose a Class
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white text-gray-900"
                >
                  <option value="" className="text-gray-500">Select a class...</option>
                  {classes.map((cls) => (
                    <option key={cls.class_id} value={cls.class_id} className="text-gray-900">
                      {cls.name} - {cls.section} ({cls.medium}) - {cls.academic_year}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Class Details Card */}
              {selectedClass && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Class Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Class ID</p>
                      <p className="font-medium text-gray-900">{selectedClass.class_id}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Status</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedClass.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedClass.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Medium</p>
                      <p className="font-medium text-gray-900">{selectedClass.medium}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-500">Academic Year</p>
                      <p className="font-medium text-gray-900">{selectedClass.academic_year}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Teachers Table Section */}
          {selectedClassId ? (
            <ClassTeachersTable
              classTeachers={classTeachers}
              onRemove={handleRemoveTeacher}
              isLoading={refreshing}
              classInfo={selectedClass}
            />
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Class Selected</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Please select a class from the dropdown above to view and manage assigned teachers.
              </p>
            </div>
          )}
        </div>
        
        {/* Right Column - Quick Stats */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Stats</h2>
            <div className="space-y-6">
              {/* Total Classes Card */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-blue-700 font-medium mb-1">Total Classes</p>
                    <p className="text-3xl font-bold text-blue-900">{classes.length}</p>
                  </div>
                  <div className="p-3 bg-blue-200 rounded-lg">
                    <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Selected Class Teachers Card */}
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-indigo-700 font-medium mb-1">Selected Class Teachers</p>
                    <p className="text-3xl font-bold text-indigo-900">{classTeachers.length}</p>
                  </div>
                  <div className="p-3 bg-indigo-200 rounded-lg">
                    <svg className="w-6 h-6 text-indigo-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-4.201V21" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Assign Teacher Button */}
              <button
                onClick={() => setIsModalOpen(true)}
                disabled={!selectedClassId}
                className={`w-full py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center ${
                  selectedClassId
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Assign Teacher
              </button>
              
              {/* Quick Info */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Info</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Select a class to view assigned teachers
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Click "Assign Teacher" to add new assignments
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Use "Refresh" button to update the list
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* School Info Card */}
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-white mb-4">School Information</h3>
            <div className="space-y-3">
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <div>
                  <p className="text-sm text-gray-300">School ID</p>
                  <p className="font-semibold">{schoolId}</p>
                </div>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-300">Logged in as</p>
                  <p className="font-semibold">{user?.name || 'Admin'}</p>
                </div>
              </div>
              <div className="flex items-center text-white">
                <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm text-gray-300">Last updated</p>
                  <p className="font-semibold">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Assign Teacher Modal */}
      <AssignTeacherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAssignTeacher}
        schoolId={schoolId}
        classId={selectedClassId as number}
        existingTeachers={existingTeachers}
        className={selectedClass?.name || ''}
        classSection={selectedClass?.section || ''}
      />
    </div>
  );
}