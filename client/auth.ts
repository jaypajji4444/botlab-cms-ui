import { http } from './http';

export const authApi = {
  login: async (username: string, password: string): Promise<{ token: string }> => {
    const response = await http.post('/users/login', { username, password });
    return response.data;
  },
  
  // Helper to check if API is reachable
  healthCheck: async (): Promise<boolean> => {
      try {
          await http.get('/'); 
          return true;
      } catch (e) {
          return false;
      }
  }
};
