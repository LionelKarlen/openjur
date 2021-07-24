<template>
    <div>
        <v-row class="align-center">
            <v-autocomplete
                v-model="selected"
                :items="entries"
                item-text="Name"
                item-value="ID"
                @change="onUpdate()"
            >
            </v-autocomplete>
            <v-btn
                depressed
                class="ml-3"
                color="primary"
                @click.stop="openAddDialog()"
                >Add Entry</v-btn
            >
        </v-row>

        <v-list-item
            v-for="entry in entries"
            :key="entry.ID"
            :to="`${baseroute}/${entry.ID}`"
        >
            <v-list-item-content>
                {{ entry.Name }}
            </v-list-item-content>
        </v-list-item>
        <edit-dialog
            :dialog="dialog"
            :isEdit="false"
            :editedItem="editedItem"
            :isUser="isUser"
            @updateDialogStatus="updateDialogStatus"
        />
    </div>
</template>

<script>
import EditDialog from './EditDialog.vue';
const { ipcRenderer } = require('electron');
export default {
    components: { EditDialog },
    name: 'SelectionList',

    props: ['invoke', 'baseroute', 'isUser'],
    data() {
        return {
            entries: [],
            selected: {},
            dialog: false,
            editedItem: {
                Name: '',
                Address: '',
            },
        };
    },
    methods: {
        onUpdate() {
            console.log(this.selected);
            this.$router.push(`${this.baseroute}/${this.selected}`);
        },
        openAddDialog() {
            this.dialog = true;
        },
        updateDialogStatus(params) {
            this.dialog = params;
        },
    },
    mounted() {
        console.log(this.$route);
        ipcRenderer.invoke(this.invoke).then((data) => {
            console.log(data);
            this.entries = data;
        });
    },
};
</script>

<style></style>
