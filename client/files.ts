
import { http } from './http';

export interface FileUploadResponse {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
  type: string;
}

export const filesApi = {
  uploadImage: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await http.post<FileUploadResponse>('/files/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  uploadVideo: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await http.post<FileUploadResponse>('/files/upload/video', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
    uploadFile: async (file: File): Promise<FileUploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await http.post<FileUploadResponse>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};
