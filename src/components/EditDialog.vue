<template>
    <v-dialog v-model="dialog" max-width="500px" persistent>
        <v-card>
            <v-card-title>
                <span class="text-h5">{{isEdit?"Edit Entry":"New Entry"}}</span>
            </v-card-title>

            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12" sm="6" md="4">
                            <v-text-field
                                v-model="editedItem.Date"
                                label="Date"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-text-field
                                v-model="editedItem.Text"
                                label="Text"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-text-field
                                v-model="editedItem.User"
                                label="User"
                            ></v-text-field>
                        </v-col>
                        <v-col cols="12" sm="6" md="4">
                            <v-text-field
                                v-model="editedItem.Hours"
                                label="Hours"
                            ></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
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
    methods: {
        close() {
            this.$emit('updateDialogStatus', false);
        },
        async save() {
			console.log(this.editedItem);
			let obj = {
				Date: this.editedItem.Date,
				ClientID: this.editedItem.ClientID,
				UserID: this.editedItem.UserID,
				Text: this.editedItem.Text,
				Hours: this.editedItem.Hours,
				ID: this.editedItem.ID
			}
			if(this.isEdit) {
			await ipcRenderer.invoke('setTimeByID', obj);
			} else {
			await ipcRenderer.invoke('addTime', obj);
			}
            this.$emit('updateDialogStatus', false);
        },
    },
};
</script>

<style>
</style>