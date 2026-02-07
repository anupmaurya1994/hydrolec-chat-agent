CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name text,
    priority text CHECK (priority IN ('P1', 'P2', 'P3')),
    status text DEFAULT 'Not started' CHECK (status IN ('Not started', 'In progress', 'Stuck', 'Done')),
    deadline timestamp with time zone, 

    -- command_center_id int[] default null CHECK (command_center_id IS NULL OR array_length(command_center_id, 1) = 1), -- limit 1, two way relation - people (discrete table in notion)
    -- command_center text[] default null CHECK (command_center IS NULL OR array_length(command_center, 1) = 1),
    command_center text default null,

    client_id integer[] DEFAULT NULL CHECK (client_id IS NULL OR array_length(client_id, 1) = 1), -- limit 1, 2 way relation - clients
    client TEXT[] DEFAULT NULL CHECK (client IS NULL OR array_length(client, 1) = 1),
    
    briefing_id int[] default null CHECK (briefing_id IS NULL OR array_length(briefing_id, 1) = 1), -- limit 1, two way relation - briefings
    briefing text[] default null CHECK (briefing IS NULL OR array_length(briefing, 1) = 1),
    
    goal_id int[] default null, --no limit, two way relation - goals
    goal text[] default null,

    --here milestone is a select option data type which i think is a mistake, and with this assupmtion i am making a relation column with 
    -- milestone_id int[] DEFAULT NULL CHECK (milestone_id IS NULL OR array_length(milestone_id, 1) = 1), --this is an assumption- no limit , 2 way relation - Milestones
    milestone text[] DEFAULT NULL, 

    task_id integer[] DEFAULT NULL, -- no limit, 2 way relation - tasks
    task TEXT[] DEFAULT NULL,

    asset_id int[] DEFAULT NULL, --no limit, 2 way relation - assets
    asset text[] DEFAULT NULL,
    
    -- tag_id int[] default null, -- no limit, one way relation - tags
    -- tag text[] default null,
    tags text,

    meeting_transcript_id int[] default null , -- no limit, 2 way relation - meeting_transcripts
    meeting_transcript text[] default null,

    -- note_id int[] default null, -- no limit, 2 way relation - Notes
    -- note text[] default null,
    notes text,

    client_display text, --formula
    date_completed timestamp with time zone, 
    date_completed_display text, --formula
    deadline_display text, --formula
    overdue_tasks text, --formula

    owner_id int[] default null , -- no limit - users/owners (this references the users/participants in notion)
    owner text[] default null,

    owner_display text, --formula
    progress text, --formula (that progress bar column)
    remaining_tasks text, --formula
    space text, --formula
    summary text, --formula
    circus_sync boolean default false not null, 

    client_v2 text check(client_v2 in ('Mama Hanh', 'Ms Hanh', 'Circus Group', 'Fully AI', 'Gastrofüsterer', 'DAO OS', 'Mama Le Bao', 'Asia Hung', 'Clinic OS', 'Internal')),

    corresponding_id text,
    id_pull text, --formula

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_name ON projects(name);
CREATE INDEX idx_projects_priority ON projects(priority);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_deadline ON projects(deadline);
CREATE INDEX idx_projects_command_center ON projects(command_center);

-- For arrays, GIN index is more efficient than btree
CREATE INDEX idx_projects_client_id ON projects USING gin(client_id);
CREATE INDEX idx_projects_client ON projects USING gin(client);
CREATE INDEX idx_projects_briefing_id ON projects USING gin(briefing_id);
CREATE INDEX idx_projects_briefing ON projects USING gin(briefing);
CREATE INDEX idx_projects_goal_id ON projects USING gin(goal_id);
CREATE INDEX idx_projects_goal ON projects USING gin(goal);
CREATE INDEX idx_projects_milestone ON projects USING gin(milestone);
CREATE INDEX idx_projects_task_id ON projects USING gin(task_id);
CREATE INDEX idx_projects_task ON projects USING gin(task);
CREATE INDEX idx_projects_asset_id ON projects USING gin(asset_id);
CREATE INDEX idx_projects_asset ON projects USING gin(asset);
CREATE INDEX idx_projects_meeting_transcript_id ON projects USING gin(meeting_transcript_id);
CREATE INDEX idx_projects_meeting_transcript ON projects USING gin(meeting_transcript);
CREATE INDEX idx_projects_owner_id ON projects USING gin(owner_id);
CREATE INDEX idx_projects_owner ON projects USING gin(owner);

-- Normal text indexes
CREATE INDEX idx_projects_tags ON projects(tags);
CREATE INDEX idx_projects_notes ON projects(notes);
CREATE INDEX idx_projects_client_display ON projects(client_display);
CREATE INDEX idx_projects_date_completed ON projects(date_completed);
CREATE INDEX idx_projects_date_completed_display ON projects(date_completed_display);
CREATE INDEX idx_projects_deadline_display ON projects(deadline_display);
CREATE INDEX idx_projects_overdue_tasks ON projects(overdue_tasks);
CREATE INDEX idx_projects_owner_display ON projects(owner_display);
CREATE INDEX idx_projects_progress ON projects(progress);
CREATE INDEX idx_projects_remaining_tasks ON projects(remaining_tasks);
CREATE INDEX idx_projects_space ON projects(space);
CREATE INDEX idx_projects_summary ON projects(summary);
CREATE INDEX idx_projects_circus_sync ON projects(circus_sync);
CREATE INDEX idx_projects_client_v2 ON projects(client_v2);
CREATE INDEX idx_projects_corresponding_id ON projects(corresponding_id);
CREATE INDEX idx_projects_id_pull ON projects(id_pull);
CREATE INDEX idx_projects_created_at ON projects(created_at);
CREATE INDEX idx_projects_updated_at ON projects(updated_at);

--trigger
CREATE OR REPLACE FUNCTION sync_all_name_arrays_in_projects()
RETURNS trigger AS $$
BEGIN
    -- Update client names
    IF NEW.client_id IS DISTINCT FROM OLD.client_id OR OLD.client_id IS NULL THEN
        IF NEW.client_id IS NOT NULL AND array_length(NEW.client_id, 1) > 0 THEN
            NEW.client = ARRAY(SELECT name FROM clients WHERE id = ANY(NEW.client_id))::text[];
        ELSE
            NEW.client = NULL;
        END IF;
    END IF;

    -- Update briefing names
    IF NEW.briefing_id IS DISTINCT FROM OLD.briefing_id OR OLD.briefing_id IS NULL THEN
        IF NEW.briefing_id IS NOT NULL AND array_length(NEW.briefing_id, 1) > 0 THEN
            NEW.briefing = ARRAY(SELECT name FROM briefings WHERE id = ANY(NEW.briefing_id))::text[];
        ELSE
            NEW.briefing = NULL;
        END IF;
    END IF;

    -- Update goal names
    IF NEW.goal_id IS DISTINCT FROM OLD.goal_id OR OLD.goal_id IS NULL THEN
        IF NEW.goal_id IS NOT NULL AND array_length(NEW.goal_id, 1) > 0 THEN
            NEW.goal = ARRAY(SELECT name FROM goals WHERE id = ANY(NEW.goal_id))::text[];
        ELSE
            NEW.goal = NULL;
        END IF;
    END IF;

    -- Update task names
    IF NEW.task_id IS DISTINCT FROM OLD.task_id OR OLD.task_id IS NULL THEN
        IF NEW.task_id IS NOT NULL AND array_length(NEW.task_id, 1) > 0 THEN
            NEW.task = ARRAY(SELECT name FROM tasks WHERE id = ANY(NEW.task_id))::text[];
        ELSE
            NEW.task = NULL;
        END IF;
    END IF;

    -- Update asset names
    IF NEW.asset_id IS DISTINCT FROM OLD.asset_id OR OLD.asset_id IS NULL THEN
        IF NEW.asset_id IS NOT NULL AND array_length(NEW.asset_id, 1) > 0 THEN
            NEW.asset = ARRAY(SELECT name FROM assets WHERE id = ANY(NEW.asset_id))::text[];
        ELSE
            NEW.asset = NULL;
        END IF;
    END IF;

    -- Update meeting transcript names
    IF NEW.meeting_transcript_id IS DISTINCT FROM OLD.meeting_transcript_id OR OLD.meeting_transcript_id IS NULL THEN
        IF NEW.meeting_transcript_id IS NOT NULL AND array_length(NEW.meeting_transcript_id, 1) > 0 THEN
            NEW.meeting_transcript = ARRAY(SELECT name FROM meeting_transcripts WHERE id = ANY(NEW.meeting_transcript_id))::text[];
        ELSE
            NEW.meeting_transcript = NULL;
        END IF;
    END IF;

    -- Update owner names
    IF NEW.owner_id IS DISTINCT FROM OLD.owner_id OR OLD.owner_id IS NULL THEN
        IF NEW.owner_id IS NOT NULL AND array_length(NEW.owner_id, 1) > 0 THEN
            NEW.owner = ARRAY(SELECT name FROM users WHERE id = ANY(NEW.owner_id))::text[];
        ELSE
            NEW.owner = NULL;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_sync_all_name_arrays_in_projects
BEFORE INSERT OR UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION sync_all_name_arrays_in_projects();
