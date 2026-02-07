CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
drop table if exists clients;
CREATE TABLE Clients (
    id SERIAL PRIMARY KEY,
    name text,
    type text default null CHECK (type IN ('Family', 'Privat', 'Internal', 'External')),
    email text default null,
    contact text default null,
    website text,

    project_id integer[] DEFAULT NULL, -- no limit, 2 way relation - projects
    project_fk_projects uuid[] DEFAULT NULL,

    asset_id int[] default null, --no limit, one way relation - assets
    asset_fk_assets uuid[] Default null,
    
    -- tag_id int[] default null, -- no limit, one way relation - tags
    -- tag uuid[] Default null,
    tags text,

    briefing_id int[] default null, -- no limit, two way relation - briefings
    briefing_fk_briefings uuid[] Default null,

    meeting_transcript_id int[] default null , -- no limit, 2 way relation - meeting_transcripts
    meeting_transcript_fk_meeting_transcripts uuid[] Default null,

    -- note_id int[] default null, -- no limit, 2 way relation - Notes
    -- note uuid[] Default null,
    notes text,

    milestone_id int[] default null , -- no limit, 2 way relation - Milestones
    milestone_fk_milestones uuid[] Default null,

    cover text, --image (cover page ) -- for now in url format

    goal_id int[] default null, --no limit, two way relation - goals
    goal_fk_goals uuid[] Default null,

    status text check (status in ('Active', 'Archive')),

    task_id integer[] DEFAULT NULL, -- no limit, 1 way relation - tasks
    task_fk_tasks uuid[] DEFAULT NULL,

    whalesync_postgres_id uuid not null default gen_random_uuid (),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Basic column indexes (B-tree for single values)
CREATE INDEX idx_clients_name ON clients USING btree (name);
CREATE INDEX idx_whalesync_id ON clients USING btree (whalesync_postgres_id);
CREATE INDEX idx_clients_type ON clients USING btree (type);
CREATE INDEX idx_clients_email ON clients USING btree (email);
CREATE INDEX idx_clients_contact ON clients USING btree (contact);
CREATE INDEX idx_clients_website ON clients USING btree (website);
CREATE INDEX idx_clients_tags ON clients USING btree (tags);
CREATE INDEX idx_clients_notes ON clients USING btree (notes);
CREATE INDEX idx_clients_cover ON clients USING btree (cover);
CREATE INDEX idx_clients_status ON clients USING btree (status);
CREATE INDEX idx_clients_created_at ON clients USING btree (created_at);
CREATE INDEX idx_clients_updated_at ON clients USING btree (updated_at);

-- Array column indexes using GIN (Generalized Inverted Index) for better array operations
CREATE INDEX idx_clients_project_id ON clients USING gin (project_id);
-- CREATE INDEX idx_clients_project ON clients USING gin (project);
CREATE INDEX idx_clients_asset_id ON clients USING gin (asset_id);
-- CREATE INDEX idx_clients_asset ON clients USING gin (asset);
CREATE INDEX idx_clients_briefing_id ON clients USING gin (briefing_id);
-- CREATE INDEX idx_clients_briefing ON clients USING gin (briefing);
CREATE INDEX idx_clients_meeting_transcript_id ON clients USING gin (meeting_transcript_id);
-- CREATE INDEX idx_clients_meeting_transcript ON clients USING gin (meeting_transcript);
CREATE INDEX idx_clients_milestone_id ON clients USING gin (milestone_id);
-- CREATE INDEX idx_clients_milestone ON clients USING gin (milestone);
CREATE INDEX idx_clients_goal_id ON clients USING gin (goal_id);
-- CREATE INDEX idx_clients_goal ON clients USING gin (goal);
CREATE INDEX idx_clients_task_id ON clients USING gin (task_id);
-- CREATE INDEX idx_clients_task ON clients USING gin (task);

-- =============================================================================
-- BIDIRECTIONAL SYNC BETWEEN ID ARRAYS (integer[]) AND UUID ARRAYS (uuid[])
-- =============================================================================

-- Function 1: Sync from ID arrays to UUID arrays
CREATE OR REPLACE FUNCTION sync_id_to_uuid_arrays_in_clients()
RETURNS trigger AS
$$
DECLARE
    old_ids integer[];
    new_ids integer[];
BEGIN
  -- Handle DELETE operations
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  -- Check if this update was triggered by the UUID-to-ID sync trigger
  -- If the UUID array was also modified, skip this sync to avoid collision
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  -- Project: ID array to UUID array
  old_ids := CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.project_id, ARRAY[]::integer[])
                  ELSE ARRAY[]::integer[] END;
  new_ids := COALESCE(NEW.project_id, ARRAY[]::integer[]);
  
  IF (TG_OP = 'INSERT' AND array_length(new_ids, 1) > 0) OR
     (TG_OP = 'UPDATE' AND old_ids IS DISTINCT FROM new_ids) THEN
    IF array_length(new_ids, 1) > 0 THEN
      NEW.project_fk_projects = ARRAY(SELECT whalesync_postgres_id FROM projects WHERE id = ANY(new_ids))::uuid[];
    ELSE
      NEW.project_fk_projects = NULL;
    END IF;
  END IF;

  -- Asset: ID array to UUID array
  old_ids := CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.asset_id, ARRAY[]::integer[])
                  ELSE ARRAY[]::integer[] END;
  new_ids := COALESCE(NEW.asset_id, ARRAY[]::integer[]);
  
  IF (TG_OP = 'INSERT' AND array_length(new_ids, 1) > 0) OR
     (TG_OP = 'UPDATE' AND old_ids IS DISTINCT FROM new_ids) THEN
    IF array_length(new_ids, 1) > 0 THEN
      NEW.asset_fk_assets = ARRAY(SELECT whalesync_postgres_id FROM assets WHERE id = ANY(new_ids))::uuid[];
    ELSE
      NEW.asset_fk_assets = NULL;
    END IF;
  END IF;

  -- Briefing: ID array to UUID array
  old_ids := CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.briefing_id, ARRAY[]::integer[])
                  ELSE ARRAY[]::integer[] END;
  new_ids := COALESCE(NEW.briefing_id, ARRAY[]::integer[]);
  
  IF (TG_OP = 'INSERT' AND array_length(new_ids, 1) > 0) OR
     (TG_OP = 'UPDATE' AND old_ids IS DISTINCT FROM new_ids) THEN
    IF array_length(new_ids, 1) > 0 THEN
      NEW.briefing_fk_briefings = ARRAY(SELECT whalesync_postgres_id FROM briefings WHERE id = ANY(new_ids))::uuid[];
    ELSE
      NEW.briefing_fk_briefings = NULL;
    END IF;
  END IF;

  -- Meeting transcript: ID array to UUID array
  old_ids := CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.meeting_transcript_id, ARRAY[]::integer[])
                  ELSE ARRAY[]::integer[] END;
  new_ids := COALESCE(NEW.meeting_transcript_id, ARRAY[]::integer[]);
  
  IF (TG_OP = 'INSERT' AND array_length(new_ids, 1) > 0) OR
     (TG_OP = 'UPDATE' AND old_ids IS DISTINCT FROM new_ids) THEN
    IF array_length(new_ids, 1) > 0 THEN
      NEW.meeting_transcript_fk_meeting_transcripts = ARRAY(SELECT whalesync_postgres_id FROM meeting_transcripts WHERE id = ANY(new_ids))::uuid[];
    ELSE
      NEW.meeting_transcript_fk_meeting_transcripts = NULL;
    END IF;
  END IF;

  -- Milestone: ID array to UUID array
  old_ids := CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.milestone_id, ARRAY[]::integer[])
                  ELSE ARRAY[]::integer[] END;
  new_ids := COALESCE(NEW.milestone_id, ARRAY[]::integer[]);
  
  IF (TG_OP = 'INSERT' AND array_length(new_ids, 1) > 0) OR
     (TG_OP = 'UPDATE' AND old_ids IS DISTINCT FROM new_ids) THEN
    IF array_length(new_ids, 1) > 0 THEN
      NEW.milestone_fk_milestones = ARRAY(SELECT whalesync_postgres_id FROM milestones WHERE id = ANY(new_ids))::uuid[];
    ELSE
      NEW.milestone_fk_milestones = NULL;
    END IF;
  END IF;

  -- Goal: ID array to UUID array
  old_ids := CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.goal_id, ARRAY[]::integer[])
                  ELSE ARRAY[]::integer[] END;
  new_ids := COALESCE(NEW.goal_id, ARRAY[]::integer[]);
  
  IF (TG_OP = 'INSERT' AND array_length(new_ids, 1) > 0) OR
     (TG_OP = 'UPDATE' AND old_ids IS DISTINCT FROM new_ids) THEN
    IF array_length(new_ids, 1) > 0 THEN
      NEW.goal_fk_goals = ARRAY(SELECT whalesync_postgres_id FROM goals WHERE id = ANY(new_ids))::uuid[];
    ELSE
      NEW.goal_fk_goals = NULL;
    END IF;
  END IF;

  -- Task: ID array to UUID array
  old_ids := CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.task_id, ARRAY[]::integer[])
                  ELSE ARRAY[]::integer[] END;
  new_ids := COALESCE(NEW.task_id, ARRAY[]::integer[]);
  
  IF (TG_OP = 'INSERT' AND array_length(new_ids, 1) > 0) OR
     (TG_OP = 'UPDATE' AND old_ids IS DISTINCT FROM new_ids) THEN
    IF array_length(new_ids, 1) > 0 THEN
      NEW.task_fk_tasks = ARRAY(SELECT whalesync_postgres_id FROM tasks WHERE id = ANY(new_ids))::uuid[];
    ELSE
      NEW.task_fk_tasks = NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Sync from UUID arrays to ID arrays
CREATE OR REPLACE FUNCTION sync_uuid_to_id_arrays_in_clients()
RETURNS trigger AS
$$
DECLARE
    old_uuids uuid[];
    new_uuids uuid[];
BEGIN
  -- Handle DELETE operations
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;

  -- Check if this update was triggered by the ID-to-UUID sync trigger
  -- If the ID array was also modified, skip this sync to avoid collision
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  -- Project: UUID array to ID array
  old_uuids := CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.project_fk_projects, ARRAY[]::uuid[])
                    ELSE ARRAY[]::uuid[] END;
  new_uuids := COALESCE(NEW.project_fk_projects, ARRAY[]::uuid[]);
  
  IF (TG_OP = 'INSERT' AND array_length(new_uuids, 1) > 0) OR
     (TG_OP = 'UPDATE' AND old_uuids IS DISTINCT FROM new_uuids) THEN
    IF array_length(new_uuids, 1) > 0 THEN
      NEW.project_id = ARRAY(SELECT id FROM projects WHERE whalesync_postgres_id = ANY(new_uuids))::integer[];
    ELSE
      NEW.project_id = NULL;
    END IF;
  END IF;

  -- Asset: UUID array to ID array
  old_uuids := CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.asset_fk_assets, ARRAY[]::uuid[])
                    ELSE ARRAY[]::uuid[] END;
  new_uuids := COALESCE(NEW.asset_fk_assets, ARRAY[]::uuid[]);
  
  IF (TG_OP = 'INSERT' AND array_length(new_uuids, 1) > 0) OR
     (TG_OP = 'UPDATE' AND old_uuids IS DISTINCT FROM new_uuids) THEN
    IF array_length(new_uuids, 1) > 0 THEN
      NEW.asset_id = ARRAY(SELECT id FROM assets WHERE whalesync_postgres_id = ANY(new_uuids))::integer[];
    ELSE
      NEW.asset_id = NULL;
    END IF;
  END IF;

  -- Briefing: UUID array to ID array
  old_uuids := CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.briefing_fk_briefings, ARRAY[]::uuid[])
                    ELSE ARRAY[]::uuid[] END;
  new_uuids := COALESCE(NEW.briefing_fk_briefings, ARRAY[]::uuid[]);
  
  IF (TG_OP = 'INSERT' AND array_length(new_uuids, 1) > 0) OR
     (TG_OP = 'UPDATE' AND old_uuids IS DISTINCT FROM new_uuids) THEN
    IF array_length(new_uuids, 1) > 0 THEN
      NEW.briefing_id = ARRAY(SELECT id FROM briefings WHERE whalesync_postgres_id = ANY(new_uuids))::integer[];
    ELSE
      NEW.briefing_id = NULL;
    END IF;
  END IF;

  -- Meeting transcript: UUID array to ID array
  old_uuids := CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.meeting_transcript_fk_meeting_transcripts, ARRAY[]::uuid[])
                    ELSE ARRAY[]::uuid[] END;
  new_uuids := COALESCE(NEW.meeting_transcript_fk_meeting_transcripts, ARRAY[]::uuid[]);
  
  IF (TG_OP = 'INSERT' AND array_length(new_uuids, 1) > 0) OR
     (TG_OP = 'UPDATE' AND old_uuids IS DISTINCT FROM new_uuids) THEN
    IF array_length(new_uuids, 1) > 0 THEN
      NEW.meeting_transcript_id = ARRAY(SELECT id FROM meeting_transcripts WHERE whalesync_postgres_id = ANY(new_uuids))::integer[];
    ELSE
      NEW.meeting_transcript_id = NULL;
    END IF;
  END IF;

  -- Milestone: UUID array to ID array
  old_uuids := CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.milestone_fk_milestones, ARRAY[]::uuid[])
                    ELSE ARRAY[]::uuid[] END;
  new_uuids := COALESCE(NEW.milestone_fk_milestones, ARRAY[]::uuid[]);
  
  IF (TG_OP = 'INSERT' AND array_length(new_uuids, 1) > 0) OR
     (TG_OP = 'UPDATE' AND old_uuids IS DISTINCT FROM new_uuids) THEN
    IF array_length(new_uuids, 1) > 0 THEN
      NEW.milestone_id = ARRAY(SELECT id FROM milestones WHERE whalesync_postgres_id = ANY(new_uuids))::integer[];
    ELSE
      NEW.milestone_id = NULL;
    END IF;
  END IF;

  -- Goal: UUID array to ID array
  old_uuids := CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.goal_fk_goals, ARRAY[]::uuid[])
                    ELSE ARRAY[]::uuid[] END;
  new_uuids := COALESCE(NEW.goal_fk_goals, ARRAY[]::uuid[]);
  
  IF (TG_OP = 'INSERT' AND array_length(new_uuids, 1) > 0) OR
     (TG_OP = 'UPDATE' AND old_uuids IS DISTINCT FROM new_uuids) THEN
    IF array_length(new_uuids, 1) > 0 THEN
      NEW.goal_id = ARRAY(SELECT id FROM goals WHERE whalesync_postgres_id = ANY(new_uuids))::integer[];
    ELSE
      NEW.goal_id = NULL;
    END IF;
  END IF;

  -- Task: UUID array to ID array
  old_uuids := CASE WHEN TG_OP = 'UPDATE' THEN COALESCE(OLD.task_fk_tasks, ARRAY[]::uuid[])
                    ELSE ARRAY[]::uuid[] END;
  new_uuids := COALESCE(NEW.task_fk_tasks, ARRAY[]::uuid[]);
  
  IF (TG_OP = 'INSERT' AND array_length(new_uuids, 1) > 0) OR
     (TG_OP = 'UPDATE' AND old_uuids IS DISTINCT FROM new_uuids) THEN
    IF array_length(new_uuids, 1) > 0 THEN
      NEW.task_id = ARRAY(SELECT id FROM tasks WHERE whalesync_postgres_id = ANY(new_uuids))::integer[];
    ELSE
      NEW.task_id = NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_sync_id_to_uuid_arrays_in_clients ON clients;
DROP TRIGGER IF EXISTS trigger_sync_uuid_to_id_arrays_in_clients ON clients;
DROP TRIGGER IF EXISTS trigger_sync_all_id_arrays_in_clients ON clients;

-- Create trigger 1: ID arrays to UUID arrays (fires first with priority 1)
CREATE TRIGGER trigger_sync_id_to_uuid_arrays_in_clients
  BEFORE INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION sync_id_to_uuid_arrays_in_clients();

-- Create trigger 2: UUID arrays to ID arrays (fires second with priority 2)  
CREATE TRIGGER trigger_sync_uuid_to_id_arrays_in_clients
  BEFORE INSERT OR UPDATE OR DELETE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION sync_uuid_to_id_arrays_in_clients();