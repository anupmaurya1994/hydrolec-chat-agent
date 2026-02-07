CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    name text,

    project_id integer[] DEFAULT NULL CHECK (project_id IS NULL OR array_length(project_id, 1) = 1), -- limit 1, 2 way relation - projects
    project TEXT[] DEFAULT NULL CHECK (project IS NULL OR array_length(project, 1) = 1),

    description text default null,
    status text DEFAULT 'Not started' CHECK (status IN ('Not started', 'In progress', 'Done')),

    milestone_id int[] default null , -- no limit, one way relation - Milestones
    milestone text[] default null,

    -- tag_id int[] default null, -- no limit, one way relation - tags
    -- tag text[] default null,
    tags text,

    meeting_transcript_id int[] default null CHECK (meeting_transcript_id IS NULL OR array_length(meeting_transcript_id, 1) = 1), -- limit 1, 2 way relation - meeting_transcripts
    meeting_transcript text[] default null CHECK (meeting_transcript IS NULL OR array_length(meeting_transcript, 1) = 1),

    briefing_id int[] default null, -- no limit, two way relation - briefings
    briefing text[] default null,

    client_id integer[] DEFAULT NULL CHECK (client_id IS NULL OR array_length(client_id, 1) = 1), -- limit 1, 2 way relation - clients
    client TEXT[] DEFAULT NULL CHECK (client IS NULL OR array_length(client, 1) = 1),

    circus_sync boolean default false not null, 

    corresponding_id text,
    current integer default null,
    goal integer default null,
    id_pull text, --formula  
    progress text, --formula (that progress bar column)

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

-- Basic column indexes (B-tree for single values)
CREATE INDEX idx_goals_name ON goals USING btree (name);
CREATE INDEX idx_goals_description ON goals USING btree (description);
CREATE INDEX idx_goals_status ON goals USING btree (status);
CREATE INDEX idx_goals_tags ON goals USING btree (tags);
CREATE INDEX idx_goals_circus_sync ON goals USING btree (circus_sync);
CREATE INDEX idx_goals_corresponding_id ON goals USING btree (corresponding_id);
CREATE INDEX idx_goals_current ON goals USING btree (current);
CREATE INDEX idx_goals_goal ON goals USING btree (goal);
CREATE INDEX idx_goals_id_pull ON goals USING btree (id_pull);
CREATE INDEX idx_goals_progress ON goals USING btree (progress);
CREATE INDEX idx_goals_created_at ON goals USING btree (created_at);
CREATE INDEX idx_goals_updated_at ON goals USING btree (updated_at);

-- Array column indexes using GIN (Generalized Inverted Index)
-- Single-element arrays (with CHECK constraints for length = 1)
CREATE INDEX idx_goals_project_id ON goals USING gin (project_id);
CREATE INDEX idx_goals_project ON goals USING gin (project);
CREATE INDEX idx_goals_meeting_transcript_id ON goals USING gin (meeting_transcript_id);
CREATE INDEX idx_goals_meeting_transcript ON goals USING gin (meeting_transcript);
CREATE INDEX idx_goals_client_id ON goals USING gin (client_id);
CREATE INDEX idx_goals_client ON goals USING gin (client);

-- Multi-element arrays (no limit)
CREATE INDEX idx_goals_milestone_id ON goals USING gin (milestone_id);
CREATE INDEX idx_goals_milestone ON goals USING gin (milestone);
CREATE INDEX idx_goals_briefing_id ON goals USING gin (briefing_id);
CREATE INDEX idx_goals_briefing ON goals USING gin (briefing);

--triggers
CREATE OR REPLACE FUNCTION sync_all_name_arrays_in_goals()
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

  -- Update meeting_transcript names if meeting_transcript_id changed
  IF NEW.meeting_transcript_id IS DISTINCT FROM OLD.meeting_transcript_id OR OLD.meeting_transcript_id IS NULL THEN
    IF NEW.meeting_transcript_id IS NOT NULL AND array_length(NEW.meeting_transcript_id, 1) > 0 THEN
      NEW.meeting_transcript = ARRAY(SELECT name FROM meeting_transcripts WHERE id = ANY(NEW.meeting_transcript_id))::text[];
    ELSE
      NEW.meeting_transcript = NULL;
    END IF;
  END IF;

  -- Update client names if client_id changed
  IF NEW.client_id IS DISTINCT FROM OLD.client_id OR OLD.client_id IS NULL THEN
    IF NEW.client_id IS NOT NULL AND array_length(NEW.client_id, 1) > 0 THEN
      NEW.client = ARRAY(SELECT name FROM clients WHERE id = ANY(NEW.client_id))::text[];
    ELSE
      NEW.client = NULL;
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for the goals table
CREATE TRIGGER trigger_sync_all_name_arrays_in_goals
  BEFORE INSERT OR UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION sync_all_name_arrays_in_goals();