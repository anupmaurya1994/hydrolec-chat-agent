import os
import requests
from fastapi import FastAPI, Form
from fastapi.responses import PlainTextResponse
from twilio.twiml.messaging_response import MessagingResponse
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Config
CHATBOT_API_URL = os.getenv("CHATBOT_API_URL")
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER")


@app.post("/whatsapp")
async def whatsapp_webhook(
    From: str = Form(...),   # WhatsApp sender
    Body: str = Form(...)    # WhatsApp message text
):
    user_message = Body.strip()

    # 🔥 Call your chatbot API
    try:
        response = requests.post(
            CHATBOT_API_URL,
            json={"query": user_message}
        )
        data = response.json()
        if data.get("success"):
            bot_reply = data.get("response", "Sorry, no response available.")
        else:
            bot_reply = "Sorry, something went wrong with the chatbot API."
    except Exception as e:
        bot_reply = f"Error talking to chatbot API: {str(e)}"

    # 📩 Reply back via Twilio
    twilio_resp = MessagingResponse()
    twilio_resp.message(bot_reply)

    return PlainTextResponse(str(twilio_resp), media_type="application/xml")
