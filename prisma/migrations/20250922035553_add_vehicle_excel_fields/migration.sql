BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Vehicle] ALTER COLUMN [capacity] INT NULL;
ALTER TABLE [dbo].[Vehicle] ADD [fuelType] NVARCHAR(1000),
[modelNumber] NVARCHAR(1000),
[ownType] NVARCHAR(1000),
[owner] NVARCHAR(1000),
[size] NVARCHAR(1000),
[tankSize] DECIMAL(10,2);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Vehicle_fuelType_idx] ON [dbo].[Vehicle]([fuelType]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [Vehicle_owner_idx] ON [dbo].[Vehicle]([owner]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
