import React, { useState, useCallback } from 'react';
import { Student, AttendanceRecord, StudentFormData } from './types';
import CameraView from './components/CameraView';
import DashboardView from './components/DashboardView';
import Header from './components/Header';
import { STUDENTS_MOCK } from './constants';

type View = 'camera' | 'dashboard';

// Generates a simple, colorful avatar with the student's initials
const createAvatar = (name: string): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const context = canvas.getContext('2d');
    if (!context) return '';

    const colors = ["#4A90E2", "#50E3C2", "#B8E986", "#F8E71C", "#F5A623", "#BD10E0", "#9013FE"];
    const bgColor = colors[name.length % colors.length];

    // Draw background
    context.fillStyle = bgColor;
    context.fillRect(0, 0, 200, 200);

    // Draw text
    context.font = "bold 80px Arial";
    context.fillStyle = "#FFFFFF";
    context.textAlign = "center";
    context.textBaseline = "middle";
    const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    context.fillText(initials, 100, 105);

    return canvas.toDataURL('image/png');
}


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [students, setStudents] = useState<Student[]>(STUDENTS_MOCK);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  const handleAttendanceMarked = useCallback((student: Student) => {
    const now = new Date();
    const newRecord: AttendanceRecord = {
      recordId: `att-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      date: now.toLocaleDateString('en-CA'), // YYYY-MM-DD for easier sorting
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Present',
    };

    // Avoid duplicate entries for the same student on the same day
    setAttendance(prev => {
      const alreadyMarked = prev.some(record => record.studentId === student.id && record.date === newRecord.date);
      if (alreadyMarked) {
        return prev;
      }
      return [newRecord, ...prev];
    });
  }, []);

  const handleResendNotification = (recordId: string) => {
    console.log(`Resending notification for record ${recordId}`);
    // Here you would add logic to call a service to resend a WhatsApp notification.
    // For this demo, we'll just log it.
    alert(`WhatsApp notification for record ${recordId} has been resent (simulated).`);
  };
  
  const handleSaveStudent = (studentData: StudentFormData, studentId: string | null) => {
    if (studentId) {
      // Update existing student
      setStudents(prevStudents => prevStudents.map(s => 
        s.id === studentId ? { id: s.id, ...studentData } : s
      ));
    } else {
      // Create new student
      const newStudent: Student = {
        id: `s${Date.now()}`,
        ...studentData,
        imageUrl: studentData.imageUrl || createAvatar(studentData.name),
      };
      setStudents(prevStudents => [newStudent, ...prevStudents]);
    }
  };

  const handleDeleteStudent = (studentId: string) => {
    if (window.confirm('Are you sure you want to delete this student? This will also remove their attendance records.')) {
      setStudents(prevStudents => prevStudents.filter(s => s.id !== studentId));
      setAttendance(prevAtt => prevAtt.filter(rec => rec.studentId !== studentId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
      <Header currentView={currentView} setCurrentView={setCurrentView} />
      <main className="p-4 sm:p-6 lg:p-8">
        {currentView === 'camera' && (
          <CameraView students={students} onAttendanceMarked={handleAttendanceMarked} />
        )}
        {currentView === 'dashboard' && (
          <DashboardView 
            students={students} 
            attendance={attendance}
            onResendNotification={handleResendNotification}
            onSaveStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        )}
      </main>
    </div>
  );
};

export default App;