


//MAIN DATA CHUNK FROM WEBSOCKET
export interface MQTTData {
    agent_report : agentReport;
    internal_thoughts : internalThoughts;
}

export interface agentReport{
    agent_report : string
    current_chat_title : string
}

export interface internalThoughts{
    internal_thoughts : string
}

export interface ContextValues{
    [key : string] : any,
}

export interface ChatData{
    chat_id : number,
    chat_title : string,
    messages: string[]
}

export interface ChatDataMappings{
    [chat_id : number] : ChatData
}

export interface ChatConvos{
    [chat_id : number] : ChatConvo
}

export interface ChatConvo{
    chat_title : string,
    messages : string[],
    total_messages?: number
}

export interface AWSLoginResponse {
    accountConnected : boolean,
    expiresAt : any
}

export interface AIStreamChunk {
    type: 'thought' | 'token' | 'title' | 'done' | 'error';
    content?: string;
    chat_title?: string;
}

export interface MessageDTO {
    role: 'user' | 'assistant';
    content: string;
}


