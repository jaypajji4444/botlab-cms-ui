import { http } from './http';
import { CreatePageDto, PageDto, ResolvedPageDto } from '../types';

export const pagesApi = {
  getAll: async (): Promise<PageDto[]> => {
    const response = await http.get<PageDto[]>('/pages');
    return response.data;
  },
  getById: async (id: string): Promise<PageDto> => {
    const response = await http.get<PageDto>(`/pages/${id}`);
    return response.data;
  },
  getResolvedById: async (id: string): Promise<ResolvedPageDto> => {
    const response = await http.get<ResolvedPageDto>(`/pages/resolved/${id}`);
    return response.data;
  },
  create: async (data: CreatePageDto): Promise<PageDto> => {
    const response = await http.post<PageDto>('/pages', data);
    return response.data;
  },
  update: async (id: string, data: CreatePageDto): Promise<PageDto> => {
    const response = await http.put<PageDto>(`/pages/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<PageDto> => {
    const response = await http.delete<PageDto>(`/pages/${id}`);
    return response.data;
  }
};
