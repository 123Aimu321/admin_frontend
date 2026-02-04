export const getApiPath = {
  users: (schoolId: number) => `/admin/admin/admin/users/${schoolId}`,
  classes: (schoolId: number) => `/admin/admin/admin/classes/${schoolId}`,
  subjects: (schoolId: number) => `/admin/admin/admin/subjects/${schoolId}`,
  classSubjects: (schoolId: number) => `/admin/admin/admin/class-subjects/${schoolId}`,
  classTeachers: (schoolId: number) => `/admin/admin/admin/class-teachers/${schoolId}`,
  
  // Individual operations
  user: (schoolId: number, userId: number) => `/admin/admin/admin/users/${schoolId}/${userId}`,
  class: (schoolId: number, classId: number) => `/admin/admin/admin/classes/${schoolId}/${classId}`,
  subject: (schoolId: number, subjectId: number) => `/admin/admin/admin/subjects/${schoolId}/${subjectId}`,
};