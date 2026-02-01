


from langgraph.graph import StateGraph, START, END
from state_graph.state_graph import State

from nodes.input_parser import input_parser_node
from nodes.title_summariser import title_summariser_node
from nodes.save_to_ai_state import save_to_ai_state



graph = StateGraph(State)

graph.add_node("input_parser_node", input_parser_node)
graph.add_node("title_summariser_node", title_summariser_node)
graph.add_node("save_to_ai_state_node", save_to_ai_state)


graph.set_entry_point("input_parser_node")

# Temporarily skip title generation to avoid rate limits
graph.add_edge("input_parser_node", "save_to_ai_state_node")
# graph.add_edge("input_parser_node", "title_summariser_node")
# graph.add_edge("title_summariser_node", "save_to_ai_state_node")
graph.add_edge("save_to_ai_state_node", END)

chat_bot = graph.compile()


