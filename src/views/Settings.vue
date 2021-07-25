<template>
    <div>
        <v-text-field v-model="MWST" label="MWST" suffix="%"> </v-text-field>
        <v-file-input
            truncate-length="50"
            accept=".docx"
            v-model="templateFile"
            label="Template File"
        ></v-file-input>
        <v-btn text color="primary" @click="save()"> SAVE </v-btn>
    </div>
</template>

<script>
const { ipcRenderer } = require('electron');
export default {
    name: 'Settings',
    data() {
        return {
            MWST: null,
            templateFile: [],
        };
    },
    async mounted() {
        this.getData();
    },
    methods: {
        async save() {
            console.log(this.templateFile);
            let obj = {
                TemplateFile: this.templateFile.path,
                MWST: this.MWST,
            };
            ipcRenderer.invoke('setSettings', obj);
        },
        async getData() {
            let entries = await ipcRenderer.invoke('getSettings');
            console.log(entries);
            this.MWST = entries.MWST;
            this.templateFile = [new File([], entries.TemplateFile)];
        },
    },
};
</script>

<style></style>
