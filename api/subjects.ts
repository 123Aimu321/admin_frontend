// api/subjects.ts
import { api } from './axios';

export interface Subject {
  subject_id: number;
  school_id: number;
  subject_name: string;
  subject_code: string;
  description?: string;
  grade_level: string;
  credit_hours: number;
  category: string;
  is_core: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateSubjectData {
  subject_name: string;
  subject_code: string;
  description?: string;
  grade_level: string;
  credit_hours: number;
  category: string;
  is_core: boolean;
  is_active?: boolean;
}

export interface UpdateSubjectData extends Partial<CreateSubjectData> {}

export const subjectsApi = {
  // Get all subjects for a school - with longer timeout
  getSubjects: (schoolId: number): Promise<{ data: Subject[] }> => 
    api.get(`/admin/subjects/${schoolId}`, { timeout: 30000 }), // 30 seconds for subjects
  
  // Create a new subject
  createSubject: (schoolId: number, data: CreateSubjectData): Promise<{ data: Subject }> =>
    api.post(`/admin/subjects/${schoolId}`, data, { timeout: 15000 }),
  
  // Update a subject
  updateSubject: (schoolId: number, subjectId: number, data: UpdateSubjectData): Promise<{ data: Subject }> =>
    api.put(`/admin/subjects/${schoolId}/${subjectId}`, data, { timeout: 15000 }),
  
  // Delete a subject
  deleteSubject: (schoolId: number, subjectId: number): Promise<{ data: { message: string } }> =>
    api.delete(`/admin/subjects/${schoolId}/${subjectId}`, { timeout: 15000 }),
};