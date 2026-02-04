export interface Subject {
  subject_id: number;
  school_id: number;
  name: string;
  code: string;
  description?: string;
  created_at: string;
}

export interface ClassSubject {
  id: number;
  school_id: number;
  class_id: number;
  subject_id: number;
  teacher_id?: number;
  created_at: string;
}

export interface ClassTeacher {
  id: number;
  school_id: number;
  class_id: number;
  teacher_id: number;
  assigned_at: string | null; // Changed from created_at to assigned_at
}

export interface Period {
  period_id: number;
  school_id: number;
  class_id: number;
  period_number: number;
  name: string;
  day_of_week: number;
  created_at: string;
}