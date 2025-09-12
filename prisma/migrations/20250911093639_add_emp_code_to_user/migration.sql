/*
  Warnings:

  - A unique constraint covering the columns `[empCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- DropIndex
ALTER TABLE [dbo].[User] DROP CONSTRAINT [User_name_key];

-- AlterTable
ALTER TABLE [dbo].[User] ADD [empCode] NVARCHAR(1000);

-- CreateIndex
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_empCode_key] UNIQUE NONCLUSTERED ([empCode]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
