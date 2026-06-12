import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { Role } from "../types";

interface Props {
  children: React.ReactNode;
  roles?: Role[]; // if provided, user must be in one of these
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { user, loading } = useAuth();

  // ✅ Wait until we know if user is loaded
  if (loading) {
    return <div>Loading...</div>; // you can show a spinner instead
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
}


