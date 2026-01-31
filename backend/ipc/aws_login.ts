
import { ipcMain, IpcMain } from "electron";
import { getSSOCredentials } from "../aws/sso";
import { listBedrockModels } from "../aws/bedrock";
import { error } from "node:console";
import { IPC_CHANNELS } from "./channels";



let cachedCredentials : any = null;

ipcMain.handle(IPC_CHANNELS.AWS_LOGIN, async () => {
    cachedCredentials = await getSSOCredentials();
    return {
        accountConnected : true,
        expiresAt : cachedCredentials.expiration
    };
});

ipcMain.handle(IPC_CHANNELS.AWS_LIST_MODELS, async () =>{
    if(!cachedCredentials) throw new Error("User not authenticated!");
    return listBedrockModels(cachedCredentials, "us-east-1");
});

ipcMain.handle(
  IPC_CHANNELS.AWS_CONFIGURE_SESSION,
  async (_, sessionId, modelId, region) => {
    if (!cachedCredentials) throw new Error("Not authenticated");

    await fetch("http://127.0.0.1:8000/session/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        aws: {
          region,
          model_id: modelId,
          credentials: cachedCredentials
        }
      })
    });

    return { ok: true };
  }
);






