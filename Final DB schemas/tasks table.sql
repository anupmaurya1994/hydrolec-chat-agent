CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    name TEXT null,

    project_id integer[] DEFAULT NULL, -- no limit, 2 way relation - projects
    project TEXT[] DEFAULT NULL,

    status text DEFAULT 'Inbox' CHECK (status IN ('Inbox', 'Paused/Later (P3)', 'Next (P2)', 'Now (P1)','In progress','Draft Review','Waiting for Feedback','Done')),
    due_date timestamp with time zone default null,
    date_completed timestamp with time zone default null,

    assigned_to_id int[] default null, --no limit, no relation(linked to persons) - Persons/users (not a table in notion)
    assigned_to text[] default null,

    -- command_center_id int[] default null, --no limit, two way relation - people (discrete table in notion)
    -- command_center text[] default null,
    command_center text default null,

    -- agent_id int[] default null, --no limit, two way relation - agent
    -- agent text[] default null,
    agent text default null,

    -- milestone_id int[] default null, --related to projects table- this is a formula calculated from projects table --rollup
    milestone text[] default null, 
    --i think we dont need to create an array-id-name sync system here because this part will be automatically handled by notion - i will just keep teh text array for storing the values.

    briefing_id int[] default null, --no limit, two way relation - briefings
    briefing text[] default null,

    asset_id int[] default null, --no limit, two way relation - assets
    asset text[] default null,

    -- tag_id int[] default null, -- no limit, one way relation - tags
    -- tag text[] default null,
    tags text default null,
    
    meeting_transcript_id int[] default null , -- no limit, 2 way relation - meeting_transcripts
    meeting_transcript text[] default null, 

    -- note_id int[] default null, -- no limit, two way relation - Notes
    -- note text[] default null,
    notes text default null,

    exec_summary text default null, --this column is related to "minh's tasks summary" table which has been deleted

    completed_today text default null, -- checkbox - formula
    completed_yesterday text default null, -- checkbox - formula
    overdue text default null, -- checkbox - formula

    -- annie_summary_id int[] default null , -- no limit, 2 way relation - annie's summary
    -- annie_summary text[] default null, 
    annie_summary text default null,
    
    -- client_id int[] default null, --related to projects table- this is a formula calculated from projects table --rollup
    client text[] default null, 
    --i think we dont need to create an array-id-name sync system here because this part will be automatically handled by notion - i will just keep teh text array for storing the values.

    -- concesa_summary_id int[] default null , -- no limit, 2 way relation - concesa's summary
    -- concesa_summary text[] default null, 
    concesa_summary text default null,

    days text CHECK (days IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),

    due_date_display text, --formula 

    -- emiliano_summary_id int[] default null , -- no limit, 2 way relation - emiliano's summary
    -- emiliano_summary text[] default null, 
    emiliano_summary text default null,

    -- kat_summary_id int[] default null , -- no limit, 2 way relation - kat's summary
    -- kat_summary text[] default null, 
    kat_summary text default null,

    localization_key text, --formula

    -- minh_summary_id int[] default null , -- no limit, 2 way relation - kat's summary
    -- minh_summary text[] default null, 
    minh_summary text default null,

    next_due text, --formula

    occurences_id int[] default null , -- no limit, 2 way sync not relation - meeting_transcripts
    occurences text[] default null, 

    -- project_priority int[] default null, --related to projects table- this is a formula calculated from projects table --rollup
    project_priority text[] default null, 
    --i think we dont need to create an array-id-name sync system here because this part will be automatically handled by notion - i will just keep the text array for storing the values.

    -- rangbom_summary_id int[] default null , -- no limit, 2 way relation - rangbom's summary
    -- rangbom_summary text[] default null, 
    rangbom_summary text default null, 

    recur_interval int default null,
    recur_unit text CHECK (recur_unit IN ('Day(s)', 'Week(s)', 'Month(s)', 'Month(s) on the First Weekday','Month(s) on the Last Weekday','Month(s) on the Last Day','Year(s)')),
    
    -- team_summary_id int[] default null , -- no limit, 2 way relation - team summary
    -- team_summary text[] default null, 
    team_summary text default null,

    -- unsquared_media_summary_id int[] default null , -- no limit, 2 way relation - unsquared media's summary
    -- unsquared_media_summary text[] default null,
    unsquared_media_summary text default null, 

    -- updates_id int[] default null , -- no limit, one way relation - updates
    -- updates text[] default null, --this column is related to "updates" table which has been deleted
    updates text default null,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic column indexes (B-tree for single values)
CREATE INDEX idx_tasks_name ON tasks USING btree (name);
CREATE INDEX idx_tasks_status ON tasks USING btree (status);
CREATE INDEX idx_tasks_due_date ON tasks USING btree (due_date);
CREATE INDEX idx_tasks_date_completed ON tasks USING btree (date_completed);
CREATE INDEX idx_tasks_command_center ON tasks USING btree (command_center);
CREATE INDEX idx_tasks_agent ON tasks USING btree (agent);
CREATE INDEX idx_tasks_tags ON tasks USING btree (tags);
CREATE INDEX idx_tasks_notes ON tasks USING btree (notes);
CREATE INDEX idx_tasks_exec_summary ON tasks USING btree (exec_summary);
CREATE INDEX idx_tasks_completed_today ON tasks USING btree (completed_today);
CREATE INDEX idx_tasks_completed_yesterday ON tasks USING btree (completed_yesterday);
CREATE INDEX idx_tasks_overdue ON tasks USING btree (overdue);
CREATE INDEX idx_tasks_annie_summary ON tasks USING btree (annie_summary);
CREATE INDEX idx_tasks_concesa_summary ON tasks USING btree (concesa_summary);
CREATE INDEX idx_tasks_days ON tasks USING btree (days);
CREATE INDEX idx_tasks_due_date_display ON tasks USING btree (due_date_display);
CREATE INDEX idx_tasks_emiliano_summary ON tasks USING btree (emiliano_summary);
CREATE INDEX idx_tasks_kat_summary ON tasks USING btree (kat_summary);
CREATE INDEX idx_tasks_localization_key ON tasks USING btree (localization_key);
CREATE INDEX idx_tasks_minh_summary ON tasks USING btree (minh_summary);
CREATE INDEX idx_tasks_next_due ON tasks USING btree (next_due);
CREATE INDEX idx_tasks_rangbom_summary ON tasks USING btree (rangbom_summary);
CREATE INDEX idx_tasks_recur_interval ON tasks USING btree (recur_interval);
CREATE INDEX idx_tasks_recur_unit ON tasks USING btree (recur_unit);
CREATE INDEX idx_tasks_team_summary ON tasks USING btree (team_summary);
CREATE INDEX idx_tasks_unsquared_media_summary ON tasks USING btree (unsquared_media_summary);
CREATE INDEX idx_tasks_updates ON tasks USING btree (updates);
CREATE INDEX idx_tasks_created_at ON tasks USING btree (created_at);
CREATE INDEX idx_tasks_updated_at ON tasks USING btree (updated_at);

-- Array column indexes using GIN (Generalized Inverted Index) for better array operations
CREATE INDEX idx_tasks_project_id ON tasks USING gin (project_id);
CREATE INDEX idx_tasks_project ON tasks USING gin (project);
CREATE INDEX idx_tasks_assigned_to_id ON tasks USING gin (assigned_to_id);
CREATE INDEX idx_tasks_assigned_to ON tasks USING gin (assigned_to);
CREATE INDEX idx_tasks_milestone ON tasks USING gin (milestone);
CREATE INDEX idx_tasks_briefing_id ON tasks USING gin (briefing_id);
CREATE INDEX idx_tasks_briefing ON tasks USING gin (briefing);
CREATE INDEX idx_tasks_asset_id ON tasks USING gin (asset_id);
CREATE INDEX idx_tasks_asset ON tasks USING gin (asset);
CREATE INDEX idx_tasks_meeting_transcript_id ON tasks USING gin (meeting_transcript_id);
CREATE INDEX idx_tasks_meeting_transcript ON tasks USING gin (meeting_transcript);
CREATE INDEX idx_tasks_client ON tasks USING gin (client);
CREATE INDEX idx_tasks_occurences_id ON tasks USING gin (occurences_id);
CREATE INDEX idx_tasks_occurences ON tasks USING gin (occurences);
CREATE INDEX idx_tasks_project_priority ON tasks USING gin (project_priority);

-- Combined function that handles all array synchronization
CREATE OR REPLACE FUNCTION sync_all_name_arrays_in_tasks()
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

  -- Update assigned_to names if assigned_to_id changed
  IF NEW.assigned_to_id IS DISTINCT FROM OLD.assigned_to_id OR OLD.assigned_to_id IS NULL THEN
    IF NEW.assigned_to_id IS NOT NULL AND array_length(NEW.assigned_to_id, 1) > 0 THEN
      NEW.assigned_to = ARRAY(SELECT name FROM users WHERE id = ANY(NEW.assigned_to_id))::text[];
    ELSE
      NEW.assigned_to = NULL;
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

  -- Update asset names if asset_id changed
  IF NEW.asset_id IS DISTINCT FROM OLD.asset_id OR OLD.asset_id IS NULL THEN
    IF NEW.asset_id IS NOT NULL AND array_length(NEW.asset_id, 1) > 0 THEN
      NEW.asset = ARRAY(SELECT name FROM assets WHERE id = ANY(NEW.asset_id))::text[];
    ELSE
      NEW.asset = NULL;
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_all_name_arrays_in_tasks
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION sync_all_name_arrays_in_tasks();