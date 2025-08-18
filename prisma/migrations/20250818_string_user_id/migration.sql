-- Change User.id from Int to String (cuid)
-- Change Tracker.userId from Int to String to match User.id

-- First, drop the foreign key constraint
ALTER TABLE "Tracker" DROP CONSTRAINT "Tracker_userId_fkey";

-- Create a new User table with String ID
CREATE TABLE "User_new" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "fullName" TEXT,
    "avatarUrl" TEXT,
    "phone" TEXT,
    "provider" TEXT,
    "providerId" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_new_pkey" PRIMARY KEY ("id")
);

-- Create indexes for new User table
CREATE UNIQUE INDEX "User_new_userId_key" ON "User_new"("userId");
CREATE UNIQUE INDEX "User_new_email_key" ON "User_new"("email");
CREATE UNIQUE INDEX "User_new_username_key" ON "User_new"("username");

-- Add new userId column to Tracker as String
ALTER TABLE "Tracker" ADD COLUMN "userId_new" TEXT;

-- If you have existing data, you would need to migrate it here
-- For now, we'll assume this is a fresh setup

-- Drop old User table and rename new one
DROP TABLE IF EXISTS "User";
ALTER TABLE "User_new" RENAME TO "User";

-- Drop old userId column and rename new one
ALTER TABLE "Tracker" DROP COLUMN "userId";
ALTER TABLE "Tracker" RENAME COLUMN "userId_new" TO "userId";

-- Make userId NOT NULL
ALTER TABLE "Tracker" ALTER COLUMN "userId" SET NOT NULL;

-- Re-add the foreign key constraint
ALTER TABLE "Tracker" ADD CONSTRAINT "Tracker_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
