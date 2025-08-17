-- Enhanced PostgreSQL function for user creation hooks
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_count INTEGER;
BEGIN
    -- Log the new user creation with detailed information
    RAISE NOTICE 'Creating new user: ID=%, Email=%, Username=%, Active=%', 
        NEW.id, NEW.email, NEW.username, NEW."isActive";
    
    -- Get current user count for analytics
    SELECT COUNT(*) INTO user_count FROM "User";
    RAISE NOTICE 'Total users after creation: %', user_count + 1;
    
    -- Validate email format (basic check)
    IF NEW.email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RAISE EXCEPTION 'Invalid email format: %', NEW.email;
    END IF;
    
    -- Ensure username is not empty and meets minimum length
    IF LENGTH(TRIM(NEW.username)) < 3 THEN
        RAISE EXCEPTION 'Username must be at least 3 characters long';
    END IF;
    
    -- Auto-generate display name if firstName/lastName are provided
    IF NEW."firstName" IS NOT NULL OR NEW."lastName" IS NOT NULL THEN
        RAISE NOTICE 'User has name: % %', 
            COALESCE(NEW."firstName", ''), COALESCE(NEW."lastName", '');
    END IF;
    
    -- Set default values if needed
    IF NEW."isActive" IS NULL THEN
        NEW."isActive" := true;
    END IF;
    
    -- You can add additional business logic here:
    -- - Create default user settings
    -- - Initialize user preferences
    -- - Send welcome notifications
    -- - Create audit trail
    -- - Set up default trackers
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create additional trigger for AFTER INSERT to handle post-creation tasks
CREATE OR REPLACE FUNCTION handle_user_created()
RETURNS TRIGGER AS $$
BEGIN
    -- Log successful user creation
    RAISE NOTICE 'User successfully created with ID: %', NEW.id;
    
    -- Here you could:
    -- - Create default trackers for the user
    -- - Send welcome email (via external service)
    -- - Initialize user dashboard
    -- - Create user activity log entry
    
    -- Example: Create a default "Work" tracker for new users
    -- INSERT INTO "Tracker" ("userId", "trackerName", "targetHours", "description")
    -- VALUES (NEW.id, 'Work', 8, 'Default work tracker');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS before_user_created ON "User";
DROP TRIGGER IF EXISTS after_user_created ON "User";

-- Create BEFORE INSERT trigger (validation and preprocessing)
CREATE TRIGGER before_user_created
    BEFORE INSERT ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Create AFTER INSERT trigger (post-creation tasks)
CREATE TRIGGER after_user_created
    AFTER INSERT ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION handle_user_created();
