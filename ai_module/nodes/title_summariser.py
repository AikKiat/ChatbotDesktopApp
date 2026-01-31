

from state_graph.state_graph import State
from langchain_core.messages import SystemMessage, HumanMessage
from llm import Llm
from agent_response_model import AgentResponseModel
import asyncio

from prompts import Prompts

_llm = Llm.get_instance()._llm

async def title_summariser_node(state: State):

    ongoing_messages = state["messages"]
    current_title = state["chat_title"]

    human_message = {
        "ongoing_messages" : ongoing_messages,
        "current_title" : current_title
    }
   
    try:

        SYSTEM_MESSAGE = Prompts.TITLE_SUMMARISER_PROMPT
        reasoning = await _llm.ainvoke([
            SystemMessage(content=SYSTEM_MESSAGE),
            HumanMessage(content=human_message)
        ])
        
        title = reasoning.content
        
        return {"chat_title": title}
    
    except Exception as e:
        AgentResponseModel.set_internal_thoughts(f"Title generation failed: {str(e)}")
    