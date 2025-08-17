-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "Tracker" ADD COLUMN "userId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Tracker" ADD CONSTRAINT "Tracker_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create function to handle user creation hook
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the new user creation
    RAISE NOTICE 'New user created: ID=%, Email=%, Username=%', NEW.id, NEW.email, NEW.username;
    
    -- You can add additional logic here, such as:
    -- - Creating default settings
    -- - Sending welcome notifications
    -- - Initializing user preferences
    -- - Creating audit log entries
    
    -- Example: Insert into an audit log table (uncomment if you have one)
    -- INSERT INTO user_audit_log (user_id, action, created_at)
    -- VALUES (NEW.id, 'USER_CREATED', NOW());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that fires BEFORE INSERT on User table
CREATE TRIGGER before_user_created
    BEFORE INSERT ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
