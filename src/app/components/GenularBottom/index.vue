<template>
    <div>
        <el-button-group>
            <el-button
                @click.prevent.stop="navigateTo('https://github.com/genular/simon-frontend')"
                title="Star us on github!"
                type="primary"
                icon="fa fa-github"
            ></el-button>
            <el-button
                @click.prevent.stop="navigateTo('https://crowdin.com/project/genular')"
                title="Help us with translations"
                type="primary"
                icon="fa fa-language"
            ></el-button>
            <el-button title="About" @click.prevent.stop="navigateTo('about')" type="primary" icon="fa fa-info-circle"></el-button>
        </el-button-group>

        <el-dialog class="about-dialog" title="about us" :visible.sync="centerDialogVisible" width="600px" center>
            <div class="about-container">
                <div>
                    We are company founded to promote science and research. We believe that everyone should have right to build
                    highly accurate predictive models even if they would not usually have necessary skills.
                </div>
                <blockquote cite="Albert Einstein">
                    We can not solve our problems with the same level of thinking that created them
                </blockquote>
                <div>
                    Instead of guessing which model will work the best for your data, our system automatically processes
                    in parallel many different machine learning algorithms, testing millions of potential models
                    per second, and suggests most accurate ones that fits your data.
                </div>
                <div>
                    <br />SIMON is made and maintained by Genular, a community working together to keep Science open,
                    public and accessible to all.
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<script>
export default {
    name: "GenularBottom",
    data() {
        return {
            centerDialogVisible: false
        };
    },
    methods: {
        navigateTo(command) {
            if (command === "about") {
                this.centerDialogVisible = true;
            } else {
                window.open(command, "_blank");
            }
        }
    }
};
</script>

<style rel="stylesheet/scss" lang="scss" scoped>
.el-button-group {
    position: absolute;
    left: 0;
    margin: 0 auto;
    bottom: 0;
    width: 100%;
    .el-button {
        width: 33.333%;
    }
}
.about-dialog {
    > .el-dialog {
        background-image: url(/static/images/sky.png);
        background-color: #eff0f9;
        background-repeat: no-repeat;
        background-position: bottom;
        background-size: contain;
    }
    .about-container {
        font-size: 14px;
        color: #606266;
        letter-spacing: 1px;
        blockquote {
            display: block;
            border-bottom: 1px dashed black;
            margin-top: 25px;
            position: relative;
            border-top: 1px dashed black;
            padding-top: 25px;
            padding-bottom: 10px;
            font-size: 16px;
            margin-bottom: 25px;
            margin-left: 0;
            margin-right: 0;

            color: #191919;
            font-weight: bold;
            line-height: 35px;

            &:before {
                content: "\201C";
                position: absolute;
                top: 0em;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 4rem;
                height: 3rem;
                font: 72px "PT Sans", sans-serif;
                color: #593e4b;
                text-align: center;
            }

            &:after {
                content: "\2013 \2003" attr(cite);
                display: block;
                text-align: right;
                font-size: 14px;
                color: #000;
            }
        }
    }
}
.hideSidebar {
    .el-button-group {
        left: 0;
        button {
            padding: 11px;
            border: 0 none;
            border-bottom-left-radius: 0;
            border-top-right-radius: 0;
        }
    }
}
</style>
