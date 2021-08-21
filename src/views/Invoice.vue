<template>
    <v-form @submit.prevent="save">
        <v-container>
            <v-row>
                <v-col>
                    <v-select
                        v-model="selectedPerson"
                        :items="people"
                        item-text="Name"
                        item-value="ID"
                        :label="this.isUser ? 'User' : 'Client'"
                    />
                    <v-row>
                        <v-menu
                            ref="fromMenu"
                            v-model="fromMenu"
                            :close-on-content-click="false"
                            :return-value.sync="fromDate"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                    :value="`${pickerFormat(fromDate)}`"
                                    label="From"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker
                                v-model="fromDate"
                                no-title
                                scrollable
                            >
                                <v-spacer></v-spacer>
                                <v-btn
                                    text
                                    color="primary"
                                    @click="fromMenu = false"
                                    >Cancel</v-btn
                                >
                                <v-btn
                                    text
                                    color="primary"
                                    @click="$refs.fromMenu.save(fromDate)"
                                    >OK</v-btn
                                >
                            </v-date-picker>
                        </v-menu>
                        <v-menu
                            ref="toMenu"
                            v-model="toMenu"
                            :close-on-content-click="false"
                            :return-value.sync="toDate"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                    :value="pickerFormat(toDate)"
                                    label="To"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker v-model="toDate" no-title scrollable>
                                <v-spacer></v-spacer>
                                <v-btn
                                    text
                                    color="primary"
                                    @click="toMenu = false"
                                    >Cancel</v-btn
                                >
                                <v-btn
                                    text
                                    color="primary"
                                    @click="$refs.toMenu.save(toDate)"
                                    >OK</v-btn
                                >
                            </v-date-picker>
                        </v-menu>
                    </v-row>
                    <v-data-table
                        v-if="!isUser"
                        :headers="headers"
                        :items="extraCharges"
                        :items-per-page="-1"
                        hide-default-footer
                    >
                        <template v-slot:[`item.Actions`]="{ item }">
                            <v-icon small @click.stop="deleteDialog(item)">
                                mdi-delete
                            </v-icon>
                        </template>
                        <template v-slot:[`item.Amount`]="props">
                            <v-edit-dialog
                                :return-value.sync="props.item.Amount"
                                @save="saveEditDialog"
                                @open="openEditDialog"
                            >
                                {{ props.item.Amount }}
                                <template v-slot:input>
                                    <v-text-field
                                        v-model="props.item.Amount"
                                        :rules="[onlyNumbers]"
                                        label="Edit"
                                        single-line
                                    ></v-text-field>
                                </template>
                            </v-edit-dialog>
                        </template>
                        <template v-slot:[`item.Charge`]="props">
                            <v-edit-dialog
                                :return-value.sync="props.item.Charge"
                                @save="saveEditDialog"
                                @open="openEditDialog"
                            >
                                {{ props.item.Charge }}
                                <template v-slot:input>
                                    <v-text-field
                                        v-model="props.item.Charge"
                                        :rules="[notNull]"
                                        label="Edit"
                                        single-line
                                    ></v-text-field>
                                </template>
                            </v-edit-dialog>
                        </template>
                        <template v-slot:top>
                            <v-toolbar flat>
                                <v-toolbar-title>Extra Charges</v-toolbar-title>
                                <v-spacer></v-spacer>
                                <v-dialog
                                    v-model="dialog"
                                    max-width="500px"
                                    persistent
                                >
                                    <template v-slot:activator="{ on, attrs }">
                                        <v-btn
                                            color="primary"
                                            dark
                                            class="mb-2"
                                            v-bind="attrs"
                                            v-on="on"
                                        >
                                            Add Charge
                                        </v-btn>
                                    </template>
                                    <v-card>
                                        <v-card-title>
                                            <span class="text-h5"
                                                >Add Charge</span
                                            >
                                        </v-card-title>

                                        <v-card-text>
                                            <v-container>
                                                <v-row>
                                                    <v-col
                                                        cols="12"
                                                        sm="6"
                                                        md="4"
                                                    >
                                                        <v-text-field
                                                            v-model="
                                                                editedItem.Charge
                                                            "
                                                            label="Charge name"
                                                        ></v-text-field>

                                                        <v-text-field
                                                            v-model="
                                                                editedItem.Amount
                                                            "
                                                            label="Amount"
                                                        ></v-text-field>
                                                    </v-col>
                                                </v-row>
                                            </v-container>
                                        </v-card-text>

                                        <v-card-actions>
                                            <v-spacer></v-spacer>
                                            <v-btn
                                                color="blue darken-1"
                                                text
                                                @click="closeDialog"
                                            >
                                                Cancel
                                            </v-btn>
                                            <v-btn
                                                color="blue darken-1"
                                                text
                                                @click="saveDialog"
                                            >
                                                Save
                                            </v-btn>
                                        </v-card-actions>
                                    </v-card>
                                </v-dialog>
                            </v-toolbar>
                        </template>
                    </v-data-table>
                </v-col>
            </v-row>
        </v-container>
        <v-row>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
            <v-btn color="blue darken-1" text type="submit"> Export</v-btn>
        </v-row>
    </v-form>
</template>

<script>
const { ipcRenderer } = require('electron');
import { pickerFormat } from '../backend/utils';
export default {
    name: 'Invoice',
    props: ['isUser'],
    data() {
        return {
            dialog: false,
            editedItem: {},
            entries: [],
            sorted: [],
            fromDate: null,
            toDate: null,
            fromMenu: false,
            toMenu: false,
            selectedPerson: {},
            people: [],
            extraCharges: [],
            onlyNumbers: (value) => {
                const pattern = /[0-9]/;
                return pattern.test(value) || 'Only Numbers';
            },
            notNull: (value) => value.length > 0,
            headers: [
                {
                    text: 'Charge',
                    value: 'Charge',
                },
                {
                    text: 'Amount',
                    value: 'Amount',
                },
                {
                    text: 'Actions',
                    value: 'Actions',
                    align: 'right',
                },
            ],
        };
    },
    async mounted() {
        await this.getData();

        console.log(this.fromDate);
    },
    methods: {
        async getData() {
            this.people = this.isUser
                ? await ipcRenderer.invoke('getUsers')
                : await ipcRenderer.invoke('getClients');
            this.selectedPerson = this.people.filter((item) => {
                return item.ID == this.$route.params.id;
            })[0];
            if (!this.isUser) {
                this.entries = await ipcRenderer.invoke(
                    'getTimesByClientID',
                    this.selectedPerson.ID
                );
                this.sorted = this.entries.sort((a, b) => {
                    if (a.Date < b.Date) {
                        return -1;
                    }
                    if (a.Date > b.Date) {
                        return 1;
                    }
                    return 0;
                });
                console.log(this.sorted);
                this.fromDate = new Date(this.sorted[0].Date * 1000)
                    .toISOString()
                    .substring(0, 10);
                this.toDate = new Date(
                    this.sorted[this.sorted.length - 1].Date * 1000
                )
                    .toISOString()
                    .substring(0, 10);
                let settings = await ipcRenderer.invoke('getSettings');
                this.extraCharges =
                    settings.Charges.length > 0
                        ? settings.Charges.split('%').map((val) => {
                              return {
                                  Charge: val,
                                  Amount: 0,
                              };
                          })
                        : [];
            }
        },
        closeDialog() {
            this.dialog = false;
            this.editedItem = {};
        },
        saveDialog() {
            this.dialog = false;
            console.log(this.editedItem);
            this.extraCharges.push({
                Charge: this.editedItem.Charge,
                Amount: Number(this.editedItem.Amount),
            });
            this.editedItem = {};
        },
        openDialog() {
            this.dialog = true;
        },
        deleteDialog(item) {
            this.extraCharges.splice(this.extraCharges.indexOf(item), 1);
        },
        close() {
            this.$router.push(`/client/${this.$route.params.id}`);
        },
        saveEditDialog() {
            console.log('save edit Dialog');
        },
        closeEditDialog() {
            console.log('close edit dialog');
        },
        openEditDialog() {
            console.log('openEditDialog');
        },
        async save() {
            console.log(this.editedItem);
            let exportOptions = {
                FromDate: new Date(this.fromDate).getTime() / 1000,
                ToDate: new Date(this.toDate).getTime() / 1000,
                ID: this.selectedPerson.ID,
                ExtraCharges: this.extraCharges,
            };
            console.log(exportOptions);
            if (this.isUser) {
                ipcRenderer.invoke('exportUserToFile', exportOptions);
            } else {
                ipcRenderer.invoke('exportClientToFile', exportOptions);
            }
        },
        pickerFormat,
    },
};
</script>
