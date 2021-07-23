<template>
    <div id="Client">
        <div id="client-meta-section">
            <h1>{{ client.Name }}</h1>
            <h3>{{ client.Address }}</h3>
        </div>
        <timesheet-table
            invoke="getTimesByClientID"
            :arg="this.$route.params.id"
            :user="false"
        />
        <v-btn depressed color="primary" @click="exportToFile">
            Export to File
        </v-btn>
    </div>
</template>

<script>
const { ipcRenderer } = require('electron');
import TimesheetTable from '../components/TimesheetTable.vue';
export default {
    components: { TimesheetTable },
    name: 'Client',
    data() {
        return {
            client: {},
        };
    },
    components: {
        TimesheetTable,
    },
    async mounted() {
        let id = this.$route.params.id;
        ipcRenderer.invoke('getClientByID', id).then((data) => {
            console.log(data);
            this.client = data;
        });
    },
    methods: {
        exportToFile() {
            ipcRenderer.invoke('exportToFile', this.$route.params.id);
        },
    },
};
</script>

<style></style>
