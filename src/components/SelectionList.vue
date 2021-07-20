<template>
    <div>
        <v-autocomplete
            v-model="selected"
            :items="entries"
            item-text="Name"
            item-value="ID"
            @change="onUpdate()"
        >
        </v-autocomplete>
        <v-list-item
            v-for="entry in entries"
            :key="entry.ID"
            :to="`${baseroute}/${entry.ID}`"
        >
            <v-list-item-content>
                {{ entry.Name }}
            </v-list-item-content>
        </v-list-item>
    </div>
</template>

<script>
const { ipcRenderer } = require('electron');
export default {
    name: 'SelectionList',
    props: ['invoke', 'baseroute'],
    data() {
        return {
            entries: [],
            selected: {},
        };
    },
    methods: {
        onUpdate() {
            console.log(this.selected);
            this.$router.push(`${this.baseroute}/${this.selected}`);
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
