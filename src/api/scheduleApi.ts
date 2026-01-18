import api from './axios';

export type Schedule = {
  id: number;
  scheduleDate: string;
  startTime: string;
  endTime: string;
  title: string;
  contents: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateScheduleRequest = {
  scheduleDate: string;
  startTime: string;
  endTime: string;
  title: string;
  contents: string;
};

export type UpdateScheduleRequest = CreateScheduleRequest;

export type ScheduleListResponse = {
  schedules: Schedule[];
  nextCursor: number;
  hasNext: boolean;
};

export type CreateScheduleResponse = {
  id: number;
  message: string;
};

export type UpdateScheduleResponse = {
  id: number;
  message: string;
};

export type DeleteScheduleResponse = {
  id: number;
  message: string;
};

export type SearchScheduleRequest = {
  keyword: string;
};

export const createSchedule = async (data: CreateScheduleRequest): Promise<CreateScheduleResponse> => {
  const response = await api.post<CreateScheduleResponse>('/schedule/create', data);
  return response.data;
};

export const updateSchedule = async (id: number, data: UpdateScheduleRequest): Promise<UpdateScheduleResponse> => {
  const response = await api.put<UpdateScheduleResponse>(`/schedule/${id}`, data);
  return response.data;
};

export const deleteSchedule = async (id: number): Promise<DeleteScheduleResponse> => {
  const response = await api.delete<DeleteScheduleResponse>(`/schedule/${id}`);
  return response.data;
};

export const getScheduleList = async (size: number = 10, nextCursor?: number): Promise<ScheduleListResponse> => {
  const params = new URLSearchParams({ size: String(size) });
  if (nextCursor) {
    params.append('nextCursor', String(nextCursor));
  }
  const response = await api.get<ScheduleListResponse>(`/schedule/list?${params.toString()}`);
  return response.data;
};

export const searchSchedules = async (keyword: string): Promise<Schedule[]> => {
  const response = await api.post<Schedule[]>('/schedule/search', { keyword });
  return response.data;
};

export const getSchedulesByDateRange = async (startDate: string, endDate: string): Promise<Schedule[]> => {
  const response = await api.get<Schedule[]>(`/schedule/range?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const getSchedulesByDate = async (date: string): Promise<Schedule[]> => {
  const response = await api.get<Schedule[]>(`/schedule/date/${date}`);
  return response.data;
};
