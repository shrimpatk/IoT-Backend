/*
  Warnings:

  - Made the column `groceryItemId` on table `ShoppingListItem` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ShoppingListItem" DROP CONSTRAINT "ShoppingListItem_groceryItemId_fkey";

-- AlterTable
ALTER TABLE "ShoppingListItem" ALTER COLUMN "groceryItemId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_groceryItemId_fkey" FOREIGN KEY ("groceryItemId") REFERENCES "GroceryItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
