--Doas 2

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('Family', 'Privat', 'Internal', 'External')),
    email VARCHAR(255),
    contact VARCHAR(50),
    website VARCHAR(500),
    project TEXT,
    assets TEXT,
    tags INTEGER,
    briefings TEXT,
    meeting_transcripts TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goals table
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Not started' CHECK (status IN ('Not started', 'In progress', 'Done')),
    tags TEXT,
    meeting_transcript text,--added
    briefings TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    priority VARCHAR(10) CHECK (priority IN ('P1', 'P2', 'P3')),
    status VARCHAR(50) DEFAULT 'Not started' CHECK (status IN ('Not started', 'In progress', 'Stuck', 'Done')),
    deadline DATE,
    command_center TEXT,
    briefings TEXT,
    milestones INTEGER DEFAULT 0,
    assets TEXT,
    tags TEXT,
    meeting_transcript TEXT,
    notes TEXT,
    date_completed DATE,
    date_completed_display DATE,
    deadline_display DATE,
    overdue_tasks TEXT,
    owner_display TEXT,
    --progress??
    remaining_tasks TEXT,
    owner_id INTEGER REFERENCES users(id), --idk
    client_id INTEGER REFERENCES clients(id), --idk
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    --project
    project_id INTEGER REFERENCES projects(id),
    status VARCHAR(50) DEFAULT 'Inbox' CHECK (status IN ('Inbox', 'Paused/Later (P3)', 'Next (P2)', 'Now(P1)','In progress','Review','Shipped','Done')),
    due_date DATE,
    date_completed DATE,
    command_center TEXT,
    agent TEXT,
    --milestone
    briefings TEXT,
    assets TEXT,
    tags TEXT,
    meeting_transcripts TEXT,
    notes TEXT,
    exec_summary TEXT,
    completed_today text, --added (one more filed was added in above table)
    completed_yesterday TEXT,
    overdue TEXT,
    annie_summary TEXT,
    assigned_to_id INTEGER REFERENCES users(id),
    --client id'
    concesa_summary TEXT,
    days VARCHAR(50) CHECK (days IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    due_date_display TEXT,
    emiliano_summary TEXT,
    kat_summary TEXT,
    --localization key formula
    minh_summary TEXT,
    next_due TEXT,
    --occurences
    --project priority
    rangbom_summary TEXT,
    recur_interval INTEGER,
    recur_unit VARCHAR(50) CHECK (recur_unit IN ('Day(s)', 'Week(s)', 'Month(s)', 'Month(s) on the First Weekday','Month(s) on the Last Weekday','Month(s) on the Last Day','Year(s)')),
    team_summary TEXT,
    unsquared_media_summary TEXT,
    updates TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Milestones table
CREATE TABLE milestones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'Not started' CHECK (status IN ('Not started', 'Backlog', 'Paused', 'In progress','High Priority','Under Review','Shipped','Done')),
    due_date DATE,
    --project
    project_id INTEGER REFERENCES projects(id),
    --tasks
    tags TEXT,
    --clients
    meeting_transcripts TEXT,
    notes TEXT,
    --project type
    briefings TEXT,
    --project owner
    assets TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction tables for many-to-many relationships

-- Projects <-> Goals
CREATE TABLE project_goals (
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    goal_id INTEGER REFERENCES goals(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, goal_id)
);

-- Projects <-> Tasks (already has foreign key, but for completeness)
-- Tasks already has project_id foreign key

-- Clients <-> Goals
CREATE TABLE client_goals (
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    goal_id INTEGER REFERENCES goals(id) ON DELETE CASCADE,
    PRIMARY KEY (client_id, goal_id)
);

-- Clients <-> Tasks
CREATE TABLE client_tasks (
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    PRIMARY KEY (client_id, task_id)
);

-- Clients <-> Milestones
CREATE TABLE client_milestones (
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    milestone_id INTEGER REFERENCES milestones(id) ON DELETE CASCADE,
    PRIMARY KEY (client_id, milestone_id)
);

-- Goals <-> Milestones
CREATE TABLE goal_milestones (
    goal_id INTEGER REFERENCES goals(id) ON DELETE CASCADE,
    milestone_id INTEGER REFERENCES milestones(id) ON DELETE CASCADE,
    PRIMARY KEY (goal_id, milestone_id)
);

-- Tasks <-> Tasks (for occurrences/self-referencing)
CREATE TABLE task_occurrences (
    parent_task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    child_task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    PRIMARY KEY (parent_task_id, child_task_id)
);

-- Create indexes for better performance
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_priority ON projects(priority);
CREATE INDEX idx_projects_deadline ON projects(deadline);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_milestones_status ON milestones(status);
CREATE INDEX idx_milestones_due_date ON milestones(due_date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
