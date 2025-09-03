import React from 'react';
import { Moon, Sun, Clock, AlertTriangle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const SettingsPage = () => {
  const { settings, updateSetting } = useSettings();
  const { darkMode, use24Hour, showCloseWarning } = settings;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-6">
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-lg p-8`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Settings
          </h2>
          
          <div className="space-y-6">
            <div className={`border rounded-lg p-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Appearance
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {darkMode ? <Moon size={20} className="text-indigo-400" /> : <Sun size={20} className="text-yellow-500" />}
                  <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Dark Mode
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Toggle between light and dark theme
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => updateSetting('darkMode', !darkMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    darkMode ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      darkMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className={`border rounded-lg p-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Time Display
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock size={20} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                  <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      24-Hour Format
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Display time in 24-hour format (e.g., 14:30 instead of 2:30 PM)
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => updateSetting('use24Hour', !use24Hour)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    use24Hour ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      use24Hour ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className={`border rounded-lg p-6 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                Notifications
              </h3>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle size={20} className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} />
                  <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Browser Close Warning
                    </div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Show warning when closing browser while clocked in
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => updateSetting('showCloseWarning', !showCloseWarning)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showCloseWarning ? 'bg-indigo-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showCloseWarning ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
            
            <div className={`border rounded-lg p-6 ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                About
              </h3>
              
              <div className={`space-y-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <p>Work Time Tracker v1.0.0</p>
                <p>A simple and efficient time tracking application for managing your work hours.</p>
                <p className="mt-4">Features:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>Clock in/out functionality</li>
                  <li>Pay period tracking (1-15, 16-end of month)</li>
                  <li>Session history with editing capabilities</li>
                  <li>Detailed reports and analytics</li>
                  <li>Import/export data in JSON and CSV formats</li>
                  <li>Dark mode support</li>
                  <li>24-hour time format option</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;