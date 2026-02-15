import { PrismaClient, Role, MenuStatus, Category, ItemStatus } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Users ───────────────────────────────────────────
  const passwordHash = await hash("password123", 10);

  const student = await prisma.user.upsert({
    where: { email: "vladislav@hkskole.no" },
    update: {},
    create: {
      name: "Vladislav Reznichenko",
      email: "vladislav@hkskole.no",
      password: passwordHash,
      role: Role.STUDENT,
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "kantine@hkskole.no" },
    update: {},
    create: {
      name: "Kantine Admin",
      email: "kantine@hkskole.no",
      password: passwordHash,
      role: Role.CANTEEN_ADMIN,
    },
  });

  console.log(`  Created users: ${student.name}, ${admin.name}`);

  // ─── Dishes ──────────────────────────────────────────
  const dishes = await Promise.all([
    prisma.dish.create({
      data: {
        title: "Wok med nudler, kylling og grønnsaker",
        description: "En smakfull wok med kylling, nudler og en mix av friske grønnsaker.",
        imageUrl: "https://images.unsplash.com/photo-1569058242567-93de6f36f8eb?w=600",
        allergens: ["gluten", "soya", "egg"],
        tags: ["popular"],
      },
    }),
    prisma.dish.create({
      data: {
        title: "Kebab",
        description: "Saftig kebab med friske grønnsaker, dressing og varmt brød.",
        imageUrl: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600",
        allergens: ["gluten", "melk"],
        tags: [],
      },
    }),
    prisma.dish.create({
      data: {
        title: "Kjøttboller med tomatsaus og pasta",
        description: "Hjemmelagde kjøttboller i en rik tomatsaus servert med pasta.",
        imageUrl: "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=600",
        allergens: ["gluten", "melk", "egg"],
        tags: [],
      },
    }),
    prisma.dish.create({
      data: {
        title: "Chili con carne tortillachips",
        description: "Krydret chili con carne med nachos, rømme og ost.",
        imageUrl: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600",
        allergens: ["melk"],
        tags: ["spicy"],
      },
    }),
    prisma.dish.create({
      data: {
        title: "Pizza",
        description: "Nystekt pizza med mozzarella, tomatsaus og valgfrie toppinger.",
        imageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600",
        allergens: ["gluten", "melk"],
        tags: ["popular"],
      },
    }),
    prisma.dish.create({
      data: {
        title: "Vegetarisk curry med ris",
        description: "Kremet curry med kikerter, spinat og basmatiris.",
        imageUrl: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=600",
        allergens: [],
        tags: ["vegan", "halal"],
      },
    }),
    prisma.dish.create({
      data: {
        title: "Fiskesuppe",
        description: "Tradisjonell norsk fiskesuppe med laks, torsk og grønnsaker.",
        imageUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600",
        allergens: ["fisk", "melk"],
        tags: [],
      },
    }),
    prisma.dish.create({
      data: {
        title: "Kanelsnurrer",
        description: "Nybakte kanelsnurrer med glasur.",
        imageUrl: "https://images.unsplash.com/photo-1509365390695-33aee754301f?w=600",
        allergens: ["gluten", "melk", "egg"],
        tags: ["dessert"],
      },
    }),
  ]);

  console.log(`  Created ${dishes.length} dishes`);

  // ─── Week menu ───────────────────────────────────────
  // Get current ISO week info
  const now = new Date();
  const jan4 = new Date(now.getFullYear(), 0, 4);
  const dayOfYear = Math.floor(
    (now.getTime() - jan4.getTime()) / 86400000 + jan4.getDay() + 1
  );
  const currentWeek = Math.ceil(dayOfYear / 7);
  const currentYear = now.getFullYear();

  const weekMenu = await prisma.weekMenu.create({
    data: {
      year: currentYear,
      weekNumber: currentWeek,
      status: MenuStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });

  console.log(`  Created week menu: ${currentYear} W${currentWeek}`);

  // ─── Menu days (Mon–Fri of current week) ─────────────
  const monday = new Date(now);
  const dayOfWeek = monday.getDay(); // 0=Sun, 1=Mon
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  const dayNames = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"];
  const menuDays = [];

  for (let i = 0; i < 5; i++) {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);

    const menuDay = await prisma.menuDay.create({
      data: {
        date,
        weekMenuId: weekMenu.id,
        isOpen: true,
        notes: dayNames[i],
      },
    });
    menuDays.push(menuDay);
  }

  console.log(`  Created ${menuDays.length} menu days`);

  // ─── Menu items (assign dishes to days) ──────────────
  const assignments = [
    // Monday
    { dayIndex: 0, dishIndex: 0, category: Category.MAIN },
    { dayIndex: 0, dishIndex: 5, category: Category.VEG },
    // Tuesday
    { dayIndex: 1, dishIndex: 1, category: Category.MAIN },
    { dayIndex: 1, dishIndex: 6, category: Category.SOUP },
    // Wednesday
    { dayIndex: 2, dishIndex: 2, category: Category.MAIN },
    { dayIndex: 2, dishIndex: 5, category: Category.VEG },
    // Thursday
    { dayIndex: 3, dishIndex: 3, category: Category.MAIN },
    { dayIndex: 3, dishIndex: 7, category: Category.DESSERT },
    // Friday
    { dayIndex: 4, dishIndex: 4, category: Category.MAIN },
    { dayIndex: 4, dishIndex: 1, category: Category.MAIN },
    { dayIndex: 4, dishIndex: 7, category: Category.DESSERT },
  ];

  let itemCount = 0;
  for (const { dayIndex, dishIndex, category } of assignments) {
    await prisma.menuItem.create({
      data: {
        menuDayId: menuDays[dayIndex].id,
        dishId: dishes[dishIndex].id,
        price: category === Category.DESSERT ? 20 : 50,
        category,
        status: ItemStatus.ACTIVE,
        sortOrder: itemCount,
      },
    });
    itemCount++;
  }

  console.log(`  Created ${itemCount} menu items`);

  // ─── Sample votes ────────────────────────────────────
  const allMenuItems = await prisma.menuItem.findMany();
  let voteCount = 0;

  for (const item of allMenuItems.slice(0, 3)) {
    await prisma.vote.create({
      data: {
        menuItemId: item.id,
        userId: student.id,
        value: 1,
      },
    });
    voteCount++;
  }

  console.log(`  Created ${voteCount} sample votes`);
  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
