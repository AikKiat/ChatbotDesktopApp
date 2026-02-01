import { app, BrowserWindow } from 'electron';
import * as path from 'path';

// Register all IPC handlers (side-effect imports)
import './ipc/ai';
import './ipc/chat_titles';
import './ipc/chat_messages';
import './ipc/aws_login';

// Import AI sidecar service
import { AISidecarService } from './services/ai_sidecar_service';

const aiSidecar = AISidecarService.getInstance();


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

    mainWindow.loadURL("http://localhost:5173");
}

// App lifecycle
app.whenReady().then(async () => {

    createMainWindow();
    // Start Python AI sidecar
    try {
        await aiSidecar.start();
        console.log('[Main] AI Sidecar started');
    } catch (error) {
        console.error('[Main] Failed to start AI Sidecar:', error);
    }
});


app.on('before-quit', (event) => {
    console.log('[Main] Shutting down AI Sidecar...');
    aiSidecar.stop(); //Synchronous call, will block until done here. We want to do this because the system can exit before the child process of the python sidecar is even killed.
    console.log('[Main] AI Sidecar shut down successfully');
});
