

import { ipcMain } from "electron";
import { storeMessages, getLatestN} from "../services/message_service";
import { IPC_CHANNELS } from "./channels";

ipcMain.handle(IPC_CHANNELS.MESSAGE_STORE,
  async (_,) => {
    await storeMessages();
    return { ok: true };
  }
);

ipcMain.handle(IPC_CHANNELS.MESSAGE_GET_LATEST_N,
  async (_,chatId: number,offset: number,limit: number) => { 
    return getLatestN(chatId, offset, limit); }
);
