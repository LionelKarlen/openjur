<template>
    <div id="User">
        <div id="user-meta-section">
            <h1>{{ user.Name }}</h1>
            <h3>{{ user.Amount }}</h3>
        </div>
        <timesheet-table
            invoke="getTimesByUserID"
            :arg="this.$route.params.id"
            :user="true"
        />
    </div>
</template>

<script>
const { ipcRenderer } = require('electron');
import TimesheetTable from '../components/TimesheetTable.vue';
export default {
    components: { TimesheetTable },
    name: 'User',
    data() {
        return {
            entries: [],
            user: {},
        };
    },
    components: {
        TimesheetTable,
    },
    async mounted() {
        let id = this.$route.params.id;
        ipcRenderer.invoke('getUserByID', id).then((data) => {
            console.log(data);
            this.user = data;
        });
    },
};
</script>

<style></style>
