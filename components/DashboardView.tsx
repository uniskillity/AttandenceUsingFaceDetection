import React, { useState } from 'react';
import { Student, AttendanceRecord, StudentFormData } from '../types';
import StudentList from './StudentList';
import AttendanceList from './AttendanceList';
import Modal from './Modal';
import StudentForm from './StudentForm';

interface DashboardViewProps {
  students: Student[];
  attendance: AttendanceRecord[];
  onResendNotification: (recordId: string) => void;
  onSaveStudent: (studentData: StudentFormData, studentId: string | null) => void;
  onDeleteStudent: (studentId: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ students, attendance, onResendNotification, onSaveStudent, onDeleteStudent }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const handleOpenAddModal = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleSave = (studentData: StudentFormData, studentId: string | null) => {
    onSaveStudent(studentData, studentId);
    handleCloseModal();
  };
  
  return (
    <>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200">Admin Dashboard</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <StudentList 
              students={students}
              onAddStudent={handleOpenAddModal}
              onEditStudent={handleOpenEditModal}
              onDeleteStudent={onDeleteStudent}
            />
          </div>
          <div className="lg:col-span-2">
            <AttendanceList 
              attendance={attendance}
              onResendNotification={onResendNotification}
            />
          </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingStudent ? 'Edit Student Details' : 'Add New Student'}
      >
        <StudentForm
          student={editingStudent}
          onSave={handleSave}
          onCancel={handleCloseModal}
        />
      </Modal>
    </>
  );
};

export default DashboardView;
