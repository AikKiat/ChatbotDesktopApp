

import { storeToDb, getPaginated } from "../repositories/message_repo";


export async function storeMessages(){
    return storeToDb();
}

export async function getLatestN(chatId : number, offset : number, limit : number){
    return getPaginated(chatId, offset, limit);
}