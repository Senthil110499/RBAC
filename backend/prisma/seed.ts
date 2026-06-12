import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("senthil123", 10);

  await prisma.user.upsert({
    where: { email: "ssenthil8760650010@gmail.com" },
    update: {},
    create: {
      name: "Senthil",
      email: "ssenthil8760650010@gmail.com",
      password: hashedPassword,
      role: Role.SUPERADMIN,
      permissions: ["read", "write", "update", "delete"],
    },
  });

  console.log("Seeding complete!");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
