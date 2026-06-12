import { http } from "./http";

export const authApi = {
  login: (email: string, password: string) =>
    http.post("/auth/login", { email, password }),

  ChangePassword: (email: string, oldPassword: string, newPassword: string) =>
    http.post("/auth/change-password", { email, oldPassword, newPassword }),
};