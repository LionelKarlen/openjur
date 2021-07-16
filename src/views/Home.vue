<template></template>

<script>
const { ipcRenderer } = require('electron');

export default {
    name: 'Home',

    mounted() {
        ipcRenderer.send('mainWindowLoaded');

        ipcRenderer.on('clientSent', (event, data) => {
            console.log(data);
        });
    },
    components: {},
};
</script>
