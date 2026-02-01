

from state_graph.state_graph import AIState, State

def save_to_ai_state(state : State):
    AIState.get_instance().set_messages(state["messages"])
    AIState.get_instance().set_chat_title(state["chat_title"])
    AIState.get_instance().set_chat_id(state["chat_id"])

    return state