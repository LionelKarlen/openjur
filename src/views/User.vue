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
        />
        <v-btn depressed color="primary" @click="exportToFile"> Export </v-btn>
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
    </div>
</template>

<script>
import DeleteDialog from '../components/DeleteDialog.vue';
import EditDialog from '../components/EditDialog.vue';
import FailedDeleteSnackbar from '../components/FailedDeleteSnackbar.vue';
const { ipcRenderer } = require('electron');
import TimesheetTable from '../components/TimesheetTable.vue';
import UserDialog from '../components/UserDialog.vue';
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
        };
    },
    components: {
        TimesheetTable,
        EditDialog,
        DeleteDialog,
        FailedDeleteSnackbar,
        UserDialog,
    },
    async mounted() {
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
    },
};
</script>

<style></style>
