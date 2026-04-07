import { CreateUserDto, UserDto } from "../types";
import { http } from "./http";

export const usersApi = {
  getAll: async (): Promise<UserDto[]> => {
    const response = await http.get<UserDto[]>("/users");
    return response.data;
  },
  register: async (data: CreateUserDto): Promise<UserDto> => {
    const response = await http.post<UserDto>("/users/register", data);
    return response.data;
  },
};
