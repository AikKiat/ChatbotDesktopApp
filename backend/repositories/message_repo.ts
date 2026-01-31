

import {prisma} from "../db/prisma";

export async function storeMessage(chatId : number, messages : string[]){
    if (messages.length === 0) return;

    await prisma.message.createMany({
        data : messages.map(content => ({
            chatId,
            content
        })),
        skipDuplicates : true
    });
}

export async function getPaginated(chatId : number, offset : number, limit : number){
    const messages : {content : string;}[] = await prisma.message.findMany({
        where : {chatId},
        orderBy : {id : 'desc'},
        skip : offset,
        take : limit,
        select : {content : true}
    });


    let messageStringList : string[] = [];
    
    messages.map((message : {content : string}) =>{
        messageStringList.push(message.content);
    })

    return messageStringList
}