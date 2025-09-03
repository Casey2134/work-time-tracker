import React, { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Clock, Hash } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { formatHoursDecimal, getPayPeriod } from '../utils/timeUtils';

const ReportsPage = () => {
  const { settings } = useSettings();
  const { darkMode } = settings;
  
  const [sessions, setSessions] = useState([]);
  const [payPeriodReports, setPayPeriodReports] = useState([]);

  useEffect(() => {
    const savedSessions = localStorage.getItem('workSessions');
    if (savedSessions) {
      const sessionsData = JSON.parse(savedSessions);
      setSessions(sessionsData);
      generateReports(sessionsData);
    }
  }, []);

  const generateReports = (sessionsData) => {
    const periodMap = new Map();
    
    sessionsData.forEach(session => {
      const period = getPayPeriod(session.date);
      const key = period.label;
      
      if (!periodMap.has(key)) {
        periodMap.set(key, {
          period,
          sessions: [],
          totalHours: 0,
          sessionCount: 0,
          dailyBreakdown: new Map()
        });
      }
      
      const periodData = periodMap.get(key);
      periodData.sessions.push(session);
      periodData.totalHours += session.duration;
      periodData.sessionCount += 1;
      
      const dateKey = new Date(session.date).toDateString();
      if (!periodData.dailyBreakdown.has(dateKey)) {
        periodData.dailyBreakdown.set(dateKey, {
          date: session.date,
          hours: 0,
          sessions: 0
        });
      }
      
      const dailyData = periodData.dailyBreakdown.get(dateKey);
      dailyData.hours += session.duration;
      dailyData.sessions += 1;
    });
    
    const reports = Array.from(periodMap.values()).sort((a, b) => 
      new Date(b.period.start) - new Date(a.period.start)
    );
    
    setPayPeriodReports(reports.slice(0, 12));
  };

  const calculateStats = () => {
    if (sessions.length === 0) return null;
    
    const totalHours = sessions.reduce((acc, s) => acc + s.duration, 0);
    const avgSessionLength = totalHours / sessions.length;
    
    const sessionsByDay = {};
    sessions.forEach(session => {
      const day = new Date(session.date).getDay();
      if (!sessionsByDay[day]) sessionsByDay[day] = 0;
      sessionsByDay[day] += session.duration;
    });
    
    const busiestDay = Object.entries(sessionsByDay).reduce((max, [day, hours]) => 
      hours > (max.hours || 0) ? { day: parseInt(day), hours } : max, {}
    );
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return {
      totalSessions: sessions.length,
      totalHours: formatHoursDecimal(totalHours),
      avgSessionLength: formatHoursDecimal(avgSessionLength),
      busiestDay: busiestDay.day !== undefined ? dayNames[busiestDay.day] : 'N/A'
    };
  };

  const stats = calculateStats();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto p-6">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Sessions</div>
                <Hash className={darkMode ? 'text-blue-400' : 'text-blue-600'} size={20} />
              </div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {stats.totalSessions}
              </div>
            </div>
            
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Hours</div>
                <Clock className={darkMode ? 'text-green-400' : 'text-green-600'} size={20} />
              </div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {stats.totalHours}
              </div>
            </div>
            
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg Session</div>
                <TrendingUp className={darkMode ? 'text-purple-400' : 'text-purple-600'} size={20} />
              </div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {stats.avgSessionLength}h
              </div>
            </div>
            
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Busiest Day</div>
                <Calendar className={darkMode ? 'text-orange-400' : 'text-orange-600'} size={20} />
              </div>
              <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                {stats.busiestDay}
              </div>
            </div>
          </div>
        )}
        
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-lg p-8`}>
          <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Pay Period Reports
          </h2>
          
          {payPeriodReports.length === 0 ? (
            <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No data available for reports.
            </p>
          ) : (
            <div className="space-y-4">
              {payPeriodReports.map((report, index) => {
                const dailyBreakdown = Array.from(report.dailyBreakdown.values()).sort(
                  (a, b) => new Date(a.date) - new Date(b.date)
                );
                
                return (
                  <div key={report.period.label} className={`border rounded-lg ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className={`p-4 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{report.period.label}</h3>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                            {new Date(report.period.start).toLocaleDateString()} - {new Date(report.period.end).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                            {formatHoursDecimal(report.totalHours)} hours
                          </div>
                          <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {report.sessionCount} sessions
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-2">
                        {dailyBreakdown.map(day => (
                          <div
                            key={day.date}
                            className={`text-center p-2 rounded ${
                              day.hours > 0 
                                ? darkMode 
                                  ? 'bg-indigo-900 text-indigo-200' 
                                  : 'bg-indigo-100 text-indigo-800'
                                : darkMode
                                  ? 'bg-gray-700 text-gray-500'
                                  : 'bg-gray-100 text-gray-400'
                            }`}
                          >
                            <div className="text-xs font-medium">
                              {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                            </div>
                            <div className="text-sm">
                              {new Date(day.date).getDate()}
                            </div>
                            {day.hours > 0 && (
                              <div className="text-xs mt-1">
                                {formatHoursDecimal(day.hours)}h
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;