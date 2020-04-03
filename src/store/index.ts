import Vue from 'vue';
import Vuex from 'vuex';
import actions from './actions';
import mutations from './mutations';
import getters from './getters';
import { GlobalState } from '@/entitys/globleState';

Vue.use(Vuex);

export default new Vuex.Store<GlobalState>({
    state: {
        isLogin: false,
        isAllBan: false,
        cameraStatus: false,
        isStart: 0,
        userList: [],
        chatList: [],
    },
    actions,
    mutations,
    getters,
});
