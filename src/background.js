'use strict';

import { app, protocol, BrowserWindow, ipcMain } from 'electron';
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import Docxtemplater from 'docxtemplater';
const isDevelopment = process.env.NODE_ENV !== 'production';
var pizzip = require('pizzip');
var fs = require('fs');
const path = require('path');

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
// let dbpath = path.join(process.resourcesPath,"src","res", "db.sqlite");
// let dbpath=path.join(__dirname,"resources","src","res","db.sqlite");
let dbpath=path.join(path.dirname(process.execPath),"resources","src","res","db.sqlite");
console.log(dbpath);
var knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename:
            isDevelopment?'/home/lionel/Documents/programming/Web/openjur/openjur/src/res/test.sqlite':dbpath,
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

ipcMain.handle('setTimeByID', async (event, data) => {
    await knex('Times')
        .where({ ID: `${data.ID}` })
        .update(data);
});

ipcMain.handle('calculateTable', async (event, data) => {
    return calculateTable(data);
});

async function calculateTable(data) {
    let entries = data;
    for (let i = 0; i < entries.length; i++) {
        var user = await getUserByID(entries[i].UserID);
        var client = await getClientByID(entries[i].ClientID);
        entries[i].Amount = entries[i].Hours * user.Amount;
        entries[i].User = user.Name;
        entries[i].Client = client.Name;
    }
    return entries;
}

ipcMain.handle('getSettings', async (event, data) => {
    return await getSettings();
});

async function getSettings() {
    let entries = await knex('Settings').first();
    return entries;
}

ipcMain.handle('setSettings', async (event, data) => {
    await knex('Settings').first().update(data);
});

ipcMain.handle('exportToFile', async (event, data) => {
    let times = await knex
        .select('*')
        .from('Times')
        .where({
            ClientID: `${data}`,
        });
    let entries = await calculateTable(times);
    let total = 0;
    for (const entry of entries) {
        total += entry.Amount;
    }
    let settings = await getSettings();
    console.log(settings);
    let obj = {
        entries: entries,
        client: entries[0].Client,
        total: total + total * (settings.MWST / 100),
    };
    console.log(obj);
    return writeToFile(obj, settings);
});

function writeToFile(params, settings) {
    var content = fs.readFileSync(settings.TemplateFile, 'binary');
    var zip = new pizzip(content);
    var doc;
    try {
        doc = new Docxtemplater(zip);
    } catch (error) {
        console.log(error);
    }

    doc.setData(params);

    try {
        doc.render();
    } catch (error) {
        console.log(error);
    }

    var buf = doc.getZip().generate({ type: 'nodebuffer' });
    let p = `${path.join(
        path.dirname(settings.TemplateFile),
        params.client
    )}.docx`;
    fs.writeFileSync(p, buf);
    return p;
}

function generateID() {
    return Math.round(new Date(Date.now()).valueOf() / 100);
}

ipcMain.handle('addTime', async (event, data) => {
    let id = generateID();
    let entries = {
        ...data,
        ID: id,
    };
    console.log(entries);
    await knex('Times').insert(entries);
});

ipcMain.handle('getClients', async () => {
    let clients = await knex.select('*').from('Clients');
    return clients;
});

ipcMain.handle('getUsers', async () => {
    let users = await knex.select('*').from('Users');
    return users;
});

ipcMain.handle('getTimesByClientID', async (event, data) => {
    return await getTimesByClientID(data);
});

async function getTimesByClientID(id) {
    let times = await knex
        .select('*')
        .from('Times')
        .where({
            ClientID: `${id}`,
        });
    return times;
}

ipcMain.handle('getTimesByUserID', async (event, data) => {
    return await getTimesByUserID(data);
});

async function getTimesByUserID(id) {
    let times = await knex
        .select('*')
        .from('Times')
        .where({
            UserID: `${id}`,
        });
    return times;
}

ipcMain.handle('getClientByID', async (event, data) => {
    return getClientByID(data);
});

async function getClientByID(data) {
    let client = await knex
        .select('*')
        .from('Clients')
        .where({
            ID: `${data}`,
        });
    return client[0];
}

ipcMain.handle('getUserByID', async (event, data) => {
    return getUserByID(data);
});

async function getUserByID(data) {
    let users = await knex
        .select('*')
        .from('Users')
        .where({
            ID: `${data}`,
        });
    return users[0];
}

ipcMain.handle('getTimes', async (event, data) => {
    let times = await knex.select('*').from('Times');
    return times;
});

ipcMain.handle('deleteTimeByID', async (event, data) => {
    await knex('Times')
        .where({ ID: `${data}` })
        .del();
});

ipcMain.handle('addUser', async (event, data) => {
    let id = generateID();
    let entries = {
        Name: data.Name,
        Amount: data.Amount,
        ID: id,
    };
    console.log(entries);
    await knex('Users').insert(entries);
});

ipcMain.handle('setUserByID', async (event, data) => {
    let obj = {
        Name: data.Name,
        Amount: data.Amount,
        ID: data.ID,
    };
    await knex('Users')
        .where({ ID: `${obj.ID}` })
        .update(obj);
});

ipcMain.handle('deleteUserByID', async (event, data) => {
    let entries = await getTimesByUserID(data);
    console.log(entries);
    if (entries.length > 0) {
        return false;
    } else {
        await knex('Users')
            .where({
                ID: `${data}`,
            })
            .del();
        return true;
    }
});

ipcMain.handle('addClient', async (event, data) => {
    let id = generateID();
    let entries = {
        Name: data.Name,
        Address: data.Address,
        ID: id,
    };
    console.log(entries);
    await knex('Clients').insert(entries);
});

ipcMain.handle('setClientByID', async (event, data) => {
    let obj = {
        Name: data.Name,
        Address: data.Address,
        ID: data.ID,
    };
    await knex('Clients')
        .where({ ID: `${obj.ID}` })
        .update(obj);
});

ipcMain.handle('deleteClientByID', async (event, data) => {
    let entries = await getTimesByClientID(data);
    console.log(entries);
    if (entries.length > 0) {
        return false;
    } else {
        await knex('Clients')
            .where({
                ID: `${data}`,
            })
            .del();
        return true;
    }
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
