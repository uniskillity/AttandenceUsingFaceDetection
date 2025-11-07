
import React from 'react';
import { CameraIcon, DashboardIcon } from './icons';

interface HeaderProps {
  currentView: 'camera' | 'dashboard';
  setCurrentView: (view: 'camera' | 'dashboard') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
  const activeClass = "bg-blue-600 text-white";
  const inactiveClass = "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600";

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
      <h1 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
        Smart Attendance System
      </h1>
      <nav className="flex space-x-2">
        <button
          onClick={() => setCurrentView('dashboard')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'dashboard' ? activeClass : inactiveClass}`}
        >
          <DashboardIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Dashboard</span>
        </button>
        <button
          onClick={() => setCurrentView('camera')}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'camera' ? activeClass : inactiveClass}`}
        >
          <CameraIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Camera</span>
        </button>
      </nav>
    </header>
  );
};

export default Header;
