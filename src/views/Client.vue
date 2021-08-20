<template>
    <div id="Client">
        <div id="client-meta-section">
            <v-row class="align-center">
                <v-col>
                    <h1>{{ client.Name }}</h1>
                    <h3 v-for="(i, index) in addressLines" :key="index">
                        {{ i }}
                    </h3>
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
            :key="renderTable"
        />
        <v-btn depressed color="primary" @click="exportToFile">
            Export to File
        </v-btn>
        <v-row class="rm-m mt-5">
            <invoice-card
                v-for="item in invoices"
                :key="item.iD"
                @deleteSuccess="rerenderTable()"
                :invoice="item"
            />
        </v-row>
        <client-dialog
            :dialog="dialog"
            :isEdit="true"
            :editedItem="editedItem"
            @updateDialogStatus="updateDialogStatus"
        />
        <delete-dialog
            :dialog="deleteDialog"
            :editedItem="editedItem"
            invoke="deleteClientByID"
            route="/clients"
            @updateDialogStatus="updateDialogStatus"
            @failed="snackbar = true"
        />
        <failed-delete-snackbar
            :snackbar="snackbar"
            @closeSnackbar="snackbar = false"
        />
        <success-write-snackbar
            :snackbar="succSnackbar"
            @closeSnackbar="succSnackbar = false"
            :path="path"
        />
    </div>
</template>

<script>
const { ipcRenderer } = require('electron');
import DeleteDialog from '../components/DeleteDialog.vue';
import ClientDialog from '../components/ClientDialog.vue';
import FailedDeleteSnackbar from '../components/FailedDeleteSnackbar.vue';
import InvoiceCard from '../components/InvoiceCard.vue';
import SuccessWriteSnackbar from '../components/SuccessWriteSnackbar.vue';
import TimesheetTable from '../components/TimesheetTable.vue';
export default {
    components: { TimesheetTable },
    name: 'Client',
    data() {
        return {
            client: {},
            dialog: false,
            editedItem: {},
            deleteDialog: false,
            snackbar: false,
            succSnackbar: false,
            path: '',
            invoices: [],
            addressLines: null,
            renderTable: 0,
        };
    },
    components: {
        TimesheetTable,
        DeleteDialog,
        FailedDeleteSnackbar,
        SuccessWriteSnackbar,
        InvoiceCard,
        ClientDialog,
    },
    async mounted() {
        await this.getInvoices();
        await this.getData();
    },
    methods: {
        async getData() {
            let id = this.$route.params.id;
            ipcRenderer.invoke('getClientByID', id).then((data) => {
                console.log(data);
                this.client = data;
                this.addressLines = this.addressLines
                    ? this.client.Address.split('\n')
                    : '';
            });
        },
        async exportToFile() {
            this.$router.push(`/invoice/${this.$route.params.id}`);
        },
        openEditDialog(item) {
            this.dialog = true;
            this.editedItem = this.client;
        },
        openDeleteDialog(item) {
            this.editedItem = this.client;
            this.deleteDialog = true;
        },
        updateDialogStatus(params) {
            this.dialog = params;
            this.deleteDialog = params;
            this.editedItem = {
                Name: '',
                Address: '',
            };
            this.getData();
        },
        async getInvoices() {
            await ipcRenderer
                .invoke('getInvoicesByClientID', this.$route.params.id)
                .then((data) => {
                    console.log(data);
                    this.invoices = data;
                });
        },
        async rerenderTable() {
            console.log('rerender');
            await this.getInvoices();
            this.renderTable++;
            await this.getInvoices();
        },
    },
};
</script>

<style scoped>
.rm-m {
    margin: 0px;
}
</style>
