<template>
    <div>
        <timesheet-table invoke="getTimes" :alltimes="true" />
    </div>
</template>

<script>
import TimesheetTable from '../components/TimesheetTable.vue';
export default {
    name: 'Times',
    components: {
        TimesheetTable,
    },
};
</script>

<style></style>
