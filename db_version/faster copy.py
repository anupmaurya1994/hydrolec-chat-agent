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
from typing import Dict, Any, List, Optional, Literal, Generator, Iterator
from datetime import datetime, date
from contextlib import contextmanager
from functools import lru_cache
from sqlalchemy import (
    create_engine, Column, Integer, String, Text, Date, DateTime, 
    ForeignKey, func, text, inspect, ARRAY,CheckConstraint,Boolean
)
from sqlalchemy.dialects.postgresql import ARRAY # For PostgreSQL-specific array types
from sqlalchemy.orm import declarative_base, sessionmaker, Session
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
from db_model import Base, User, Client, Goal, Project, Task, Milestone, Asset, MeetingTranscript, Briefing, MODEL_MAP, VALID_STATUS, CreateRecordInput, CreateRecordOutput, ReadRecordInput, ReadRecordOutput, UpdateRecordInput, ListRecordsInput, ListRecordsOutput, DeleteRecordInput, SearchRecordsInput, SearchRecordsOutput
from system_prompt import SYSTEM_PROMPT

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

# Performance Optimization Caches
_TABLE_COLUMNS_CACHE = {}
_SERIALIZATION_CACHE = {}
_VALIDATION_CACHE = {}

def _initialize_caches():
    """Initialize performance optimization caches"""
    global _TABLE_COLUMNS_CACHE, _SERIALIZATION_CACHE, _VALIDATION_CACHE
    
    # Cache table columns for faster serialization
    for table_name, model in MODEL_MAP.items():
        columns = []
        for column in model.__table__.columns:
            col_info = {
                'name': column.name,
                'is_datetime': isinstance(column.type, (DateTime, Date)),
                'is_array': hasattr(column.type, 'item_type') or 'ARRAY' in str(column.type)
            }
            columns.append(col_info)
        _TABLE_COLUMNS_CACHE[table_name] = columns
        
        # Pre-compute array fields for each table
        array_fields = [col['name'] for col in columns if col['is_array']]
        date_fields = [col['name'] for col in columns if col['is_datetime']]
        
        _SERIALIZATION_CACHE[table_name] = {
            'array_fields': set(array_fields),
            'date_fields': set(date_fields),
            'all_columns': [col['name'] for col in columns]
        }
    
    # Cache validation rules for faster lookup
    for table, fields in VALID_STATUS.items():
        _VALIDATION_CACHE[table] = {}
        for field, options in fields.items():
            # Pre-compute lowercase versions for case-insensitive matching
            _VALIDATION_CACHE[table][field] = {
                'options': options,
                'lower_options': [opt.lower() for opt in options],
                'option_map': {opt.lower(): opt for opt in options}
            }

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL")

try:
    start_time = time.time()
    engine = create_engine(
        DATABASE_URL,
        connect_args={"sslmode": "require"}, 
        pool_size=30,  # Increased pool size
        max_overflow=30, 
        pool_timeout=30,
        pool_recycle=3600,
        pool_pre_ping=True, 
        echo=False
    )
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(bind=engine)
    
    # Initialize performance caches after DB connection
    _initialize_caches()
    
    db_init_time = time.time() - start_time
    logger.info(f"✅ Database connection successful! (init_time: {db_init_time:.3f}s)")
    print("✅ Database connection successful!")
except Exception as e:
    logger.error(f"❌ Database error: {e}")
    print(f"❌ Database error: {e}")
    exit(1)

@contextmanager
def get_db_session():
    """Context manager for database sessions with proper cleanup"""
    session = SessionLocal()
    try:
        yield session
    except Exception as e:
        session.rollback()
        logger.error(f"Database session error: {e}")
        raise
    finally:
        session.close()

def get_session():
    """Legacy function - use get_db_session() context manager instead"""
    return SessionLocal()

@lru_cache(maxsize=1000)
def _cached_parse_date_string(date_str: str) -> Optional[datetime]:
    """Cached version of date parsing for better performance"""
    return parse_date_string(date_str)

def serialize_record_optimized(obj, table_name: str):
    """Optimized record serialization using pre-cached column info"""
    if obj is None:
        return None
    
    cache_info = _SERIALIZATION_CACHE.get(table_name)
    if not cache_info:
        # Fallback to original method if cache not available
        return serialize_record(obj)
    
    result = {}
    
    # Use cached column information for faster processing
    for col_name in cache_info['all_columns']:
        value = getattr(obj, col_name, None)
        
        # Fast datetime serialization
        if col_name in cache_info['date_fields'] and isinstance(value, (datetime, date)):
            value = value.isoformat()
        # Fast array serialization  
        elif col_name in cache_info['array_fields'] and isinstance(value, list):
            value = value if value is not None else []
        
        result[col_name] = value
    
    return result

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

def validate_fields_batch(table: str, data: dict) -> dict:
    """Optimized batch validation of all fields at once"""
    validation_issues = {}
    
    # Get cached validation rules
    table_validation = _VALIDATION_CACHE.get(table, {})
    
    for field, value in data.items():
        if not isinstance(value, str) or not value.strip():
            continue
            
        field_validation = table_validation.get(field)
        if not field_validation:
            continue
        
        # Fast exact match
        if value in field_validation['options']:
            continue
        
        # Fast case-insensitive match using pre-computed map
        lower_value = value.lower()
        if lower_value in field_validation['option_map']:
            validation_issues[field] = {
                "valid": False,
                "requires_confirmation": True,
                "suggested_value": field_validation['option_map'][lower_value],
                "user_value": value,
                "message": f"Did you mean '{field_validation['option_map'][lower_value]}' instead of '{value}'?",
                "valid_options": field_validation['options']
            }
        else:
            validation_issues[field] = {
                "valid": False,
                "requires_confirmation": False,
                "message": f"Invalid {field} '{value}' for {table}. Valid options: {', '.join(field_validation['options'])}",
                "valid_options": field_validation['options']
            }
    
    return validation_issues

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

def process_data_fields_optimized(table: str, data: dict) -> dict:
    """Optimized data processing using cached field information"""
    cache_info = _SERIALIZATION_CACHE.get(table, {})
    
    if not cache_info:
        # Fallback to original processing
        return process_data_fields_original(data)
    
    # Fast date field processing
    for date_field in cache_info['date_fields']:
        if date_field in data and isinstance(data[date_field], str):
            data[date_field] = _cached_parse_date_string(data[date_field])
    
    # Fast array field processing
    for array_field in cache_info['array_fields']:
        if array_field in data:
            data[array_field] = parse_array_field(data[array_field])
    
    return data

def process_data_fields_original(data: dict) -> dict:
    """Original data processing method as fallback"""
    # Parse date fields
    date_fields = ['deadline', 'due_date', 'date_completed', 'deadline_display', 'date_completed_display', 'meeting_date']
    for date_field in date_fields:
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
    
    return data

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
    
    with get_db_session() as session:
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
            
            # Optimized data processing
            update_data = process_data_fields_optimized(table, update_data)
            
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
            execution_time = time.time() - start_time
            logger.error(f"Field correction failed: {table}#{record_id} - {str(e)} (time: {execution_time:.3f}s)")
            return {
                "success": False,
                "error": f"Database error: {str(e)}"
            }

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
    
    with get_db_session() as session:
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
            
            # Optimized batch field validation
            validation_issues = validate_fields_batch(table, data)
            if validation_issues:
                # Return the first validation issue that requires confirmation
                for field, validation in validation_issues.items():
                    if validation.get("requires_confirmation"):
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
                    else:
                        return {
                            "success": False,
                            "error": validation["message"]
                        }
            
            # Optimized data processing
            data = process_data_fields_optimized(table, data)
            
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
            execution_time = time.time() - start_time
            logger.error(f"Record creation failed: {table} - {str(e)} (time: {execution_time:.3f}s)")
            return {
                "success": False,
                "error": f"Database error: {str(e)}"
            }

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
    
    with get_db_session() as session:
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
            
            # Optimized data processing
            corrected_data = process_data_fields_optimized(table, corrected_data)
            
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
            execution_time = time.time() - start_time
            logger.error(f"Record creation with corrected field failed: {table} - {str(e)} (time: {execution_time:.3f}s)")
            return {
                "success": False,
                "error": f"Database error: {str(e)}"
            }

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
    
    with get_db_session() as session:
        try:
            logger.info(f"Creating record with empty name: {table}")
            
            model = MODEL_MAP.get(table)
            if not model:
                return {
                    "success": False,
                    "error": f"Invalid table '{table}'. Available: {list(MODEL_MAP.keys())}"
                }
            
            # Optimized data processing
            data = process_data_fields_optimized(table, data)
            
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
            execution_time = time.time() - start_time
            logger.error(f"Record creation with empty name failed: {table} - {str(e)} (time: {execution_time:.3f}s)")
            return {
                "success": False,
                "error": f"Database error: {str(e)}"
            }

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
    
    with get_db_session() as session:
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
                "record": serialize_record_optimized(record, table),
                "message": f"Found {table} record with ID {record_id}"
            }
            
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"Record read failed: {table}#{record_id} - {str(e)} (time: {execution_time:.3f}s)")
            return {
                "success": False,
                "error": f"Database error: {str(e)}"
            }

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
    
    with get_db_session() as session:
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
            
            # Optimized batch field validation
            validation_issues = validate_fields_batch(table, data)
            if validation_issues:
                # Return the first validation issue that requires confirmation
                for field, validation in validation_issues.items():
                    if validation.get("requires_confirmation"):
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
                    else:
                        return {
                            "success": False,
                            "error": validation["message"]
                        }
            
            # Optimized data processing
            data = process_data_fields_optimized(table, data)
            
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
            execution_time = time.time() - start_time
            logger.error(f"Record update failed: {table}#{record_id} - {str(e)} (time: {execution_time:.3f}s)")
            return {
                "success": False,
                "error": f"Database error: {str(e)}"
            }

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
    
    with get_db_session() as session:
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
                "records": [serialize_record_optimized(record, table) for record in records],
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
    
    with get_db_session() as session:
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
            execution_time = time.time() - start_time
            logger.error(f"Record deletion failed: {table}#{record_id} - {str(e)} (time: {execution_time:.3f}s)")
            return {
                "success": False,
                "error": f"Database error: {str(e)}"
            }

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
    
    with get_db_session() as session:
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

# @tool
def search_records_by_name(table: str, name_query: str, limit: int = 10, min_similarity: int = 60) -> dict:
    """
    Search records by name with PostgreSQL's built-in fuzzy matching capabilities.
    
    Description: Finds records with names similar to the query using database-level trigram matching.
    """
    start_time = time.time()
    
    with get_db_session() as session:
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
            
            # Convert similarity percentage to PostgreSQL similarity threshold (0.0 to 1.0)
            pg_similarity = min_similarity / 100.0
            
            # Use PostgreSQL's similarity function for fuzzy matching
            query = session.query(
                model,
                func.similarity(model.name, name_query).label('similarity_score')
            ).filter(
                func.similarity(model.name, name_query) >= pg_similarity
            ).order_by(
                func.similarity(model.name, name_query).desc()
            ).limit(limit)
            
            results_with_scores = query.all()
            
            # If no results with the given threshold, try with a lower threshold for suggestions
            suggestions = []
            if not results_with_scores and min_similarity > 30:
                suggestion_threshold = 0.3  # 30% similarity
                suggestion_query = session.query(
                    model,
                    func.similarity(model.name, name_query).label('similarity_score')
                ).filter(
                    func.similarity(model.name, name_query) >= suggestion_threshold
                ).order_by(
                    func.similarity(model.name, name_query).desc()
                ).limit(5)
                
                suggestion_results = suggestion_query.all()
                suggestions = [
                    {
                        'id': record.id,
                        'name': record.name,
                        'similarity_score': int(score * 100)  # Convert back to percentage
                    }
                    for record, score in suggestion_results
                ]
            
            # Serialize results
            results = []
            for record, similarity_score in results_with_scores:
                record_data = serialize_record_optimized(record, table)
                record_data['similarity_score'] = int(similarity_score * 100)  # Convert to percentage
                results.append(record_data)
            
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

# Initialize OpenAI LLMs
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    print("❌ OPENAI_API_KEY environment variable required")
    exit(1)

# Primary LLM for reasoning and tool usage
llm = ChatOpenAI(
    model="gpt-4o-mini",
    api_key=OPENAI_API_KEY,
    temperature=0,
    streaming=True  # Enable streaming for main LLM
)

# Cheap model for peeking (just to see if tool calls are needed)
peek_llm = ChatOpenAI(
    model="gpt-4.1-nano",
    api_key=OPENAI_API_KEY,
    temperature=0,
    streaming=True # we don’t need streaming for peeking
)
# Add logging for peek_llm creation
# logger.info(f"Peek LLM initialized: {peek_llm.model_name}, streaming={peek_llm.streaming}")

# Fast LLM for final presentation and formatting with streaming
presentation_llm = ChatOpenAI(
    model="gpt-4.1-nano",  # Much faster and cheaper for simple formatting
    api_key=OPENAI_API_KEY,
    temperature=0.1,
    streaming=True  # Enable streaming for presentation LLM
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
peek_model_with_tools = peek_llm.bind_tools(database_tools)

# Presentation system prompt for formatting responses
PRESENTATION_PROMPT = """You are a helpful assistant that formats database operation results for users in a clear, friendly way.

Your job is to take tool execution results and present them in a user-friendly format with:
- Clear success/error messages
- Properly formatted data (tables, lists, etc.)
- Helpful context and next steps
- Appropriate emojis for visual appeal
- Concise but informative responses

Keep responses concise but informative. Focus on clarity and readability.
If there are validation issues or confirmations needed, present them clearly to the user.

***
###Always Remember:
/n
- Always include this at the end of your response for any create, update or delete operation performed:
  "✅ I have successfully done the tasks (list the tasks performed). These changes will be visible in your Notion workspace in 1-2 minutes."***

Do not execute tools or make decisions - only format and present the information provided."""

PEEK_SYSTEM_PROMPT = """
You are an expert AI assistant. Your only job is to analyze the user's message and determine if a database tool/function should be called to fulfill the request, or if a direct natural language response is sufficient.

Below are the available tools and their descriptions:
- **create_record**: Create a new record in a specified table (users, clients, goals, projects, tasks, milestones, assets, briefings, meeting_transcripts) with provided data fields.
- **read_record**: Retrieve a single record by its unique ID from a specified table.
- **update_record**: Update fields of an existing record by its ID in a specified table.
- **list_records**: List multiple records from a table, with optional filters and pagination.
- **delete_record**: Permanently delete a record by its ID from a specified table.
- **get_database_stats**: Get database statistics, including record counts for all tables.
- **search_records_by_name**: Search for records in a table by name using fuzzy matching.
- **get_current_datetime**: Get the current date and time.
- **confirm_create_with_empty_name**: Create a record with an empty or missing name after user confirmation.
- **confirm_create_with_corrected_field**: Create a record using a corrected field value after user confirmation.
- **confirm_field_correction**: Update a record with a corrected field value after user confirmation.

IMPORTANT INSTRUCTIONS:
- Carefully consider the entire conversation history, not just the latest message.
- If there is any chance (even 50% or more) that a tool/database function might be needed to fulfill the user's request, respond with TOOL.
- If you are certain that a direct natural language response is sufficient and no tool/database function is needed, respond with DIRECT.
- Respond with ONLY ONE WORD: either TOOL or DIRECT.
- Do NOT explain your reasoning.
- Do NOT include any extra text, punctuation, or formatting.
- Do NOT call any tools or generate any answers.

**Respond ONLY with:
- "TOOL"- If the user's request requires or might require using any of the above tools
- "DIRECT" - If the user's request can be answered directly in natural language**

Do not call any tools or generate any answers.
"""

# LangGraph nodes
def agent_node(state: MessagesState):
    """Agent decision node - decides whether to use tools or respond directly"""
    response = model_with_tools.invoke(state["messages"])
    # print(f"[LLM RAW RESPONSE] {response}")
    logger.info(f"[LLM RAW RESPONSE] {response}")
    return {"messages": [response]}

def presentation_node(state: MessagesState):
    """Fast presentation node - formats final responses using smaller model with synchronized history"""
    start_time = time.time()
    logger.info("🎨 Presentation layer called - formatting response with faster model")
    
    # Use the SAME messages from state that the main agent has been using
    # This ensures both LLMs are working with identical conversation context
    messages = state["messages"]
    
    # Create presentation prompt while preserving the full conversation context
    # Only modify the system prompt to add presentation instructions
    presentation_messages = []
    
    # Replace or modify system message to include presentation instructions
    for i, msg in enumerate(messages):
        if i == 0 and isinstance(msg, SystemMessage):
            # Combine original system prompt with presentation instructions
            combined_system_content = f"{msg.content}\n\n{PRESENTATION_PROMPT}"
            presentation_messages.append(SystemMessage(content=combined_system_content))
        else:
            presentation_messages.append(msg)
    
    # If no system message exists, add presentation prompt as system message
    if not presentation_messages or not isinstance(presentation_messages[0], SystemMessage):
        presentation_messages.insert(0, SystemMessage(content=PRESENTATION_PROMPT))
    
    try:
        # For non-streaming mode, use regular invoke
        response = presentation_llm.invoke(presentation_messages)
        execution_time = time.time() - start_time
        logger.info(f"🎨 Presentation layer completed (time: {execution_time:.3f}s, model: {presentation_llm.model_name})")
        return {"messages": [response]}
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"🎨 Presentation layer failed (time: {execution_time:.3f}s): {str(e)}")
        
        # Fallback: create a simple formatted response without using the LLM
        fallback_content = "I've completed your database operation. The results have been processed successfully."
        fallback_response = AIMessage(content=fallback_content)
        return {"messages": [fallback_response]}

def stream_presentation_response(messages: List[Any]) -> Generator[str, None, None]:
    """Stream the presentation layer response"""
    start_time = time.time()
    logger.info("🌊 Streaming presentation layer called")
    
    # Create presentation prompt while preserving the full conversation context
    presentation_messages = []
    
    # Replace or modify system message to include presentation instructions
    for i, msg in enumerate(messages):
        if i == 0 and isinstance(msg, SystemMessage):
            # Combine original system prompt with presentation instructions
            combined_system_content = f"{msg.content}\n\n{PRESENTATION_PROMPT}"
            presentation_messages.append(SystemMessage(content=combined_system_content))
        else:
            presentation_messages.append(msg)
    
    # If no system message exists, add presentation prompt as system message
    if not presentation_messages or not isinstance(presentation_messages[0], SystemMessage):
        presentation_messages.insert(0, SystemMessage(content=PRESENTATION_PROMPT))
    
    try:
        # Stream the response
        accumulated_content = ""
        for chunk in presentation_llm.stream(presentation_messages):
            if hasattr(chunk, 'content') and chunk.content:
                accumulated_content += chunk.content
                yield chunk.content
        
        execution_time = time.time() - start_time
        logger.info(f"🌊 Streaming presentation layer completed (time: {execution_time:.3f}s, model: {presentation_llm.model_name})")
        
    except Exception as e:
        execution_time = time.time() - start_time
        logger.error(f"🌊 Streaming presentation layer failed (time: {execution_time:.3f}s): {str(e)}")
        
        # Fallback: yield a simple formatted response
        fallback_content = "I've completed your database operation. The results have been processed successfully."
        yield fallback_content

def should_continue(state: MessagesState):
    """Router function - determines next step based on last message"""
    last_message = state["messages"][-1]
    
    # If AI message has tool calls, go to tools
    if isinstance(last_message, AIMessage) and hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    
    # If no tool calls, end directly (no presentation needed)
    return END

def needs_presentation(state: MessagesState):
    """Determine if the last tool result needs presentation formatting"""
    messages = state["messages"]
    
    # Look for tool messages in recent history (only check last 3 messages for efficiency)
    for msg in reversed(messages[-3:]):
        if hasattr(msg, 'content'):
            content = msg.content
            if isinstance(content, list):
                # Check for tool results in content blocks
                for block in content:
                    if hasattr(block, 'content'):
                        try:
                            tool_data = json.loads(block.content)
                            if isinstance(tool_data, dict) and ('success' in tool_data or 'error' in tool_data):
                                logger.info("🔄 Tool result detected - routing to presentation layer")
                                return "presentation"
                        except:
                            continue
            elif isinstance(content, str):
                # Check for JSON-like tool results
                if (content.strip().startswith('{') and 
                    any(key in content for key in ['success', 'error', 'records', 'message'])):
                    logger.info("🔄 Tool result detected - routing to presentation layer")
                    return "presentation"
    
    # If no tool results found, end without presentation
    logger.info("🔄 No tool results found - skipping presentation layer")
    return END
def agent_decision(messages: List[Any]):
    """
    Use the cheap peek model to decide if tools will be called.
    Returns (ai_message, will_call_tools: bool).
    """
    logger.info("🔍 agent_decision: Peeking with cheap LLM to check for tool calls...")
    peek_messages = [SystemMessage(content=PEEK_SYSTEM_PROMPT)] + messages[1:]  # skip original system prompt
    # provisional = peek_model_with_tools.invoke(peek_messages)
    provisional = peek_llm.invoke(peek_messages)
    decision = provisional.content.strip().upper()
    will_call_tools = decision == "TOOL"
    # print(f"[PEEK LLM RAW RESPONSE] {provisional}")
    # will_call_tools = bool(getattr(provisional, "tool_calls", None))
    # logger.info(f"🔍 agent_decision: will_call_tools={will_call_tools}, tool_calls={getattr(provisional, 'tool_calls', None)}")
    logger.info(f"🔍 agent_decision: will_call_tools={will_call_tools}, decision={decision}")
    print("Peek_llm response - ritesh: ",provisional)
    return provisional, will_call_tools

def stream_direct_agent_reply(messages: List[Any]) -> Generator[str, None, None]:
    """
    Stream the main LLM reply (no tools). We call the LLM again in streaming mode
    to actually stream tokens to the UI.
    """
    logger.info("📝 Streaming direct agent reply (no tools)...")
    accumulated = ""
    # print("response from direct llm:",llm.invoke(messages))
    # for chunk in model_with_tools.stream(messages):
    for chunk in peek_llm.stream(messages):
        # LangChain streams AIMessage chunks; only stream text content
        if hasattr(chunk, "content") and chunk.content:
            accumulated += chunk.content
            # print(chunk)
            yield chunk.content
    logger.info("📝 Finished streaming direct agent reply.")
    # When complete, also push the final message into history
    agent.conversation_history.append(AIMessage(content=accumulated))

# Build the optimized graph
workflow = StateGraph(MessagesState)

# Add nodes
workflow.add_node("agent", agent_node)
workflow.add_node("tools", ToolNode(database_tools))
workflow.add_node("presentation", presentation_node)

# Add edges
workflow.add_edge(START, "agent")

# Agent can only go to tools or end directly (no presentation without tools)
workflow.add_conditional_edges(
    "agent", 
    should_continue, 
    {
        "tools": "tools", 
        END: END
    }
)

# After tools, always go to presentation for formatting
workflow.add_conditional_edges(
    "tools",
    needs_presentation,
    {
        "presentation": "presentation",
        END: END
    }
)

# Presentation always ends
workflow.add_edge("presentation", END)

app = workflow.compile()

# ──────────────────────────────────────────────────────────────────────────────
# Chat Interface
# ──────────────────────────────────────────────────────────────────────────────

class DatabaseAgent:
    def __init__(self):
        self.conversation_history = [SystemMessage(content=SYSTEM_PROMPT)]
        self.pending_confirmation = None
        self.pending_field_confirmation = None
        self.is_streaming = False  # Add streaming flag
        logger.info("DatabaseAgent initialized.")

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
            # Process with optimized LangGraph - pass the SAME conversation history
            result = app.invoke({"messages": self.conversation_history})
            
            # IMPORTANT: Update conversation history with ALL messages from the result
            # This ensures the agent maintains the complete conversation context
            # including both main agent responses and presentation layer responses
            self.conversation_history = result["messages"]
            
            # Truncate history AFTER getting the complete result
            # This ensures both LLMs work with the same base context before truncation
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
            
            # Get the final AI response (should be from presentation node)
            ai_messages = [msg for msg in result["messages"] if isinstance(msg, AIMessage)]
            if ai_messages:
                final_response = ai_messages[-1].content
                return final_response
            else:
                return "❌ No response generated. Please try rephrasing your request."
                
        except Exception as e:
            # Remove failed user message from history
            if self.conversation_history and isinstance(self.conversation_history[-1], HumanMessage):
                self.conversation_history.pop()
            
            return f"❌ Error processing request: {str(e)}\n\n💡 Try rephrasing your request or use simpler terms."
    
    def stream_response(self, user_input: str) -> Generator[str, None, None]:
        """Stream the response for a user message"""
        logger.info(f"🌊 stream_response called with user_input: {user_input[:100]!r}")
        if not user_input.strip():
            yield "Please provide a message or command."
            return
        
        # Handle special commands
        if user_input.lower() in ["/reset", "/clear", "reset"]:
            yield self.reset()
            return
        
        # Handle pending confirmations (non-streaming)
        if self.pending_field_confirmation or self.pending_confirmation:
            yield self.process_message(user_input)
            return
        
        # Set streaming flag to prevent duplicate presentation layer calls
        self.is_streaming = True
        
        # Add user message
        self.conversation_history.append(HumanMessage(content=user_input))

        try:
            # 1) Peek: does the agent intend to call tools?
            logger.info("🌊 stream_response: Calling agent_decision to peek for tool calls...")
            provisional_ai, will_call_tools = agent_decision(self.conversation_history)

            if will_call_tools:
                logger.info("🌊 stream_response: Tools will be called, using tool workflow (no streaming main LLM).")
                # --- TOOLS PATH (unchanged): do NOT stream the main LLM text ---
                # Use your existing streaming workflow that skips presentation
                streaming_result = app_streaming.invoke({"messages": self.conversation_history})

                # Update conversation history with tool results only
                self.conversation_history = streaming_result["messages"]

                # Handle confirmations if any (unchanged)
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
                    yield f"⚠️ {tool_result['message']}\n\nPlease respond with 'yes' to use the corrected value or 'no' to cancel."
                    return

                if tool_result.get('requires_confirmation'):
                    self.pending_confirmation = {
                        'table': tool_result['pending_table'],
                        'data': tool_result['pending_data']
                    }
                    yield f"⚠️ {tool_result['message']}\n\nPlease respond with 'yes' to proceed or 'no' to cancel."
                    return

                # If we need presentation for tool results, stream it
                if self._needs_presentation_streaming(self.conversation_history):
                    accumulated_response = ""
                    for chunk in stream_presentation_response(self.conversation_history):
                        accumulated_response += chunk
                        yield chunk
                    # Add the complete streamed response to conversation history
                    self.conversation_history.append(AIMessage(content=accumulated_response))
                else:
                    # Fallback non-stream text if nothing to present (rare)
                    ai_messages = [m for m in self.conversation_history if isinstance(m, AIMessage)]
                    if ai_messages:
                        yield ai_messages[-1].content
                    else:
                        yield "❌ No response generated. Please try rephrasing your request."

                # Truncate history after processing
                self._truncate_history()
                return

            else:
                logger.info("🌊 stream_response: No tools will be called, streaming main LLM reply directly.")
                # --- NO-TOOLS PATH: stream the main LLM directly ---
                accumulated_response = ""
                for token in stream_direct_agent_reply(self.conversation_history):
                    accumulated_response += token
                    yield token

                # Truncate after we add the final streamed AI message in stream_direct_agent_reply
                self._truncate_history()
                return

        except Exception as e:
            # Rollback last user message on error
            if self.conversation_history and isinstance(self.conversation_history[-1], HumanMessage):
                self.conversation_history.pop()
            yield f"❌ Error processing request: {str(e)}\n\n💡 Try rephrasing your request or use simpler terms."
        finally:
            self.is_streaming = False
    
    def _needs_presentation_streaming(self, messages: List[Any]) -> bool:
        """Determine if the last tool result needs presentation streaming"""
        for msg in reversed(messages[-3:]):  # Check last 3 messages
            if hasattr(msg, 'content'):
                content = msg.content
                if isinstance(content, list):
                    # Check for tool results in content blocks
                    for block in content:
                        if hasattr(block, 'content'):
                            try:
                                tool_data = json.loads(block.content)
                                if isinstance(tool_data, dict) and ('success' in tool_data or 'error' in tool_data):
                                    return True
                            except:
                                continue
                elif isinstance(content, str):
                    # Check for JSON-like tool results
                    if (content.strip().startswith('{') and 
                        any(key in content for key in ['success', 'error', 'records', 'message'])):
                        return True
        return False
    
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

# Create a separate workflow for streaming that skips presentation layer
def needs_presentation_streaming(state: MessagesState):
    """For streaming workflow - always skip presentation layer"""
    return END

# Build the streaming-optimized graph (no presentation layer)
workflow_streaming = StateGraph(MessagesState)

# Add nodes (no presentation node for streaming)
workflow_streaming.add_node("agent", agent_node)
workflow_streaming.add_node("tools", ToolNode(database_tools))

# Add edges for streaming workflow
workflow_streaming.add_edge(START, "agent")

# Agent can only go to tools or end directly
workflow_streaming.add_conditional_edges(
    "agent", 
    should_continue, 
    {
        "tools": "tools", 
        END: END
    }
)

# After tools, always end (no presentation layer)
workflow_streaming.add_edge("tools", END)

# Compile both workflows
app = workflow.compile()  # Original workflow with presentation layer
app_streaming = workflow_streaming.compile()  # Streaming workflow without presentation layer

# ──────────────────────────────────────────────────────────────────────────────
# Gradio Interface
# ──────────────────────────────────────────────────────────────────────────────

def chat_interface_streaming(message, history):
    """Gradio chat interface function with streaming"""
    start_time = time.time()
    logger.info("\n\n\n")
    logger.info(f"🌊 User message received (streaming): '{message[:150]}...' (length: {len(message)})")
    
    accumulated_response = ""
    for chunk in agent.stream_response(message):
        accumulated_response += chunk
        yield accumulated_response
    
    end_time = time.time()
    response_time = end_time - start_time
    # final_response = f"{accumulated_response}\n\n⏱️ *Response  time: {response_time:.2f}s*"
    
    logger.info(f"🌊 Streaming response completed (time: {response_time:.3f}s, length: {len(accumulated_response)})")
    # yield final_response
    yield accumulated_response

def chat_interface(message, history):
    """Gradio chat interface function (fallback non-streaming)"""
    start_time = time.time()
    logger.info("\n\n\n")
    logger.info(f"📥 User message received: '{message[:150]}...' (length: {len(message)})")
    response = agent.process_message(message)
    end_time = time.time()
    
    response_time = end_time - start_time
    response_with_time = f"{response}\n\n⏱️ *Response time: {response_time:.2f}s*"
    logger.info(f"📤 Response generated (time: {response_time:.3f}s, length: {len(response)})")
    return response_with_time
    # return response

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
                fn=chat_interface_streaming,  # Use streaming version
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
            reset_btn = gr.Button("🔄 Reset Chat", variant="secondary", size="sm")
            # Event handlers
            reset_btn.click(
                fn=reset_conversation,
                inputs=[],
                outputs=[chatbot.textbox, chatbot.chatbot, gr.Textbox(visible=False)]
                )

if __name__ == "__main__":
    print("🗄️ Database connection verified")
    demo.launch(
        server_name="0.0.0.0",
        server_port=7862,
        share=False,
        show_error=True
    )
