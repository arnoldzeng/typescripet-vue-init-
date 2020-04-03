import Vue from 'vue';
import Router, { RawLocation, Route, RouteConfig, RouterOptions } from 'vue-router';
import { Position, PositionResult } from 'vue-router/types/router';
import store from '../store';
import LocalStorage from '@/service/localStorage';
const login = () => import('../views/login/index.vue');
Vue.use(Router);

const routes: RouteConfig[] = [
    {
        path: '',
        redirect() {
            return '/login';
        },
    },
    {
        path: '/login',
        component: login,
    },
];

export default new Router({
    mode: process.env.VUE_APP_ROUTERMODE,
    fallback: false,
    scrollBehavior: (to: Route, from: Route, savedPosition: Position | void) => {
        return { x: 0, y: 0 };
    },
    routes: routes,
});
