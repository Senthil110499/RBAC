import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";

import { PrismaClient } from "@prisma/client";
import { generateToken } from "../utils/token";
import { sendAccountCreatedMail } from "../utils/mailer";
const prisma = new PrismaClient();
import { Prisma } from "@prisma/client";

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

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, role } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    let tempPassword: string | null = null;

    if (!user) {
      // Generate a temporary password
      tempPassword = Math.random().toString(36).slice(-8);
        const hashed = await bcrypt.hash(tempPassword, 10);
        
        const permissions =
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

      // Create user
      user = await prisma.user.create({
        data: {
          name,
          email,
          role,
          permissions: permissions || [],
          password: hashed,
        },
      });
    } else {
      return res.status(400).json({ message: "User already exists" });
    }

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


export const getUsers = async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
  });
  res.json(users);
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

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name ?? existingUser.name,
      email: email ?? existingUser.email,
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

    // Prepare all users
    const usersToCreate: any[] = [];
    const emailJobs: Promise<any>[] = [];

    for (const row of jsonData) {
      const name = row.name || null;
      const email = row.email;
      const role = row.role?.toUpperCase() || "USER";

      if (!email || !role) continue; // skip invalid rows

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
        status: row.status?.toLowerCase() || "active",
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
