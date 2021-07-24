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
        <edit-dialog
            :dialog="dialog"
            :isEdit="true"
            :editedItem="editedItem"
            :isUser="true"
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
    name: 'User',
    data() {
        return {
            entries: [],
            user: {},
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
            ipcRenderer.invoke('getUserByID', id).then((data) => {
                console.log(data);
                this.user = data;
            });
        },
        openEditDialog(item) {
            this.editedItem = this.user;
            this.dialog = true;
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
