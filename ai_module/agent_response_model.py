"""
Simplified AgentResponseModel for Electron desktop app.
Removed: Redis, Database operations, scan_insights
Kept: Monologue, internal thoughts, chat title tracking (in-memory only)
"""

import asyncio
from typing import Optional, Dict
import queue


class AgentResponseModel:
    
    def __init__(self):
        raise RuntimeWarning("This is a singleton. Access it via get_instance instead.")
    
    _instance = None
    
    _monologue: str = "" 
    _internal_thoughts: str = "" 
    _current_chat_title: str = "New Chat"
    _current_chat_id: int = 0  
    _current_chat_number : int = 0
    
    _sse_queue: Optional[asyncio.Queue] = None
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls.__new__(cls)
        return cls._instance
    
    @classmethod
    def set_monologue(cls, value: str):
        """Set the AI's response text."""
        if isinstance(value, str):
            cls._monologue = value
            # Emit to SSE stream
            if cls._sse_queue:
                try:
                    cls._sse_queue.put_nowait({
                        "type": "token",
                        "content": value
                    })
                except asyncio.QueueFull:
                    pass
    
    @classmethod
    def set_internal_thoughts(cls, value: str):
        if isinstance(value, str):
            cls._internal_thoughts = value
            if cls._sse_queue:
                try:
                    cls._sse_queue.put_nowait({
                        "type": "thought",
                        "content": value
                    })
                except asyncio.QueueFull:
                    pass
    
    @classmethod
    def set_current_chat_title(cls, value: str):
        if isinstance(value, str):
            cls._current_chat_title = value
            if cls._sse_queue:
                try:
                    cls._sse_queue.put_nowait({
                        "type": "title",
                        "content": value
                    })
                except asyncio.QueueFull:
                    pass
    
    @classmethod
    def set_current_chat_id(cls, chat_id: int):
        if isinstance(chat_id, int):
            cls._current_chat_id = chat_id
    
    @classmethod
    def get_monologue(cls) -> str:
        return cls._monologue
    
    @classmethod
    def get_internal_thoughts(cls) -> str:
        return cls._internal_thoughts
    
    @classmethod
    def get_current_chat_title(cls) -> str:
        return cls._current_chat_title
    
    @classmethod
    def reset_state(cls):
        cls._monologue = ""
        cls._internal_thoughts = ""
    
    @classmethod
    def set_sse_queue(cls, queue: asyncio.Queue):
        cls._sse_queue = queue
    
    @classmethod
    async def emit_done(cls):
        if cls._sse_queue:
            await cls._sse_queue.put({
                "type": "done",
                "chat_title": cls._current_chat_title
            })
