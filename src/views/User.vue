<template>
    <div id="User">
        <div id="user-meta-section">
            <v-row class="align-center">
                <v-col>
                    <h1>{{ user.Name }}</h1>
                    <h3>{{ user.Amount }}</h3>
                </v-col>
                <v-spacer></v-spacer>
                <v-icon class="mr-2" @click="openEditDialog(user)">
                    mdi-pencil
                </v-icon>
                <v-icon @click.stop="openDeleteDialog(user)">
                    mdi-delete
                </v-icon>
            </v-row>
        </div>
        <timesheet-table
            invoke="getTimesByUserID"
            :arg="this.$route.params.id"
            :user="true"
            :editID="this.user.ID"
            :key="renderTable"
        />
        <v-btn depressed color="primary" @click="exportToFile"> Export </v-btn>
        <!-- <v-btn depressed color="primary" @click="openFolder"> Open Folder</v-btn> -->
        <user-dialog
            :dialog="dialog"
            :isEdit="true"
            :editedItem="editedItem"
            @updateDialogStatus="updateDialogStatus"
        />
        <delete-dialog
            :dialog="deleteDialog"
            :editedItem="editedItem"
            invoke="deleteUserByID"
            route="/users"
            @updateDialogStatus="updateDialogStatus"
            @failed="snackbar = true"
        />
        <failed-delete-snackbar
            :snackbar="snackbar"
            @closeSnackbar="snackbar = false"
        />
        <v-row class="rm-m mt-5">
            <invoice-card
                v-for="item in invoices"
                :key="item.iD"
                :invoice="item"
                @deleteSuccess="rerenderTable()"
            />
        </v-row>
    </div>
</template>

<script>
import DeleteDialog from '../components/DeleteDialog.vue';
import EditDialog from '../components/EditDialog.vue';
import FailedDeleteSnackbar from '../components/FailedDeleteSnackbar.vue';
const { ipcRenderer } = require('electron');
import TimesheetTable from '../components/TimesheetTable.vue';
import UserDialog from '../components/UserDialog.vue';
import InvoiceCard from '../components/InvoiceCard.vue';
export default {
    name: 'User',
    data() {
        return {
            entries: [],
            user: {},
            dialog: false,
            editedItem: {},
            deleteDialog: false,
            snackbar: false,
            invoices: [],
            renderTable: 0,
        };
    },
    components: {
        TimesheetTable,
        EditDialog,
        DeleteDialog,
        FailedDeleteSnackbar,
        UserDialog,
        InvoiceCard,
    },
    async mounted() {
        await this.getInvoices();
        await this.getData();
    },
    methods: {
        async getData() {
            let id = this.$route.params.id;
            ipcRenderer.invoke('getUserByID', id).then((data) => {
                console.log(data);
                this.user = data;
            });
        },
        async getInvoices() {
            await ipcRenderer
                .invoke('getInvoicesByUserID', this.$route.params.id)
                .then((data) => {
                    console.log(data);
                    this.invoices = data;
                });
        },
        openEditDialog(item) {
            this.editedItem = this.user;
            this.dialog = true;
        },
        openDeleteDialog(item) {
            this.editedItem = this.user;
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
        exportToFile() {
            this.$router.push(`/wage/${this.$route.params.id}`);
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

<style></style>
