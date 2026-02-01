

import { prisma } from "../db/prisma";


export async function findTitles(){
    const chats = await prisma.chat.findMany({
        select : {id :true, title: true}
    });

    return Object.fromEntries(
        chats.map(chat => [chat.id, chat.title])
    );
}

export async function getChatTitle(chatId : number){
    const chat = await prisma.chat.findFirst({
        select : {id : true, title : true},
        where : {id : chatId}
    })

    if(!chat){
        console.error("Failed to get title for this chat id");
        return null;
    }

    return {
        "chat_id" : chat.id,
        "title" : chat.title
    }
}

export async function insertTitle(chatId : number, title : string){
    await prisma.chat.upsert({
        where :{id : chatId},
        update : {title},
        create : {id : chatId, title}
    });
}



