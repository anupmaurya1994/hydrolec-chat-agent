CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE milestones (
    id SERIAL PRIMARY KEY,
    name text,

    status text DEFAULT 'Not started' CHECK (status IN ('Not started', 'Backlog', 'Paused', 'High Priority', 'Under Review', 'In progress', 'Shipped', 'Done')),
    due_date timestamp with time zone default null,
    
    project_id integer[] DEFAULT NULL CHECK (project_id IS NULL OR array_length(project_id, 1) = 1), -- limit 1, 1 way relation - projects
    project TEXT[] DEFAULT NULL CHECK (project IS NULL OR array_length(project, 1) = 1),

    task_id integer[] DEFAULT NULL, -- no limit, 1 way relation - tasks
    task TEXT[] DEFAULT NULL,

    -- tag_id int[] default null, -- no limit, one way relation - tags
    -- tag text[] default null,
    tags text,
    
    client_id integer[] DEFAULT NULL, -- no limit, 2 way relation - clients
    client TEXT[] DEFAULT NULL,

    meeting_transcript_id int[] default null , -- no limit, 2 way relation - meeting_transcripts
    meeting_transcript text[] default null,

    -- note_id int[] default null, -- no limit, 2 way relation - Notes
    -- note text[] default null,
    notes text,


    project_type text, -- formula- calculated from clients(type) table

    briefing_id int[] default null CHECK (briefing_id IS NULL OR array_length(briefing_id, 1) = 1), -- limit 1, two way relation - briefings
    briefing text[] default null CHECK (briefing IS NULL OR array_length(briefing, 1) = 1),

    project_owner text, --formula - calculated from projects(command center)

    asset_id int[] default null, --no limit, 2 way relation - assets
    asset text[] default null,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

-- Basic column indexes (B-tree for single values)
CREATE INDEX idx_milestones_name ON milestones USING btree (name);
CREATE INDEX idx_milestones_status ON milestones USING btree (status);
CREATE INDEX idx_milestones_due_date ON milestones USING btree (due_date);
CREATE INDEX idx_milestones_tags ON milestones USING btree (tags);
CREATE INDEX idx_milestones_notes ON milestones USING btree (notes);
CREATE INDEX idx_milestones_project_type ON milestones USING btree (project_type);
CREATE INDEX idx_milestones_project_owner ON milestones USING btree (project_owner);
CREATE INDEX idx_milestones_created_at ON milestones USING btree (created_at);
CREATE INDEX idx_milestones_updated_at ON milestones USING btree (updated_at);

-- Array column indexes using GIN (Generalized Inverted Index)
-- Single-element arrays (with CHECK constraints for length = 1)
CREATE INDEX idx_milestones_project_id ON milestones USING gin (project_id);
CREATE INDEX idx_milestones_project ON milestones USING gin (project);
CREATE INDEX idx_milestones_briefing_id ON milestones USING gin (briefing_id);
CREATE INDEX idx_milestones_briefing ON milestones USING gin (briefing);

-- Multi-element arrays (no limit)
CREATE INDEX idx_milestones_task_id ON milestones USING gin (task_id);
CREATE INDEX idx_milestones_task ON milestones USING gin (task);
CREATE INDEX idx_milestones_client_id ON milestones USING gin (client_id);
CREATE INDEX idx_milestones_client ON milestones USING gin (client);
CREATE INDEX idx_milestones_meeting_transcript_id ON milestones USING gin (meeting_transcript_id);
CREATE INDEX idx_milestones_meeting_transcript ON milestones USING gin (meeting_transcript);
CREATE INDEX idx_milestones_asset_id ON milestones USING gin (asset_id);
CREATE INDEX idx_milestones_asset ON milestones USING gin (asset);

CREATE OR REPLACE FUNCTION sync_all_name_arrays_in_milestones() RETURNS trigger AS $$
BEGIN
    -- Update project names if project_id changed
    IF NEW.project_id IS DISTINCT FROM OLD.project_id OR OLD.project_id IS NULL THEN
        IF NEW.project_id IS NOT NULL AND array_length(NEW.project_id, 1) > 0 THEN
            NEW.project = ARRAY(SELECT name FROM projects WHERE id = ANY(NEW.project_id))::text[];
        ELSE
            NEW.project = NULL;
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

    -- Update task names if task_id changed
    IF NEW.task_id IS DISTINCT FROM OLD.task_id OR OLD.task_id IS NULL THEN
        IF NEW.task_id IS NOT NULL AND array_length(NEW.task_id, 1) > 0 THEN
            NEW.task = ARRAY(SELECT name FROM tasks WHERE id = ANY(NEW.task_id))::text[];
        ELSE
            NEW.task = NULL;
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

    -- Update meeting_transcript names if meeting_transcript_id changed
    IF NEW.meeting_transcript_id IS DISTINCT FROM OLD.meeting_transcript_id OR OLD.meeting_transcript_id IS NULL THEN
        IF NEW.meeting_transcript_id IS NOT NULL AND array_length(NEW.meeting_transcript_id, 1) > 0 THEN
            NEW.meeting_transcript = ARRAY(SELECT name FROM meeting_transcripts WHERE id = ANY(NEW.meeting_transcript_id))::text[];
        ELSE
            NEW.meeting_transcript = NULL;
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

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_all_name_arrays_in_milestones
    BEFORE INSERT OR UPDATE ON milestones
    FOR EACH ROW EXECUTE FUNCTION sync_all_name_arrays_in_milestones();