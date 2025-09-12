/*
  Warnings:

  - A unique constraint covering the columns `[vehicleNumber]` on the table `Vehicle` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- CreateIndex
ALTER TABLE [dbo].[Vehicle] ADD CONSTRAINT [Vehicle_vehicleNumber_key] UNIQUE NONCLUSTERED ([vehicleNumber]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
