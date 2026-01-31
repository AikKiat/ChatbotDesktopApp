from pydantic import BaseModel
from typing_extensions import List


class ChatRequest(BaseModel):
    prompt: str
    chat_id: int = 0
    
    #These other key details as well!!!
    session_id: str 
    recent_messages: List[str]  
    current_title: str


class AWSCredentials(BaseModel):
    accessKeyId : str
    secretAccessKey : str
    sessionToken : str

class AWSConfig(BaseModel):
    region : str
    model_id : str
    credentials : AWSCredentials

class SessionConfig(BaseModel):
    session_id : str
    aws : AWSConfig

