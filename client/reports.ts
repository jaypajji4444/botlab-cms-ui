import { CreateReportDto, ReportDto } from "../types";
import { http } from "./http";

export const reportsApi = {
  getAll: async (): Promise<ReportDto[]> => {
    const response = await http.get<ReportDto[]>("/reports");
    return response.data;
  },
  getById: async (id: string): Promise<ReportDto> => {
    const response = await http.get<ReportDto>(`/reports/${id}`);
    return response.data;
  },
  create: async (data: CreateReportDto): Promise<ReportDto> => {
    const response = await http.post<ReportDto>("/reports", data);
    return response.data;
  },
  update: async (id: string, data: CreateReportDto): Promise<ReportDto> => {
    const response = await http.put<ReportDto>(`/reports/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await http.delete(`/reports/${id}`);
  },
};
