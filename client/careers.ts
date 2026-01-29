import { ApplicationDto, CreateJobDto, JobDto } from "../types";
import { http } from "./http";

export const careersApi = {
  // Job Endpoints
  getAllJobs: async (): Promise<JobDto[]> => {
    const response = await http.get<JobDto[]>("/careers/admin/jobs");
    return response.data;
  },
  getJobById: async (id: string): Promise<JobDto> => {
    // Note: If backend only has slug-based public fetch,
    // we might need an admin-specific getById or find in the list.
    // Assuming backend follows standard patterns:
    const response = await http.get<JobDto[]>(`/careers/admin/jobs`);
    return response.data.find((j) => j.id === id) as JobDto;
  },
  createJob: async (data: CreateJobDto): Promise<JobDto> => {
    const response = await http.post<JobDto>("/careers/jobs", data);
    return response.data;
  },
  updateJob: async (id: string, data: CreateJobDto): Promise<JobDto> => {
    const response = await http.put<JobDto>(`/careers/jobs/${id}`, data);
    return response.data;
  },
  deleteJob: async (id: string): Promise<void> => {
    await http.delete(`/careers/jobs/${id}`);
  },

  // Application Endpoints
  getJobApplications: async (jobId: string): Promise<ApplicationDto[]> => {
    const response = await http.get<ApplicationDto[]>(
      `/careers/jobs/${jobId}/applications`,
    );
    return response.data;
  },
};
