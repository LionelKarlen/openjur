<template>
    <div>
        <v-card outlined @click="open()" @contextmenu="openMenu">
            <v-list-item two-line>
                <v-list-item-content>
                    <div class="overline mb-1">{{ computedDate }}</div>
                    <v-list-item-title class="headline">
                        {{ this.invoice.ExtID }}
                    </v-list-item-title>
                </v-list-item-content>
            </v-list-item>
        </v-card>
        <v-menu
            v-model="showMenu"
            :position-x="x"
            :position-y="y"
            absolute
            offset-y
            ><v-list>
                <v-list-item @click="deleteInvoice()">
                    <v-list-item-title>Delete</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script>
import { ipcRenderer } from 'electron';
import { formatDate } from '../backend/utils';
export default {
    name: 'InvoiceCard',
    props: ['invoice'],
    data() {
        return {
            x: null,
            y: null,
            showMenu: false,
        };
    },
    methods: {
        openMenu(e) {
            e.preventDefault();
            this.showMenu = false;
            this.x = e.clientX;
            this.y = e.clientY;
            this.$nextTick(() => {
                this.showMenu = true;
            });
        },
        open() {
            ipcRenderer.invoke('openFile', this.invoice.Path);
        },
        async deleteInvoice() {
            console.log('called');
            let success = await ipcRenderer.invoke(
                'deleteFile',
                this.invoice.Path
            );
            console.log(success);
            if (success == true) {
                this.$emit('deleteSuccess', {});
            }
        },
    },
    computed: {
        computedDate() {
            return formatDate(this.invoice.Date);
        },
    },
};
</script>

<style></style>
