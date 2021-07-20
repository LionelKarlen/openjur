import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from '../views/Home.vue';
import Client from '../views/Client.vue';
import Times from '../views/Times.vue';

import SelectionList from '../components/SelectionList.vue';
import TimesheetTable from '../components/TimesheetTable.vue';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/clients',
        component: SelectionList,
        props: {
            baseroute: '/client',
            invoke: 'getClients',
        },
    },
    {
        path: '/users',
        component: SelectionList,
        props: {
            baseroute: '/user',
            invoke: 'getUsers',
        },
    },
    {
        path: '/user/:id',
        component: TimesheetTable,
        props: (route) => ({
            invoke: 'getTimesByUserID',
            arg: route.params.id,
        }),
    },
    {
        path: '/client/:id',
        name: 'Client',
        component: Client,
    },
    {
        path: '/times',
        name: 'Times',
        component: Times,
    },
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
});

export default router;
