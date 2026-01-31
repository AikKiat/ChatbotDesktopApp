

import { storeMessage, getPaginated } from "../repositories/message_repo";


export async function storeMessages(chatId : number, messages : string[]){
    return storeMessage(chatId, messages);
}

export async function getLatestN(chatId : number, offset : number, limit : number){
    return getPaginated(chatId, offset, limit);
}