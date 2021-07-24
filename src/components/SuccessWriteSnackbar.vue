<template>
    <v-snackbar
        v-model="snackbar"
        color="green lighten-1"
        :timeout="-1"
        multi-line
    >
        Successfully wrote file to {{ path }}
        <template v-slot:action="{ attrs }">
            <v-btn text v-bind="attrs" @click="close()"> Close </v-btn>
        </template>
    </v-snackbar>
</template>

<script>
export default {
    name: 'SuccessWriteSnackbar',
    props: ['snackbar', 'path'],
    methods: {
        close() {
            this.$emit('closeSnackbar');
        },
    },
};
</script>

<style></style>
