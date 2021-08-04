import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from '../views/Home.vue';
import Client from '../views/Client.vue';
import User from '../views/User.vue';
import Settings from '../views/Settings.vue';
import Invoice from '../views/Invoice.vue';

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
            isUser: false,
        },
    },
    {
        path: '/users',
        component: SelectionList,
        props: {
            baseroute: '/user',
            invoke: 'getUsers',
            isUser: true,
        },
    },
    {
        path: '/user/:id',
        name: 'User',
        component: User,
    },
    {
        path: '/client/:id',
        name: 'Client',
        component: Client,
    },
    {
        path: '/times',
        component: TimesheetTable,
        props: {
            invoke: 'getTimes',
            alltimes: true,
        },
    },
    {
        path: '/settings',
        name: 'Settings',
        component: Settings,
    },
    {
        path: '/invoice/:id',
        component: Invoice,
        props: {
            isUser: false,
        },
    },
    {
        path: '/wage/:id',
        component: Invoice,
        props: {
            isUser: true,
        },
    },
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
});

export default router;
