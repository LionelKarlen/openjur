<template>
    <div id="Client">
        <div id="client-meta-section">
            <h1>{{ client.Name }}</h1>
            <h3>{{ client.Address }}</h3>
        </div>
        <timesheet-table invoke="getTimesByID" :arg="this.$route.params.id" />
        <v-btn depressed color="primary"> Export to File </v-btn>
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
            entries: [],
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
};
</script>

<style></style>
