import { ipcMain, shell } from 'electron';
import Docxtemplater from 'docxtemplater';
import { formatDate, generateID, sortByName, safeRound } from './utils';
import { setUncaughtExceptionCaptureCallback } from 'process';
var pizzip = require('pizzip');
var fs = require('fs');
const path = require('path');

export default function registerHandlers(knex) {
    /// CALCULATE TABLE
    ipcMain.handle('calculateTable', async (event, data) => {
        return calculateTable(data);
    });

    async function calculateTable(data, override = false, doExport = false) {
        let entries = data;
        for (let i = 0; i < entries.length; i++) {
            var user = await getUserByID(entries[i].UserID);
            var client = await getClientByID(entries[i].ClientID);
            entries[i].User = user.Name;
            entries[i].Client = client.Name;
            if (entries[i].InvoiceID == null || override) {
                if (entries[i].IsFix == 0) {
                    var amount = await getAmount(client.ID, user.ID);
                    entries[i].Amount = entries[i].Hours * amount;
                }
                if (doExport) {
                    await knex('Times')
                        .where({
                            ID: `${entries[i].ID}`,
                        })
                        .update({
                            Amount: entries[i].Amount,
                        });
                }
            }
        }
        return entries;
    }

    /// EXPORT TO FILE
    ipcMain.handle('exportUserToFile', async (event, data) => {
        let times = await knex
            .select('*')
            .from('Times')
            .where({
                UserID: `${data.ID}`,
            })
            .andWhere('Date', '>=', data.FromDate)
            .andWhere('Date', '<=', data.ToDate);
        console.log(times);
        let entries = await calculateTable(times, true, true);
        let total = 0;
        for (let i = 0; i < entries.length; i++) {
            total += entries[i].Amount;
            entries[i].Date = formatDate(entries[i].Date);
        }
        let settings = await getSettings();
        let user = await getUserByID(data.ID);
        let date = new Date(Date.now()).getTime() / 1000;
        let extID = `${new Date(
            date * 1000
        ).getFullYear()}${settings.InvoiceID.toString()}`;
        let obj = {
            fromDate: formatDate(data.FromDate),
            toDate: formatDate(data.ToDate),
            date: formatDate(date),
            entries: entries,
            userName: user.Name,
            total: total,
        };
        console.log(obj);
        let p = `${path.join(
            path.dirname(settings.ClientTemplateFile),
            'export',
            extID
        )}.docx`;
        let success = writeToFile(obj, settings, p, true);
        if (success) {
            let invobj = {
                ID: settings.InvoiceID,
                UserID: user.ID,
                Path: p,
                Date: date,
                ExtID: extID,
                Amount: total,
            };
            addInvoice(invobj);
            settings.InvoiceID++;
            setSettings(settings);
        }
        shell.openPath(p);
    });

    ipcMain.handle('exportClientToFile', async (event, data) => {
        let times = await knex
            .select('*')
            .from('Times')
            .where({
                ClientID: `${data.ID}`,
                InvoiceID: null,
            })
            .andWhere('Date', '>=', data.FromDate)
            .andWhere('Date', '<=', data.ToDate);
        console.log(times);
        let entries = await calculateTable(times, true, true);
        let clientTotal = 0;
        for (let i = 0; i < entries.length; i++) {
            clientTotal += entries[i].Amount;
            entries[i].Date = formatDate(entries[i].Date);
        }
        let chargeTotal = 0;
        for (let i = 0; i < data.ExtraCharges.length; i++) {
            chargeTotal += data.ExtraCharges[i].Amount;
        }
        let client = await getClientByID(data.ID);
        let settings = await getSettings();
        console.log(settings);
        let date = new Date(Date.now()).getTime() / 1000;
        let extID = `${new Date(
            date * 1000
        ).getFullYear()}${settings.InvoiceID.toString()}`;
        let subTotal = clientTotal + chargeTotal;
        let mwstTotal = safeRound(subTotal * (settings.MWST / 100), 1);
        let total = subTotal + mwstTotal;
        let obj = {
            fromDate: formatDate(data.FromDate),
            toDate: formatDate(data.ToDate),
            date: formatDate(date),
            entries: entries,
            extraCharges: data.ExtraCharges,
            clientName: client.Name,
            clientAddress: client.Address,
            mwst: `${settings.MWST}%`,
            subTotal: subTotal.toFixed(2),
            mwstTotal: mwstTotal.toFixed(2),
            total: total.toFixed(2),
            clientTotal: clientTotal.toFixed(2),
            chargeTotal: chargeTotal.toFixed(2),
            invoiceID: settings.InvoiceID,
        };
        console.log(obj);
        let p = `${path.join(
            path.dirname(settings.ClientTemplateFile),
            'export',
            extID
        )}.docx`;
        let success = writeToFile(obj, settings, p, false);
        if (success) {
            let invobj = {
                ID: settings.InvoiceID,
                ClientID: client.ID,
                Path: p,
                Date: date,
                ExtID: extID,
                Amount: total,
            };
            addInvoice(invobj);
            for (const time of times) {
                await knex('Times')
                    .where({
                        ID: `${time.ID}`,
                    })
                    .update({
                        InvoiceID: settings.InvoiceID,
                    });
            }
            settings.InvoiceID++;
            setSettings(settings);
        }
        shell.openPath(p);
        return success;
    });

    function writeToFile(params, settings, p, isUser = false) {
        let path = isUser
            ? settings.UserTemplateFile
            : settings.ClientTemplateFile;
        console.log(path);
        var content = fs.readFileSync(path, 'binary');
        var zip = new pizzip(content);
        var doc;
        try {
            doc = new Docxtemplater(zip, { linebreaks: true });
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
        fs.writeFileSync(p, buf);
        return p;
    }

    /// SETTINGS
    ipcMain.handle('getSettings', async (event, data) => {
        return await getSettings();
    });

    async function getSettings() {
        let entries = await knex('Settings').first();
        if (entries.ClientTemplateFile == null) {
            await setSettings({
                ClientTemplateFile: path.join(
                    process.resourcesPath,
                    'defaultFiles',
                    'template.docx'
                ),
            });
        }
        return entries;
    }

    ipcMain.handle('setSettings', async (event, data) => {
        return await setSettings(data);
    });

    async function setSettings(data) {
        return await knex('Settings').first().update(data);
    }

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
        return await getClients();
    });

    async function getClients() {
        let clients = await knex.select('*').from('Clients');
        return clients.sort(sortByName);
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

    ipcMain.handle('addClient', async (event, data) => {
        let id = generateID();
        let entries = {
            Name: data.Name,
            Address: data.Address,
            ID: id,
        };
        console.log(entries);
        await knex('Clients').insert(entries);
        let users = await getUsers();
        let wages = [];
        for (const entry of users) {
            let obj = {
                ClientID: entries.ID,
                UserID: entry.ID,
                Amount: entry.Amount,
            };
            wages.push(obj);
        }
        await addWages(wages);
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
            await knex('Wages')
                .where({
                    ClientID: `${data}`,
                })
                .del();
            return true;
        }
    });

    /// USERS
    ipcMain.handle('getUsers', async () => {
        return await getUsers();
    });

    async function getUsers() {
        let users = await knex.select('*').from('Users');
        return users.sort(sortByName);
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

    ipcMain.handle('addUser', async (event, data) => {
        let id = generateID();
        let entries = {
            Name: data.Name,
            Amount: data.Amount,
            ID: id,
        };
        console.log(entries);
        await knex('Users').insert(entries);
        let clients = await getClients();
        let wages = [];
        for (const client of clients) {
            let obj = {
                ClientID: client.ID,
                UserID: entries.ID,
                Amount: entries.Amount,
            };
            wages.push(obj);
        }
        await addWages(wages);
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
            await knex('Wages')
                .where({
                    UserID: `${data}`,
                })
                .del();
            return true;
        }
    });

    /// INVOICES
    ipcMain.handle('getInvoiceByID', async (event, data) => {
        let da = await knex
            .select('*')
            .from('Invoices')
            .where({
                ID: `${data}`,
            });
        console.log(da);
        return da[0];
    });

    ipcMain.handle('getInvoicesByClientID', async (event, data) => {
        await validateInvoices(data);
        return await getInvoicesByClientID(data);
    });
    async function getInvoicesByClientID(id) {
        return await knex
            .select('*')
            .from('Invoices')
            .where({
                ClientID: `${id}`,
            });
    }

    ipcMain.handle('getInvoicesByUserID', async (event, data) => {
        await validateInvoices(data, true);
        return await getInvoicesByUserID(data);
    });
    async function getInvoicesByUserID(id) {
        return await knex
            .select('*')
            .from('Invoices')
            .where({ UserID: `${id}` });
    }

    async function addInvoice(data) {
        return await knex('Invoices').insert(data);
    }

    async function validateInvoices(id, isUser = false) {
        let invoices = isUser
            ? await getInvoicesByUserID(id)
            : await getInvoicesByClientID(id);
        for (const invoice of invoices) {
            fs.stat(invoice.Path, async (err, stat) => {
                if (err == null) return;
                console.log(err.code);
                if (err.code == 'ENOENT') {
                    await knex
                        .select('*')
                        .from('Times')
                        .where({
                            InvoiceID: invoice.ID,
                            IsFix: 0,
                        })
                        .update({
                            Amount: null,
                        });
                    await knex
                        .select('*')
                        .from('Times')
                        .where({
                            InvoiceID: invoice.ID,
                        })
                        .update({
                            InvoiceID: null,
                        });
                    await knex
                        .select('*')
                        .from('Invoices')
                        .where({
                            ID: invoice.ID,
                        })
                        .del();
                }
            });
        }
        return true;
    }

    ipcMain.handle('openFile', async (event, data) => {
        shell.openPath(data);
    });

    ipcMain.handle('deleteFile', async (event, data) => {
        fs.unlink(data, (err) => {
            if (err) {
                return false;
            }
            return true;
        });
        return true;
    });

    /// AMOUNTS
    ipcMain.handle('getAmountsByUserID', async (event, data) => {
        return await getAmountsByUserID(data);
    });

    async function getAmountsByUserID(UserID) {
        let obj = await knex
            .select('*')
            .from('Wages')
            .where({
                UserID: `${UserID}`,
            });
        for (var entry of obj) {
            let name = await getClientByID(entry.ClientID);
            entry.Client = name.Name;
        }
        return obj;
    }

    async function getAmount(ClientID, UserID) {
        let obj = await knex
            .select('*')
            .from('Wages')
            .where({
                ClientID: `${ClientID}`,
                UserID: `${UserID}`,
            });
        if (obj.length > 0) {
            return obj[0].Amount;
        }
        return null;
    }

    ipcMain.handle('setWages', async (event, data) => {
        for (const entry of data) {
            await knex
                .select('*')
                .from('Wages')
                .where({
                    ClientID: `${entry.ClientID}`,
                    UserID: `${entry.UserID}`,
                })
                .update({
                    Amount: Number(entry.Amount),
                });
        }
    });

    async function addWages(data) {
        for (const entry of data) {
            await knex('Wages').insert(entry);
        }
    }
}
