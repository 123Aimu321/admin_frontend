// api/users.ts
import { api } from './axios';
import { User, CreateUserRequest } from '@/types/user';

export const usersApi = {
  // GET all users for a school
  getUsers: async (schoolId: number): Promise<User[]> => {
    try {
      console.log(`Fetching users for school ${schoolId}...`);
      const response = await api.get(`/admin/users/${schoolId}`, { timeout: 30000 }); // 30 seconds
      console.log(`Users API Response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching users for school ${schoolId}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // CREATE user
  createUser: async (schoolId: number, data: CreateUserRequest): Promise<User> => {
    try {
      console.log(`Creating user for school ${schoolId}:`, data);
      const response = await api.post(`/admin/users/${schoolId}`, data, { timeout: 15000 });
      console.log(`Create user response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error creating user for school ${schoolId}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // DELETE user
  deleteUser: async (schoolId: number, userId: number): Promise<{ message: string }> => {
    try {
      console.log(`Deleting user ${userId} from school ${schoolId}`);
      const response = await api.delete(`/admin/users/${schoolId}/${userId}`, { timeout: 15000 });
      console.log(`Delete user response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting user ${userId} from school ${schoolId}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // UPDATE user
  updateUser: async (schoolId: number, userId: number, data: Partial<CreateUserRequest>): Promise<User> => {
    try {
      console.log(`Updating user ${userId} in school ${schoolId}:`, data);
      const response = await api.put(`/admin/users/${schoolId}/${userId}`, data, { timeout: 15000 });
      console.log(`Update user response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating user ${userId} in school ${schoolId}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },

  // GET single user
  getUser: async (schoolId: number, userId: number): Promise<User> => {
    try {
      console.log(`Fetching user ${userId} from school ${schoolId}`);
      const response = await api.get(`/admin/users/${schoolId}/${userId}`, { timeout: 15000 });
      console.log(`Get user response:`, response.data);
      return response.data;
    } catch (error: any) {
      console.error(`Error fetching user ${userId} from school ${schoolId}:`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      throw error;
    }
  },
};