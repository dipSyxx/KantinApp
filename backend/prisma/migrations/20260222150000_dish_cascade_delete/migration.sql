-- DropForeignKey
ALTER TABLE "menu_items" DROP CONSTRAINT "menu_items_dishId_fkey";

-- AddForeignKey
ALTER TABLE "menu_items" ADD CONSTRAINT "menu_items_dishId_fkey" FOREIGN KEY ("dishId") REFERENCES "dishes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
