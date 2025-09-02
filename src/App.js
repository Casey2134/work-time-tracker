import React, { useState, useEffect } from 'react';
import { Play, Pause, RefreshCw, Clock, Calendar, TrendingUp, Download, Upload, Trash2, Edit2, Check, X } from 'lucide-react';

const WorkTimeTracker = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessions, setSessions] = useState([]);
  const [showStats, setShowStats] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [editForm, setEditForm] = useState({ date: '', startTime: '', endTime: '', notes: '' });

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
    let interval;
    if (isRunning && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, startTime]);

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTimeOnly = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStart = () => {
    setIsRunning(true);
    setStartTime(Date.now());
    setElapsedTime(0);
  };

  const handleStop = () => {
    if (isRunning && startTime) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const newSession = {
        id: Date.now(),
        date: new Date(startTime).toISOString(),
        startTime: startTime,
        endTime: endTime,
        duration: duration,
        notes: ''
      };
      
      setSessions([...sessions, newSession]);
      setIsRunning(false);
      setStartTime(null);
      setElapsedTime(0);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setStartTime(null);
    setElapsedTime(0);
  };

  const handleDeleteSession = (id) => {
    setSessions(sessions.filter(session => session.id !== id));
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
    const updatedSessions = sessions.map(session => {
      if (session.id === editingSession) {
        const dateStr = editForm.date;
        const startDateTime = new Date(`${dateStr}T${editForm.startTime}`);
        const endDateTime = new Date(`${dateStr}T${editForm.endTime}`);
        const duration = endDateTime - startDateTime;
        
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

  const handleCancelEdit = () => {
    setEditingSession(null);
    setEditForm({ date: '', startTime: '', endTime: '', notes: '' });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `work-sessions-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedSessions = JSON.parse(e.target.result);
          setSessions([...sessions, ...importedSessions]);
        } catch (error) {
          alert('Invalid file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const calculateStats = () => {
    const today = new Date().toDateString();
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date();
    thisMonth.setMonth(thisMonth.getMonth() - 1);

    const todayTotal = sessions
      .filter(s => new Date(s.date).toDateString() === today)
      .reduce((acc, s) => acc + s.duration, 0);

    const weekTotal = sessions
      .filter(s => new Date(s.date) >= thisWeek)
      .reduce((acc, s) => acc + s.duration, 0);

    const monthTotal = sessions
      .filter(s => new Date(s.date) >= thisMonth)
      .reduce((acc, s) => acc + s.duration, 0);

    const allTimeTotal = sessions.reduce((acc, s) => acc + s.duration, 0);

    return { todayTotal, weekTotal, monthTotal, allTimeTotal };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
            <Clock className="text-indigo-600" />
            Work Time Tracker
          </h1>

          <div className="text-center mb-8">
            <div className="text-6xl font-mono font-bold text-gray-800 mb-6">
              {formatTime(elapsedTime)}
            </div>

            <div className="flex gap-4 justify-center">
              {!isRunning ? (
                <button
                  onClick={handleStart}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Play size={20} />
                  Start
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Pause size={20} />
                  Stop & Save
                </button>
              )}
              
              <button
                onClick={handleReset}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg flex items-center gap-2 transition-colors"
                disabled={!isRunning && elapsedTime === 0}
              >
                <RefreshCw size={20} />
                Reset
              </button>
            </div>
          </div>

          <div className="flex gap-4 justify-center mb-6">
            <button
              onClick={() => setShowStats(!showStats)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors"
            >
              <TrendingUp size={18} />
              {showStats ? 'Hide' : 'Show'} Statistics
            </button>
            
            <button
              onClick={exportData}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download size={18} />
              Export
            </button>
            
            <label className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 transition-colors cursor-pointer">
              <Upload size={18} />
              Import
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>
          </div>

          {showStats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Today</div>
                <div className="text-xl font-bold text-blue-600">{formatTime(stats.todayTotal)}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">This Week</div>
                <div className="text-xl font-bold text-green-600">{formatTime(stats.weekTotal)}</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">This Month</div>
                <div className="text-xl font-bold text-purple-600">{formatTime(stats.monthTotal)}</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">All Time</div>
                <div className="text-xl font-bold text-orange-600">{formatTime(stats.allTimeTotal)}</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calendar className="text-indigo-600" />
            Session History
          </h2>

          {sessions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sessions recorded yet. Start tracking your work time!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4">Date</th>
                    <th className="text-left py-3 px-4">Start Time</th>
                    <th className="text-left py-3 px-4">End Time</th>
                    <th className="text-left py-3 px-4">Duration</th>
                    <th className="text-left py-3 px-4">Notes</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.slice().reverse().map((session) => (
                    <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                      {editingSession === session.id ? (
                        <>
                          <td className="py-3 px-4">
                            <input
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                              className="border rounded px-2 py-1"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="time"
                              value={editForm.startTime}
                              onChange={(e) => setEditForm({...editForm, startTime: e.target.value})}
                              className="border rounded px-2 py-1"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="time"
                              value={editForm.endTime}
                              onChange={(e) => setEditForm({...editForm, endTime: e.target.value})}
                              className="border rounded px-2 py-1"
                            />
                          </td>
                          <td className="py-3 px-4">
                            {formatTime(new Date(`2000-01-01T${editForm.endTime}`) - new Date(`2000-01-01T${editForm.startTime}`))}
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={editForm.notes}
                              onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                              className="border rounded px-2 py-1 w-full"
                              placeholder="Add notes..."
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              <button
                                onClick={handleSaveEdit}
                                className="text-green-600 hover:text-green-800"
                              >
                                <Check size={18} />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 px-4">{formatDate(session.date)}</td>
                          <td className="py-3 px-4">{formatTimeOnly(session.startTime)}</td>
                          <td className="py-3 px-4">{formatTimeOnly(session.endTime)}</td>
                          <td className="py-3 px-4 font-mono">{formatTime(session.duration)}</td>
                          <td className="py-3 px-4 text-gray-600">{session.notes || '-'}</td>
                          <td className="py-3 px-4">
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
      </div>
    </div>
  );
};

export default WorkTimeTracker;