
import { Message } from "../domain/message";

import {prisma} from "../db/prisma";
import { RedisClient } from "../db/redis";

export class Messages{

    messages : Message[] = []

    // Cache configuration
    private readonly CACHE_MAX_MESSAGES = 100; // Store last 100 messages per chat
    private readonly CACHE_TTL = 86400; // 24 hours in seconds

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
            // 1. Save to PostgreSQL
            await prisma.message.createMany({
                data : this.messages.map((message) => ({
                    chatId: message.chatId,
                    content: message.content
                })),
                skipDuplicates : true
            });

            // 2. Write-through to Redis cache
            await this.updateCache();
            
            return true;
            
        } catch(error){
            console.error("Failed to save to db via prisma client", error);
            return false;
        }
    }

    /**
     * Update Redis cache with new messages (write-through)
     */
    private async updateCache(): Promise<void> {
        try {
            const redis = RedisClient.getInstance();
            if (!redis.isReady()) {
                console.warn('[Cache] Redis not ready, skipping cache update');
                return;
            }

            const client = redis.getClient();

            // Group messages by chatId
            const messagesByChatId = new Map<number, Message[]>();
            for (const message of this.messages) {
                if (!messagesByChatId.has(message.chatId)) {
                    messagesByChatId.set(message.chatId, []);
                }
                messagesByChatId.get(message.chatId)!.push(message);
            }

            // Update cache for each chat
            for (const [chatId, chatMessages] of messagesByChatId) {
                const cacheKey = `chat:${chatId}:messages`;

                // Push new messages to the list
                if (chatMessages.length > 0) {
                    await client.rPush(
                        cacheKey,
                        chatMessages.map(m => m.content)
                    );

                    // Trim to keep only recent N messages
                    await client.lTrim(cacheKey, -this.CACHE_MAX_MESSAGES, -1);

                    // Set TTL (refresh on each write)
                    await client.expire(cacheKey, this.CACHE_TTL);
                }
            }

            console.log(`[Cache] Updated cache for ${messagesByChatId.size} chat(s)`);
        } catch (error) {
            console.error('[Cache] Failed to update cache:', error);
            // Don't throw - cache failure shouldn't break the app
        }
    }

    public async getLatestMessages(chatId : number, offset : number, limit : number){

        //Cache HIT
        if (offset === 0) {
            const cachedMessages = await this.getFromCache(chatId, limit);
            if (cachedMessages.length > 0) {
                console.log(`[Cache] Hit for chat ${chatId}, ${cachedMessages.length} messages`);
                return cachedMessages;
            }
        }

        console.log(`[Cache] Miss for chat ${chatId}`);

        //Cache MISS
        const messages : {content : string;}[] = await prisma.message.findMany({
            where : {chatId},
            orderBy : {id : 'asc'},
            skip : offset,
            take : limit,
            select : {content : true}
        });

        let messageStringList : string[] = []
        
        messages.map((message : {content : string}) =>{
            this.messages.push({chatId : chatId, content : message.content});
            messageStringList.push(message.content);
        })

        if (offset === 0 && messageStringList.length > 0) {
            await this.warmCache(chatId, messageStringList);
        }

        return messageStringList
    }


    private async getFromCache(chatId: number, limit: number): Promise<string[]> {
        try {
            const redis = RedisClient.getInstance();
            if (!redis.isReady()) {
                return [];
            }

            const client = redis.getClient();
            const cacheKey = `chat:${chatId}:messages`;
            const cached = await client.lRange(cacheKey, -limit, -1);

            //This refreshes the TTL of the particular cache key, so this cache in effect functions in the LRU nature.
            if (cached.length > 0) {
                await client.expire(cacheKey, this.CACHE_TTL);
            }

            return cached;
        } catch (error) {
            console.error('[Cache] Failed to read from cache:', error);
            return [];
        }
    }

    //Store the data into cache after fetching from database
    private async warmCache(chatId: number, messages: string[]): Promise<void> {
        try {
            const redis = RedisClient.getInstance();
            if (!redis.isReady() || messages.length === 0) {
                return;
            }

            const client = redis.getClient();
            const cacheKey = `chat:${chatId}:messages`;

            await client.del(cacheKey);
            await client.rPush(cacheKey, messages);

            await client.lTrim(cacheKey, -this.CACHE_MAX_MESSAGES, -1);

            await client.expire(cacheKey, this.CACHE_TTL);

            console.log(`[Cache] Stored data for chat: ${chatId} with ${messages.length} messages in cache`);
        } catch (error) {
            console.error('[Cache] Failed to warm cache:', error);
        }
    }
}
