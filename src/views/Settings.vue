<template>
    <div>
        <h2>MWST</h2>
        <v-text-field v-model="MWST" label="MWST" suffix="%"> </v-text-field>
        <v-divider />
        <h2>Templates</h2>
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
        <v-divider />
        <h2>Common Tasks</h2>
        <v-form v-model="taskValid">
            <v-row class="pl-4" align="center" justify="center">
                <v-text-field
                    v-model="taskModel"
                    label="New List entry"
                    :rules="[rules.split, rules.notnull]"
                    :validate-on-blur="false"
                ></v-text-field>
                <v-btn
                    text
                    color="primary"
                    @click="addTaskEntry()"
                    :disabled="!taskValid"
                >
                    ADD
                </v-btn>
            </v-row>
        </v-form>

        <v-sheet
            v-if="taskList.length > 0"
            max-height="200"
            class="overflow-scroll"
        >
            <v-list flat>
                <v-list-item-group v-model="selectedTaskItem" color="primary">
                    <v-list-item v-for="(item, i) in taskList" :key="i">
                        <v-list-item-content @click="deleteTaskEntry(i)">
                            <v-list-item-title
                                v-text="item"
                            ></v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-sheet>

        <v-divider />
        <h2>Common Extra Charges</h2>
        <v-form v-model="chargeValid">
            <v-row class="pl-4" align="center" justify="center">
                <v-text-field
                    v-model="chargeModel"
                    label="New List entry"
                    :rules="[rules.split, rules.notnull]"
                    :validate-on-blur="false"
                ></v-text-field>
                <v-btn
                    text
                    color="primary"
                    @click="addChargeEntry()"
                    :disabled="!chargeValid"
                >
                    ADD
                </v-btn>
            </v-row>
        </v-form>

        <v-sheet
            v-if="chargeList.length > 0"
            max-height="200"
            class="overflow-scroll"
        >
            <v-list flat>
                <v-list-item-group v-model="selectedChargeItem" color="primary">
                    <v-list-item v-for="(item, i) in chargeList" :key="i">
                        <v-list-item-content @click="deleteChargeEntry(i)">
                            <v-list-item-title
                                v-text="item"
                            ></v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-sheet>
        <v-divider />
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
            taskModel: '',
            taskList: [],
            selectedTaskItem: null,
            taskValid: false,
            chargeModel: '',
            chargeList: [],
            selectedChargeItem: null,
            chargeValid: false,
            rules: {
                split: (value) => {
                    const pattern = /[%]/g;
                    return !pattern.test(value) || 'No % Symbols.';
                },
                notnull: (value) => value.length > 0 || 'No empty strings',
            },
        };
    },
    async mounted() {
        this.getData();
    },
    methods: {
        addTaskEntry() {
            this.taskList.push(this.list);
            this.list = '';
        },
        deleteTaskEntry(i) {
            console.log(i);
            this.taskList.splice(i, 1);
            this.selectedTaskItem = null;
        },
        addChargeEntry() {
            this.chargeList.push(this.chargeModel);
            this.chargeModel = '';
        },
        deleteChargeEntry(i) {
            this.chargeList.splice(i, 1);
            this.selectedChargeItem = null;
        },
        async save() {
            console.log(this.clientTemplateFile);
            let obj = {
                ClientTemplateFile: this.clientTemplateFile.path,
                UserTemplateFile: this.userTemplateFile.path,
                MWST: this.MWST,
                Suggestions: this.taskList.join('%'),
                Charges: this.chargeList.join('%'),
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
            this.taskList =
                entries.Suggestions.length > 0
                    ? entries.Suggestions.split('%')
                    : [];
            this.chargeList =
                entries.Charges.length > 0 ? entries.Charges.split('%') : [];
        },
    },
};
</script>

<style scoped>
.overflow-scroll {
    overflow-y: scroll;
}
</style>
