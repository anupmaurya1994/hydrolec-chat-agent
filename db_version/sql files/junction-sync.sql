--this code allows the client_id and project_id to sync with each other using junction tables
-- =============================================================================
-- CLEAN UP OLD TRIGGERS FIRST
-- =============================================================================

-- Remove all existing conflicting triggers
DROP TRIGGER IF EXISTS update_client_projects_in_junction ON projects;
DROP TRIGGER IF EXISTS trigger_sync_project_clients ON client_projects;
DROP TRIGGER IF EXISTS trigger_sync_clients_to_junction ON clients;
DROP TRIGGER IF EXISTS trigger_sync_junction_to_projects ON client_projects;
DROP TRIGGER IF EXISTS trigger_sync_projects_to_junction ON projects;
DROP TRIGGER IF EXISTS trigger_sync_junction_to_arrays ON client_projects;
DROP TRIGGER IF EXISTS trigger_cleanup_sync_flags ON client_projects;

-- Drop old functions if they exist
DROP FUNCTION IF EXISTS sync_client_projects_in_junction();
DROP FUNCTION IF EXISTS sync_project_clients_in_clients();
DROP FUNCTION IF EXISTS sync_clients_to_junction();
DROP FUNCTION IF EXISTS sync_junction_to_projects();
DROP FUNCTION IF EXISTS sync_projects_to_junction();
DROP FUNCTION IF EXISTS sync_junction_to_arrays();
DROP FUNCTION IF EXISTS cleanup_sync_flags();
DROP FUNCTION IF EXISTS reset_sync_flags();

-- =============================================================================
-- ADD FLAG COLUMN TO JUNCTION TABLE
-- =============================================================================

-- Add sync_source column if it doesn't exist
DO $add_column$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'client_projects' 
        AND column_name = 'sync_source'
    ) THEN
        ALTER TABLE client_projects ADD COLUMN sync_source VARCHAR(20) DEFAULT 'manual';
    END IF;
END $add_column$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_client_projects_sync_source ON client_projects(sync_source);

-- Set all existing records to 'manual'
UPDATE client_projects SET sync_source = 'manual' WHERE sync_source IS NULL OR sync_source = '';

-- =============================================================================
-- BIDIRECTIONAL SYNC SYSTEM WITH FLAG COLUMN
-- =============================================================================

-- TRIGGER 1: Sync changes from projects.client_id array to junction table
CREATE OR REPLACE FUNCTION sync_projects_to_junction()
RETURNS trigger AS $$

DECLARE
    new_clients INT[];
    removed_clients INT[];
BEGIN
    -- Only proceed for updates where client_id array actually changed
    IF TG_OP = 'UPDATE' AND (
        (OLD.client_id IS NULL AND NEW.client_id IS NOT NULL) OR
        (OLD.client_id IS NOT NULL AND NEW.client_id IS NULL) OR
        (OLD.client_id != NEW.client_id)
    ) THEN
        -- Calculate clients that have been added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.client_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.client_id, ARRAY[]::INT[]))
        ) INTO new_clients;
        
        -- Calculate clients that have been removed
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.client_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.client_id, ARRAY[]::INT[]))
        ) INTO removed_clients;
        
        -- Insert new client relationships with 'projects' flag
        IF new_clients IS NOT NULL AND array_length(new_clients, 1) > 0 THEN
            INSERT INTO client_projects (client_id, project_id, sync_source)
            SELECT c.client_id, NEW.id, 'projects'
            FROM unnest(new_clients) AS c(client_id)
            WHERE NOT EXISTS (
                SELECT 1
                FROM client_projects cp
                WHERE cp.client_id = c.client_id
                AND cp.project_id = NEW.id
            );
            
            -- Now sync these new records to the clients table
            UPDATE clients 
            SET project_id = CASE 
                WHEN project_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(project_id) THEN project_id
                ELSE array_append(project_id, NEW.id)
            END
            WHERE id = ANY(new_clients);
        END IF;
        
        -- Remove old client relationships
        IF removed_clients IS NOT NULL AND array_length(removed_clients, 1) > 0 THEN
            DELETE FROM client_projects
            WHERE project_id = NEW.id
            AND client_id = ANY(removed_clients);
            
            -- Remove project from clients' arrays
            UPDATE clients 
            SET project_id = array_remove(project_id, NEW.id)
            WHERE id = ANY(removed_clients);
        END IF;
        
        -- Reset sync_source to 'manual' for the records we just created
        UPDATE client_projects 
        SET sync_source = 'manual' 
        WHERE project_id = NEW.id 
        AND sync_source = 'projects';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_projects_to_junction
    AFTER UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION sync_projects_to_junction();

-- =============================================================================

-- TRIGGER 2: Sync changes from clients.project_id array to junction table
CREATE OR REPLACE FUNCTION sync_clients_to_junction()
RETURNS trigger AS
$$
DECLARE
    new_projects INT[];
    removed_projects INT[];
BEGIN
    -- Only proceed for updates where project_id array actually changed
    IF TG_OP = 'UPDATE' AND (
        (OLD.project_id IS NULL AND NEW.project_id IS NOT NULL) OR
        (OLD.project_id IS NOT NULL AND NEW.project_id IS NULL) OR
        (OLD.project_id != NEW.project_id)
    ) THEN
        -- Calculate projects that have been added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.project_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.project_id, ARRAY[]::INT[]))
        ) INTO new_projects;
        
        -- Calculate projects that have been removed
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.project_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.project_id, ARRAY[]::INT[]))
        ) INTO removed_projects;
        
        -- Insert new project relationships with 'clients' flag
        IF new_projects IS NOT NULL AND array_length(new_projects, 1) > 0 THEN
            INSERT INTO client_projects (client_id, project_id, sync_source)
            SELECT NEW.id, p.project_id, 'clients'
            FROM unnest(new_projects) AS p(project_id)
            WHERE NOT EXISTS (
                SELECT 1
                FROM client_projects cp
                WHERE cp.client_id = NEW.id
                AND cp.project_id = p.project_id
            );
            
            -- Now sync these new records to the projects table
            UPDATE projects 
            SET client_id = CASE 
                WHEN client_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(client_id) THEN client_id
                ELSE array_append(client_id, NEW.id)
            END
            WHERE id = ANY(new_projects);
        END IF;
        
        -- Remove old project relationships
        IF removed_projects IS NOT NULL AND array_length(removed_projects, 1) > 0 THEN
            DELETE FROM client_projects
            WHERE client_id = NEW.id
            AND project_id = ANY(removed_projects);
            
            -- Remove client from projects' arrays
            UPDATE projects 
            SET client_id = array_remove(client_id, NEW.id)
            WHERE id = ANY(removed_projects);
        END IF;
        
        -- Reset sync_source to 'manual' for the records we just created
        UPDATE client_projects 
        SET sync_source = 'manual' 
        WHERE client_id = NEW.id 
        AND sync_source = 'clients';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_clients_to_junction
    AFTER UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION sync_clients_to_junction();

-- =============================================================================

-- TRIGGER 3: Sync changes from junction table to arrays (SIMPLIFIED)
CREATE OR REPLACE FUNCTION sync_junction_to_arrays()
RETURNS trigger AS
$func3$
BEGIN
    -- Handle INSERT operations
    IF TG_OP = 'INSERT' THEN
        -- Only sync to arrays if sync_source is 'manual' (direct insert)
        IF COALESCE(NEW.sync_source, 'manual') = 'manual' THEN
            -- Add client to project's client_id array if not already there
            UPDATE projects 
            SET client_id = CASE 
                WHEN client_id IS NULL THEN ARRAY[NEW.client_id]
                WHEN NEW.client_id = ANY(client_id) THEN client_id
                ELSE array_append(client_id, NEW.client_id)
            END
            WHERE id = NEW.project_id;
            
            -- Add project to client's project_id array if not already there
            UPDATE clients 
            SET project_id = CASE 
                WHEN project_id IS NULL THEN ARRAY[NEW.project_id]
                WHEN NEW.project_id = ANY(project_id) THEN project_id
                ELSE array_append(project_id, NEW.project_id)
            END
            WHERE id = NEW.client_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- Handle DELETE operations (always sync these)
    IF TG_OP = 'DELETE' THEN
        -- Remove client from project's client_id array
        UPDATE projects 
        SET client_id = array_remove(client_id, OLD.client_id)
        WHERE id = OLD.project_id;
        
        -- Remove project from client's project_id array
        UPDATE clients 
        SET project_id = array_remove(project_id, OLD.project_id)
        WHERE id = OLD.client_id;
        
        RETURN OLD;
    END IF;
    
    -- Handle UPDATE operations
    IF TG_OP = 'UPDATE' THEN
        -- Only sync if this is a manual update
        IF COALESCE(NEW.sync_source, 'manual') = 'manual' THEN
            -- Handle project_id changes
            IF OLD.project_id != NEW.project_id THEN
                -- Remove client from old project
                UPDATE projects 
                SET client_id = array_remove(client_id, OLD.client_id)
                WHERE id = OLD.project_id;
                
                -- Add client to new project
                UPDATE projects 
                SET client_id = CASE 
                    WHEN client_id IS NULL THEN ARRAY[NEW.client_id]
                    WHEN NEW.client_id = ANY(client_id) THEN client_id
                    ELSE array_append(client_id, NEW.client_id)
                END
                WHERE id = NEW.project_id;
            END IF;
            
            -- Handle client_id changes
            IF OLD.client_id != NEW.client_id THEN
                -- Remove project from old client
                UPDATE clients 
                SET project_id = array_remove(project_id, OLD.project_id)
                WHERE id = OLD.client_id;
                
                -- Add project to new client
                UPDATE clients 
                SET project_id = CASE 
                    WHEN project_id IS NULL THEN ARRAY[NEW.project_id]
                    WHEN NEW.project_id = ANY(project_id) THEN project_id
                    ELSE array_append(project_id, NEW.project_id)
                END
                WHERE id = NEW.client_id;
            END IF;
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$func3$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_junction_to_arrays
    AFTER INSERT OR UPDATE OR DELETE ON client_projects
    FOR EACH ROW
    EXECUTE FUNCTION sync_junction_to_arrays();

-- =============================================================================
-- POST-PROCESSING: Reset sync flags
-- =============================================================================

-- Create a function to reset sync flags after operations
CREATE OR REPLACE FUNCTION reset_sync_source_flags()
RETURNS void AS
$func4$
BEGIN
    UPDATE client_projects 
    SET sync_source = 'manual' 
    WHERE sync_source IN ('projects', 'clients');
END;
$func4$ LANGUAGE plpgsql;

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Test the complete sync system:

-- 1. Test direct junction insert (should sync to both arrays):
-- INSERT INTO client_projects (client_id, project_id) VALUES (1, 1);
-- SELECT client_id FROM projects WHERE id = 1; -- Should include client 1
-- SELECT project_id FROM clients WHERE id = 1; -- Should include project 1

-- 2. Test project array update (should sync to junction):
-- UPDATE projects SET client_id = ARRAY[1,2,3] WHERE id = 2;
-- SELECT * FROM client_projects WHERE project_id = 2; -- Should show relationships

-- 3. Test client array update (should sync to junction):
-- UPDATE clients SET project_id = ARRAY[1,2,3] WHERE id = 2;
-- SELECT * FROM client_projects WHERE client_id = 2; -- Should show relationships

-- 4. Reset flags after testing:
-- SELECT reset_sync_source_flags();
-- SELECT sync_source FROM client_projects; -- Should all be 'manual'

-- 5. Test junction delete (should remove from both arrays):
-- DELETE FROM client_projects WHERE client_id = 1 AND project_id = 1;
-- SELECT client_id FROM projects WHERE id = 1; -- Should not include client 1
-- SELECT project_id FROM clients WHERE id = 1; -- Should not include project 1