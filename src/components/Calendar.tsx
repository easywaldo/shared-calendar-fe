import React, { useState, useEffect, useCallback } from 'react';
import { type Schedule } from '../api/scheduleApi';
import './Calendar.css';

type ViewMode = 'month' | 'week' | 'day';

type CalendarProps = {
  schedules: Schedule[];
  onDateSelect: (date: Date) => void;
  onScheduleClick: (schedule: Schedule) => void;
  onRangeChange: (startDate: Date, endDate: Date) => void;
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const Calendar: React.FC<CalendarProps> = ({
  schedules,
  onDateSelect,
  onScheduleClick,
  onRangeChange,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDateRange = useCallback((date: Date, mode: ViewMode): { start: Date; end: Date } => {
    const start = new Date(date);
    const end = new Date(date);

    if (mode === 'month') {
      start.setDate(1);
      start.setDate(start.getDate() - start.getDay());
      end.setMonth(end.getMonth() + 1, 0);
      end.setDate(end.getDate() + (6 - end.getDay()));
    } else if (mode === 'week') {
      start.setDate(start.getDate() - start.getDay());
      end.setDate(start.getDate() + 6);
    } else {
      // day mode - just the single day
    }

    return { start, end };
  }, []);

  useEffect(() => {
    const { start, end } = getDateRange(currentDate, viewMode);
    onRangeChange(start, end);
  }, [currentDate, viewMode, onRangeChange, getDateRange]);

  const navigate = (direction: number) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getSchedulesForDate = (date: Date): Schedule[] => {
    const dateStr = formatDate(date);
    return schedules.filter((s) => s.scheduleDate === dateStr);
  };

  const formatTime = (time: string) => time.substring(0, 5);

  const getHeaderTitle = (): string => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    if (viewMode === 'month') {
      return `${year}년 ${month}월`;
    } else if (viewMode === 'week') {
      const { start, end } = getDateRange(currentDate, 'week');
      const startMonth = start.getMonth() + 1;
      const endMonth = end.getMonth() + 1;
      if (startMonth === endMonth) {
        return `${year}년 ${startMonth}월 ${start.getDate()}일 - ${end.getDate()}일`;
      }
      return `${start.getMonth() + 1}월 ${start.getDate()}일 - ${end.getMonth() + 1}월 ${end.getDate()}일`;
    } else {
      return `${year}년 ${month}월 ${currentDate.getDate()}일 (${WEEKDAYS[currentDate.getDay()]})`;
    }
  };

  const renderMonthView = () => {
    const { start: rangeStart } = getDateRange(currentDate, 'month');
    const weeks: Date[][] = [];
    const current = new Date(rangeStart);

    for (let w = 0; w < 6; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }

    const today = new Date();
    const todayStr = formatDate(today);

    return (
      <div className="month-view">
        <div className="weekday-header">
          {WEEKDAYS.map((day, i) => (
            <div key={day} className={`weekday ${i === 0 ? 'sunday' : i === 6 ? 'saturday' : ''}`}>
              {day}
            </div>
          ))}
        </div>
        <div className="month-grid">
          {weeks.map((week, wi) => (
            <div key={wi} className="week-row">
              {week.map((date, di) => {
                const dateStr = formatDate(date);
                const isToday = dateStr === todayStr;
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const daySchedules = getSchedulesForDate(date);

                return (
                  <div
                    key={di}
                    className={`day-cell ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''} ${di === 0 ? 'sunday' : di === 6 ? 'saturday' : ''}`}
                    onClick={() => onDateSelect(date)}
                  >
                    <span className="day-number">{date.getDate()}</span>
                    <div className="day-schedules">
                      {daySchedules.slice(0, 2).map((schedule) => (
                        <div
                          key={schedule.id}
                          className="schedule-dot"
                          onClick={(e) => {
                            e.stopPropagation();
                            onScheduleClick(schedule);
                          }}
                        >
                          <span className="dot"></span>
                          <span className="schedule-title-mini">{schedule.title}</span>
                        </div>
                      ))}
                      {daySchedules.length > 2 && (
                        <div className="more-schedules">+{daySchedules.length - 2}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const { start: weekStart } = getDateRange(currentDate, 'week');
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      days.push(d);
    }

    const today = new Date();
    const todayStr = formatDate(today);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="week-view">
        <div className="week-header">
          <div className="time-gutter"></div>
          {days.map((date, i) => {
            const dateStr = formatDate(date);
            const isToday = dateStr === todayStr;
            return (
              <div
                key={i}
                className={`week-day-header ${isToday ? 'today' : ''} ${i === 0 ? 'sunday' : i === 6 ? 'saturday' : ''}`}
                onClick={() => onDateSelect(date)}
              >
                <span className="weekday-name">{WEEKDAYS[i]}</span>
                <span className="day-num">{date.getDate()}</span>
              </div>
            );
          })}
        </div>
        <div className="week-body">
          <div className="time-column">
            {hours.map((hour) => (
              <div key={hour} className="time-slot-label">
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>
          <div className="days-columns">
            {days.map((date, di) => {
              const daySchedules = getSchedulesForDate(date);
              return (
                <div key={di} className="day-column" onClick={() => onDateSelect(date)}>
                  {hours.map((hour) => (
                    <div key={hour} className="hour-cell"></div>
                  ))}
                  {daySchedules.map((schedule) => {
                    const [startH, startM] = schedule.startTime.split(':').map(Number);
                    const [endH, endM] = schedule.endTime.split(':').map(Number);
                    const top = (startH + startM / 60) * 48;
                    const height = ((endH - startH) + (endM - startM) / 60) * 48;

                    return (
                      <div
                        key={schedule.id}
                        className="week-schedule-item"
                        style={{ top: `${top}px`, minHeight: `${Math.max(height, 40)}px` }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onScheduleClick(schedule);
                        }}
                      >
                        <span className="schedule-time">{formatTime(schedule.startTime)}</span>
                        <span className="schedule-title">{schedule.title}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const daySchedules = getSchedulesForDate(currentDate);
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="day-view">
        <div className="day-body">
          <div className="time-column">
            {hours.map((hour) => (
              <div key={hour} className="time-slot-label">
                {String(hour).padStart(2, '0')}:00
              </div>
            ))}
          </div>
          <div className="day-content" onClick={() => onDateSelect(currentDate)}>
            {hours.map((hour) => (
              <div key={hour} className="hour-cell"></div>
            ))}
            {daySchedules.map((schedule) => {
              const [startH, startM] = schedule.startTime.split(':').map(Number);
              const [endH, endM] = schedule.endTime.split(':').map(Number);
              const top = (startH + startM / 60) * 60;
              const height = ((endH - startH) + (endM - startM) / 60) * 60;

              return (
                <div
                  key={schedule.id}
                  className="day-schedule-item"
                  style={{ top: `${top}px`, minHeight: `${Math.max(height, 60)}px` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onScheduleClick(schedule);
                  }}
                >
                  <div className="schedule-header">
                    <span className="schedule-time">
                      {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                    </span>
                  </div>
                  <span className="schedule-title">{schedule.title}</span>
                  <p className="schedule-contents">{schedule.contents}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <div className="header-left">
          <button className="today-btn" onClick={goToToday}>
            오늘
          </button>
          <div className="nav-buttons">
            <button onClick={() => navigate(-1)}>&lt;</button>
            <button onClick={() => navigate(1)}>&gt;</button>
          </div>
          <h2 className="header-title">{getHeaderTitle()}</h2>
        </div>
        <div className="view-mode-selector">
          <button
            className={viewMode === 'month' ? 'active' : ''}
            onClick={() => setViewMode('month')}
          >
            월
          </button>
          <button
            className={viewMode === 'week' ? 'active' : ''}
            onClick={() => setViewMode('week')}
          >
            주
          </button>
          <button
            className={viewMode === 'day' ? 'active' : ''}
            onClick={() => setViewMode('day')}
          >
            일
          </button>
        </div>
      </div>
      <div className="calendar-body">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>
    </div>
  );
};

export default Calendar;
