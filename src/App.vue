<template>
    <v-app>
        <v-app-bar absolute color="#6A76AB" dark app>
            <v-toolbar-title>OpenJUR</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-btn icon to="/settings">
                <v-icon>mdi-cog</v-icon>
            </v-btn>

            <template v-slot:extension>
                <v-tabs align-with-title>
                    <!-- <v-tab to="/">Home</v-tab> -->
                    <v-tab to="/clients">Clients</v-tab>
                    <v-tab to="/users">Users</v-tab>
                    <v-tab to="/times">Times</v-tab>
                    <v-tab to="/open">Open</v-tab>
                    <v-tab to="/settings">Settings</v-tab>
                </v-tabs>
            </template>
        </v-app-bar>
        <v-main>
            <div class="pa-5">
                <router-view :key="$route.fullPath" />
            </div>
        </v-main>
    </v-app>
</template>

<script>
const { ipcRenderer } = require('electron');
export default {
    name: 'App',

    data: () => ({}),
    mounted() {
        this.$router.push('/settings');
    },
};
</script>

<style>
body::-webkit-scrollbar {
    width: 0;
}
</style>
