/**
 * Redis Client Singleton
 * Handles connection and provides singleton instance
 */

import { createClient, RedisClientType } from 'redis';

export class RedisClient {
    private static instance: RedisClient;
    private client: RedisClientType;
    private isConnected: boolean = false;

    private constructor() {
        this.client = createClient({
            // password: process.env.REDIS_PASSWORD,
            socket: {
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT) || 6379,
            },
        });

        // Error handling
        this.client.on('error', (err) => {
            console.error('[Redis] Connection error:', err);
            this.isConnected = false;
        });

        this.client.on('connect', () => {
            console.log('[Redis] Connected successfully');
            this.isConnected = true;
        });

        this.client.on('disconnect', () => {
            console.log('[Redis] Disconnected');
            this.isConnected = false;
        });
    }

    public static getInstance(): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient();
        }
        return RedisClient.instance;
    }

    public async connect(): Promise<void> {
        if (!this.isConnected) {
            try {
                await this.client.connect();
            } catch (error) {
                console.error('[Redis] Failed to connect:', error);
                throw error;
            }
        }
    }

    public async disconnect(): Promise<void> {
        if (this.isConnected) {
            await this.client.disconnect();
        }
    }

    public getClient(): RedisClientType {
        return this.client;
    }

    public isReady(): boolean {
        return this.isConnected;
    }
}
