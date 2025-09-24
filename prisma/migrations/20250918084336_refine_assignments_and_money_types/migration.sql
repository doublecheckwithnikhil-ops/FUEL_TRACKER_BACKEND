/*
  Warnings:

  - You are about to alter the column `odometerReading` on the `FuelEntry` table. The data in that column could be lost. The data in that column will be cast from `Float(53)` to `Decimal(10,2)`.
  - You are about to alter the column `quantity` on the `FuelEntry` table. The data in that column could be lost. The data in that column will be cast from `Float(53)` to `Decimal(10,3)`.
  - You are about to alter the column `ratePerLitre` on the `FuelEntry` table. The data in that column could be lost. The data in that column will be cast from `Float(53)` to `Decimal(10,3)`.
  - You are about to alter the column `amount` on the `FuelEntry` table. The data in that column could be lost. The data in that column will be cast from `Float(53)` to `Decimal(12,2)`.
  - You are about to alter the column `validTill` on the `PetroCard` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `DateTime2`.
  - Made the column `createdAt` on table `FuelEntry` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `PetroCard` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- DropForeignKey
ALTER TABLE [dbo].[FuelEntry] DROP CONSTRAINT [FuelEntry_cardId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[PetroCard] DROP CONSTRAINT [PetroCard_issuedToDriverId_fkey];

-- DropForeignKey
ALTER TABLE [dbo].[Vehicle] DROP CONSTRAINT [Vehicle_assignedDriverId_fkey];

-- AlterTable
ALTER TABLE [dbo].[FuelEntry] ALTER COLUMN [odometerReading] DECIMAL(10,2) NOT NULL;
ALTER TABLE [dbo].[FuelEntry] ALTER COLUMN [quantity] DECIMAL(10,3) NOT NULL;
ALTER TABLE [dbo].[FuelEntry] ALTER COLUMN [ratePerLitre] DECIMAL(10,3) NOT NULL;
ALTER TABLE [dbo].[FuelEntry] ALTER COLUMN [amount] DECIMAL(12,2) NOT NULL;
ALTER TABLE [dbo].[FuelEntry] ALTER COLUMN [createdAt] DATETIME2 NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[PetroCard] ALTER COLUMN [validTill] DATETIME2 NOT NULL;
ALTER TABLE [dbo].[PetroCard] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [PetroCard_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[updatedAt] DATETIME2 NOT NULL;

-- AlterTable
ALTER TABLE [dbo].[Vehicle] ADD [createdAt] DATETIME2 NOT NULL CONSTRAINT [Vehicle_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
[updatedAt] DATETIME2 NOT NULL;

-- CreateIndex
CREATE NONCLUSTERED INDEX [FuelEntry_vehicleId_idx] ON [dbo].[FuelEntry]([vehicleId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [FuelEntry_driverId_idx] ON [dbo].[FuelEntry]([driverId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [FuelEntry_cardId_idx] ON [dbo].[FuelEntry]([cardId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [FuelEntry_createdAt_idx] ON [dbo].[FuelEntry]([createdAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PetroCard_issuedToDriverId_idx] ON [dbo].[PetroCard]([issuedToDriverId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [User_roleId_idx] ON [dbo].[User]([roleId]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [User_designationName_idx] ON [dbo].[User]([designationName]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [User_storeCode_idx] ON [dbo].[User]([storeCode]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Vehicle_assignedDriverId_idx] ON [dbo].[Vehicle]([assignedDriverId]);

-- AddForeignKey
ALTER TABLE [dbo].[Vehicle] ADD CONSTRAINT [Vehicle_assignedDriverId_fkey] FOREIGN KEY ([assignedDriverId]) REFERENCES [dbo].[User]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PetroCard] ADD CONSTRAINT [PetroCard_issuedToDriverId_fkey] FOREIGN KEY ([issuedToDriverId]) REFERENCES [dbo].[User]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FuelEntry] ADD CONSTRAINT [FuelEntry_cardId_fkey] FOREIGN KEY ([cardId]) REFERENCES [dbo].[PetroCard]([id]) ON DELETE SET NULL ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
