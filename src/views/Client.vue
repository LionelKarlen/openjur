<template>
    <div id="Client" class="pa-3">
        <div id="client-meta-section">
            <h1>{{ client.Name }}</h1>
            <h3>{{ client.Address }}</h3>
        </div>
        <v-data-table
            :headers="headers"
            :items="entries"
            hide-default-footer
            :items-per-page="-1"
        >
            <template v-slot:[`item.actions`]="{ item }">
                <v-icon small class="mr-2" @click="document.alert(item)">
                    mdi-pencil
                </v-icon>
                <v-icon small> mdi-delete </v-icon>
            </template>
        </v-data-table>
        <v-btn depressed color="primary"> Export to File </v-btn>
    </div>
</template>

<script>
const { ipcRenderer } = require('electron');
export default {
    name: 'Client',
    data() {
        return {
            entries: [],
            client: {},
            headers: [
                {
                    text: 'Date',
                    sortable: true,
                    value: 'Date',
                },
                {
                    text: 'Text',
                    sortable: true,
                    value: 'Text',
                },
                {
                    text: 'UserID',
                    sortable: true,
                    value: 'UserID',
                },
                {
                    text: 'Hours',
                    sortable: true,
                    value: 'Hours',
                },
                { text: 'Actions', value: 'actions', sortable: false },
            ],
        };
    },
    mounted() {
        var id = this.$route.params.id;
        ipcRenderer.send('getTimesByID', id);
        ipcRenderer.send('getClientByID', id);

        ipcRenderer.on('timesSent', (event, data) => {
            console.log(data);
            this.entries = data;
        });
        ipcRenderer.on('clientSent', (event, data) => {
            console.log(data);
            this.client = data[0];
        });
    },
    updated() {
        ipcRenderer.removeAllListeners();
    },
};
</script>

<style></style>
