// components/modals/ClassModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClass, updateClass } from '@/api/classes';
import { Class } from '@/types/class';
import { FiX } from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext'; // Added import

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingClass: Class | null;
}

export default function ClassModal({ isOpen, onClose, onSave, editingClass }: ClassModalProps) {
  const { user } = useAuth(); // Get user from auth context
  const [formData, setFormData] = useState({
    name: '',
    section: '',
    medium: 'English',
    academic_year: '2024-2025',
    capacity: '',
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingClass) {
      setFormData({
        name: editingClass.name,
        section: editingClass.section,
        medium: editingClass.medium,
        academic_year: editingClass.academic_year,
        capacity: editingClass.capacity?.toString() || '',
        is_active: editingClass.is_active
      });
    } else {
      setFormData({
        name: '',
        section: '',
        medium: 'English',
        academic_year: '2024-2025',
        capacity: '',
        is_active: true
      });
    }
    setError('');
  }, [editingClass, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user?.school_id) {
        throw new Error('No school ID found in user context');
      }

      const schoolId = user.school_id;
      
      if (editingClass) {
        await updateClass(schoolId, editingClass.class_id, formData);
      } else {
        await createClass(schoolId, formData);
      }
      onSave();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const academicYears = ['2023-2024', '2024-2025', '2025-2026'];
  const mediums = ['English', 'Hindi', 'Urdu', 'Bengali', 'Tamil', 'Telugu', 'Marathi'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {editingClass ? `Edit Class: Grade ${editingClass.name} - Section ${editingClass.section}` : 'Add New Class'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade / Class Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 8, 9, 10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section *
            </label>
            <input
              type="text"
              name="section"
              value={formData.section}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., A, B, C"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medium *
            </label>
            <select
              name="medium"
              value={formData.medium}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {mediums.map(medium => (
                <option key={medium} value={medium}>{medium}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Academic Year *
            </label>
            <select
              name="academic_year"
              value={formData.academic_year}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {academicYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity (Optional)
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 45"
            />
          </div>

          {editingClass && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="mr-2"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Class is active
              </label>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : editingClass ? 'Update Class' : 'Save Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}