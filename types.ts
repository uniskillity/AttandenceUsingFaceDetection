export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  phoneNumber: string;
  imageUrl: string;
}

export interface AttendanceRecord {
  recordId: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  status: 'Present';
}

export type StudentFormData = Omit<Student, 'id'>;