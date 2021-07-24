<template>
    <v-snackbar v-model="snackbar" color="red" dark :timeout="-1" multi-line>
        Failed to delete Entry; Still in use! Delete all Entries that reference
        this one first.
        <template v-slot:action="{ attrs }">
            <v-btn text v-bind="attrs" @click="close()"> Close </v-btn>
        </template>
    </v-snackbar>
</template>

<script>
export default {
    name: 'FailedDeleteSnackbar',
    props: ['snackbar'],
    methods: {
        close() {
            this.$emit('closeSnackbar');
        },
    },
};
</script>

<style></style>
