

export const IPC_CHANNELS = {
    AWS_LOGIN : "aws:login",
    AWS_LIST_MODELS : "aws:listModels",
    LLM_RUN : "llm:run",
    CHAT_LIST_TITLE : "chat:listTitles",
    CHAT_UPDATE_TITLES: "chat:updateTitle",
    MESSAGE_STORE : "message:store",
    MESSAGE_GET_LATEST_N : "message:getLatest",
    AI_PROMPT : "ai:prompt",
    AWS_CONFIGURE_SESSION : "aws:configSession",
    AWS_SEND_MODEL_DETAILS : "aws:modelDetails"


} as const