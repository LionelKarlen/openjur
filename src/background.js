'use strict';

import { app, protocol, BrowserWindow, ipcMain } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
const isDevelopment = process.env.NODE_ENV !== 'production';

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
    {
        scheme: 'app',
        privileges: {
            secure: true,
            standard: true,
        },
    },
]);

console.log('STARTING DB');
var knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename:
            '/home/lionel/Documents/programming/Web/openjur/openjur/src/res/test.sqlite',
    },
});

var win;

async function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            // Use pluginOptions.nodeIntegration, leave this alone
            // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
            nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
            contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
        },
    });

    win.setMenuBarVisibility(false);

    if (process.env.WEBPACK_DEV_SERVER_URL) {
        // Load the url of the dev server if in development mode
        await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
        if (!process.env.IS_TEST) win.webContents.openDevTools();
    } else {
        createProtocol('app');
        // Load the index.html when not in development
        win.loadURL('app://./index.html');
        win.once('ready-to-show', () => {
            console.log('start');
            win.show();
            let clients = knex.select('*').from('Clients');
            clients.then(function (data) {
                console.log(data);
            });
        });
    }
}

ipcMain.handle('getClients', async () => {
    let clients = await knex.select('*').from('Clients');
    return clients;
});

ipcMain.handle('getUsers', async () => {
    let users = await knex.select('*').from('Users');
    return users;
});

ipcMain.handle('getTimesByClientID', async (event, data) => {
    let times = await knex
        .select('*')
        .from('Times')
        .where({
            ClientID: `${data}`,
        });
    return times;
});

ipcMain.handle('getTimesByUserID', async (event, data) => {
    let times = await knex
        .select('*')
        .from('Times')
        .where({
            UserID: `${data}`,
        });
    return times;
});

ipcMain.handle('getClientByID', async (event, data) => {
    let client = await knex
        .select('*')
        .from('Clients')
        .where({
            ID: `${data}`,
        });
    return client[0];
});

ipcMain.handle('getUserByID', async (event, data) => {
    let users = await knex
        .select('*')
        .from('Users')
        .where({
            ID: `${data}`,
        });
    return users[0];
});

ipcMain.handle('getTimes', async (event, data) => {
    let times = await knex.select('*').from('Times');
    return times;
});
// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
    if (isDevelopment && !process.env.IS_TEST) {
        // Install Vue Devtools
        try {
            await installExtension(VUEJS_DEVTOOLS);
        } catch (e) {
            console.error('Vue Devtools failed to install:', e.toString());
        }
    }
    createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
    if (process.platform === 'win32') {
        process.on('message', (data) => {
            if (data === 'graceful-exit') {
                app.quit();
            }
        });
    } else {
        process.on('SIGTERM', () => {
            app.quit();
        });
    }
}
