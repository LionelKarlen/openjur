<template>
    <v-dialog v-model="dialog" max-width="1500px" persistent>
        <v-card>
            <v-card-title>
                <span class="text-h5">{{
                    isEdit ? 'Edit Entry' : 'New Entry'
                }}</span>
            </v-card-title>

            <v-card-text>
                <v-form>
                    <v-container>
                        <v-row>
                            <v-col cols="3">
                                <v-text-field
                                    label="Name"
                                    v-model="name"
                                ></v-text-field>
                                <v-text-field
                                    :label="isUser ? 'Amount' : 'Address'"
                                    v-model="other"
                                ></v-text-field>
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
                <v-btn color="blue darken-1" text @click="save"> Save </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
const { ipcRenderer } = require('electron');
export default {
    name: 'EditDialog',
    props: ['dialog', 'editedItem', 'isEdit', 'isUser'],
    data() {
        return {
            name: '',
            address: '',
            amount: 0,
            other: null,
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
                Address: !this.isUser && this.other != null ? this.other : '',
                Amount: this.isUser ? this.other : null,
                ID: this.isEdit ? this.editedItem.ID : null,
            };
            console.log(obj);
            if (this.isEdit) {
                await ipcRenderer.invoke(
                    this.isUser ? 'setUserByID' : 'setClientByID',
                    obj
                );
            } else {
                await ipcRenderer.invoke(
                    this.isUser ? 'addUser' : 'addClient',
                    obj
                );
            }
            this.$emit('updateDialogStatus', false);
        },
    },
    watch: {
        dialog: async function (newVal, oldVal) {
            if (newVal) {
                this.name = this.editedItem.Name;
                if (this.isUser) {
                    this.other = this.editedItem.Amount;
                } else {
                    this.other = this.editedItem.Address;
                }
            } else {
                this.name = '';
                this.address = '';
                this.amount = 0;
            }
        },
    },
};
</script>

<style></style>
