<template>
    <v-form>
        <v-container>
            <v-row>
                <v-col>
                    <v-select
                        v-model="client"
                        :items="clients"
                        item-text="Name"
                        item-value="ID"
                        label="Client"
                    />
                    <v-row>
                        <v-menu
                            ref="fromMenu"
                            v-model="fromMenu"
                            :close-on-content-click="false"
                            :return-value.sync="fromDate"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                    v-model="fromDate"
                                    label="From"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker
                                v-model="fromDate"
                                no-title
                                scrollable
                            >
                                <v-spacer></v-spacer>
                                <v-btn
                                    text
                                    color="primary"
                                    @click="fromMenu = false"
                                    >Cancel</v-btn
                                >
                                <v-btn
                                    text
                                    color="primary"
                                    @click="$refs.fromMenu.save(fromDate)"
                                    >OK</v-btn
                                >
                            </v-date-picker>
                        </v-menu>
                        <v-menu
                            ref="toMenu"
                            v-model="toMenu"
                            :close-on-content-click="false"
                            :return-value.sync="toDate"
                            transition="scale-transition"
                            offset-y
                            min-width="290px"
                        >
                            <template v-slot:activator="{ on, attrs }">
                                <v-text-field
                                    v-model="toDate"
                                    label="To"
                                    prepend-icon="mdi-calendar"
                                    readonly
                                    v-bind="attrs"
                                    v-on="on"
                                ></v-text-field>
                            </template>
                            <v-date-picker v-model="toDate" no-title scrollable>
                                <v-spacer></v-spacer>
                                <v-btn
                                    text
                                    color="primary"
                                    @click="toMenu = false"
                                    >Cancel</v-btn
                                >
                                <v-btn
                                    text
                                    color="primary"
                                    @click="$refs.toMenu.save(toDate)"
                                    >OK</v-btn
                                >
                            </v-date-picker>
                        </v-menu>
                    </v-row>
                </v-col>
            </v-row>
        </v-container>
        <v-row>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="close"> Cancel </v-btn>
            <v-btn color="blue darken-1" text @click="save"> Export</v-btn>
        </v-row>
    </v-form>
</template>

<script>
const { ipcRenderer } = require('electron');
export default {
    name: 'Invoice',
    data() {
        return {
            valid: false,
            entries: [],
            sorted: [],
            fromDate: null,
            toDate: null,
            fromMenu: false,
            toMenu: false,
            client: {},
            clients: [],
        };
    },
    async mounted() {
        await this.getData();

        console.log(this.fromDate);
    },
    methods: {
        async getData() {
            this.clients = await ipcRenderer.invoke('getClients');
            this.client = this.clients.filter((item) => {
                return item.ID == this.$route.params.id;
            })[0];
            this.entries = await ipcRenderer.invoke(
                'getTimesByClientID',
                this.client.ID
            );
            this.sorted = this.entries.sort((a, b) => {
                a.Date - b.Date;
            });
            this.fromDate = new Date(this.sorted[0].Date * 1000)
                .toISOString()
                .substring(0, 10);
            this.toDate = new Date(
                this.sorted[this.sorted.length - 1].Date * 1000
            )
                .toISOString()
                .substring(0, 10);
        },
        close() {
            this.$router.push(`/client/${this.$route.params.id}`);
        },
        async save() {
            console.log(this.editedItem);
            let exportOptions = {};
            console.log(exportOptions);
            ipcRenderer.invoke('exportToFile', exportOptions);
            this.$emit('updateDialogStatus', false);
        },
    },
};
</script>
