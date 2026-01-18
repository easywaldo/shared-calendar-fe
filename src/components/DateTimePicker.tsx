import React, { useState, useEffect, useRef } from 'react';
import './DateTimePicker.css';

type DateTimePickerProps = {
  label: string;
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  minTime?: string;
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  label,
  date,
  time,
  onDateChange,
  onTimeChange,
  minTime,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const pickerRef = useRef<HTMLDivElement>(null);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.matchMedia('(max-width: 768px)').matches ||
                     'ontouchstart' in window ||
                     navigator.maxTouchPoints > 0;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  // 시간을 12시간제로 변환
  const to12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? '오후' : '오전';
    const hour12 = hours % 12 || 12;
    return { hour: hour12, minute: minutes, period };
  };

  // 12시간제를 24시간제로 변환
  const to24Hour = (hour: number, minute: number, period: string) => {
    let hour24 = hour;
    if (period === '오후' && hour !== 12) hour24 = hour + 12;
    if (period === '오전' && hour === 12) hour24 = 0;
    return `${String(hour24).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  const { hour, minute, period } = to12Hour(time);

  // AM/PM 토글
  const togglePeriod = () => {
    const newPeriod = period === '오전' ? '오후' : '오전';
    onTimeChange(to24Hour(hour, minute, newPeriod));
  };

  // 시간 변경
  const handleHourChange = (newHour: number) => {
    onTimeChange(to24Hour(newHour, minute, period));
  };

  // 분 변경
  const handleMinuteChange = (newMinute: number) => {
    onTimeChange(to24Hour(hour, newMinute, period));
  };

  // 달력 날짜 생성
  const generateCalendarDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const days: (Date | null)[] = [];

    // 이전 달의 빈 칸
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // 현재 달의 날짜들
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  };

  // 날짜 선택
  const handleDateSelect = (selectedDate: Date) => {
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    onDateChange(`${year}-${month}-${day}`);
  };

  // 이전/다음 달
  const navigateMonth = (direction: number) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setViewDate(newDate);
  };

  // 포맷된 표시 문자열
  const formatDisplay = () => {
    if (!date) return '날짜/시간 선택';
    const [y, m, d] = date.split('-');
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    const dayName = WEEKDAYS[dateObj.getDay()];
    const periodIcon = period === '오전' ? '☀️' : '🌙';
    return `${m}월 ${d}일 (${dayName}) ${periodIcon} ${period} ${hour}:${String(minute).padStart(2, '0')}`;
  };

  // 모바일: native datetime-local 사용
  if (isMobile) {
    const dateTimeValue = date && time ? `${date}T${time}` : '';

    return (
      <div className="datetime-picker mobile">
        <label>{label}</label>
        <input
          type="datetime-local"
          value={dateTimeValue}
          min={minTime ? `${date}T${minTime}` : undefined}
          onChange={(e) => {
            const value = e.target.value;
            if (value) {
              const [newDate, newTime] = value.split('T');
              onDateChange(newDate);
              onTimeChange(newTime);
            }
          }}
          required
        />
      </div>
    );
  }

  // PC: 커스텀 피커
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  return (
    <div className="datetime-picker pc" ref={pickerRef}>
      <label>{label}</label>
      <div
        className="datetime-display"
        onClick={() => setShowPicker(!showPicker)}
      >
        <span className="datetime-text">{formatDisplay()}</span>
        <span className="datetime-icon">📅</span>
      </div>

      {showPicker && (
        <div className="picker-popup">
          {/* 달력 */}
          <div className="calendar-section">
            <div className="calendar-nav">
              <button type="button" onClick={() => navigateMonth(-1)}>&lt;</button>
              <span>{viewDate.getFullYear()}년 {viewDate.getMonth() + 1}월</span>
              <button type="button" onClick={() => navigateMonth(1)}>&gt;</button>
            </div>
            <div className="calendar-weekdays">
              {WEEKDAYS.map((day, i) => (
                <div key={day} className={`weekday ${i === 0 ? 'sunday' : i === 6 ? 'saturday' : ''}`}>
                  {day}
                </div>
              ))}
            </div>
            <div className="calendar-days">
              {generateCalendarDays().map((day, i) => (
                <div
                  key={i}
                  className={`calendar-day ${!day ? 'empty' : ''} ${day && `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}` === date ? 'selected' : ''} ${day && `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}` === todayStr ? 'today' : ''} ${day?.getDay() === 0 ? 'sunday' : day?.getDay() === 6 ? 'saturday' : ''}`}
                  onClick={() => day && handleDateSelect(day)}
                >
                  {day?.getDate()}
                </div>
              ))}
            </div>
          </div>

          {/* 시간 선택 */}
          <div className="time-section">
            <div className="time-label">시간</div>
            <div className="time-controls">
              {/* AM/PM 토글 */}
              <button
                type="button"
                className={`period-btn ${period === '오전' ? 'am' : 'pm'}`}
                onClick={togglePeriod}
              >
                {period === '오전' ? '☀️ 오전' : '🌙 오후'}
              </button>

              {/* 시간 선택 */}
              <div className="time-select">
                <select
                  value={hour}
                  onChange={(e) => handleHourChange(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <option key={h} value={h}>{h}시</option>
                  ))}
                </select>
                <span>:</span>
                <select
                  value={minute}
                  onChange={(e) => handleMinuteChange(Number(e.target.value))}
                >
                  {Array.from({ length: 60 }, (_, i) => i).map((m) => (
                    <option key={m} value={m}>{String(m).padStart(2, '0')}분</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="picker-confirm"
            onClick={() => setShowPicker(false)}
          >
            확인
          </button>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
