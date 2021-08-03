<template>
    <v-dialog v-model="dialog" max-width="1500px" persistent>
        <v-card>
            <v-card-title>
                <span class="text-h5">{{
                    isEdit ? `Edit ${name}` : 'New Entry'
                }}</span>
            </v-card-title>

            <v-card-text>
                <v-form>
                    <v-container>
                        <v-row>
                            <v-col>
                                <v-text-field
                                    label="Name"
                                    v-model="name"
                                ></v-text-field>
                                <v-data-table
                                    :headers="headers"
                                    :items="amounts"
                                    :items-per-page="-1"
                                    hide-default-footer
                                >
                                    <template v-slot:[`item.Amount`]="props">
                                        <v-edit-dialog
                                            :return-value.sync="
                                                props.item.Amount
                                            "
                                            @save="saveEditDialog"
                                            @open="openEditDialog"
                                        >
                                            {{ props.item.Amount }}
                                            <template v-slot:input>
                                                <v-form ref="form">
                                                    <v-text-field
                                                        v-model="
                                                            props.item.Amount
                                                        "
                                                        :rules="[onlyNumbers]"
                                                        label="Edit"
                                                        single-line
                                                    ></v-text-field>
                                                </v-form>
                                            </template>
                                            <!-- <v-btn :disabled="!this.$refs.form.validate()" @click="saveEditDialog">
												Save
											</v-btn> -->
                                        </v-edit-dialog>
                                    </template>
                                </v-data-table>
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
    props: ['dialog', 'editedItem', 'isEdit'],
    data() {
        return {
            name: '',
            amounts: [],
            headers: [
                {
                    text: 'Client',
                    value: 'Client',
                },
                {
                    text: 'Amount',
                    value: 'Amount',
                },
            ],
            onlyNumbers: (value) => {
                const pattern = /[0-9]/;
                return pattern.test(value) || 'Only Numbers';
            },
            editDialog: false,
        };
    },
    async mounted() {
        await this.getData();
    },
    methods: {
        async getData() {
            if (this.isEdit) {
                this.amounts = await ipcRenderer.invoke(
                    'getAmountsByUserID',
                    this.editedItem.ID
                );
                console.log(this.amounts);
            }
        },
        openEditDialog() {
            this.editDialog = true;
        },
        saveEditDialog() {
            this.editDialog = false;
        },
        close() {
            this.$emit('updateDialogStatus', false);
        },
        async save() {
            console.log(this.editedItem);
            let obj = {
                Name: this.name,
                ID: this.isEdit ? this.editedItem.ID : null,
            };
            console.log(obj);
            if (this.isEdit) {
                await ipcRenderer.invoke('setUserByID', obj);
                await ipcRenderer.invoke('setWagesByUserID', this.amounts);
            } else {
                await ipcRenderer.invoke('addUser', obj);
                // await ipcRenderer.invoke('addWagesByUserID', this.amounts);
            }
            this.$emit('updateDialogStatus', false);
        },
    },
    watch: {
        dialog: async function (newVal, oldVal) {
            if (newVal) {
                this.name = this.editedItem.Name;
                await this.getData();
            } else {
                this.name = '';
            }
        },
    },
};
</script>

<style></style>
