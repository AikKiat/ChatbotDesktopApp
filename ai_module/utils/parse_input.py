
from agent_response_model import AgentResponseModel
from ai import chat_bot
from utils.session_store import SessionStore
from llm import Llm
from state_graph.state_graph import AIState, State
from typing_extensions import List


async def process_user_input(prompt: str, chat_id: int, previous_messages : List[str], current_title : str):
    try:
        # aws_cfg = SessionStore.get_instance().get_session_details_for_id(session_id)
        aws_cfg = SessionStore.get_instance().get_config()
        print(aws_cfg)
        if not aws_cfg:
            raise RuntimeError("Session not configured")
        
        model_details = SessionStore.get_instance().get_model_details()
        if not model_details:
            raise RuntimeError("Model details not configured!")
        
        print(model_details)

        llm = Llm.get_instance().build_llm(
            model_id=model_details["model_id"],
            region=aws_cfg["region"],
            credentials=aws_cfg["credentials"],
        )

        graph_context = {
            "llm" : llm
        }

        if AIState.get_instance().get_chat_id() != chat_id:
            #On a different chat. Hence, set the session's cached values to store convo for this new chat
            AIState.get_instance().set_chat_id(chat_id)  

            previous_chat_title = previous_messages
            past_messages = current_title   
            AIState.get_instance().set_messages(past_messages)
            AIState.get_instance().set_chat_title(previous_chat_title)
            AIState.get_instance().set_user_input(prompt[3:])

        else:
            #still on the same chat, no need to set both messages and title. Rely on already updated values from conversation.
            AIState.get_instance().set_user_input(prompt[3:])

        AIState.get_instance().set_current_chat_number(int(prompt.split("|")[-1]) + 1) #update to reflect the latest chat count.
        


        initial_state = {
            "messages": AIState.get_instance().get_messages(),
            "user_input": AIState.get_instance().get_user_input(),
            "chat_id": AIState.get_instance().get_chat_id(),
            "agent_response": "",
            "chat_title": AIState.get_instance().get_chat_title(),
            "internal_thoughts": "",
            "chat_number": AIState.get_instance().get_current_chat_number()
        }
        
        final_state = chat_bot.invoke(initial_state, config={"configurable":graph_context}) #invoke the chatbot here
        
        
        if final_state.get("chat_title"):
            AgentResponseModel.set_current_chat_title(final_state["chat_title"])
        
        await AgentResponseModel.emit_done()
        
    except Exception as e:
        print(f"Error processing input: {e}")
        import traceback
        traceback.print_exc()
        if AgentResponseModel._sse_queue:
            await AgentResponseModel._sse_queue.put({
                "type": "error",
                "content": str(e)
            }
        )
