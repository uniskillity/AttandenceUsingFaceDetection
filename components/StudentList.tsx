import React from 'react';
import { Student } from '../types';
import { UserGroupIcon, PlusIcon, PencilIcon, TrashIcon } from './icons';

interface StudentListProps {
  students: Student[];
  onAddStudent: () => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ students, onAddStudent, onEditStudent, onDeleteStudent }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold flex items-center text-gray-800 dark:text-gray-200">
          <UserGroupIcon className="w-6 h-6 mr-2" />
          Registered Students ({students.length})
        </h3>
        <button
          onClick={onAddStudent}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-md transition-transform transform hover:scale-110"
          title="Add New Student"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>
      <div className="space-y-3 overflow-y-auto pr-2 flex-grow">
        {students.map(student => (
          <div key={student.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
            <img 
              src={student.imageUrl} 
              alt={student.name} 
              className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-blue-200 dark:border-blue-800"
            />
            <div className="flex-grow">
              <p className="font-semibold text-gray-900 dark:text-gray-100">{student.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Roll No: {student.rollNumber}</p>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => onEditStudent(student)}
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                title="Edit Student"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
              <button 
                onClick={() => onDeleteStudent(student.id)}
                className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500"
                title="Delete Student"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
        {students.length === 0 && (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <p>No students registered.</p>
                <p>Click the '+' button to add one.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default StudentList;
