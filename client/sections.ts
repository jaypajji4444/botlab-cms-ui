import { http } from './http';
import { CreateSectionDto, SectionDto } from '../types';

export const sectionsApi = {
  getAll: async (): Promise<SectionDto[]> => {
    const response = await http.get<SectionDto[]>('/sections');
    return response.data;
  },
  getById: async (id: string): Promise<SectionDto> => {
    const response = await http.get<SectionDto>(`/sections/${id}`);
    return response.data;
  },
  create: async (data: CreateSectionDto): Promise<SectionDto> => {
    const response = await http.post<SectionDto>('/sections', data);
    return response.data;
  },
  update: async (id: string, data: CreateSectionDto): Promise<SectionDto> => {
    const response = await http.put<SectionDto>(`/sections/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<SectionDto> => {
    const response = await http.delete<SectionDto>(`/sections/${id}`);
    return response.data;
  }
};
