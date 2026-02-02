import { app, BrowserWindow } from 'electron';
import * as path from 'path';


import './ipc/ai';
import './ipc/chat_titles';
import './ipc/chat_messages';
import './ipc/aws_login';


import { AISidecarService } from './services/ai_sidecar_service';
import { RedisClient } from './db/redis';

const aiSidecar = AISidecarService.getInstance();
const redisClient = RedisClient.getInstance();


function createMainWindow(){
    const mainWindow = new BrowserWindow({
        title : 'Chatbot App',
        width : 1000,
        height : 600,
        webPreferences: {
            preload: path.join(__dirname, "preload_gateway/gateway_routes.js"),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadURL(process.env.CLIENT_URL || "http://localhost:5173");
}

// App lifecycle
app.whenReady().then(async () => {

    createMainWindow();
    
    //Init the Redis Client here.
    try {
        await redisClient.connect();
        console.log('[Main] Redis connected');
    } catch (error) {
        console.error('[Main] Failed to connect to Redis (continuing without cache):', error);
    }

    //Init the Python sidecar
    try {
        await aiSidecar.start();
        console.log('[Main] AI Sidecar started');
    } catch (error) {
        console.error('[Main] Failed to start AI Sidecar:', error);
    }
});


app.on('before-quit', (event) => {
    console.log('[Main] Shutting down...');
    
    
    redisClient.disconnect()
        .then(() => console.log('[Main] Redis disconnected'))
        .catch(err => console.error('[Main] Redis disconnect error:', err));
    
    
    aiSidecar.stop(); //Synchronous call, will block until done here. We want to do this because the system can exit before the child process of the python sidecar is even killed.
    console.log('[Main] Shutdown complete');
});
