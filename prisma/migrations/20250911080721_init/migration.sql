BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Role] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Role_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [password] NVARCHAR(1000) NOT NULL,
    [roleId] INT NOT NULL,
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Vehicle] (
    [id] INT NOT NULL IDENTITY(1,1),
    [vehicleNumber] NVARCHAR(1000) NOT NULL,
    [capacity] INT NOT NULL,
    [assignedDriverId] INT,
    CONSTRAINT [Vehicle_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[FuelEntry] (
    [id] INT NOT NULL IDENTITY(1,1),
    [vehicleId] INT NOT NULL,
    [location] NVARCHAR(1000) NOT NULL,
    [latitude] FLOAT(53) NOT NULL,
    [longitude] FLOAT(53) NOT NULL,
    [odometerReading] FLOAT(53) NOT NULL,
    [billNumber] NVARCHAR(1000) NOT NULL,
    [quantity] FLOAT(53) NOT NULL,
    [ratePerLitre] FLOAT(53) NOT NULL,
    [driverId] INT NOT NULL,
    [amount] FLOAT(53) NOT NULL,
    [meterImg] NVARCHAR(1000) NOT NULL,
    [cardId] INT,
    [billImg] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [FuelEntry_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[PetroCard] (
    [id] INT NOT NULL IDENTITY(1,1),
    [cardNumber] NVARCHAR(1000) NOT NULL,
    [validTill] NVARCHAR(1000) NOT NULL,
    [issuedToDriverId] INT,
    CONSTRAINT [PetroCard_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[User] ADD CONSTRAINT [User_roleId_fkey] FOREIGN KEY ([roleId]) REFERENCES [dbo].[Role]([id]) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[Vehicle] ADD CONSTRAINT [Vehicle_assignedDriverId_fkey] FOREIGN KEY ([assignedDriverId]) REFERENCES [dbo].[User]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[FuelEntry] ADD CONSTRAINT [FuelEntry_vehicleId_fkey] FOREIGN KEY ([vehicleId]) REFERENCES [dbo].[Vehicle]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FuelEntry] ADD CONSTRAINT [FuelEntry_driverId_fkey] FOREIGN KEY ([driverId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[FuelEntry] ADD CONSTRAINT [FuelEntry_cardId_fkey] FOREIGN KEY ([cardId]) REFERENCES [dbo].[PetroCard]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[PetroCard] ADD CONSTRAINT [PetroCard_issuedToDriverId_fkey] FOREIGN KEY ([issuedToDriverId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
