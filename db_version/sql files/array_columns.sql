CREATE OR REPLACE FUNCTION update_client_names_in_project()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the client_names field is different from the new value
  IF NEW.client_name IS DISTINCT FROM ARRAY(SELECT name FROM clients WHERE id = ANY(NEW.client_id))::text[] THEN
    -- Update the client names field in the projects table using the client_ids array
    UPDATE projects
    SET client_name = ARRAY(SELECT name FROM clients WHERE id = ANY(NEW.client_id))::text[]
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_client_names
AFTER INSERT OR UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_client_names_in_project();


---goals-----

ALTER TABLE projects
ADD COLUMN goal_id int[],
ADD COLUMN goal_name text[];

CREATE OR REPLACE FUNCTION update_goal_names_in_project()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the goal_name field is different from the new value
  IF NEW.goal_name IS DISTINCT FROM ARRAY(SELECT name FROM goals WHERE id = ANY(NEW.goal_id))::text[] THEN
    -- Update the goal names field in the projects table using the goal_id array
    UPDATE projects
    SET goal_name = ARRAY(SELECT name FROM goals WHERE id = ANY(NEW.goal_id))::text[]
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER set_goal_names
AFTER INSERT OR UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_goal_names_in_project();


---milestones

ALTER TABLE projects
ADD COLUMN milestone_id int[],
ADD COLUMN milestone_name text[];

CREATE OR REPLACE FUNCTION update_milestone_names_in_project()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the goal_name field is different from the new value
  IF NEW.milestone_name IS DISTINCT FROM ARRAY(SELECT name FROM milestones WHERE id = ANY(NEW.milestone_id))::text[] THEN
    -- Update the goal names field in the projects table using the goal_id array
    UPDATE projects
    SET milestone_name = ARRAY(SELECT name FROM milestones WHERE id = ANY(NEW.milestone_id))::text[]
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_milestone_names
AFTER INSERT OR UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_milestone_names_in_project();

---tasks----

ALTER TABLE projects
ADD COLUMN task_id int[],
ADD COLUMN task_name text[];

CREATE OR REPLACE FUNCTION update_task_names_in_project()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the goal_name field is different from the new value
  IF NEW.task_name IS DISTINCT FROM ARRAY(SELECT name FROM tasks WHERE id = ANY(NEW.task_id))::text[] THEN
    -- Update the goal names field in the projects table using the goal_id array
    UPDATE projects
    SET task_name = ARRAY(SELECT name FROM tasks WHERE id = ANY(NEW.task_id))::text[]
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_task_names
AFTER INSERT OR UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_task_names_in_project();

----user/owner----
ALTER TABLE projects
ADD COLUMN user_id int[],
ADD COLUMN user_name text[];

CREATE OR REPLACE FUNCTION update_user_names_in_project()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the goal_name field is different from the new value
  IF NEW.user_name IS DISTINCT FROM ARRAY(SELECT name FROM users WHERE id = ANY(NEW.user_id))::text[] THEN
    -- Update the goal names field in the projects table using the goal_id array
    UPDATE projects
    SET user_name = ARRAY(SELECT name FROM users WHERE id = ANY(NEW.user_id))::text[]
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_user_names
AFTER INSERT OR UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_user_names_in_project();

--clients- projects----ALTER TABLE clients
ADD COLUMN project_id int[],
ADD COLUMN project_name text[];

CREATE OR REPLACE FUNCTION update_project_names_in_clients()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the goal_name field is different from the new value
  IF NEW.project_name IS DISTINCT FROM ARRAY(SELECT name FROM projects WHERE id = ANY(NEW.project_id))::text[] THEN
    -- Update the goal names field in the projects table using the goal_id array
    UPDATE clients
    SET project_name = ARRAY(SELECT name FROM projects WHERE id = ANY(NEW.project_id))::text[]
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_project_names_in_clients
AFTER INSERT OR UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_project_names_in_clients();


ALTER TABLE clients
ADD COLUMN goal_id int[],
ADD COLUMN goal_name text[];

ALTER TABLE clients
ADD COLUMN milestone_id int[],
ADD COLUMN milestone_name text[];

ALTER TABLE clients
ADD COLUMN task_id int[],
ADD COLUMN task_name text[];

CREATE OR REPLACE FUNCTION update_milestone_names_in_clients()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the goal_name field is different from the new value
  IF NEW.milestone_name IS DISTINCT FROM ARRAY(SELECT name FROM milestones WHERE id = ANY(NEW.milestone_id))::text[] THEN
    -- Update the goal names field in the projects table using the goal_id array
    UPDATE clients
    SET milestone_name = ARRAY(SELECT name FROM milestones WHERE id = ANY(NEW.milestone_id))::text[]
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_milestone_names_in_clients
AFTER INSERT OR UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_milestone_names_in_clients();

CREATE OR REPLACE FUNCTION update_goal_names_in_clients()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the goal_name field is different from the new value
  IF NEW.goal_name IS DISTINCT FROM ARRAY(SELECT name FROM goals WHERE id = ANY(NEW.goal_id))::text[] THEN
    -- Update the goal names field in the projects table using the goal_id array
    UPDATE clients
    SET goal_name = ARRAY(SELECT name FROM goals WHERE id = ANY(NEW.goal_id))::text[]
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_goal_names_in_clients
AFTER INSERT OR UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_goal_names_in_clients();

CREATE OR REPLACE FUNCTION update_task_names_in_clients()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the goal_name field is different from the new value
  IF NEW.task_name IS DISTINCT FROM ARRAY(SELECT name FROM tasks WHERE id = ANY(NEW.task_id))::text[] THEN
    -- Update the goal names field in the projects table using the goal_id array
    UPDATE clients
    SET task_name = ARRAY(SELECT name FROM tasks WHERE id = ANY(NEW.task_id))::text[]
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_task_names_in_clients
AFTER INSERT OR UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION update_task_names_in_clients();

ALTER TABLE goals
ADD COLUMN project_id int[],
ADD COLUMN project_name text[],
ADD COLUMN milestone_id int[],
ADD COLUMN milestone_name text[],
ADD COLUMN client_id int[],
ADD COLUMN client_name text[];

CREATE OR REPLACE FUNCTION update_project_names_in_goal()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the project_names field is different from the new value
  IF NEW.project_name IS DISTINCT FROM ARRAY(SELECT name FROM projects WHERE id = ANY(NEW.project_id))::text[] THEN
    -- Update the project names field in the goals table using the project_ids array
    UPDATE goals
    SET project_name = ARRAY(SELECT name FROM projects WHERE id = ANY(NEW.project_id))::text[]
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_milestone_names_in_goal()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the milestone_names field is different from the new value
  IF NEW.milestone_name IS DISTINCT FROM ARRAY(SELECT name FROM milestones WHERE id = ANY(NEW.milestone_id))::text[] THEN
    -- Update the milestone names field in the goals table using the milestone_ids array
    UPDATE goals
    SET milestone_name = ARRAY(SELECT name FROM milestones WHERE id = ANY(NEW.milestone_id))::text[]
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_client_names_in_goal()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the client_names field is different from the new value
  IF NEW.client_name IS DISTINCT FROM ARRAY(SELECT name FROM clients WHERE id = ANY(NEW.client_id))::text[] THEN
    -- Update the client names field in the goals table using the client_ids array
    UPDATE goals
    SET client_name = ARRAY(SELECT name FROM clients WHERE id = ANY(NEW.client_id))::text[]
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_project_names_in_goal
AFTER INSERT OR UPDATE ON goals
FOR EACH ROW
EXECUTE FUNCTION update_project_names_in_goal();

CREATE TRIGGER set_milestone_names_in_goal
AFTER INSERT OR UPDATE ON goals
FOR EACH ROW
EXECUTE FUNCTION update_milestone_names_in_goal();

CREATE TRIGGER set_client_names_in_goal
AFTER INSERT OR UPDATE ON goals
FOR EACH ROW
EXECUTE FUNCTION update_client_names_in_goal();

ALTER TABLE milestones
ADD COLUMN project_id int[],
ADD COLUMN project_name text[],
ADD COLUMN task_id int[],
ADD COLUMN task_name text[],
ADD COLUMN client_id int[],
ADD COLUMN client_name text[];

CREATE OR REPLACE FUNCTION update_project_names_in_milestone()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the project_names field is different from the new value
  IF NEW.project_name IS DISTINCT FROM ARRAY(SELECT name FROM projects WHERE id = ANY(NEW.project_id))::text[] THEN
    -- Update the project names field in the milestones table using the project_ids array
    UPDATE milestones
    SET project_name = ARRAY(SELECT name FROM projects WHERE id = ANY(NEW.project_id))::text[]
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_task_names_in_milestone()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the task_names field is different from the new value
  IF NEW.task_name IS DISTINCT FROM ARRAY(SELECT name FROM tasks WHERE id = ANY(NEW.task_id))::text[] THEN
    -- Update the task names field in the milestones table using the task_ids array
    UPDATE milestones
    SET task_name = ARRAY(SELECT name FROM tasks WHERE id = ANY(NEW.task_id))::text[]
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_client_names_in_milestone()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the client_names field is different from the new value
  IF NEW.client_name IS DISTINCT FROM ARRAY(SELECT name FROM clients WHERE id = ANY(NEW.client_id))::text[] THEN
    -- Update the client names field in the milestones table using the client_ids array
    UPDATE milestones
    SET client_name = ARRAY(SELECT name FROM clients WHERE id = ANY(NEW.client_id))::text[]
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER set_project_names_in_milestone
AFTER INSERT OR UPDATE ON milestones
FOR EACH ROW
EXECUTE FUNCTION update_project_names_in_milestone();


CREATE TRIGGER set_task_names_in_milestone
AFTER INSERT OR UPDATE ON milestones
FOR EACH ROW
EXECUTE FUNCTION update_task_names_in_milestone();


CREATE TRIGGER set_client_names_in_milestone
AFTER INSERT OR UPDATE ON milestones
FOR EACH ROW
EXECUTE FUNCTION update_client_names_in_milestone();

ALTER TABLE tasks
ADD COLUMN project_id int[],
ADD COLUMN project_name text[],
ADD COLUMN milestone_id int[],
ADD COLUMN milestone_name text[],
ADD COLUMN client_id int[],
ADD COLUMN client_name text[],
ADD COLUMN assigned_user_id int[],
ADD COLUMN assigned_user_name text[];

CREATE OR REPLACE FUNCTION update_project_names_in_task()
RETURNS trigger AS
$$
BEGIN
  IF NEW.project_name IS DISTINCT FROM ARRAY(SELECT name FROM projects WHERE id = ANY(NEW.project_id))::text[] THEN
    UPDATE tasks
    SET project_name = ARRAY(SELECT name FROM projects WHERE id = ANY(NEW.project_id))::text[]
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_milestone_names_in_task()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the milestone_names field is different from the new value
  IF NEW.milestone_name IS DISTINCT FROM ARRAY(SELECT name FROM milestones WHERE id = ANY(NEW.milestone_id))::text[] THEN
    -- Update the milestone names field in the tasks table using the milestone_ids array
    UPDATE tasks
    SET milestone_name = ARRAY(SELECT name FROM milestones WHERE id = ANY(NEW.milestone_id))::text[]
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_client_names_in_task()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the client_names field is different from the new value
  IF NEW.client_name IS DISTINCT FROM ARRAY(SELECT name FROM clients WHERE id = ANY(NEW.client_id))::text[] THEN
    -- Update the client names field in the tasks table using the client_ids array
    UPDATE tasks
    SET client_name = ARRAY(SELECT name FROM clients WHERE id = ANY(NEW.client_id))::text[]
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION update_user_names_in_task()
RETURNS trigger AS
$$
BEGIN
  -- Only update if the client_names field is different from the new value
  IF NEW.assigned_user_name IS DISTINCT FROM ARRAY(SELECT name FROM users WHERE id = ANY(NEW.assigned_user_id))::text[] THEN
    -- Update the client names field in the tasks table using the client_ids array
    UPDATE tasks
    SET assigned_user_name = ARRAY(SELECT name FROM users WHERE id = ANY(NEW.assigned_user_id))::text[]
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER set_project_names_in_task
AFTER INSERT OR UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_project_names_in_task();


CREATE TRIGGER set_milestone_names_in_task
AFTER INSERT OR UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_milestone_names_in_task();


CREATE TRIGGER set_client_names_in_task
AFTER INSERT OR UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_client_names_in_task();


CREATE TRIGGER set_user_names_in_task
AFTER INSERT OR UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION update_user_names_in_task();


