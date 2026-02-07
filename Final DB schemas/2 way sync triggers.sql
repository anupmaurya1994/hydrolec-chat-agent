-- these triggers do not work on "INSERT" or "DELETE" operation

--briefings-client

-- WHEN array_length(briefing_id, 1) > 0 THEN array_cat(ARRAY[NEW.id], briefing_id[2:])  -- Replace first element
--                 ELSE array_append(briefing_id, NEW.id)

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN BRIEFINGS AND CLIENTS
-- =============================================================================

-- TRIGGER 1: When briefings.client_id array changes, update clients.briefing_id arrays
CREATE OR REPLACE FUNCTION sync_briefings_to_clients()
RETURNS trigger AS $$
DECLARE
    added_clients INT[];
    removed_clients INT[];
BEGIN
    -- Only proceed if client_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.client_id IS DISTINCT FROM NEW.client_id THEN
        
        -- Find clients that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.client_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.client_id, ARRAY[]::INT[]))
        ) INTO added_clients;
        
        -- Find clients that were removed  
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.client_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.client_id, ARRAY[]::INT[]))
        ) INTO removed_clients;
        
        -- Add this briefing to newly added clients
        IF array_length(added_clients, 1) > 0 THEN
            UPDATE clients 
            SET briefing_id = CASE 
                WHEN briefing_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(briefing_id) THEN briefing_id
                ELSE array_append(briefing_id, NEW.id)
            END
            WHERE id = ANY(added_clients);
        END IF;
        
        -- Remove this briefing from removed clients
        IF array_length(removed_clients, 1) > 0 THEN
            UPDATE clients 
            SET briefing_id = array_remove(briefing_id, NEW.id)
            WHERE id = ANY(removed_clients);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When clients.briefing_id array changes, update briefings.client_id arrays  
CREATE OR REPLACE FUNCTION sync_clients_to_briefings()
RETURNS trigger AS $$
DECLARE
    added_briefings INT[];
    removed_briefings INT[];
BEGIN
    -- Only proceed if briefing_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.briefing_id IS DISTINCT FROM NEW.briefing_id THEN
        
        -- Find briefings that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.briefing_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.briefing_id, ARRAY[]::INT[]))
        ) INTO added_briefings;
        
        -- Find briefings that were removed
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.briefing_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.briefing_id, ARRAY[]::INT[]))
        ) INTO removed_briefings;
        
        -- Add this client to newly added briefings
        IF array_length(added_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET client_id = CASE 
                WHEN client_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(client_id) THEN client_id
                -- ELSE array_append(client_id, NEW.id)
                WHEN array_length(client_id, 1) > 0 THEN array_cat(ARRAY[NEW.id], client_id[2:])  -- Replace first element
                ELSE array_append(client_id, NEW.id)
                END
            WHERE id = ANY(added_briefings);
        END IF;
        
        -- Remove this client from removed briefings
        IF array_length(removed_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET client_id = array_remove(client_id, NEW.id)
            WHERE id = ANY(removed_briefings);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

---------projects-briefings------------------------------

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN BRIEFINGS AND PROJECTS
-- =============================================================================

-- TRIGGER 1: When briefings.project_id array changes, update projects.briefing_id arrays
CREATE OR REPLACE FUNCTION sync_briefings_to_projects()
RETURNS trigger AS $$
DECLARE
    added_projects INT[];
    removed_projects INT[];
BEGIN
    -- Only proceed if project_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.project_id IS DISTINCT FROM NEW.project_id THEN
        
        -- Find projects that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.project_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.project_id, ARRAY[]::INT[]))
        ) INTO added_projects;
        
        -- Find projects that were removed  
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.project_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.project_id, ARRAY[]::INT[]))
        ) INTO removed_projects;
        
        -- Add this briefing to newly added projects
        IF array_length(added_projects, 1) > 0 THEN
            UPDATE projects 
            SET briefing_id = CASE 
                WHEN briefing_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(briefing_id) THEN briefing_id
                WHEN array_length(briefing_id, 1) > 0 THEN array_cat(ARRAY[NEW.id], briefing_id[2:])  -- Replace first element
                ELSE array_append(briefing_id, NEW.id)
            END
            WHERE id = ANY(added_projects);
        END IF;
        
        -- Remove this briefing from removed projects
        IF array_length(removed_projects, 1) > 0 THEN
            UPDATE projects 
            SET briefing_id = array_remove(briefing_id, NEW.id)
            WHERE id = ANY(removed_projects);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When projects.briefing_id array changes, update briefings.project_id arrays  
CREATE OR REPLACE FUNCTION sync_projects_to_briefings()
RETURNS trigger AS $$
DECLARE
    added_briefings INT[];
    removed_briefings INT[];
BEGIN
    -- Only proceed if briefing_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.briefing_id IS DISTINCT FROM NEW.briefing_id THEN
        
        -- Find briefings that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.briefing_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.briefing_id, ARRAY[]::INT[]))
        ) INTO added_briefings;
        
        -- Find briefings that were removed
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.briefing_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.briefing_id, ARRAY[]::INT[]))
        ) INTO removed_briefings;
        
        -- Add this project to newly added briefings
        IF array_length(added_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET project_id = CASE 
                WHEN project_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(project_id) THEN project_id
                -- ELSE array_append(project_id, NEW.id)
                WHEN array_length(project_id, 1) > 0 THEN array_cat(ARRAY[NEW.id], project_id[2:])  -- Replace first element
                ELSE array_append(project_id, NEW.id)
                END
            WHERE id = ANY(added_briefings);
        END IF;
        
        -- Remove this project from removed briefings
        IF array_length(removed_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET project_id = array_remove(project_id, NEW.id)
            WHERE id = ANY(removed_briefings);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-----------goals-briefings-------------

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN BRIEFINGS AND GOALS
-- =============================================================================

-- TRIGGER 1: When briefings.outcome_id array changes, update goals.briefing_id arrays
CREATE OR REPLACE FUNCTION sync_briefings_to_goals()
RETURNS trigger AS $$
DECLARE
    added_goals INT[];
    removed_goals INT[];
BEGIN
    -- Only proceed if outcome_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.outcome_id IS DISTINCT FROM NEW.outcome_id THEN
        
        -- Find goals that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.outcome_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.outcome_id, ARRAY[]::INT[]))
        ) INTO added_goals;
        
        -- Find goals that were removed  
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.outcome_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.outcome_id, ARRAY[]::INT[]))
        ) INTO removed_goals;
        
        -- Add this briefing to newly added goals
        IF array_length(added_goals, 1) > 0 THEN
            UPDATE goals 
            SET briefing_id = CASE 
                WHEN briefing_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(briefing_id) THEN briefing_id
                ELSE array_append(briefing_id, NEW.id)
            END
            WHERE id = ANY(added_goals);
        END IF;
        
        -- Remove this briefing from removed goals
        IF array_length(removed_goals, 1) > 0 THEN
            UPDATE goals 
            SET briefing_id = array_remove(briefing_id, NEW.id)
            WHERE id = ANY(removed_goals);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When goals.briefing_id array changes, update briefings.outcome_id arrays  
CREATE OR REPLACE FUNCTION sync_goals_to_briefings()
RETURNS trigger AS $$
DECLARE
    added_briefings INT[];
    removed_briefings INT[];
BEGIN
    -- Only proceed if briefing_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.briefing_id IS DISTINCT FROM NEW.briefing_id THEN
        
        -- Find briefings that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.briefing_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.briefing_id, ARRAY[]::INT[]))
        ) INTO added_briefings;
        
        -- Find briefings that were removed
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.briefing_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.briefing_id, ARRAY[]::INT[]))
        ) INTO removed_briefings;
        
        -- Add this goal to newly added briefings
        IF array_length(added_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET outcome_id = CASE 
                WHEN outcome_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(outcome_id) THEN outcome_id
                ELSE array_append(outcome_id, NEW.id)
            END
            WHERE id = ANY(added_briefings);
        END IF;
        
        -- Remove this goal from removed briefings
        IF array_length(removed_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET outcome_id = array_remove(outcome_id, NEW.id)
            WHERE id = ANY(removed_briefings);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-----------assets-briefings-------------

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN BRIEFINGS AND ASSETS
-- =============================================================================

-- TRIGGER 1: When briefings.asset_id array changes, update assets.briefing_id arrays
CREATE OR REPLACE FUNCTION sync_briefings_to_assets()
RETURNS trigger AS $$
DECLARE
    added_assets   INT[];
    removed_assets INT[];
BEGIN
    -- Only proceed if asset_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.asset_id IS DISTINCT FROM NEW.asset_id THEN
        
        -- Find assets that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.asset_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.asset_id, ARRAY[]::INT[]))
        ) INTO added_assets;
        
        -- Find assets that were removed  
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.asset_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.asset_id, ARRAY[]::INT[]))
        ) INTO removed_assets;
        
        -- Add this briefing to newly added assets
        IF array_length(added_assets, 1) > 0 THEN
            UPDATE assets 
            SET briefing_id = CASE 
                WHEN briefing_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(briefing_id) THEN briefing_id
                ELSE array_append(briefing_id, NEW.id)
            END
            WHERE id = ANY(added_assets);
        END IF;
        
        -- Remove this briefing from removed assets
        IF array_length(removed_assets, 1) > 0 THEN
            UPDATE assets 
            SET briefing_id = array_remove(briefing_id, NEW.id)
            WHERE id = ANY(removed_assets);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When assets.briefing_id array changes, update briefings.asset_id arrays  
CREATE OR REPLACE FUNCTION sync_assets_to_briefings()
RETURNS trigger AS $$
DECLARE
    added_briefings   INT[];
    removed_briefings INT[];
BEGIN
    -- Only proceed if briefing_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.briefing_id IS DISTINCT FROM NEW.briefing_id THEN
        
        -- Find briefings that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.briefing_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.briefing_id, ARRAY[]::INT[]))
        ) INTO added_briefings;
        
        -- Find briefings that were removed
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.briefing_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.briefing_id, ARRAY[]::INT[]))
        ) INTO removed_briefings;
        
        -- Add this asset to newly added briefings
        IF array_length(added_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET asset_id = CASE 
                WHEN asset_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(asset_id) THEN asset_id
                ELSE array_append(asset_id, NEW.id)
            END
            WHERE id = ANY(added_briefings);
        END IF;
        
        -- Remove this asset from removed briefings
        IF array_length(removed_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET asset_id = array_remove(asset_id, NEW.id)
            WHERE id = ANY(removed_briefings);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-----------tasks-briefings-------------

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN BRIEFINGS AND TASKS
-- =============================================================================

-- TRIGGER 1: When briefings.task_id array changes, update tasks.briefing_id arrays
CREATE OR REPLACE FUNCTION sync_briefings_to_tasks()
RETURNS trigger AS $$
DECLARE
    added_tasks   INT[];
    removed_tasks INT[];
BEGIN
    -- Only proceed if task_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.task_id IS DISTINCT FROM NEW.task_id THEN
        
        -- Find tasks that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.task_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.task_id, ARRAY[]::INT[]))
        ) INTO added_tasks;
        
        -- Find tasks that were removed  
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.task_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.task_id, ARRAY[]::INT[]))
        ) INTO removed_tasks;
        
        -- Add this briefing to newly added tasks
        IF array_length(added_tasks, 1) > 0 THEN
            UPDATE tasks 
            SET briefing_id = CASE 
                WHEN briefing_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(briefing_id) THEN briefing_id
                ELSE array_append(briefing_id, NEW.id)
            END
            WHERE id = ANY(added_tasks);
        END IF;
        
        -- Remove this briefing from removed tasks
        IF array_length(removed_tasks, 1) > 0 THEN
            UPDATE tasks 
            SET briefing_id = array_remove(briefing_id, NEW.id)
            WHERE id = ANY(removed_tasks);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When tasks.briefing_id array changes, update briefings.task_id arrays  
CREATE OR REPLACE FUNCTION sync_tasks_to_briefings()
RETURNS trigger AS $$
DECLARE
    added_briefings   INT[];
    removed_briefings INT[];
BEGIN
    -- Only proceed if briefing_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.briefing_id IS DISTINCT FROM NEW.briefing_id THEN
        
        -- Find briefings that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.briefing_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.briefing_id, ARRAY[]::INT[]))
        ) INTO added_briefings;
        
        -- Find briefings that were removed
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.briefing_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.briefing_id, ARRAY[]::INT[]))
        ) INTO removed_briefings;
        
        -- Add this task to newly added briefings
        IF array_length(added_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET task_id = CASE 
                WHEN task_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(task_id) THEN task_id
                ELSE array_append(task_id, NEW.id)
            END
            WHERE id = ANY(added_briefings);
        END IF;
        
        -- Remove this task from removed briefings
        IF array_length(removed_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET task_id = array_remove(task_id, NEW.id)
            WHERE id = ANY(removed_briefings);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-----------meeting_transcripts-briefings-------------

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
BEGIN
    -- Only proceed if meeting_transcript_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.meeting_transcript_id IS DISTINCT FROM NEW.meeting_transcript_id THEN
        
        -- Find meeting_transcripts that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.meeting_transcript_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.meeting_transcript_id, ARRAY[]::INT[]))
        ) INTO added_mt;
        
        -- Find meeting_transcripts that were removed  
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.meeting_transcript_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.meeting_transcript_id, ARRAY[]::INT[]))
        ) INTO removed_mt;
        
        -- Add this briefing to newly added meeting_transcripts
        IF array_length(added_mt, 1) > 0 THEN
            UPDATE meeting_transcripts 
            SET briefing_id = CASE 
                WHEN briefing_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(briefing_id) THEN briefing_id
                ELSE array_append(briefing_id, NEW.id)
            END
            WHERE id = ANY(added_mt);
        END IF;
        
        -- Remove this briefing from removed meeting_transcripts
        IF array_length(removed_mt, 1) > 0 THEN
            UPDATE meeting_transcripts 
            SET briefing_id = array_remove(briefing_id, NEW.id)
            WHERE id = ANY(removed_mt);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When meeting_transcripts.briefing_id array changes, 
-- update briefings.meeting_transcript_id arrays  
CREATE OR REPLACE FUNCTION sync_meeting_transcripts_to_briefings()
RETURNS trigger AS $$
DECLARE
    added_briefings   INT[];
    removed_briefings INT[];
BEGIN
    -- Only proceed if briefing_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.briefing_id IS DISTINCT FROM NEW.briefing_id THEN
        
        -- Find briefings that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.briefing_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.briefing_id, ARRAY[]::INT[]))
        ) INTO added_briefings;
        
        -- Find briefings that were removed
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.briefing_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.briefing_id, ARRAY[]::INT[]))
        ) INTO removed_briefings;
        
        -- Add this meeting_transcript to newly added briefings
        IF array_length(added_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET meeting_transcript_id = CASE 
                WHEN meeting_transcript_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(meeting_transcript_id) THEN meeting_transcript_id
                ELSE array_append(meeting_transcript_id, NEW.id)
            END
            WHERE id = ANY(added_briefings);
        END IF;
        
        -- Remove this meeting_transcript from removed briefings
        IF array_length(removed_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET meeting_transcript_id = array_remove(meeting_transcript_id, NEW.id)
            WHERE id = ANY(removed_briefings);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-------not verified from here-----------

-----------milestones-briefings-------------

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN BRIEFINGS AND MILESTONES
-- =============================================================================

-- TRIGGER 1: When briefings.milestone_id array changes, update milestones.briefing_id arrays
CREATE OR REPLACE FUNCTION sync_briefings_to_milestones()
RETURNS trigger AS $$
DECLARE
    added_milestones   INT[];
    removed_milestones INT[];
BEGIN
    -- Only proceed if milestone_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.milestone_id IS DISTINCT FROM NEW.milestone_id THEN
        
        -- Find milestones that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.milestone_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.milestone_id, ARRAY[]::INT[]))
        ) INTO added_milestones;
        
        -- Find milestones that were removed  
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.milestone_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.milestone_id, ARRAY[]::INT[]))
        ) INTO removed_milestones;
        
        -- Add this briefing to newly added milestones
        IF array_length(added_milestones, 1) > 0 THEN
            UPDATE milestones 
            SET briefing_id = CASE 
                WHEN briefing_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(briefing_id) THEN briefing_id
                WHEN array_length(briefing_id, 1) > 0 THEN array_cat(ARRAY[NEW.id], briefing_id[2:])  -- Replace first element
                ELSE array_append(briefing_id, NEW.id)
            END
            WHERE id = ANY(added_milestones);
        END IF;
        
        -- Remove this briefing from removed milestones
        IF array_length(removed_milestones, 1) > 0 THEN
            UPDATE milestones 
            SET briefing_id = array_remove(briefing_id, NEW.id)
            WHERE id = ANY(removed_milestones);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When milestones.briefing_id array changes, update briefings.milestone_id arrays  
CREATE OR REPLACE FUNCTION sync_milestones_to_briefings()
RETURNS trigger AS $$
DECLARE
    added_briefings   INT[];
    removed_briefings INT[];
BEGIN
    -- Only proceed if briefing_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.briefing_id IS DISTINCT FROM NEW.briefing_id THEN
        
        -- Find briefings that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.briefing_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.briefing_id, ARRAY[]::INT[]))
        ) INTO added_briefings;
        
        -- Find briefings that were removed
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.briefing_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.briefing_id, ARRAY[]::INT[]))
        ) INTO removed_briefings;
        
        -- Add this milestone to newly added briefings
        IF array_length(added_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET milestone_id = CASE 
                WHEN milestone_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(milestone_id) THEN milestone_id
                ELSE array_append(milestone_id, NEW.id)
            END
            WHERE id = ANY(added_briefings);
        END IF;
        
        -- Remove this milestone from removed briefings
        IF array_length(removed_briefings, 1) > 0 THEN
            UPDATE briefings 
            SET milestone_id = array_remove(milestone_id, NEW.id)
            WHERE id = ANY(removed_briefings);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-----------tasks-projects-------------

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN TASKS AND PROJECTS
-- =============================================================================

-- TRIGGER 1: When tasks.project_id array changes, update projects.task_id arrays
CREATE OR REPLACE FUNCTION sync_tasks_to_projects()
RETURNS trigger AS $$
DECLARE
    added_projects   INT[];
    removed_projects INT[];
BEGIN
    -- Only proceed if project_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.project_id IS DISTINCT FROM NEW.project_id THEN
        
        -- Find projects that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.project_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.project_id, ARRAY[]::INT[]))
        ) INTO added_projects;
        
        -- Find projects that were removed  
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.project_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.project_id, ARRAY[]::INT[]))
        ) INTO removed_projects;
        
        -- Add this task to newly added projects
        IF array_length(added_projects, 1) > 0 THEN
            UPDATE projects 
            SET task_id = CASE 
                WHEN task_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(task_id) THEN task_id
                ELSE array_append(task_id, NEW.id)
            END
            WHERE id = ANY(added_projects);
        END IF;
        
        -- Remove this task from removed projects
        IF array_length(removed_projects, 1) > 0 THEN
            UPDATE projects 
            SET task_id = array_remove(task_id, NEW.id)
            WHERE id = ANY(removed_projects);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When projects.task_id array changes, update tasks.project_id arrays  
CREATE OR REPLACE FUNCTION sync_projects_to_tasks()
RETURNS trigger AS $$
DECLARE
    added_tasks   INT[];
    removed_tasks INT[];
BEGIN
    -- Only proceed if task_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.task_id IS DISTINCT FROM NEW.task_id THEN
        
        -- Find tasks that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.task_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.task_id, ARRAY[]::INT[]))
        ) INTO added_tasks;
        
        -- Find tasks that were removed
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.task_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.task_id, ARRAY[]::INT[]))
        ) INTO removed_tasks;
        
        -- Add this project to newly added tasks
        IF array_length(added_tasks, 1) > 0 THEN
            UPDATE tasks 
            SET project_id = CASE 
                WHEN project_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(project_id) THEN project_id
                ELSE array_append(project_id, NEW.id)
            END
            WHERE id = ANY(added_tasks);
        END IF;
        
        -- Remove this project from removed tasks
        IF array_length(removed_tasks, 1) > 0 THEN
            UPDATE tasks 
            SET project_id = array_remove(project_id, NEW.id)
            WHERE id = ANY(removed_tasks);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-----------tasks-assets-------------

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN TASKS AND ASSETS
-- =============================================================================

-- TRIGGER 1: When tasks.asset_id array changes, update assets.task_id arrays
CREATE OR REPLACE FUNCTION sync_tasks_to_assets()
RETURNS trigger AS $$
DECLARE
    added_assets   INT[];
    removed_assets INT[];
BEGIN
    -- Only proceed if asset_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.asset_id IS DISTINCT FROM NEW.asset_id THEN
        
        -- Find assets that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.asset_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.asset_id, ARRAY[]::INT[]))
        ) INTO added_assets;
        
        -- Find assets that were removed  
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.asset_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.asset_id, ARRAY[]::INT[]))
        ) INTO removed_assets;
        
        -- Add this task to newly added assets
        IF array_length(added_assets, 1) > 0 THEN
            UPDATE assets 
            SET task_id = CASE 
                WHEN task_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(task_id) THEN task_id
                ELSE array_append(task_id, NEW.id)
            END
            WHERE id = ANY(added_assets);
        END IF;
        
        -- Remove this task from removed assets
        IF array_length(removed_assets, 1) > 0 THEN
            UPDATE assets 
            SET task_id = array_remove(task_id, NEW.id)
            WHERE id = ANY(removed_assets);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When assets.task_id array changes, update tasks.asset_id arrays  
CREATE OR REPLACE FUNCTION sync_assets_to_tasks()
RETURNS trigger AS $$
DECLARE
    added_tasks   INT[];
    removed_tasks INT[];
BEGIN
    -- Only proceed if task_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.task_id IS DISTINCT FROM NEW.task_id THEN
        
        -- Find tasks that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.task_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.task_id, ARRAY[]::INT[]))
        ) INTO added_tasks;
        
        -- Find tasks that were removed
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.task_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.task_id, ARRAY[]::INT[]))
        ) INTO removed_tasks;
        
        -- Add this asset to newly added tasks
        IF array_length(added_tasks, 1) > 0 THEN
            UPDATE tasks 
            SET asset_id = CASE 
                WHEN asset_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(asset_id) THEN asset_id
                ELSE array_append(asset_id, NEW.id)
            END
            WHERE id = ANY(added_tasks);
        END IF;
        
        -- Remove this asset from removed tasks
        IF array_length(removed_tasks, 1) > 0 THEN
            UPDATE tasks 
            SET asset_id = array_remove(asset_id, NEW.id)
            WHERE id = ANY(removed_tasks);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-----------tasks-meeting_transcripts-------------

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
BEGIN
    -- Only proceed if meeting_transcript_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.meeting_transcript_id IS DISTINCT FROM NEW.meeting_transcript_id THEN
        
        -- Find meeting_transcripts that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.meeting_transcript_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.meeting_transcript_id, ARRAY[]::INT[]))
        ) INTO added_mt;
        
        -- Find meeting_transcripts that were removed  
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.meeting_transcript_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.meeting_transcript_id, ARRAY[]::INT[]))
        ) INTO removed_mt;
        
        -- Add this task to newly added meeting_transcripts
        IF array_length(added_mt, 1) > 0 THEN
            UPDATE meeting_transcripts 
            SET task_id = CASE 
                WHEN task_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(task_id) THEN task_id
                WHEN array_length(task_id, 1) > 0 THEN array_cat(ARRAY[NEW.id], task_id[2:])  -- Replace first element
                ELSE array_append(task_id, NEW.id)
            END
            WHERE id = ANY(added_mt);
        END IF;
        
        -- Remove this task from removed meeting_transcripts
        IF array_length(removed_mt, 1) > 0 THEN
            UPDATE meeting_transcripts 
            SET task_id = array_remove(task_id, NEW.id)
            WHERE id = ANY(removed_mt);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER 2: When meeting_transcripts.task_id array changes, 
-- update tasks.meeting_transcript_id arrays  
CREATE OR REPLACE FUNCTION sync_meeting_transcripts_to_tasks()
RETURNS trigger AS $$
DECLARE
    added_tasks   INT[];
    removed_tasks INT[];
BEGIN
    -- Only proceed if task_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.task_id IS DISTINCT FROM NEW.task_id THEN
        
        -- Find tasks that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.task_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.task_id, ARRAY[]::INT[]))
        ) INTO added_tasks;
        
        -- Find tasks that were removed
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.task_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.task_id, ARRAY[]::INT[]))
        ) INTO removed_tasks;
        
        -- Add this meeting_transcript to newly added tasks
        IF array_length(added_tasks, 1) > 0 THEN
            UPDATE tasks 
            SET meeting_transcript_id = CASE 
                WHEN meeting_transcript_id IS NULL THEN ARRAY[NEW.id]
                WHEN NEW.id = ANY(meeting_transcript_id) THEN meeting_transcript_id
                ELSE array_append(meeting_transcript_id, NEW.id)
            END
            WHERE id = ANY(added_tasks);
        END IF;
        
        -- Remove this meeting_transcript from removed tasks
        IF array_length(removed_tasks, 1) > 0 THEN
            UPDATE tasks 
            SET meeting_transcript_id = array_remove(meeting_transcript_id, NEW.id)
            WHERE id = ANY(removed_tasks);
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-----------tasks-tasks (self reference on occurrences_id)-------------

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN TASKS AND TASKS (OCCURRENCES)
-- =============================================================================

-- TRIGGER 1: When tasks.occurences_id array changes, update related tasks.occurences_id arrays
CREATE OR REPLACE FUNCTION sync_tasks_occurences()
RETURNS trigger AS $$
DECLARE
    added_tasks INT[];
    removed_tasks INT[];
    task_id INT;
BEGIN
    -- Only proceed if occurences_id array actually changed
    IF TG_OP = 'UPDATE' AND OLD.occurences_id IS DISTINCT FROM NEW.occurences_id THEN
        
        -- Find tasks that were added
        SELECT ARRAY(
            SELECT unnest(COALESCE(NEW.occurences_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(OLD.occurences_id, ARRAY[]::INT[]))
        ) INTO added_tasks;
        
        -- Find tasks that were removed  
        SELECT ARRAY(
            SELECT unnest(COALESCE(OLD.occurences_id, ARRAY[]::INT[]))
            EXCEPT
            SELECT unnest(COALESCE(NEW.occurences_id, ARRAY[]::INT[]))
        ) INTO removed_tasks;
        
        -- Add this task to newly added tasks' occurences_id arrays
        IF array_length(added_tasks, 1) > 0 THEN
            FOREACH task_id IN ARRAY added_tasks
            LOOP
                UPDATE tasks 
                SET occurences_id = CASE 
                    WHEN occurences_id IS NULL THEN ARRAY[NEW.id]
                    WHEN NEW.id = ANY(occurences_id) THEN occurences_id
                    ELSE array_append(occurences_id, NEW.id)
                END
                WHERE id = task_id AND id != NEW.id; -- Avoid self-reference loops
            END LOOP;
        END IF;
        
        -- Remove this task from removed tasks' occurences_id arrays
        IF array_length(removed_tasks, 1) > 0 THEN
            FOREACH task_id IN ARRAY removed_tasks
            LOOP
                UPDATE tasks 
                SET occurences_id = array_remove(occurences_id, NEW.id)
                WHERE id = task_id AND id != NEW.id; -- Avoid self-reference loops
            END LOOP;
        END IF;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- DROP TRIGGER IF EXISTS sync_tasks_occurences_trigger ON tasks;

-- Create the trigger
create TRIGGER sync_tasks_occurences_trigger
    AFTER INSERT or UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION sync_tasks_occurences();

-- ===========================
-- BRIEFINGS <-> CLIENTS
-- ===========================
DROP TRIGGER IF EXISTS sync_briefings_to_clients_trigger ON briefings;
CREATE TRIGGER sync_briefings_to_clients_trigger
    AFTER INSERT OR UPDATE ON briefings
    FOR EACH ROW
    EXECUTE FUNCTION sync_briefings_to_clients();

DROP TRIGGER IF EXISTS sync_clients_to_briefings_trigger ON clients;
CREATE TRIGGER sync_clients_to_briefings_trigger  
    AFTER INSERT OR UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION sync_clients_to_briefings();

-- ===========================
-- BRIEFINGS <-> PROJECTS
-- ===========================
DROP TRIGGER IF EXISTS sync_briefings_to_projects_trigger ON briefings;
CREATE TRIGGER sync_briefings_to_projects_trigger
    AFTER INSERT OR UPDATE ON briefings
    FOR EACH ROW
    EXECUTE FUNCTION sync_briefings_to_projects();

DROP TRIGGER IF EXISTS sync_projects_to_briefings_trigger ON projects;
CREATE TRIGGER sync_projects_to_briefings_trigger  
    AFTER INSERT OR UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION sync_projects_to_briefings();

-- ===========================
-- BRIEFINGS <-> GOALS
-- ===========================
DROP TRIGGER IF EXISTS sync_briefings_to_goals_trigger ON briefings;
CREATE TRIGGER sync_briefings_to_goals_trigger
    AFTER INSERT OR UPDATE ON briefings
    FOR EACH ROW
    EXECUTE FUNCTION sync_briefings_to_goals();

DROP TRIGGER IF EXISTS sync_goals_to_briefings_trigger ON goals;
CREATE TRIGGER sync_goals_to_briefings_trigger  
    AFTER INSERT OR UPDATE ON goals
    FOR EACH ROW
    EXECUTE FUNCTION sync_goals_to_briefings();

-- ===========================
-- BRIEFINGS <-> ASSETS
-- ===========================
DROP TRIGGER IF EXISTS sync_briefings_to_assets_trigger ON briefings;
CREATE TRIGGER sync_briefings_to_assets_trigger
    AFTER INSERT OR UPDATE ON briefings
    FOR EACH ROW
    EXECUTE FUNCTION sync_briefings_to_assets();

DROP TRIGGER IF EXISTS sync_assets_to_briefings_trigger ON assets;
CREATE TRIGGER sync_assets_to_briefings_trigger  
    AFTER INSERT OR UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION sync_assets_to_briefings();

-- ===========================
-- BRIEFINGS <-> TASKS
-- ===========================
DROP TRIGGER IF EXISTS sync_briefings_to_tasks_trigger ON briefings;
CREATE TRIGGER sync_briefings_to_tasks_trigger
    AFTER INSERT OR UPDATE ON briefings
    FOR EACH ROW
    EXECUTE FUNCTION sync_briefings_to_tasks();

DROP TRIGGER IF EXISTS sync_tasks_to_briefings_trigger ON tasks;
CREATE TRIGGER sync_tasks_to_briefings_trigger  
    AFTER INSERT OR UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION sync_tasks_to_briefings();

-- ===========================
-- BRIEFINGS <-> MEETING_TRANSCRIPTS
-- ===========================
DROP TRIGGER IF EXISTS sync_briefings_to_meeting_transcripts_trigger ON briefings;
CREATE TRIGGER sync_briefings_to_meeting_transcripts_trigger
    AFTER INSERT OR UPDATE ON briefings
    FOR EACH ROW
    EXECUTE FUNCTION sync_briefings_to_meeting_transcripts();

DROP TRIGGER IF EXISTS sync_meeting_transcripts_to_briefings_trigger ON meeting_transcripts;
CREATE TRIGGER sync_meeting_transcripts_to_briefings_trigger  
    AFTER INSERT OR UPDATE ON meeting_transcripts
    FOR EACH ROW
    EXECUTE FUNCTION sync_meeting_transcripts_to_briefings();

-- ===========================
-- BRIEFINGS <-> MILESTONES
-- ===========================
DROP TRIGGER IF EXISTS sync_briefings_to_milestones_trigger ON briefings;
CREATE TRIGGER sync_briefings_to_milestones_trigger
    AFTER INSERT OR UPDATE ON briefings
    FOR EACH ROW
    EXECUTE FUNCTION sync_briefings_to_milestones();

DROP TRIGGER IF EXISTS sync_milestones_to_briefings_trigger ON milestones;
CREATE TRIGGER sync_milestones_to_briefings_trigger  
    AFTER INSERT OR UPDATE ON milestones
    FOR EACH ROW
    EXECUTE FUNCTION sync_milestones_to_briefings();

-- ===========================
-- TASKS <-> PROJECTS
-- ===========================
DROP TRIGGER IF EXISTS sync_tasks_to_projects_trigger ON tasks;
CREATE TRIGGER sync_tasks_to_projects_trigger
    AFTER INSERT OR UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION sync_tasks_to_projects();

DROP TRIGGER IF EXISTS sync_projects_to_tasks_trigger ON projects;
CREATE TRIGGER sync_projects_to_tasks_trigger  
    AFTER INSERT OR UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION sync_projects_to_tasks();

-- ===========================
-- TASKS <-> ASSETS
-- ===========================
DROP TRIGGER IF EXISTS sync_tasks_to_assets_trigger ON tasks;
CREATE TRIGGER sync_tasks_to_assets_trigger
    AFTER INSERT OR UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION sync_tasks_to_assets();

DROP TRIGGER IF EXISTS sync_assets_to_tasks_trigger ON assets;
CREATE TRIGGER sync_assets_to_tasks_trigger  
    AFTER INSERT OR UPDATE ON assets
    FOR EACH ROW
    EXECUTE FUNCTION sync_assets_to_tasks();

-- ===========================
-- TASKS <-> MEETING_TRANSCRIPTS
-- ===========================
DROP TRIGGER IF EXISTS sync_tasks_to_meeting_transcripts_trigger ON tasks;
CREATE TRIGGER sync_tasks_to_meeting_transcripts_trigger
    AFTER INSERT OR UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION sync_tasks_to_meeting_transcripts();

DROP TRIGGER IF EXISTS sync_meeting_transcripts_to_tasks_trigger ON meeting_transcripts;
CREATE TRIGGER sync_meeting_transcripts_to_tasks_trigger  
    AFTER INSERT OR UPDATE ON meeting_transcripts
    FOR EACH ROW
    EXECUTE FUNCTION sync_meeting_transcripts_to_tasks();
