import { http } from './http';
import { CreatePortfolioDto, PortfolioDto, ResolvedPortfolioDto } from '../types';

export const portfoliosApi = {
  getAll: async (): Promise<PortfolioDto[]> => {
    const response = await http.get<PortfolioDto[]>('/portfolios');
    return response.data;
  },
  getById: async (id: string): Promise<PortfolioDto> => {
    const response = await http.get<PortfolioDto>(`/portfolios/${id}`);
    return response.data;
  },
  getBySlug: async (slug: string): Promise<ResolvedPortfolioDto> => {
    const response = await http.get<ResolvedPortfolioDto>(`/portfolios/slug/${slug}`);
    return response.data;
  },
  create: async (data: CreatePortfolioDto): Promise<PortfolioDto> => {
    const response = await http.post<PortfolioDto>('/portfolios', data);
    return response.data;
  },
  update: async (id: string, data: CreatePortfolioDto): Promise<PortfolioDto> => {
    const response = await http.put<PortfolioDto>(`/portfolios/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<PortfolioDto> => {
    const response = await http.delete<PortfolioDto>(`/portfolios/${id}`);
    return response.data;
  }
};