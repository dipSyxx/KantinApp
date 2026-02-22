import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const ADMIN_EMAIL = "kantine@innlandetfylke.no";
const ADMIN_NAME = "Kantine Admin";

const SCHOOLS = [
  "Elverum videregående skole",
  "Gausdal videregående skole",
  "Gjøvik videregående skole",
  "Hadeland videregående skole",
  "Hamar katedralskole",
  "Jønsberg videregående skole",
  "Lena-Valle videregående skole",
  "Lillehammer videregående skole",
  "Nord-Gudbrandsdal vidaregåande skule",
  "Nord-Østerdal videregående skole",
  "Raufoss videregående skole",
  "Ringsaker videregående skole",
  "Sentrum videregående skole",
  "Solør videregående skole",
  "Stange videregående skole",
  "Storhamar videregående skole",
  "Storsteigen videregående skole",
  "Trysil videregående skole",
  "Valdres vidaregåande skule",
  "Vinstra vidaregåande skule",
  "Øvrebyen videregående skole",
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/ø/g, "o")
    .replace(/å/g, "a")
    .replace(/æ/g, "ae")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function main() {
  console.log("Seeding schools and admin...");

  // Upsert all schools
  const schools = await Promise.all(
    SCHOOLS.map((name) =>
      prisma.school.upsert({
        where: { slug: slugify(name) },
        update: { name },
        create: { name, slug: slugify(name) },
      })
    )
  );

  const hamarSchool = schools.find((s) => s.slug === "hamar-katedralskole");
  if (!hamarSchool) throw new Error("Hamar katedralskole not found after seed");

  console.log(`Seeded ${schools.length} schools`);

  // Ensure admin account exists
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
    console.log(
      "No existing admin and no SEED_ADMIN_PASSWORD set — skipping admin creation."
    );
    return;
  }

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { schoolId: hamarSchool.id },
    create: {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: adminPasswordHash,
      role: Role.CANTEEN_ADMIN,
      schoolId: hamarSchool.id,
    },
    select: { id: true, name: true, email: true, role: true, schoolId: true },
  });

  console.log("Admin account ready:", admin);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
