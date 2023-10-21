/*
  Warnings:

  - You are about to drop the `ProductImages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductImages" DROP CONSTRAINT "ProductImages_product_id_fkey";

-- DropTable
DROP TABLE "ProductImages";

-- CreateTable
CREATE TABLE "AdImages" (
    "id" SERIAL NOT NULL,
    "path" TEXT NOT NULL,
    "ad_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdImages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AdImages" ADD CONSTRAINT "AdImages_ad_id_fkey" FOREIGN KEY ("ad_id") REFERENCES "Ads"("id") ON DELETE CASCADE ON UPDATE CASCADE;
