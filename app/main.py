import os
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from supabase import create_client
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain.schema import SystemMessage, HumanMessage

load_dotenv()

app = FastAPI()

# ===== CONFIG =====
supabase = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_KEY")
)

llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.4,
    streaming=True
)

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

# ===== MODELS =====
class StartChat(BaseModel):
    email: str
    phone: str
    name: str | None = None
    company: str | None = None

class ChatMsg(BaseModel):
    visitor_id: str
    message: str

# ==============================
# START CHAT
# ==============================
@app.post("/start")
def start_chat(data: StartChat):

    visitor = supabase.table("visitors").insert({
        "email": data.email,
        "name": data.name,
        "company": data.company
    }).execute().data[0]

    convo = supabase.table("conversations").insert({
        "visitor_id": visitor["id"],
        "status": "active"
    }).execute().data[0]

    return {
        "visitor_id": visitor["id"],
        "conversation_id": convo["id"]
    }

# ==============================
# SEARCH MEMORY
# ==============================
def get_memory(conversation_id):

    msgs = supabase.table("messages") \
        .select("*") \
        .eq("conversation_id", conversation_id) \
        .order("created_at") \
        .limit(20).execute().data

    context = ""
    for m in msgs:
        context += f"{m['sender']}: {m['content']}\n"

    return context

# ==============================
# STREAM CHAT
# ==============================
@app.post("/chat-stream")
def chat_stream(data: ChatMsg):

    # get conversation
    convo = supabase.table("conversations") \
        .select("*") \
        .eq("visitor_id", data.visitor_id) \
        .order("created_at", desc=True).limit(1).execute().data[0]

    conversation_id = convo["id"]

    # save user msg
    supabase.table("messages").insert({
        "conversation_id": conversation_id,
        "sender": "user",
        "content": data.message
    }).execute()

    memory_context = get_memory(conversation_id)

    system_prompt = f"""
You are Agent Kim — elite AI copilot.

Understand past conversation.
If user repeats question → improve answer.
Be smart and human.

Chat history:
{memory_context}
"""

    def stream():
        full_reply = ""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=data.message)
        ]

        for chunk in llm.stream(messages):
            if chunk.content:
                full_reply += chunk.content
                yield chunk.content

        # save assistant reply after stream ends
        supabase.table("messages").insert({
            "conversation_id": conversation_id,
            "sender": "agent",
            "content": full_reply
        }).execute()

    return StreamingResponse(stream(), media_type="text/plain")
