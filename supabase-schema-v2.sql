-- Banking Journey Strategist Database Schema v2
-- Single-Tenant Architecture with Role-Based Permissions
-- Project: lmuejkfvsjscmboaayds
-- Updated: 2025-10-14

-- ============================================================================
-- STEP 1: Update implementations table
-- ============================================================================

-- Rename user_id to owner_id
ALTER TABLE implementations
RENAME COLUMN user_id TO owner_id;

-- Drop old RLS policies (multi-tenant isolation)
DROP POLICY IF EXISTS "Users can view their own implementations" ON implementations;
DROP POLICY IF EXISTS "Users can create their own implementations" ON implementations;
DROP POLICY IF EXISTS "Users can update their own implementations" ON implementations;
DROP POLICY IF EXISTS "Users can delete their own implementations" ON implementations;

-- New RLS policies: All authenticated users can see all projects
CREATE POLICY "All users can view all implementations"
    ON implementations
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "All users can create implementations"
    ON implementations
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = owner_id);

CREATE POLICY "Owners can update their implementations"
    ON implementations
    FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their implementations"
    ON implementations
    FOR DELETE
    USING (auth.uid() = owner_id);

-- ============================================================================
-- STEP 2: Create project_permissions table
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES implementations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(project_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_permissions_project_id ON project_permissions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_permissions_user_id ON project_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_project_permissions_role ON project_permissions(role);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_project_permissions_updated_at
    BEFORE UPDATE ON project_permissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE project_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All users can view permissions
CREATE POLICY "All users can view project permissions"
    ON project_permissions
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Only owners can manage permissions
CREATE POLICY "Owners can insert permissions"
    ON project_permissions
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM implementations
            WHERE id = project_permissions.project_id
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update permissions"
    ON project_permissions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM implementations
            WHERE id = project_permissions.project_id
            AND owner_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM implementations
            WHERE id = project_permissions.project_id
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Owners can delete permissions"
    ON project_permissions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM implementations
            WHERE id = project_permissions.project_id
            AND owner_id = auth.uid()
        )
    );

-- Grant permissions
GRANT ALL ON project_permissions TO authenticated;
GRANT ALL ON project_permissions TO service_role;

-- ============================================================================
-- STEP 3: Enhanced RLS policies for implementations (permission-based edits)
-- ============================================================================

-- Drop and recreate update policy to check permissions
DROP POLICY IF EXISTS "Owners can update their implementations" ON implementations;
DROP POLICY IF EXISTS "Owners can delete their implementations" ON implementations;

CREATE POLICY "Owners and editors can update implementations"
    ON implementations
    FOR UPDATE
    USING (
        auth.uid() = owner_id OR
        EXISTS (
            SELECT 1 FROM project_permissions
            WHERE project_permissions.project_id = implementations.id
            AND project_permissions.user_id = auth.uid()
            AND project_permissions.role IN ('owner', 'editor')
        )
    )
    WITH CHECK (
        auth.uid() = owner_id OR
        EXISTS (
            SELECT 1 FROM project_permissions
            WHERE project_permissions.project_id = implementations.id
            AND project_permissions.user_id = auth.uid()
            AND project_permissions.role IN ('owner', 'editor')
        )
    );

CREATE POLICY "Only owners can delete implementations"
    ON implementations
    FOR DELETE
    USING (auth.uid() = owner_id);

-- ============================================================================
-- STEP 4: Helper function to check user permissions
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_role_for_project(p_project_id UUID, p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    v_role TEXT;
BEGIN
    -- Check if user is owner
    SELECT 'owner' INTO v_role
    FROM implementations
    WHERE id = p_project_id AND owner_id = p_user_id;

    IF FOUND THEN
        RETURN v_role;
    END IF;

    -- Check permissions table
    SELECT role INTO v_role
    FROM project_permissions
    WHERE project_id = p_project_id AND user_id = p_user_id;

    IF FOUND THEN
        RETURN v_role;
    END IF;

    -- No permission found
    RETURN 'none';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- STEP 5: View for projects with user permissions
-- ============================================================================

CREATE OR REPLACE VIEW user_project_permissions AS
SELECT
    i.id,
    i.owner_id,
    i.name,
    i.status,
    i.created_at,
    i.updated_at,
    u.email as owner_email,
    CASE
        WHEN i.owner_id = auth.uid() THEN 'owner'
        ELSE COALESCE(pp.role, 'viewer')
    END as user_role
FROM implementations i
JOIN auth.users u ON i.owner_id = u.id
LEFT JOIN project_permissions pp ON pp.project_id = i.id AND pp.user_id = auth.uid()
WHERE auth.role() = 'authenticated';

-- Grant access to view
GRANT SELECT ON user_project_permissions TO authenticated;

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

-- To apply this schema:
-- 1. All existing user_id values will become owner_id values
-- 2. All existing projects will remain owned by their original creators
-- 3. New permission grants can be added via project_permissions table
-- 4. The helper function get_user_role_for_project() can be called from application code
-- 5. The user_project_permissions view provides a convenient way to query projects with roles
