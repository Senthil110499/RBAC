import { z } from "zod";
import dayjs, { type Dayjs } from "dayjs";

// Keep these rules in sync with backend/src/validation/schemas.ts

// ---------- Field rules ----------

export const emailField = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(254, "Email is too long")
  .pipe(z.email("Enter a valid email address"));

export const nameField = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(100, "Name must be at most 100 characters");

export const PASSWORD_RULES_HINT =
  "At least 8 characters, with upper & lower case letters, a number and a special character.";

/** 8–64 chars, upper + lower + number + special */
const STRONG_PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,64}$/;

export const strongPasswordField = z
  .string()
  .min(1, "Password is required")
  .max(64, "Password must be at most 64 characters")
  .regex(STRONG_PASSWORD_RE, PASSWORD_RULES_HINT);

// ---------- Auth ----------

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Password is required").max(128, "Password is too long"),
});
export type LoginValues = z.infer<typeof loginSchema>;

// Current + new + confirm (Change Password page and Settings)
export const passwordChangeFields = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: strongPasswordField,
    confirmPassword: z.string().min(1, "Please confirm the new password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => !d.oldPassword || d.newPassword !== d.oldPassword, {
    message: "New password must be different from the current one",
    path: ["newPassword"],
  });
export type PasswordChangeValues = z.infer<typeof passwordChangeFields>;

export const changePasswordSchema = z
  .object({ email: emailField })
  .and(passwordChangeFields);
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

// ---------- Users ----------

export const userFormSchema = z.object({
  name: nameField,
  email: emailField,
  role: z.enum(["ADMIN", "USER"], "Please select a role"),
});
export type UserFormValues = z.infer<typeof userFormSchema>;

export const profileNameSchema = z.object({ name: nameField });
export type ProfileNameValues = z.infer<typeof profileNameSchema>;

// ---------- Filters ----------

const dayjsOrNull = z.custom<Dayjs | null>((v) => v === null || dayjs.isDayjs(v));

export const userFilterSchema = z
  .object({
    role: z.enum(["", "ADMIN", "USER"]),
    status: z.enum(["", "active", "Inactive"]),
    fromDate: dayjsOrNull,
    toDate: dayjsOrNull,
  })
  .refine((d) => !d.fromDate || !d.fromDate.isAfter(dayjs(), "day"), {
    message: "From date cannot be in the future",
    path: ["fromDate"],
  })
  .refine((d) => !d.toDate || !d.toDate.isAfter(dayjs(), "day"), {
    message: "To date cannot be in the future",
    path: ["toDate"],
  })
  .refine((d) => !d.fromDate || !d.toDate || !d.fromDate.isAfter(d.toDate, "day"), {
    message: "From date must be before To date",
    path: ["toDate"],
  });
export type UserFilterValues = z.infer<typeof userFilterSchema>;

// ---------- Excel import ----------

export const MAX_UPLOAD_MB = 5;
const EXCEL_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

export const uploadSchema = z.object({
  file: z
    .custom<File | null>((v) => v === null || v instanceof File)
    .refine((f): boolean => f instanceof File, "Please select an Excel file")
    .refine(
      (f) => !f || (/\.(xlsx|xls)$/i.test(f.name) && (EXCEL_TYPES.includes(f.type) || f.type === "")),
      "Only .xlsx or .xls files are allowed"
    )
    .refine((f) => !f || f.size <= MAX_UPLOAD_MB * 1024 * 1024, `File must be ${MAX_UPLOAD_MB} MB or smaller`),
});
export type UploadValues = z.infer<typeof uploadSchema>;
