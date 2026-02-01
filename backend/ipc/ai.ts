import { ipcMain } from "electron";
import { AISidecarService } from "../services/ai_sidecar_service";
import { IPC_CHANNELS } from "./channels";
import { getLatestN } from "../services/message_service";
import { getChatTitleForId} from "../services/chat_service";
import { Messages } from "../persistence/messages";
import { resourceUsage, title } from "node:process";

const aiSidecar = AISidecarService.getInstance();

/**
 * Send prompt to AI and stream response back to renderer
 */

var currentChatId : number = -1;

ipcMain.handle(IPC_CHANNELS.AI_PROMPT, async (event, prompt: string, chatId: number, offset : number, limit : number) => {
    
    try {

        let latestNMessages = [""]
        let currentTitle = ""

        Messages.getInstance().appendToMessages({
            chatId : chatId,
            content: `${prompt}`
        });

        //If the user is just continuing conversations with the AI, the AI's internal session cache actually stores the message list and current title as they update.
        //So, no need to fetch from db on every new user's text prompt on this same chat id.
        if (chatId !== currentChatId){
            //Get latest N messages and pass to AI, so that it has context of hitherto discussion for this chat.
            latestNMessages = await getLatestN(chatId, offset, limit);
            let result = await getChatTitleForId(chatId);
            if(result){
                currentTitle = result.title;
            }
            currentChatId = chatId; //update the current chat id
        }


        let aiBuffer = "";
        for await (const chunk of aiSidecar.streamPrompt(prompt, chatId, latestNMessages, currentTitle)) {
            
            if (chunk.type === "token" && chunk.content) {
                aiBuffer += chunk.content; //accumulate the AI response chunk by chunk
            }

            event.sender.send("ai:stream", chunk);

            if (chunk.type === "done") {
                Messages.getInstance().appendToMessages({
                    chatId,
                    content: `AI|${aiBuffer}`
                });
                
                aiBuffer = "";
            }
        }
        
        return { done: true };
    } catch (error) {
        console.error('[IPC ai:prompt] Error:', error);
        event.sender.send("ai:stream", {
            type: 'error',
            content: error instanceof Error ? error.message : 'Unknown error'
        });
        return { error: String(error) };
    }
});