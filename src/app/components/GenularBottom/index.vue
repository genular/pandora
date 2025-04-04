<template>
    <div class="genular-bottom-buttons">
        <el-button-group>
            <el-button :title="$t('components.GenularBottom.buttons.star')" @click.prevent.stop="navigateTo('https://github.com/genular/pandora')" type="primary" size="medium" icon="fa fa-github"></el-button>
            <el-button :title="$t('components.GenularBottom.buttons.help')" @click.prevent.stop="navigateTo('https://crowdin.com/project/genular')" type="primary" size="medium" icon="fa fa-language"></el-button>
            <el-button :title="$t('components.GenularBottom.buttons.about')" @click.prevent.stop="navigateTo('about')" type="primary" size="medium" icon="fa fa-info-circle"></el-button>
            <el-button style="z-index: 3000;" title="Toggle terminal" @click.prevent.stop="toggleTerminal" type="primary" size="medium" icon="fa fa-terminal"></el-button>
        </el-button-group>
        <el-dialog class="about-dialog" :title="$t('components.GenularBottom.dialog.title')" :visible.sync="centerDialogVisible" width="600px" center>
            <div class="about-container">
                <div>
                    {{ $t("components.GenularBottom.dialog.intro") }}
                </div>
                <blockquote :cite="$t('components.GenularBottom.dialog.citation.author')">
                    {{ $t("components.GenularBottom.dialog.citation.text") }}
                </blockquote>
                <div>
                    {{ $t("components.GenularBottom.dialog.ending") }}
                </div>
                <div>
                    <br />
                    <div v-html="$t('components.GenularBottom.dialog.footer')"></div>
                </div>
                <div>
                    <br />
                    {{ $t("components.GenularBottom.dialog.links.title") }}:
                    <ul>
                        <li><a href="https://atomic-lab.org" target="_blank">aTomic Lab website</a></li>

                        <!--
                        <el-tooltip class="item" effect="dark" :content="$t('components.GenularBottom.dialog.links.tooltip.forums')" placement="left">
                            <li><a href="https://community.atomic-lab.org" target="_blank">community forums</a></li>
                        </el-tooltip>
                        -->
                        
                        <el-tooltip class="item" effect="dark" :content="$t('components.GenularBottom.dialog.links.tooltip.github')" placement="left">
                            <li><a href="https://github.com/genular/" target="_blank">github development page</a></li>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" :content="$t('components.GenularBottom.dialog.links.tooltip.translation')" placement="left">
                            <li><a href="https://crowdin.com/project/genular" target="_blank">translation community</a></li>
                        </el-tooltip>
                    </ul>
                </div>
            </div>
        </el-dialog>
        
        <TerminalComponent
            v-if="isTerminalOpen"
            @close="toggleTerminal"
            :isTerminalOpen="isTerminalOpen"
            :key="isTerminalOpen ? 'open' : 'closed'"
        ></TerminalComponent>

    </div>
</template>

<script>
import { mapGetters, mapMutations } from "vuex";

export default {
    name: "GenularBottom",
    components: {
        TerminalComponent: () => import("@/components/TerminalComponent")
    },
    data() {
        return {
            centerDialogVisible: false
        };
    },
    computed: {
        ...mapGetters({
            isTerminalOpen: 'terminalIsOpen'
        }),
        isTerminalOpen: {
            get() {
                return this.$store.getters.terminalIsOpen;
            },
            set(value) {
                this.SET_TERMINAL_OPEN(value);
            }
        }
    },
    methods: {
        ...mapMutations({
            SET_TERMINAL_OPEN: 'SET_TERMINAL_OPEN'
        }),
        
        navigateTo(command) {
            if (command === "about") {
                this.centerDialogVisible = true;
            } else {
                window.open(command, "_blank");
            }
        },
        toggleTerminal() {
            this.isTerminalOpen = !this.isTerminalOpen;
        }
    }
};
</script>

<style rel="stylesheet/scss" lang="scss">
.hideSidebar {
    .genular-bottom-buttons {
        .el-button-group {
            left: 0;
            width: 50px;

            button {
                width: 50px;
                border: 0 none;
                border-radius: 0;

            }
        }
    }
}

.genular-bottom-buttons {
    a {
        width: auto !important;
    }

    .el-button-group {
        position: absolute;
        left: 0;
        margin: 0 auto;
        bottom: 0;
        display: flex;
        /* Ensures buttons are aligned horizontally */

        .el-button {
            width: 25%;
            /* Set each button to 25% of the total width */
            border-radius: 0;

            .fa {
                font-size: 24px;
            }
        }
    }

    .about-dialog {
        >.el-dialog {
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
            word-break: normal;

            >div {
                line-height: 18px;
            }

            blockquote {
                display: block;
                margin-top: 25px;
                position: relative;
                padding-top: 25px;
                padding-bottom: 10px;
                font-size: 16px;
                margin-bottom: 25px;
                margin-left: 0;
                margin-right: 0;

                color: #191919;
                font-weight: bold;

                &:before {
                    content: "\201C";
                    position: absolute;
                    top: 0em;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 4rem;
                    height: 3rem;
                    font-size: 72px;
                    color: #593e4b;
                    text-align: center;
                }

                &:after {
                    content: "\2013 \2003"attr(cite);
                    display: block;
                    text-align: right;
                    font-size: 14px;
                    color: #000;
                }
            }
        }
    }
}

</style>
