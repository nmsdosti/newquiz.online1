-- Add super admin functionality
-- This migration adds the is_super_admin column if it doesn't already exist
-- Note: The column is already included in the main migration, so this is just a safety check

-- Ensure is_super_admin column exists (it should already be created in the main migration)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users' 
        AND column_name = 'is_super_admin'
    ) THEN
        ALTER TABLE public.users ADD COLUMN is_super_admin BOOLEAN DEFAULT FALSE;
    END IF;
END
$$;

-- Create index for super admin queries if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_users_is_super_admin ON public.users(is_super_admin) WHERE is_super_admin = true;

-- Final comment
-- Super admin role setup complete
-- Users can be promoted to super admin by updating the is_super_admin column