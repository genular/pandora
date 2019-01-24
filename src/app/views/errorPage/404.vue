<template>
    <div style="margin-top: -20px;height:100%;">
        <div class="wscn-http404">
            <div class="pic-404">
                <img class="pic-404__parent" :src="img_404" alt="404">
            </div>
            <div class="bullshit">
                <div class="bullshit__oops">Oppssssss!</div>
                <div class="bullshit__headline">{{ message }}</div>
                <el-button type="danger" @click.native.prevent="handle404Refresh" style="float: right;">Reinitialize application</el-button>
            </div>
        </div>
    </div>
</template>
<script>
import img_404 from '@/assets/404_images/404.png'

export default {
    name: 'page404',
    data() {
        return {
            img_404
        }
    },
    methods: {
        handle404Refresh() {
            window.top.location.href = window.location.origin
            window.close()
        }
    },
    computed: {
        message() {
            return 'Unexpected Error'
        }
    }
}
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.wscn-http404 {
    position: relative;
    width: 1200px;
    margin: 20px auto 60px;
    padding: 0 100px;
    overflow: hidden;
    .pic-404 {
        position: relative;
        float: left;
        width: 600px;
        padding: 150px 0;
        overflow: hidden;
        &__parent {
            width: 100%;
        }
    }
    .bullshit {
        position: relative;
        float: left;
        width: 300px;
        padding: 150px 0;
        overflow: hidden;

        &__oops {
            font-size: 32px;
            font-weight: bold;
            line-height: 40px;
            color: #1482f0;
            opacity: 0;
            margin-bottom: 20px;
            animation-name: slideUp;
            animation-duration: 0.5s;
            animation-fill-mode: forwards;
        }
        &__headline {
            font-size: 20px;
            line-height: 24px;
            color: #1482f0;
            opacity: 0;
            margin-bottom: 10px;
            animation-name: slideUp;
            animation-duration: 0.5s;
            animation-delay: 0.1s;
            animation-fill-mode: forwards;
        }
        @keyframes slideUp {
            0% {
                transform: translateY(60px);
                opacity: 0;
            }
            100% {
                transform: translateY(0);
                opacity: 1;
            }
        }
    }
}
</style>
