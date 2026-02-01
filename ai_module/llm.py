
from langchain_openai import ChatOpenAI
from langchain_aws import ChatBedrock
from dotenv import load_dotenv
import os
import boto3

# Load environment variables
load_dotenv()


class Llm:

    _instance = None

    def __init__(self):
        raise RuntimeWarning("This is a Singleton. Access it via get_instance instead")
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls.__new__(cls)
        return cls._instance
    

    def build_llm(self, model_id, region, credentials):
        # Create a boto3 session with the credentials
        session = boto3.Session(
            aws_access_key_id=credentials["accessKeyId"],
            aws_secret_access_key=credentials["secretAccessKey"],
            aws_session_token=credentials["sessionToken"],
            region_name=region
        )
        
        # Create a bedrock-runtime client from the session
        bedrock_client = session.client("bedrock-runtime")
        
        return ChatBedrock(
            model_id=model_id,
            client=bedrock_client
        )
