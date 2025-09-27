
CREATE DATABASE TourOptimization;
GO
USE TourOptimization;
GO


CREATE TABLE Destinations (
    DestinationID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Lat FLOAT NULL,
    Lng FLOAT NULL,
    Description NVARCHAR(255)
);

CREATE TABLE TravelCosts (
    CostID INT IDENTITY(1,1) PRIMARY KEY,
    FromDestinationID INT NOT NULL,
    ToDestinationID INT NOT NULL,
    Cost FLOAT NOT NULL,
    FOREIGN KEY (FromDestinationID) REFERENCES Destinations(DestinationID),
    FOREIGN KEY (ToDestinationID) REFERENCES Destinations(DestinationID)
);

CREATE TABLE Tours (
    TourID INT IDENTITY(1,1) PRIMARY KEY,
    TourName NVARCHAR(100) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    TotalCost FLOAT
);

CREATE TABLE TourSteps (
    StepID INT IDENTITY(1,1) PRIMARY KEY,
    TourID INT NOT NULL,
    StepOrder INT NOT NULL,
    DestinationID INT NOT NULL,
    ArrivalTime DATETIME NULL,
    FOREIGN KEY (TourID) REFERENCES Tours(TourID),
    FOREIGN KEY (DestinationID) REFERENCES Destinations(DestinationID)
);

CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100),
    Email NVARCHAR(100) UNIQUE,
    PasswordHash NVARCHAR(255),
    Role NVARCHAR(50)
);

CREATE TABLE Bookings (
    BookingID INT IDENTITY(1,1) PRIMARY KEY,
    TourID INT NOT NULL,
    UserID INT NOT NULL,
    BookingDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (TourID) REFERENCES Tours(TourID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

INSERT INTO Destinations (Name, Lat, Lng, Description)
VALUES 
('A', 10.123, 106.456, 'Điểm A'),
('B', 10.223, 106.556, 'Điểm B'),
('C', 10.323, 106.656, 'Điểm C'),
('D', 10.423, 106.756, 'Điểm D');


INSERT INTO TravelCosts (FromDestinationID, ToDestinationID, Cost)
VALUES
(1,2,10),(2,1,10),
(1,3,15),(3,1,15),
(1,4,20),(4,1,20),
(2,3,35),(3,2,35),
(2,4,25),(4,2,25),
(3,4,30),(4,3,30);

