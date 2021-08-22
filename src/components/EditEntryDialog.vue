<template>
    <v-dialog v-model="dialog" max-width="1500px" persistent>
        <v-card>
            <v-card-title>
                <span class="text-h5">{{
                    isEdit ? 'Edit Entry' : 'New Entry'
                }}</span>
            </v-card-title>

            <v-tabs fixed-tabs v-model="tab">
                <v-tab> Hourly </v-tab>
                <v-tab> Fixed </v-tab>
                <v-tab-item v-for="i in 2" :key="i">
                    <v-card-text>
                        <v-form @submit.prevent="save">
                            <v-container>
                                <v-row>
                                    <v-col>
                                        <v-menu
                                            ref="menu"
                                            v-model="menu"
                                            :close-on-content-click="false"
                                            :return-value.sync="picker"
                                            transition="scale-transition"
                                            offset-y
                                            min-width="290px"
                                        >
                                            <template
                                                v-slot:activator="{ on, attrs }"
                                            >
                                                <v-text-field
                                                    :value="
                                                        pickerFormat(picker)
                                                    "
                                                    label="Date"
                                                    prepend-icon="mdi-calendar"
                                                    readonly
                                                    v-bind="attrs"
                                                    v-on="on"
                                                ></v-text-field>
                                            </template>
                                            <v-date-picker
                                                v-model="picker"
                                                no-title
                                                scrollable
                                            >
                                                <v-spacer></v-spacer>
                                                <v-btn
                                                    text
                                                    color="primary"
                                                    @click="menu = false"
                                                    >Cancel</v-btn
                                                >
                                                <v-btn
                                                    text
                                                    color="primary"
                                                    @click="
                                                        $refs.menu.save(picker)
                                                    "
                                                    >OK</v-btn
                                                >
                                            </v-date-picker>
                                        </v-menu>
                                        <v-combobox
                                            v-model="text"
                                            :items="textPropose"
                                            label="Text"
                                        >
                                        </v-combobox>
                                        <v-select
                                            v-model="client"
                                            :items="clients"
                                            item-text="Name"
                                            item-value="ID"
                                            label="Client"
                                        >
                                        </v-select>
                                        <v-select
                                            v-model="user"
                                            :items="users"
                                            item-text="Name"
                                            item-value="ID"
                                            label="User"
                                        >
                                        </v-select>
                                        <v-text-field
                                            v-if="i == 1"
                                            label="Hours"
                                            v-model="hours"
                                            suffix="Hours"
                                        ></v-text-field>
                                        <v-text-field
                                            v-else
                                            label="Amount"
                                            v-model="amount"
                                            suffix="CHF"
                                        >
                                        </v-text-field>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-form>
                    </v-card-text>
                </v-tab-item>
            </v-tabs>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">
                    Cancel
                </v-btn>
                <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
const { ipcRenderer } = require('electron');
import { pickerFormat } from '../backend/utils';
export default {
    name: 'EditEntryDialog',
    props: ['dialog', 'editedItem', 'isEdit'],
    data() {
        return {
            valid: false,
            picker: new Date(
                Date.now() - new Date().getTimezoneOffset() * 60000
            )
                .toISOString()
                .substr(0, 10),
            client: {},
            clients: [],
            user: {},
            users: [],
            text: '',
            textPropose: [],
            hours: 0,
            menu: false,
            tab: null,
            amount: null,
        };
    },
    async mounted() {
        let settings = await ipcRenderer.invoke('getSettings');
        this.textPropose =
            settings.Suggestions.length > 0
                ? settings.Suggestions.split('%')
                : [];
        console.log(this.tab);
    },
    methods: {
        close() {
            this.$emit('updateDialogStatus', false);
        },
        async save() {
            console.log(this.editedItem);
            console.log(this.tab);
            let obj = {
                Date: new Date(this.picker).getTime() / 1000,
                ClientID: this.client,
                UserID: this.user,
                Text: this.text,
                Hours: Number(this.hours),
                ID: this.editedItem.ID,
                IsFix: this.tab,
            };
            if (this.tab == 1) {
                obj.Amount = Number(this.amount);
            }
            console.log(obj);
            if (this.isEdit) {
                await ipcRenderer.invoke('setTimeByID', obj);
            } else {
                await ipcRenderer.invoke('addTime', obj);
            }
            this.$emit('updateDialogStatus', false);
        },
        pickerFormat,
    },
    watch: {
        dialog: async function (newVal, oldVal) {
            if (newVal) {
                this.users = await ipcRenderer.invoke('getUsers');
                this.clients = await ipcRenderer.invoke('getClients');
                this.client = this.editedItem.ClientID;
                this.user = this.editedItem.UserID;
                this.text = this.editedItem.Text;
                this.hours = this.editedItem.Hours;
                this.picker = new Date(this.editedItem.Date * 1000)
                    .toISOString()
                    .substring(0, 10);
                this.tab = this.editedItem.IsFix;
            } else {
                this.user = {};
                this.client = {};
                this.text = '';
                this.hours = 0;
            }
        },
    },
};
</script>

<style></style>
