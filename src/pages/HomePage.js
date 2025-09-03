import React, { useState, useEffect } from 'react';
import { Play, Square, AlertTriangle } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { formatTime, formatTimeOnly, getPayPeriod, formatHoursDecimal } from '../utils/timeUtils';

const HomePage = () => {
  const { settings } = useSettings();
  const { darkMode, use24Hour, showCloseWarning } = settings;
  
  const [isClocked, setIsClocked] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const savedSessions = localStorage.getItem('workSessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
    
    const savedClockIn = localStorage.getItem('currentClockIn');
    if (savedClockIn) {
      const clockIn = JSON.parse(savedClockIn);
      setClockInTime(clockIn.time);
      setIsClocked(true);
      
      const elapsed = Date.now() - clockIn.time;
      if (elapsed > 12 * 60 * 60 * 1000) {
        setShowWarning(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isClocked && clockInTime) {
      localStorage.setItem('currentClockIn', JSON.stringify({ time: clockInTime }));
    } else {
      localStorage.removeItem('currentClockIn');
    }
  }, [isClocked, clockInTime]);

  useEffect(() => {
    let interval;
    if (isClocked && clockInTime) {
      interval = setInterval(() => {
        const elapsed = Date.now() - clockInTime;
        setElapsedTime(elapsed);
        
        if (elapsed > 12 * 60 * 60 * 1000 && !showWarning) {
          setShowWarning(true);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isClocked, clockInTime, showWarning]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isClocked && showCloseWarning) {
        e.preventDefault();
        e.returnValue = 'You are still clocked in. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isClocked, showCloseWarning]);

  const handleClockIn = () => {
    const now = Date.now();
    setClockInTime(now);
    setIsClocked(true);
    setElapsedTime(0);
    setShowWarning(false);
  };

  const handleClockOut = () => {
    if (!isClocked || !clockInTime) return;
    
    const now = Date.now();
    const duration = now - clockInTime;
    
    const newSession = {
      id: Date.now(),
      date: new Date(clockInTime).toISOString(),
      startTime: clockInTime,
      endTime: now,
      duration: duration,
      notes: ''
    };
    
    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    localStorage.setItem('workSessions', JSON.stringify(updatedSessions));
    
    setIsClocked(false);
    setClockInTime(null);
    setElapsedTime(0);
    setShowWarning(false);
  };

  const getCurrentPayPeriod = () => {
    const period = getPayPeriod(new Date());
    const periodSessions = sessions.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= period.start && sessionDate <= period.end;
    });
    
    const totalHours = periodSessions.reduce((acc, session) => acc + session.duration, 0);
    const sessionCount = periodSessions.length;
    
    return {
      ...period,
      totalHours,
      sessionCount
    };
  };

  const currentPeriod = getCurrentPayPeriod();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto p-6">
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-lg p-8 mb-6`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Clock In/Out
          </h2>
          
          {showWarning && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
              <div className="flex items-center">
                <AlertTriangle className="mr-2" size={20} />
                <p className="font-medium">Warning: You've been clocked in for over 12 hours!</p>
              </div>
            </div>
          )}
          
          <div className="text-center mb-8">
            <div className={`text-6xl font-mono font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              {formatTime(elapsedTime)}
            </div>
            
            {isClocked && (
              <div className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Clocked in at: {formatTimeOnly(clockInTime, use24Hour)}
              </div>
            )}
          </div>
          
          <div className="flex justify-center gap-4">
            {!isClocked ? (
              <button
                onClick={handleClockIn}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg flex items-center gap-2 transition-colors text-lg"
              >
                <Play size={24} />
                Clock In
              </button>
            ) : (
              <button
                onClick={handleClockOut}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-8 rounded-lg flex items-center gap-2 transition-colors text-lg"
              >
                <Square size={24} />
                Clock Out
              </button>
            )}
          </div>
        </div>
        
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-lg p-8`}>
          <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Current Pay Period
          </h3>
          
          <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4`}>
            <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
              Period: {currentPeriod.label}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Total Hours</div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {formatHoursDecimal(currentPeriod.totalHours)}
                </div>
              </div>
              <div>
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Sessions</div>
                <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>
                  {currentPeriod.sessionCount}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;