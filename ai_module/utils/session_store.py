from typing import Dict

from utils.api_mappings import SessionConfig, ModelDetails

class SessionStore:

    _instance : SessionStore = None
    session_configs : Dict[str, dict] = {}
    model_details : Dict = {}
    current_session_id : str = ""

    """
    session config:
    {
        session_id : str,
        model_id : str,
        aws: {
            region : str
            credentials : dict
        }
    }
    """

    def __init__(self):
         return ("Use Get Instance instead, as this is a singleton!")

    @classmethod
    def get_instance(cls):
        if cls._instance == None:
            cls._instance = cls.__new__(cls)
        return cls._instance
    
    def add_to_session_config(self, config : SessionConfig):
        self.session_configs[config.session_id] = config.aws.dict()
        self.current_session_id = config.session_id

    def add_model_details(self, model_details : ModelDetails):
        self.model_details["model_id"] = model_details.model_id
        self.model_details["model_name"] = model_details.model_name
        self.model_details["model_arn"] = model_details.model_arn
        self.model_details["inference_types"] = model_details.inference_types

    def get_model_details(self):
        return self.model_details

    def get_session_details_for_id(self, session_id):
        if session_id not in self.session_configs:
            return None

        return self.session_configs[session_id]
    
    def get_config(self):
        return self.session_configs[self.current_session_id]

