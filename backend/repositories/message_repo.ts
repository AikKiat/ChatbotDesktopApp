

import { Messages } from "../persistence/messages";

export async function storeToDb(){

    let result : Boolean = await Messages.getInstance().saveToDb();
    if(result){
        return true;
    }
    return false;
}

export async function getPaginated(chatId : number, offset : number, limit : number){
    let messages : Messages = Messages.getInstance();
    let result : string[] = await messages.getLatestMessages(chatId, offset, limit);

    return result;
}