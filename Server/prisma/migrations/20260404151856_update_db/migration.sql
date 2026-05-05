/*
  Warnings:

  - You are about to drop the column `audio` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `receiverID` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `senderID` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `text` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Message` table. All the data in the column will be lost.
  - Added the required column `ciphertext` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nonce` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `receiverDeviceId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `senderDeviceId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_receiverID_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderID_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "audio",
DROP COLUMN "image",
DROP COLUMN "receiverID",
DROP COLUMN "senderID",
DROP COLUMN "text",
DROP COLUMN "updatedAt",
ADD COLUMN     "ciphertext" TEXT NOT NULL,
ADD COLUMN     "nonce" TEXT NOT NULL,
ADD COLUMN     "receiverDeviceId" TEXT NOT NULL,
ADD COLUMN     "senderDeviceId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderDeviceId_fkey" FOREIGN KEY ("senderDeviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_receiverDeviceId_fkey" FOREIGN KEY ("receiverDeviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
