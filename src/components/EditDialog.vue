<template>
    <v-dialog v-model="dialog" persistent>
        <v-card>
            <v-card-title>
                <span class="text-h5">{{
                    isEdit ? 'Edit Entry' : 'New Entry'
                }}</span>
            </v-card-title>

            <v-card-text>
                <!-- <v-container> -->
                <!-- <v-row>
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
                </v-container> -->
                <v-form>
                    <v-container>
                        <v-row>
                            <v-col cols="3">
                                <v-date-picker v-model="picker">
                                </v-date-picker>
                            </v-col>
                            <v-col>
                                <v-combobox
                                    v-model="text"
                                    :items="textPropose"
                                    label="Text"
                                >
                                </v-combobox>
                                <v-select
                                    v-model="client"
                                    :items="clients"
                                    item-text="Name"
                                    item-value="ID"
                                    label="Client"
                                >
                                </v-select>
                                <v-select
                                    v-model="user"
                                    :items="users"
                                    item-text="Name"
                                    item-value="ID"
                                    label="User"
                                >
                                </v-select>
                                <v-text-field
                                    label="Hours"
                                    :value="Number(hours)"
                                    suffix="Hours"
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
    props: ['dialog', 'editedItem', 'isEdit'],
	data() {
		return {
			valid: false,
            picker: new Date(
                Date.now() - new Date().getTimezoneOffset() * 60000
            )
                .toISOString()
                .substr(0, 10),
            client: {},
            clients: [],
            user: {},
            users: [],
            text: '',
            textPropose: ['Did stuff', 'Did other stuff'],
            hours: 0,
		}
	},
    methods: {
        close() {
            this.$emit('updateDialogStatus', false);
        },
        async save() {
            console.log(this.editedItem);
            let obj = {
                Date: this.picker,
                ClientID: this.client,
                UserID: this.user,
                Text: this.text,
                Hours: this.hours,
                ID: this.editedItem.ID,
            };
            // if (this.isEdit) {
            //     await ipcRenderer.invoke('setTimeByID', obj);
            // } else {
            //     await ipcRenderer.invoke('addTime', obj);
            // }
			console.log(obj)
            this.$emit('updateDialogStatus', false);
        },
    },
	async mounted() {
        this.users = await ipcRenderer.invoke('getUsers');
        this.clients = await ipcRenderer.invoke('getClients');
		
		this.client=this.editedItem.ClientID;
		this.user=this.editedItem.UserID;
		this.text=this.editedItem.Text;
		this.hours=this.editedItem.Hours;
    },
};
</script>

<style>
</style>