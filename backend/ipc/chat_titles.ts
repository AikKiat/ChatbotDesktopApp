import { ipcMain } from "electron";
import { getChatTitles, insertChatTitle} from "../services/chat_service";
import { AppError } from "../errors/app_error";
import { IPC_CHANNELS } from "./channels";

ipcMain.handle(IPC_CHANNELS.CHAT_LIST_TITLE, async () => {
  return getChatTitles();
});

ipcMain.handle(IPC_CHANNELS.CHAT_UPDATE_TITLES,
  async (_, chatId: number, title: string) => {
    try {
      await insertChatTitle(chatId, title);
      return { ok: true };
    } catch (e) {
      if (e instanceof AppError) {
        return { error: e.message };
      }
      throw e;
    }
  }
);
