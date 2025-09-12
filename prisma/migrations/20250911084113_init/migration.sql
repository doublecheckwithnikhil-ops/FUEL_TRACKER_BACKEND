/*
  Warnings:

  - A unique constraint covering the columns `[cardNumber]` on the table `PetroCard` will be added. If there are existing duplicate values, this will fail.

*/
BEGIN TRY

BEGIN TRAN;

-- CreateIndex
ALTER TABLE [dbo].[PetroCard] ADD CONSTRAINT [PetroCard_cardNumber_key] UNIQUE NONCLUSTERED ([cardNumber]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
