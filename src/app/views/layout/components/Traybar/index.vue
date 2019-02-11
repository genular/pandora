<template>
    <el-header class="simon-header" height="30">
        <div class="traybar-dropdownmenu">
            <el-dropdown :hide-on-click="true" size="mini" :show-timeout="0" :hide-timeout="0" trigger="click" @command="handleCommand">
                <el-button type="primary" size="mini"> File<i class="el-icon-arrow-down el-icon--right"></i> </el-button>
                <el-dropdown-menu slot="dropdown" class="tray-navigation">
                    <el-dropdown-item command="quit" divided><i class="el-icon-arrow-down el-icon--left"></i> Quit</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <el-dropdown :hide-on-click="true" size="mini" :show-timeout="0" :hide-timeout="0" trigger="click" @command="handleCommand">
                <el-button type="primary" size="mini"> Edit<i class="el-icon-arrow-down el-icon--right"></i> </el-button>
                <el-dropdown-menu slot="dropdown" class="tray-navigation">
                    <el-dropdown-item command="settings"><i class="el-icon-arrow-down el-icon--left"></i> Settings...</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
            <el-dropdown :hide-on-click="true" size="mini" :show-timeout="0" :hide-timeout="0" trigger="click" @command="handleCommand">
                <el-button type="primary" size="mini"> Help<i class="el-icon-arrow-down el-icon--right"></i> </el-button>
                <el-dropdown-menu slot="dropdown" class="tray-navigation">
                    <el-dropdown-item command="website">Website</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </el-header>
</template>
<script>
export default {
    name: "Traybar",
    methods: {
        handleSelect(key, keyPath) {
            console.log(key, keyPath);
        },
        handleCommand(command) {
            console.log("command: ", command);

            if (command === "website") {
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
            } else if (action === "minimize") {
            } else if (action === "toggle") {
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
