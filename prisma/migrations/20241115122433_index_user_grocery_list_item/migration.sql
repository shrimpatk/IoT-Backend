/*
  Warnings:

  - You are about to drop the column `userId` on the `ShoppingList` table. All the data in the column will be lost.
  - Added the required column `name` to the `ShoppingList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ownerId` to the `ShoppingList` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addedById` to the `ShoppingListItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ShoppingList" DROP COLUMN "userId",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "ownerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ShoppingListItem" ADD COLUMN     "addedById" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ShoppingListItem_shoppingListId_groceryItemId_addedById_idx" ON "ShoppingListItem"("shoppingListId", "groceryItemId", "addedById");

-- AddForeignKey
ALTER TABLE "ShoppingList" ADD CONSTRAINT "ShoppingList_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShoppingListItem" ADD CONSTRAINT "ShoppingListItem_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
