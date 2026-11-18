import type { FieldValues, Path, UseFormSetError } from "react-hook-form";

interface ServerFieldError {
  field: string;
  message: string;
}

// Backend validation errors look like { message, errors: [{ field, message }] }.
// Puts each one on the matching form field; returns true if any were applied.
export function applyServerErrors<T extends FieldValues>(
  err: unknown,
  setError: UseFormSetError<T>,
  fields: readonly Path<T>[]
): boolean {
  const errors = (err as { response?: { data?: { errors?: ServerFieldError[] } } })?.response?.data?.errors;
  if (!Array.isArray(errors)) return false;

  let applied = false;
  for (const e of errors) {
    if (typeof e?.field === "string" && (fields as readonly string[]).includes(e.field)) {
      setError(e.field as Path<T>, { type: "server", message: e.message });
      applied = true;
    }
  }
  return applied;
}

export const serverMessage = (err: unknown, fallback: string): string => {
  const data = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
  return data?.message || data?.error || fallback;
};
