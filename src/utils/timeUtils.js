export const formatTime = (milliseconds) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatTimeOnly = (date, use24Hour = true) => {
  const dateObj = new Date(date);
  if (use24Hour) {
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } else {
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
};

export const getPayPeriod = (date) => {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();
  
  if (day <= 15) {
    return {
      start: new Date(year, month, 1),
      end: new Date(year, month, 15),
      label: `${year}-${String(month + 1).padStart(2, '0')}-01 to ${year}-${String(month + 1).padStart(2, '0')}-15`
    };
  } else {
    const lastDay = new Date(year, month + 1, 0).getDate();
    return {
      start: new Date(year, month, 16),
      end: new Date(year, month, lastDay),
      label: `${year}-${String(month + 1).padStart(2, '0')}-16 to ${year}-${String(month + 1).padStart(2, '0')}-${lastDay}`
    };
  }
};

export const groupSessionsByPayPeriod = (sessions) => {
  const grouped = {};
  
  sessions.forEach(session => {
    const period = getPayPeriod(session.date);
    const key = period.label;
    
    if (!grouped[key]) {
      grouped[key] = {
        period,
        sessions: [],
        totalHours: 0,
        sessionCount: 0
      };
    }
    
    grouped[key].sessions.push(session);
    grouped[key].totalHours += session.duration;
    grouped[key].sessionCount += 1;
  });
  
  return grouped;
};

export const checkOverlap = (sessions, newStart, newEnd, excludeId = null) => {
  return sessions.some(session => {
    if (excludeId && session.id === excludeId) return false;
    
    const sessionStart = new Date(session.startTime);
    const sessionEnd = new Date(session.endTime);
    const checkStart = new Date(newStart);
    const checkEnd = new Date(newEnd);
    
    return (checkStart < sessionEnd && checkEnd > sessionStart);
  });
};

export const formatHoursDecimal = (milliseconds) => {
  return (milliseconds / (1000 * 60 * 60)).toFixed(2);
};