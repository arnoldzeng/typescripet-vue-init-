<template>
    <div id="app">
        <!-- 内容 -->
        <router-view v-if="isRouterAlive" />
    </div>
</template>

<script lang="ts">
import { Component, Provide, Vue } from 'vue-property-decorator';
@Component({})
export default class App extends Vue {
    private isRouterAlive: boolean = true;

    @Provide('reload')
    p_reload = this.reload;

    created() {}

    reload() {
        this.isRouterAlive = false;
        this.$nextTick(() => {
            this.isRouterAlive = true;
        });
    }
}
</script>

<style lang="less">
html,
body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden;
}
#app {
    @media screen and (min-width: 1200px) {
        min-width: 1200px;
    }
    height: 100%;
    width: 100%;
}
</style>
