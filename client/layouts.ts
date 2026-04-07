import { CreateLayoutDto, LayoutDto } from "../types";
import { http } from "./http";

export const layoutsApi = {
  getAll: async (): Promise<LayoutDto[]> => {
    const response = await http.get<LayoutDto[]>("/layouts");
    return response.data;
  },
  getByType: async (type: string): Promise<LayoutDto[]> => {
    const response = await http.get<LayoutDto[]>(`/layouts?type=${type}`);
    return response.data;
  },
  getById: async (id: string): Promise<LayoutDto> => {
    const response = await http.get<LayoutDto>(`/layouts/${id}`);
    return response.data;
  },
  getBySlug: async (slug: string): Promise<LayoutDto> => {
    const response = await http.get<LayoutDto>(`/layouts/slug/${slug}`);
    return response.data;
  },
  create: async (data: CreateLayoutDto): Promise<LayoutDto> => {
    const response = await http.post<LayoutDto>("/layouts", data);
    return response.data;
  },
  update: async (id: string, data: CreateLayoutDto): Promise<LayoutDto> => {
    const response = await http.put<LayoutDto>(`/layouts/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<LayoutDto> => {
    const response = await http.delete<LayoutDto>(`/layouts/${id}`);
    return response.data;
  },
};
