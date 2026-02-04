// api/classes.ts
import { api } from './axios';

export interface Class {
  class_id: number;
  school_id: number;
  name: string;
  section: string;
  medium: string;
  is_active: boolean;
  capacity?: number;
  subjects_count?: number;
  teacher_assigned?: string;
  created_at: string;
  academic_year: string;
  updated_at: string | null;
}

export interface ClassFormData {
  name: string;
  section: string;
  medium: string;
  academic_year: string;
  capacity?: string;
  is_active?: boolean;
}

// Note: Your backend routes require school_id in the path
export const getClasses = async (schoolId: number): Promise<Class[]> => {
  const response = await api.get(`/admin/classes/${schoolId}`);
  return response.data;
};

export const createClass = async (schoolId: number, data: ClassFormData): Promise<Class> => {
  const response = await api.post(`/admin/classes/${schoolId}`, {
    ...data,
    capacity: data.capacity ? parseInt(data.capacity, 10) : undefined
  });
  return response.data;
};

export const updateClass = async (schoolId: number, classId: number, data: Partial<ClassFormData>): Promise<Class> => {
  const payload: any = { ...data };
  if (data.capacity !== undefined) {
    payload.capacity = data.capacity ? parseInt(data.capacity, 10) : undefined;
  }
  
  const response = await api.put(`/admin/classes/${schoolId}/${classId}`, payload);
  return response.data;
};

export const deleteClass = async (schoolId: number, classId: number): Promise<void> => {
  await api.delete(`/admin/classes/${schoolId}/${classId}`);
};

// Helper functions
export const transformClassForForm = (cls: Class): ClassFormData => ({
  name: cls.name,
  section: cls.section,
  medium: cls.medium,
  academic_year: cls.academic_year,
  capacity: cls.capacity?.toString(),
  is_active: cls.is_active,
});

// Additional utility functions
export const toggleClassStatus = async (schoolId: number, classId: number, isActive: boolean): Promise<Class> => {
  const response = await api.patch(`/admin/classes/${schoolId}/${classId}/status`, {
    is_active: isActive
  });
  return response.data;
};

export const getClassById = async (schoolId: number, classId: number): Promise<Class> => {
  const response = await api.get(`/admin/classes/${schoolId}/${classId}`);
  return response.data;
};