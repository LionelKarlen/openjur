<template>
    <div>
        <v-data-table
            :headers="
                this.alltimes != true ? this.headers : this.alltimesHeaders
            "
            :items="this.entries"
            hide-default-footer
            :items-per-page="-1"
        >
            <template v-slot:[`item.actions`]="{ item }">
                <v-icon small class="mr-2" @click="openEditDialog(item)">
                    mdi-pencil
                </v-icon>
                <v-icon small> mdi-delete </v-icon>
            </template>
        </v-data-table>
        <v-btn depressed color="primary" @click.stop="dialog = true"
            >Add Entry</v-btn
        >
        <edit-dialog
            :dialog="dialog"
            @updateDialogStatus="updateDialogStatus"
            :editedItem="editedItem"
            :isEdit="isEdit"
        />
    </div>
</template>

<script>
import EditDialog from './EditDialog.vue';
const { ipcRenderer } = require('electron');
export default {
    components: { EditDialog },
    name: 'TimesheetTable',
    props: ['invoke', 'arg', 'alltimes', 'user'],
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
                Text: 'beans',
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
                    entry.formattedDate = new Date(entry.Date * 1000)
                        .toISOString()
                        .substring(0, 10);
                }
                this.entries = entries;
                console.log(this.entries);
            });
        },
        updateDialogStatus(data) {
            this.dialog = data;
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
    },
};
</script>

<style></style>
