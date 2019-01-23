<template>
    <el-header class="simon-header" height="30">
        <div class="traybar-dropdownmenu">
            <el-dropdown :hide-on-click="true" size="mini" :show-timeout="0" :hide-timeout="0" trigger="click" @command="handleCommand">
                <el-button type="primary" size="mini">
                    File<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown" class="tray-navigation">
                    <el-dropdown-item command="quit" divided><i class="el-icon-arrow-down el-icon--left"></i> Quit</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <el-dropdown :hide-on-click="true" size="mini" :show-timeout="0" :hide-timeout="0" trigger="click" @command="handleCommand">
                <el-button type="primary" size="mini">
                    Edit<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown" class="tray-navigation">
                    <el-dropdown-item command="settings"><i class="el-icon-arrow-down el-icon--left"></i> Settings...</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <el-dropdown :hide-on-click="true" size="mini" :show-timeout="0" :hide-timeout="0" trigger="click" @command="handleCommand">
                <el-button type="primary" size="mini">
                    Help<i class="el-icon-arrow-down el-icon--right"></i>
                </el-button>
                <el-dropdown-menu slot="dropdown" class="tray-navigation">
                    <el-dropdown-item command="website">Website</el-dropdown-item>
                    <el-dropdown-item command="about">About</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
        <el-dialog class="about-dialog" title="about us" :visible.sync="centerDialogVisible" width="600px" center>
            <div class="about-container">
                <div>
                    We are company founded to promote science and research. Soon we will be launching our online service to help you make better and faster research. We believe that everyone should have right to build highly accurate predictive models even if they would not usually have necessary skills.
                </div>
                <blockquote cite="Albert Einstein">We can not solve our problems with the same level of thinking that created them</blockquote>
                <div>
                    Instead of guessing which model will work the best for your data, our system automatically processes in parallel up to 130 different machine learning algorithms, testing millions of potential models per second, and suggests most accurate ones that fits your data.
                </div>
                <div>
                    <br />SIMON is made and maintained by Genular, a community working together to keep Science open, public and accessible to all.

                    <div>
                        Icons made by <a href="http://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a>
                    </div>
                </div>
            </div>
        </el-dialog>
    </el-header>
</template>
<script>
export default {
    name: "Traybar",
    data() {
        return {
            centerDialogVisible: false
        };
    },
    methods: {
        handleSelect(key, keyPath) {
            console.log(key, keyPath);
        },
        handleCommand(command) {
            console.log("command: ", command);

            if (command === "about") {
                this.centerDialogVisible = true;
            } else if (command === "website") {
                window.location.href = this.$config.server.homepage;
            } else if (command === "settings") {
                this.$router.push({ path: "/settings/?startIndex=1" });
            } else if (command === "quit") {
                this.$store
                    .dispatch("userLogout")
                    .then(status => {
                        console.log("userLogout status: " + status);
                        if (status === true) {
                            window.location.href = this.$config.server.homepage;
                        }
                    })
                    .catch(error => {
                        console.log(error);
                    });
            }
        },
        trayActions(action) {
            if (action === "quit") {
                this.$electron.remote.app.quit();
            } else if (action === "minimize") {
                this.$electron.remote.BrowserWindow.getFocusedWindow().minimize();
            } else if (action === "toggle") {
                if (!this.$electron.remote.BrowserWindow.getFocusedWindow().isMaximized()) {
                    this.$electron.remote.BrowserWindow.getFocusedWindow().maximize();
                } else {
                    this.$electron.remote.BrowserWindow.getFocusedWindow().unmaximize();
                }
            }
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
.simon-header {
    height: 30px;
    float: left;
    width: 100%;
    background-color: #35224a;
    padding: 0;
    position: relative;
    clear: both;
    .el-button {
        border-radius: 0px;
    }
    > .traybar-window {
        float: right;
        -webkit-app-region: no-drag;
        .buttons {
            border: none;
            width: 30px;
            text-align: center;
            height: 28px;
            margin: 0;
            padding: 0;
        }
    }
    > .traybar-dropdownmenu {
        float: left;
        -webkit-app-region: no-drag;
        .el-dropdown {
            float: left;
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
                    background: #eff0f9;
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
}

.tray-navigation {
    border-radius: 0px;
    margin: 0px;
    border: none;
    min-width: 150px;
    margin-left: -5px !important;
}

.el-popper[x-placement^="bottom"] {
    margin-top: 0;
}
</style>
