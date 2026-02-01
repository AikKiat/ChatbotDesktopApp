
import { Message } from "../domain/message";

import {prisma} from "../db/prisma";

export class Messages{

    messages : Message[] = []


    private static instance : Messages | null = null;

    private constructor(){

    }

    public static getInstance() : Messages{
        if(Messages.instance == null){
            Messages.instance = new Messages();
        }
        return Messages.instance;
    }

    public appendToMessages(message : Message){
        this.messages.push(message);  
    }

    public async saveToDb(){
        try{
            await prisma.message.createMany({
                data : this.messages.map((message) => ({
                    chatId: message.chatId,
                    content: message.content
                })),
                skipDuplicates : true
            });
            return true;
            
        } catch(error){
            console.error("Failed to save to db via prisma client", error);
            return false;
        }
    }

    public async getLatestMessages(chatId : number, offset : number, limit : number){
        const messages : {content : string;}[] = await prisma.message.findMany({
            where : {chatId},
            orderBy : {id : 'desc'},
            skip : offset,
            take : limit,
            select : {content : true}
        });

        let messageStringList : string[] = []
        
        messages.map((message : {content : string}) =>{
            this.messages.push({chatId : chatId, content : message.content});
            messageStringList.push(message.content);
        })

        return messageStringList
    }
}