import { CaseStudyDto, CreateCaseStudyDto } from "../types";
import { http } from "./http";

export const caseStudiesApi = {
  getAllAdmin: async (): Promise<CaseStudyDto[]> => {
    const response = await http.get<CaseStudyDto[]>("/case-studies/admin/all");
    return response.data;
  },
  getById: async (id: string): Promise<CaseStudyDto> => {
    const response = await http.get<CaseStudyDto>(`/case-studies/${id}`);
    return response.data;
  },
  create: async (data: CreateCaseStudyDto): Promise<CaseStudyDto> => {
    const response = await http.post<CaseStudyDto>("/case-studies", data);
    return response.data;
  },
  update: async (
    id: string,
    data: CreateCaseStudyDto,
  ): Promise<CaseStudyDto> => {
    const response = await http.put<CaseStudyDto>(`/case-studies/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await http.delete(`/case-studies/${id}`);
  },
};
