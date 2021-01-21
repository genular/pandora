<template>
    <div>
        <el-badge :value="errorLogs.length" :max="10" style="line-height: 30px;" @click.native="errorDialog = true">
            <i class="fa fa-bug" aria-hidden="true"></i>
        </el-badge>

        <el-dialog :title="$t('components.ErrorLog.dialog.help-us')" :visible.sync="errorDialog" width="80%" :lock-scroll="false">
            <el-row type="flex" align="top">
                <el-col class="help-us" :span="12">
                    {{ $t('components.ErrorLog.dialog.help-us') }}
                    <a href="https://github.com/genular/simon-frontend#submitting-bugs-and-enhancements" target="_blank">{{ $t('components.ErrorLog.dialog.more-info') }}</a>
                </el-col>
                <el-col class="actions" :span="12">
                    <el-button size="mini" round type="primary" icon="el-icon-delete" @click="clearErrorLog()"></el-button>
                    <el-button size="mini" round type="primary" icon="el-icon-download" @click="copyToClipboard($event)"></el-button>
                </el-col>
            </el-row>

            <el-table :data="errorLogs" class="errorLogTable" border>
                <el-table-column :label="$t('components.ErrorLog.table.title')">
                    <template slot-scope="scope">
                        <div class="message-item">
                            <span class="message-title">{{ $t('components.ErrorLog.table.message') }}:</span>
                            <el-tag v-if="scope.row.err" type="danger">{{ scope.row.err.message }}</el-tag>
                        </div>
                        <div class="message-item">
                            <span class="message-title" style="padding-right: 10px;">Info: </span>
                            <el-tag v-if="scope.row.vm" type="warning">{{ scope.row.vm.$vnode.tag }} error in {{ scope.row.info }}</el-tag>
                        </div>
                        <div class="message-item">
                            <span class="message-title" style="padding-right: 16px;">Url: </span>
                            <el-tag type="success">{{ scope.row.url }}</el-tag>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column label="Traceback">
                    <template slot-scope="scope">
                        <div class="error-description">
                            <pre v-if="scope.row.err" class="code-output">
                                <div class="highlight_code">
                                    {{scope.row.err.stack}}
                                </div>
                            </pre>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>
<script>
import clipboard from "@/utils/clipboard";

export default {
    name: "errorLog",
    data() {
        return {
            errorDialog: false
        };
    },
    computed: {
        errorLogs: {
            get() {
                return this.$store.getters.errorLogs;
            },
            set(value) {
                this.$store.dispatch("addLog", value);
            }
        }
    },
    methods: {
        clearErrorLog() {
            this.$store.dispatch("clearLog");
        },
        copyToClipboard(event) {
            const logs = [];
            this.errorLogs.forEach(function(log) {
                logs.push({
                    message: log.err,
                    info: log.vm.$vnode.tag + " error in " + log.info,
                    url: log.url,
                    error: log.err.stack
                });
            });
            clipboard(JSON.stringify(logs), event);
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.el-badge__content {
    font-size: 10px;
    border-radius: 25px;
    height: 15px;
    line-height: 15px;
    padding: 0 5px;
}
.el-dialog__body {
    padding: 0 20px;
    .help-us {
        font-size: 16px;
        font-style: italic;
        float: left;
        > a {
            color: #333;
            font-weight: 300;
        }
    }
    .actions {
        float: right;
        text-align: right;
    }
    .errorLogTable {
        .error-description {
            .code-output {
                overflow: auto;
                font-size: 11px;
            }
        }
        .message-item {
            padding-top: 10px;
            float: left;
            width: 100%;
            .message-title {
                font-size: 12px;
                color: #333;
                font-weight: bold;
                padding-right: 10px;
            }
        }
    }
}
</style>
