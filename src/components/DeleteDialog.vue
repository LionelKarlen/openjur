<template>
    <v-dialog v-model="dialog" max-width="550" persistent>
        <v-card>
            <v-card-title class="text-h5">
                Are you sure you want to delete this entry?
            </v-card-title>

            <v-card-actions>
                <v-spacer></v-spacer>

                <v-btn text @click="onClose()"> cancel </v-btn>

                <v-btn color="red darken-1" text @click="onAccept"> yes </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
const { ipcRenderer } = require('electron');
export default {
    name: 'DeleteDialog',
    props: ['dialog', 'editedItem', "invoke", "route"],
    methods: {
        onClose() {
            this.$emit('updateDialogStatus', false);
        },
        async onAccept() {
            let res = await ipcRenderer.invoke(this.invoke, this.editedItem.ID);
			if(res && this.route!=null) {
				this.$router.push(this.route);
			}
            this.onClose();
        },
    },
};
</script>

<style></style>
