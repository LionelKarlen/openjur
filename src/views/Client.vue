<template>
    <div id="Client">
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
        var id = this.$route.params.id;
        ipcRenderer.invoke('getTimesByID', id).then(async (data) => {
            console.log(data);
            let entries = data;
            for (let i = 0; i < entries.length; i++) {
                var e = await ipcRenderer.invoke(
                    'getUserByID',
                    entries[i].UserID
                );
                entries[i].Amount = entries[i].Hours * e.Amount;
            }
            this.entries = entries;
        });
        ipcRenderer.invoke('getClientByID', id).then((data) => {
            console.log(data);
            this.client = data;
        });
    },
};
</script>

<style></style>
