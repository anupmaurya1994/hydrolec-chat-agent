# import fastapi
# from pydantic import BaseModel
# from fastapi.middleware.cors import CORSMiddleware
# app = fastapi.FastAPI(
#     title="Math API",
#     description="A simple API to add two numbers",
#     version="1.0.0")
# # Add CORS middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
# class NumberRequest(BaseModel):
#     no1: int
#     no2: int

# # @app.get("/")
# # def main():
# #     return {"message": "Hello, Ritesh here"}

# @app.post("/query")
# def run_query(request: NumberRequest):
#     return {"output": request.no1 + request.no2}

"""
FastAPI Server for Database Agent with Streaming Response
Provides a single streaming endpoint for database queries.
"""

import asyncio
import json
from typing import AsyncGenerator
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
import logging
import time
# Import your existing agent
from faster import DatabaseAgent

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Database Agent API",
    description="Streaming API for PostgreSQL AI Database Assistant",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class QueryRequest(BaseModel):
    query: str
    reset_conversation: bool = False

# Initialize the database agent
agent = DatabaseAgent()

@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "message": "Database Agent API is running",
        "status": "healthy",
        "endpoints": {
            "streaming_query": "/query/stream",
            "health": "/health"
        }
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

async def generate_streaming_response(query: str, reset: bool = False) -> AsyncGenerator[str, None]:
    """
    Generate streaming response from the database agent
    """
    try:
        # Reset conversation if requested
        if reset:
            agent.reset()
            yield f"data: {json.dumps({'type': 'reset', 'message': 'Conversation reset'})}\n\n"
        
        # Stream the response
        accumulated_response = ""
        async for chunk in stream_agent_response(query):
            accumulated_response += chunk
            
            # Send chunk as Server-Sent Events format
            chunk_data = {
                "type": "chunk",
                "content": chunk,
                "accumulated": accumulated_response
            }
            yield f"data: {json.dumps(chunk_data)}\n\n"
        
        # Send completion signal
        completion_data = {
            "type": "complete",
            "final_response": accumulated_response
        }
        yield f"data: {json.dumps(completion_data)}\n\n"
        
    except Exception as e:
        logger.error(f"Error in streaming response: {str(e)}")
        error_data = {
            "type": "error",
            "error": str(e)
        }
        yield f"data: {json.dumps(error_data)}\n\n"

async def stream_agent_response(query: str) -> AsyncGenerator[str, None]:
    """
    Async wrapper for the agent's stream_response method
    """
    loop = asyncio.get_event_loop()
    
    # Run the synchronous generator in a thread
    def sync_generator():
        for chunk in agent.stream_response(query):
            return chunk
    
    # Use asyncio to make it non-blocking
    try:
        for chunk in agent.stream_response(query):
            yield chunk
            # Allow other coroutines to run
            await asyncio.sleep(0)
    except Exception as e:
        logger.error(f"Error in agent stream response: {str(e)}")
        raise

@app.post("/query/stream")
async def stream_query(request: QueryRequest):
    """
    Stream database query response
    
    Example usage:
    ```
    curl -X POST "http://localhost:8000/query/stream" \
         -H "Content-Type: application/json" \
         -d '{"query": "Create a project called Mobile App Development"}' \
         --no-buffer
    ```
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    logger.info(f"Streaming query request: {request.query[:100]}...")
    
    return StreamingResponse(
        generate_streaming_response(request.query, request.reset_conversation),
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )

@app.post("/query")
async def query_non_streaming(request: QueryRequest):
    """
    Non-streaming database query endpoint (fallback)
    """
    start_time = time.time()
    if not request.query.strip():
        end_time = time.time()
        logger.info(f"Non-streaming query failed in {end_time - start_time:.2f} seconds")
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    logger.info(f"Non-streaming query request: {request.query[:100]}...")
    
    try:
        # Reset conversation if requested
        if request.reset_conversation:
            agent.reset()
        
        # Get complete response
        response = agent.process_message(request.query)
        logger.info(f"Non-streaming query completed in {time.time() - start_time:.2f} seconds")
        return {
            "success": True,
            "response": response,
            "query": request.query
        }
        
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}, took {time.time() - start_time:.2f} seconds")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reset")
async def reset_conversation():
    """Reset the conversation history"""
    try:
        response = agent.reset()
        return {
            "success": True,
            "message": response
        }
    except Exception as e:
        logger.error(f"Error resetting conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(
        "api_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )