CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    name TEXT,
    type text default null check(type IN ('Social Media Post', 'Image', 'Blog', 'Doc', 'Loom Video', 'YouTube Video', 'Sheets', 'Notion Page')),
    link text default null,

    -- client_id integer[] DEFAULT NULL CHECK (client_id IS NULL OR array_length(client_id, 1) = 1), --formula, calculated from projects
    client TEXT[] DEFAULT NULL, --just text array to store the values
    
    display text default null, --formula

    -- tag_id int[] default null, -- no limit, one way relation - tags
    -- tag text[] default null,
    tags text,

    -- note_id int[] default null, -- no limit, 2 way relation - Notes
    -- note text[] default null,
    notes text,

    briefing_id int[] default null, --no limit, two way relation - briefings
    briefing text[] default null,

    milestone_id int[] default null , -- no limit, 2 way relation - Milestones
    milestone text[] default null, 

    project_id integer[] DEFAULT NULL, -- no limit, 2 way relation - projects
    project TEXT[] DEFAULT NULL,

    task_id int[] default null , -- no limit, 2 way relation - tasks
    task text[] default null, 

    description text default null,
    created_date date DEFAULT CURRENT_DATE,

    circus_sync boolean default false not null,

    corresponding_id text,
    id_pull text, --formula

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Basic column indexes (B-tree for single values)
CREATE INDEX idx_assets_name ON assets USING btree (name);
CREATE INDEX idx_assets_type ON assets USING btree (type);
CREATE INDEX idx_assets_link ON assets USING btree (link);
CREATE INDEX idx_assets_display ON assets USING btree (display);
CREATE INDEX idx_assets_tags ON assets USING btree (tags);
CREATE INDEX idx_assets_notes ON assets USING btree (notes);
CREATE INDEX idx_assets_description ON assets USING btree (description);
CREATE INDEX idx_assets_created_date ON assets USING btree (created_date);
CREATE INDEX idx_assets_circus_sync ON assets USING btree (circus_sync);
CREATE INDEX idx_assets_corresponding_id ON assets USING btree (corresponding_id);
CREATE INDEX idx_assets_id_pull ON assets USING btree (id_pull);
CREATE INDEX idx_assets_created_at ON assets USING btree (created_at);
CREATE INDEX idx_assets_updated_at ON assets USING btree (updated_at);

-- Array column indexes using GIN (Generalized Inverted Index) for better array operations
CREATE INDEX idx_assets_client ON assets USING gin (client);
CREATE INDEX idx_assets_briefing_id ON assets USING gin (briefing_id);
CREATE INDEX idx_assets_briefing ON assets USING gin (briefing);
CREATE INDEX idx_assets_milestone_id ON assets USING gin (milestone_id);
CREATE INDEX idx_assets_milestone ON assets USING gin (milestone);
CREATE INDEX idx_assets_project_id ON assets USING gin (project_id);
CREATE INDEX idx_assets_project ON assets USING gin (project);
CREATE INDEX idx_assets_task_id ON assets USING gin (task_id);
CREATE INDEX idx_assets_task ON assets USING gin (task);

CREATE OR REPLACE FUNCTION sync_all_name_arrays_in_assets()
RETURNS trigger AS
$$
BEGIN
  -- Update briefing names if briefing_id changed
  IF NEW.briefing_id IS DISTINCT FROM OLD.briefing_id OR OLD.briefing_id IS NULL THEN
    IF NEW.briefing_id IS NOT NULL AND array_length(NEW.briefing_id, 1) > 0 THEN
      NEW.briefing = ARRAY(SELECT name FROM briefings WHERE id = ANY(NEW.briefing_id))::text[];
    ELSE
      NEW.briefing = NULL;
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

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger for the assets table
CREATE TRIGGER trigger_sync_all_name_arrays_in_assets
  BEFORE INSERT OR UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION sync_all_name_arrays_in_assets();