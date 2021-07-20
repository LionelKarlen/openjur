<template>
    <div>
        <v-data-table
            :headers="this.headers"
            :items="this.entries"
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
        <v-btn depressed color="primary">Add Entry</v-btn>
    </div>
</template>

<script>
const { ipcRenderer } = require('electron');
export default {
    name: 'TimesheetTable',
    props: ['invoke', 'arg'],
    data() {
        return {
            entries: [],
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
        ipcRenderer.invoke(this.invoke, this.arg).then(async (data) => {
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
    },
};
</script>

<style></style>
