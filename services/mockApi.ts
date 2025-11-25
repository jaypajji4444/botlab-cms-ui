import axios from 'axios';
import { PageDto, SectionDto, CreatePageDto, CreateSectionDto } from '../types';

// API Configuration
const API_URL = 'http://localhost:3006';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2OTI1OGE2MjU4MWVkODE0Y2E4YzJiMmQiLCJ1c2VybmFtZSI6InN0cmluZyIsImlhdCI6MTc2NDA2Nzk0NCwiZXhwIjoxNzY0MTU0MzQ0fQ.2sLQPkKQpSytkdiEO3yAUJov8Aed7OnGoVOwckRHQ6Q';

const client = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// Response interceptor for consistent error handling if needed
client.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const api = {
  sections: {
    getAll: async (): Promise<SectionDto[]> => {
      const response = await client.get<SectionDto[]>('/sections');
      return response.data;
    },
    getById: async (id: string): Promise<SectionDto | undefined> => {
      try {
        const response = await client.get<SectionDto>(`/sections/${id}`);
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) return undefined;
        throw error;
      }
    },
    create: async (data: CreateSectionDto): Promise<SectionDto> => {
      const response = await client.post<SectionDto>('/sections', data);
      return response.data;
    },
    update: async (id: string, data: CreateSectionDto): Promise<SectionDto> => {
      const response = await client.put<SectionDto>(`/sections/${id}`, data);
      return response.data;
    },
    delete: async (id: string): Promise<void> => {
      await client.delete(`/sections/${id}`);
    }
  },
  pages: {
    getAll: async (): Promise<PageDto[]> => {
      const response = await client.get<PageDto[]>('/pages');
      return response.data;
    },
    getById: async (id: string): Promise<PageDto | undefined> => {
      try {
        const response = await client.get<PageDto>(`/pages/${id}`);
        return response.data;
      } catch (error: any) {
         if (error.response?.status === 404) return undefined;
         throw error;
      }
    },
    create: async (data: CreatePageDto): Promise<PageDto> => {
      const response = await client.post<PageDto>('/pages', data);
      return response.data;
    },
    update: async (id: string, data: CreatePageDto): Promise<PageDto> => {
      const response = await client.put<PageDto>(`/pages/${id}`, data);
      return response.data;
    },
    delete: async (id: string): Promise<void> => {
      await client.delete(`/pages/${id}`);
    }
  }
};