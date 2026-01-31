import { ipcMain } from "electron";
import { AISidecarService } from "../services/ai_sidecar_service";
import { IPC_CHANNELS } from "./channels";
import { getLatestN } from "../services/message_service";
import { getChatTitleForId, getChatTitles } from "../services/chat_service";

const aiSidecar = AISidecarService.getInstance();

/**
 * Send prompt to AI and stream response back to renderer
 */

var currentChatId : number = -1;

ipcMain.handle(IPC_CHANNELS.AI_PROMPT, async (event, prompt: string, chatId: number, sessionId : string, offset : number, limit : number) => {
    
    try {

        let latestNMessages = [""]
        let currentTitle = ""


        //If the user is just continuing conversations with the AI, the AI's internal session cache actually stores the message list and current title as they update.
        //So, no need to fetch from db on every new user's text prompt on this same chat id.
        if (chatId !== currentChatId){
            //Get latest N messages and pass to AI, so that it has context of hitherto discussion for this chat.
            latestNMessages = await getLatestN(chatId, offset, limit);
            currentTitle = await getChatTitleForId(chatId);
            currentChatId = chatId; //update the current chat id
        }

        for await (const chunk of aiSidecar.streamPrompt(
            prompt, 
            chatId,
            latestNMessages,
            currentTitle,
            sessionId
    )) {
            event.sender.send("ai:stream", chunk);
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