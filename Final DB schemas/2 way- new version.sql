-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN BRIEFINGS AND CLIENTS
-- =============================================================================

-- TRIGGER 1: When briefings.client_id array changes, update clients.briefing_id arrays
CREATE OR REPLACE FUNCTION sync_briefings_to_clients()
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
        
        -- Add this briefing to newly added clients
        IF array_length(added_clients, 1) > 0 THEN
            UPDATE clients 
            SET briefing_id = CASE 
                WHEN briefing_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(briefing_id) THEN briefing_id
                ELSE array_append(briefing_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_clients);
        END IF;
        
        -- Remove this briefing from removed clients
        IF array_length(removed_clients, 1) > 0 THEN
            UPDATE clients 
            SET briefing_id = array_remove(briefing_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_clients);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When clients.briefing_id array changes, update briefings.client_id arrays  
CREATE OR REPLACE FUNCTION sync_clients_to_briefings()
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
        
        -- Add this client to newly added briefings
        IF array_length(added_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET client_id = CASE 
                WHEN client_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(client_id) THEN client_id
                WHEN array_length(client_id, 1) > 0 THEN array_cat(ARRAY[COALESCE(NEW.id, OLD.id)], client_id[2:])
                ELSE array_append(client_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_briefings);
        END IF;
        
        -- Remove this client from removed briefings
        IF array_length(removed_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET client_id = array_remove(client_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_briefings);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN BRIEFINGS AND PROJECTS
-- =============================================================================

-- TRIGGER 1: When briefings.project_id array changes, update projects.briefing_id arrays
CREATE OR REPLACE FUNCTION sync_briefings_to_projects()
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
        
        -- Add this briefing to newly added projects
        IF array_length(added_projects, 1) > 0 THEN
            UPDATE projects 
            SET briefing_id = CASE 
                WHEN briefing_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(briefing_id) THEN briefing_id
                WHEN array_length(briefing_id, 1) > 0 THEN array_cat(ARRAY[COALESCE(NEW.id, OLD.id)], briefing_id[2:])
                ELSE array_append(briefing_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_projects);
        END IF;
        
        -- Remove this briefing from removed projects
        IF array_length(removed_projects, 1) > 0 THEN
            UPDATE projects 
            SET briefing_id = array_remove(briefing_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_projects);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When projects.briefing_id array changes, update briefings.project_id arrays  
CREATE OR REPLACE FUNCTION sync_projects_to_briefings()
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
        
        -- Add this project to newly added briefings
        IF array_length(added_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET project_id = CASE 
                WHEN project_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(project_id) THEN project_id
                WHEN array_length(project_id, 1) > 0 THEN array_cat(ARRAY[COALESCE(NEW.id, OLD.id)], project_id[2:])
                ELSE array_append(project_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_briefings);
        END IF;
        
        -- Remove this project from removed briefings
        IF array_length(removed_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET project_id = array_remove(project_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_briefings);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN BRIEFINGS AND GOALS
-- =============================================================================

-- TRIGGER 1: When briefings.outcome_id array changes, update goals.briefing_id arrays
CREATE OR REPLACE FUNCTION sync_briefings_to_goals()
RETURNS trigger AS $$
DECLARE
    added_goals INT[];
    removed_goals INT[];
    old_goals INT[];
    new_goals INT[];
BEGIN
    -- Handle different trigger operations
    old_goals := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.outcome_id, ARRAY[]::INT[])
                      WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.outcome_id, ARRAY[]::INT[])
                      ELSE ARRAY[]::INT[] END;
                      
    new_goals := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.outcome_id, ARRAY[]::INT[])
                      WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.outcome_id, ARRAY[]::INT[])
                      ELSE ARRAY[]::INT[] END;

    -- Only proceed if outcome_id array actually changed or we're doing INSERT/DELETE
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
        
        -- Add this briefing to newly added goals
        IF array_length(added_goals, 1) > 0 THEN
            UPDATE goals 
            SET briefing_id = CASE 
                WHEN briefing_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(briefing_id) THEN briefing_id
                ELSE array_append(briefing_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_goals);
        END IF;
        
        -- Remove this briefing from removed goals
        IF array_length(removed_goals, 1) > 0 THEN
            UPDATE goals 
            SET briefing_id = array_remove(briefing_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_goals);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When goals.briefing_id array changes, update briefings.outcome_id arrays  
CREATE OR REPLACE FUNCTION sync_goals_to_briefings()
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
        
        -- Add this goal to newly added briefings
        IF array_length(added_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET outcome_id = CASE 
                WHEN outcome_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(outcome_id) THEN outcome_id
                ELSE array_append(outcome_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_briefings);
        END IF;
        
        -- Remove this goal from removed briefings
        IF array_length(removed_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET outcome_id = array_remove(outcome_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_briefings);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN BRIEFINGS AND ASSETS
-- =============================================================================

-- TRIGGER 1: When briefings.asset_id array changes, update assets.briefing_id arrays
CREATE OR REPLACE FUNCTION sync_briefings_to_assets()
RETURNS trigger AS $$
DECLARE
    added_assets   INT[];
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

-- TRIGGER 2: When assets.briefing_id array changes, update briefings.asset_id arrays  
CREATE OR REPLACE FUNCTION sync_assets_to_briefings()
RETURNS trigger AS $$
DECLARE
    added_briefings   INT[];
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

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN BRIEFINGS AND TASKS
-- =============================================================================

-- TRIGGER 1: When briefings.task_id array changes, update tasks.briefing_id arrays
CREATE OR REPLACE FUNCTION sync_briefings_to_tasks()
RETURNS trigger AS $$
DECLARE
    added_tasks   INT[];
    removed_tasks INT[];
    old_tasks INT[];
    new_tasks INT[];
BEGIN
    -- Handle different trigger operations
    old_tasks := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.task_id, ARRAY[]::INT[])
                      WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.task_id, ARRAY[]::INT[])
                      ELSE ARRAY[]::INT[] END;
                      
    new_tasks := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.task_id, ARRAY[]::INT[])
                      WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.task_id, ARRAY[]::INT[])
                      ELSE ARRAY[]::INT[] END;

    -- Only proceed if task_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_tasks, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_tasks, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_tasks IS DISTINCT FROM new_tasks) THEN
        
        -- Find tasks that were added
        SELECT ARRAY(
            SELECT unnest(new_tasks)
            EXCEPT
            SELECT unnest(old_tasks)
        ) INTO added_tasks;
        
        -- Find tasks that were removed  
        SELECT ARRAY(
            SELECT unnest(old_tasks)
            EXCEPT
            SELECT unnest(new_tasks)
        ) INTO removed_tasks;
        
        -- Add this briefing to newly added tasks
        IF array_length(added_tasks, 1) > 0 THEN
            UPDATE tasks 
            SET briefing_id = CASE 
                WHEN briefing_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(briefing_id) THEN briefing_id
                ELSE array_append(briefing_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_tasks);
        END IF;
        
        -- Remove this briefing from removed tasks
        IF array_length(removed_tasks, 1) > 0 THEN
            UPDATE tasks 
            SET briefing_id = array_remove(briefing_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_tasks);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When tasks.briefing_id array changes, update briefings.task_id arrays  
CREATE OR REPLACE FUNCTION sync_tasks_to_briefings()
RETURNS trigger AS $$
DECLARE
    added_briefings   INT[];
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
        
        -- Add this task to newly added briefings
        IF array_length(added_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET task_id = CASE 
                WHEN task_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(task_id) THEN task_id
                ELSE array_append(task_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_briefings);
        END IF;
        
        -- Remove this task from removed briefings
        IF array_length(removed_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET task_id = array_remove(task_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_briefings);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN BRIEFINGS AND MEETING_TRANSCRIPTS
-- =============================================================================

-- TRIGGER 1: When briefings.meeting_transcript_id array changes, 
-- update meeting_transcripts.briefing_id arrays
CREATE OR REPLACE FUNCTION sync_briefings_to_meeting_transcripts()
RETURNS trigger AS $$
DECLARE
    added_mt   INT[];
    removed_mt INT[];
    old_mt INT[];
    new_mt INT[];
BEGIN
    -- Handle different trigger operations
    old_mt := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.meeting_transcript_id, ARRAY[]::INT[])
                   WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.meeting_transcript_id, ARRAY[]::INT[])
                   ELSE ARRAY[]::INT[] END;
                   
    new_mt := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.meeting_transcript_id, ARRAY[]::INT[])
                   WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.meeting_transcript_id, ARRAY[]::INT[])
                   ELSE ARRAY[]::INT[] END;

    -- Only proceed if meeting_transcript_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_mt, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_mt, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_mt IS DISTINCT FROM new_mt) THEN
        
        -- Find meeting_transcripts that were added
        SELECT ARRAY(
            SELECT unnest(new_mt)
            EXCEPT
            SELECT unnest(old_mt)
        ) INTO added_mt;
        
        -- Find meeting_transcripts that were removed  
        SELECT ARRAY(
            SELECT unnest(old_mt)
            EXCEPT
            SELECT unnest(new_mt)
        ) INTO removed_mt;
        
        -- Add this briefing to newly added meeting_transcripts
        IF array_length(added_mt, 1) > 0 THEN
            UPDATE meeting_transcripts 
            SET briefing_id = CASE 
                WHEN briefing_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(briefing_id) THEN briefing_id
                ELSE array_append(briefing_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_mt);
        END IF;
        
        -- Remove this briefing from removed meeting_transcripts
        IF array_length(removed_mt, 1) > 0 THEN
            UPDATE meeting_transcripts 
            SET briefing_id = array_remove(briefing_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_mt);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When meeting_transcripts.briefing_id array changes, 
-- update briefings.meeting_transcript_id arrays  
CREATE OR REPLACE FUNCTION sync_meeting_transcripts_to_briefings()
RETURNS trigger AS $$
DECLARE
    added_briefings   INT[];
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
        
        -- Add this meeting_transcript to newly added briefings
        IF array_length(added_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET meeting_transcript_id = CASE 
                WHEN meeting_transcript_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(meeting_transcript_id) THEN meeting_transcript_id
                ELSE array_append(meeting_transcript_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_briefings);
        END IF;
        
        -- Remove this meeting_transcript from removed briefings
        IF array_length(removed_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET meeting_transcript_id = array_remove(meeting_transcript_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_briefings);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN BRIEFINGS AND MILESTONES
-- =============================================================================

-- TRIGGER 1: When briefings.milestone_id array changes, update milestones.briefing_id arrays
CREATE OR REPLACE FUNCTION sync_briefings_to_milestones()
RETURNS trigger AS $$
DECLARE
    added_milestones   INT[];
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
        
        -- Add this briefing to newly added milestones
        IF array_length(added_milestones, 1) > 0 THEN
            UPDATE milestones 
            SET briefing_id = CASE 
                WHEN briefing_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(briefing_id) THEN briefing_id
                WHEN array_length(briefing_id, 1) > 0 THEN array_cat(ARRAY[COALESCE(NEW.id, OLD.id)], briefing_id[2:])
                ELSE array_append(briefing_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_milestones);
        END IF;
        
        -- Remove this briefing from removed milestones
        IF array_length(removed_milestones, 1) > 0 THEN
            UPDATE milestones 
            SET briefing_id = array_remove(briefing_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_milestones);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When milestones.briefing_id array changes, update briefings.milestone_id arrays  
CREATE OR REPLACE FUNCTION sync_milestones_to_briefings()
RETURNS trigger AS $$
DECLARE
    added_briefings   INT[];
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
        
        -- Add this milestone to newly added briefings
        IF array_length(added_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET milestone_id = CASE 
                WHEN milestone_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(milestone_id) THEN milestone_id
                ELSE array_append(milestone_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_briefings);
        END IF;
        
        -- Remove this milestone from removed briefings
        IF array_length(removed_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET milestone_id = array_remove(milestone_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_briefings);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN TASKS AND PROJECTS
-- =============================================================================

-- TRIGGER 1: When tasks.project_id array changes, update projects.task_id arrays
CREATE OR REPLACE FUNCTION sync_tasks_to_projects()
RETURNS trigger AS $$
DECLARE
    added_projects   INT[];
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
        
        -- Add this task to newly added projects
        IF array_length(added_projects, 1) > 0 THEN
            UPDATE projects 
            SET task_id = CASE 
                WHEN task_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(task_id) THEN task_id
                ELSE array_append(task_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_projects);
        END IF;
        
        -- Remove this task from removed projects
        IF array_length(removed_projects, 1) > 0 THEN
            UPDATE projects 
            SET task_id = array_remove(task_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_projects);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When projects.task_id array changes, update tasks.project_id arrays  
CREATE OR REPLACE FUNCTION sync_projects_to_tasks()
RETURNS trigger AS $$
DECLARE
    added_tasks   INT[];
    removed_tasks INT[];
    old_tasks INT[];
    new_tasks INT[];
BEGIN
    -- Handle different trigger operations
    old_tasks := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.task_id, ARRAY[]::INT[])
                      WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.task_id, ARRAY[]::INT[])
                      ELSE ARRAY[]::INT[] END;
                      
    new_tasks := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.task_id, ARRAY[]::INT[])
                      WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.task_id, ARRAY[]::INT[])
                      ELSE ARRAY[]::INT[] END;

    -- Only proceed if task_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_tasks, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_tasks, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_tasks IS DISTINCT FROM new_tasks) THEN
        
        -- Find tasks that were added
        SELECT ARRAY(
            SELECT unnest(new_tasks)
            EXCEPT
            SELECT unnest(old_tasks)
        ) INTO added_tasks;
        
        -- Find tasks that were removed
        SELECT ARRAY(
            SELECT unnest(old_tasks)
            EXCEPT
            SELECT unnest(new_tasks)
        ) INTO removed_tasks;
        
        -- Add this project to newly added tasks
        IF array_length(added_tasks, 1) > 0 THEN
            UPDATE tasks 
            SET project_id = CASE 
                WHEN project_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(project_id) THEN project_id
                ELSE array_append(project_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_tasks);
        END IF;
        
        -- Remove this project from removed tasks
        IF array_length(removed_tasks, 1) > 0 THEN
            UPDATE tasks 
            SET project_id = array_remove(project_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_tasks);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN TASKS AND ASSETS
-- =============================================================================

-- TRIGGER 1: When tasks.asset_id array changes, update assets.task_id arrays
CREATE OR REPLACE FUNCTION sync_tasks_to_assets()
RETURNS trigger AS $$
DECLARE
    added_assets   INT[];
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
        
        -- Add this task to newly added assets
        IF array_length(added_assets, 1) > 0 THEN
            UPDATE assets 
            SET task_id = CASE 
                WHEN task_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(task_id) THEN task_id
                ELSE array_append(task_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_assets);
        END IF;
        
        -- Remove this task from removed assets
        IF array_length(removed_assets, 1) > 0 THEN
            UPDATE assets 
            SET task_id = array_remove(task_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_assets);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When assets.task_id array changes, update tasks.asset_id arrays  
CREATE OR REPLACE FUNCTION sync_assets_to_tasks()
RETURNS trigger AS $$
DECLARE
    added_tasks   INT[];
    removed_tasks INT[];
    old_tasks INT[];
    new_tasks INT[];
BEGIN
    -- Handle different trigger operations
    old_tasks := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.task_id, ARRAY[]::INT[])
                      WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.task_id, ARRAY[]::INT[])
                      ELSE ARRAY[]::INT[] END;
                      
    new_tasks := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.task_id, ARRAY[]::INT[])
                      WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.task_id, ARRAY[]::INT[])
                      ELSE ARRAY[]::INT[] END;

    -- Only proceed if task_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_tasks, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_tasks, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_tasks IS DISTINCT FROM new_tasks) THEN
        
        -- Find tasks that were added
        SELECT ARRAY(
            SELECT unnest(new_tasks)
            EXCEPT
            SELECT unnest(old_tasks)
        ) INTO added_tasks;
        
        -- Find tasks that were removed
        SELECT ARRAY(
            SELECT unnest(old_tasks)
            EXCEPT
            SELECT unnest(new_tasks)
        ) INTO removed_tasks;
        
        -- Add this asset to newly added tasks
        IF array_length(added_tasks, 1) > 0 THEN
            UPDATE tasks 
            SET asset_id = CASE 
                WHEN asset_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(asset_id) THEN asset_id
                ELSE array_append(asset_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_tasks);
        END IF;
        
        -- Remove this asset from removed tasks
        IF array_length(removed_tasks, 1) > 0 THEN
            UPDATE tasks 
            SET asset_id = array_remove(asset_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_tasks);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN TASKS AND MEETING_TRANSCRIPTS
-- =============================================================================

-- TRIGGER 1: When tasks.meeting_transcript_id array changes, 
-- update meeting_transcripts.task_id arrays
CREATE OR REPLACE FUNCTION sync_tasks_to_meeting_transcripts()
RETURNS trigger AS $$
DECLARE
    added_mt   INT[];
    removed_mt INT[];
    old_mt INT[];
    new_mt INT[];
BEGIN
    -- Handle different trigger operations
    old_mt := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.meeting_transcript_id, ARRAY[]::INT[])
                   WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.meeting_transcript_id, ARRAY[]::INT[])
                   ELSE ARRAY[]::INT[] END;
                   
    new_mt := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.meeting_transcript_id, ARRAY[]::INT[])
                   WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.meeting_transcript_id, ARRAY[]::INT[])
                   ELSE ARRAY[]::INT[] END;

    -- Only proceed if meeting_transcript_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_mt, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_mt, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_mt IS DISTINCT FROM new_mt) THEN
        
        -- Find meeting_transcripts that were added
        SELECT ARRAY(
            SELECT unnest(new_mt)
            EXCEPT
            SELECT unnest(old_mt)
        ) INTO added_mt;
        
        -- Find meeting_transcripts that were removed  
        SELECT ARRAY(
            SELECT unnest(old_mt)
            EXCEPT
            SELECT unnest(new_mt)
        ) INTO removed_mt;
        
        -- Add this task to newly added meeting_transcripts
        IF array_length(added_mt, 1) > 0 THEN
            UPDATE meeting_transcripts 
            SET task_id = CASE 
                WHEN task_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(task_id) THEN task_id
                WHEN array_length(task_id, 1) > 0 THEN array_cat(ARRAY[COALESCE(NEW.id, OLD.id)], task_id[2:])
                ELSE array_append(task_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_mt);
        END IF;
        
        -- Remove this task from removed meeting_transcripts
        IF array_length(removed_mt, 1) > 0 THEN
            UPDATE meeting_transcripts 
            SET task_id = array_remove(task_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_mt);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When meeting_transcripts.task_id array changes, 
-- update tasks.meeting_transcript_id arrays  
CREATE OR REPLACE FUNCTION sync_meeting_transcripts_to_tasks()
RETURNS trigger AS $$
DECLARE
    added_tasks   INT[];
    removed_tasks INT[];
    old_tasks INT[];
    new_tasks INT[];
BEGIN
    -- Handle different trigger operations
    old_tasks := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.task_id, ARRAY[]::INT[])
                      WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.task_id, ARRAY[]::INT[])
                      ELSE ARRAY[]::INT[] END;
                      
    new_tasks := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.task_id, ARRAY[]::INT[])
                      WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.task_id, ARRAY[]::INT[])
                      ELSE ARRAY[]::INT[] END;

    -- Only proceed if task_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_tasks, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_tasks, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_tasks IS DISTINCT FROM new_tasks) THEN
        
        -- Find tasks that were added
        SELECT ARRAY(
            SELECT unnest(new_tasks)
            EXCEPT
            SELECT unnest(old_tasks)
        ) INTO added_tasks;
        
        -- Find tasks that were removed
        SELECT ARRAY(
            SELECT unnest(old_tasks)
            EXCEPT
            SELECT unnest(new_tasks)
        ) INTO removed_tasks;
        
        -- Add this meeting_transcript to newly added tasks
        IF array_length(added_tasks, 1) > 0 THEN
            UPDATE tasks 
            SET meeting_transcript_id = CASE 
                WHEN meeting_transcript_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(meeting_transcript_id) THEN meeting_transcript_id
                ELSE array_append(meeting_transcript_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_tasks);
        END IF;
        
        -- Remove this meeting_transcript from removed tasks
        IF array_length(removed_tasks, 1) > 0 THEN
            UPDATE tasks 
            SET meeting_transcript_id = array_remove(meeting_transcript_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_tasks);
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

--=============================================================================
-- BIDIRECTIONAL SYNC BETWEEN TASKS AND TASKS (OCCURRENCES)
-- =============================================================================

-- TRIGGER 1: When tasks.occurences_id array changes, update other tasks' occurences_id arrays
CREATE OR REPLACE FUNCTION sync_tasks_to_occurrences()
RETURNS trigger AS $$
DECLARE
    added_occurrences INT[];
    removed_occurrences INT[];
    old_occurrences INT[];
    new_occurrences INT[];
BEGIN
    -- Handle different trigger operations
    old_occurrences := CASE WHEN TG_OP = 'DELETE' THEN COALESCE(OLD.occurences_id, ARRAY[]::INT[])
                            WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.occurences_id, ARRAY[]::INT[])
                            ELSE ARRAY[]::INT[] END;
                            
    new_occurrences := CASE WHEN TG_OP = 'INSERT' THEN COALESCE(NEW.occurences_id, ARRAY[]::INT[])
                            WHEN TG_OP = 'UPDATE' THEN COALESCE(NEW.occurences_id, ARRAY[]::INT[])
                            ELSE ARRAY[]::INT[] END;

    -- Only proceed if occurences_id array actually changed or we're doing INSERT/DELETE
    IF (TG_OP = 'INSERT' AND array_length(new_occurrences, 1) > 0) OR
       (TG_OP = 'DELETE' AND array_length(old_occurrences, 1) > 0) OR
       (TG_OP = 'UPDATE' AND old_occurrences IS DISTINCT FROM new_occurrences) THEN
        
        -- Find occurrences that were added
        SELECT ARRAY(
            SELECT unnest(new_occurrences)
            EXCEPT
            SELECT unnest(old_occurrences)
        ) INTO added_occurrences;
        
        -- Find occurrences that were removed  
        SELECT ARRAY(
            SELECT unnest(old_occurrences)
            EXCEPT
            SELECT unnest(new_occurrences)
        ) INTO removed_occurrences;
        
        -- Add this task to newly added occurrence tasks
        IF array_length(added_occurrences, 1) > 0 THEN
            UPDATE tasks 
            SET occurences_id = CASE 
                WHEN occurences_id IS NULL THEN ARRAY[COALESCE(NEW.id, OLD.id)]
                WHEN COALESCE(NEW.id, OLD.id) = ANY(occurences_id) THEN occurences_id
                ELSE array_append(occurences_id, COALESCE(NEW.id, OLD.id))
            END
            WHERE id = ANY(added_occurrences) AND id != COALESCE(NEW.id, OLD.id); -- Avoid self-reference
        END IF;
        
        -- Remove this task from removed occurrence tasks
        IF array_length(removed_occurrences, 1) > 0 THEN
            UPDATE tasks 
            SET occurences_id = array_remove(occurences_id, COALESCE(NEW.id, OLD.id))
            WHERE id = ANY(removed_occurrences) AND id != COALESCE(NEW.id, OLD.id); -- Avoid self-reference
        END IF;
        
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS sync_tasks_to_occurrences_trigger ON tasks;
CREATE TRIGGER sync_tasks_to_occurrences_trigger
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION sync_tasks_to_occurrences();

-- ===========================
-- BRIEFINGS <-> CLIENTS
-- ===========================
DROP TRIGGER IF EXISTS sync_briefings_to_clients_trigger ON briefings;
CREATE TRIGGER sync_briefings_to_clients_trigger
    AFTER INSERT OR UPDATE OR DELETE ON briefings
    FOR EACH ROW
    EXECUTE FUNCTION sync_briefings_to_clients();

DROP TRIGGER IF EXISTS sync_clients_to_briefings_trigger ON clients;
CREATE TRIGGER sync_clients_to_briefings_trigger  
    AFTER INSERT OR UPDATE OR DELETE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION sync_clients_to_briefings();

-- ===========================
-- BRIEFINGS <-> PROJECTS
-- ===========================
DROP TRIGGER IF EXISTS sync_briefings_to_projects_trigger ON briefings;
CREATE TRIGGER sync_briefings_to_projects_trigger
    AFTER INSERT OR UPDATE OR DELETE ON briefings
    FOR EACH ROW
    EXECUTE FUNCTION sync_briefings_to_projects();

DROP TRIGGER IF EXISTS sync_projects_to_briefings_trigger ON projects;
CREATE TRIGGER sync_projects_to_briefings_trigger  
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION sync_projects_to_briefings();

-- ===========================
-- BRIEFINGS <-> GOALS
-- ===========================
DROP TRIGGER IF EXISTS sync_briefings_to_goals_trigger ON briefings;
CREATE TRIGGER sync_briefings_to_goals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON briefings
    FOR EACH ROW
    EXECUTE FUNCTION sync_briefings_to_goals();

DROP TRIGGER IF EXISTS sync_goals_to_briefings_trigger ON goals;
CREATE TRIGGER sync_goals_to_briefings_trigger  
    AFTER INSERT OR UPDATE OR DELETE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION sync_goals_to_briefings();

-- ===========================
-- BRIEFINGS <-> ASSETS
-- ===========================
DROP TRIGGER IF EXISTS sync_briefings_to_assets_trigger ON briefings;
CREATE TRIGGER sync_briefings_to_assets_trigger
    AFTER INSERT OR UPDATE OR DELETE ON briefings
    FOR EACH ROW
    EXECUTE FUNCTION sync_briefings_to_assets();

DROP TRIGGER IF EXISTS sync_assets_to_briefings_trigger ON assets;
CREATE TRIGGER sync_assets_to_briefings_trigger  
    AFTER INSERT OR UPDATE OR DELETE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION sync_assets_to_briefings();

-- ===========================
-- BRIEFINGS <-> TASKS
-- ===========================
DROP TRIGGER IF EXISTS sync_briefings_to_tasks_trigger ON briefings;
CREATE TRIGGER sync_briefings_to_tasks_trigger
    AFTER INSERT OR UPDATE OR DELETE ON briefings
    FOR EACH ROW
    EXECUTE FUNCTION sync_briefings_to_tasks();

DROP TRIGGER IF EXISTS sync_tasks_to_briefings_trigger ON tasks;
CREATE TRIGGER sync_tasks_to_briefings_trigger  
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION sync_tasks_to_briefings();

-- ===========================
-- BRIEFINGS <-> MEETING_TRANSCRIPTS
-- ===========================
DROP TRIGGER IF EXISTS sync_briefings_to_meeting_transcripts_trigger ON briefings;
CREATE TRIGGER sync_briefings_to_meeting_transcripts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON briefings
    FOR EACH ROW
    EXECUTE FUNCTION sync_briefings_to_meeting_transcripts();

DROP TRIGGER IF EXISTS sync_meeting_transcripts_to_briefings_trigger ON meeting_transcripts;
CREATE TRIGGER sync_meeting_transcripts_to_briefings_trigger  
    AFTER INSERT OR UPDATE OR DELETE ON meeting_transcripts
    FOR EACH ROW
    EXECUTE FUNCTION sync_meeting_transcripts_to_briefings();

-- ===========================
-- BRIEFINGS <-> MILESTONES
-- ===========================
DROP TRIGGER IF EXISTS sync_briefings_to_milestones_trigger ON briefings;
CREATE TRIGGER sync_briefings_to_milestones_trigger
    AFTER INSERT OR UPDATE OR DELETE ON briefings
    FOR EACH ROW
    EXECUTE FUNCTION sync_briefings_to_milestones();

DROP TRIGGER IF EXISTS sync_milestones_to_briefings_trigger ON milestones;
CREATE TRIGGER sync_milestones_to_briefings_trigger  
    AFTER INSERT OR UPDATE OR DELETE ON milestones
    FOR EACH ROW
    EXECUTE FUNCTION sync_milestones_to_briefings();

-- ===========================
-- TASKS <-> PROJECTS
-- ===========================
DROP TRIGGER IF EXISTS sync_tasks_to_projects_trigger ON tasks;
CREATE TRIGGER sync_tasks_to_projects_trigger
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION sync_tasks_to_projects();

DROP TRIGGER IF EXISTS sync_projects_to_tasks_trigger ON projects;
CREATE TRIGGER sync_projects_to_tasks_trigger  
    AFTER INSERT OR UPDATE OR DELETE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION sync_projects_to_tasks();

-- ===========================
-- TASKS <-> ASSETS
-- ===========================
DROP TRIGGER IF EXISTS sync_tasks_to_assets_trigger ON tasks;
CREATE TRIGGER sync_tasks_to_assets_trigger
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION sync_tasks_to_assets();

DROP TRIGGER IF EXISTS sync_assets_to_tasks_trigger ON assets;
CREATE TRIGGER sync_assets_to_tasks_trigger  
    AFTER INSERT OR UPDATE OR DELETE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION sync_assets_to_tasks();

-- ===========================
-- TASKS <-> MEETING_TRANSCRIPTS
-- ===========================
DROP TRIGGER IF EXISTS sync_tasks_to_meeting_transcripts_trigger ON tasks;
CREATE TRIGGER sync_tasks_to_meeting_transcripts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION sync_tasks_to_meeting_transcripts();

DROP TRIGGER IF EXISTS sync_meeting_transcripts_to_tasks_trigger ON meeting_transcripts;
CREATE TRIGGER sync_meeting_transcripts_to_tasks_trigger  
    AFTER INSERT OR UPDATE OR DELETE ON meeting_transcripts
    FOR EACH ROW
    EXECUTE FUNCTION sync_meeting_transcripts_to_tasks();