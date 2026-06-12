export type Role = "SUPERADMIN" | "ADMIN" | "USER";
export type Status = "active" | "Inactive";

export interface User {
  [x: string]: any;
  id?: number;
  name?: string | null;
  email: string;
  role: Role;
}

export interface IUser extends User {
  status: Status;
  createdAt: string;
}