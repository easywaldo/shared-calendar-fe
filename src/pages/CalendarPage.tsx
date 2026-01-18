import React, { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Calendar from '../components/Calendar';
import ScheduleModal from '../components/ScheduleModal';
import { getSchedulesByDateRange, searchSchedules, type Schedule } from '../api/scheduleApi';
import './CalendarPage.css';

const CalendarPage: React.FC = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [editSchedule, setEditSchedule] = useState<Schedule | null>(null);
  const [currentRange, setCurrentRange] = useState<{ start: Date; end: Date } | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, logout } = useAuth();

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchSchedules = useCallback(async (start: Date, end: Date) => {
    if (isSearching) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getSchedulesByDateRange(formatDate(start), formatDate(end));
      setSchedules(data);
    } catch {
      setError('일정을 불러오는데 실패했습니다');
    } finally {
      setLoading(false);
    }
  }, [isSearching]);

  const handleRangeChange = useCallback((start: Date, end: Date) => {
    setCurrentRange({ start, end });
    fetchSchedules(start, end);
  }, [fetchSchedules]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setEditSchedule(null);
    setIsModalOpen(true);
  };

  const handleScheduleClick = (schedule: Schedule) => {
    setEditSchedule(schedule);
    setSelectedDate(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditSchedule(null);
    setSelectedDate(null);
  };

  const handleSave = () => {
    if (currentRange) {
      fetchSchedules(currentRange.start, currentRange.end);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      handleClearSearch();
      return;
    }

    try {
      setLoading(true);
      setIsSearching(true);
      setError(null);
      const results = await searchSchedules(searchKeyword);
      setSchedules(results);
    } catch {
      setError('검색에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    setIsSearching(false);
    if (currentRange) {
      fetchSchedules(currentRange.start, currentRange.end);
    }
  };

  return (
    <div className="calendar-page">
      <header className="page-header">
        <div className="header-top">
          <h1>Shared Calendar</h1>
          <div className="user-info">
            <span>{user?.name}님</span>
            <button className="logout-btn" onClick={logout}>
              로그아웃
            </button>
          </div>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="일정 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="search-btn" onClick={handleSearch}>
            검색
          </button>
          {isSearching && (
            <button className="clear-btn" onClick={handleClearSearch}>
              초기화
            </button>
          )}
        </div>
      </header>

      <main className="page-content">
        {error && <div className="alert alert-error">{error}</div>}

        {loading && schedules.length === 0 && (
          <div className="loading">로딩 중...</div>
        )}

        {isSearching && schedules.length === 0 && !loading && (
          <div className="empty-state">
            <p>검색 결과가 없습니다</p>
          </div>
        )}

        {isSearching && schedules.length > 0 && (
          <div className="search-results">
            <h3>검색 결과 ({schedules.length}건)</h3>
            <div className="schedule-list">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className="schedule-card"
                  onClick={() => handleScheduleClick(schedule)}
                >
                  <div className="schedule-date">{schedule.scheduleDate}</div>
                  <div className="schedule-time">
                    {schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}
                  </div>
                  <div className="schedule-title">{schedule.title}</div>
                  <div className="schedule-contents">{schedule.contents}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isSearching && (
          <Calendar
            schedules={schedules}
            onDateSelect={handleDateSelect}
            onScheduleClick={handleScheduleClick}
            onRangeChange={handleRangeChange}
          />
        )}
      </main>

      <button className="fab" onClick={() => handleDateSelect(new Date())}>
        <span>+</span>
      </button>

      <ScheduleModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        selectedDate={selectedDate}
        editSchedule={editSchedule}
      />
    </div>
  );
};

export default CalendarPage;
