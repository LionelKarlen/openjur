<template>
    <v-card outlined @click="open()">
        <v-list-item two-line>
            <v-list-item-content>
                <div class="overline mb-1">{{ computedDate }}</div>
                <v-list-item-title class="headline">
                    {{ this.invoice.ID }}
                </v-list-item-title>
            </v-list-item-content>
        </v-list-item>
    </v-card>
</template>

<script>
import { ipcRenderer } from 'electron';
import { formatDate } from '../backend/utils';
export default {
    name: 'InvoiceCard',
    props: ['invoice'],
    methods: {
        open() {
            ipcRenderer.invoke('openFile', this.invoice.Path);
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
