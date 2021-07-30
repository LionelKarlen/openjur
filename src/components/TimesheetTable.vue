<template>
    <div>
        <v-data-table
            :headers="
                this.alltimes != true ? this.headers : this.alltimesHeaders
            "
            :items="this.entries"
            group-by="InvoiceID"
            :group-desc="true"
            hide-default-footer
            :items-per-page="-1"
        >
            <template v-slot:[`group.header`]="{ group, isOpen, toggle }">
                <th colspan="6">
                    <v-icon @click="toggle" :ref="group" v-if="group !== ''">{{
                        !isOpen ? 'mdi-chevron-down' : 'mdi-chevron-up'
                    }}</v-icon>
                    {{ group }}
                </th>
            </template>
            <template v-slot:[`item.actions`]="{ item }">
                <v-icon small class="mr-2" @click="openEditDialog(item)">
                    mdi-pencil
                </v-icon>
                <v-icon small @click.stop="openDeleteDialog(item)">
                    mdi-delete
                </v-icon>
            </template>
        </v-data-table>
        <v-btn depressed color="primary" @click.stop="openAddDialog()"
            >Add Entry</v-btn
        >
        <edit-entry-dialog
            :dialog="dialog"
            @updateDialogStatus="updateDialogStatus"
            :editedItem="editedItem"
            :isEdit="isEdit"
        />
        <delete-dialog
            :dialog="deleteDialog"
            :editedItem="editedItem"
            invoke="deleteTimeByID"
            @updateDialogStatus="updateDialogStatus"
        />
    </div>
</template>

<script>
import DeleteDialog from './DeleteDialog.vue';
import EditEntryDialog from './EditEntryDialog.vue';
const { ipcRenderer } = require('electron');
import { formatDate } from '../backend/utils';
import Vue from 'vue';
export default {
    components: { EditEntryDialog, DeleteDialog },
    name: 'TimesheetTable',
    props: ['invoke', 'arg', 'alltimes', 'user', 'editID'],
    data() {
        return {
            dialog: false,
            isEdit: false,
            editedItem: {
                Date: '',
                Text: '',
                User: '',
                Hours: 0,
            },
            defaultItem: {
                Date: '',
                Text: '',
                User: '',
                Hours: 0,
            },
            entries: [],
            headers: [
                {
                    text: 'Date',
                    sortable: true,
                    value: 'formattedDate',
                },
                {
                    text: 'Text',
                    sortable: true,
                    value: 'Text',
                },
                {
                    text: !this.user ? 'User' : 'Client',
                    sortable: true,
                    value: !this.user ? 'User' : 'Client',
                },
                {
                    text: 'Hours',
                    sortable: true,
                    value: 'Hours',
                },
                {
                    text: 'Amount',
                    sortable: true,
                    value: 'Amount',
                },
                { text: 'Actions', value: 'actions', sortable: false },
            ],
            alltimesHeaders: [
                {
                    text: 'Date',
                    sortable: true,
                    value: 'formattedDate',
                },
                {
                    text: 'Text',
                    sortable: true,
                    value: 'Text',
                },
                {
                    text: 'Client',
                    sortable: true,
                    value: 'Client',
                },
                {
                    text: 'User',
                    sortable: true,
                    value: 'User',
                },
                {
                    text: 'Hours',
                    sortable: true,
                    value: 'Hours',
                },
                {
                    text: 'Amount',
                    sortable: true,
                    value: 'Amount',
                },
                { text: 'Actions', value: 'actions', sortable: false },
            ],
            deleteDialog: false,
        };
    },
    async mounted() {
        await this.getData();
    },
    methods: {
        async getData() {
            ipcRenderer.invoke(this.invoke, this.arg).then(async (data) => {
                let entries = await ipcRenderer.invoke('calculateTable', data);
                for (var entry of entries) {
                    entry.formattedDate = formatDate(entry.Date);
                }
                this.entries = entries;
                console.log(this.entries);
            });
        },
        updateDialogStatus(data) {
            this.dialog = data;
            this.deleteDialog = data;
            this.editedItem = this.defaultItem;
            this.isEdit = false;
            this.getData();
        },
        openEditDialog(item) {
            this.editedItem = item;
            this.dialog = true;
            console.log(this.editedItem);
            this.isEdit = true;
        },
        openAddDialog() {
            let date = new Date(Date.now()).valueOf() / 1000;
            this.editedItem = {
                Date: date,
                Text: '',
                UserID: !this.user ? null : this.editID,
                ClientID: !this.user ? this.editID : null,
                Hours: 0,
            };
            this.dialog = true;
            console.log(this.editedItem);
            this.isEdit = false;
        },
        openDeleteDialog(item) {
            this.editedItem = item;
            this.deleteDialog = true;
        },
    },
};
</script>

<style></style>
