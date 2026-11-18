import { z } from "zod";

// Keep these rules in sync with frontend/src/validation/schemas.ts

export const ROLES = ["SUPERADMIN", "ADMIN", "USER"] as const;
// Roles that can be given out via the API / Excel import (superadmins come from the seed)
export const ASSIGNABLE_ROLES = ["ADMIN", "USER"] as const;
export const STATUSES = ["active", "Inactive"] as const;
export const PAGE_SIZES = [10, 25, 50, 100] as const;

// ---------- Field rules ----------

export const emailField = z
  .string("Email is required")
  .trim()
  .min(1, "Email is required")
  .max(254, "Email is too long")
  .pipe(z.email("Enter a valid email address"));

export const nameField = z
  .string("Name is required")
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be at most 100 characters");

export const PASSWORD_RULES_HINT =
  "At least 8 characters, with upper & lower case letters, a number and a special character.";

/** 8–64 chars, upper + lower + number + special — used only for NEW passwords */
const STRONG_PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/;

export const strongPasswordField = z
  .string("Password is required")
  .min(1, "Password is required")
  .max(64, "Password must be at most 64 characters")
  .regex(STRONG_PASSWORD_RE, PASSWORD_RULES_HINT);

const assignableRole = z.enum(ASSIGNABLE_ROLES, "Role must be ADMIN or USER");

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
  .refine((v) => !Number.isNaN(new Date(v).getTime()), "Invalid date");

// Query strings: treat `?x=` the same as "not sent"
const optionalQuery = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === "" ? undefined : v), schema.optional());

// ---------- Auth ----------

export const loginSchema = z.object({
  email: emailField,
  password: z.string("Password is required").min(1, "Password is required").max(128, "Password is too long"),
});

export const changePasswordSchema = z
  .object({
    email: emailField,
    oldPassword: z.string("Current password is required").min(1, "Current password is required"),
    newPassword: strongPasswordField,
  })
  .refine((d) => d.newPassword !== d.oldPassword, {
    message: "New password must be different from the current one",
    path: ["newPassword"],
  });

// ---------- Users ----------

export const userIdParams = z.object({
  id: z.coerce.number("Invalid user id").int("Invalid user id").positive("Invalid user id"),
});

export const createUserSchema = z.object({
  name: nameField,
  email: emailField,
  role: assignableRole,
});

export const updateUserSchema = z
  .object({
    name: nameField.optional(),
    email: emailField.optional(),
    role: assignableRole.optional(),
  })
  .refine((d) => d.name !== undefined || d.email !== undefined || d.role !== undefined, {
    message: "Nothing to update",
  });

const dateRangeQuery = {
  fromDate: optionalQuery(isoDate),
  toDate: optionalQuery(isoDate),
};

const fromBeforeTo = (d: { fromDate?: string; toDate?: string }) =>
  !d.fromDate || !d.toDate || d.fromDate <= d.toDate;

export const userFilterQuery = z
  .object({
    role: optionalQuery(z.enum(ROLES, "Invalid role")),
    status: optionalQuery(z.enum(STATUSES, "Invalid status")),
    ...dateRangeQuery,
  })
  .refine(fromBeforeTo, { message: "From date must be before To date", path: ["fromDate"] });

export const userListQuery = z
  .object({
    page: optionalQuery(z.coerce.number("Page must be a number").int().min(1, "Page must be 1 or more")),
    limit: optionalQuery(
      z.coerce
        .number("Limit must be a number")
        .refine((n) => (PAGE_SIZES as readonly number[]).includes(n), `Limit must be one of ${PAGE_SIZES.join(", ")}`)
    ),
    search: optionalQuery(z.string().trim().max(100, "Search text is too long")),
    role: optionalQuery(z.enum(ROLES, "Invalid role")),
    status: optionalQuery(z.enum(STATUSES, "Invalid status")),
    ...dateRangeQuery,
  })
  .refine(fromBeforeTo, { message: "From date must be before To date", path: ["fromDate"] });

export const statsQuery = z.object({
  period: optionalQuery(z.enum(["week", "month"], "Period must be week or month")),
});

// One row of the Excel import (header names are already lower-cased)
export const importRowSchema = z.object({
  name: z.preprocess(
    (v) => (v === undefined || v === null || String(v).trim() === "" ? null : String(v)),
    nameField.nullable()
  ),
  email: z.preprocess((v) => (v === undefined || v === null ? v : String(v)), emailField),
  role: z.preprocess(
    (v) => (v === undefined || v === null || String(v).trim() === "" ? "USER" : String(v).trim().toUpperCase()),
    assignableRole
  ),
  status: z.preprocess((v) => {
    if (v === undefined || v === null || String(v).trim() === "") return "active";
    return String(v).trim().toLowerCase() === "inactive" ? "Inactive" : String(v).trim().toLowerCase();
  }, z.enum(STATUSES, "Status must be active or inactive")),
});
