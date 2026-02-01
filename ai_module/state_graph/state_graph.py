
from typing import TypedDict, List
from typing_extensions import Annotated
from langgraph.graph.message import add_messages


class AIState:
    _instance : AIState = None


    messages: Annotated[list, add_messages] = [] # Full conversation history
    user_input: str = ""
    agent_response: str = ""
    chat_id: int = -1
    chat_title: str = ""
    internal_thoughts: str = "" 
    reasoning_stage: List[str] = []

    def __init__(self):
         return ("Use Get Instance instead, as this is a singleton!")

    @classmethod
    def get_instance(cls):
        if cls._instance == None:
            cls._instance = cls.__new__(cls)
        return cls._instance
    
    def get_messages(self):
        return self.messages
    def get_user_input(self):
        return self.user_input
    def get_agent_response(self):
        return self.agent_response
    def get_chat_id(self):
        return self.chat_id
    def get_chat_title(self):
        return self.chat_title
    def get_internal_thoughts(self):
        return self.internal_thoughts
    def get_reasoning_stage(self):
        return self.reasoning_stage
    

    
    def set_messages(self,value):
        self.messages=value
    def set_user_input(self,value):
        self.user_input=value
    def set_agent_response(self,value):
        self.agent_response=value
    def set_chat_id(self,value):
        self.chat_id=value
    def set_chat_title(self,value):
        self.chat_title=value
    def set_internal_thoughts(self,value):
        self.internal_thoughts=value
    def set_reasoning_stage(self,value):
        self.reasoning_stage=value
    


class State(TypedDict):
    messages: Annotated[list, add_messages]  # Full conversation history
    user_input: str 
    agent_response: str
    chat_id: int
    chat_title: str 
    internal_thoughts: str 
    reasoning_stage: List[str] 
    

    

