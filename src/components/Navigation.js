import React from 'react';
import { NavLink } from 'react-router-dom';
import { Clock, History, FileText, Settings } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const Navigation = () => {
  const { settings } = useSettings();
  const { darkMode } = settings;

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      isActive
        ? darkMode
          ? 'bg-indigo-600 text-white'
          : 'bg-indigo-500 text-white'
        : darkMode
        ? 'text-gray-300 hover:bg-gray-700'
        : 'text-gray-700 hover:bg-gray-100'
    }`;

  return (
    <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Clock className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} size={28} />
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Work Time Tracker
            </h1>
          </div>
          
          <div className="flex gap-2">
            <NavLink to="/" className={navLinkClass}>
              <Clock size={20} />
              <span>Clock</span>
            </NavLink>
            
            <NavLink to="/history" className={navLinkClass}>
              <History size={20} />
              <span>History</span>
            </NavLink>
            
            <NavLink to="/reports" className={navLinkClass}>
              <FileText size={20} />
              <span>Reports</span>
            </NavLink>
            
            <NavLink to="/settings" className={navLinkClass}>
              <Settings size={20} />
              <span>Settings</span>
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;