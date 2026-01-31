"""
FastAPI server for AI chatbot (Electron sidecar).
Minimal implementation - AI streaming only, no database, no Redis.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse


from utils.event_streaming import EventStreamer
from utils.parse_input import process_user_input
from utils.api_mappings import ChatRequest, SessionConfig
from utils.session_store import SessionStore

import asyncio



app = FastAPI(title="AI Chatbot Sidecar")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"status": "AI Sidecar Running", "version": "1.0.0"}


@app.post("/session/config")
def configure_session(config : SessionConfig):
    SessionStore.get_instance().add_to_session_config(config=config)
    return {"status" : "ok"}


@app.post("/chat/stream")
async def chat_stream(request: ChatRequest):

    asyncio.create_task(process_user_input(prompt=request.prompt, chat_id=request.chat_id, session_id=request.session_id))

    #Create the queue for streaming now
    EventStreamer.get_instance().create_streaming_queue(request=request)

    return StreamingResponse(
        EventStreamer.get_instance().event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="info")
