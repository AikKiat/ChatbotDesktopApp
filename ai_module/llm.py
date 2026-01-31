
from langchain_openai import ChatOpenAI
from langchain_aws import ChatBedrock
from dotenv import load_dotenv
import os

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
    

    def build_llm(model_id,region, credentials):
        return ChatBedrock(
            model_id=model_id,
            region=region,
            credentials={
                "access_key":credentials["accessKeyId"],
                "secret_key":credentials["secretAccessKey"],
                "session_token":credentials["sessionToken"]
            }
        )
