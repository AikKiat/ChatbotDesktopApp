from typing import Dict

from api_mappings import SessionConfig

class SessionStore:

    _instance : SessionStore = None
    session_configs : Dict[str, dict] = {}

    def __init__(self):
         return ("Use Get Instance instead, as this is a singleton!")

    @classmethod
    def get_instance(cls):
        if cls._instance == None:
            cls._instance = cls.__new__(cls)
        return cls._instance
    
    def add_to_session_config(self, config : SessionConfig):
        self.session_configs[config.session_id] = config.aws.dict()

    def get_session_details_for_id(self, session_id):
        if session_id not in self.session_configs:
            return None

        return self.session_configs[session_id]

