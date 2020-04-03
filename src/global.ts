import { Vue, VueConstructor } from 'vue/types/vue';

export default function install(Vue: VueConstructor) {
    // 1. 添加全局方法或属性
    // @ts-ignore
    Vue['myGlobalMethod'] = function() {
        // 逻辑...
    };

    // 2. 添加全局资源
    Vue.directive('my-directive', {
        bind(el, binding, vnode, oldVnode) {
            // 逻辑...
        },
    });

    // 3. 注入组件
    Vue.mixin({
        created: function() {
            // 逻辑...
        },
    });

    // 4. 添加实例方法
    Vue.prototype.$successMessage = ({ text, duration = 3000 }: { text: string; duration: number }) => {
        Vue.prototype.$message({
            showClose: true,
            message: text,
            type: 'success',
            duration: duration,
        });
    };
    Vue.prototype.$failMessage = ({ text, duration = 3000 }: { text: string; duration: number }) => {
        Vue.prototype.$message({
            showClose: true,
            message: text,
            type: 'error',
            duration: duration,
        });
    };
}
