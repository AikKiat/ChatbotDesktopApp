from pydantic import BaseModel
from typing_extensions import List


class ChatRequest(BaseModel):
    prompt: str
    chat_id: int = 0
    
    #These other key details as well!!!
    recent_messages: List[str]  
    current_title: str


class AWSCredentials(BaseModel):
    accessKeyId : str
    secretAccessKey : str
    sessionToken : str

class AWSConfig(BaseModel):
    region : str
    credentials : AWSCredentials

class SessionConfig(BaseModel):
    session_id : str
    aws : AWSConfig

class ModelDetails(BaseModel):
    model_id : str
    model_name : str
    model_arn : str
    inference_types : List[str]

"""
{
    session_id,
    aws: {
            region,
            credentials
        }
}
"""


#  const model_info = {
#                     'modelId': model.modelId,
#                     'modelArn': model.modelArn,
#                     'modelName': model.modelName,
#                     'inferenceTypes': model.inferenceTypesSupported || []
#                 }

