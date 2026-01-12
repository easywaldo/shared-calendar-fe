import api from './axios';

export type SignUpRequest = {
  memberId: string;
  password: string;
  name: string;
  email: string;
};

export type SignUpResponse = {
  id: number;
  memberId: string;
  name: string;
  email: string;
  message: string;
};

export type ErrorResponse = {
  code: string;
  message: string;
};

export const signUp = async (data: SignUpRequest): Promise<SignUpResponse> => {
  const response = await api.post<SignUpResponse>('/members/signup', data);
  return response.data;
};
