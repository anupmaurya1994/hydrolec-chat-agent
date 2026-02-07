"""
app_gradio.py
Gradio web interface for a LangGraph agent that can query and modify a Notion database

Features
- Web chat interface with conversation history
- Notion Query Database tool with pagination + property normalization
- Create, update, and list pages in databases
- System prompt with your workspace schema so the model knows IDs & properties
- Conditional-edge routing fixed ("end": END) to avoid __end__ KeyError
- Optional streaming prints node updates (toggle STREAM_UPDATES)

Environment:
  NOTION_TOKEN=secret_...
  OPENAI_API_KEY=sk-...

Run:
  python app_gradio.py
"""
from timeit import default_timer as timer
import os
import sys
from typing import Any, Dict, List, Optional
import logging
from datetime import datetime

from dotenv import load_dotenv
load_dotenv()

import gradio as gr

# ── Notion client (official Python SDK) ────────────────────────────────────────
from notion_client import Client as NotionClient

# ── LangGraph / LangChain imports ─────────────────────────────────────────────
from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode
# from langchain_anthropic import ChatAnthropic
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage

# ──────────────────────────────────────────────────────────────────────────────
# Logging Configuration
# ──────────────────────────────────────────────────────────────────────────────
# Create logs directory if it doesn't exist
log_dir = "logs"
if not os.path.exists(log_dir):
    os.makedirs(log_dir)

# Setup logger
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | %(message)s',
    handlers=[
        logging.FileHandler(f'{log_dir}/api_calls_{datetime.now().strftime("%Y%m%d")}.log'),
        # Remove logging.StreamHandler() to avoid duplicate logs and HTTP logs from other libraries
    ]
)
logger = logging.getLogger(__name__)

# Suppress HTTP logs from urllib3 and requests (which Gradio and Notion SDK use)
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("requests").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
logging.getLogger("http.client").setLevel(logging.WARNING)
logging.getLogger("gradio").setLevel(logging.WARNING)

# ──────────────────────────────────────────────────────────────────────────────
# Configuration
# ──────────────────────────────────────────────────────────────────────────────
NOTION_TOKEN = os.getenv("NOTION_TOKEN")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
# ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
notion = NotionClient(auth=NOTION_TOKEN)

# Choose any ChatOpenAI model that supports tool calling

# model = "gpt-3.5-turbo" 
model = "gpt-4o"

llm = ChatOpenAI(model=model, api_key=OPENAI_API_KEY, temperature=0)
# llm = ChatAnthropic(model=model, api_key=ANTHROPIC_API_KEY, temperature=0)
# Toggle this if you want to see per-node streaming updates
STREAM_UPDATES = True
 
# ──────────────────────────────────────────────────────────────────────────────
# Your Notion Workspace Schema (used in the system prompt)
# ──────────────────────────────────────────────────────────────────────────────
DB = {
    "Projects":  "23c65a04-5ba4-808e-b0d2-f2afe3038a5d",
    "Tasks":     "23c65a04-5ba4-80dc-8eb9-f40fa7d18a19",
    "Clients":   "23c65a04-5ba4-801f-8c8f-c71773634e04",
    "Goals":     "23c65a04-5ba4-8013-833b-e6f8621299b5",
    "Milestones":"23c65a04-5ba4-80aa-9b3a-d66540233727",
}

SYSTEM_CONTEXT = f"""
You are a Notion data agent. You can fetch, create, update, and manage rows in Notion databases using the following tools:

1. `fetch_notion_db_pages` - Query and retrieve data from databases
2. `create_notion_page` - Create new pages in databases  
3. `update_notion_page` - Update existing pages
4. `list_notion_pages` - List pages from a database with basic info
5. `get_database_properties` - Get schema/properties of a database
6. `list_available_databases` - List all available databases configured in this workspace
7. `search_users_by_name` - Search for users by name to get their IDs for filtering
8. `search_pages_by_title` - Search for pages by title/name in a specific database

Database IDs:
- Projects:   {DB["Projects"]}
- Tasks:      {DB["Tasks"]}
- Clients:    {DB["Clients"]}
- Goals:      {DB["Goals"]}
- Milestones: {DB["Milestones"]}

**IMPORTANT: If you get a database access error:**
1. First try using `list_available_databases` to verify the database is accessible
2. Then use `search_pages_by_title` to find the specific page/task
3. Use `get_database_properties` to understand what properties can be updated
4. Always use the exact database IDs provided above - they are correct and you have access

- **IMPORTANT: For people properties filtering:**
  - When user asks to filter by person name (e.g., "projects assigned to John Doe"), first use `search_users_by_name` to find the user ID
  - Then use the user ID in the filter: 
  {{
    "property": "PropertyName",
    "people": {{"contains": "user_id_here"}}
  }}
  - If no user found, inform the user and suggest they check the exact name

- **IMPORTANT: For relation properties (linking pages):**
  - When user asks to link pages (e.g., "link client X to project Y"), first:
    1. Use `search_pages_by_title` to find the client page ID in the Clients database
    2. Use `search_pages_by_title` to find the project page ID in the Projects database
    3. Then update the project (or whichever page has the relation property) with the relation
  - For relation properties, format as: {{"relation": [{{"id": "page_id"}}]}} 
  - You can link multiple pages by including multiple IDs in the array

- **IMPORTANT: When updating a task or page:**
  1. First use `search_pages_by_title` with the Tasks database ID to find the task
  2. Get the page_id from the search results
  3. Use `get_database_properties` to see what properties are available
  4. When user asks to "update all properties" or similar, set reasonable values:
     - Status: "In progress" or "Todo" 
     - Priority: "Medium" or "High"
     - Due dates: Set to reasonable future dates (e.g., 2-4 weeks from today)
     - Descriptions: Add meaningful content based on the task name
     - Only update properties that exist and are not computed (rollup/formula)

General guidance:
- If the user says a database name ("Projects", "Tasks", etc.), pass the correct `database_id` from the mapping above.
- Use `list_available_databases` to get the latest database info if they change or are inaccessible.
- Use Notion's query filter/sorts schema when needed. For example, to filter
  Status equals "In progress", build:
  {{
    "property": "Status",
    "status": {{"equals": "In progress"}}
  }}
- For creating/updating pages, format properties according to Notion's schema:
  - title: {{"title": [{{"text": {{"content": "value"}}}}]}} 
  - rich_text: {{"rich_text": [{{"text": {{"content": "value"}}}}]}} 
  - select: {{"select": {{"name": "value"}}}} 
  - status: {{"status": {{"name": "value"}}}} 
  - number: {{"number": 123}} 
  - date: {{"date": {{"start": "2024-01-01"}}}} 
  - people: {{"people": [{{"id": "user_id"}}]}} 
  - relation: {{"relation": [{{"id": "page_id"}}]}} 
  - url: {{"url": "https://example.com"}}
  - email: {{"email": "user@example.com"}}
  - phone_number: {{"phone_number": "+1234567890"}}
- NEVER try to set rollup or formula properties - they are computed automatically
- When filtering by status, use exact status names (case-sensitive)
- For relations, you need the actual page IDs to link items
- If the user says "show fields A, B, C", fetch full rows and then display only those fields
- Limit large outputs; if user doesn't specify, return first 10 rows
- When creating or updating, always confirm the action was successful and show the page ID

Return concise, tabular summaries when appropriate. Handle rollup and formula fields gracefully by displaying their computed values.
"""

# ──────────────────────────────────────────────────────────────────────────────
# Utilities to normalize Notion property values → Python primitives
# ──────────────────────────────────────────────────────────────────────────────
def _rich_text_to_str(rich_text: List[Dict[str, Any]]) -> str:
    return "".join([span.get("plain_text", "") for span in (rich_text or [])])

def _prop_value_to_python(prop: Dict[str, Any]) -> Any:
    """Convert a single Notion property object to a simple Python value."""
    t = prop.get("type")
    if t == "title":
        return _rich_text_to_str(prop.get("title", []))
    if t == "rich_text":
        return _rich_text_to_str(prop.get("rich_text", []))
    if t == "select":
        val = prop.get("select")
        return val["name"] if val else None
    if t == "status":
        val = prop.get("status")
        return val["name"] if val else None
    if t == "multi_select":
        vals = prop.get("multi_select", [])
        return [v.get("name") for v in vals]
    if t == "number":
        return prop.get("number")
    if t == "date":
        d = prop.get("date")
        return d.get("start") if d else None
    if t == "people":
        ppl = prop.get("people", [])
        # Names are best-effort; may be None depending on permissions
        return [p.get("name") or p.get("id") for p in ppl]
    if t == "url":
        return prop.get("url")
    if t == "email":
        return prop.get("email")
    if t == "phone_number":
        return prop.get("phone_number")
    if t == "relation":
        rel = prop.get("relation", [])
        return [r.get("id") for r in rel]
    if t == "rollup":
        # Handle rollup properties - return the computed value
        rollup = prop.get("rollup", {})
        rollup_type = rollup.get("type")
        if rollup_type == "number":
            return rollup.get("number")
        elif rollup_type == "array":
            array_vals = rollup.get("array", [])
            return [_prop_value_to_python({"type": item.get("type"), item.get("type"): item.get(item.get("type"))}) for item in array_vals if item.get("type")]
        else:
            return rollup.get(rollup_type) if rollup_type else None
    if t == "formula":
        # Handle formula properties - return the computed value
        formula = prop.get("formula", {})
        formula_type = formula.get("type")
        if formula_type in ["string", "number", "boolean", "date"]:
            return formula.get(formula_type)
        else:
            return str(formula) if formula else None
    # Fallback to raw storage of the type value if unknown
    return prop.get(t, None)

def _page_to_row(page: Dict[str, Any]) -> Dict[str, Any]:
    props = page.get("properties", {})
    parsed = {name: _prop_value_to_python(value) for name, value in props.items()}
    parsed["_page_id"] = page.get("id")
    parsed["_created_time"] = page.get("created_time")
    parsed["_last_edited_time"] = page.get("last_edited_time")
    return parsed

# ──────────────────────────────────────────────────────────────────────────────
# CRUD Operations (integrated from notion_updater.py)
# ──────────────────────────────────────────────────────────────────────────────
def create_notion_page(database_id: str, properties: Dict[str, Any]) -> Dict[str, Any]:
    """Create a new page in the specified database."""
    start_time = timer()
    try:
        response = notion.pages.create(
            parent={"database_id": database_id},
            properties=properties
        )
        duration = timer() - start_time
        logger.info(f"NOTION_API | create_notion_page | {duration:.3f}s | SUCCESS")
        return {
            "success": True,
            "page_id": response["id"],
            "url": response.get("url", ""),
            "message": "Page created successfully"
        }
    except Exception as e:
        duration = timer() - start_time
        logger.error(f"NOTION_API | create_notion_page | {duration:.3f}s | ERROR: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Error creating page: {e}"
        }

def update_notion_page(page_id: str, properties: Dict[str, Any]) -> Dict[str, Any]:
    """Update an existing page with new properties."""
    start_time = timer()
    try:
        response = notion.pages.update(
            page_id=page_id,
            properties=properties
        )
        duration = timer() - start_time
        logger.info(f"NOTION_API | update_notion_page | {duration:.3f}s | SUCCESS")
        return {
            "success": True,
            "page_id": page_id,
            "url": response.get("url", ""),
            "message": "Page updated successfully"
        }
    except Exception as e:
        duration = timer() - start_time
        logger.error(f"NOTION_API | update_notion_page | {duration:.3f}s | ERROR: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Error updating page: {e}"
        }

def list_notion_pages(database_id: str, limit: int = 10) -> Dict[str, Any]:
    """List pages from a database with basic information."""
    start_time = timer()
    try:
        response = notion.databases.query(
            database_id=database_id,
            page_size=min(limit, 100) #change max page size when needed
        )
        pages = response["results"]
        
        page_list = []
        for page in pages:
            page_info = {
                "page_id": page["id"],
                "created_time": page.get("created_time"),
                "last_edited_time": page.get("last_edited_time"),
                "url": page.get("url", "")
            }
            
            # Try to get title/name
            properties = page.get("properties", {})
            for prop_name, prop_value in properties.items():
                if prop_value.get("type") == "title":
                    title_list = prop_value.get("title", [])
                    if title_list:
                        page_info["title"] = title_list[0].get("text", {}).get("content", "Untitled")
                        break
            else:
                page_info["title"] = "Untitled"
            
            page_list.append(page_info)
        
        duration = timer() - start_time
        logger.info(f"NOTION_API | list_notion_pages | {duration:.3f}s | SUCCESS | Records: {len(page_list)}")
        return {
            "success": True,
            "count": len(page_list),
            "pages": page_list,
            "has_more": response.get("has_more", False)
        }
    except Exception as e:
        duration = timer() - start_time
        logger.error(f"NOTION_API | list_notion_pages | {duration:.3f}s | ERROR: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Error listing pages: {e}"
        }

def get_database_properties(database_id: str) -> Dict[str, Any]:
    """Get the schema/properties of a database."""
    start_time = timer()
    try:
        response = notion.databases.retrieve(database_id=database_id)
        properties = response["properties"]
        
        # Simplify property information for the AI
        simplified_props = {}
        for prop_name, prop_info in properties.items():
            prop_type = prop_info["type"]
            prop_data = {"type": prop_type}
            
            # Add options for select/status properties
            if prop_type == "select":
                options = prop_info.get("select", {}).get("options", [])
                prop_data["options"] = [opt["name"] for opt in options]
            elif prop_type == "status":
                options = prop_info.get("status", {}).get("options", [])
                prop_data["options"] = [opt["name"] for opt in options]
            elif prop_type == "rollup":
                prop_data["note"] = "Computed field - cannot be set directly"
            elif prop_type == "formula":
                prop_data["note"] = "Computed field - cannot be set directly"
            elif prop_type == "relation":
                relation_db = prop_info.get("relation", {}).get("database_id")
                if relation_db:
                    # Try to identify which database this relates to
                    for db_name, db_id in DB.items():
                        if db_id == relation_db:
                            prop_data["relates_to"] = db_name
                            break
            
            simplified_props[prop_name] = prop_data
        
        duration = timer() - start_time
        logger.info(f"NOTION_API | get_database_properties | {duration:.3f}s | SUCCESS")
        return {
            "success": True,
            "database_id": database_id,
            "title": response.get("title", [{}])[0].get("text", {}).get("content", "Unknown"),
            "properties": simplified_props
        }
    except Exception as e:
        duration = timer() - start_time
        logger.error(f"NOTION_API | get_database_properties | {duration:.3f}s | ERROR: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Error getting database properties: {e}"
        }

def list_available_databases() -> Dict[str, Any]:
    """List all available databases that are configured in this workspace."""
    start_time = timer()
    try:
        databases = []
        for name, db_id in DB.items():
            try:
                # Try to get database info to verify it's accessible
                response = notion.databases.retrieve(database_id=db_id)
                title = response.get("title", [{}])[0].get("text", {}).get("content", name)
                databases.append({
                    "name": name,
                    "database_id": db_id,
                    "title": title,
                    "created_time": response.get("created_time"),
                    "last_edited_time": response.get("last_edited_time")
                })
            except Exception as e:
                # Database might not be accessible, but still list it
                databases.append({
                    "name": name,
                    "database_id": db_id,
                    "title": name,
                    "error": f"Not accessible: {str(e)}"
                })
        
        duration = timer() - start_time
        logger.info(f"NOTION_API | list_available_databases | {duration:.3f}s | SUCCESS | Count: {len(databases)}")
        return {
            "success": True,
            "count": len(databases),
            "databases": databases
        }
    except Exception as e:
        duration = timer() - start_time
        logger.error(f"NOTION_API | list_available_databases | {duration:.3f}s | ERROR: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Error listing databases: {e}"
        }

def search_users_by_name(name: str) -> Dict[str, Any]:
    """Search for users by name to get their IDs for filtering."""
    start_time = timer()
    try:
        users_found = []
        
        # Search through all configured databases to find users
        for db_name, db_id in DB.items():
            try:
                response = notion.databases.query(database_id=db_id, page_size=100)
                pages = response.get("results", [])
                
                for page in pages:
                    properties = page.get("properties", {})
                    for prop_name, prop_value in properties.items():
                        if prop_value.get("type") == "people":
                            people = prop_value.get("people", [])
                            for person in people:
                                person_name = person.get("name", "")
                                person_id = person.get("id", "")
                                
                                # Check if name matches (case-insensitive partial match)
                                if name.lower() in person_name.lower():
                                    user_info = {
                                        "id": person_id,
                                        "name": person_name,
                                        "found_in_database": db_name,
                                        "found_in_property": prop_name
                                    }
                                    # Avoid duplicates
                                    if not any(u["id"] == person_id for u in users_found):
                                        users_found.append(user_info)
            except Exception:
                continue  # Skip databases that can't be accessed
        
        duration = timer() - start_time
        logger.info(f"NOTION_API | search_users_by_name | {duration:.3f}s | SUCCESS | Found: {len(users_found)}")
        return {
            "success": True,
            "query": name,
            "users_found": users_found,
            "count": len(users_found)
        }
    except Exception as e:
        duration = timer() - start_time
        logger.error(f"NOTION_API | search_users_by_name | {duration:.3f}s | ERROR: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Error searching for users: {e}"
        }

def search_pages_by_title(database_id: str, title: str) -> Dict[str, Any]:
    """Search for pages by title/name in a specific database."""
    start_time = timer()
    try:
        # Query the database to find pages with matching titles
        response = notion.databases.query(
            database_id=database_id,
            page_size=100
        )
        
        pages_found = []
        for page in response.get("results", []):
            # Get the title property
            properties = page.get("properties", {})
            for prop_name, prop_value in properties.items():
                if prop_value.get("type") == "title":
                    title_list = prop_value.get("title", [])
                    if title_list:
                        page_title = title_list[0].get("text", {}).get("content", "")
                        # Case-insensitive partial match
                        if title.lower() in page_title.lower():
                            pages_found.append({
                                "id": page["id"],
                                "title": page_title,
                                "url": page.get("url", ""),
                                "created_time": page.get("created_time"),
                                "last_edited_time": page.get("last_edited_time")
                            })
                    break
        
        duration = timer() - start_time
        logger.info(f"NOTION_API | search_pages_by_title | {duration:.3f}s | SUCCESS | Found: {len(pages_found)}")
        return {
            "success": True,
            "query": title,
            "database_id": database_id,
            "pages_found": pages_found,
            "count": len(pages_found)
        }
    except Exception as e:
        duration = timer() - start_time
        logger.error(f"NOTION_API | search_pages_by_title | {duration:.3f}s | ERROR: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Error searching for pages: {e}"
        }

# ──────────────────────────────────────────────────────────────────────────────
# Tool: fetch Notion database pages (with pagination)
# ──────────────────────────────────────────────────────────────────────────────
def fetch_notion_db_pages(
    database_id: str,
    filter: Optional[Dict[str, Any]] = None,
    sorts: Optional[List[Dict[str, Any]]] = None,
    page_size: int = 100,
    max_pages: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Query a Notion database and return normalized rows.

    Args:
        database_id: The Notion database ID (e.g., "23c65a04-...").
        filter: Optional Notion filter JSON (see Notion docs).
        sorts: Optional Notion sorts JSON (list of { "property": ..., "direction": ... }).
        page_size: Page size for each Notion API request (max 100).
        max_pages: Optional limit on the number of pages of results to fetch.

    Returns:
        dict with:
            - count: number of normalized rows
            - rows: list of dicts (normalized properties + _page_id, timestamps)
            - has_more: whether more results exist beyond next_cursor
            - next_cursor: cursor to continue from
    """
    start_time = timer()
    all_pages: List[Dict[str, Any]] = []
    cursor = None
    pages_fetched = 0

    while True:
        payload: Dict[str, Any] = {"database_id": database_id, "page_size": page_size}
        if filter:
            payload["filter"] = filter
        if sorts:
            payload["sorts"] = sorts
        if cursor:
            payload["start_cursor"] = cursor

        resp = notion.databases.query(**payload)
        results = resp.get("results", [])
        all_pages.extend(results)

        cursor = resp.get("next_cursor")
        has_more = resp.get("has_more", False)
        pages_fetched += 1

        if not has_more:
            break
        if max_pages is not None and pages_fetched >= max_pages:
            break

    rows = [_page_to_row(p) for p in all_pages]
    duration = timer() - start_time
    logger.info(f"NOTION_API | fetch_notion_db_pages | {duration:.3f}s | SUCCESS | Records: {len(rows)}")
    return {
        "count": len(rows),
        "rows": rows,
        "has_more": cursor is not None,
        "next_cursor": cursor,
    }

# ──────────────────────────────────────────────────────────────────────────────
# LangGraph: AI agent with all tools
# ──────────────────────────────────────────────────────────────────────────────
# Bind all tools to the model
all_tools = [
    fetch_notion_db_pages,
    create_notion_page,
    update_notion_page,
    list_notion_pages,
    get_database_properties,
    list_available_databases,
    search_users_by_name,
    search_pages_by_title
]

model_with_tools = llm.bind_tools(all_tools)

def call_model(state: MessagesState):
    """Model node: let the LLM decide whether to call tools."""
    start_time = timer()
    response = model_with_tools.invoke(state["messages"])
    duration = timer() - start_time
    
    # Check if the response has tool calls
    has_tool_calls = hasattr(response, "tool_calls") and bool(response.tool_calls)
    logger.info(f"LLM | call_model | {duration:.3f}s | Model: {model} | Tool calls: {has_tool_calls}")
    
    return {"messages": [response]}

def should_continue(state: MessagesState):
    """
    Router: if last AI message requested a tool, go to tools; else end.
    Returning string labels and mapping "end": END avoids the __end__ KeyError.
    """
    last = state["messages"][-1]
    if isinstance(last, AIMessage) and getattr(last, "tool_calls", None):
        return "tools"
    return "end"

# Build the graph
graph = StateGraph(MessagesState)
graph.add_node("agent", call_model)
graph.add_node("tools", ToolNode(all_tools))
graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", should_continue, {"tools": "tools", "end": END})
graph.add_edge("tools", "agent")
app = graph.compile()

# ──────────────────────────────────────────────────────────────────────────────
# Gradio Chat Interface
# ──────────────────────────────────────────────────────────────────────────────
class NotionChatBot:
    def __init__(self):
        self.messages: List[Any] = [SystemMessage(content=SYSTEM_CONTEXT)]
    
    def reset_conversation(self):
        """Reset the conversation history"""
        self.messages = [SystemMessage(content=SYSTEM_CONTEXT)]
        return "Conversation reset."
    
    def chat(self, message: str, history: List[List[str]]) -> str:
        """Process a chat message and return the response"""
        if not message.strip():
            return "Please enter a message."
        
        # Log user prompt
        logger.info(f"USER_PROMPT | Message: {message[:100]}{'...' if len(message) > 100 else ''} \n")
        
        # Handle special commands
        if message.lower() in ("/reset", "/clear"):
            self.reset_conversation()
            return "Conversation reset. You can start a new conversation."
        
        # Add user message to conversation
        self.messages.append(HumanMessage(content=message))
        
        # Timing starts here
        start_time = timer()
        ttfu_time = None
        
        try:
            if STREAM_UPDATES:
                # Show node-by-node updates and capture time-to-first-update
                final_state: Optional[Dict[str, Any]] = None
                updates_log = []
                
                for update in app.stream({"messages": self.messages}, stream_mode="updates"):
                    if ttfu_time is None:
                        ttfu_time = timer() - start_time
                    for node, state_piece in update.items():
                        if node == "__end__":
                            continue
                        updates_log.append(f"[update] node={node}")
                        final_state = state_piece
                
                if final_state is None:
                    final_state = app.invoke({"messages": self.messages})
                out = final_state
            else:
                out = app.invoke({"messages": self.messages})
        
        except Exception as e:
            elapsed = timer() - start_time
            error_msg = f"Encountered an error after {elapsed:.2f}s: {str(e)}"
            logger.error(f"CHAT_ERROR | {error_msg}")
            # Don't advance message history on failure
            self.messages.pop()  # Remove the failed user message
            return error_msg
        
        elapsed = timer() - start_time
        
        # Update conversation state
        self.messages = out["messages"]
        
        # Get the final AI response
        final_ai_msgs = [m for m in self.messages if isinstance(m, AIMessage)]
        if final_ai_msgs:
            response = final_ai_msgs[-1].content
        else:
            response = "(no AI message produced)"
        
        # Log total response time
        logger.info(f"CHAT_COMPLETE | Total response time: {elapsed:.3f}s | Response length: {len(response)} chars \n")
        
        # Add timing information
        timing_info = f"\n\n---\n⏱️ Response time: {elapsed:.2f}s"
        if STREAM_UPDATES and ttfu_time is not None:
            timing_info += f" | Time to first update: {ttfu_time:.2f}s"
        
        # Log the interaction
        # try:
        #     with open(f"test logs/{model} test log.txt", "a", encoding="utf-8") as f:
        #         f.write(f"User query: {message}\nModel: {model}\nResponse length: {len(response)}\nResponse time: {elapsed:.2f}\n\n\n")
        # except Exception:
        #     pass  # Ignore logging errors
        
        return response + timing_info

# Initialize the chatbot
chatbot = NotionChatBot()

def create_gradio_interface():
    """Create and configure the Gradio interface"""
    
    with gr.Blocks(title="Notion Agent Chat", theme=gr.themes.Soft()) as demo:
        gr.Markdown("""
        # 🗃️ Notion Agent Chat
        """)
        
        # Status row with model info and reset button
        with gr.Row():
            with gr.Column(scale=2):
                gr.Markdown(f"**🤖 Model:** {model} | **📊 Databases:** {len(DB)} configured")
            with gr.Column(scale=1):
                reset_btn = gr.Button("🔄 Reset Chat", variant="secondary")
        
        # Main chat interface
        chatinterface = gr.ChatInterface(
            fn=chatbot.chat,
            examples=[
                "📋 List all projects",
                "✅ Show me completed tasks", 
                "🔍 Find tasks assigned to me",
                "➕ Create a new project called 'Website Redesign'",
                "🗂️ What databases are available?",
                "📊 Show the Tasks database schema",
                "🎯 Show all goals for this quarter",
                "👥 List all clients",
                "⏰ Show overdue tasks",
                "📈 Create a milestone for project completion"
            ],
            title="💬 Chat with your Notion data",
            description="Ask me anything about your databases - I can query, create, and update your Notion pages!"
        )
        
        # Help section
        with gr.Accordion("💡 Quick Help & Tips", open=False):
            gr.Markdown(f"""
            ### 🛠️ What I can do:
            - **📖 Query data:** "Show all active projects", "Find tasks due today"
            - **➕ Create pages:** "Create a new task called 'Review docs'"  
            - **✏️ Update pages:** "Mark task [ID] as completed"
            - **📊 Get info:** "What databases exist?", "Show Tasks schema"
            
            ### 🗂️ Available Databases:
            {chr(10).join([f" - **{name}**" for name in DB.keys()])}
            
            ### 💡 Tips:
            - Be specific about which database you want to work with
            - Use exact status names when filtering (case-sensitive)
            - I'll show you page IDs when creating/updating for future reference
            - Type `/reset` or `/clear` in chat to restart the conversation
            
            ### 🔧 Current Setup:
            - **Model:** {model}
            - **Streaming:** {'Enabled' if STREAM_UPDATES else 'Disabled'}
            - **Databases configured:** {len(DB)}
            """)
        
        # Reset functionality
        def reset_chat():
            chatbot.reset_conversation()
            return gr.update(value=[]), "✅ Chat history cleared! You can start a new conversation."
        
        # Connect reset button - try to access the chatbot component
        def reset_and_clear():
            chatbot.reset_conversation()
            return None
        
        reset_btn.click(
            fn=reset_and_clear,
            outputs=None
        )
    
    return demo

def main():
    """Main function to launch the Gradio interface"""
    # Check environment variables
    if not NOTION_TOKEN:
        print("❌ NOTION_TOKEN environment variable is required")
        sys.exit(1)
    
    if not OPENAI_API_KEY:
        print("❌ OPENAI_API_KEY environment variable is required")
        sys.exit(1)
    
    print(f"🚀 Starting Notion Agent Chat with model: {model}")
    print(f"📡 Streaming updates: {'Enabled' if STREAM_UPDATES else 'Disabled'}")
    
    # Create and launch the interface
    demo = create_gradio_interface()
    
    # Launch with appropriate settings
    demo.launch(
        server_name="0.0.0.0",  # Allow external access
        server_port=7860,       # Default Gradio port
        share=False,            # Set to True if you want a public link
        debug=False,
        show_error=True
    )

if __name__ == "__main__":
    main()
    
# if __name__ == "__main__":
#     # Remove the old repl() call and replace with main()
#     main()

