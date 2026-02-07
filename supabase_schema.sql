
create table if not exists leads (
    id uuid default uuid_generate_v4() primary key,
    session_id text,
    phone text,
    email text,
    created_at timestamp default now()
);
