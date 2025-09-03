import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronUp, Edit2, Trash2, Check, X, Download, Upload } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { formatTime, formatDate, formatTimeOnly, groupSessionsByPayPeriod, checkOverlap, formatHoursDecimal } from '../utils/timeUtils';

const HistoryPage = () => {
  const { settings } = useSettings();
  const { darkMode, use24Hour } = settings;
  
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [expandedPeriods, setExpandedPeriods] = useState(new Set());
  const [editingSession, setEditingSession] = useState(null);
  const [editForm, setEditForm] = useState({ date: '', startTime: '', endTime: '', notes: '' });
  const [filterRange, setFilterRange] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  useEffect(() => {
    const savedSessions = localStorage.getItem('workSessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('workSessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    let filtered = [...sessions];
    const now = new Date();
    
    switch (filterRange) {
      case 'twoMonths':
        const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        filtered = sessions.filter(s => new Date(s.date) >= twoMonthsAgo);
        break;
      case 'currentMonth':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = sessions.filter(s => new Date(s.date) >= monthStart);
        break;
      case 'custom':
        if (customStart && customEnd) {
          const start = new Date(customStart);
          const end = new Date(customEnd);
          end.setHours(23, 59, 59, 999);
          filtered = sessions.filter(s => {
            const sessionDate = new Date(s.date);
            return sessionDate >= start && sessionDate <= end;
          });
        }
        break;
      default:
        break;
    }
    
    setFilteredSessions(filtered.sort((a, b) => b.startTime - a.startTime));
  }, [sessions, filterRange, customStart, customEnd]);

  const togglePeriod = (period) => {
    const newExpanded = new Set(expandedPeriods);
    if (newExpanded.has(period)) {
      newExpanded.delete(period);
    } else {
      newExpanded.add(period);
    }
    setExpandedPeriods(newExpanded);
  };

  const handleEditSession = (session) => {
    setEditingSession(session.id);
    const date = new Date(session.date);
    const startDate = new Date(session.startTime);
    const endDate = new Date(session.endTime);
    
    setEditForm({
      date: date.toISOString().split('T')[0],
      startTime: `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`,
      endTime: `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`,
      notes: session.notes || ''
    });
  };

  const handleSaveEdit = () => {
    const dateStr = editForm.date;
    const startDateTime = new Date(`${dateStr}T${editForm.startTime}`);
    const endDateTime = new Date(`${dateStr}T${editForm.endTime}`);
    
    if (endDateTime <= startDateTime) {
      alert('End time must be after start time');
      return;
    }
    
    if (checkOverlap(sessions, startDateTime, endDateTime, editingSession)) {
      alert('This time period overlaps with an existing session');
      return;
    }
    
    const duration = endDateTime - startDateTime;
    
    const updatedSessions = sessions.map(session => {
      if (session.id === editingSession) {
        return {
          ...session,
          date: startDateTime.toISOString(),
          startTime: startDateTime.getTime(),
          endTime: endDateTime.getTime(),
          duration: duration,
          notes: editForm.notes
        };
      }
      return session;
    });
    
    setSessions(updatedSessions);
    setEditingSession(null);
    setEditForm({ date: '', startTime: '', endTime: '', notes: '' });
  };

  const handleDeleteSession = (id) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      setSessions(sessions.filter(session => session.id !== id));
    }
  };

  const exportData = (format) => {
    if (format === 'json') {
      const dataStr = JSON.stringify(filteredSessions, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `work-sessions-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } else if (format === 'csv') {
      const headers = ['Date', 'Start Time', 'End Time', 'Duration (hours)', 'Notes'];
      const rows = filteredSessions.map(session => [
        formatDate(session.date),
        formatTimeOnly(session.startTime, use24Hour),
        formatTimeOnly(session.endTime, use24Hour),
        formatHoursDecimal(session.duration),
        session.notes || ''
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      const dataUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      const exportFileDefaultName = `work-sessions-${new Date().toISOString().split('T')[0]}.csv`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    }
  };

  const importData = (event, shouldMerge) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSessions = JSON.parse(e.target.result);
          if (shouldMerge) {
            setSessions([...sessions, ...importedSessions]);
          } else {
            setSessions(importedSessions);
          }
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  const groupedSessions = groupSessionsByPayPeriod(filteredSessions);
  const sortedPeriods = Object.keys(groupedSessions).sort((a, b) => 
    new Date(groupedSessions[b].period.start) - new Date(groupedSessions[a].period.start)
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto p-6">
        <div className={`${darkMode ? 'bg-gray-800 text-white' : 'bg-white'} rounded-xl shadow-lg p-8 mb-6`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Session History
            </h2>
            
            <div className="flex gap-2">
              <button
                onClick={() => exportData('csv')}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download size={18} />
                Export CSV
              </button>
              
              <button
                onClick={() => exportData('json')}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download size={18} />
                Export JSON
              </button>
              
              <label className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                <Upload size={18} />
                Merge Import
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => importData(e, true)}
                  className="hidden"
                />
              </label>
              
              <label className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
                <Upload size={18} />
                Replace Import
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => importData(e, false)}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Filter Range
              </label>
              <select
                value={filterRange}
                onChange={(e) => setFilterRange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
              >
                <option value="all">All Time</option>
                <option value="twoMonths">Last 2 Months</option>
                <option value="currentMonth">Current Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            
            {filterRange === 'custom' && (
              <>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-700'
                    }`}
                  />
                </div>
              </>
            )}
          </div>
          
          <div className="space-y-4">
            {sortedPeriods.length === 0 ? (
              <p className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                No sessions found for the selected period.
              </p>
            ) : (
              sortedPeriods.map(periodKey => {
                const periodData = groupedSessions[periodKey];
                const isExpanded = expandedPeriods.has(periodKey);
                
                return (
                  <div key={periodKey} className={`border rounded-lg ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <button
                      onClick={() => togglePeriod(periodKey)}
                      className={`w-full px-4 py-3 flex justify-between items-center ${
                        darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                      } transition-colors`}
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className={darkMode ? 'text-indigo-400' : 'text-indigo-600'} size={20} />
                        <span className="font-medium">{periodKey}</span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex gap-4 text-sm">
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                            Hours: <strong>{formatHoursDecimal(periodData.totalHours)}</strong>
                          </span>
                          <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                            Sessions: <strong>{periodData.sessionCount}</strong>
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <table className="w-full">
                          <thead>
                            <tr className={`border-b ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                              <th className="text-left py-2 px-4">Date</th>
                              <th className="text-left py-2 px-4">Start</th>
                              <th className="text-left py-2 px-4">End</th>
                              <th className="text-left py-2 px-4">Duration</th>
                              <th className="text-left py-2 px-4">Notes</th>
                              <th className="text-left py-2 px-4">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {periodData.sessions.map(session => (
                              <tr key={session.id} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                                {editingSession === session.id ? (
                                  <>
                                    <td className="py-2 px-4">
                                      <input
                                        type="date"
                                        value={editForm.date}
                                        onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                                        className={`border rounded px-2 py-1 ${
                                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''
                                        }`}
                                      />
                                    </td>
                                    <td className="py-2 px-4">
                                      <input
                                        type="time"
                                        value={editForm.startTime}
                                        onChange={(e) => setEditForm({...editForm, startTime: e.target.value})}
                                        className={`border rounded px-2 py-1 ${
                                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''
                                        }`}
                                      />
                                    </td>
                                    <td className="py-2 px-4">
                                      <input
                                        type="time"
                                        value={editForm.endTime}
                                        onChange={(e) => setEditForm({...editForm, endTime: e.target.value})}
                                        className={`border rounded px-2 py-1 ${
                                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''
                                        }`}
                                      />
                                    </td>
                                    <td className="py-2 px-4">
                                      {formatTime(new Date(`2000-01-01T${editForm.endTime}`) - new Date(`2000-01-01T${editForm.startTime}`))}
                                    </td>
                                    <td className="py-2 px-4">
                                      <input
                                        type="text"
                                        value={editForm.notes}
                                        onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                                        className={`border rounded px-2 py-1 w-full ${
                                          darkMode ? 'bg-gray-700 border-gray-600 text-white' : ''
                                        }`}
                                        placeholder="Add notes..."
                                      />
                                    </td>
                                    <td className="py-2 px-4">
                                      <div className="flex gap-2">
                                        <button
                                          onClick={handleSaveEdit}
                                          className="text-green-600 hover:text-green-800"
                                        >
                                          <Check size={18} />
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingSession(null);
                                            setEditForm({ date: '', startTime: '', endTime: '', notes: '' });
                                          }}
                                          className="text-red-600 hover:text-red-800"
                                        >
                                          <X size={18} />
                                        </button>
                                      </div>
                                    </td>
                                  </>
                                ) : (
                                  <>
                                    <td className="py-2 px-4">{formatDate(session.date)}</td>
                                    <td className="py-2 px-4">{formatTimeOnly(session.startTime, use24Hour)}</td>
                                    <td className="py-2 px-4">{formatTimeOnly(session.endTime, use24Hour)}</td>
                                    <td className="py-2 px-4 font-mono">{formatTime(session.duration)}</td>
                                    <td className={`py-2 px-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {session.notes || '-'}
                                    </td>
                                    <td className="py-2 px-4">
                                      <div className="flex gap-2">
                                        <button
                                          onClick={() => handleEditSession(session)}
                                          className="text-blue-600 hover:text-blue-800"
                                        >
                                          <Edit2 size={18} />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteSession(session.id)}
                                          className="text-red-600 hover:text-red-800"
                                        >
                                          <Trash2 size={18} />
                                        </button>
                                      </div>
                                    </td>
                                  </>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryPage;