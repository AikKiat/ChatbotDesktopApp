from state_graph.state_graph import State
from langchain_core.messages import SystemMessage, HumanMessage
from agent_response_model import AgentResponseModel
from prompts import Prompts

async def title_summariser_node(state: State, config):
    llm = config["configurable"]["llm"]

    conversation = serialize_messages(state["messages"])
    current_title = state.get("chat_title", "")

    prompt = f"""
    Conversation so far:
    {conversation}

    Current title:
    {current_title}

    Generate a new concise title (max 15 characters) if the conversation topic has changed.
    If the current title is still accurate, return it unchanged.
    Return ONLY the title text.
    """.strip()

    try:
        reasoning = await llm.ainvoke([
            SystemMessage(content=Prompts.TITLE_SUMMARISER_PROMPT),
            HumanMessage(content=prompt)
        ])

        title = reasoning.content.strip()

        return {"chat_title": title}

    except Exception as e:
        AgentResponseModel.set_internal_thoughts(
            f"Title generation failed: {str(e)}"
        )
        return {}
    


def serialize_messages(messages):
    lines = []
    for m in messages:
        role = "User" if m.type == "human" else "AI"
        lines.append(f"{role}: {m.content}")
    return "\n".join(lines)
