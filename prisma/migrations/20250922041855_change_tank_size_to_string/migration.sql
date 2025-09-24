/*
  Warnings:

  - You are about to drop the column `capacity` on the `Vehicle` table. All the data in the column will be lost.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
DROP INDEX [Vehicle_fuelType_idx] ON [dbo].[Vehicle];

-- DropIndex
DROP INDEX [Vehicle_owner_idx] ON [dbo].[Vehicle];

-- AlterTable
ALTER TABLE [dbo].[Vehicle] ALTER COLUMN [tankSize] NVARCHAR(1000) NULL;
ALTER TABLE [dbo].[Vehicle] DROP COLUMN [capacity];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
