<template>
    <div class="login">
        <el-container>
            <el-header>
                <div class="header">
                    <div class="headerTitle">header</div>
                </div>
            </el-header>
            <el-main>
                <div class="main">
                    <div class="mainTitle">main</div>
                    <div class="mainForm"></div>
                </div>
            </el-main>
            <el-footer>
                <div class="footer">
                    <div class="footerText"></div>
                </div>
            </el-footer>
        </el-container>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { fetch } from '../../service/api';
import { VueRouter } from 'vue-router/types/router';
import LocalStorage from '../../service/localStorage';
import Auth from '@/service/auth';
@Component({})
export default class Index extends Vue {
    router!: VueRouter;
    disable = true;
    // method
    mounted() {
        this.router = this.$router as VueRouter;
    }
}
</script>

<style scoped lang="less">
.login {
    height: 100%;

    .el-container.is-vertical {
        height: 100%;
    }
    .el-header {
        height: 80px !important;
        background: rgba(255, 255, 255, 1);
        box-shadow: 0px 2px 0px 0px rgba(237, 239, 243, 1);
        // box-sizing:border-box;
        // overflow: hidden;
    }
    .el-main {
        display: flex !important;
        justify-content: center;
    }
    .el-footer {
        padding: 0px !important;
    }
}
.header {
    padding-left: 12%;
    padding-top: 29px;
    padding-bottom: 26px;
    display: flex;
    align-items: center;
    div {
        display: inline-block;
    }
    .headerIcon {
        height: 25px;
        width: 88px;
    }
    .headerLine {
        width: 2px;
        height: 16px;
        background: rgba(212, 212, 212, 1);
        border-radius: 2px;
        margin: 0 20px;
    }
    .headerTitle {
        width: 132px;
        height: 22px;
        font-size: 18px;
        font-family: PingFang SC;
        font-weight: 500;
        color: rgba(24, 25, 26, 1);
        line-height: 22px;
    }
}
.main {
    width: 410px;
    height: calc(100% - 60px);
    // align-items: center;
    // justify-content: center;
    padding-bottom: 55px;
    .mainForm {
        display: flex;
        justify-content: center;
    }
    .mainTitle {
        // width: 62px;
        // height: 31px;
        font-size: 32px;
        font-family: PingFang SC;
        font-weight: 500;
        color: rgba(24, 25, 26, 1);
        display: flex;
        justify-content: center;
        margin-bottom: 53px;
    }
    .mainImg {
        @media screen and (min-width: 1200px) {
            height: 410px;
        }
        @media screen and (max-width: 1400px) {
            height: calc(100% - 242px);
        }
        width: 100%;
        background-size: 100% 100%;
        // border: 1px solid sandybrown;
    }
}
.footer {
    height: 54px;
    background: rgba(31, 32, 34, 1);
    display: flex;
    justify-content: center;
    position: absolute;
    bottom: 0;
    width: 100%;
    // align-content: center;
    .footerText {
        width: 250px;
        height: 13px;
        font-size: 12px;
        font-family: PingFang SC;
        font-weight: 400;
        color: rgba(88, 91, 97, 1);
        margin: auto 0;
    }
}
</style>
