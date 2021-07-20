<template>
    <v-app>
        <v-app-bar absolute color="#6A76AB" dark app>
            <v-toolbar-title>OpenJUR</v-toolbar-title>

            <v-spacer></v-spacer>

            <v-btn icon>
                <v-icon>mdi-settings</v-icon>
            </v-btn>

            <template v-slot:extension>
                <v-tabs align-with-title>
                    <v-tab to="/">Home</v-tab>
                    <v-tab to="/clients">Clients</v-tab>
                    <v-tab to="/times">Times</v-tab>
                </v-tabs>
            </template>
        </v-app-bar>
        <v-main>
            <div class="pa-5">
                <router-view />
            </div>
        </v-main>
    </v-app>
</template>

<script>
const { ipcRenderer } = require('electron');
export default {
    name: 'App',

    data: () => ({}),
    mounted() {},
};
</script>

<style>
body::-webkit-scrollbar {
    width: 0;
}
</style>
