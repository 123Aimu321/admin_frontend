export interface SchoolClass {
  class_id: number;
  school_id: number;
  name: string;
  grade_level: string;
  academic_year: string;
  created_at: string;
}

export interface CreateClassRequest {
  name: string;
  grade_level: string;
  academic_year: string;
}