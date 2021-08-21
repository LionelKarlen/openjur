<template>
    <v-dialog v-model="dialog" max-width="1500px" persistent>
        <v-card>
            <v-card-title>
                <span class="text-h5">{{
                    isEdit ? `Edit ${name}` : 'New Entry'
                }}</span>
            </v-card-title>

            <v-card-text>
                <v-form @submit.prevent="save">
                    <v-container>
                        <v-row>
                            <v-col>
                                <v-text-field
                                    label="Name"
                                    v-model="name"
                                ></v-text-field>
                                <v-textarea
                                    label="Address"
                                    v-model="address"
                                    rows="2"
                                ></v-textarea>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-form>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">
                    Cancel
                </v-btn>
                <v-btn color="blue darken-1" text type="submit"> Save </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
const { ipcRenderer } = require('electron');
export default {
    name: 'EditDialog',
    props: ['dialog', 'editedItem', 'isEdit'],
    data() {
        return {
            name: '',
            address: '',
        };
    },
    methods: {
        close() {
            this.$emit('updateDialogStatus', false);
        },
        async save() {
            console.log(this.editedItem);
            let obj = {
                Name: this.name,
                Address: this.address != null ? this.address : '',
                ID: this.isEdit ? this.editedItem.ID : null,
            };
            console.log(obj);
            if (this.isEdit) {
                await ipcRenderer.invoke('setClientByID', obj);
            } else {
                await ipcRenderer.invoke('addClient', obj);
            }
            this.$emit('updateDialogStatus', false);
        },
    },
    watch: {
        dialog: async function (newVal, oldVal) {
            if (newVal) {
                this.name = this.editedItem.Name;
                this.address = this.editedItem.Address;
            } else {
                this.name = '';
                this.address = '';
            }
        },
    },
};
</script>

<style></style>
