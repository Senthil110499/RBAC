import { http } from "./http";
import type { IUser, Role } from "../types";

export const userApi = {
  getAll: () => http.get<IUser[]>("/users"),

  create: (payload: { name?: string | null; email: string; role: Role }) =>
    http.post("/users/create", payload),

  toggleStatus: (id: number) => http.patch<IUser>(`/users/status/${id}`),

  update: (id: number, payload: { name?: string; email?: string; role?: Role }) =>
    http.put<IUser>(`/users/${id}`, payload),

  delete: (id: number) => http.delete(`/users/${id}`),

  getRoleStats: (period?: "week" | "month") =>
    http.get(`/users/roles${period ? `?period=${period}` : ""}`),

  getStatusStats: (period?: "week" | "month") =>
    http.get(`/users/status${period ? `?period=${period}` : ""}`),
  
  uploadExcel: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return http.post("/users/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // downloadExcel: () =>
  //   http.get("/users/download", { responseType: "blob" }),

 downloadExcel: (filters?: { role?: string; status?: string; fromDate?: string; toDate?: string }) =>
    http.get("/users/download", {
      params: filters,
      responseType: "blob",
    }),

};
