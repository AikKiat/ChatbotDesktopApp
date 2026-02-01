
import { ipcMain, IpcMain } from "electron";
import { getSSOCredentials } from "../aws/sso";
import { listBedrockModels } from "../aws/bedrock";
import { IPC_CHANNELS } from "./channels";
import { randomUUID, UUID } from "node:crypto";

import { ModelsDetails } from "../persistence/models_details";



let cachedCredentials : any = null;

ipcMain.handle(IPC_CHANNELS.AWS_LOGIN, async () => {
    cachedCredentials = await getSSOCredentials();
    return {
        accountConnected : true,
        expiresAt : cachedCredentials.expiration
    };
});

ipcMain.handle(IPC_CHANNELS.AWS_LIST_MODELS, async () =>{
    console.log("Listing out models...");
    if(!cachedCredentials) throw new Error("User not authenticated!");
    return listBedrockModels(cachedCredentials, "ap-southeast-1");
});

ipcMain.handle(
  IPC_CHANNELS.AWS_CONFIGURE_SESSION,
  async () => {

    let sessionId = randomUUID();
    let region = "ap-southeast-1";

    if (!cachedCredentials) throw new Error("Not authenticated");

    let body = JSON.stringify({
        session_id: sessionId,
        aws: {
          region : region,
          credentials: cachedCredentials
        }
      });

    console.log(body);

    await fetch("http://127.0.0.1:8000/session/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body
    });

    return { ok: true };
  }
);

ipcMain.handle(IPC_CHANNELS.AWS_SEND_MODEL_DETAILS, async(_, modelId : string) =>{

    if (!cachedCredentials) throw new Error("Not authenticated");

    console.log(ModelsDetails.getInstance().getAvailableModels());

    let modelDetails = ModelsDetails.getInstance().getAvailableModels()[modelId]

    let body = {
      "model_id" : modelDetails.modelId,
      "model_name" : modelDetails.modelName,
      "model_arn" : modelDetails.modelArn,
      "inference_types" : modelDetails.inferenceTypes
    }

    console.log(body);


    await fetch("http://127.0.0.1:8000/session/model-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    return { ok: true };
})






