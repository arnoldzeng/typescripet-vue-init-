import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './registerServiceWorker';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import globalMethod from './global';
import { Component } from 'vue-property-decorator';

Vue.config.productionTip = false;
Component.registerHooks(['beforeRouteEnter', 'beforeRouteLeave', 'beforeRouteUpdate']);
Vue.use(ElementUI);
Vue.use(globalMethod);
new Vue({
    router,
    store,
    render: h => h(App),
}).$mount('#app');
