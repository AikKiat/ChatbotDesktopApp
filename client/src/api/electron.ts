import type { AWSLoginResponse, AIStreamChunk, MessageDTO } from "./api_dtos";



export interface ElectronAPI{
    sendPrompt(prompt: string, chatId: number, offset : number, limit : number): Promise<{done?: boolean; error?: string}>,
    onStream(cb: (chunk: AIStreamChunk) => void): void,
    getChatTitles(): Promise<Record<number, string>>,
    updateChatTitle(id: number, title: string): Promise<{ ok?: true; error?: string }>,
    storeMessages(): Promise<{ ok: true }>,
    getLatestMessages(chatId: number, offset: number, limit: number): Promise<MessageDTO[]>,
    awsLogin() : Promise <AWSLoginResponse>,
    listModels() : Promise<any>,
    awsConfigureSession() : Promise<{ok : true}>
    sendModelDetails(modelId : string) : Promise<{ok : true}>
}


declare global{
    interface Window{
        electronAPI : ElectronAPI
    }
}
