-- PostgreSQL Database Schema for Project Management Assistant
-- Run this script to create all tables and relationships

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (for people fields)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    website VARCHAR(500),
    tags INTEGER DEFAULT 0,
    project TEXT,
    briefings TEXT,
    type VARCHAR(50) CHECK (type IN ('Family', 'Privat', 'Internal', 'External')),
    email VARCHAR(255),
    assets TEXT,
    notes TEXT,
    contact VARCHAR(50),
    meeting_transcripts TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Goals table
CREATE TABLE goals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tags TEXT,
    status VARCHAR(50) DEFAULT 'Not started' CHECK (status IN ('Not started', 'In progress', 'Done')),
    briefings TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_display TEXT,
    status VARCHAR(50) DEFAULT 'Not started' CHECK (status IN ('Not started', 'In progress', 'Stuck', 'Done')),
    date_completed DATE,
    notes TEXT,
    assets TEXT,
    briefings TEXT,
    overdue_tasks TEXT,
    command_center TEXT,
    priority VARCHAR(10) CHECK (priority IN ('P1', 'P2', 'P3')),
    owner_id INTEGER REFERENCES users(id),
    deadline DATE,
    milestones INTEGER DEFAULT 0,
    remaining_tasks TEXT,
    meeting_transcript TEXT,
    deadline_display DATE,
    client_id INTEGER REFERENCES clients(id),
    tags TEXT,
    date_completed_display DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    days VARCHAR(50) CHECK (days IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')),
    recur_unit VARCHAR(50) CHECK (recur_unit IN ('Day(s)', 'Week(s)', 'Month(s)', 'etc.')),
    completed_yesterday TEXT,
    due_date_display TEXT,
    status VARCHAR(50) DEFAULT 'Inbox' CHECK (status IN ('Inbox', 'Paused/Later (P3)', 'Next (P2)', 'etc.')),
    team_summary TEXT,
    emiliano_summary TEXT,
    notes TEXT,
    next_due TEXT,
    concesa_summary TEXT,
    assigned_to_id INTEGER REFERENCES users(id),
    overdue TEXT,
    tags TEXT,
    rangbom_summary TEXT,
    due_date DATE,
    recur_interval INTEGER DEFAULT 1,
    project_id INTEGER REFERENCES projects(id),
    agent TEXT,
    date_completed DATE,
    assets TEXT,
    unsquared_media_summary TEXT,
    command_center TEXT,
    annie_summary TEXT,
    kat_summary TEXT,
    updates TEXT,
    exec_summary TEXT,
    minh_summary TEXT,
    briefings TEXT,
    meeting_transcripts TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Milestones table
CREATE TABLE milestones (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    notes TEXT,
    briefings TEXT,
    due_date DATE,
    project_id INTEGER REFERENCES projects(id),
    status VARCHAR(50) DEFAULT 'Not started' CHECK (status IN ('Not started', 'Backlog', 'Paused', 'etc.')),
    assets TEXT,
    meeting_transcripts TEXT,
    tags TEXT,
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

-- Insert some sample data
INSERT INTO users (name, email) VALUES 
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com'),
('Bob Wilson', 'bob@example.com');

INSERT INTO clients (name, website, type, email) VALUES 
('Acme Corp', 'https://acme.com', 'External', 'contact@acme.com'),
('Internal Team', 'https://internal.com', 'Internal', 'team@internal.com');

INSERT INTO goals (name, status, description) VALUES 
('Increase Revenue', 'In progress', 'Boost company revenue by 20%'),
('Improve Customer Satisfaction', 'Not started', 'Achieve 95% customer satisfaction rate');

INSERT INTO projects (name, status, priority, deadline, client_id) VALUES 
('Website Redesign', 'In progress', 'P1', '2024-03-15', 1),
('Mobile App Development', 'Not started', 'P2', '2024-04-30', 1);

INSERT INTO tasks (name, status, due_date, project_id, assigned_to_id) VALUES 
('Design Homepage', 'Next (P2)', '2024-02-15', 1, 1),
('Implement User Authentication', 'Inbox', '2024-02-20', 1, 2),
('Create API Documentation', 'Paused/Later (P3)', '2024-03-01', 2, 3);

INSERT INTO milestones (name, status, due_date, project_id) VALUES 
('Design Phase Complete', 'Not started', '2024-02-28', 1),
('Development Phase Complete', 'Not started', '2024-03-15', 1); 