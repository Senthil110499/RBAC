import "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: "SUPERADMIN" | "ADMIN" | "USER";
        permissions: string[];
      };
    }
  }
}

export {}; // 👈 necessary to make it a module






