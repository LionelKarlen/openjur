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
        <v-form v-model="taskValid" @submit.prevent="addTaskEntry()">
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
                    type="submit"
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
                        <v-list-item-content class="pa-0">
                            <v-list-item-title
                                v-text="item"
                            ></v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-btn icon @click="deleteTaskEntry(i)">
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-sheet>

        <v-divider />
        <h2>Common Extra Charges</h2>
        <v-form v-model="chargeValid" @submit.prevent="addChargeEntry">
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
                    type="submit"
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
                        <v-list-item-content>
                            <v-list-item-title
                                v-text="item"
                            ></v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-action>
                            <v-btn icon @click="deleteChargeEntry(i)">
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                        </v-list-item-action>
                    </v-list-item>
                </v-list-item-group>
            </v-list>
        </v-sheet>
        <v-divider />

        <h2>QRCode Data</h2>
        <v-form @submit.prevent="save">
            <v-col>
                <v-text-field label="Name" v-model="name"></v-text-field>
                <v-textarea
                    label="Address"
                    v-model="address"
                    rows="2"
                ></v-textarea>
                <v-text-field
                    label="Account IBAN"
                    v-model="iban"
                ></v-text-field>
            </v-col>
        </v-form>
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
            name: '',
            address: '',
            iban: '',
        };
    },
    async mounted() {
        this.getData();
    },
    methods: {
        addTaskEntry() {
            this.taskList.push(this.taskModel);
            this.taskModel = '';
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
                Name: this.name,
                Address: this.address,
                IBAN: this.iban,
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
            this.name = entries.Name;
            this.address = entries.Address;
            this.iban = entries.IBAN;
        },
    },
};
</script>

<style scoped>
.overflow-scroll {
    overflow-y: scroll;
}
</style>
