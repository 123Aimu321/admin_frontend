import { api } from './axios';
import { ClassSubject } from '@/types/subject';

export const classSubjectsApi = {
  // ASSIGN subject to class
  assignSubject: async (schoolId: number, data: { 
    class_id: number; 
    subject_id: number; 
    teacher_id?: number 
  }): Promise<ClassSubject> => {
    try {
      console.log(`Assigning subject to class in school ${schoolId}:`, data);
      const response = await api.post(`/admin/class-subjects/${schoolId}`, data);
      console.log(`Assign subject response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error assigning subject in school ${schoolId}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: `/admin/class-subjects/${schoolId}`,
        payload: data
      });
      throw error;
    }
  },

  // UPDATE subject teacher
  updateSubjectTeacher: async (schoolId: number, id: number, data: { teacher_id?: number }): Promise<ClassSubject> => {
    try {
      console.log(`Updating subject teacher for id ${id} in school ${schoolId}:`, data);
      const response = await api.put(`/admin/class-subjects/${schoolId}/${id}`, data);
      console.log(`Update subject teacher response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating subject teacher in school ${schoolId}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: `/admin/class-subjects/${schoolId}/${id}`,
        payload: data
      });
      throw error;
    }
  },

  // REMOVE subject from class
  removeSubject: async (schoolId: number, id: number): Promise<{ message: string }> => {
    try {
      console.log(`Removing subject assignment ${id} in school ${schoolId}`);
      const response = await api.delete(`/admin/class-subjects/${schoolId}/${id}`);
      console.log(`Remove subject response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error removing subject assignment in school ${schoolId}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: `/admin/class-subjects/${schoolId}/${id}`
      });
      throw error;
    }
  },

  // GET subjects for a class
  getClassSubjects: async (schoolId: number, classId: number): Promise<ClassSubject[]> => {
    try {
      console.log(`Fetching subjects for class ${classId} in school ${schoolId}`);
      // Note: You might need to create this endpoint in backend
      const response = await api.get(`/admin/class-subjects/${schoolId}?class_id=${classId}`);
      console.log(`Get class subjects response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching subjects for class in school ${schoolId}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: `/admin/class-subjects/${schoolId}?class_id=${classId}`
      });
      throw error;
    }
  },
};