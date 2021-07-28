import { ipcMain } from 'electron';
import Docxtemplater from 'docxtemplater';
import { formatDate, generateID, sortByName } from './utils';
var pizzip = require('pizzip');
var fs = require('fs');
const path = require('path');

export default function registerHandlers(knex) {
    /// CALCULATE TABLE
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

    /// EXPORT TO FILE
    ipcMain.handle('exportToFile', async (event, data) => {
        let times = await knex
            .select('*')
            .from('Times')
            .where({
                ClientID: `${data}`,
            });
        let entries = await calculateTable(times);
        let total = 0;
        for (let i = 0; i < entries.length; i++) {
            total += entries[i].Amount;
            entries[i].Date = formatDate(entries[i].Date);
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

        var buf = doc.getZip().generate({
            type: 'nodebuffer',
        });
        let p = `${path.join(
            path.dirname(settings.TemplateFile),
            params.client
        )}.docx`;
        fs.writeFileSync(p, buf);
        return p;
    }

    /// SETTINGS
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

    /// TIMES
    ipcMain.handle('setTimeByID', async (event, data) => {
        await knex('Times')
            .where({
                ID: `${data.ID}`,
            })
            .update(data);
    });

    ipcMain.handle('addTime', async (event, data) => {
        let id = generateID();
        let entries = {
            ...data,
            ID: id,
        };
        console.log(entries);
        await knex('Times').insert(entries);
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

    ipcMain.handle('getTimes', async (event, data) => {
        let times = await knex.select('*').from('Times');
        return times;
    });

    ipcMain.handle('deleteTimeByID', async (event, data) => {
        await knex('Times')
            .where({
                ID: `${data}`,
            })
            .del();
    });

    /// CLIENTS
    ipcMain.handle('getClients', async () => {
        let clients = await knex.select('*').from('Clients');
        return clients.sort(sortByName);
    });

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
            .where({
                ID: `${obj.ID}`,
            })
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

    /// USERS
    ipcMain.handle('getUsers', async () => {
        let users = await knex.select('*').from('Users');
        return users.sort(sortByName);
    });

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
            .where({
                ID: `${obj.ID}`,
            })
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
}
