<template>
    <div>
        <v-list-item
            v-for="client in clients"
            :key="client.ID"
            :to="/client/ + client.ID"
        >
            <v-list-item-content>
                {{ client.Name }}
            </v-list-item-content>
        </v-list-item>
    </div>
</template>

<script>
const { ipcRenderer } = require('electron');
export default {
    name: 'Clients',
    data() {
        return {
            clients: [],
        };
    },
    mounted() {
        console.log(this.$route);
        ipcRenderer.invoke('getClients').then((data) => {
            console.log(data);
            this.clients = data;
        });
    },
};
</script>

<style></style>
