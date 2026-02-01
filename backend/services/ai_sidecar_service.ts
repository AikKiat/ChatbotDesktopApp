/**
 * AI Sidecar Service - Manages Python FastAPI process
 * Spawns Python server, handles lifecycle, and streams AI responses
 */

import { spawn, ChildProcess, exec, execSync } from 'child_process';
import * as path from 'path';
import fs from "fs";

export interface AIStreamChunk {
    type: 'thought' | 'token' | 'title' | 'done' | 'error';
    content?: string;
    chat_title?: string;
}

export class AISidecarService {
    private static instance: AISidecarService;
    private pythonProcess: ChildProcess | null = null;
    private pythonPort = 8000;
    private pythonHost = '127.0.0.1';
    private isReady = false;
    private startupPromise: Promise<void> | null = null;

    private constructor() {}

    static getInstance(): AISidecarService {
        if (!AISidecarService.instance) {
            AISidecarService.instance = new AISidecarService();
        }
        return AISidecarService.instance;
    }

    /**
     * Start the Python FastAPI server
     */
    async start(): Promise<void> {
        if (this.pythonProcess) {
            console.log('[AI Sidecar] Already running');
            return;
        }

        if (this.startupPromise) {
            return this.startupPromise;
        }

        this.startupPromise = new Promise((resolve, reject) => {
            const aiModulePath = path.join(__dirname, '../../../ai_module');
            
            console.log('[AI Sidecar] Starting Python server...');
            console.log('[AI Sidecar] Module path:', aiModulePath);

            // 2. DEBUG: Check if the folder actually exists
            if (!fs.existsSync(aiModulePath)) {
                console.error(`[Main] ERROR: Folder not found at ${aiModulePath}`);
            } else {
                console.log(`[Main] Found ai_module at: ${aiModulePath}`);
            }

            // 3. Spawn with the correct directory
            this.pythonProcess = spawn('python', [
                '-m', 
                'uvicorn', 
                'main:app', 
                '--host', '127.0.0.1', 
                '--port', '8000'
            ], {
                cwd: aiModulePath,
                shell: false,
                env: process.env
            });

            this.pythonProcess.on('error', (err) => {
                console.error('Failed to start subprocess.', err);
            });


            this.pythonProcess.stdout?.on('data', (data) => {
                const output = data.toString();
                console.log('[AI Sidecar]', output);

                if (output.includes('Uvicorn running') || output.includes('Application startup complete')) {
                    this.isReady = true;
                    console.log('[AI Sidecar] ✓ Server ready');
                    resolve();
                }
            });

            // Handle stderr
            this.pythonProcess.stderr?.on('data', (data) => {
                const error = data.toString();
                console.error('[AI Sidecar Error]', error);
                
                // Check for critical errors
                if (error.includes('Error') || error.includes('Exception')) {
                    if (!this.isReady) {
                        reject(new Error(`Python startup failed: ${error}`));
                    }
                }
            });

            // Handle process exit
            this.pythonProcess.on('exit', (code, signal) => {
                console.log(`[AI Sidecar] Process exited (code: ${code}, signal: ${signal})`);
                this.pythonProcess = null;
                this.isReady = false;
                this.startupPromise = null;
            });

            this.pythonProcess.on('error', (err) => {
                console.error('[AI Sidecar] Failed to start:', err);
                reject(err);
            });

            // // Timeout if server doesn't start in 10 seconds
            // setTimeout(() => {
            //     if (!this.isReady) {
            //         reject(new Error('Python server startup timeout'));
            //     }
            // }, 10000);
        });

        return this.startupPromise;
    }

    /**
     * Stop the Python server
     */

    stop(): void {
        if (this.pythonProcess && this.pythonProcess.pid) {
            const pid = this.pythonProcess.pid;
            console.log(`[AI Sidecar] Attempting to kill process tree for PID: ${pid}`);

            if (process.platform === 'win32') {
                // Use exec to run the command exactly as you would in CMD
                try{
                    execSync(`taskkill /F /T /PID ${pid}`);
                    console.log('[AI Sidecar] Process tree terminated successfully');
                } catch(error){
                    console.error('[AI Sidecar] Kill failed (process might already be dead)');
                }
            } else {
                this.pythonProcess.kill('SIGTERM');
            }

            this.pythonProcess = null;
            this.isReady = false;
            this.startupPromise = null;
        }
    }

    /**
     * Stream AI response from Python via SSE
     */
    async* streamPrompt(prompt: string, chatId: number, recentMessages : string[], currentTitle : string): AsyncGenerator<AIStreamChunk> {
        if (!this.isReady) {
            await this.start();
        }

        console.log("PROMPT", prompt);

        const url = `http://${this.pythonHost}:${this.pythonPort}/chat/stream`;



    //     class ChatRequest(BaseModel):
    // prompt: str
    // chat_id: int = 0
    
    // #These other key details as well!!!
    // recent_messages: List[str]  
    // current_title: str
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ "prompt" : prompt, "chat_id": chatId, "recent_messages" : recentMessages, "current_title" : currentTitle})
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error('No response body');
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                // Decode chunk
                buffer += decoder.decode(value, { stream: true });

                // Process SSE events (format: "data: {...}\n\n")
                const lines = buffer.split('\n\n');
                buffer = lines.pop() || ''; // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonStr = line.slice(6); // Remove "data: " prefix
                        try {
                            const chunk: AIStreamChunk = JSON.parse(jsonStr);
                            yield chunk;

                            // Stop if done
                            if (chunk.type === 'done') {
                                return;
                            }
                        } catch (e) {
                            console.error('[AI Sidecar] Failed to parse SSE:', jsonStr);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('[AI Sidecar] Stream error:', error);
            yield {
                type: 'error',
                content: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }


    getIsReady(): boolean {
        return this.isReady;
    }


    getServerUrl(): string {
        return `http://${this.pythonHost}:${this.pythonPort}`;
    }
}
