

from agent_response_model import AgentResponseModel
import asyncio
from utils.api_mappings import ChatRequest
from asyncio import Queue
import json



"""
Stream AI response via Server-Sent Events.

Response format (SSE):
    data: {"type": "thought", "content": "Analyzing..."}
    data: {"type": "token", "content": "Here's my response..."}
    data: {"type": "title", "content": "Chat about X"}
    data: {"type": "done", "chat_title": "Final title"}
"""


class EventStreamer:
    max_queue_size : int = 100
    sse_queue : Queue = None

    _instance : EventStreamer = None

    def __init__(self):
         return ("Use Get Instance instead, as this is a singleton!")

    @classmethod
    def get_instance(cls):
        if cls._instance == None:
            cls._instance = cls.__new__(cls)
        return cls._instance


    def change_queue_size(self,queue_size : int):
         if(isinstance(queue_size, int)):
              self.max_queue_size = queue_size

    def create_streaming_queue(self, request : ChatRequest):
        self.sse_queue = asyncio.Queue(maxsize=self.max_queue_size)
        AgentResponseModel.set_sse_queue(self.sse_queue)
        AgentResponseModel.set_current_chat_id(request.chat_id)
        AgentResponseModel.reset_state()
         

    async def event_generator(self):
        try:
            while True:
                data = await asyncio.wait_for(self.sse_queue.get(), timeout=30.0)
                
                yield f"data: {json.dumps(data)}\n\n"
    
                if data.get("type") == "done":
                    break
        except asyncio.TimeoutError:
            yield f'data: {json.dumps({"type": "error", "content": "Timeout"})}\n\n'
        except Exception as e:
            yield f'data: {json.dumps({"type": "error", "content": str(e)})}\n\n'
        