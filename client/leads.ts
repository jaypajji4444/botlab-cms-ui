import { http } from './http';
import { LeadDto } from '../types';

export const leadsApi = {
    getAll: async (): Promise<LeadDto[]> => {
        const response = await http.get<LeadDto[]>('/leads');
        return response.data;
    },
    getById: async (id: string): Promise<LeadDto> => {
        const response = await http.get<LeadDto>(`/leads/${id}`);
        return response.data;
    },
    delete: async (id: string): Promise<void> => {
        await http.delete(`/leads/${id}`);
    }
};
