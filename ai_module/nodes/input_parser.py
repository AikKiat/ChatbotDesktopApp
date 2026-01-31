from state_graph.state_graph import State

from langchain_core.messages import SystemMessage, HumanMessage
from agent_response_model import AgentResponseModel
import asyncio


from langchain_core.messages import SystemMessage, HumanMessage

from prompts import Prompts

async def input_parser_node(state : State, config):

    llm = config["llm"]

    AgentResponseModel.set_internal_thoughts("Processing your message...")
    
    user_input = state["user_input"]

    state["messages"].append(f"HU|{user_input}")
    
    processed_stages = state.get("reasoning_stage", [])
    processed_stages.append("Input_Parsing")
    

    
    SYSTEM_MESSAGE = Prompts.LANGUAGE_PROMPT
    reasoning = await llm.ainvoke([
        SystemMessage(content=SYSTEM_MESSAGE),
        HumanMessage(content=user_input)
    ])

    state["messages"].append(f"AI|{reasoning.content}")
    
    return {"ai_response" : reasoning.content, "messages" : state["messages"]}




