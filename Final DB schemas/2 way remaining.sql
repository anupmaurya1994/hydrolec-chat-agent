--this version is tested and working for insert, update and delete operations

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN ASSETS AND BRIEFINGS
-- =============================================================================

-- TRIGGER 1: When assets.briefing_id array changes, update briefings.asset_id arrays
CREATE OR REPLACE FUNCTION sync_assets_to_briefings()
RETURNS trigger AS $$
DECLARE
    added_briefings INT[];
    removed_briefings INT[];
    old_briefings INT[];
    new_briefings INT[];
BEGIN
    -- Handle different trigger operations
    old_briefings := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.briefing_id, ARRAY[]::INT[])
                          WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.briefing_id, ARRAY[]::INT[])
                          ELSE ARRAY[]::INT[] END;
                          
    new_briefings := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.briefing_id, ARRAY[]::INT[])
                          WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.briefing_id, ARRAY[]::INT[])
                          ELSE ARRAY[]::INT[] END;

    -- Only proceed if briefing_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_briefings, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_briefings, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_briefings IS DISTINCT FROM new_briefings) THEN
        
        -- Find briefings that were added
        SELECT ARRAY(
            SELECT unnest(new_briefings)
            EXCEPT
            SELECT unnest(old_briefings)
        ) INTO added_briefings;
        
        -- Find briefings that were removed  
        SELECT ARRAY(
            SELECT unnest(old_briefings)
            EXCEPT
            SELECT unnest(new_briefings)
        ) INTO removed_briefings;
        
        -- Add this asset to newly added briefings
        IF array_length(added_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET asset_id = CASE 
                WHEN asset_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(asset_id) THEN asset_id
                ELSE array_append(asset_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_briefings);
        END IF;
        
        -- Remove this asset from removed briefings
        IF array_length(removed_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET asset_id = array_remove(asset_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_briefings);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When briefings.asset_id array changes, update assets.briefing_id arrays  
CREATE OR REPLACE FUNCTION sync_briefings_to_assets()
RETURNS trigger AS $$
DECLARE
    added_assets INT[];
    removed_assets INT[];
    old_assets INT[];
    new_assets INT[];
BEGIN
    -- Handle different trigger operations
    old_assets := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.asset_id, ARRAY[]::INT[])
                       WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.asset_id, ARRAY[]::INT[])
                       ELSE ARRAY[]::INT[] END;
                       
    new_assets := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.asset_id, ARRAY[]::INT[])
                       WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.asset_id, ARRAY[]::INT[])
                       ELSE ARRAY[]::INT[] END;

    -- Only proceed if asset_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_assets, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_assets, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_assets IS DISTINCT FROM new_assets) THEN
        
        -- Find assets that were added
        SELECT ARRAY(
            SELECT unnest(new_assets)
            EXCEPT
            SELECT unnest(old_assets)
        ) INTO added_assets;
        
        -- Find assets that were removed
        SELECT ARRAY(
            SELECT unnest(old_assets)
            EXCEPT
            SELECT unnest(new_assets)
        ) INTO removed_assets;
        
        -- Add this briefing to newly added assets
        IF array_length(added_assets, 1) > 0 THEN
            UPDATE assets 
            SET briefing_id = CASE 
                WHEN briefing_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(briefing_id) THEN briefing_id
                ELSE array_append(briefing_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_assets);
        END IF;
        
        -- Remove this briefing from removed assets
        IF array_length(removed_assets, 1) > 0 THEN
            UPDATE assets 
            SET briefing_id = array_remove(briefing_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_assets);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for assets table
DROP TRIGGER IF EXISTS trigger_sync_assets_to_briefings ON assets;
CREATE TRIGGER trigger_sync_assets_to_briefings
    AFTER INSERT OR UPDATE OR DELETE ON assets
    FOR EACH ROW EXECUTE FUNCTION sync_assets_to_briefings();

-- Create triggers for briefings table (for assets sync)
DROP TRIGGER IF EXISTS trigger_sync_briefings_to_assets ON briefings;
CREATE TRIGGER trigger_sync_briefings_to_assets
    AFTER INSERT OR UPDATE OR DELETE ON briefings
    FOR EACH ROW EXECUTE FUNCTION sync_briefings_to_assets();

------not verified---------------

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN ASSETS AND MILESTONES
-- =============================================================================

-- TRIGGER 1: When assets.milestone_id array changes, update milestones.asset_id arrays
CREATE OR REPLACE FUNCTION sync_assets_to_milestones()
RETURNS trigger AS $$
DECLARE
    added_milestones INT[];
    removed_milestones INT[];
    old_milestones INT[];
    new_milestones INT[];
BEGIN
    -- Handle different trigger operations
    old_milestones := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.milestone_id, ARRAY[]::INT[])
                           WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.milestone_id, ARRAY[]::INT[])
                           ELSE ARRAY[]::INT[] END;
                           
    new_milestones := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.milestone_id, ARRAY[]::INT[])
                           WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.milestone_id, ARRAY[]::INT[])
                           ELSE ARRAY[]::INT[] END;

    -- Only proceed if milestone_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_milestones, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_milestones, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_milestones IS DISTINCT FROM new_milestones) THEN
        
        -- Find milestones that were added
        SELECT ARRAY(
            SELECT unnest(new_milestones)
            EXCEPT
            SELECT unnest(old_milestones)
        ) INTO added_milestones;
        
        -- Find milestones that were removed  
        SELECT ARRAY(
            SELECT unnest(old_milestones)
            EXCEPT
            SELECT unnest(new_milestones)
        ) INTO removed_milestones;
        
        -- Add this asset to newly added milestones
        IF array_length(added_milestones, 1) > 0 THEN
            UPDATE milestones 
            SET asset_id = CASE 
                WHEN asset_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(asset_id) THEN asset_id
                ELSE array_append(asset_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_milestones);
        END IF;
        
        -- Remove this asset from removed milestones
        IF array_length(removed_milestones, 1) > 0 THEN
            UPDATE milestones 
            SET asset_id = array_remove(asset_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_milestones);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When milestones.asset_id array changes, update assets.milestone_id arrays  
CREATE OR REPLACE FUNCTION sync_milestones_to_assets()
RETURNS trigger AS $$
DECLARE
    added_assets INT[];
    removed_assets INT[];
    old_assets INT[];
    new_assets INT[];
BEGIN
    -- Handle different trigger operations
    old_assets := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.asset_id, ARRAY[]::INT[])
                       WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.asset_id, ARRAY[]::INT[])
                       ELSE ARRAY[]::INT[] END;
                       
    new_assets := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.asset_id, ARRAY[]::INT[])
                       WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.asset_id, ARRAY[]::INT[])
                       ELSE ARRAY[]::INT[] END;

    -- Only proceed if asset_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_assets, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_assets, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_assets IS DISTINCT FROM new_assets) THEN
        
        -- Find assets that were added
        SELECT ARRAY(
            SELECT unnest(new_assets)
            EXCEPT
            SELECT unnest(old_assets)
        ) INTO added_assets;
        
        -- Find assets that were removed
        SELECT ARRAY(
            SELECT unnest(old_assets)
            EXCEPT
            SELECT unnest(new_assets)
        ) INTO removed_assets;
        
        -- Add this milestone to newly added assets
        IF array_length(added_assets, 1) > 0 THEN
            UPDATE assets 
            SET milestone_id = CASE 
                WHEN milestone_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(milestone_id) THEN milestone_id
                ELSE array_append(milestone_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_assets);
        END IF;
        
        -- Remove this milestone from removed assets
        IF array_length(removed_assets, 1) > 0 THEN
            UPDATE assets 
            SET milestone_id = array_remove(milestone_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_assets);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for assets table
DROP TRIGGER IF EXISTS trigger_sync_assets_to_milestones ON assets;
CREATE TRIGGER trigger_sync_assets_to_milestones
    AFTER INSERT OR UPDATE OR DELETE ON assets
    FOR EACH ROW EXECUTE FUNCTION sync_assets_to_milestones();

-- Create triggers for milestones table (for assets sync)
DROP TRIGGER IF EXISTS trigger_sync_milestones_to_assets ON milestones;
CREATE TRIGGER trigger_sync_milestones_to_assets
    AFTER INSERT OR UPDATE OR DELETE ON milestones
    FOR EACH ROW EXECUTE FUNCTION sync_milestones_to_assets();

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN ASSETS AND PROJECTS
-- =============================================================================

-- TRIGGER 1: When assets.project_id array changes, update projects.asset_id arrays
CREATE OR REPLACE FUNCTION sync_assets_to_projects()
RETURNS trigger AS $$
DECLARE
    added_projects INT[];
    removed_projects INT[];
    old_projects INT[];
    new_projects INT[];
BEGIN
    -- Handle different trigger operations
    old_projects := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.project_id, ARRAY[]::INT[])
                         WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.project_id, ARRAY[]::INT[])
                         ELSE ARRAY[]::INT[] END;
                         
    new_projects := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.project_id, ARRAY[]::INT[])
                         WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.project_id, ARRAY[]::INT[])
                         ELSE ARRAY[]::INT[] END;

    -- Only proceed if project_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_projects, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_projects, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_projects IS DISTINCT FROM new_projects) THEN
        
        -- Find projects that were added
        SELECT ARRAY(
            SELECT unnest(new_projects)
            EXCEPT
            SELECT unnest(old_projects)
        ) INTO added_projects;
        
        -- Find projects that were removed  
        SELECT ARRAY(
            SELECT unnest(old_projects)
            EXCEPT
            SELECT unnest(new_projects)
        ) INTO removed_projects;
        
        -- Add this asset to newly added projects
        IF array_length(added_projects, 1) > 0 THEN
            UPDATE projects 
            SET asset_id = CASE 
                WHEN asset_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(asset_id) THEN asset_id
                ELSE array_append(asset_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_projects);
        END IF;
        
        -- Remove this asset from removed projects
        IF array_length(removed_projects, 1) > 0 THEN
            UPDATE projects 
            SET asset_id = array_remove(asset_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_projects);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When projects.asset_id array changes, update assets.project_id arrays  
CREATE OR REPLACE FUNCTION sync_projects_to_assets()
RETURNS trigger AS $$
DECLARE
    added_assets INT[];
    removed_assets INT[];
    old_assets INT[];
    new_assets INT[];
BEGIN
    -- Handle different trigger operations
    old_assets := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.asset_id, ARRAY[]::INT[])
                       WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.asset_id, ARRAY[]::INT[])
                       ELSE ARRAY[]::INT[] END;
                       
    new_assets := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.asset_id, ARRAY[]::INT[])
                       WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.asset_id, ARRAY[]::INT[])
                       ELSE ARRAY[]::INT[] END;

    -- Only proceed if asset_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_assets, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_assets, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_assets IS DISTINCT FROM new_assets) THEN
        
        -- Find assets that were added
        SELECT ARRAY(
            SELECT unnest(new_assets)
            EXCEPT
            SELECT unnest(old_assets)
        ) INTO added_assets;
        
        -- Find assets that were removed
        SELECT ARRAY(
            SELECT unnest(old_assets)
            EXCEPT
            SELECT unnest(new_assets)
        ) INTO removed_assets;
        
        -- Add this project to newly added assets
        IF array_length(added_assets, 1) > 0 THEN
            UPDATE assets 
            SET project_id = CASE 
                WHEN project_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(project_id) THEN project_id
                ELSE array_append(project_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_assets);
        END IF;
        
        -- Remove this project from removed assets
        IF array_length(removed_assets, 1) > 0 THEN
            UPDATE assets 
            SET project_id = array_remove(project_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_assets);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for assets table
DROP TRIGGER IF EXISTS trigger_sync_assets_to_projects ON assets;
CREATE TRIGGER trigger_sync_assets_to_projects
    AFTER INSERT OR UPDATE OR DELETE ON assets
    FOR EACH ROW EXECUTE FUNCTION sync_assets_to_projects();

-- Create triggers for projects table (for assets sync)
DROP TRIGGER IF EXISTS trigger_sync_projects_to_assets ON projects;
CREATE TRIGGER trigger_sync_projects_to_assets
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION sync_projects_to_assets();


-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN CLIENTS AND MEETING_TRANSCRIPTS
-- =============================================================================

-- TRIGGER 1: When clients.meeting_transcript_id array changes, update meeting_transcripts.client_id arrays
CREATE OR REPLACE FUNCTION sync_clients_to_meeting_transcripts()
RETURNS trigger AS $$
DECLARE
    added_transcripts INT[];
    removed_transcripts INT[];
    old_transcripts INT[];
    new_transcripts INT[];
BEGIN
    -- Handle different trigger operations
    old_transcripts := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.meeting_transcript_id, ARRAY[]::INT[])
                            WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.meeting_transcript_id, ARRAY[]::INT[])
                            ELSE ARRAY[]::INT[] END;
                            
    new_transcripts := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.meeting_transcript_id, ARRAY[]::INT[])
                            WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.meeting_transcript_id, ARRAY[]::INT[])
                            ELSE ARRAY[]::INT[] END;

    -- Only proceed if meeting_transcript_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_transcripts, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_transcripts, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_transcripts IS DISTINCT FROM new_transcripts) THEN
        
        -- Find transcripts that were added
        SELECT ARRAY(
            SELECT unnest(new_transcripts)
            EXCEPT
            SELECT unnest(old_transcripts)
        ) INTO added_transcripts;
        
        -- Find transcripts that were removed  
        SELECT ARRAY(
            SELECT unnest(old_transcripts)
            EXCEPT
            SELECT unnest(new_transcripts)
        ) INTO removed_transcripts;
        
        -- Add this client to newly added meeting_transcripts
        IF array_length(added_transcripts, 1) > 0 THEN
            UPDATE meeting_transcripts 
            SET client_id = CASE 
                WHEN client_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(client_id) THEN client_id
                WHEN array_length(client_id, 1) > 0 THEN array_cat(ARRAY[COALESCE(NEW.id, OLD.id)], client_id[2:])  -- Replace first element
                ELSE array_append(client_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_transcripts);
        END IF;
        
        -- Remove this client from removed meeting_transcripts
        IF array_length(removed_transcripts, 1) > 0 THEN
            UPDATE meeting_transcripts 
            SET client_id = array_remove(client_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_transcripts);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When meeting_transcripts.client_id array changes, update clients.meeting_transcript_id arrays  
-- *** KEY CHANGE: REPLACES FIRST ELEMENT INSTEAD OF APPENDING ***
CREATE OR REPLACE FUNCTION sync_meeting_transcripts_to_clients()
RETURNS trigger AS $$
DECLARE
    added_clients INT[];
    removed_clients INT[];
    old_clients INT[];
    new_clients INT[];
BEGIN
    -- Handle different trigger operations
    old_clients := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.client_id, ARRAY[]::INT[])
                        WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.client_id, ARRAY[]::INT[])
                        ELSE ARRAY[]::INT[] END;
                        
    new_clients := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.client_id, ARRAY[]::INT[])
                        WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.client_id, ARRAY[]::INT[])
                        ELSE ARRAY[]::INT[] END;

    -- Only proceed if client_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_clients, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_clients, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_clients IS DISTINCT FROM new_clients) THEN
        
        -- Find clients that were added
        SELECT ARRAY(
            SELECT unnest(new_clients)
            EXCEPT
            SELECT unnest(old_clients)
        ) INTO added_clients;
        
        -- Find clients that were removed
        SELECT ARRAY(
            SELECT unnest(old_clients)
            EXCEPT
            SELECT unnest(new_clients)
        ) INTO removed_clients;
        
        -- Add this meeting_transcript to newly added clients
        -- *** CHANGE: REPLACES FIRST ELEMENT INSTEAD OF APPENDING ***
        IF array_length(added_clients, 1) > 0 THEN
            UPDATE clients 
            SET meeting_transcript_id = CASE 
                WHEN meeting_transcript_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(meeting_transcript_id) THEN meeting_transcript_id
                ELSE array_append(meeting_transcript_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_clients);
        END IF;
        
        -- Remove this meeting_transcript from removed clients
        IF array_length(removed_clients, 1) > 0 THEN
            UPDATE clients 
            SET meeting_transcript_id = array_remove(meeting_transcript_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_clients);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for clients table
DROP TRIGGER IF EXISTS trigger_sync_clients_to_meeting_transcripts ON clients;
CREATE TRIGGER trigger_sync_clients_to_meeting_transcripts
    AFTER INSERT OR UPDATE OR DELETE ON clients
    FOR EACH ROW EXECUTE FUNCTION sync_clients_to_meeting_transcripts();

-- Create triggers for meeting_transcripts table (for clients sync)
DROP TRIGGER IF EXISTS trigger_sync_meeting_transcripts_to_clients ON meeting_transcripts;
CREATE TRIGGER trigger_sync_meeting_transcripts_to_clients
    AFTER INSERT OR UPDATE OR DELETE ON meeting_transcripts
    FOR EACH ROW EXECUTE FUNCTION sync_meeting_transcripts_to_clients();

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN PROJECTS AND MEETING_TRANSCRIPTS
-- =============================================================================

-- TRIGGER 1: When projects.meeting_transcript_id array changes, update meeting_transcripts.project_id arrays
CREATE OR REPLACE FUNCTION sync_projects_to_meeting_transcripts()
RETURNS trigger AS $$
DECLARE
    added_transcripts INT[];
    removed_transcripts INT[];
    old_transcripts INT[];
    new_transcripts INT[];
BEGIN
    -- Handle different trigger operations
    old_transcripts := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.meeting_transcript_id, ARRAY[]::INT[])
                            WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.meeting_transcript_id, ARRAY[]::INT[])
                            ELSE ARRAY[]::INT[] END;
                            
    new_transcripts := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.meeting_transcript_id, ARRAY[]::INT[])
                            WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.meeting_transcript_id, ARRAY[]::INT[])
                            ELSE ARRAY[]::INT[] END;

    -- Only proceed if meeting_transcript_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_transcripts, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_transcripts, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_transcripts IS DISTINCT FROM new_transcripts) THEN
        
        -- Find transcripts that were added
        SELECT ARRAY(
            SELECT unnest(new_transcripts)
            EXCEPT
            SELECT unnest(old_transcripts)
        ) INTO added_transcripts;
        
        -- Find transcripts that were removed  
        SELECT ARRAY(
            SELECT unnest(old_transcripts)
            EXCEPT
            SELECT unnest(new_transcripts)
        ) INTO removed_transcripts;
        
        -- Add this project to newly added meeting_transcripts
        -- *** CHANGE: REPLACES FIRST ELEMENT INSTEAD OF APPENDING ***
        IF array_length(added_transcripts, 1) > 0 THEN
            UPDATE meeting_transcripts 
            SET project_id = CASE 
                WHEN project_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(project_id) THEN project_id
                WHEN array_length(project_id, 1) > 0 THEN array_cat(ARRAY[COALESCE(NEW.id, OLD.id)], project_id[2:])  -- Replace first element
                ELSE array_append(project_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_transcripts);
        END IF;
        
        -- Remove this project from removed meeting_transcripts
        IF array_length(removed_transcripts, 1) > 0 THEN
            UPDATE meeting_transcripts 
            SET project_id = array_remove(project_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_transcripts);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When meeting_transcripts.project_id array changes, update projects.meeting_transcript_id arrays  
-- *** NORMAL APPENDING BEHAVIOR ***
CREATE OR REPLACE FUNCTION sync_meeting_transcripts_to_projects()
RETURNS trigger AS $$
DECLARE
    added_projects INT[];
    removed_projects INT[];
    old_projects INT[];
    new_projects INT[];
BEGIN
    -- Handle different trigger operations
    old_projects := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.project_id, ARRAY[]::INT[])
                         WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.project_id, ARRAY[]::INT[])
                         ELSE ARRAY[]::INT[] END;
                         
    new_projects := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.project_id, ARRAY[]::INT[])
                         WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.project_id, ARRAY[]::INT[])
                         ELSE ARRAY[]::INT[] END;

    -- Only proceed if project_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_projects, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_projects, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_projects IS DISTINCT FROM new_projects) THEN
        
        -- Find projects that were added
        SELECT ARRAY(
            SELECT unnest(new_projects)
            EXCEPT
            SELECT unnest(old_projects)
        ) INTO added_projects;
        
        -- Find projects that were removed
        SELECT ARRAY(
            SELECT unnest(old_projects)
            EXCEPT
            SELECT unnest(new_projects)
        ) INTO removed_projects;
        
        -- Add this meeting_transcript to newly added projects
        -- *** NORMAL APPENDING BEHAVIOR ***
        IF array_length(added_projects, 1) > 0 THEN
            UPDATE projects 
            SET meeting_transcript_id = CASE 
                WHEN meeting_transcript_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(meeting_transcript_id) THEN meeting_transcript_id
                ELSE array_append(meeting_transcript_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_projects);
        END IF;
        
        -- Remove this meeting_transcript from removed projects
        IF array_length(removed_projects, 1) > 0 THEN
            UPDATE projects 
            SET meeting_transcript_id = array_remove(meeting_transcript_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_projects);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for projects table
DROP TRIGGER IF EXISTS trigger_sync_projects_to_meeting_transcripts ON projects;
CREATE TRIGGER trigger_sync_projects_to_meeting_transcripts
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION sync_projects_to_meeting_transcripts();

-- Create triggers for meeting_transcripts table (for projects sync)
DROP TRIGGER IF EXISTS trigger_sync_meeting_transcripts_to_projects ON meeting_transcripts;
CREATE TRIGGER trigger_sync_meeting_transcripts_to_projects
    AFTER INSERT OR UPDATE OR DELETE ON meeting_transcripts
    FOR EACH ROW EXECUTE FUNCTION sync_meeting_transcripts_to_projects();


-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN MILESTONES AND MEETING_TRANSCRIPTS
-- =============================================================================

-- TRIGGER 1: When milestones.meeting_transcript_id array changes, update meeting_transcripts.milestone_id arrays
CREATE OR REPLACE FUNCTION sync_milestones_to_meeting_transcripts()
RETURNS trigger AS $$ 
DECLARE 
    added_transcripts INT[];
    removed_transcripts INT[];
    old_transcripts INT[];
    new_transcripts INT[];
BEGIN
    -- Handle different trigger operations
    old_transcripts := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.meeting_transcript_id, ARRAY[]::INT[])
                            WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.meeting_transcript_id, ARRAY[]::INT[])
                            ELSE ARRAY[]::INT[] END;
    
    new_transcripts := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.meeting_transcript_id, ARRAY[]::INT[])
                            WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.meeting_transcript_id, ARRAY[]::INT[])
                            ELSE ARRAY[]::INT[] END;

    -- Only proceed if meeting_transcript_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_transcripts, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_transcripts, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_transcripts IS DISTINCT FROM new_transcripts) THEN
        
        -- Find transcripts that were added
        SELECT ARRAY(
            SELECT unnest(new_transcripts)
            EXCEPT
            SELECT unnest(old_transcripts)
        ) INTO added_transcripts;
        
        -- Find transcripts that were removed  
        SELECT ARRAY(
            SELECT unnest(old_transcripts)
            EXCEPT
            SELECT unnest(new_transcripts)
        ) INTO removed_transcripts;
        
        -- Add this milestone to newly added meeting_transcripts
        IF array_length(added_transcripts, 1) > 0 THEN
            UPDATE meeting_transcripts 
            SET milestone_id = CASE 
                WHEN milestone_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(milestone_id) THEN milestone_id
                WHEN array_length(milestone_id, 1) > 0 THEN array_cat(ARRAY[COALESCE(NEW.id, OLD.id)], milestone_id[2:])  -- Replace first element
                ELSE array_append(milestone_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_transcripts);
        END IF;
        
        -- Remove this milestone from removed meeting_transcripts
        IF array_length(removed_transcripts, 1) > 0 THEN
            UPDATE meeting_transcripts 
            SET milestone_id = array_remove(milestone_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_transcripts);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When meeting_transcripts.milestone_id array changes, update milestones.meeting_transcript_id arrays
-- *** KEY CHANGE: REPLACES FIRST ELEMENT INSTEAD OF APPENDING ***
CREATE OR REPLACE FUNCTION sync_meeting_transcripts_to_milestones()
RETURNS trigger AS $$ 
DECLARE 
    added_milestones INT[];
    removed_milestones INT[];
    old_milestones INT[];
    new_milestones INT[];
BEGIN
    -- Handle different trigger operations
    old_milestones := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.milestone_id, ARRAY[]::INT[])
                           WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.milestone_id, ARRAY[]::INT[])
                           ELSE ARRAY[]::INT[] END;
    
    new_milestones := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.milestone_id, ARRAY[]::INT[])
                           WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.milestone_id, ARRAY[]::INT[])
                           ELSE ARRAY[]::INT[] END;

    -- Only proceed if milestone_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_milestones, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_milestones, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_milestones IS DISTINCT FROM new_milestones) THEN
        
        -- Find milestones that were added
        SELECT ARRAY(
            SELECT unnest(new_milestones)
            EXCEPT
            SELECT unnest(old_milestones)
        ) INTO added_milestones;
        
        -- Find milestones that were removed
        SELECT ARRAY(
            SELECT unnest(old_milestones)
            EXCEPT
            SELECT unnest(new_milestones)
        ) INTO removed_milestones;
        
        -- Add this meeting_transcript to newly added milestones
        -- *** CHANGE: REPLACES FIRST ELEMENT INSTEAD OF APPENDING ***
        IF array_length(added_milestones, 1) > 0 THEN
            UPDATE milestones 
            SET meeting_transcript_id = CASE 
                WHEN meeting_transcript_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(meeting_transcript_id) THEN meeting_transcript_id
                ELSE array_append(meeting_transcript_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_milestones);
        END IF;
        
        -- Remove this meeting_transcript from removed milestones
        IF array_length(removed_milestones, 1) > 0 THEN
            UPDATE milestones 
            SET meeting_transcript_id = array_remove(meeting_transcript_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_milestones);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for milestones table
DROP TRIGGER IF EXISTS trigger_sync_milestones_to_meeting_transcripts ON milestones;
CREATE TRIGGER trigger_sync_milestones_to_meeting_transcripts
    AFTER INSERT OR UPDATE OR DELETE ON milestones
    FOR EACH ROW EXECUTE FUNCTION sync_milestones_to_meeting_transcripts();

-- Create triggers for meeting_transcripts table (for milestones sync)
DROP TRIGGER IF EXISTS trigger_sync_meeting_transcripts_to_milestones ON meeting_transcripts;
CREATE TRIGGER trigger_sync_meeting_transcripts_to_milestones
    AFTER INSERT OR UPDATE OR DELETE ON meeting_transcripts
    FOR EACH ROW EXECUTE FUNCTION sync_meeting_transcripts_to_milestones();

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN GOALS AND MEETING_TRANSCRIPTS
-- =============================================================================

-- TRIGGER 1: When goals.meeting_transcript_id array changes, update meeting_transcripts.goal_id arrays
CREATE OR REPLACE FUNCTION sync_goals_to_meeting_transcripts()
RETURNS trigger AS $$ 
DECLARE 
    added_transcripts INT[];
    removed_transcripts INT[];
    old_transcripts INT[];
    new_transcripts INT[];
BEGIN
    -- Handle different trigger operations
    old_transcripts := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.meeting_transcript_id, ARRAY[]::INT[])
                            WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.meeting_transcript_id, ARRAY[]::INT[])
                            ELSE ARRAY[]::INT[] END;
    
    new_transcripts := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.meeting_transcript_id, ARRAY[]::INT[])
                            WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.meeting_transcript_id, ARRAY[]::INT[])
                            ELSE ARRAY[]::INT[] END;

    -- Only proceed if meeting_transcript_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_transcripts, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_transcripts, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_transcripts IS DISTINCT FROM new_transcripts) THEN
        
        -- Find transcripts that were added
        SELECT ARRAY(
            SELECT unnest(new_transcripts)
            EXCEPT
            SELECT unnest(old_transcripts)
        ) INTO added_transcripts;
        
        -- Find transcripts that were removed  
        SELECT ARRAY(
            SELECT unnest(old_transcripts)
            EXCEPT
            SELECT unnest(new_transcripts)
        ) INTO removed_transcripts;
        
        -- Add this goal to newly added meeting_transcripts
        IF array_length(added_transcripts, 1) > 0 THEN
            UPDATE meeting_transcripts 
            SET goal_id = CASE 
                WHEN goal_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(goal_id) THEN goal_id
                ELSE array_append(goal_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_transcripts);
        END IF;
        
        -- Remove this goal from removed meeting_transcripts
        IF array_length(removed_transcripts, 1) > 0 THEN
            UPDATE meeting_transcripts 
            SET goal_id = array_remove(goal_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_transcripts);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When meeting_transcripts.goal_id array changes, update goals.meeting_transcript_id arrays
-- *** KEY CHANGE: REPLACES FIRST ELEMENT INSTEAD OF APPENDING ***
CREATE OR REPLACE FUNCTION sync_meeting_transcripts_to_goals()
RETURNS trigger AS $$ 
DECLARE 
    added_goals INT[];
    removed_goals INT[];
    old_goals INT[];
    new_goals INT[];
BEGIN
    -- Handle different trigger operations
    old_goals := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.goal_id, ARRAY[]::INT[])
                      WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.goal_id, ARRAY[]::INT[])
                      ELSE ARRAY[]::INT[] END;
    
    new_goals := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.goal_id, ARRAY[]::INT[])
                      WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.goal_id, ARRAY[]::INT[])
                      ELSE ARRAY[]::INT[] END;

    -- Only proceed if goal_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_goals, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_goals, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_goals IS DISTINCT FROM new_goals) THEN
        
        -- Find goals that were added
        SELECT ARRAY(
            SELECT unnest(new_goals)
            EXCEPT
            SELECT unnest(old_goals)
        ) INTO added_goals;
        
        -- Find goals that were removed
        SELECT ARRAY(
            SELECT unnest(old_goals)
            EXCEPT
            SELECT unnest(new_goals)
        ) INTO removed_goals;
        
        -- Add this meeting_transcript to newly added goals
        -- *** CHANGE: REPLACES FIRST ELEMENT INSTEAD OF APPENDING ***
        IF array_length(added_goals, 1) > 0 THEN
            UPDATE goals 
            SET meeting_transcript_id = CASE 
                WHEN meeting_transcript_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(meeting_transcript_id) THEN meeting_transcript_id
                WHEN array_length(meeting_transcript_id, 1) > 0 THEN array_cat(ARRAY[COALESCE(NEW.id, OLD.id)], meeting_transcript_id[2:])  -- Replace first element
                ELSE array_append(meeting_transcript_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_goals);
        END IF;
        
        -- Remove this meeting_transcript from removed goals
        IF array_length(removed_goals, 1) > 0 THEN
            UPDATE goals 
            SET meeting_transcript_id = array_remove(meeting_transcript_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_goals);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for goals table
DROP TRIGGER IF EXISTS trigger_sync_goals_to_meeting_transcripts ON goals;
CREATE TRIGGER trigger_sync_goals_to_meeting_transcripts
    AFTER INSERT OR UPDATE OR DELETE ON goals
    FOR EACH ROW EXECUTE FUNCTION sync_goals_to_meeting_transcripts();

-- Create triggers for meeting_transcripts table (for goals sync)
DROP TRIGGER IF EXISTS trigger_sync_meeting_transcripts_to_goals ON meeting_transcripts;
CREATE TRIGGER trigger_sync_meeting_transcripts_to_goals
    AFTER INSERT OR UPDATE OR DELETE ON meeting_transcripts
    FOR EACH ROW EXECUTE FUNCTION sync_meeting_transcripts_to_goals();

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN PROJECTS AND CLIENTS
-- =============================================================================

-- TRIGGER 1: When clients.project_id array changes, update projects.client_id arrays
CREATE OR REPLACE FUNCTION sync_clients_to_projects()
RETURNS trigger AS $$ 
DECLARE 
    added_projects INT[];
    removed_projects INT[];
    old_projects INT[];
    new_projects INT[];
BEGIN
    -- Handle different trigger operations
    old_projects := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.project_id, ARRAY[]::INT[])
                         WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.project_id, ARRAY[]::INT[])
                         ELSE ARRAY[]::INT[] END;
    
    new_projects := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.project_id, ARRAY[]::INT[])
                         WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.project_id, ARRAY[]::INT[])
                         ELSE ARRAY[]::INT[] END;

    -- Only proceed if project_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_projects, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_projects, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_projects IS DISTINCT FROM new_projects) THEN
        
        -- Find projects that were added
        SELECT ARRAY(
            SELECT unnest(new_projects)
            EXCEPT
            SELECT unnest(old_projects)
        ) INTO added_projects;
        
        -- Find projects that were removed  
        SELECT ARRAY(
            SELECT unnest(old_projects)
            EXCEPT
            SELECT unnest(new_projects)
        ) INTO removed_projects;
        
        -- Add this client to newly added projects
        IF array_length(added_projects, 1) > 0 THEN
            UPDATE projects 
            SET client_id = CASE 
                WHEN client_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(client_id) THEN client_id
                WHEN array_length(client_id, 1) > 0 THEN array_cat(ARRAY[COALESCE(NEW.id, OLD.id)], client_id[2:])  -- Replace first element
                ELSE array_append(client_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_projects);
        END IF;
        
        -- Remove this client from removed projects
        IF array_length(removed_projects, 1) > 0 THEN
            UPDATE projects 
            SET client_id = array_remove(client_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_projects);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When projects.client_id array changes, update clients.project_id arrays
-- *** KEY CHANGE: REPLACES FIRST ELEMENT INSTEAD OF APPENDING ***
CREATE OR REPLACE FUNCTION sync_projects_to_clients()
RETURNS trigger AS $$ 
DECLARE 
    added_clients INT[];
    removed_clients INT[];
    old_clients INT[];
    new_clients INT[];
BEGIN
    -- Handle different trigger operations
    old_clients := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.client_id, ARRAY[]::INT[])
                        WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.client_id, ARRAY[]::INT[])
                        ELSE ARRAY[]::INT[] END;
    
    new_clients := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.client_id, ARRAY[]::INT[])
                        WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.client_id, ARRAY[]::INT[])
                        ELSE ARRAY[]::INT[] END;

    -- Only proceed if client_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_clients, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_clients, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_clients IS DISTINCT FROM new_clients) THEN
        
        -- Find clients that were added
        SELECT ARRAY(
            SELECT unnest(new_clients)
            EXCEPT
            SELECT unnest(old_clients)
        ) INTO added_clients;
        
        -- Find clients that were removed
        SELECT ARRAY(
            SELECT unnest(old_clients)
            EXCEPT
            SELECT unnest(new_clients)
        ) INTO removed_clients;
        
        -- Add this project to newly added clients
        -- *** CHANGE: REPLACES FIRST ELEMENT INSTEAD OF APPENDING ***
        IF array_length(added_clients, 1) > 0 THEN
            UPDATE clients 
            SET project_id = CASE 
                WHEN project_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(project_id) THEN project_id
                ELSE array_append(project_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_clients);
        END IF;
        
        -- Remove this project from removed clients
        IF array_length(removed_clients, 1) > 0 THEN
            UPDATE clients 
            SET project_id = array_remove(project_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_clients);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for clients table
DROP TRIGGER IF EXISTS trigger_sync_clients_to_projects ON clients;
CREATE TRIGGER trigger_sync_clients_to_projects
    AFTER INSERT OR UPDATE OR DELETE ON clients
    FOR EACH ROW EXECUTE FUNCTION sync_clients_to_projects();

-- Create triggers for projects table (for clients sync)
DROP TRIGGER IF EXISTS trigger_sync_projects_to_clients ON projects;
CREATE TRIGGER trigger_sync_projects_to_clients
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION sync_projects_to_clients();

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN PROJECTS AND GOALS
-- =============================================================================

-- TRIGGER 1: When goals.project_id array changes, update projects.goal_id arrays
CREATE OR REPLACE FUNCTION sync_goals_to_projects()
RETURNS trigger AS $$ 
DECLARE 
    added_projects INT[];
    removed_projects INT[];
    old_projects INT[];
    new_projects INT[];
BEGIN
    -- Handle different trigger operations
    old_projects := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.project_id, ARRAY[]::INT[])
                         WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.project_id, ARRAY[]::INT[])
                         ELSE ARRAY[]::INT[] END;
    
    new_projects := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.project_id, ARRAY[]::INT[])
                         WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.project_id, ARRAY[]::INT[])
                         ELSE ARRAY[]::INT[] END;

    -- Only proceed if project_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_projects, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_projects, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_projects IS DISTINCT FROM new_projects) THEN
        
        -- Find projects that were added
        SELECT ARRAY(
            SELECT unnest(new_projects)
            EXCEPT
            SELECT unnest(old_projects)
        ) INTO added_projects;
        
        -- Find projects that were removed  
        SELECT ARRAY(
            SELECT unnest(old_projects)
            EXCEPT
            SELECT unnest(new_projects)
        ) INTO removed_projects;
        
        -- Add this goal to newly added projects
        IF array_length(added_projects, 1) > 0 THEN
            UPDATE projects 
            SET goal_id = CASE 
                WHEN goal_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(goal_id) THEN goal_id
                ELSE array_append(project_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_projects);
        END IF;
        
        -- Remove this goal from removed projects
        IF array_length(removed_projects, 1) > 0 THEN
            UPDATE projects 
            SET goal_id = array_remove(goal_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_projects);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When projects.goal_id array changes, update goals.project_id arrays
-- *** KEY CHANGE: REPLACES FIRST ELEMENT INSTEAD OF APPENDING ***
CREATE OR REPLACE FUNCTION sync_projects_to_goals()
RETURNS trigger AS $$ 
DECLARE 
    added_goals INT[];
    removed_goals INT[];
    old_goals INT[];
    new_goals INT[];
BEGIN
    -- Handle different trigger operations
    old_goals := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.goal_id, ARRAY[]::INT[])
                      WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.goal_id, ARRAY[]::INT[])
                      ELSE ARRAY[]::INT[] END;
    
    new_goals := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.goal_id, ARRAY[]::INT[])
                      WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.goal_id, ARRAY[]::INT[])
                      ELSE ARRAY[]::INT[] END;

    -- Only proceed if goal_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_goals, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_goals, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_goals IS DISTINCT FROM new_goals) THEN
        
        -- Find goals that were added
        SELECT ARRAY(
            SELECT unnest(new_goals)
            EXCEPT
            SELECT unnest(old_goals)
        ) INTO added_goals;
        
        -- Find goals that were removed
        SELECT ARRAY(
            SELECT unnest(old_goals)
            EXCEPT
            SELECT unnest(new_goals)
        ) INTO removed_goals;
        
        -- Add this project to newly added goals
        -- *** CHANGE: REPLACES FIRST ELEMENT INSTEAD OF APPENDING ***
        IF array_length(added_goals, 1) > 0 THEN
            UPDATE goals 
            SET project_id = CASE 
                WHEN project_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(project_id) THEN project_id
                WHEN array_length(project_id, 1) > 0 THEN array_cat(ARRAY[COALESCE(NEW.id, OLD.id)], project_id[2:])  -- Replace first element
                ELSE array_append(project_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_goals);
        END IF;
        
        -- Remove this project from removed goals
        IF array_length(removed_goals, 1) > 0 THEN
            UPDATE goals 
            SET project_id = array_remove(project_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_goals);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for goals table
DROP TRIGGER IF EXISTS trigger_sync_goals_to_projects ON goals;
CREATE TRIGGER trigger_sync_goals_to_projects
    AFTER INSERT OR UPDATE OR DELETE ON goals
    FOR EACH ROW EXECUTE FUNCTION sync_goals_to_projects();

-- Create triggers for projects table (for goals sync)
DROP TRIGGER IF EXISTS trigger_sync_projects_to_goals ON projects;
CREATE TRIGGER trigger_sync_projects_to_goals
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW EXECUTE FUNCTION sync_projects_to_goals();

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN GOALS AND CLIENTS
-- =============================================================================

-- TRIGGER 1: When clients.goal_id array changes, update goals.client_id arrays
CREATE OR REPLACE FUNCTION sync_clients_to_goals()
RETURNS trigger AS $$ 
DECLARE 
    added_goals INT[];
    removed_goals INT[];
    old_goals INT[];
    new_goals INT[];
BEGIN
    -- Handle different trigger operations
    old_goals := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.goal_id, ARRAY[]::INT[])
                      WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.goal_id, ARRAY[]::INT[])
                      ELSE ARRAY[]::INT[] END;
    
    new_goals := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.goal_id, ARRAY[]::INT[])
                      WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.goal_id, ARRAY[]::INT[])
                      ELSE ARRAY[]::INT[] END;

    -- Only proceed if goal_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_goals, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_goals, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_goals IS DISTINCT FROM new_goals) THEN
        
        -- Find goals that were added
        SELECT ARRAY(
            SELECT unnest(new_goals)
            EXCEPT
            SELECT unnest(old_goals)
        ) INTO added_goals;
        
        -- Find goals that were removed  
        SELECT ARRAY(
            SELECT unnest(old_goals)
            EXCEPT
            SELECT unnest(new_goals)
        ) INTO removed_goals;
        
        -- Add this client to newly added goals
        IF array_length(added_goals, 1) > 0 THEN
            UPDATE goals 
            SET client_id = CASE 
                WHEN client_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(client_id) THEN client_id
                ELSE array_append(client_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_goals);
        END IF;
        
        -- Remove this client from removed goals
        IF array_length(removed_goals, 1) > 0 THEN
            UPDATE goals 
            SET client_id = array_remove(client_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_goals);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When goals.client_id array changes, update clients.goal_id arrays
-- *** KEY CHANGE: REPLACES FIRST ELEMENT INSTEAD OF APPENDING ***
CREATE OR REPLACE FUNCTION sync_goals_to_clients()
RETURNS trigger AS $$ 
DECLARE 
    added_clients INT[];
    removed_clients INT[];
    old_clients INT[];
    new_clients INT[];
BEGIN
    -- Handle different trigger operations
    old_clients := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.client_id, ARRAY[]::INT[])
                        WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.client_id, ARRAY[]::INT[])
                        ELSE ARRAY[]::INT[] END;
    
    new_clients := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.client_id, ARRAY[]::INT[])
                        WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.client_id, ARRAY[]::INT[])
                        ELSE ARRAY[]::INT[] END;

    -- Only proceed if client_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_clients, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_clients, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_clients IS DISTINCT FROM new_clients) THEN
        
        -- Find clients that were added
        SELECT ARRAY(
            SELECT unnest(new_clients)
            EXCEPT
            SELECT unnest(old_clients)
        ) INTO added_clients;
        
        -- Find clients that were removed
        SELECT ARRAY(
            SELECT unnest(old_clients)
            EXCEPT
            SELECT unnest(new_clients)
        ) INTO removed_clients;
        
        -- Add this goal to newly added clients
        -- *** CHANGE: REPLACES FIRST ELEMENT INSTEAD OF APPENDING ***
        IF array_length(added_clients, 1) > 0 THEN
            UPDATE clients 
            SET goal_id = CASE 
                WHEN goal_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(goal_id) THEN goal_id
                WHEN array_length(goal_id, 1) > 0 THEN array_cat(ARRAY[COALESCE(NEW.id, OLD.id)], goal_id[2:])  -- Replace first element
                ELSE array_append(goal_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_clients);
        END IF;
        
        -- Remove this goal from removed clients
        IF array_length(removed_clients, 1) > 0 THEN
            UPDATE clients 
            SET goal_id = array_remove(goal_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_clients);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for clients table
DROP TRIGGER IF EXISTS trigger_sync_clients_to_goals ON clients;
CREATE TRIGGER trigger_sync_clients_to_goals
    AFTER INSERT OR UPDATE OR DELETE ON clients
    FOR EACH ROW EXECUTE FUNCTION sync_clients_to_goals();

-- Create triggers for goals table (for clients sync)
DROP TRIGGER IF EXISTS trigger_sync_goals_to_clients ON goals;
CREATE TRIGGER trigger_sync_goals_to_clients
    AFTER INSERT OR UPDATE OR DELETE ON goals
    FOR EACH ROW EXECUTE FUNCTION sync_goals_to_clients();

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN CLIENTS AND MILESTONES
-- =============================================================================

-- TRIGGER 1: When clients.milestone_id array changes, update milestones.client_id arrays
CREATE OR REPLACE FUNCTION sync_clients_to_milestones()
RETURNS trigger AS $$ 
DECLARE 
    added_milestones INT[];
    removed_milestones INT[];
    old_milestones INT[];
    new_milestones INT[];
BEGIN
    -- Handle different trigger operations
    old_milestones := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.milestone_id, ARRAY[]::INT[])
                           WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.milestone_id, ARRAY[]::INT[])
                           ELSE ARRAY[]::INT[] END;
    
    new_milestones := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.milestone_id, ARRAY[]::INT[])
                           WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.milestone_id, ARRAY[]::INT[])
                           ELSE ARRAY[]::INT[] END;

    -- Only proceed if milestone_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_milestones, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_milestones, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_milestones IS DISTINCT FROM new_milestones) THEN
        
        -- Find milestones that were added
        SELECT ARRAY(
            SELECT unnest(new_milestones)
            EXCEPT
            SELECT unnest(old_milestones)
        ) INTO added_milestones;
        
        -- Find milestones that were removed  
        SELECT ARRAY(
            SELECT unnest(old_milestones)
            EXCEPT
            SELECT unnest(new_milestones)
        ) INTO removed_milestones;
        
        -- Add this client to newly added milestones
        IF array_length(added_milestones, 1) > 0 THEN
            UPDATE milestones 
            SET client_id = CASE 
                WHEN client_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(client_id) THEN client_id
                ELSE array_append(client_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_milestones);
        END IF;
        
        -- Remove this client from removed milestones
        IF array_length(removed_milestones, 1) > 0 THEN
            UPDATE milestones 
            SET client_id = array_remove(client_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_milestones);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When milestones.client_id array changes, update clients.milestone_id arrays
-- *** KEY CHANGE: REPLACES FIRST ELEMENT INSTEAD OF APPENDING ***
CREATE OR REPLACE FUNCTION sync_milestones_to_clients()
RETURNS trigger AS $$ 
DECLARE 
    added_clients INT[];
    removed_clients INT[];
    old_clients INT[];
    new_clients INT[];
BEGIN
    -- Handle different trigger operations
    old_clients := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.client_id, ARRAY[]::INT[])
                        WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.client_id, ARRAY[]::INT[])
                        ELSE ARRAY[]::INT[] END;
    
    new_clients := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.client_id, ARRAY[]::INT[])
                        WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.client_id, ARRAY[]::INT[])
                        ELSE ARRAY[]::INT[] END;

    -- Only proceed if client_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_clients, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_clients, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_clients IS DISTINCT FROM new_clients) THEN
        
        -- Find clients that were added
        SELECT ARRAY(
            SELECT unnest(new_clients)
            EXCEPT
            SELECT unnest(old_clients)
        ) INTO added_clients;
        
        -- Find clients that were removed
        SELECT ARRAY(
            SELECT unnest(old_clients)
            EXCEPT
            SELECT unnest(new_clients)
        ) INTO removed_clients;
        
        -- Add this milestone to newly added clients
        -- *** CHANGE: REPLACES FIRST ELEMENT INSTEAD OF APPENDING ***
        IF array_length(added_clients, 1) > 0 THEN
            UPDATE clients 
            SET milestone_id = CASE 
                WHEN milestone_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(milestone_id) THEN milestone_id
                ELSE array_append(milestone_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_clients);
        END IF;
        
        -- Remove this milestone from removed clients
        IF array_length(removed_clients, 1) > 0 THEN
            UPDATE clients 
            SET milestone_id = array_remove(milestone_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_clients);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers for clients table
DROP TRIGGER IF EXISTS trigger_sync_clients_to_milestones ON clients;
CREATE TRIGGER trigger_sync_clients_to_milestones
    AFTER INSERT OR UPDATE OR DELETE ON clients
    FOR EACH ROW EXECUTE FUNCTION sync_clients_to_milestones();

-- Create triggers for milestones table (for clients sync)
DROP TRIGGER IF EXISTS trigger_sync_milestones_to_clients ON milestones;
CREATE TRIGGER trigger_sync_milestones_to_clients
    AFTER INSERT OR UPDATE OR DELETE ON milestones
    FOR EACH ROW EXECUTE FUNCTION sync_milestones_to_clients();

