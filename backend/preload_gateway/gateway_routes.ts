

import { contextBridge, ipcRenderer } from "electron";

// Inline channel constants (can't import from separate file in preload)
const IPC_CHANNELS = {
  AI_PROMPT: "ai:prompt",
  CHAT_LIST_TITLE: "chat:listTitles",
  CHAT_UPDATE_TITLES: "chat:updateTitle",
  MESSAGE_STORE: "message:store",
  MESSAGE_GET_LATEST_N: "message:getLatest",
  AWS_LOGIN: "aws:login",
  AWS_LIST_MODELS: "aws:listModels",
  AWS_CONFIGURE_SESSION: "aws:configSession",
  AWS_SEND_MODEL_DETAILS : "aws:modelDetails"
} as const;

contextBridge.exposeInMainWorld("electronAPI", {
  
  // AI sidecar routes
  sendPrompt: (prompt: string, chatId: number, offset: number, limit: number) =>
    ipcRenderer.invoke(IPC_CHANNELS.AI_PROMPT, prompt, chatId, offset, limit),

  onStream: (cb: (chunk: {type: string; content?: string; chat_title?: string}) => void) =>
    ipcRenderer.on("ai:stream", (_, chunk) => cb(chunk)),

  
  // Chats IPC routes
  getChatTitles: () => ipcRenderer.invoke(IPC_CHANNELS.CHAT_LIST_TITLE),

  updateChatTitle: (id: number, title: string) => ipcRenderer.invoke(IPC_CHANNELS.CHAT_UPDATE_TITLES, id, title),

  
  // Messages IPC routes
  storeMessages: (chatId: number, messages: string[]) => ipcRenderer.invoke(IPC_CHANNELS.MESSAGE_STORE, chatId, messages),

  getLatestMessages: (chatId: number, offset: number, limit: number) => ipcRenderer.invoke(IPC_CHANNELS.MESSAGE_GET_LATEST_N, chatId,offset, limit),

  awsLogin : () => ipcRenderer.invoke(IPC_CHANNELS.AWS_LOGIN),
  listModels : () => ipcRenderer.invoke(IPC_CHANNELS.AWS_LIST_MODELS) ,
  awsConfigureSession : () => ipcRenderer.invoke(IPC_CHANNELS.AWS_CONFIGURE_SESSION),
  sendModelDetails : (modelId : string) => ipcRenderer.invoke(IPC_CHANNELS.AWS_SEND_MODEL_DETAILS, modelId)
});
