import { http } from './http';
import { ContactDto } from '../types';

export const contactsApi = {
  getAll: async (): Promise<ContactDto[]> => {
    const response = await http.get<ContactDto[]>('/contacts');
    return response.data;
  },
  getById: async (id: string): Promise<ContactDto> => {
    const response = await http.get<ContactDto>(`/contacts/${id}`);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await http.delete(`/contacts/${id}`);
  }
};