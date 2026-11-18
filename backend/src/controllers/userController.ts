import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";

import { PrismaClient } from "@prisma/client";
import { generateToken } from "../utils/token";
import { sendAccountCreatedMail } from "../utils/mailer";
const prisma = new PrismaClient();
import { Prisma } from "@prisma/client";
import { importRowSchema } from "../validation/schemas";

const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
  return new Date(now.setDate(diff));
};

const getStartOfMonth = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

const findDuplicateName = async (name: string, excludeId?: number) => {
  return prisma.user.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludeId !== undefined ? { id: { not: excludeId } } : {}),
    },
  });
};

const duplicateConflictMessage = (nameTaken: boolean, emailTaken: boolean) => {
  if (nameTaken && emailTaken) return "User already exists";
  if (nameTaken) return "User name already exists";
  if (emailTaken) return "User email already exists";
  return null;
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, role } = req.body; // validated by createUserSchema

    const [existingByEmail, existingByName] = await Promise.all([
      prisma.user.findUnique({ where: { email } }),
      findDuplicateName(name),
    ]);

    const conflict = duplicateConflictMessage(!!existingByName, !!existingByEmail);
    if (conflict) {
      return res.status(400).json({ message: conflict });
    }

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashed = await bcrypt.hash(tempPassword, 10);

    const permissions =
      role === "SUPERADMIN"
        ? ["read", "write", "update", "delete"]
        : role === "ADMIN"
        ? ["read", "write", "update"]
        : ["read"];

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        permissions: permissions || [],
        password: hashed,
      },
    });

    // Generate token & login link
    const token = generateToken(user);
    const loginLink = `${process.env.FRONTEND_URL}/login`;

    // Email content
    let emailContent = `
      <div style="max-width:600px;
                  margin:20px auto;
                  padding:20px;
                  border-radius:12px;
                  border:1px solid #ddd;
                  box-shadow:0 4px 12px rgba(0,0,0,0.1);
                  font-family:Arial, sans-serif;
                  background:#ffffff;">
        <h2 style="color:#333;
                   text-align:center;">Welcome, ${name} 🎉</h2>
        <p style="color:#555;
                font-size:14px;">
          Your account has been created successfully. You can log in using the button below.
        </p>
        <div style="text-align:center;
                    margin:20px 0;">
          <a href="${loginLink}"
             style="display:inline-block;
                    background:#4CAF50;
                    color:#fff;
                    padding:12px 20px;
                    border-radius:6px;
                    text-decoration:none;
                    font-weight:bold;">
            Login Here
          </a>
        </div>
    `;

    if (tempPassword) {
      emailContent += `
        <p style="color:#555;
                font-size:14px;">
          Your temporary password is:
          <b style="color:#000;">${tempPassword}</b>
        </p>
      `;
    }

    emailContent += `</div>`;

    await sendAccountCreatedMail(email, "Your Account Has Been Created", emailContent);

    res.status(201).json({ message: "User created and email sent", user });
  } catch (error) {
    console.error("CreateUser Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


const PAGE_SIZES = [10, 25, 50, 100];

// Never send password hashes to the client
const userListSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  permissions: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

// GET /users
//   - without `page`: full list (used by the dashboard)
//   - with `page`: paginated list → { data, total, page, limit, totalPages }
//     query: page, limit (10 | 25 | 50 | 100), search, role, status, fromDate, toDate
export const getUsers = async (req: Request, res: Response) => {
  try {
    if (req.query.page === undefined) {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: "asc" },
        select: userListSelect,
      });
      return res.json(users);
    }

    const page = Math.max(1, parseInt(String(req.query.page), 10) || 1);
    const requestedLimit = parseInt(String(req.query.limit), 10);
    const limit = PAGE_SIZES.includes(requestedLimit) ? requestedLimit : PAGE_SIZES[0];

    const { search, role, status, fromDate, toDate } = req.query;

    // Superadmins are never listed in the users table
    const where: Prisma.UserWhereInput = { role: { not: "SUPERADMIN" } };
    if (role && role !== "SUPERADMIN") where.role = String(role);
    if (status) where.status = { equals: String(status), mode: "insensitive" };
    if (search && String(search).trim()) {
      const term = String(search).trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { email: { contains: term, mode: "insensitive" } },
      ];
    }
    if (fromDate && toDate) {
      const from = new Date(String(fromDate));
      from.setHours(0, 0, 0, 0);
      const to = new Date(String(toDate));
      to.setHours(23, 59, 59, 999);
      where.createdAt = { gte: from, lte: to };
    }

    const [total, users] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip: (page - 1) * limit,
        take: limit,
        select: userListSelect,
      }),
    ]);

    res.json({
      data: users,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};


export const toggleUser = async (req: Request, res: Response) => {

  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const status = user.status === "active" ? "Inactive" : "active";
    const updated = await prisma.user.update({ where: { id: Number(id) }, data: { status } });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const updateUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const { name, email, role } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!existingUser) {
    return res.status(404).json({ message: "User not found" });
  }

  // Determine new permissions based on role
  let permissions = existingUser.permissions; // default: keep old permissions
  if (role) {
    permissions =
          role === "SUPERADMIN"
            ? [
                "read",
                "write",
                "update",
                "delete",
              ]
            : role === "ADMIN"
            ? ["read", "write", "update"]
            : ["read"];
  }

  const nextName = name ?? existingUser.name;
  const nextEmail = email ?? existingUser.email;

  const nameChanged =
    typeof nextName === "string" &&
    nextName.toLowerCase() !== (existingUser.name ?? "").toLowerCase();
  const emailChanged = nextEmail !== existingUser.email;

  const [existingByEmail, existingByName] = await Promise.all([
    emailChanged
      ? prisma.user.findUnique({ where: { email: nextEmail } })
      : Promise.resolve(null),
    nameChanged && typeof nextName === "string"
      ? findDuplicateName(nextName, userId)
      : Promise.resolve(null),
  ]);

  const conflict = duplicateConflictMessage(!!existingByName, !!existingByEmail);
  if (conflict) {
    return res.status(400).json({ message: conflict });
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: nextName,
      email: nextEmail,
      role: role ?? existingUser.role,
      permissions,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      permissions: true,
    },
  });

  res.json({
    message: "User updated successfully",
    user: updatedUser,
  });
};


export const deleteUser = async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);

  const existingUser = await prisma.user.findUnique({ where: { id: userId } });

  if (!existingUser) {
    return res.status(404).json({ message: "User not found" });
  }

  await prisma.user.delete({ where: { id: userId } });

  res.json({ message: "User deleted successfully" });
};


export const getUserRole = async (req: Request, res: Response) => {
  try {
    const { period } = req.query; // "week" | "month" | undefined

    let dateFilter: Date | undefined;
    if (period === "week") dateFilter = getStartOfWeek();
    if (period === "month") dateFilter = getStartOfMonth();

    const roles = await prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
      where: dateFilter ? { createdAt: { gte: dateFilter } } : undefined,
    });

    const result: Record<string, number> = {};
    roles.forEach((r) => {
      result[r.role] = r._count.role;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch role stats", error: err });
  }
};

export const getUserStatus = async (req: Request, res: Response) => {
  try {
    const { period } = req.query; // "week" | "month" | undefined

    let dateFilter: Date | undefined;
    if (period === "week") dateFilter = getStartOfWeek();
    if (period === "month") dateFilter = getStartOfMonth();

    const whereClause = dateFilter
      ? { createdAt: { gte: dateFilter } }
      : {};

    const activeCount = await prisma.user.count({
      where: { status: "active", ...whereClause },
    });

    const InactiveCount = await prisma.user.count({
      where: { status: "Inactive", ...whereClause },
    });

    res.json({ Active: activeCount, Inactive: InactiveCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch status stats", error: err });
  }
};


export const uploadExcel = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Excel → JSON
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // START: Header validation

    const USER_MODEL_FIELDS = Prisma.dmmf.datamodel.models
      .find((m) => m.name === "User")!
      .fields.map((f) => f.name.toLowerCase());
    
    const sheetAsArray: any[][] = XLSX.utils.sheet_to_json(sheet, {header: 1,}) as any[];

    if (!sheetAsArray || sheetAsArray.length === 0) {
      return res.status(400).json({ error: "Excel file is empty or malformed" });
    }

    const rawHeaders: any[] = sheetAsArray[0];
    if (!rawHeaders || rawHeaders.length === 0) {
      return res.status(400).json({ error: "Excel file has no header row" });
    }

    const headers = rawHeaders.map((h: any) =>
      typeof h === "string" ? h.trim().toLowerCase() : String(h).trim().toLowerCase()
    );

    const unexpected = headers.filter((h: string) => !USER_MODEL_FIELDS.includes(h));
    if (unexpected.length > 0) {
      return res.status(400).json({
        error: `Unexpected column(s): ${unexpected.join(", ")}. Allowed: ${USER_MODEL_FIELDS.join(", ")}`,
      });
    }

    const required = ["email", "role"];
    const missingRequired = required.filter((r) => !headers.includes(r));
    if (missingRequired.length > 0) {
      return res
        .status(400)
        .json({ error: `Missing required column(s): ${missingRequired.join(", ")}` });
    }
    // END: Header validation 

    const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

    if (!jsonData.length) {
      return res.status(400).json({ error: "Excel file is empty" });
    }

    // Validate every row first; reject the whole file if any row is invalid
    const rowErrors: string[] = [];
    const validRows: { name: string | null; email: string; role: string; status: string }[] = [];
    const seenEmails = new Set<string>();

    jsonData.forEach((raw, index) => {
      const row = Object.fromEntries(
        Object.entries(raw).map(([k, v]) => [k.trim().toLowerCase(), v])
      );
      const rowNumber = index + 2; // +1 for header, +1 for 1-based rows
      const parsed = importRowSchema.safeParse(row);
      if (!parsed.success) {
        rowErrors.push(`Row ${rowNumber}: ${parsed.error.issues[0].message}`);
        return;
      }
      const key = parsed.data.email.toLowerCase();
      if (seenEmails.has(key)) {
        rowErrors.push(`Row ${rowNumber}: duplicate email ${parsed.data.email}`);
        return;
      }
      seenEmails.add(key);
      validRows.push(parsed.data);
    });

    if (rowErrors.length) {
      const shown = rowErrors.slice(0, 10).join("; ");
      const more = rowErrors.length > 10 ? ` (+${rowErrors.length - 10} more)` : "";
      return res.status(400).json({ error: `Invalid rows: ${shown}${more}`, errors: rowErrors });
    }

    // Prepare all users
    const usersToCreate: any[] = [];
    const emailJobs: Promise<any>[] = [];

    for (const row of validRows) {
      const { name, email, role } = row;

      // generate temp password
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashed = await bcrypt.hash(tempPassword, 10);

      const permissions =
        role === "SUPERADMIN"
          ? ["read", "write", "update", "delete"]
          : role === "ADMIN"
          ? ["read", "write", "update"]
          : ["read"];

      // push to bulk insert array
      usersToCreate.push({
        name,
        email,
        role,
        permissions,
        password: hashed,
        status: row.status,
      });

      // prepare email
      const loginLink = `${process.env.FRONTEND_URL}/login`;

      let emailContent = `
        <div style="max-width:600px;
                    margin:20px auto;
                    padding:20px;border-radius:12px;
                    border:1px solid #ddd;
                    box-shadow:0 4px 12px rgba(0,0,0,0.1);
                    font-family:Arial,sans-serif;
                    background:#fff;">
          <h2 style="color:#333;
                     text-align:center;">Welcome, ${name} 🎉</h2>
          <p style="color:#555;
                    font-size:14px;">Your account has been created successfully. You can log in using the button below.</p>
          <div style="text-align:center;
                      margin:20px 0;">
            <a href="${loginLink}" style="display:inline-block;
                                          background:#4CAF50;
                                          color:#fff;
                                          padding:12px 20px;
                                          border-radius:6px;
                                          text-decoration:none;
                                          font-weight:bold;">Login Here</a>
          </div>
          <p style="color:#555;
                    font-size:14px;">Your temporary password is:
            <b style="color:#000;">${tempPassword}</b>
          </p>
        </div>`;

      emailJobs.push(sendAccountCreatedMail(email, "Your Account Has Been Created", emailContent));
    }

    // Bulk insert (skip duplicates so existing users are ignored)
    await prisma.user.createMany({
      data: usersToCreate,
      skipDuplicates: true,
    });

    // Send all emails in parallel (non-blocking for DB)
    await Promise.all(emailJobs);

    return res.json({
      message: "Users uploaded and emails sent successfully",
      count: usersToCreate.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ error: "Failed to upload users" });
  }
};


// userController.ts
export const downloadUsers = async (req: Request, res: Response) => {
  try {
    const { role, status, fromDate, toDate } = req.query;

    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;
    if (fromDate && toDate) {
      const from = new Date(fromDate as string);
      from.setHours(0, 0, 0, 0); // start of day

      const to = new Date(toDate as string);
      to.setHours(23, 59, 59, 999); // end of day

      where.createdAt = {
        gte: from,
        lte: to,
      };
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    if (!users.length) {
      return res
        .status(404)
        .json({ error: "No users found for given filters" });
    }

    // Convert users → plain JSON for Excel
    const formatted = users.map((u, index) => ({
      "S.No": index + 1,
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Status: u.status,
      CreatedAt: u.createdAt.toISOString().split("T")[0],
    }));

    const worksheet = XLSX.utils.json_to_sheet(formatted);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=users_list.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (error) {
    console.error("Error downloading users:", error);
    res.status(500).json({ error: "Failed to download users" });
  }
};
