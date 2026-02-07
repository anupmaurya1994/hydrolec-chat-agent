CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE briefings (
    id SERIAL PRIMARY KEY,
    name TEXT,
    
    client_id integer[] DEFAULT NULL CHECK (client_id IS NULL OR array_length(client_id, 1) = 1), -- limit 1, 2 way relation - clients
    client TEXT[] DEFAULT NULL CHECK (client IS NULL OR array_length(client, 1) = 1),
    
    project_id integer[] DEFAULT NULL CHECK (project_id IS NULL OR array_length(project_id, 1) = 1), -- limit 1, 2 way relation - projects
    project TEXT[] DEFAULT NULL CHECK (project IS NULL OR array_length(project, 1) = 1),
    
    objective text,
    
    outcome_id integer[] DEFAULT NULL, -- this references/means goals, can store multiple val, 2 way relation - goals 
    outcome text[] DEFAULT NULL,

    success_criteria text,
    deadline TIMESTAMP WITH TIME ZONE, -- calculated from projects

    asset_id int[] DEFAULT NULL, --2 way relation - assets (no limit)
    asset text[] DEFAULT NULL,

    -- tag_id int[] default null, -- no limit, one way relation - tags
    -- tag text[] default null,
    tags text,

    task_id int[] default null , -- no limit, 2 way relation - tasks
    task text[] default null, 

    meeting_transcript_id int[] default null , -- no limit, 2 way relation - meeting_transcripts
    meeting_transcript text[] default null, 

    -- note_id int[] default null, -- no limit, one way relation - Notes
    -- note text[] default null,
    notes text,

    client_type text CHECK (client_type IN ('Family', 'Privat', 'Internal', 'External')), -- calculated from clients
    project_owner text, --calculated from projects

    milestone_id int[] default null , -- no limit, 2 way relation - Milestones
    milestone text[] default null, 

    goals_header text, -- calculated from goals

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for all columns to optimize queries
CREATE INDEX idx_briefings_idt ON briefings (id);
CREATE INDEX idx_briefings_created_at ON briefings (created_at);
CREATE INDEX idx_briefings_updated_at ON briefings (updated_at);
CREATE INDEX idx_briefings_title ON briefings (title);
CREATE INDEX idx_briefings_success_criteria ON briefings (success_criteria);
CREATE INDEX idx_briefings_deadline ON briefings (deadline);
CREATE INDEX idx_briefings_tags ON briefings (tags);
CREATE INDEX idx_briefings_notes ON briefings (notes);
CREATE INDEX idx_briefings_client_type ON briefings (client_type);
CREATE INDEX idx_briefings_project_owner ON briefings (project_owner);
CREATE INDEX idx_briefings_goals_header ON briefings (goals_header);

-- GIN indexes for integer array columns (for containment queries)
CREATE INDEX idx_briefings_client_id ON briefings USING GIN (client_id);
CREATE INDEX idx_briefings_project_id ON briefings USING GIN (project_id);
CREATE INDEX idx_briefings_outcome_id ON briefings USING GIN (outcome_id);
CREATE INDEX idx_briefings_asset_id ON briefings USING GIN (asset_id);
CREATE INDEX idx_briefings_task_id ON briefings USING GIN (task_id);
CREATE INDEX idx_briefings_meeting_transcript_id ON briefings USING GIN (meeting_transcript_id);
CREATE INDEX idx_briefings_milestone_id ON briefings USING GIN (milestone_id);

-- GIN indexes for text array columns (for text search within arrays)
CREATE INDEX idx_briefings_client ON briefings USING GIN (client);
CREATE INDEX idx_briefings_project ON briefings USING GIN (project);
CREATE INDEX idx_briefings_outcome ON briefings USING GIN (outcome);
CREATE INDEX idx_briefings_asset ON briefings USING GIN (asset);
CREATE INDEX idx_briefings_task ON briefings USING GIN (task);
CREATE INDEX idx_briefings_meeting_transcript ON briefings USING GIN (meeting_transcript);
CREATE INDEX idx_briefings_milestone ON briefings USING GIN (milestone);

-- Function to update client names when client_id changes
CREATE OR REPLACE FUNCTION update_client_names_in_briefings()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the client field is different from the new value
  IF NEW.client IS DISTINCT FROM ARRAY(SELECT name FROM clients WHERE id = ANY(NEW.client_id))::text[] THEN
    -- Update the client names field using the client_id array
    NEW.client = ARRAY(SELECT name FROM clients WHERE id = ANY(NEW.client_id))::text[];
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update project names when project_id changes
CREATE OR REPLACE FUNCTION update_project_names_in_briefings()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the project field is different from the new value
  IF NEW.project IS DISTINCT FROM ARRAY(SELECT name FROM projects WHERE id = ANY(NEW.project_id))::text[] THEN
    -- Update the project names field using the project_id array
    NEW.project = ARRAY(SELECT name FROM projects WHERE id = ANY(NEW.project_id))::text[];
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update outcome names when outcome_id changes
CREATE OR REPLACE FUNCTION update_outcome_names_in_briefings() -- outcome here means goals
RETURNS trigger AS
$$
BEGIN
  -- Only update if the outcome field is different from the new value
  IF NEW.outcome IS DISTINCT FROM ARRAY(SELECT name FROM goals WHERE id = ANY(NEW.outcome_id))::text[] THEN
    -- Update the outcome names field using the outcome_id array
    NEW.outcome = ARRAY(SELECT name FROM goals WHERE id = ANY(NEW.outcome_id))::text[];
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update asset names when asset_id changes
CREATE OR REPLACE FUNCTION update_asset_names_in_briefings()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the asset field is different from the new value
  IF NEW.asset IS DISTINCT FROM ARRAY(SELECT name FROM assets WHERE id = ANY(NEW.asset_id))::text[] THEN
    -- Update the asset names field using the asset_id array
    NEW.asset = ARRAY(SELECT name FROM assets WHERE id = ANY(NEW.asset_id))::text[];
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update task names when task_id changes
CREATE OR REPLACE FUNCTION update_task_names_in_briefings()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the task field is different from the new value
  IF NEW.task IS DISTINCT FROM ARRAY(SELECT name FROM tasks WHERE id = ANY(NEW.task_id))::text[] THEN
    -- Update the task names field using the task_id array
    NEW.task = ARRAY(SELECT name FROM tasks WHERE id = ANY(NEW.task_id))::text[];
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update meeting transcript names when meeting_transcript_id changes
CREATE OR REPLACE FUNCTION update_meeting_transcript_names_in_briefings()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the meeting_transcript field is different from the new value
  IF NEW.meeting_transcript IS DISTINCT FROM ARRAY(SELECT name FROM meeting_transcripts WHERE id = ANY(NEW.meeting_transcript_id))::text[] THEN
    -- Update the meeting_transcript names field using the meeting_transcript_id array
    NEW.meeting_transcript = ARRAY(SELECT name FROM meeting_transcripts WHERE id = ANY(NEW.meeting_transcript_id))::text[];
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update milestone names when milestone_id changes
CREATE OR REPLACE FUNCTION update_milestone_names_in_briefings()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the milestone field is different from the new value
  IF NEW.milestone IS DISTINCT FROM ARRAY(SELECT name FROM milestones WHERE id = ANY(NEW.milestone_id))::text[] THEN
    -- Update the milestone names field using the milestone_id array
    NEW.milestone = ARRAY(SELECT name FROM milestones WHERE id = ANY(NEW.milestone_id))::text[];
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each function
CREATE TRIGGER set_client_names_in_briefings
BEFORE INSERT OR UPDATE ON briefings
FOR EACH ROW
EXECUTE FUNCTION update_client_names_in_briefings();

CREATE TRIGGER set_project_names_in_briefings
BEFORE INSERT OR UPDATE ON briefings
FOR EACH ROW
EXECUTE FUNCTION update_project_names_in_briefings();

CREATE TRIGGER set_outcome_names_in_briefings
BEFORE INSERT OR UPDATE ON briefings
FOR EACH ROW
EXECUTE FUNCTION update_outcome_names_in_briefings();

CREATE TRIGGER set_asset_names_in_briefings
BEFORE INSERT OR UPDATE ON briefings
FOR EACH ROW
EXECUTE FUNCTION update_asset_names_in_briefings();

CREATE TRIGGER set_task_names_in_briefings
BEFORE INSERT OR UPDATE ON briefings
FOR EACH ROW
EXECUTE FUNCTION update_task_names_in_briefings();

CREATE TRIGGER set_meeting_transcript_names_in_briefings
BEFORE INSERT OR UPDATE ON briefings
FOR EACH ROW
EXECUTE FUNCTION update_meeting_transcript_names_in_briefings();

CREATE TRIGGER set_milestone_names_in_briefings
BEFORE INSERT OR UPDATE ON briefings
FOR EACH ROW
EXECUTE FUNCTION update_milestone_names_in_briefings();


