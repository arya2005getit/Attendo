export interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  students: Student[];
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  courseId: string;
  date: string;
  records: {
    studentId: string;
    present: boolean;
  }[];
}
