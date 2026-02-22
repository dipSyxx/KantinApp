-- CreateEnum: add SUPER_ADMIN to Role
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- CreateTable: schools
CREATE TABLE "schools" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "schools_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "schools_slug_key" ON "schools"("slug");

-- Seed the default school so existing data can reference it
INSERT INTO "schools" ("id", "name", "slug", "createdAt")
VALUES ('default_hamar', 'Hamar katedralskole', 'hamar-katedralskole', CURRENT_TIMESTAMP);

-- Add schoolId to users (nullable, backfill, then keep nullable for SUPER_ADMIN)
ALTER TABLE "users" ADD COLUMN "schoolId" TEXT;
UPDATE "users" SET "schoolId" = 'default_hamar' WHERE "schoolId" IS NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_schoolId_fkey"
    FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add schoolId to week_menus (nullable first, backfill, then make required)
ALTER TABLE "week_menus" ADD COLUMN "schoolId" TEXT;
UPDATE "week_menus" SET "schoolId" = 'default_hamar' WHERE "schoolId" IS NULL;
ALTER TABLE "week_menus" ALTER COLUMN "schoolId" SET NOT NULL;
ALTER TABLE "week_menus" ADD CONSTRAINT "week_menus_schoolId_fkey"
    FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Drop old unique constraint on week_menus and create new one with schoolId
ALTER TABLE "week_menus" DROP CONSTRAINT IF EXISTS "week_menus_year_weekNumber_key";
CREATE UNIQUE INDEX "week_menus_year_weekNumber_schoolId_key"
    ON "week_menus"("year", "weekNumber", "schoolId");

-- Add schoolId to dishes (nullable first, backfill, then make required)
ALTER TABLE "dishes" ADD COLUMN "schoolId" TEXT;
UPDATE "dishes" SET "schoolId" = 'default_hamar' WHERE "schoolId" IS NULL;
ALTER TABLE "dishes" ALTER COLUMN "schoolId" SET NOT NULL;
ALTER TABLE "dishes" ADD CONSTRAINT "dishes_schoolId_fkey"
    FOREIGN KEY ("schoolId") REFERENCES "schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- MenuDay: drop old unique on date, add composite unique on (weekMenuId, date)
DROP INDEX IF EXISTS "menu_days_date_key";
CREATE UNIQUE INDEX "menu_days_weekMenuId_date_key" ON "menu_days"("weekMenuId", "date");

-- Add schoolId to verification_tokens
ALTER TABLE "verification_tokens" ADD COLUMN "schoolId" TEXT NOT NULL DEFAULT 'default_hamar';
ALTER TABLE "verification_tokens" ALTER COLUMN "schoolId" DROP DEFAULT;
