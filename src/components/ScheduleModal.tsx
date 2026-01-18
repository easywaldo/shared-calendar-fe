import React, { useState, useEffect } from 'react';
import { createSchedule, updateSchedule, deleteSchedule, type Schedule } from '../api/scheduleApi';
import './ScheduleModal.css';

type ScheduleModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  selectedDate: Date | null;
  editSchedule: Schedule | null;
};

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  editSchedule,
}) => {
  const [scheduleDate, setScheduleDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [title, setTitle] = useState('');
  const [contents, setContents] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (editSchedule) {
      setScheduleDate(editSchedule.scheduleDate);
      setStartTime(editSchedule.startTime.substring(0, 5));
      setEndTime(editSchedule.endTime.substring(0, 5));
      setTitle(editSchedule.title);
      setContents(editSchedule.contents);
    } else if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      setScheduleDate(`${year}-${month}-${day}`);
      setStartTime('09:00');
      setEndTime('10:00');
      setTitle('');
      setContents('');
    }
    setError(null);
    setShowDeleteConfirm(false);
  }, [editSchedule, selectedDate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (startTime >= endTime) {
      setError('종료 시간은 시작 시간보다 늦어야 합니다');
      return;
    }

    setLoading(true);

    try {
      const data = {
        scheduleDate,
        startTime: startTime + ':00',
        endTime: endTime + ':00',
        title,
        contents,
      };

      if (editSchedule) {
        await updateSchedule(editSchedule.id, data);
      } else {
        await createSchedule(data);
      }

      onSave();
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || '저장에 실패했습니다');
      } else {
        setError('서버와 연결할 수 없습니다');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!editSchedule) return;

    setLoading(true);
    try {
      await deleteSchedule(editSchedule.id);
      onSave();
      onClose();
    } catch {
      setError('삭제에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editSchedule ? '일정 수정' : '새 일정'}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="scheduleDate">날짜</label>
            <input
              type="date"
              id="scheduleDate"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>시간</label>
            <div className="time-inputs">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
              <span className="time-separator">~</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title">제목</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="일정 제목을 입력하세요"
              maxLength={200}
              required
            />
            <span className="char-count">{title.length}/200</span>
          </div>

          <div className="form-group">
            <label htmlFor="contents">내용</label>
            <textarea
              id="contents"
              value={contents}
              onChange={(e) => setContents(e.target.value)}
              placeholder="일정 내용을 입력하세요"
              maxLength={2000}
              rows={4}
              required
            />
            <span className="char-count">{contents.length}/2000</span>
          </div>

          <div className="modal-actions">
            {editSchedule && !showDeleteConfirm && (
              <button
                type="button"
                className="delete-btn"
                onClick={() => setShowDeleteConfirm(true)}
              >
                삭제
              </button>
            )}

            {showDeleteConfirm && (
              <div className="delete-confirm-inline">
                <span>정말 삭제할까요?</span>
                <button type="button" onClick={handleDelete} disabled={loading}>
                  확인
                </button>
                <button type="button" onClick={() => setShowDeleteConfirm(false)}>
                  취소
                </button>
              </div>
            )}

            {!showDeleteConfirm && (
              <>
                <button type="button" className="cancel-btn" onClick={onClose}>
                  취소
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? '저장 중...' : editSchedule ? '수정' : '등록'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
