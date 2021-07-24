<template>
    <div id="Client">
        <div id="client-meta-section">
            <v-row class="align-center">
                <v-col>
                    <h1>{{ client.Name }}</h1>
                    <h3>{{ client.Address }}</h3>
                </v-col>
                <v-spacer></v-spacer>
                <v-icon class="mr-2" @click="openEditDialog(client)">
                    mdi-pencil
                </v-icon>
                <v-icon @click.stop="openDeleteDialog(client)">
                    mdi-delete
                </v-icon>
            </v-row>
        </div>
        <timesheet-table
            invoke="getTimesByClientID"
            :arg="this.$route.params.id"
            :user="false"
            :editID="this.client.ID"
        />
        <v-btn depressed color="primary" @click="exportToFile">
            Export to File
        </v-btn>
        <edit-dialog
            :dialog="dialog"
            :isEdit="true"
            :editedItem="editedItem"
            :isUser="false"
            @updateDialogStatus="updateDialogStatus"
        />
    </div>
</template>

<script>
import EditDialog from '../components/EditDialog.vue';
const { ipcRenderer } = require('electron');
import TimesheetTable from '../components/TimesheetTable.vue';
export default {
    components: { TimesheetTable },
    name: 'Client',
    data() {
        return {
            client: {},
            dialog: false,
            editedItem: {},
        };
    },
    components: {
        TimesheetTable,
        EditDialog,
    },
    async mounted() {
        await this.getData();
    },
    methods: {
        async getData() {
            let id = this.$route.params.id;
            ipcRenderer.invoke('getClientByID', id).then((data) => {
                console.log(data);
                this.client = data;
            });
        },
        exportToFile() {
            ipcRenderer.invoke('exportToFile', this.$route.params.id);
        },
        openEditDialog(item) {
            this.dialog = true;
            this.editedItem = this.client;
        },
        updateDialogStatus(params) {
            this.dialog = params;
            this.editedItem = {
                Name: '',
                Address: '',
            };
            this.getData();
        },
    },
};
</script>

<style></style>
