import axios from "axios";
import type { CandidatesResponse } from "../hooks/useCandidates";

const TOKEN_STORAGE_KEY = "gestion_candidats_token";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const buildQueryParams = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.append(key, String(value));
    }
  });

  return searchParams.toString();
};

export const getCandidates = async (
  page = 1,
  filters: { search?: string; status?: string; limit?: number } = {}
): Promise<CandidatesResponse> => {
  const query = buildQueryParams({
    page,
    limit: filters.limit ?? 10,
    search: filters.search,
    status: filters.status
  });
  const res = await api.get(`/candidates?${query}`);
  return res.data;
};

export const getCandidate = async (id: string) => {
  const res = await api.get(`/candidates/${id}`);
  return res.data;
};

export const login = async (data: any) => {
  const res = await api.post(`/candidates/login`, data);

  if (res.data?.token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, res.data.token);
  }

  return res.data;
};

export const logout = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
};

export const createCandidate = async (data: any) => {
  const res = await api.post(`/candidates`, data);
  return res.data;
};

export const updateCandidate = async (id: string, data: any) => {
  const res = await api.put(`/candidates/${id}`, data);
  return res.data;
};

export const validateCandidate = async (id: string) => {
  const res = await api.post(`/candidates/${id}/validate`);
  return res.data;
};

export const deleteCandidate = async (id: string) => {
  const res = await api.delete(`/candidates/${id}`);
  return res.data;
};