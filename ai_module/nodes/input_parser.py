from langchain_core.messages import SystemMessage, HumanMessage, AIMessage
from agent_response_model import AgentResponseModel
from prompts import Prompts
from state_graph.state_graph import State

def input_parser_node(state: State, config):
    print("invoking...")
    llm = config["configurable"]["llm"]

    AgentResponseModel.set_internal_thoughts("Processing your message...")

    user_input = state["user_input"]

    messages = list(state["messages"])
    messages.append(HumanMessage(content=user_input))

    reasoning = llm.invoke([
        SystemMessage(content=Prompts.LANGUAGE_PROMPT),
        HumanMessage(content=user_input)
    ])

    AgentResponseModel.set_monologue(reasoning.content)

    messages.append(AIMessage(content=reasoning.content))

    return {
        "messages": messages,
        "ai_response": reasoning.content
    }
