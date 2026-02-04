// app/admin/classes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getClasses, deleteClass } from '@/api/classes';
import { Class } from '@/types/class';
import ClassModal from '@/components/modals/ClassModal';
import { StatCard } from '@/components/dashboard/StatCard';
import { FiSearch, FiPlus, FiGrid, FiUsers, FiBook, FiEdit2, FiTrash2, FiLoader } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { subjectsApi } from '@/api/subjects';
import { usersApi } from '@/api/users';

export default function ClassesPage() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [stats, setStats] = useState({
    totalClasses: 0,
    activeClasses: 0,
    totalStudents: 0,
    totalSubjects: 0
  });
  const [apiErrors, setApiErrors] = useState<string[]>([]);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    const filtered = classes.filter(cls =>
      `${cls.name}${cls.section}${cls.medium}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredClasses(filtered);
  }, [searchTerm, classes]);

  const fetchClasses = async () => {
    try {
      if (!user?.school_id) {
        console.error('No school ID found in user context');
        setLoading(false);
        setStatsLoading(false);
        return;
      }
      
      const schoolId = user.school_id;
      
      // Fetch classes
      const classesData = await getClasses(schoolId);
      setClasses(classesData);
      setFilteredClasses(classesData);
      
      // Update basic class stats
      const totalClasses = classesData.length;
      const activeClasses = classesData.filter(c => c.is_active).length;
      
      setStats(prev => ({
        ...prev,
        totalClasses,
        activeClasses
      }));
      
      setLoading(false);
      
      // Now fetch additional stats (subjects and students)
      fetchAdditionalStats(schoolId);
      
    } catch (error) {
      console.error('Error fetching classes:', error);
      setLoading(false);
      setStatsLoading(false);
      setApiErrors(prev => [...prev, `Classes API: ${error instanceof Error ? error.message : 'Failed to load'}`]);
    }
  };

  const fetchAdditionalStats = async (schoolId: number) => {
    setStatsLoading(true);
    setApiErrors([]);
    
    try {
      console.log('Fetching additional stats for school:', schoolId);
      
      // Fetch subjects and users in parallel
      const [subjectsResponse, usersResponse] = await Promise.allSettled([
        subjectsApi.getSubjects(schoolId),
        usersApi.getUsers(schoolId)
      ]);
      
      let totalSubjects = 0;
      let totalStudents = 0;
      const newErrors: string[] = [];
      
      // Process subjects response
      if (subjectsResponse.status === 'fulfilled') {
        totalSubjects = subjectsResponse.value.data?.length || 0;
        console.log(`Found ${totalSubjects} subjects`);
      } else {
        console.error('Failed to fetch subjects:', subjectsResponse.reason);
        newErrors.push(`Subjects API: ${subjectsResponse.reason.message || 'Failed to load'}`);
      }
      
      // Process users response
      if (usersResponse.status === 'fulfilled') {
        const users = usersResponse.value;
        totalStudents = users.filter(u => u.role === 'student').length;
        console.log(`Found ${users.length} total users, ${totalStudents} students`);
      } else {
        console.error('Failed to fetch users:', usersResponse.reason);
        newErrors.push(`Users API: ${usersResponse.reason.message || 'Failed to load'}`);
      }
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalSubjects,
        totalStudents
      }));
      
      // Set any errors
      if (newErrors.length > 0) {
        setApiErrors(newErrors);
      }
      
    } catch (error) {
      console.error('Error fetching additional stats:', error);
      setApiErrors(prev => [...prev, `Stats API: ${error instanceof Error ? error.message : 'Unknown error'}`]);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingClass(null);
    setModalOpen(true);
  };

  const handleEdit = (cls: Class) => {
    setEditingClass(cls);
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to deactivate this class?')) {
      try {
        if (!user?.school_id) {
          console.error('No school ID found in user context');
          return;
        }
        
        const schoolId = user.school_id;
        await deleteClass(schoolId, id);
        fetchClasses(); // This will also refresh stats
      } catch (error) {
        console.error('Error deleting class:', error);
      }
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingClass(null);
  };

  const handleSaveSuccess = () => {
    fetchClasses(); // This will also refresh stats
    handleModalClose();
  };

  const handleRefreshStats = () => {
    if (user?.school_id) {
      fetchAdditionalStats(user.school_id);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Classes Management</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage all classes for School ID: {user?.school_id}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshStats}
            disabled={statsLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <FiLoader className={statsLoading ? 'animate-spin' : ''} />
            {statsLoading ? 'Refreshing...' : 'Refresh Stats'}
          </button>
          <button
            onClick={handleAdd}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            <FiPlus className="mr-2" />
            Add New Class
          </button>
        </div>
      </div>

      {/* API Errors */}
      {apiErrors.length > 0 && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Classes" 
          value={stats.totalClasses} 
          icon={<FiGrid size={20} />}
          color="blue"
          isLoading={loading}
          trend={loading ? "Loading..." : `${stats.totalClasses} classes`}
        />
        <StatCard 
          title="Active Classes" 
          value={stats.activeClasses} 
          icon={<FiGrid size={20} />}
          color="green"
          isLoading={loading}
          trend={loading ? "Loading..." : `${stats.activeClasses} active`}
        />
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents} 
          icon={<FiUsers size={20} />}
          color="purple"
          isLoading={statsLoading}
          trend={statsLoading ? "Loading..." : `${stats.totalStudents} students`}
        />
        <StatCard 
          title="Total Subjects" 
          value={stats.totalSubjects} 
          icon={<FiBook size={20} />}
          color="orange"
          isLoading={statsLoading}
          trend={statsLoading ? "Loading..." : `${stats.totalSubjects} subjects`}
        />
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search classes by grade, section, medium..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Classes List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading classes...</p>
          </div>
        ) : filteredClasses.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <FiGrid className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No classes found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try a different search term.' : 'Get started by creating your first class.'}
            </p>
            <button
              onClick={handleAdd}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FiPlus className="mr-2" />
              Add First Class
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredClasses.map((cls) => (
              <div key={cls.class_id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="text-lg font-semibold text-gray-800">
                        Grade {cls.name} - Section {cls.section}
                      </h3>
                      {!cls.is_active && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                          Inactive
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">Medium:</span>
                        <span>{cls.medium}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">Academic Year:</span>
                        <span>{cls.academic_year}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">Capacity:</span>
                        <span>{cls.capacity || 'Not set'} students</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-medium mr-2">Subjects:</span>
                        <span>{cls.subjects_count || 0}</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="font-medium mr-2">Teacher:</span>
                        <span>{cls.teacher_assigned || 'Not assigned'}</span>
                      </div>
                      <div className="mt-1">
                        <span className="font-medium mr-2">Created:</span>
                        <span>{new Date(cls.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(cls)}
                      className="inline-flex items-center px-3 py-2 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      <FiEdit2 className="mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cls.class_id)}
                      className="inline-flex items-center px-3 py-2 text-sm border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <FiTrash2 className="mr-2" />
                      {cls.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      <ClassModal
        isOpen={modalOpen}
        onClose={handleModalClose}
        onSave={handleSaveSuccess}
        editingClass={editingClass}
      />

      {/* Debug Stats Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-sm text-gray-600">
          <div className="font-medium mb-2">Stats Debug Info:</div>
          <div className="grid grid-cols-2 gap-2">
            <div>Classes Loaded: {loading ? 'Loading...' : '✓'}</div>
            <div>Stats Loaded: {statsLoading ? 'Loading...' : '✓'}</div>
            <div>Total Subjects API: {stats.totalSubjects} items</div>
            <div>Total Students API: {stats.totalStudents} students</div>
          </div>
          {apiErrors.length > 0 && (
            <div className="mt-3">
              <div className="font-medium text-red-600">API Errors:</div>
              <ul className="list-disc pl-5 mt-1">
                {apiErrors.map((error, index) => (
                  <li key={index} className="text-xs">{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </>
  );
}