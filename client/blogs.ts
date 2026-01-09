import { http } from './http';
import { BlogDto, CreateBlogDto } from '../types';

export const blogsApi = {
  getAll: async (): Promise<BlogDto[]> => {
    const response = await http.get<BlogDto[]>('/blogs');
    return response.data;
  },
  getById: async (id: string): Promise<BlogDto> => {
    const response = await http.get<BlogDto>(`/blogs/${id}`);
    return response.data;
  },
  create: async (data: CreateBlogDto): Promise<BlogDto> => {
    const response = await http.post<BlogDto>('/blogs', data);
    return response.data;
  },
  update: async (id: string, data: CreateBlogDto): Promise<BlogDto> => {
    const response = await http.put<BlogDto>(`/blogs/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await http.delete(`/blogs/${id}`);
  }
};