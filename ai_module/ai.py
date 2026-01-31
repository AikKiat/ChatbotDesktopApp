


from langgraph.graph import StateGraph, START, END
from ai_module.state_graph.state_graph import AgentState

from nodes.input_parser import input_parser_node
from nodes.title_summariser import title_summariser_node
from nodes.save_to_ai_state import save_to_ai_state



graph = StateGraph(AgentState)

graph.add_node("input_parser", input_parser_node)
graph.add_node("title_summariser", title_summariser_node)
graph.add_node("save_to_ai_state", save_to_ai_state)


graph.set_entry_point("input_parser_node")

graph.add_edge("input_parser_node", "title_summariser_node")
graph.add_edge("input_parser_node", "save_to_ai_state")
graph.add_edge("save_to_ai_state", END)

chat_agent = graph.compile()


