import { api } from './axios';
import { ClassTeacher } from '@/types/subject';

export const classTeachersApi = {
  // GET teachers for a class - Based on your backend structure
  getClassTeachers: async (schoolId: number, classId: number): Promise<ClassTeacher[]> => {
    try {
      console.log(`Fetching teachers for class ${classId} in school ${schoolId}...`);
      
      // Since your backend doesn't have a GET endpoint, we need to get all and filter
      // Or you can implement a GET endpoint in backend
      
      // Option 1: If you can't modify backend, get all class-teachers and filter
      const response = await api.get(`/admin/class-teachers/${schoolId}/all`, { timeout: 30000 });
      
      // Filter by class_id on client side
      const allClassTeachers = response.data || [];
      const filteredTeachers = allClassTeachers.filter(
        (teacher: ClassTeacher) => teacher.class_id === classId && teacher.school_id === schoolId
      );
      
      console.log(`Class teachers API Response:`, filteredTeachers);
      return filteredTeachers;
      
    } catch (error: any) {
      // If the endpoint doesn't exist, check if we can get a list another way
      if (error.response?.status === 404) {
        console.warn(`GET endpoint not found. You need to implement it in backend.`);
        
        // For now, return empty array (or implement a workaround)
        return [];
      }
      
      console.error(`Error fetching teachers for class in school ${schoolId}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      throw error;
    }
  },

  // ASSIGN teacher to class
  assignTeacher: async (schoolId: number, data: { class_id: number; teacher_id: number }): Promise<ClassTeacher> => {
    try {
      console.log(`Assigning teacher to class in school ${schoolId}:`, data);
      const response = await api.post(`/admin/class-teachers/${schoolId}`, data, { timeout: 15000 });
      console.log(`Assign teacher response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error assigning teacher in school ${schoolId}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        url: `/admin/class-teachers/${schoolId}`,
        payload: data
      });
      throw error;
    }
  },

  // REMOVE teacher from class
  removeTeacher: async (schoolId: number, classId: number, teacherId: number): Promise<{ message: string }> => {
    try {
      console.log(`Removing teacher ${teacherId} from class ${classId} in school ${schoolId}`);
      const response = await api.delete(`/admin/class-teachers/${schoolId}/${classId}/${teacherId}`, { timeout: 15000 });
      console.log(`Remove teacher response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error removing teacher from class in school ${schoolId}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // GET all class-teachers for a school (if you implement this in backend)
  getAllClassTeachers: async (schoolId: number): Promise<ClassTeacher[]> => {
    try {
      console.log(`Fetching all class teachers for school ${schoolId}...`);
      const response = await api.get(`/admin/class-teachers/${schoolId}/all`, { timeout: 30000 });
      console.log(`All class teachers response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching all class teachers for school ${schoolId}:`, error);
      throw error;
    }
  },
};