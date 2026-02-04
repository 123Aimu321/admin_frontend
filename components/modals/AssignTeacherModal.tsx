import React, { useState, useEffect } from 'react';
import { usersApi } from '@/api/users';
import { User } from '@/types/user';

interface AssignTeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { class_id: number; teacher_id: number }) => Promise<void>;
  schoolId: number;
  classId: number;
  existingTeachers: number[];
  className?: string;
  classSection?: string;
}

const AssignTeacherModal: React.FC<AssignTeacherModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  schoolId,
  classId,
  existingTeachers,
  className = '',
  classSection = ''
}) => {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<number>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && schoolId) {
      fetchTeachers();
    } else {
      // Reset state when modal closes
      setSelectedTeacher('');
      setError(null);
      setSearchTerm('');
    }
  }, [isOpen, schoolId]);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await usersApi.getUsers(schoolId);
      
      // Filter only teachers (assuming teachers have role = 'teacher')
      const allTeachers = response.filter(user => user.role === 'teacher');
      setTeachers(allTeachers);
      setError(null);
    } catch (err: any) {
      setError('Failed to load teachers. Please try again.');
      console.error('Error fetching teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTeacher) {
      setError('Please select a teacher');
      return;
    }

    setSubmitting(true);
    setError(null);
    
    try {
      await onSubmit({
        class_id: classId,
        teacher_id: selectedTeacher
      });
      setSelectedTeacher('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign teacher');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter teachers based on search term and exclude already assigned teachers
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    const notAssigned = !existingTeachers.includes(teacher.user_id);
    return matchesSearch && notAssigned;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-4.201V21" />
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Assign Teacher to Class
                </h3>
                
                {className && (
                  <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-800">
                      {className} - {classSection} (ID: {classId})
                    </p>
                  </div>
                )}

                <div className="mt-4">
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* Search Input */}
                    <div>
                      <input
                        type="text"
                        placeholder="Search teachers by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    {loading ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    ) : filteredTeachers.length === 0 ? (
                      <div className="text-center py-6">
                        <div className="text-gray-400 mb-3">
                          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 font-medium mb-1">
                          {searchTerm ? 'No teachers found' : 'No available teachers'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {searchTerm 
                            ? 'Try a different search term'
                            : 'All teachers are already assigned to this class'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {filteredTeachers.map((teacher) => (
                          <div
                            key={teacher.user_id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedTeacher === teacher.user_id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              setSelectedTeacher(teacher.user_id);
                              setError(null);
                            }}
                          >
                            <div className="flex items-center">
                              <div className={`w-4 h-4 rounded-full border mr-3 ${
                                selectedTeacher === teacher.user_id
                                  ? 'border-blue-500 bg-blue-500'
                                  : 'border-gray-300'
                              }`} />
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="font-medium text-gray-900">{teacher.name}</p>
                                    <p className="text-sm text-gray-500">{teacher.email}</p>
                                  </div>
                                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                    ID: {teacher.user_id}
                                  </span>
                                </div>
                                {teacher.phone && (
                                  <p className="text-sm text-gray-500 mt-1">{teacher.phone}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {existingTeachers.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          <span className="font-medium">Note:</span> {existingTeachers.length} teacher{existingTeachers.length !== 1 ? 's are' : ' is'} already assigned to this class.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || loading || filteredTeachers.length === 0 || !selectedTeacher}
              className={`w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2.5 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                submitting || loading || filteredTeachers.length === 0 || !selectedTeacher
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Assigning...
                </>
              ) : (
                'Assign Teacher'
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignTeacherModal;