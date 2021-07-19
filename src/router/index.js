import Vue from 'vue';
import VueRouter from 'vue-router';

import Home from '../views/Home.vue';
import Clients from '../views/Clients.vue';
import Client from '../views/Client.vue';

Vue.use(VueRouter);

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/clients',
        name: 'Clients',
        component: Clients,
    },
    {
        path: '/client/:id',
        name: 'Client',
        component: Client,
    },
];

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
});

export default router;
