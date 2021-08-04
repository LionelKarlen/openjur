<template>
    <div>
        <v-text-field v-model="MWST" label="MWST" suffix="%"> </v-text-field>
        <v-file-input
            truncate-length="50"
            accept=".docx"
            v-model="clientTemplateFile"
            label="Client Template File"
        ></v-file-input>
        <v-file-input
            truncate-length="50"
            accept=".docx"
            v-model="userTemplateFile"
            label="User Template File"
        ></v-file-input>
        <v-form v-model="valid">
            <v-row class="pl-4" align="center" justify="center">
                <v-text-field
                    v-model="list"
                    label="New List entry"
                    :rules="[rules.split, rules.notnull]"
                    :validate-on-blur="false"
                ></v-text-field>
                <v-btn
                    text
                    color="primary"
                    @click="addEntry()"
                    :disabled="!valid"
                >
                    ADD
                </v-btn>
            </v-row>
        </v-form>

        <v-sheet
            v-if="listEntries.length > 0"
            max-height="200"
            class="overflow-scroll"
        >
            <v-list flat>
                <v-list-item-group v-model="selectedItem" color="primary">
                    <v-list-item v-for="(item, i) in listEntries" :key="i">
                        <v-list-item-content @click="deleteEntry(i)">
                            <v-list-item-title
                                v-text="item"
                            ></v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-sheet>
        <v-btn text color="primary" @click="save()" class="mt-5"> SAVE </v-btn>
    </div>
</template>

<script>
const { ipcRenderer } = require('electron');
export default {
    name: 'Settings',
    data() {
        return {
            MWST: null,
            clientTemplateFile: [],
            userTemplateFile: [],
            list: '',
            listEntries: [],
            selectedItem: null,
            rules: {
                split: (value) => {
                    const pattern = /[%]/g;
                    return !pattern.test(value) || 'No % Symbols.';
                },
                notnull: (value) => value.length > 0 || 'No empty strings',
            },
            valid: false,
        };
    },
    async mounted() {
        this.getData();
    },
    methods: {
        addEntry() {
            this.listEntries.push(this.list);
            let s = this.listEntries.join('%');
            console.log(s);
            this.list = '';
        },
        deleteEntry(i) {
            console.log(i);
            this.listEntries.splice(i, 1);
            this.selectedItem = null;
        },
        async save() {
            console.log(this.clientTemplateFile);
            let obj = {
                ClientTemplateFile: this.clientTemplateFile.path,
                UserTemplateFile: this.userTemplateFile.path,
                MWST: this.MWST,
                Suggestions: this.listEntries.join('%'),
            };
            ipcRenderer.invoke('setSettings', obj);
        },
        async getData() {
            let entries = await ipcRenderer.invoke('getSettings');
            console.log(entries);
            this.MWST = entries.MWST;
            this.clientTemplateFile = [
                new File([], entries.ClientTemplateFile),
            ];
            this.userTemplateFile = [new File([], entries.UserTemplateFile)];
            this.listEntries =
                entries.Suggestions != null
                    ? entries.Suggestions.split('%')
                    : [];
        },
    },
};
</script>

<style scoped>
.overflow-scroll {
    overflow-y: scroll;
}
</style>
