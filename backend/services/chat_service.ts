

import { findTitles, insertTitle, getChatTitle,} from "../repositories/chat_repo";

export async function getChatTitles(){
    return findTitles();
}

export async function getChatTitleForId(chatId : number){
    return getChatTitle(chatId);
}


export async function insertChatTitle(chatId : number, title : string){
    return insertTitle(chatId, title);
}