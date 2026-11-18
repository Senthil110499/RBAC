import { Request, Response, NextFunction } from "express";
import multer from "multer";
import { z } from "zod";

interface RequestSchemas {
  params?: z.ZodType;
  query?: z.ZodType;
  body?: z.ZodType;
}

export interface FieldError {
  field: string;
  message: string;
}

export const toFieldErrors = (error: z.ZodError): FieldError[] =>
  error.issues.map((issue) => ({
    field: issue.path.join(".") || "form",
    message: issue.message,
  }));

// Validates params / query / body with Zod before the controller runs.
// On failure → 400 { message: <first error>, errors: [{ field, message }] }
export const validate = (schemas: RequestSchemas) => (req: Request, res: Response, next: NextFunction) => {
  const errors: FieldError[] = [];

  for (const key of ["params", "query", "body"] as const) {
    const schema = schemas[key];
    if (!schema) continue;

    const result = schema.safeParse(req[key] ?? {});
    if (!result.success) {
      errors.push(...toFieldErrors(result.error));
    } else if (key === "body") {
      // trimmed / normalised values for the controller (req.query & req.params are read-only in Express 5)
      req.body = result.data;
    }
  }

  if (errors.length) {
    return res.status(400).json({ message: errors[0].message, errors });
  }
  next();
};

// ---------- Excel upload ----------

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB
const EXCEL_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const okExtension = /\.(xlsx|xls)$/i.test(file.originalname);
    if (okExtension && EXCEL_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "file"));
  },
}).single("file");

// Single .xlsx/.xls file (max 5 MB) in the "file" field
export const validateExcelUpload = (req: Request, res: Response, next: NextFunction) => {
  excelUpload(req, res, (err: unknown) => {
    if (err instanceof multer.MulterError) {
      const message =
        err.code === "LIMIT_FILE_SIZE"
          ? "File is too large (max 5 MB)"
          : "Only one .xlsx or .xls file can be uploaded";
      return res.status(400).json({ message, error: message });
    }
    if (err) return next(err);
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded", error: "No file uploaded" });
    }
    next();
  });
};
