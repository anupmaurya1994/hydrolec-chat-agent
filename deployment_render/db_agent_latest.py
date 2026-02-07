#for previous code refer this- last deployed MVP with latest db schema
"""
PostgreSQL AI Database Assistant using LangGraph
A clean, efficient AI agent for database operations with comprehensive tools and guardrails.
"""

'''thing to add:
if multiple entries with same name, ask user to confirm which one to update/delete'''

import os
import json
import time  # Add this import
import logging
import gradio as gr
from typing import Dict, Any, List, Optional, Literal
from datetime import datetime, date
from sqlalchemy import (
    create_engine, Column, Integer, String, Text, Date, DateTime, 
    ForeignKey, func, text, inspect, ARRAY,CheckConstraint,Boolean
)
from sqlalchemy.dialects.postgresql import ARRAY # For PostgreSQL-specific array types
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.types import Enum
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
# from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode
from pydantic import BaseModel, Field
from fuzzywuzzy import fuzz
from fuzzywuzzy import process

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    # filename='logs/db_agent_latest.log',  # Log to a file
    # filemode='a'  # Append mode
)
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────────
# Database Models
# ──────────────────────────────────────────────────────────────────────────────

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    name = Column(Text)
    email = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Client(Base):
    __tablename__ = 'clients'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=True) # text by default is nullable in PostgreSQL
    
    # Using Enum for type, creating a native ENUM type in PostgreSQL, defined inline
    type = Column(
        Enum('Family', 'Privat', 'Internal', 'External', name='client_type_enum', create_type=True),
        default=None,
        nullable=True
    )
    
    email = Column(Text, default=None, nullable=True)
    contact = Column(Text, default=None, nullable=True)
    website = Column(Text)

    # For array types (integer[] and TEXT[]), use ARRAY from sqlalchemy.dialects.postgresql
    project_id = Column(ARRAY(Integer), default=None, nullable=True)
    # project = Column(ARRAY(Text), default=None, nullable=True)

    asset_id = Column(ARRAY(Integer), default=None, nullable=True)
    # asset = Column(ARRAY(Text), default=None, nullable=True)
    
    tags = Column(Text, nullable=True) 

    briefing_id = Column(ARRAY(Integer), default=None, nullable=True)
    # briefing = Column(ARRAY(Text), default=None, nullable=True)

    meeting_transcript_id = Column(ARRAY(Integer), default=None, nullable=True)
    # meeting_transcript = Column(ARRAY(Text), default=None, nullable=True)

    notes = Column(Text, nullable=True) 

    milestone_id = Column(ARRAY(Integer), default=None, nullable=True)
    # milestone = Column(ARRAY(Text), default=None, nullable=True)

    cover = Column(Text, nullable=True) # Stores image URL or path

    goal_id = Column(ARRAY(Integer), default=None, nullable=True)
    # goal = Column(ARRAY(Text), default=None, nullable=True)

    # Using Enum for status, defined inline
    status = Column(
        Enum('Active', 'Archive', name='client_status_enum', create_type=True),
        nullable=True
    )

    task_id = Column(ARRAY(Integer), default=None, nullable=True)
    # task = Column(ARRAY(Text), default=None, nullable=True)

    # TIMESTAMP WITH TIME ZONE defaults to NOW()
    created_at = Column(DateTime(timezone=True), default=func.now())
    # updated_at defaults to NOW() on insert, and updates to NOW() on every update
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())


class Goal(Base):
    __tablename__ = 'goals'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=True) # Matches 'name text' in SQL, which is nullable

    # Array fields with default NULL and nullable True, matching SQL
    project_id = Column(ARRAY(Integer), default=None, nullable=True)
    # project = Column(ARRAY(Text), default=None, nullable=True) # Added based on SQL

    description = Column(Text, default=None, nullable=True)

    # Using Enum for status, defined inline with default
    status = Column(
        Enum('Not started', 'In progress', 'Done', name='goal_status_enum', create_type=True),
        default='Not started',
        nullable=True # 'DEFAULT NULL' is implicit for ENUMs without NOT NULL, but it can also be provided.
                      # Since 'Not started' is a default, it's not strictly nullable in practice,
                      # but the SQL definition allows it to be NULL if no default was set.
                      # However, with a DEFAULT, it will always have a value on insert.
                      # Let's keep it nullable=True as per original 'text' type.
    )

    milestone_id = Column(ARRAY(Integer), default=None, nullable=True)
    # milestone = Column(ARRAY(Text), default=None, nullable=True) # Added based on SQL

    tags = Column(Text, nullable=True) # Matches 'tags text'

    meeting_transcript_id = Column(ARRAY(Integer), default=None, nullable=True)
    # meeting_transcript = Column(ARRAY(Text), default=None, nullable=True) # Added based on SQL

    briefing_id = Column(ARRAY(Integer), default=None, nullable=True) # Added based on SQL
    # briefing = Column(ARRAY(Text), default=None, nullable=True) # Replaced 'briefings = Column(Text)'

    client_id = Column(ARRAY(Integer), default=None, nullable=True)
    # client = Column(ARRAY(Text), default=None, nullable=True) # Added based on SQL

    circus_sync = Column(Boolean, default=False, nullable=False) # Matches 'boolean default false not null'

    corresponding_id = Column(Text, nullable=True)
    current = Column(Integer, default=None, nullable=True)
    goal = Column(Integer, default=None, nullable=True) # This refers to the 'goal' integer column in SQL
    id_pull = Column(Text, nullable=True) # SQL comment indicates formula, but it's a 'text' column
    progress = Column(Text, nullable=True) # SQL comment indicates formula, but it's a 'text' column

    # TIMESTAMP WITH TIME ZONE defaults to NOW() on creation and update
    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # Table arguments for CHECK constraints on array lengths
    __table_args__ = (
        CheckConstraint('project_id IS NULL OR array_length(project_id, 1) = 1', name='goals_project_id_len_check'),
        CheckConstraint('project IS NULL OR array_length(project, 1) = 1', name='goals_project_len_check'),
        CheckConstraint('meeting_transcript_id IS NULL OR array_length(meeting_transcript_id, 1) = 1', name='goals_mt_id_len_check'),
        CheckConstraint('meeting_transcript IS NULL OR array_length(meeting_transcript, 1) = 1', name='goals_mt_len_check'),
        CheckConstraint('client_id IS NULL OR array_length(client_id, 1) = 1', name='goals_client_id_len_check'),
        CheckConstraint('client IS NULL OR array_length(client, 1) = 1', name='goals_client_len_check'),
    )

class Project(Base):
    __tablename__ = 'projects'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=True) # text in PG is nullable by default

    # Priority Enum
    priority = Column(
        Enum('P1', 'P2', 'P3', name='project_priority_enum', create_type=True),
        nullable=True
    )

    # Status Enum with default
    status = Column(
        Enum('Not started', 'In progress', 'Stuck', 'Done', name='project_status_enum', create_type=True),
        default='Not started',
        nullable=True # SQL default doesn't make it NOT NULL automatically
    )
    
    deadline = Column(DateTime(timezone=True), nullable=True)

    command_center = Column(Text, default=None, nullable=True) # Based on final SQL

    # Client relation arrays with length constraint
    client_id = Column(ARRAY(Integer), default=None, nullable=True)
    # client = Column(ARRAY(Text), default=None, nullable=True)
    
    # Briefing relation arrays with length constraint
    briefing_id = Column(ARRAY(Integer), default=None, nullable=True)
    # briefing = Column(ARRAY(Text), default=None, nullable=True)
    
    # Goal relation arrays (no limit)
    goal_id = Column(ARRAY(Integer), default=None, nullable=True)
    # goal = Column(ARRAY(Text), default=None, nullable=True)

    # Milestone array (based on final SQL)
    milestone = Column(ARRAY(Text), default=None, nullable=True) 

    # Task relation arrays (no limit)
    task_id = Column(ARRAY(Integer), default=None, nullable=True)
    # task = Column(ARRAY(Text), default=None, nullable=True)

    # Asset relation arrays (no limit)
    asset_id = Column(ARRAY(Integer), default=None, nullable=True)
    # asset = Column(ARRAY(Text), default=None, nullable=True)
    
    tags = Column(Text, nullable=True)

    # Meeting Transcript relation arrays (no limit)
    meeting_transcript_id = Column(ARRAY(Integer), default=None, nullable=True)
    # meeting_transcript = Column(ARRAY(Text), default=None, nullable=True)

    notes = Column(Text, nullable=True)

    client_display = Column(Text, nullable=True) # Formula field
    date_completed = Column(DateTime(timezone=True), nullable=True)
    date_completed_display = Column(Text, nullable=True) # Formula field
    deadline_display = Column(Text, nullable=True) # Formula field
    overdue_tasks = Column(Text, nullable=True) # Formula field

    # Owner relation arrays (no limit)
    owner_id = Column(ARRAY(Integer), default=None, nullable=True)
    # owner = Column(ARRAY(Text), default=None, nullable=True)

    owner_display = Column(Text, nullable=True) # Formula field
    progress = Column(Text, nullable=True) # Formula field
    remaining_tasks = Column(Text, nullable=True) # Formula field
    space = Column(Text, nullable=True) # Formula field
    summary = Column(Text, nullable=True) # Formula field
    circus_sync = Column(Boolean, default=False, nullable=False)

    # Client_v2 Enum
    client_v2 = Column(
        Enum(
            'Mama Hanh', 'Ms Hanh', 'Circus Group', 'Fully AI', 'Gastrofüsterer', 
            'DAO OS', 'Mama Le Bao', 'Asia Hung', 'Clinic OS', 'Internal', 
            name='project_client_v2_enum', create_type=True
        ),
        nullable=True
    )

    corresponding_id = Column(Text, nullable=True)
    id_pull = Column(Text, nullable=True) # Formula field

    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # Table arguments for CHECK constraints on array lengths
    __table_args__ = (
        CheckConstraint('client_id IS NULL OR array_length(client_id, 1) = 1', name='projects_client_id_len_check'),
        CheckConstraint('client IS NULL OR array_length(client, 1) = 1', name='projects_client_len_check'),
        CheckConstraint('briefing_id IS NULL OR array_length(briefing_id, 1) = 1', name='projects_briefing_id_len_check'),
        CheckConstraint('briefing IS NULL OR array_length(briefing, 1) = 1', name='projects_briefing_len_check'),
    )

class Task(Base):
    __tablename__ = 'tasks'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=True) # TEXT null maps to nullable=True

    # Project relation arrays (no limit explicitly in SQL)
    project_id = Column(ARRAY(Integer), default=None, nullable=True)
    # project = Column(ARRAY(Text), default=None, nullable=True)

    # Status Enum with default 'Inbox'
    status = Column(
        Enum(
            'Inbox', 'Paused/Later (P3)', 'Next (P2)', 'Now (P1)',
            'In progress', 'Draft Review', 'Waiting for Feedback', 'Done',
            name='task_status_enum', create_type=True
        ),
        default='Inbox',
        nullable=True # As the original type was TEXT, which is nullable
    )
    
    due_date = Column(DateTime(timezone=True), default=None, nullable=True)
    date_completed = Column(DateTime(timezone=True), default=None, nullable=True)

    # Assigned To relation arrays (no limit)
    assigned_to_id = Column(ARRAY(Integer), default=None, nullable=True)
    # assigned_to = Column(ARRAY(Text), default=None, nullable=True)

    command_center = Column(Text, default=None, nullable=True)
    agent = Column(Text, default=None, nullable=True)

    # Milestone array (rollup, so just text array as per your comment)
    milestone = Column(ARRAY(Text), default=None, nullable=True) 

    # Briefing relation arrays (no limit)
    briefing_id = Column(ARRAY(Integer), default=None, nullable=True)
    # briefing = Column(ARRAY(Text), default=None, nullable=True)

    # Asset relation arrays (no limit)
    asset_id = Column(ARRAY(Integer), default=None, nullable=True)
    # asset = Column(ARRAY(Text), default=None, nullable=True)

    tags = Column(Text, default=None, nullable=True) # default null explicitly stated

    # Meeting Transcript relation arrays (no limit)
    meeting_transcript_id = Column(ARRAY(Integer), default=None, nullable=True)
    # meeting_transcript = Column(ARRAY(Text), default=None, nullable=True) 

    notes = Column(Text, default=None, nullable=True) # default null explicitly stated

    exec_summary = Column(Text, default=None, nullable=True)

    completed_today = Column(Text, default=None, nullable=True) # Formula, often maps to TEXT or Boolean in app
    completed_yesterday = Column(Text, default=None, nullable=True) # Formula
    overdue = Column(Text, default=None, nullable=True) # Formula

    annie_summary = Column(Text, default=None, nullable=True)
    
    # Client array (rollup, so just text array as per your comment)
    client = Column(ARRAY(Text), default=None, nullable=True) 
    
    concesa_summary = Column(Text, default=None, nullable=True)

    # Days Enum
    days = Column(
        Enum(
            'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
            name='task_days_enum', create_type=True
        ),
        nullable=True # No default, so nullable
    )

    due_date_display = Column(Text, nullable=True) # Formula

    emiliano_summary = Column(Text, default=None, nullable=True)

    kat_summary = Column(Text, default=None, nullable=True)

    localization_key = Column(Text, nullable=True) # Formula

    minh_summary = Column(Text, default=None, nullable=True)

    next_due = Column(Text, nullable=True) # Formula

    # Occurences relation arrays (no limit)
    occurences_id = Column(ARRAY(Integer), default=None, nullable=True)
    # occurences = Column(ARRAY(Text), default=None, nullable=True) 

    # Project Priority array (rollup, so just text array as per your comment)
    project_priority = Column(ARRAY(Text), default=None, nullable=True) 

    rangbom_summary = Column(Text, default=None, nullable=True) 

    recur_interval = Column(Integer, default=None, nullable=True)
    
    # Recur Unit Enum
    recur_unit = Column(
        Enum(
            'Day(s)', 'Week(s)', 'Month(s)', 'Month(s) on the First Weekday',
            'Month(s) on the Last Weekday', 'Month(s) on the Last Day', 'Year(s)',
            name='task_recur_unit_enum', create_type=True
        ),
        nullable=True # No default, so nullable
    )
    
    team_summary = Column(Text, default=None, nullable=True)

    unsquared_media_summary = Column(Text, default=None, nullable=True) 

    updates = Column(Text, default=None, nullable=True)

    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())
class Milestone(Base):
    __tablename__ = 'milestones'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=True)

    # Status Enum with default 'Not started'
    status = Column(
        Enum(
            'Not started', 'Backlog', 'Paused', 'High Priority',
            'Under Review', 'In progress', 'Shipped', 'Done',
            name='milestone_status_enum', create_type=True
        ),
        default='Not started',
        nullable=True # As original TEXT type is nullable
    )
    
    due_date = Column(DateTime(timezone=True), default=None, nullable=True)

    # Project relation arrays with length constraint
    project_id = Column(ARRAY(Integer), default=None, nullable=True)
    # project = Column(ARRAY(Text), default=None, nullable=True)

    # Task relation arrays (no limit)
    task_id = Column(ARRAY(Integer), default=None, nullable=True)
    # task = Column(ARRAY(Text), default=None, nullable=True)

    tags = Column(Text, nullable=True)
    
    # Client relation arrays (no limit)
    client_id = Column(ARRAY(Integer), default=None, nullable=True)
    # client = Column(ARRAY(Text), default=None, nullable=True)

    # Meeting Transcript relation arrays (no limit)
    meeting_transcript_id = Column(ARRAY(Integer), default=None, nullable=True)
    # meeting_transcript = Column(ARRAY(Text), default=None, nullable=True)

    notes = Column(Text, nullable=True)

    project_type = Column(Text, nullable=True) # Formula column

    # Briefing relation arrays with length constraint
    briefing_id = Column(ARRAY(Integer), default=None, nullable=True)
    # briefing = Column(ARRAY(Text), default=None, nullable=True)

    project_owner = Column(Text, nullable=True) # Formula column

    # Asset relation arrays (no limit)
    asset_id = Column(ARRAY(Integer), default=None, nullable=True)
    # asset = Column(ARRAY(Text), default=None, nullable=True)

    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # Table arguments for CHECK constraints on array lengths
    __table_args__ = (
        CheckConstraint('project_id IS NULL OR array_length(project_id, 1) = 1', name='milestones_project_id_len_check'),
        CheckConstraint('project IS NULL OR array_length(project, 1) = 1', name='milestones_project_len_check'),
        CheckConstraint('briefing_id IS NULL OR array_length(briefing_id, 1) = 1', name='milestones_briefing_id_len_check'),
        CheckConstraint('briefing IS NULL OR array_length(briefing, 1) = 1', name='milestones_briefing_len_check'),
    )
class Asset(Base):
    __tablename__ = 'assets'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=True)

    # Type Enum with inline definition
    type = Column(
        Enum(
            'Social Media Post', 'Image', 'Blog', 'Doc', 'Loom Video',
            'YouTube Video', 'Sheets', 'Notion Page',
            name='asset_type_enum', create_type=True
        ),
        default=None,
        nullable=True
    )
    
    link = Column(Text, default=None, nullable=True)

    # Client array (formula, so just text array as per your comment)
    client = Column(ARRAY(Text), default=None, nullable=True) 
    
    display = Column(Text, default=None, nullable=True) # Formula column

    tags = Column(Text, nullable=True)

    notes = Column(Text, nullable=True)

    # Briefing relation arrays (no limit)
    briefing_id = Column(ARRAY(Integer), default=None, nullable=True)
    # briefing = Column(ARRAY(Text), default=None, nullable=True)

    # Milestone relation arrays (no limit)
    milestone_id = Column(ARRAY(Integer), default=None, nullable=True)
    # milestone = Column(ARRAY(Text), default=None, nullable=True) 

    # Project relation arrays (no limit)
    project_id = Column(ARRAY(Integer), default=None, nullable=True)
    # project = Column(ARRAY(Text), default=None, nullable=True)

    # Task relation arrays (no limit)
    task_id = Column(ARRAY(Integer), default=None, nullable=True)
    # task = Column(ARRAY(Text), default=None, nullable=True) 

    description = Column(Text, default=None, nullable=True)
    created_date = Column(Date, default=func.current_date()) # Maps to DATE DEFAULT CURRENT_DATE

    circus_sync = Column(Boolean, default=False, nullable=False)

    corresponding_id = Column(Text, nullable=True)
    id_pull = Column(Text, nullable=True) # Formula column

    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())


class Briefing(Base):
    __tablename__ = 'briefings'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=True) # TEXT null by default in PG
    
    # Client relation arrays with length constraint
    client_id = Column(ARRAY(Integer), default=None, nullable=True)
    # client = Column(ARRAY(Text), default=None, nullable=True)
    
    # Project relation arrays with length constraint
    project_id = Column(ARRAY(Integer), default=None, nullable=True)
    # project = Column(ARRAY(Text), default=None, nullable=True)
    
    objective = Column(Text, nullable=True) # TEXT null by default

    # Outcome (goals) relation arrays (no limit)
    outcome_id = Column(ARRAY(Integer), default=None, nullable=True)
    # outcome = Column(ARRAY(Text), default=None, nullable=True)

    success_criteria = Column(Text, nullable=True)
    deadline = Column(DateTime(timezone=True), nullable=True) # Calculated from projects

    # Asset relation arrays (no limit)
    asset_id = Column(ARRAY(Integer), default=None, nullable=True)
    # asset = Column(ARRAY(Text), default=None, nullable=True)

    tags = Column(Text, nullable=True)

    # Task relation arrays (no limit)
    task_id = Column(ARRAY(Integer), default=None, nullable=True)
    # task = Column(ARRAY(Text), default=None, nullable=True) 

    # Meeting Transcript relation arrays (no limit)
    meeting_transcript_id = Column(ARRAY(Integer), default=None, nullable=True)
    # meeting_transcript = Column(ARRAY(Text), default=None, nullable=True) 

    notes = Column(Text, nullable=True)

    # Client_type Enum (calculated from clients)
    client_type = Column(
        Enum('Family', 'Privat', 'Internal', 'External', name='briefing_client_type_enum', create_type=True),
        nullable=True # As original TEXT type is nullable
    )
    project_owner = Column(Text, nullable=True) # Calculated from projects

    # Milestone relation arrays (no limit)
    milestone_id = Column(ARRAY(Integer), default=None, nullable=True)
    # milestone = Column(ARRAY(Text), default=None, nullable=True) 

    goals_header = Column(Text, nullable=True) # Calculated from goals

    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # Table arguments for CHECK constraints on array lengths
    __table_args__ = (
        CheckConstraint('client_id IS NULL OR array_length(client_id, 1) = 1', name='briefings_client_id_len_check'),
        CheckConstraint('client IS NULL OR array_length(client, 1) = 1', name='briefings_client_len_check'),
        CheckConstraint('project_id IS NULL OR array_length(project_id, 1) = 1', name='briefings_project_id_len_check'),
        CheckConstraint('project IS NULL OR array_length(project, 1) = 1', name='briefings_project_len_check'),
    )
# Database setup
class MeetingTranscript(Base):
    __tablename__ = 'meeting_transcripts'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(Text, nullable=True)
    meeting_date = Column(DateTime(timezone=True), nullable=True) # No default specified in SQL
    transcript_link = Column(Text, default=None, nullable=True)

    # Client relation arrays with length constraint
    client_id = Column(ARRAY(Integer), default=None, nullable=True)
    # client = Column(ARRAY(Text), default=None, nullable=True)
    
    # Project relation arrays with length constraint
    project_id = Column(ARRAY(Integer), default=None, nullable=True)
    # project = Column(ARRAY(Text), default=None, nullable=True)
    
    # Task relation arrays with length constraint
    task_id = Column(ARRAY(Integer), default=None, nullable=True)
    # task = Column(ARRAY(Text), default=None, nullable=True)

    people = Column(Text, default=None, nullable=True) # Based on final SQL

    # Briefing relation arrays (no limit)
    briefing_id = Column(ARRAY(Integer), default=None, nullable=True)
    # briefing = Column(ARRAY(Text), default=None, nullable=True)

    # Milestone relation arrays with length constraint
    milestone_id = Column(ARRAY(Integer), default=None, nullable=True)
    # milestone = Column(ARRAY(Text), default=None, nullable=True) 

    memory_log = Column(Text, default=None, nullable=True) # Based on final SQL

    # Goal relation arrays (no limit)
    goal_id = Column(ARRAY(Integer), default=None, nullable=True)
    # goal = Column(ARRAY(Text), default=None, nullable=True)

    tags = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), default=func.now())
    updated_at = Column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    # Table arguments for CHECK constraints on array lengths
    __table_args__ = (
        CheckConstraint('client_id IS NULL OR array_length(client_id, 1) = 1', name='mt_client_id_len_check'),
        CheckConstraint('client IS NULL OR array_length(client, 1) = 1', name='mt_client_len_check'),
        CheckConstraint('project_id IS NULL OR array_length(project_id, 1) = 1', name='mt_project_id_len_check'),
        CheckConstraint('project IS NULL OR array_length(project, 1) = 1', name='mt_project_len_check'),
        CheckConstraint('task_id IS NULL OR array_length(task_id, 1) = 1', name='mt_task_id_len_check'),
        CheckConstraint('task IS NULL OR array_length(task, 1) = 1', name='mt_task_len_check'),
        CheckConstraint('milestone_id IS NULL OR array_length(milestone_id, 1) = 1', name='mt_milestone_id_len_check'),
        CheckConstraint('milestone IS NULL OR array_length(milestone, 1) = 1', name='mt_milestone_len_check'),
    )


# Database setup
DATABASE_URL = os.getenv("DATABASE_URL")

try:
    start_time = time.time()
    engine = create_engine(DATABASE_URL,connect_args={"sslmode": "require"}, pool_size=25, max_overflow=25, pool_timeout=30,pool_recycle=3600,pool_pre_ping=True) # work here
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    db_init_time = time.time() - start_time
    logger.info(f"✅ Database connection successful! (init_time: {db_init_time:.3f}s)")
    print("✅ Database connection successful!")
except Exception as e:
    logger.error(f"❌ Database error: {e}")
    print(f"❌ Database error: {e}")
    exit(1)

# ──────────────────────────────────────────────────────────────────────────────
# Pydantic Models for Tool Inputs/Outputs
# ──────────────────────────────────────────────────────────────────────────────

class CreateRecordInput(BaseModel):
    table: Literal["users", "clients", "goals", "projects", "tasks", "milestones", "assets", "briefings", "meeting_transcripts"] = Field(description="Database table name")
    data: Dict[str, Any] = Field(description="Record data as key-value pairs")

class CreateRecordOutput(BaseModel):
    success: bool = Field(description="Operation success status")
    record_id: Optional[int] = Field(description="Created record ID")
    message: str = Field(description="Operation result message")
    error: Optional[str] = Field(description="Error message if failed")

class ReadRecordInput(BaseModel):
    table: Literal["users", "clients", "goals", "projects", "tasks", "milestones", "assets", "briefings", "meeting_transcripts"] = Field(description="Database table name")
    record_id: int = Field(description="Record ID to retrieve")

class ReadRecordOutput(BaseModel):
    success: bool = Field(description="Operation success status")
    record: Optional[Dict[str, Any]] = Field(description="Retrieved record data")
    message: str = Field(description="Operation result message")
    error: Optional[str] = Field(description="Error message if failed")

class UpdateRecordInput(BaseModel):
    table: Literal["users", "clients", "goals", "projects", "tasks", "milestones", "assets", "briefings", "meeting_transcripts"] = Field(description="Database table name")
    record_id: int = Field(description="Record ID to update")
    data: Dict[str, Any] = Field(description="Updated data as key-value pairs")

class ListRecordsInput(BaseModel):
    table: Literal["users", "clients", "goals", "projects", "tasks", "milestones", "assets", "briefings", "meeting_transcripts"] = Field(description="Database table name")
    limit: int = Field(default=10, description="Maximum records to return")
    filters: Optional[Dict[str, Any]] = Field(default=None, description="Filter conditions")

class ListRecordsOutput(BaseModel):
    success: bool = Field(description="Operation success status")
    records: List[Dict[str, Any]] = Field(description="List of records")
    count: int = Field(description="Number of records returned")
    message: str = Field(description="Operation result message")

class DeleteRecordInput(BaseModel):
    table: Literal["users", "clients", "goals", "projects", "tasks", "milestones", "assets", "briefings", "meeting_transcripts"] = Field(description="Database table name")
    record_id: int = Field(description="Record ID to delete")

class SearchRecordsInput(BaseModel):
    table: Literal["users", "clients", "goals", "projects", "tasks", "milestones", "assets", "briefings", "meeting_transcripts"] = Field(description="Database table name")
    name_query: str = Field(description="Name to search for (case-insensitive, supports partial matching)")
    limit: int = Field(default=10, description="Maximum records to return")
    min_similarity: int = Field(default=60, description="Minimum similarity score (0-100) for fuzzy matching")

class SearchRecordsOutput(BaseModel):
    success: bool = Field(description="Operation success status")
    records: List[Dict[str, Any]] = Field(description="List of matching records")
    count: int = Field(description="Number of records returned")
    message: str = Field(description="Operation result message")
    suggestions: Optional[List[Dict[str, Any]]] = Field(description="Similar name suggestions if no exact matches")

# ──────────────────────────────────────────────────────────────────────────────
# Database Helper Functions
# ──────────────────────────────────────────────────────────────────────────────

MODEL_MAP = {
    "users": User,
    "clients": Client,
    "goals": Goal,
    "projects": Project,
    "tasks": Task,
    "milestones": Milestone,
    "assets": Asset,
    "briefings": Briefing,
    "meeting_transcripts": MeetingTranscript
}

# Valid status values for each table (case-sensitive)
VALID_STATUS = {
    "clients": {
        "type": ["Family", "Privat", "Internal", "External"],
        "status": ["Active", "Archive"]
    },
    "goals": {
        "status": ["Not started", "In progress", "Done"]
    },
    "projects": {
        "status": ["Not started", "In progress", "Stuck", "Done"],
        "priority": ["P1", "P2", "P3"],
        "client_v2": ["Mama Hanh", "Ms Hanh", "Circus Group", "Fully AI", "Gastrofüsterer", "DAO OS", "Mama Le Bao", "Asia Hung", "Clinic OS", "Internal"]
    },
    "tasks": {
        "status": ["Inbox", "Paused/Later (P3)", "Next (P2)", "Now (P1)", "In progress", "Draft Review", "Waiting for Feedback", "Done"],
        "days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "recur_unit": ["Day(s)", "Week(s)", "Month(s)", "Month(s) on the First Weekday", "Month(s) on the Last Weekday", "Month(s) on the Last Day", "Year(s)"]
    },
    "milestones": {
        "status": ["Not started", "Backlog", "Paused", "In progress", "High Priority", "Under Review", "Shipped", "Done"]
    },
    "assets": {
        "type": ["Social Media Post", "Image", "Blog", "Doc", "Loom Video", "YouTube Video", "Sheets", "Notion Page"]
    },
    "briefings": {
        "client_type": ["Family", "Privat", "Internal", "External"]
    }
}

def get_session():
    return SessionLocal()

def serialize_record(obj):
    """Convert SQLAlchemy object to dictionary with proper JSON serialization"""
    if obj is None:
        return None
    
    result = {}
    for column in obj.__table__.columns:
        value = getattr(obj, column.name)
        if isinstance(value, (datetime, date)):
            value = value.isoformat()
        elif isinstance(value, list):
            # Handle array fields - ensure proper JSON serialization
            value = value if value is not None else []
        result[column.name] = value
    return result

def parse_date_string(date_str: str) -> Optional[datetime]:
    """Parse date string to datetime object"""
    if not date_str:
        return None
    try:
        # Try parsing as full datetime first (YYYY-MM-DD HH:MM:SS format)
        if 'T' in date_str or ' ' in date_str:
            # Handle ISO format with T separator or space separator
            for fmt in ['%Y-%m-%dT%H:%M:%S', '%Y-%m-%d %H:%M:%S', '%Y-%m-%dT%H:%M:%S.%f', '%Y-%m-%d %H:%M:%S.%f']:
                try:
                    return datetime.strptime(date_str, fmt)
                except ValueError:
                    continue
        # Try parsing as date only (YYYY-MM-DD format) and convert to datetime
        try:
            date_obj = datetime.strptime(date_str, '%Y-%m-%d')
            return date_obj  # This will be datetime at midnight
        except ValueError:
            pass
        return None
    except Exception:
        return None

def parse_array_field(value: Any) -> Optional[List]:
    """Parse array field input to proper list format"""
    if value is None:
        return None
    
    if isinstance(value, list):
        return value
    elif isinstance(value, str):
        try:
            # Try parsing as JSON array
            parsed = json.loads(value)
            if isinstance(parsed, list):
                return parsed
            else:
                # Single value, wrap in list
                return [parsed]
        except json.JSONDecodeError:
            # Treat as comma-separated values
            return [item.strip() for item in value.split(',') if item.strip()]
    else:
        # Single value, wrap in list
        return [value]

def validate_field_value(table: str, field: str, value: str) -> dict:
    """Validate field value against valid options and suggest corrections"""
    if table not in VALID_STATUS or field not in VALID_STATUS[table]:
        return {"valid": True, "value": value}
    
    valid_options = VALID_STATUS[table][field]
    
    # Exact match (case-sensitive)
    if value in valid_options:
        return {"valid": True, "value": value}
    
    # Case-insensitive match
    for option in valid_options:
        if value.lower() == option.lower():
            return {
                "valid": False,
                "requires_confirmation": True,
                "suggested_value": option,
                "user_value": value,
                "message": f"Did you mean '{option}' instead of '{value}'?",
                "valid_options": valid_options
            }
    
    # No match found
    return {
        "valid": False,
        "requires_confirmation": False,
        "message": f"Invalid {field} '{value}' for {table}. Valid options: {', '.join(valid_options)}",
        "valid_options": valid_options
    }
# ──────────────────────────────────────────────────────────────────────────────
# Database Tools with Proper JSON Schemas
# ──────────────────────────────────────────────────────────────────────────────

@tool
def confirm_field_correction(table: str, record_id: int, field: str, corrected_value: str, original_data: dict) -> dict:
    """
    Update a record with the corrected field value after user confirmation.
    
    Description: Updates a record using the case-corrected field value after user has confirmed the correction.
    
    Input JSON Schema:
    {
        "table": "users|clients|goals|projects|tasks|milestones|assets|briefings|meeting_transcripts",
        "record_id": integer,
        "field": "string (field name that was corrected)",
        "corrected_value": "string (the properly cased value)",
        "original_data": "object (the complete update data)"
    }
    
    Output JSON Schema:
    {
        "success": boolean,
        "record_id": integer,
        "message": "string",
        "error": "string (if failed)"
    }
    """
    start_time = time.time()
    session = get_session()
    try:
        logger.info(f"Confirming field correction: {table}.{field} -> {corrected_value}")
        
        model = MODEL_MAP.get(table)
        if not model:
            return {
                "success": False,
                "error": f"Invalid table '{table}'. Available: {list(MODEL_MAP.keys())}"
            }
        
        record = session.query(model).filter(model.id == record_id).first()
        if not record:
            return {
                "success": False,
                "error": f"No {table} record found with ID {record_id}"
            }
        
        # Update the data with corrected value
        update_data = original_data.copy()
        update_data[field] = corrected_value
        
        # Parse date fields
        for date_field in ['deadline', 'due_date', 'date_completed', 'deadline_display', 'date_completed_display', 'meeting_date']:
            if date_field in update_data and isinstance(update_data[date_field], str):
                update_data[date_field] = parse_date_string(update_data[date_field])
        
        # Parse array fields
        array_fields = ['client_id', 'project_id', 'task_id', 
                       'milestone_id', 'goal_id', 'user_id',
                       'assigned_to_id', 'briefing_id', 'asset_id',
                       'meeting_transcript_id', 'occurences_id','outcome_id']
        
        for array_field in array_fields:
            if array_field in update_data:
                update_data[array_field] = parse_array_field(update_data[array_field])
        
        # Update fields
        for key, value in update_data.items():
            if hasattr(record, key):
                setattr(record, key, value)
        
        session.commit()
        
        execution_time = time.time() - start_time
        logger.info(f"Field correction successful: {table}#{record_id} (time: {execution_time:.3f}s)")
        
        return {
            "success": True,
            "record_id": record_id,
            "message": f"Successfully updated {table} record with ID {record_id} (corrected {field} to '{corrected_value}')"
        }
        
    except Exception as e:
        session.rollback()
        execution_time = time.time() - start_time
        logger.error(f"Field correction failed: {table}#{record_id} - {str(e)} (time: {execution_time:.3f}s)")
        return {
            "success": False,
            "error": f"Database error: {str(e)}"
        }
    finally:
        session.close()

@tool
def create_record(table: str, data: dict) -> dict:
    """
    Create a new record in the specified database table.
    
    Description: Creates a new record with the provided data. All tables require a 'name' field. Array fields can be provided as lists or comma-separated strings.
    
    Input JSON Schema:
    {
        "table": "users|clients|goals|projects|tasks|milestones|assets|briefings|meeting_transcripts",
        "data": {
            "name": "string (optional, but recommended)",
            "email": "string (optional for users/clients)",
            "status": "string (optional, defaults vary by table)",
            "deadline": "YYYY-MM-DD HH:mm:ss or YYYY-MM-DD (optional for projects)",
            "due_date": "YYYY-MM-DD HH:mm:ss or YYYY-MM-DD (optional for tasks/milestones)",
            "date_completed": "YYYY-MM-DD HH:mm:ss or YYYY-MM-DD (optional for projects/tasks)",
            "deadline_display": "YYYY-MM-DD HH:mm:ss or YYYY-MM-DD (optional for projects)",
            "date_completed_display": "YYYY-MM-DD HH:mm:ss or YYYY-MM-DD (optional for projects)",
            "client_id": "array of integers or comma-separated string (optional)",
            
            "project_id": "array of integers or comma-separated string (optional)",
            
            "task_id": "array of integers or comma-separated string (optional)",
            
            "milestone_id": "array of integers or comma-separated string (optional)",
            
            "goal_id": "array of integers or comma-separated string (optional)",
            
            "user_id": "array of integers or comma-separated string (optional)",
            
            "assigned_to_id": "array of integers or comma-separated string (optional)",
            
            "priority": "Low|Medium|High (optional)",
            "notes": "string (optional)",
            "tags": "string (optional)",
            "briefings": "string (optional)",
            "assets": "string (optional)",
            "website": "string (optional for clients)",
            "contact": "string (optional for clients)",
            "type": "string (optional for clients)",
            "description": "string (optional for goals)",
            "outcome_id": "array of integers or comma-separated string (optional for briefings)",
            "transcript_link": "string (optional for meeting_transcripts)",
            "meeting_date": "YYYY-MM-DD HH:mm:ss or YYYY-MM-DD (optional for meeting_transcripts)"
            // ... other fields as per table schema
        }
    }
    
    Output JSON Schema:
    {
        "success": boolean,
        "record_id": integer,
        "message": "string",
        "error": "string (if failed)",
        "requires_confirmation": boolean,
        "pending_data": "object (if confirmation needed)",
        "pending_table": "string (if confirmation needed)"
    }
    """
    start_time = time.time()
    session = get_session()
    try:
        logger.info(f"Creating record in {table}: {data.get('name', 'unnamed')}")
        
        model = MODEL_MAP.get(table)
        if not model:
            return {
                "success": False,
                "error": f"Invalid table '{table}'. Available: {list(MODEL_MAP.keys())}"
            }
        
        # Check for empty name field and request confirmation
        name_value = data.get('name')
        if name_value is None or (isinstance(name_value, str) and name_value.strip() == ''):
            return {
                "success": False,
                "requires_confirmation": True,
                "message": f"Warning: You're trying to create a {table} record with an empty name. This is allowed but not recommended. Do you want to proceed?",
                "pending_data": data,
                "pending_table": table
            }
        
        # Validate field values (status, type, priority, etc.)
        for field, value in data.items():
            if isinstance(value, str) and value.strip():
                validation = validate_field_value(table, field, value)
                if not validation["valid"] and validation.get("requires_confirmation"):
                    return {
                        "success": False,
                        "requires_field_confirmation": True,
                        "message": validation["message"],
                        "field": field,
                        "user_value": validation["user_value"],
                        "suggested_value": validation["suggested_value"],
                        "pending_data": data,
                        "pending_table": table
                    }
                elif not validation["valid"]:
                    return {
                        "success": False,
                        "error": validation["message"]
                    }
        
        # Parse date fields
        for date_field in ['deadline', 'due_date', 'date_completed', 'deadline_display', 'date_completed_display', 'meeting_date']:
            if date_field in data and isinstance(data[date_field], str):
                data[date_field] = parse_date_string(data[date_field])
        
        # Parse array fields
        array_fields = ['client_id', 'project_id', 'task_id', 
                       'milestone_id', 'goal_id', 'user_id',
                       'assigned_to_id', 'briefing_id', 'asset_id',
                       'meeting_transcript_id', 'occurences_id','outcome_id']
        
        for field in array_fields:
            if field in data:
                data[field] = parse_array_field(data[field])
        
        # Create record
        record = model(**data)
        session.add(record)
        session.commit()
        session.refresh(record)
        
        execution_time = time.time() - start_time
        logger.info(f"Record created successfully: {table}#{record.id} (time: {execution_time:.3f}s)")
        
        return {
            "success": True,
            "record_id": record.id,
            "message": f"Successfully created {table} record with ID {record.id}"
        }
        
    except Exception as e:
        session.rollback()
        execution_time = time.time() - start_time
        logger.error(f"Record creation failed: {table} - {str(e)} (time: {execution_time:.3f}s)")
        return {
            "success": False,
            "error": f"Database error: {str(e)}"
        }
    finally:
        session.close()

@tool
def confirm_create_with_corrected_field(table: str, data: dict, field: str, corrected_value: str) -> dict:
    """
    Create a record with corrected field value after user confirmation.
    
    Description: Creates a record using the properly cased field value after user has confirmed the correction.
    
    Input JSON Schema:
    {
        "table": "users|clients|goals|projects|tasks|milestones|assets|briefings|meeting_transcripts",
        "data": "object (original data)",
        "field": "string (field that was corrected)",
        "corrected_value": "string (the properly cased value)"
    }
    
    Output JSON Schema:
    {
        "success": boolean,
        "record_id": integer,
        "message": "string",
        "error": "string (if failed)"
    }
    """
    start_time = time.time()
    session = get_session()
    try:
        logger.info(f"Creating record with corrected field: {table}.{field} -> {corrected_value}")
        
        model = MODEL_MAP.get(table)
        if not model:
            return {
                "success": False,
                "error": f"Invalid table '{table}'. Available: {list(MODEL_MAP.keys())}"
            }
        
        # Update data with corrected value
        corrected_data = data.copy()
        corrected_data[field] = corrected_value
        
        # Parse date fields
        for date_field in ['deadline', 'due_date', 'date_completed', 'deadline_display', 'date_completed_display','meeting_date']:
            if date_field in corrected_data and isinstance(corrected_data[date_field], str):
                corrected_data[date_field] = parse_date_string(corrected_data[date_field])
        
        # Parse array fields
        array_fields = ['client_id', 'project_id', 'task_id', 
                       'milestone_id', 'goal_id', 'user_id',
                       'assigned_to_id', 'briefing_id', 'asset_id',
                       'meeting_transcript_id', 'occurences_id','outcome_id']
        
        for array_field in array_fields:
            if array_field in corrected_data:
                corrected_data[array_field] = parse_array_field(corrected_data[array_field])
        
        # Create record with corrected field
        record = model(**corrected_data)
        session.add(record)
        session.commit()
        session.refresh(record)
        
        execution_time = time.time() - start_time
        logger.info(f"Record created with corrected field successfully: {table}#{record.id} (time: {execution_time:.3f}s)")
        
        return {
            "success": True,
            "record_id": record.id,
            "message": f"Successfully created {table} record with ID {record.id} (corrected {field} to '{corrected_value}')"
        }
        
    except Exception as e:
        session.rollback()
        execution_time = time.time() - start_time
        logger.error(f"Record creation with corrected field failed: {table} - {str(e)} (time: {execution_time:.3f}s)")
        return {
            "success": False,
            "error": f"Database error: {str(e)}"
        }
    finally:
        session.close()

@tool
def confirm_create_with_empty_name(table: str, data: dict) -> dict:
    """
    Create a record with empty name after user confirmation.
    
    Description: Creates a record with an empty or missing name field after user has confirmed they want to proceed.
    
    Input JSON Schema:
    {
        "table": "users|clients|goals|projects|tasks|milestones|assets|briefings|meeting_transcripts",
        "data": {
            // Any valid fields for the table (name can be empty/missing)
        }
    }
    
    Output JSON Schema:
    {
        "success": boolean,
        "record_id": integer,
        "message": "string",
        "error": "string (if failed)"
    }
    """
    start_time = time.time()
    session = get_session()
    try:
        logger.info(f"Creating record with empty name: {table}")
        
        model = MODEL_MAP.get(table)
        if not model:
            return {
                "success": False,
                "error": f"Invalid table '{table}'. Available: {list(MODEL_MAP.keys())}"
            }
        
        # Parse date fields
        for date_field in ['deadline', 'due_date', 'date_completed', 'deadline_display', 'date_completed_display', 'meeting_date']:
            if date_field in data and isinstance(data[date_field], str):
                data[date_field] = parse_date_string(data[date_field])
        
        # Parse array fields
        array_fields = ['client_id', 'project_id', 'task_id', 
                       'milestone_id', 'goal_id', 'user_id',
                       'assigned_to_id', 'briefing_id', 'asset_id',
                       'meeting_transcript_id', 'occurences_id','outcome_id']
        
        for field in array_fields:
            if field in data:
                data[field] = parse_array_field(data[field])
        
        # Create record with empty name confirmed
        record = model(**data)
        session.add(record)
        session.commit()
        session.refresh(record)
        
        execution_time = time.time() - start_time
        logger.info(f"Record created with empty name successfully: {table}#{record.id} (time: {execution_time:.3f}s)")
        
        return {
            "success": True,
            "record_id": record.id,
            "message": f"Successfully created {table} record with ID {record.id} (empty name confirmed)"
        }
        
    except Exception as e:
        session.rollback()
        execution_time = time.time() - start_time
        logger.error(f"Record creation with empty name failed: {table} - {str(e)} (time: {execution_time:.3f}s)")
        return {
            "success": False,
            "error": f"Database error: {str(e)}"
        }
    finally:
        session.close()

@tool
def read_record(table: str, record_id: int) -> dict:
    """
    Read a specific record by ID from the database table.
    
    Description: Retrieves a single record using its unique ID.
    
    Input JSON Schema:
    {
        "table": "users|clients|goals|projects|tasks|milestones|assets|briefings|meeting_transcripts",
        "record_id": integer
    }
    
    Output JSON Schema:
    {
        "success": boolean,
        "record": {
            "id": integer,
            "name": "string",
            "created_at": "ISO datetime string",
            "updated_at": "ISO datetime string",
            // ... other fields vary by table
        },
        "message": "string",
        "error": "string (if failed)"
    }
    """
    start_time = time.time()
    session = get_session()
    try:
        logger.info(f"Reading record: {table}#{record_id}")
        
        model = MODEL_MAP.get(table)
        if not model:
            return {
                "success": False,
                "error": f"Invalid table '{table}'. Available: {list(MODEL_MAP.keys())}"
            }
        
        record = session.query(model).filter(model.id == record_id).first()
        if not record:
            return {
                "success": False,
                "error": f"No {table} record found with ID {record_id}"
            }
        
        execution_time = time.time() - start_time
        logger.info(f"Record read successful: {table}#{record_id} (time: {execution_time:.3f}s)")
        
        return {
            "success": True,
            "record": serialize_record(record),
            "message": f"Found {table} record with ID {record_id}"
        }
        
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"Record read failed: {table}#{record_id} - {str(e)} (time: {execution_time:.3f}s)")
        return {
            "success": False,
            "error": f"Database error: {str(e)}"
        }
    finally:
        session.close()

@tool
def update_record(table: str, record_id: int, data: dict) -> dict:
    """
    Update a specific record in the database table.
    
    Description: Updates existing record fields with new values. Array fields can be provided as lists or comma-separated strings.
    
    Input JSON Schema:
    {
        "table": "users|clients|goals|projects|tasks|milestones|assets|briefings|meeting_transcripts",
        "record_id": integer,
        "data": {
            // Any valid field for the table including array fields
            "name": "string",
            "status": "string",
            "notes": "string",
            "deadline": "YYYY-MM-DD HH:mm:ss or YYYY-MM-DD (for projects)",
            "due_date": "YYYY-MM-DD HH:mm:ss or YYYY-MM-DD (for tasks/milestones)",
            "date_completed": "YYYY-MM-DD HH:mm:ss or YYYY-MM-DD (for projects/tasks)",
            "deadline_display": "YYYY-MM-DD HH:mm:ss or YYYY-MM-DD (for projects)",
            "date_completed_display": "YYYY-MM-DD HH:mm:ss or YYYY-MM-DD (for projects)",
            "client_id": "array of integers or comma-separated string",
            
            "project_id": "array of integers or comma-separated string",
            
            "task_id": "array of integers or comma-separated string",
            
            "milestone_id": "array of integers or comma-separated string",
            
            "goal_id": "array of integers or comma-separated string",
            
            "user_id": "array of integers or comma-separated string",
            
            "assigned_to_id": "array of integers or comma-separated string",
            
            "priority": "Low|Medium|High (optional)",
            "notes": "string (optional)",
            "tags": "string (optional)",
            "briefings": "string (optional)",
            "assets": "string (optional)",
            "website": "string (optional for clients)",
            "contact": "string (optional for clients)",
            "type": "string (optional for clients)",
            "description": "string (optional for goals)"
            "outcome_id": "array of integers or comma-separated string (optional for briefings)",
            "transcript_link": "string (optional for meeting_transcripts)",
            "meeting_date": "YYYY-MM-DD HH:mm:ss or YYYY-MM-DD (optional for meeting_transcripts)"
            // ... other fields as needed
        }
    }
    
    Output JSON Schema:
    {
        "success": boolean,
        "record_id": integer,
        "message": "string",
        "error": "string (if failed)"
    }
    """
    start_time = time.time()
    session = get_session()
    try:
        logger.info(f"Updating record: {table}#{record_id}")
        
        model = MODEL_MAP.get(table)
        if not model:
            return {
                "success": False,
                "error": f"Invalid table '{table}'. Available: {list(MODEL_MAP.keys())}"
            }
        
        record = session.query(model).filter(model.id == record_id).first()
        if not record:
            return {
                "success": False,
                "error": f"No {table} record found with ID {record_id}"
            }
        
        # Validate field values (status, type, priority, etc.)
        for field, value in data.items():
            if isinstance(value, str) and value.strip():
                validation = validate_field_value(table, field, value)
                if not validation["valid"] and validation.get("requires_confirmation"):
                    return {
                        "success": False,
                        "requires_field_confirmation": True,
                        "message": validation["message"],
                        "field": field,
                        "user_value": validation["user_value"],
                        "suggested_value": validation["suggested_value"],
                        "pending_data": data,
                        "pending_table": table,
                        "pending_record_id": record_id
                    }
                elif not validation["valid"]:
                    return {
                        "success": False,
                        "error": validation["message"]
                    }
        
        # Parse date fields
        for date_field in ['deadline', 'due_date', 'date_completed', 'deadline_display', 'date_completed_display', 'meeting_date']:
            if date_field in data and isinstance(data[date_field], str):
                data[date_field] = parse_date_string(data[date_field])
        
        # Parse array fields
        array_fields = ['client_id', 'project_id', 'task_id', 
                       'milestone_id', 'goal_id', 'user_id',
                       'assigned_to_id', 'briefing_id', 'asset_id',
                       'meeting_transcript_id', 'occurences_id','outcome_id']
        
        for field in array_fields:
            if field in data:
                data[field] = parse_array_field(data[field])
        
        # Update fields
        for key, value in data.items():
            if hasattr(record, key):
                setattr(record, key, value)
        
        session.commit()
        
        execution_time = time.time() - start_time
        logger.info(f"Record updated successfully: {table}#{record_id} (time: {execution_time:.3f}s)")
        
        return {
            "success": True,
            "record_id": record_id,
            "message": f"Successfully updated {table} record with ID {record_id}"
        }
        
    except Exception as e:
        session.rollback()
        execution_time = time.time() - start_time
        logger.error(f"Record update failed: {table}#{record_id} - {str(e)} (time: {execution_time:.3f}s)")
        return {
            "success": False,
            "error": f"Database error: {str(e)}"
        }
    finally:
        session.close()

@tool
def list_records(table: str, limit: int = 10, filters: dict = None) -> dict:
    """
    List records from a database table with optional filtering.
    
    Description: Retrieves multiple records with pagination and filtering capabilities.
    
    Input JSON Schema:
    {
        "table": "users|clients|goals|projects|tasks|milestones|assets|briefings|meeting_transcripts",
        "limit": integer (default: 10, max: 100),
        "filters": {
            "status": "string",
            "client_id": array of integer,
            "project_id": aray of integer,
            "assigned_to_id": array of integer,
            "owner_id": integer,
            "priority": "string",
            "type": "string (for clients)",
            // ... other valid fields for filtering
        }
    }
    
    Output JSON Schema:
    {
        "success": boolean,
        "records": [
            {
                "id": integer,
                "name": "string",
                // ... other fields
            }
        ],
        "count": integer,
        "message": "string",
        "error": "string (if failed)"
    }
    """
    start_time = time.time()
    session = get_session()
    try:
        logger.info(f"Listing records from {table} (limit: {limit}, filters: {filters})")
        
        model = MODEL_MAP.get(table)
        if not model:
            return {
                "success": False,
                "error": f"Invalid table '{table}'. Available: {list(MODEL_MAP.keys())}"
            }
        
        # Limit validation
        limit = min(max(1, limit), 100)
        
        # Build query
        query = session.query(model)
        
        # Apply filters
        if filters:
            for field, value in filters.items():
                if hasattr(model, field):
                    query = query.filter(getattr(model, field) == value)
        
        # Execute query
        records = query.limit(limit).all()
        
        execution_time = time.time() - start_time
        logger.info(f"Records listed successfully: {table} - {len(records)} records (time: {execution_time:.3f}s)")
        
        return {
            "success": True,
            "records": [serialize_record(record) for record in records],
            "count": len(records),
            "message": f"Found {len(records)} {table} records"
        }
        
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"Records listing failed: {table} - {str(e)} (time: {execution_time:.3f}s)")
        return {
            "success": False,
            "error": f"Database error: {str(e)}"
        }
    finally:
        session.close()

@tool
def delete_record(table: str, record_id: int) -> dict:
    """
    Delete a specific record from the database table.
    
    Description: Permanently removes a record from the database. This action cannot be undone.
    
    Input JSON Schema:
    {
        "table": "users|clients|goals|projects|tasks|milestones|assets|briefings|meeting_transcripts",
        "record_id": integer
    }
    
    Output JSON Schema:
    {
        "success": boolean,
        "message": "string",
        "error": "string (if failed)"
    }
    """
    start_time = time.time()
    session = get_session()
    try:
        logger.info(f"Deleting record: {table}#{record_id}")
        
        model = MODEL_MAP.get(table)
        if not model:
            return {
                "success": False,
                "error": f"Invalid table '{table}'. Available: {list(MODEL_MAP.keys())}"
            }
        
        record = session.query(model).filter(model.id == record_id).first()
        if not record:
            return {
                "success": False,
                "error": f"No {table} record found with ID {record_id}"
            }
        
        session.delete(record)
        session.commit()
        
        execution_time = time.time() - start_time
        logger.info(f"Record deleted successfully: {table}#{record_id} (time: {execution_time:.3f}s)")
        
        return {
            "success": True,
            "message": f"Successfully deleted {table} record with ID {record_id}"
        }
        
    except Exception as e:
        session.rollback()
        execution_time = time.time() - start_time
        logger.error(f"Record deletion failed: {table}#{record_id} - {str(e)} (time: {execution_time:.3f}s)")
        return {
            "success": False,
            "error": f"Database error: {str(e)}"
        }
    finally:
        session.close()

@tool
def get_database_stats() -> dict:
    """
    Get comprehensive database statistics and overview.
    
    Description: Provides counts, status distributions, and health metrics for all tables.
    
    Input JSON Schema: {}
    
    Output JSON Schema:
    {
        "success": boolean,
        "stats": {
            "total_records": integer,
            "tables": {
                "users": {"count": integer},
                "clients": {"count": integer},
                "goals": {"count": integer},
                "projects": {"count": integer},
                "tasks": {"count": integer},
                "milestones": {"count": integer},
                "assets": {"count": integer},
                "briefings": {"count": integer},
                "meeting_transcripts": {"count": integer}
            }
        },
        "message": "string"
    }
    """
    start_time = time.time()
    session = get_session()
    try:
        logger.info("Getting database statistics")
        
        stats = {"total_records": 0, "tables": {}}
        
        # Get basic counts
        for table_name, model in MODEL_MAP.items():
            count = session.query(model).count()
            stats["total_records"] += count
            stats["tables"][table_name] = {"count": count}
            
            # # Status distributions for projects, tasks, goals, and milestones
            # if table_name in ["projects", "tasks", "goals", "milestones"]:
            #     status_query = session.query(model.status, func.count(model.id)).group_by(model.status).all()
            #     stats["tables"][table_name]["by_status"] = dict(status_query)
                
            #     # Overdue items for tasks and milestones
            #     if table_name in ["tasks", "milestones"]:
            #         date_field = "due_date"
            #         overdue = session.query(model).filter(
            #             getattr(model, date_field) < datetime.now(),
            #             model.status != "Completed"
            #         ).count()
            #         stats["tables"][table_name]["overdue"] = overdue
        
        execution_time = time.time() - start_time
        logger.info(f"Database stats retrieved: {stats['total_records']} total records (time: {execution_time:.3f}s)")
        
        return {
            "success": True,
            "stats": stats,
            "message": f"Database contains {stats['total_records']} total records across {len(MODEL_MAP)} tables"
        }
        
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"Database stats failed: {str(e)} (time: {execution_time:.3f}s)")
        return {
            "success": False,
            "error": f"Database error: {str(e)}"
        }
    finally:
        session.close()

@tool
def search_records_by_name(table: str, name_query: str, limit: int = 10, min_similarity: int = 60) -> dict:
    """
    Search records by name with case-insensitive and fuzzy matching capabilities.
    
    Description: Finds records with names similar to the query, providing suggestions when exact matches aren't found.
    
    Input JSON Schema:
    {
        "table": "users|clients|goals|projects|tasks|milestones|assets|briefings|meeting_transcripts",
        "name_query": "string (name to search for)",
        "limit": integer (default: 10, max: 100),
        "min_similarity": integer (default: 60, similarity threshold 0-100)
    }
    
    Output JSON Schema:
    {
        "success": boolean,
        "records": [
            {
                "id": integer,
                "name": "string",
                "similarity_score": integer,
                // ... other fields
            }
        ],
        "count": integer,
        "message": "string",
        "suggestions": [
            {
                "id": integer,
                "name": "string",
                "similarity_score": integer
            }
        ]
    }
    """
    start_time = time.time()
    session = get_session()
    try:
        logger.info(f"Searching records by name: {table} - '{name_query}' (similarity: {min_similarity})")
        
        model = MODEL_MAP.get(table)
        if not model:
            return {
                "success": False,
                "error": f"Invalid table '{table}'. Available: {list(MODEL_MAP.keys())}"
            }
        
        # Limit validation
        limit = min(max(1, limit), 100)
        min_similarity = max(0, min(100, min_similarity))
        
        # Get all records to perform fuzzy matching
        all_records = session.query(model).all()
        
        if not all_records:
            return {
                "success": True,
                "records": [],
                "count": 0,
                "message": f"No records found in {table} table"
            }
        
        # Perform fuzzy matching
        matches = []
        name_to_record = {}
        
        for record in all_records:
            record_name = record.name or ""
            name_to_record[record_name] = record
            
            # Calculate similarity score
            similarity = fuzz.ratio(name_query.lower(), record_name.lower())
            
            if similarity >= min_similarity:
                matches.append({
                    'record': record,
                    'similarity': similarity,
                    'name': record_name
                })
        
        # Sort by similarity score (highest first)
        matches.sort(key=lambda x: x['similarity'], reverse=True)
        
        # Take only the requested limit
        matches = matches[:limit]
        
        # Serialize results
        results = []
        for match in matches:
            record_data = serialize_record(match['record'])
            record_data['similarity_score'] = match['similarity']
            results.append(record_data)
        
        # If no matches found, provide suggestions with lower threshold
        suggestions = []
        if not matches and min_similarity > 30:
            # Lower the threshold to find suggestions
            for record in all_records:
                record_name = record.name or ""
                similarity = fuzz.ratio(name_query.lower(), record_name.lower())
                
                if similarity >= 30:  # Lower threshold for suggestions
                    suggestions.append({
                        'id': record.id,
                        'name': record_name,
                        'similarity_score': similarity
                    })
            
            # Sort suggestions by similarity
            suggestions.sort(key=lambda x: x['similarity_score'], reverse=True)
            suggestions = suggestions[:5]  # Top 5 suggestions
        
        message = f"Found {len(results)} {table} records matching '{name_query}'"
        if results and results[0]['similarity_score'] < 100:
            message += f" (best match: {results[0]['similarity_score']}% similar)"
        
        if not results and suggestions:
            message = f"No close matches found for '{name_query}' in {table}. Here are some suggestions:"
        
        execution_time = time.time() - start_time
        logger.info(f"Name search completed: {table} - '{name_query}' - {len(results)} matches (time: {execution_time:.3f}s)")
        
        return {
            "success": True,
            "records": results,
            "count": len(results),
            "message": message,
            "suggestions": suggestions if suggestions else None
        }
        
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"Name search failed: {table} - '{name_query}' - {str(e)} (time: {execution_time:.3f}s)")
        return {
            "success": False,
            "error": f"Database error: {str(e)}"
        }
    finally:
        session.close()

@tool
def get_current_datetime() -> dict:
    """
    Get the current date and time.
    
    Description: Returns the current date and time in ISO format and human-readable format.
    
    Input JSON Schema: {}
    
    Output JSON Schema:
    {
        "success": boolean,
        "current_datetime": "string (ISO format: YYYY-MM-DD HH:MM:SS)",
        "current_date": "string (YYYY-MM-DD)",
        "current_time": "string (HH:MM:SS)",
        "timezone": "string",
        "message": "string"
    }
    """
    try:
        logger.info(f"Current datetime requested.")
        now = datetime.now()
        return {
            "success": True,
            "current_datetime": now.strftime("%Y-%m-%d %H:%M:%S"),
            "current_date": now.strftime("%Y-%m-%d"),
            "current_time": now.strftime("%H:%M:%S"),
            "timezone": "Local time",
            "message": f"Current date and time: {now.strftime('%Y-%m-%d %H:%M:%S')}"
        }
        
    except Exception as e:
        logger.error(f"Error getting current datetime: {str(e)}")
        return {
            "success": False,
            "error": f"Error getting current datetime: {str(e)}"
        }

# ──────────────────────────────────────────────────────────────────────────────
# LangGraph AI Agent
# ──────────────────────────────────────────────────────────────────────────────

#removed this part after update requests:
### Status Translation Guidelines
# When users request status changes, translate common terms to valid database values:
# - **For Milestones**: "In Progress" → "Backlog", "Active" → "Backlog", "Working" → "Backlog"
# - **For Projects**: "Active" → "In progress", "Working" → "In progress"
# - **For Goals**: "Active" → "In progress", "Working" → "In progress"
# - **For Tasks**: "Active" → "Next (P2)", "Working" → "Next (P2)"

# System prompt with comprehensive guidelines
SYSTEM_PROMPT = """You are an intelligent PostgreSQL Database Assistant for a Project Management System. Your role is to help users perform database operations using natural language commands while maintaining data integrity and security.

## CORE RESPONSIBILITIES
- Execute CRUD operations (Create, Read, Update, Delete) on database records
- Provide clear, actionable responses with proper error handling
- Maintain data consistency and validate user inputs
- Guide users through complex operations step by step
- Perform intelligent name searches with fuzzy matching capabilities

## AVAILABLE TOOLS & THEIR USAGE

### 1. create_record
- **Purpose**: Create new records in any table
- **Required**: table name and data object with 'name' field
- **Tables**: users, clients, projects, tasks
- **Example**: create_record(table="projects", data={"name": "Website Redesign", "status": "Active"})

### 2. read_record
- **Purpose**: Retrieve a specific record by ID
- **Required**: table name and record_id
- **Example**: read_record(table="projects", record_id=1)

### 3. update_record
- **Purpose**: Modify existing record fields
- **Required**: table name, record_id, and data object with fields to update
- **Example**: update_record(table="tasks", record_id=5, data={"status": "Completed"})

### 4. list_records
- **Purpose**: Get multiple records with optional filtering
- **Optional**: limit (max 100), filters object
- **Example**: list_records(table="tasks", filters={"status": "In Progress"})

### 5. delete_record
- **Purpose**: Permanently remove a record
- **Required**: table name and record_id
- **Warning**: This action cannot be undone
- **Example**: delete_record(table="clients", record_id=3)

### 6. get_database_stats
- **Purpose**: Get overview of database with counts and statistics
- **No parameters required**

### 7. search_records_by_name
- **Purpose**: Find records by name using case-insensitive fuzzy matching
- **Required**: table name, name_query
- **Optional**: limit (max 100), min_similarity (0-100, default 60)
- **Example**: search_records_by_name(table="projects", name_query="ritesh")
- **Features**: Case-insensitive, partial matching, similarity scoring, suggestions

### 8. get_current_datetime
- **Purpose**: Get the current date and time in real-time
- **No parameters required**
- **Returns**: Current datetime in ISO format, date, time, and timezone info
- **Use when**: User asks for current time, needs to set deadlines relative to now, or for time-sensitive operations
- **Example**: get_current_datetime() → Returns current system time

## NAME SEARCH CAPABILITIES
When users search for records by name (e.g., "find projects named Ritesh", "list all users called john", "show clients with name containing tech"):

1. **Use search_records_by_name** instead of list_records with filters
2. **Case-insensitive matching** - "ritesh" matches "Ritesh", "RITESH", "RiTeSh"
3. **Fuzzy matching** - "ritsh" can match "Ritesh" with high similarity
4. **Partial matching** - "rite" can match "Ritesh"
5. **Similarity scoring** - Shows how close matches are (0-100%)
6. **Smart suggestions** - If no good matches, suggests similar names
7. **Multiple results** - Returns all matches above similarity threshold

### Search Examples:
- "Find projects named Ritesh" → search_records_by_name(table="projects", name_query="Ritesh")
- "List users called john" → search_records_by_name(table="users", name_query="john")
- "Show clients with name Z" → search_records_by_name(table="clients", name_query="Z")
- "Any tasks containing 'keyword'" → search_records_by_name(table="tasks", name_query="keyword")
- "Find goals similar to 'revenue'" → search_records_by_name(table="goals", name_query="revenue")

## DATABASE SCHEMA

### Users Table
- **Required**: name
- **Optional**: email
- **Purpose**: System users who can own projects and be assigned tasks

### Clients Table
- **Required**: name
- **Optional**: website, email, contact, notes, type, tags, project, briefings, assets, meeting_transcripts
- **Purpose**: External clients for whom projects are created
- **Valid Types**: Family, Privat, Internal, External

### Goals Table
- **Required**: name
- **Optional**: tags, status, briefings, description
- **Purpose**: High-level objectives that can be linked to projects
- **Valid Status**: Not started, In progress, Done

### Projects Table
- **Required**: name
- **Optional**: status, deadline, client_id, owner_id, priority, notes, owner_display, date_completed, assets, briefings, overdue_tasks, command_center, milestones, remaining_tasks, meeting_transcript, deadline_display, tags, date_completed_display
- **Default Status**: "Not started"
- **Valid Status**: Not started, In progress, Stuck, Done
- **Valid Priorities**: P1, P2, P3ls

### Tasks Table
- **Required**: name
- **Optional**: status, due_date, assigned_to_id, project_id, notes, days, recur_unit, completed_yesterday, due_date_display, team_summary, emiliano_summary, next_due, concesa_summary, overdue, tags, rangbom_summary, recur_interval, agent, date_completed, assets, unsquared_media_summary, command_center, annie_summary, kat_summary, updates, exec_summary, minh_summary, briefings, meeting_transcripts
- **Valid Status**: Inbox, Paused/Later (P3), Next (P2), Now(P1), In progress, Review, Shipped, Done.
- **Valid Days**: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- **Valid Recur Unit**: Day(s), Week(s), Month(s), Month(s) on the First Weekday, Month(s) on the Last Weekday, Month(s) on the Last Day, Year(s).

### Milestones Table
- **Required**: name
- **Optional**: notes, briefings, due_date, project_id, status, assets, meeting_transcripts, tags
- **Default Status**: "Not started"
- **Valid Status**: Not started, Backlog, Paused, In progress, High Priority, Under Review, Shipped, Done.

### Assets Table
- **Required**: name
- **Optional**: type, link, notes, project_id, task_id, milestone_id, tags, description, briefings_id
- **Purpose**: Files or resources linked to clients, projects, tasks, or milestones
- **Valid Types**: Social Media Post, Image, Blog, Doc, Loom Video, YouTube Video, Sheets, Notion Page.

### Briefings Table
- **Required**: name
- **Optional**: client_id, project_id, task_id, milestone_id, notes, tags, outcome_id, assets_id, meeting_transcript_id, objective
- **Purpose**: Meeting notes or briefs linked to various entities

### Meeting-Transcripts Table
- **Required**: name
- **Optional**: client_id, project_id, task_id, milestone_id, notes, tags, assets_id, briefing_id, transcript_link, meeting_date, goal_id
- **Purpose**: Transcripts of meetings linked to various entities

## OPERATIONAL GUIDELINES

### Input Validation
1. **Always validate required fields** - Every record needs a 'name'
2. **Check data types** - Ensure integers for IDs, proper datetime format (YYYY-MM-DD HH:mm:ss or YYYY-MM-DD)
3. **Validate relationships** - Verify foreign key references exist
4. **Sanitize inputs** - Check for reasonable string lengths and valid values
5. **Validate status values** - Only use valid status values as defined in the schema

### Error Handling
1. **Graceful degradation** - If one operation fails, suggest alternatives
2. **Clear error messages** - Explain what went wrong and how to fix it
3. **Recovery guidance** - Provide next steps when errors occur
4. **Data protection** - Never expose sensitive system information
5. **Status validation** - If invalid status provided, suggest valid alternatives

### Response Format
1. **Always respond in JSON format for tool calls**
2. **Provide human-readable summaries** after tool operations
3. **Include record IDs** in success messages for future reference
4. **Show relevant data** but don't overwhelm with unnecessary details

### Security & Safety
1. **No direct SQL execution** - Only use provided tools
2. **Validate all inputs** - Never trust user data without validation
3. **Confirm destructive operations** - Ask for confirmation before deleting
4. **Respect data relationships** - Consider cascade effects of operations

## COMMON USER PATTERNS & RESPONSES

### Search/Find Requests (USE search_records_by_name)
- "Find projects named X" → search_records_by_name(table="projects", name_query="X")
- "List users called Y" → search_records_by_name(table="users", name_query="Y")  
- "Show clients with name Z" → search_records_by_name(table="clients", name_query="Z")
- "Any tasks containing 'keyword'" → search_records_by_name(table="tasks", name_query="keyword")
- "Find goals similar to 'revenue'" → search_records_by_name(table="goals", name_query="revenue")

### Creation Requests
- "Create a project called X" → create_record(table="projects", data={"name": "X"})
- "Add a new user John Doe" → create_record(table="users", data={"name": "John Doe"})
- "Make a task for project 1" → create_record(table="tasks", data={"name": "...", "project_id": 1})
- "Create a goal to increase revenue" → create_record(table="goals", data={"name": "Increase Revenue"})
- "Add milestone for project 2" → create_record(table="milestones", data={"name": "...", "project_id": 2})

### Retrieval Requests
- "Show project 1" → read_record(table="projects", record_id=1)
- "List all users" → list_records(table="users")
- "Find completed tasks" → list_records(table="tasks", filters={"status": "Completed"})
- "Show goals in progress" → list_records(table="goals", filters={"status": "In progress"})

### Update Requests
- "Mark task 5 as done" → update_record(table="tasks", record_id=5, data={"status": "Completed"})
- "Change project deadline" → update_record(table="projects", record_id=X, data={"deadline": "YYYY-MM-DD HH:mm:ss"})
- "Update goal status" → update_record(table="goals", record_id=X, data={"status": "Done"})
- "Set milestone to backlog" → update_record(table="milestones", record_id=X, data={"status": "Backlog"})

### Date/Time Requests (USE get_current_datetime)
- "Show me the current date and time" → get_current_datetime()
- "I need to set a deadline for tomorrow" → get_current_datetime() first, then calculate tomorrow's date
- "Create a task due today" → get_current_datetime() to get today's date for due_date field

### Analytics Requests
- "Show database overview" → get_database_stats()
- "How many projects do we have?" → list_records(table="projects") then count
- "List overdue milestones" → list_records(table="milestones", filters with date comparison)

## USER CONFIRMATION & FIELD VALIDATION

Before performing any CRUD operation **always ask the user for confirmation to proceed** and if user would like to add any additional fields or data:
1. **Confirmation Request**: Before making any changes to the database, confirm with user whether to proceed.
2. **Additional Fields**: Also ask if there are any other fields user would like to include in the operation (e.g., "Should I proceed with these changes?" or "Is there any additional information you'd like to add (give suggestions)?").

## RESPONSE GUIDELINES
1. **Ask for confirmation** - Before performing any operation that modifies data, confirm with the user
2. **Be conversational but precise** - Use natural language while being technically accurate
3. **Confirm operations** - Always acknowledge successful operations with record IDs
4. **Suggest next steps** - Guide users toward related actions they might want to take
5. **Handle ambiguity** - Ask for clarification when user intent is unclear
6. **Stay focused** - Keep responses relevant to database operations
7. **Status validation** - When invalid status is provided, automatically suggest the closest valid alternative
8. **Smart search** - Always use search_records_by_name for name-based queries to provide fuzzy matching
9. **Show similarity scores** - When showing search results, mention similarity scores for context

***Remember: You are a database assistant, not a general chatbot. Focus on helping users effectively manage their project data while maintaining system integrity and security. Always use fuzzy name search when users are looking for records by name. And Always ask for confirmation before performing any CRUD operation.***"""

# Initialize OpenAI LLM
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
if not OPENAI_API_KEY:
    print("❌ OPENAI_API_KEY environment variable required")
    exit(1)

# llm = ChatAnthropic(
#     model="claude-sonnet-4-20250514",
#     # api_key=OPENAI_API_KEY,
#     api_key=ANTHROPIC_API_KEY,
#     temperature=0
# )
llm = ChatOpenAI(
    model="gpt-4o",
    api_key=OPENAI_API_KEY,
    temperature=0
)

# Define available tools
database_tools = [
    create_record,
    read_record,
    update_record,
    list_records,
    delete_record,
    get_database_stats,
    confirm_create_with_empty_name,
    confirm_create_with_corrected_field,
    confirm_field_correction,
    search_records_by_name,
    get_current_datetime
]

# Bind tools to model
model_with_tools = llm.bind_tools(database_tools)

# LangGraph nodes
def agent_node(state: MessagesState):
    """Agent decision node - decides whether to use tools or respond directly"""
    response = model_with_tools.invoke(state["messages"])
    return {"messages": [response]}

def should_continue(state: MessagesState):
    """Router function - determines next step based on last message"""
    last_message = state["messages"][-1]
    if isinstance(last_message, AIMessage) and hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return END

# Build the graph
workflow = StateGraph(MessagesState)
workflow.add_node("agent", agent_node)
workflow.add_node("tools", ToolNode(database_tools))

workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
workflow.add_edge("tools", "agent")

app = workflow.compile()

# ──────────────────────────────────────────────────────────────────────────────
# Chat Interface
# ──────────────────────────────────────────────────────────────────────────────

class DatabaseAgent:
    def __init__(self):

        self.conversation_history = [SystemMessage(content=SYSTEM_PROMPT)]
        self.pending_confirmation = None
        self.pending_field_confirmation = None
    
    def reset(self):
        """Reset conversation history"""
        self.conversation_history = [SystemMessage(content=SYSTEM_PROMPT)]
        self.pending_confirmation = None
        self.pending_field_confirmation = None
        return "🔄 Conversation reset. Ready for new requests!"
    
    def _truncate_history(self):
        """Safely truncate history while preserving tool-call pairs.
        """
        # Always keep the system prompt as the first message
        if len(self.conversation_history) <= 1:
            return

        MAX_KEEP = 16  # recent tail size (excluding the system prompt)
        total_len = len(self.conversation_history)
        if total_len <= (1 + MAX_KEEP):
            return

        system_msg = self.conversation_history[0]
        msgs = self.conversation_history[1:]

        # Default tail start index
        start_idx = max(0, len(msgs) - MAX_KEEP)

        # Detect tool messages in the tail
        def is_tool_message(m):
            try:
                msg_type = getattr(m, "type", "")
            except Exception:
                msg_type = ""
            class_name = m.__class__.__name__.lower()
            return (isinstance(msg_type, str) and msg_type.lower() == "tool") or ("tool" in class_name)

        tail = msgs[start_idx:]
        # If there is any tool message in tail, backtrack to include the issuing AI message with tool_calls
        if any(is_tool_message(m) for m in tail):
            # Find the earliest tool message in the tail
            earliest_tool_rel_idx = None
            for i, m in enumerate(tail):
                if is_tool_message(m):
                    earliest_tool_rel_idx = i
                    break

            if earliest_tool_rel_idx is not None:
                earliest_tool_abs_idx = start_idx + earliest_tool_rel_idx
                # Walk backwards to find an AIMessage with tool_calls
                i = earliest_tool_abs_idx - 1
                while i >= 0:
                    prev = msgs[i]
                    if isinstance(prev, AIMessage) and hasattr(prev, "tool_calls") and prev.tool_calls:
                        start_idx = i  # include the AI that triggered the tools
                        break
                    i -= 1

        self.conversation_history = [system_msg] + msgs[start_idx:]

    def process_message(self, user_input: str) -> str:
        """Process user message and return AI response"""
        if not user_input.strip():
            return "Please provide a message or command."
        
        # Handle special commands
        if user_input.lower() in ["/reset", "/clear", "reset"]:
            return self.reset()
        
        # Check if we're waiting for field correction confirmation
        if self.pending_field_confirmation:
            user_response = user_input.lower().strip()
            if user_response in ['yes', 'y', 'proceed', 'ok', 'confirm']:
                # User confirmed field correction
                pending_data = self.pending_field_confirmation
                self.pending_field_confirmation = None
                
                # Add confirmation message to conversation
                self.conversation_history.append(HumanMessage(content=f"Yes, use '{pending_data['suggested_value']}' instead of '{pending_data['user_value']}'."))
                
                try:
                    if pending_data.get('pending_record_id'):
                        # This is an update operation
                        result = confirm_field_correction(
                            pending_data['table'], 
                            pending_data['pending_record_id'],
                            pending_data['field'],
                            pending_data['suggested_value'],
                            pending_data['data']
                        )
                    else:
                        # This is a create operation
                        result = confirm_create_with_corrected_field(
                            pending_data['table'],
                            pending_data['data'],
                            pending_data['field'],
                            pending_data['suggested_value']
                        )
                    
                    if result.get('success'):
                        response = f"✅ {result['message']}"
                        if 'record_id' in result:
                            response += f"\n\n💡 You can now reference this record by its ID ({result['record_id']}) for updates or queries."
                    else:
                        response = f"❌ Error: {result.get('error', 'Unknown error occurred')}"
    
                    self.conversation_history.append(AIMessage(content=response))
                    return response
                    
                except Exception as e:
                    response = f"❌ Error with field correction: {str(e)}"
                    self.conversation_history.append(AIMessage(content=response))
                    return response
                    
            elif user_response in ['no', 'n', 'cancel', 'abort']:
                # User declined field correction
                self.pending_field_confirmation = None
                response = "❌ Operation cancelled due to invalid field value. Please use the correct case or choose from the valid options."
                self.conversation_history.append(HumanMessage(content="No, cancel the operation."))
                self.conversation_history.append(AIMessage(content=response))
                return response
            else:
                pending_field = self.pending_field_confirmation.get('field', 'field')
                suggested_value = self.pending_field_confirmation.get('suggested_value', '')
                return f"⚠️ Please respond with 'yes' to use '{suggested_value}' for the {pending_field} field, or 'no' to cancel."
        
        # Check if we're waiting for empty name confirmation
        if self.pending_confirmation:
            user_response = user_input.lower().strip()
            if user_response in ['yes', 'y', 'proceed', 'ok', 'confirm']:
                # User confirmed, proceed with creation
                pending_data = self.pending_confirmation
                self.pending_confirmation = None
                
                # Add confirmation message to conversation
                self.conversation_history.append(HumanMessage(content=f"Yes, proceed with creating {pending_data['table']} with empty name."))
                
                try:
                    result = confirm_create_with_empty_name(pending_data['table'], **pending_data['data'])
                    
                    if result.get('success'):
                        response = f"✅ {result['message']}"
                        if 'record_id' in result:
                            response += f"\n\n💡 You can now reference this record by its ID ({result['record_id']}) for updates or queries."
                    else:
                        response = f"❌ Error: {result.get('error', 'Unknown error occurred')}"
    
                    self.conversation_history.append(AIMessage(content=response))
                    return response
                    
                except Exception as e:
                    response = f"❌ Error creating record: {str(e)}"
                    self.conversation_history.append(AIMessage(content=response))
                    return response
                    
            elif user_response in ['no', 'n', 'cancel', 'abort']:
                # User declined
                self.pending_confirmation = None
                response = "❌ Record creation cancelled. You can try again with a different name."
                self.conversation_history.append(HumanMessage(content="No, cancel the creation."))
                self.conversation_history.append(AIMessage(content=response))
                return response
            else:
                pending_table = self.pending_confirmation.get('table', 'record')
                return f"⚠️ Please respond with 'yes' to proceed with creating the {pending_table} with empty name, or 'no' to cancel."
        
        # Add user message
        self.conversation_history.append(HumanMessage(content=user_input))
        
        try:
            # Process with LangGraph
            result = app.invoke({"messages": self.conversation_history})
            
            # Update conversation history
            self.conversation_history = result["messages"]
            
            # Truncate history to keep only last 5 messages
            self._truncate_history()

            # Check for field confirmation requirements in tool results
            tool_result = self._extract_tool_result_from_messages(self.conversation_history)
            if tool_result.get('requires_field_confirmation'):
                self.pending_field_confirmation = {
                    'table': tool_result['pending_table'],
                    'data': tool_result['pending_data'],
                    'field': tool_result['field'],
                    'user_value': tool_result['user_value'],
                    'suggested_value': tool_result['suggested_value']
                }
                if tool_result.get('pending_record_id'):
                    self.pending_field_confirmation['pending_record_id'] = tool_result['pending_record_id']
                
                confirmation_msg = f"⚠️ {tool_result['message']}\n\nPlease respond with 'yes' to use the corrected value or 'no' to cancel."
                return confirmation_msg
            
            # Check for empty name confirmation requirements in tool results
            if tool_result.get('requires_confirmation'):
                self.pending_confirmation = {
                    'table': tool_result['pending_table'],
                    'data': tool_result['pending_data']
                }
                
                confirmation_msg = f"⚠️ {tool_result['message']}\n\nPlease respond with 'yes' to proceed or 'no' to cancel."
                return confirmation_msg
            
            # Get the final AI response
            ai_messages = [msg for msg in result["messages"] if isinstance(msg, AIMessage)]
            if ai_messages:
                final_response = ai_messages[-1].content
                
                # Add helpful context based on response
                if "Successfully created" in final_response:
                    final_response += "\n\n💡 You can now reference this record by its ID for updates or queries."
                elif "Successfully deleted" in final_response:
                    final_response += "\n\n⚠️ This action cannot be undone."
                elif "error" in final_response.lower():
                    final_response += "\n\n🔍 Check your input format and try again, or ask for help with the command syntax."
                
                return final_response
            else:
                return "❌ No response generated. Please try rephrasing your request."
                
        except Exception as e:
            # Remove failed user message from history
            if self.conversation_history and isinstance(self.conversation_history[-1], HumanMessage):
                self.conversation_history.pop()
            
            return f"❌ Error processing request: {str(e)}\n\n💡 Try rephrasing your request or use simpler terms."
    
    def _extract_tool_result_from_messages(self, messages: List[Any]) -> Dict[str, Any]:
        """Extract tool results from recent messages for confirmation handling"""
        for msg in reversed(messages[-10:]):  # Check last 10 messages
            if hasattr(msg, 'content'):
                if isinstance(msg.content, list):
                    for content_block in msg.content:
                        if hasattr(content_block, 'content'):
                            try:
                                tool_result = json.loads(content_block.content)
                                if isinstance(tool_result, dict) and (
                                    tool_result.get('requires_confirmation') or 
                                    tool_result.get('requires_field_confirmation')
                                ):
                                    return tool_result
                            except (json.JSONDecodeError, AttributeError, TypeError):
                                continue
                elif isinstance(msg.content, str):
                    try:
                        tool_result = json.loads(msg.content)
                        if isinstance(tool_result, dict) and (
                            tool_result.get('requires_confirmation') or 
                            tool_result.get('requires_field_confirmation')
                        ):
                            return tool_result
                    except (json.JSONDecodeError, AttributeError, TypeError):
                        continue
        return {}

agent = DatabaseAgent()
# ──────────────────────────────────────────────────────────────────────────────
# Gradio Interface
# ──────────────────────────────────────────────────────────────────────────────

def chat_interface(message, history):
    """Gradio chat interface function"""
    start_time = time.time()
    logger.info("\n\n\n")
    logger.info(f"📥 User message received: '{message[:150]}...' (length: {len(message)})")
    response = agent.process_message(message)
    end_time = time.time()
    
    response_time = end_time - start_time
    response_with_time = f"{response}\n\n⏱️ *Response time: {response_time:.2f}s*"
    logger.info(f"📤 Response generated (time: {response_time:.3f}s, length: {len(response)})")
    return response_with_time

def reset_conversation():
    """Reset the conversation"""
    response = agent.reset()
    logger.info(f"✅ Conversation reset")
    return "", [], response

# Create Gradio app
with gr.Blocks(title="DAO OS - Assistant", theme=gr.themes.Soft()) as demo:
    
    with gr.Row(min_height="300"):
        with gr.Column(scale=3):
            chatbot = gr.ChatInterface(
                fn=chat_interface,
                title="DAO OS - Assistant",
                examples=[
                    "Create a project called Mobile App Development",
                    "List all projects",
                    "Show database statistics",
                    "Create a user named Sarah Connor with email sarah@tech.com",
                    "Show me all tasks assigned to user 1",
                    "Update project 2 status to Completed",
                    "Delete task 5",
                    "List all clients with their contact information",
                    "Create a goal to improve customer satisfaction",
                    "Add a milestone for project 1"
                ],
            )
            # reset_btn = gr.Button("🔄 Reset Chat", variant="secondary", size="sm")
            # # Event handlers
            # reset_btn.click(
            #     fn=reset_conversation,
            #     inputs=[],
            #     outputs=[chatbot.textbox, chatbot.chatbot, gr.Textbox(visible=False)]
            #     )


if __name__ == "__main__":
    print("🗄️ Database connection verified")
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True
    )
