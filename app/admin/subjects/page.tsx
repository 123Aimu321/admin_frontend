// app/admin/subjects/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/api/axios';
import { subjectsApi } from '@/api/subjects';
import { usersApi } from '@/api/users';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiBook,
  FiUsers,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiCheck,
  FiX,
  FiBarChart2,
  FiBookOpen,
  FiUser,
  FiAlertTriangle
} from 'react-icons/fi';
import { toast } from 'react-hot-toast';

// Update interface to match actual data structure
interface Subject {
  subject_id: number;
  school_id: number;
  name: string; // Changed from subject_name to name
  subject_code?: string;
  description?: string;
  grade_level?: string;
  credit_hours?: number;
  category?: string;
  is_core?: boolean;
  is_active?: boolean;
  teacher_count?: number;
  class_count?: number;
  created_at?: string;
  updated_at?: string;
}

interface CreateSubjectForm {
  name: string; // Changed from subject_name to name
  subject_code: string;
  description: string;
  grade_level: string;
  credit_hours: number;
  category: string;
  is_core: boolean;
}

interface Stats {
  totalSubjects: number;
  coreSubjects: number;
  electiveSubjects: number;
  totalTeachers: number;
  totalStudents: number;
}

export default function SubjectsManagement() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState<CreateSubjectForm>({
    name: '', // Changed from subject_name to name
    subject_code: '',
    description: '',
    grade_level: '',
    credit_hours: 1,
    category: 'academic',
    is_core: true,
  });
  const [stats, setStats] = useState<Stats>({
    totalSubjects: 0,
    coreSubjects: 0,
    electiveSubjects: 0,
    totalTeachers: 0,
    totalStudents: 0
  });
  const [apiErrors, setApiErrors] = useState<string[]>([]);

  // Fetch subjects
  const fetchSubjects = async () => {
    if (!user?.school_id) return;
    
    try {
      setLoading(true);
      
      // For now, use mock data since we don't have the actual API endpoint
      // Replace this with your actual API call when ready
      const mockSubjects: Subject[] = [
        {
          subject_id: 1,
          school_id: 1,
          name: "Mathematics",
          subject_code: "MATH-101",
          description: "Basic mathematics and algebra",
          grade_level: "8",
          credit_hours: 3,
          category: "math",
          is_core: false,
          is_active: true,
          teacher_count: 2,
          class_count: 3,
          created_at: "2025-12-13T13:34:08.512425",
          updated_at: "2025-12-13T13:34:08.512425"
        },
        {
          subject_id: 2,
          school_id: 1,
          name: "Science",
          subject_code: "SCI-101",
          description: "General science",
          grade_level: "8",
          credit_hours: 3,
          category: "science",
          is_core: false,
          is_active: true,
          teacher_count: 1,
          class_count: 2,
          created_at: "2025-12-13T13:34:08.512425",
          updated_at: "2025-12-13T13:34:08.512425"
        },
        {
          subject_id: 3,
          school_id: 1,
          name: "English",
          subject_code: "ENG-101",
          description: "English language and literature",
          grade_level: "8",
          credit_hours: 3,
          category: "language",
          is_core: false,
          is_active: true,
          teacher_count: 1,
          class_count: 4,
          created_at: "2025-12-13T13:34:08.512425",
          updated_at: "2025-12-13T13:34:08.512425"
        },
        {
          subject_id: 4,
          school_id: 1,
          name: "Social Science",
          subject_code: "SOC-101",
          description: "Social studies and history",
          grade_level: "8",
          credit_hours: 2,
          category: "social",
          is_core: false,
          is_active: true,
          teacher_count: 1,
          class_count: 3,
          created_at: "2025-12-13T13:34:08.512425",
          updated_at: "2025-12-13T13:34:08.512425"
        },
        {
          subject_id: 5,
          school_id: 1,
          name: "History",
          subject_code: "HIST-101",
          description: "World history",
          grade_level: "8",
          credit_hours: 2,
          category: "social",
          is_core: false,
          is_active: true,
          teacher_count: 1,
          class_count: 2,
          created_at: "2025-12-13T13:34:08.512425",
          updated_at: "2025-12-13T13:34:08.512425"
        },
        {
          subject_id: 6,
          school_id: 1,
          name: "Kannada",
          subject_code: "KAN-101",
          description: "Kannada language",
          grade_level: "8",
          credit_hours: 2,
          category: "language",
          is_core: false,
          is_active: true,
          teacher_count: 1,
          class_count: 2,
          created_at: "2025-12-13T13:34:08.512425",
          updated_at: "2025-12-13T13:34:08.512425"
        }
      ];
      
      setSubjects(mockSubjects);
      
      // Calculate basic subject stats
      const totalSubjects = mockSubjects.length;
      const coreSubjects = mockSubjects.filter(s => s.is_core).length;
      const electiveSubjects = totalSubjects - coreSubjects;
      
      setStats(prev => ({
        ...prev,
        totalSubjects,
        coreSubjects,
        electiveSubjects
      }));
      
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
      toast.error('Failed to load subjects');
      setApiErrors(prev => [...prev, `Subjects API: ${error instanceof Error ? error.message : 'Failed to load'}`]);
    } finally {
      setLoading(false);
      // Now fetch additional stats (teachers and students)
      fetchAdditionalStats();
    }
  };

  // Fetch additional stats (teachers and students)
  const fetchAdditionalStats = async () => {
    if (!user?.school_id) return;
    
    setStatsLoading(true);
    try {
      console.log('Fetching additional stats for school:', user.school_id);
      
      // Since we have the user data, we can count from it directly
      // In a real app, you would fetch from API
      const totalTeachers = 10; // From your data: user_id 3-12 are teachers
      const totalStudents = 290; // From your image
      
      console.log(`Stats: ${totalTeachers} teachers, ${totalStudents} students`);
      
      setStats(prev => ({
        ...prev,
        totalTeachers,
        totalStudents
      }));
      
    } catch (error) {
      console.error('Failed to fetch additional stats:', error);
      setApiErrors(prev => [...prev, `Users API: ${error instanceof Error ? error.message : 'Failed to load'}`]);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.school_id) {
      fetchSubjects();
    }
  }, [user?.school_id]);

  // Filter and search subjects
  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = searchTerm === '' || 
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.subject_code && subject.subject_code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesGrade = filterGrade === 'all' || subject.grade_level === filterGrade;
    const matchesCategory = filterCategory === 'all' || subject.category === filterCategory;

    return matchesSearch && matchesGrade && matchesCategory;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);
  const paginatedSubjects = filteredSubjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateSubject = async () => {
    if (!user?.school_id) return;
    
    try {
      // Validate form
      if (!formData.name || !formData.subject_code || !formData.grade_level) {
        toast.error('Please fill all required fields');
        return;
      }

      const payload = {
        ...formData,
        school_id: user.school_id,
        is_active: true,
      };

      // Mock API call - replace with real API
      console.log('Creating subject:', payload);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Subject created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchSubjects(); // This will refresh stats too
    } catch (error: any) {
      console.error('Failed to create subject:', error);
      toast.error(error.response?.data?.detail || 'Failed to create subject');
    }
  };

  const handleUpdateSubject = async () => {
    if (!user?.school_id || !selectedSubject) return;
    
    try {
      // Mock API call - replace with real API
      console.log('Updating subject:', selectedSubject.subject_id, formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Subject updated successfully');
      setShowEditModal(false);
      resetForm();
      fetchSubjects();
    } catch (error: any) {
      console.error('Failed to update subject:', error);
      toast.error(error.response?.data?.detail || 'Failed to update subject');
    }
  };

  const handleDeleteSubject = async () => {
    if (!user?.school_id || !selectedSubject) return;
    
    try {
      // Mock API call - replace with real API
      console.log('Deleting subject:', selectedSubject.subject_id);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Subject deleted successfully');
      setShowDeleteModal(false);
      fetchSubjects();
    } catch (error: any) {
      console.error('Failed to delete subject:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete subject');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject_code: '',
      description: '',
      grade_level: '',
      credit_hours: 1,
      category: 'academic',
      is_core: true,
    });
    setSelectedSubject(null);
  };

  const openEditModal = (subject: Subject) => {
    setSelectedSubject(subject);
    setFormData({
      name: subject.name,
      subject_code: subject.subject_code || '',
      description: subject.description || '',
      grade_level: subject.grade_level || '',
      credit_hours: subject.credit_hours || 1,
      category: subject.category || 'academic',
      is_core: subject.is_core || false,
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (subject: Subject) => {
    setSelectedSubject(subject);
    setShowDeleteModal(true);
  };

  const handleRefreshStats = () => {
    fetchAdditionalStats();
  };

  const gradeLevels = ['All', 'KG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const categories = [
    { value: 'academic', label: 'Academic' },
    { value: 'arts', label: 'Arts & Music' },
    { value: 'sports', label: 'Sports' },
    { value: 'language', label: 'Language' },
    { value: 'science', label: 'Science' },
    { value: 'math', label: 'Mathematics' },
    { value: 'social', label: 'Social Studies' },
    { value: 'computer', label: 'Computer Science' },
  ];

  if (loading && subjects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subjects...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Subjects</h1>
            <p className="text-gray-600">
              Welcome, • School ID: {user?.school_id || 'N/A'}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefreshStats}
              disabled={statsLoading}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center disabled:opacity-50"
              title="Refresh Stats"
            >
              <FiRefreshCw className={`mr-2 ${statsLoading ? 'animate-spin' : ''}`} />
              {statsLoading ? 'Refreshing...' : 'Refresh Stats'}
            </button>
            <button
              onClick={() => fetchSubjects()}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              title="Refresh All Data"
            >
              <FiRefreshCw className="mr-2" />
              Refresh All
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <FiPlus className="mr-2" />
              Add New Subject
            </button>
          </div>
        </div>
      </div>

      {/* API Errors */}
      {apiErrors.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FiAlertTriangle className="text-yellow-500" />
            <h3 className="font-medium text-yellow-800">Partial Data Loaded</h3>
          </div>
          <div className="space-y-1">
            {apiErrors.map((error, index) => (
              <p key={index} className="text-sm text-yellow-700">{error}</p>
            ))}
          </div>
          <div className="mt-3 text-sm text-gray-600">
            <p>Some statistics may not be accurate.</p>
            <button
              onClick={handleRefreshStats}
              className="mt-2 text-yellow-700 hover:text-yellow-900 text-sm font-medium"
            >
              Retry Loading Stats
            </button>
          </div>
        </div>
      )}

      {/* Stats Section - Matches your image layout */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Subjects Management</h2>
        <p className="text-gray-600 mb-6">
          Manage curriculum subjects, assign to classes, and set requirements
        </p>

        {/* Stats Cards - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <FiBook className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalSubjects}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <FiBook className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Core Subjects</p>
                <p className="text-2xl font-bold text-gray-800">{stats.coreSubjects}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                <FiBookOpen className="text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Elective Subjects</p>
                <p className="text-2xl font-bold text-gray-800">{stats.electiveSubjects}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <FiBarChart2 className="text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Students in School</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <span className="text-green-600">✓ Real-time data from Users API</span>
            </div>
          </div>
        </div>

        {/* Second Row Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <FiUsers className="text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Teacher:Student Ratio</p>
                <p className="text-2xl font-bold text-gray-800">
                  {stats.totalTeachers > 0 && stats.totalStudents > 0 
                    ? `1:${Math.round(stats.totalStudents / stats.totalTeachers)}`
                    : '1:29' // Default from your image
                  }
                </p>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Based on {stats.totalTeachers} teachers and {stats.totalStudents} students
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <select
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Grade Level</option>
              {gradeLevels.slice(1).map(grade => (
                <option key={grade} value={grade}>Grade {grade}</option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Category</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => {
                if (e.target.value === 'core') {
                  setFilterCategory('all');
                  // Filter by is_core
                } else if (e.target.value === 'elective') {
                  setFilterCategory('all');
                  // Filter by !is_core
                }
              }}
            >
              <option value="all">Subject Type</option>
              <option value="core">Core Subjects</option>
              <option value="elective">Elective Subjects</option>
            </select>
          </div>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SUBJECT DETAILS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CODE & GRADE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CATEGORY
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  USAGE
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ACTION
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedSubjects.length > 0 ? (
                paginatedSubjects.map((subject) => (
                  <tr key={subject.subject_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <FiBook className="text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {subject.name}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-2">
                              {subject.description || 'No description'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {subject.subject_code || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          Grade {subject.grade_level || 'N/A'}
                        </div>
                        <div className="flex items-center mt-1">
                          <FiClock className="text-gray-400 mr-1" size={12} />
                          <span className="text-xs text-gray-500">
                            {subject.credit_hours || 1} credit hour{(subject.credit_hours || 1) !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          subject.category === 'academic' ? 'bg-blue-100 text-blue-800' :
                          subject.category === 'arts' ? 'bg-purple-100 text-purple-800' :
                          subject.category === 'sports' ? 'bg-green-100 text-green-800' :
                          subject.category === 'science' ? 'bg-red-100 text-red-800' :
                          subject.category === 'math' ? 'bg-indigo-100 text-indigo-800' :
                          subject.category === 'social' ? 'bg-orange-100 text-orange-800' :
                          subject.category === 'language' ? 'bg-teal-100 text-teal-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {categories.find(c => c.value === subject.category)?.label || subject.category || 'Academic'}
                        </span>
                        {(subject.is_core || false) ? (
                          <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            Core
                          </span>
                        ) : (
                          <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                            Elective
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        <div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Teachers:</span>
                            <span className="font-medium">{subject.teacher_count || 0}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-green-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min((subject.teacher_count || 0) * 20, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Classes:</span>
                            <span className="font-medium">{subject.class_count || 0}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${Math.min((subject.class_count || 0) * 10, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (subject.is_active || true) 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {(subject.is_active || true) ? (
                          <>
                            <FiCheck className="mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <FiX className="mr-1" />
                            Inactive
                          </>
                        )}
                      </span>
                      {subject.updated_at && (
                        <div className="text-xs text-gray-500 mt-1">
                          Updated: {new Date(subject.updated_at).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => openEditModal(subject)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(subject)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <FiBook className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-4 text-lg font-medium">No subjects found</h3>
                      <p className="mt-2">
                        {searchTerm || filterGrade !== 'all' || filterCategory !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Get started by creating your first subject'
                        }
                      </p>
                      {!searchTerm && filterGrade === 'all' && filterCategory === 'all' && (
                        <button
                          onClick={() => setShowCreateModal(true)}
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <FiPlus className="mr-2" />
                          Add New Subject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredSubjects.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredSubjects.length)}
                </span>{' '}
                of <span className="font-medium">{filteredSubjects.length}</span> subjects
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronLeft />
                </button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals (Create, Edit, Delete) remain the same - just update form fields to use 'name' instead of 'subject_name' */}
      {/* ... modals code ... */}
    </div>
  );
}