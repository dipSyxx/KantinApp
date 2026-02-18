import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "kantine@innlandetfylke.no";
const ADMIN_NAME = "Kantine Admin";

async function main() {
  console.log("Starting production cleanup seed...");

  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    select: { password: true },
  });

  const adminPasswordHash =
    existingAdmin?.password ??
    (process.env.SEED_ADMIN_PASSWORD
      ? await hash(process.env.SEED_ADMIN_PASSWORD, 10)
      : null);

  if (!adminPasswordHash) {
    throw new Error(
      "No existing admin password found. Set SEED_ADMIN_PASSWORD to create the admin account."
    );
  }

  // Remove all app data from Prisma models.
  await prisma.$transaction([
    prisma.vote.deleteMany(),
    prisma.menuItem.deleteMany(),
    prisma.menuDay.deleteMany(),
    prisma.weekMenu.deleteMany(),
    prisma.dish.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.verificationToken.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const admin = await prisma.user.create({
    data: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: adminPasswordHash,
      role: Role.CANTEEN_ADMIN,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  console.log("Cleanup complete.");
  console.log("Admin account is ready:");
  console.log(admin);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
