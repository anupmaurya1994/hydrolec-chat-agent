CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE meeting_transcripts (
    id SERIAL PRIMARY KEY,
    name TEXT,
    meeting_date timestamp with time zone,
    transcript_link text default null,

    client_id integer[] DEFAULT NULL CHECK (client_id IS NULL OR array_length(client_id, 1) = 1), -- limit 1, 2 way relation - clients
    client TEXT[] DEFAULT NULL CHECK (client IS NULL OR array_length(client, 1) = 1),
    
    project_id integer[] DEFAULT NULL CHECK (project_id IS NULL OR array_length(project_id, 1) = 1), -- limit 1, 2 way relation - projects
    project TEXT[] DEFAULT NULL CHECK (project IS NULL OR array_length(project, 1) = 1),
    
    task_id integer[] DEFAULT NULL CHECK (task_id IS NULL OR array_length(task_id, 1) = 1), -- limit 1, 2 way relation - tasks
    task TEXT[] DEFAULT NULL CHECK (task IS NULL OR array_length(task, 1) = 1),

    -- people_id int[] default null, --no limit, two way relation - people (discrete table in notion)
    -- people text[] default null,
    people text default null,

    briefing_id int[] default null, --no limit, two way relation - briefings
    briefing text[] default null,

    milestone_id int[] DEFAULT NULL CHECK (milestone_id IS NULL OR array_length(milestone_id, 1) = 1), -- limit 1, 2 way relation - Milestones
    milestone text[] DEFAULT NULL CHECK (milestone IS NULL OR array_length(milestone, 1) = 1), 

    -- memory_log_id int[] default null, --no limit, two way relation - Memory/Logs (discrete table in notion)
    -- memory_log text[] default null,
    memory_log text default null,

    goal_id int[] default null, --no limit, two way relation - goals
    goal text[] default null,

    -- tag_id int[] default null, -- no limit, one way relation - tags
    -- tag text[] default null,
    tags text,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic column indexes (B-tree for single values)
CREATE INDEX idx_meeting_transcripts_name ON meeting_transcripts USING btree (name);
CREATE INDEX idx_meeting_transcripts_meeting_date ON meeting_transcripts USING btree (meeting_date);
CREATE INDEX idx_meeting_transcripts_transcript_link ON meeting_transcripts USING btree (transcript_link);
CREATE INDEX idx_meeting_transcripts_people ON meeting_transcripts USING btree (people);
CREATE INDEX idx_meeting_transcripts_memory_log ON meeting_transcripts USING btree (memory_log);
CREATE INDEX idx_meeting_transcripts_tags ON meeting_transcripts USING btree (tags);
CREATE INDEX idx_meeting_transcripts_created_at ON meeting_transcripts USING btree (created_at);
CREATE INDEX idx_meeting_transcripts_updated_at ON meeting_transcripts USING btree (updated_at);

-- Array column indexes using GIN (Generalized Inverted Index) for better array operations
-- Single-element arrays (with CHECK constraints for length = 1)
CREATE INDEX idx_meeting_transcripts_client_id ON meeting_transcripts USING gin (client_id);
CREATE INDEX idx_meeting_transcripts_client ON meeting_transcripts USING gin (client);
CREATE INDEX idx_meeting_transcripts_project_id ON meeting_transcripts USING gin (project_id);
CREATE INDEX idx_meeting_transcripts_project ON meeting_transcripts USING gin (project);
CREATE INDEX idx_meeting_transcripts_task_id ON meeting_transcripts USING gin (task_id);
CREATE INDEX idx_meeting_transcripts_task ON meeting_transcripts USING gin (task);
CREATE INDEX idx_meeting_transcripts_milestone_id ON meeting_transcripts USING gin (milestone_id);
CREATE INDEX idx_meeting_transcripts_milestone ON meeting_transcripts USING gin (milestone);

-- Multi-element arrays (no limit)
CREATE INDEX idx_meeting_transcripts_briefing_id ON meeting_transcripts USING gin (briefing_id);
CREATE INDEX idx_meeting_transcripts_briefing ON meeting_transcripts USING gin (briefing);
CREATE INDEX idx_meeting_transcripts_goal_id ON meeting_transcripts USING gin (goal_id);
CREATE INDEX idx_meeting_transcripts_goal ON meeting_transcripts USING gin (goal);

-- Function to update names arrays when table changes
CREATE OR REPLACE FUNCTION sync_all_name_arrays_in_meeting_transcripts()
RETURNS trigger AS
$$
BEGIN
  -- Update client names if client_id changed
  IF NEW.client_id IS DISTINCT FROM OLD.client_id OR OLD.client_id IS NULL THEN
    IF NEW.client_id IS NOT NULL AND array_length(NEW.client_id, 1) > 0 THEN
      NEW.client = ARRAY(SELECT name FROM clients WHERE id = ANY(NEW.client_id))::text[];
    ELSE
      NEW.client = NULL;
    END IF;
  END IF;

  -- Update project names if project_id changed
  IF NEW.project_id IS DISTINCT FROM OLD.project_id OR OLD.project_id IS NULL THEN
    IF NEW.project_id IS NOT NULL AND array_length(NEW.project_id, 1) > 0 THEN
      NEW.project = ARRAY(SELECT name FROM projects WHERE id = ANY(NEW.project_id))::text[];
    ELSE
      NEW.project = NULL;
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

  -- Update milestone names if milestone_id changed
  IF NEW.milestone_id IS DISTINCT FROM OLD.milestone_id OR OLD.milestone_id IS NULL THEN
    IF NEW.milestone_id IS NOT NULL AND array_length(NEW.milestone_id, 1) > 0 THEN
      NEW.milestone = ARRAY(SELECT name FROM milestones WHERE id = ANY(NEW.milestone_id))::text[];
    ELSE
      NEW.milestone = NULL;
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

  -- Update goal names if goal_id changed
  IF NEW.goal_id IS DISTINCT FROM OLD.goal_id OR OLD.goal_id IS NULL THEN
    IF NEW.goal_id IS NOT NULL AND array_length(NEW.goal_id, 1) > 0 THEN
      NEW.goal = ARRAY(SELECT name FROM goals WHERE id = ANY(NEW.goal_id))::text[];
    ELSE
      NEW.goal = NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for the meeting_transcripts table
CREATE TRIGGER trigger_sync_all_name_arrays_in_meeting_transcripts
  BEFORE INSERT OR UPDATE ON meeting_transcripts
  FOR EACH ROW
  EXECUTE FUNCTION sync_all_name_arrays_in_meeting_transcripts();