CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name text,
    type text default null CHECK (type IN ('Family', 'Privat', 'Internal', 'External')),
    email text default null,
    contact text default null,
    website text,

    project_id integer[] DEFAULT NULL, -- no limit, 2 way relation - projects
    project TEXT[] DEFAULT NULL,

    asset_id int[] default null, --no limit, one way relation - assets
    asset text[] default null,
    
    -- tag_id int[] default null, -- no limit, one way relation - tags
    -- tag text[] default null,
    tags text,

    briefing_id int[] default null, -- no limit, two way relation - briefings
    briefing text[] default null,

    meeting_transcript_id int[] default null , -- no limit, 2 way relation - meeting_transcripts
    meeting_transcript text[] default null,

    -- note_id int[] default null, -- no limit, 2 way relation - Notes
    -- note text[] default null,
    notes text,

    milestone_id int[] default null , -- no limit, 2 way relation - Milestones
    milestone text[] default null,

    cover text, --image (cover page ) -- for now in url format

    goal_id int[] default null, --no limit, two way relation - goals
    goal text[] default null,

    status text check (status in ('Active', 'Archive')),

    task_id integer[] DEFAULT NULL, -- no limit, 1 way relation - tasks
    task TEXT[] DEFAULT NULL,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Basic column indexes (B-tree for single values)
CREATE INDEX idx_clients_name ON clients USING btree (name);
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
CREATE INDEX idx_clients_project ON clients USING gin (project);
CREATE INDEX idx_clients_asset_id ON clients USING gin (asset_id);
CREATE INDEX idx_clients_asset ON clients USING gin (asset);
CREATE INDEX idx_clients_briefing_id ON clients USING gin (briefing_id);
CREATE INDEX idx_clients_briefing ON clients USING gin (briefing);
CREATE INDEX idx_clients_meeting_transcript_id ON clients USING gin (meeting_transcript_id);
CREATE INDEX idx_clients_meeting_transcript ON clients USING gin (meeting_transcript);
CREATE INDEX idx_clients_milestone_id ON clients USING gin (milestone_id);
CREATE INDEX idx_clients_milestone ON clients USING gin (milestone);
CREATE INDEX idx_clients_goal_id ON clients USING gin (goal_id);
CREATE INDEX idx_clients_goal ON clients USING gin (goal);
CREATE INDEX idx_clients_task_id ON clients USING gin (task_id);
CREATE INDEX idx_clients_task ON clients USING gin (task);

CREATE OR REPLACE FUNCTION sync_all_name_arrays_in_clients()
RETURNS trigger AS
$$
BEGIN
  -- Update project names if project_id changed
  IF NEW.project_id IS DISTINCT FROM OLD.project_id OR OLD.project_id IS NULL THEN
    IF NEW.project_id IS NOT NULL AND array_length(NEW.project_id, 1) > 0 THEN
      NEW.project = ARRAY(SELECT name FROM projects WHERE id = ANY(NEW.project_id))::text[];
    ELSE
      NEW.project = NULL;
    END IF;
  END IF;

  -- Update asset names if asset_id changed
  IF NEW.asset_id IS DISTINCT FROM OLD.asset_id OR OLD.asset_id IS NULL THEN
    IF NEW.asset_id IS NOT NULL AND array_length(NEW.asset_id, 1) > 0 THEN
      NEW.asset = ARRAY(SELECT name FROM assets WHERE id = ANY(NEW.asset_id))::text[];
    ELSE
      NEW.asset = NULL;
    END IF;
  END IF;

  -- Update briefing names if briefing_id changed
  IF NEW.briefing_id IS DISTINCT FROM OLD.briefing_id OR OLD.briefing_id IS NULL THEN
    IF NEW.briefing_id IS NOT NULL AND array_length(NEW.briefing_id, 1) > 0 THEN
      NEW.briefing = ARRAY(SELECT name FROM briefings WHERE id = ANY(NEW.briefing_id))::text[];
    ELSE
      NEW.briefing = NULL;
    END IF;
  END IF;

  -- Update meeting_transcript names if meeting_transcript_id changed
  IF NEW.meeting_transcript_id IS DISTINCT FROM OLD.meeting_transcript_id OR OLD.meeting_transcript_id IS NULL THEN
    IF NEW.meeting_transcript_id IS NOT NULL AND array_length(NEW.meeting_transcript_id, 1) > 0 THEN
      NEW.meeting_transcript = ARRAY(SELECT name FROM meeting_transcripts WHERE id = ANY(NEW.meeting_transcript_id))::text[];
    ELSE
      NEW.meeting_transcript = NULL;
    END IF;
  END IF;

  -- Update milestone names if milestone_id changed
  IF NEW.milestone_id IS DISTINCT FROM OLD.milestone_id OR OLD.milestone_id IS NULL THEN
    IF NEW.milestone_id IS NOT NULL AND array_length(NEW.milestone_id, 1) > 0 THEN
      NEW.milestone = ARRAY(SELECT name FROM milestones WHERE id = ANY(NEW.milestone_id))::text[];
    ELSE
      NEW.milestone = NULL;
    END IF;
  END IF;

  -- Update goal names if goal_id changed
  IF NEW.goal_id IS DISTINCT FROM OLD.goal_id OR OLD.goal_id IS NULL THEN
    IF NEW.goal_id IS NOT NULL AND array_length(NEW.goal_id, 1) > 0 THEN
      NEW.goal = ARRAY(SELECT name FROM goals WHERE id = ANY(NEW.goal_id))::text[];
    ELSE
      NEW.goal = NULL;
    END IF;
  END IF;

  -- Update task names if task_id changed
  IF NEW.task_id IS DISTINCT FROM OLD.task_id OR OLD.task_id IS NULL THEN
    IF NEW.task_id IS NOT NULL AND array_length(NEW.task_id, 1) > 0 THEN
      NEW.task = ARRAY(SELECT name FROM tasks WHERE id = ANY(NEW.task_id))::text[];
    ELSE
      NEW.task = NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for the clients table
CREATE TRIGGER trigger_sync_all_name_arrays_in_clients
  BEFORE INSERT OR UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION sync_all_name_arrays_in_clients();