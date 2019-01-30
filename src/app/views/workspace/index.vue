<template>
    <div class="app-container workspace-container">
        <el-row type="flex" align="top">
            <el-col :span="24">
                <el-button icon="el-icon-question" size="mini" type="primary" round @click.prevent.stop="importOpenML">OpenML Import</el-button>
            </el-col>
        </el-row>
        <el-row class="dropzone-container" type="flex" align="top">
            <el-col :span="24">
                <dropzone
                    ref="workspaceDropzone"
                    id="workspaceDropzone"
                    v-on:dropzone-removedFile="dropzoneRemoved"
                    v-on:dropzone-success="dropzoneUploaded"
                    v-on:dropzone-fileClick="dropzoneFileClick"
                    defaultMsg="Drop files here or click to upload."
                    :thumbnailHeight="75"
                    :thumbnailWidth="80"
                    :maxFiles="1000"
                    :maxFilesize="1000000"
                    :authToken="auth_token"
                    acceptedFiles="text/csv,application/octet-stream"
                    :url="user_settings_server_address_backend + '/backend/system/filesystem/upload'"
                >
                </dropzone>
            </el-col>
        </el-row>
        <el-row class="files-container" type="flex" align="top">
            <el-col :span="24">
                <div class="dropzone-previews dropzone"></div>
            </el-col>
        </el-row>
        <el-dialog title="Please choose OpenML dataset you wish to import" :visible.sync="dialogOpenMLDatasets">
            <el-table :data="openMLData" ref="openMLTable" empty-text="Finding datasets for import" stripe border fit style="width: 100%">
                <el-table-column type="expand">
                    <template slot-scope="props">
                        <pre class="code-output" v-highlightjs="props.row.description"><code class="bash"></code></pre>
                    </template>
                </el-table-column>
                <el-table-column 
                    property="did" 
                    label="ID"
                    width="50">
                </el-table-column>
                <el-table-column 
                    label="Name">
                    <template slot-scope="scope">
                        <a :href="scope.row.url" target="_blank">{{scope.row.name}}</a> 
                    </template>
                </el-table-column>
                <el-table-column 
                    label="Tags">
                    <template slot-scope="scope">
                        {{scope.row.tag}}
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination-container">
                <el-pagination
                    background
                    v-loading="openMLDatasetsLoading"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page.sync="queueFilterQuery.page"
                    :page-sizes="[5, 10]"
                    :page-size="queueFilterQuery.limit"
                    layout="total, sizes, prev, pager, next, jumper"
                >
                </el-pagination>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import { Dropzone } from "./components";
import { mapGetters } from "vuex";

import { readFilesInUserDirectory as ApiReadFilesInUserDirectory, deleteFile as ApiDeleteFile, getOpenMLDatasets as ApiGetOpenMLDatasets } from "@/api/backend";
import { md5String } from "@/utils";

export default {
    name: "workspace",

    components: {
        Dropzone
    },
    data() {
        return {
            openMLData: [],
            dialogOpenMLDatasets: false,
            openMLMesurments: [],
            openMLDatasetsLoading: false,
            queueFilterQuery: {
                page: 1,
                limit: 5
            },

            totalFileSize: 0,
            totalFiles: 0,
            directoryFilesHash: "",
            loadingInstance: null,
            loadingText: "please wait..."
        };
    },
    mounted() {
        this.fetchReadFilesInDirectory();
    },
    computed: {
        ...mapGetters(["user_settings_server_address_backend", "auth_token"]),
        selectedFiles: {
            get() {
                return this.$store.getters.selectedFiles;
            },
            set(value) {
                this.$store.dispatch("setSelectedFiles", value);
            }
        }
    },
    methods: {
        handleSizeChange(val) {
            this.queueFilterQuery.limit = val;
            this.importOpenML();
        },
        handleCurrentChange(val) {
            this.queueFilterQuery.page = val;
            this.importOpenML();
        },
        importOpenML() {
            this.openMLDatasetsLoading = true;
            this.dialogOpenMLDatasets = true;

            ApiGetOpenMLDatasets(this.queueFilterQuery)
                .then(response => {
                    // Update elements only if needed to avoid DOM rendering
                    if (response.data.success === true) {
                        this.openMLData = response.data.message.dataset;
                        this.openMLMesurments = response.data.message.qualityMesurments;
                    }
                    this.openMLDatasetsLoading = false;
                })
                .catch(error => {
                    console.log("==> Cannot get ApiGetOpenMLDatasets stats: " + error);
                    this.openMLDatasetsLoading = false;
                    this.dialogOpenMLDatasets = false;
                });
        },
        // Initialize selected file class on initial file load
        dropzoneFileAdded(file) {
            if (this.selectedFiles.length === 0) {
                this.dropzoneFileClick(file);
            }
        },
        addFile(item) {
            this.totalFileSize += item.size;
            this.$refs.workspaceDropzone.initFiles([
                {
                    fileId: parseInt(item.id),
                    size: item.size,
                    name: item.display_filename + item.extension,
                    basename: item.display_filename,
                    extension: item.extension.replace(".", ""),
                    mime_type: item.mime_type || "text/plain",
                    type: item.item_type
                }
            ]);
        },
        dropzoneFileClick(file) {
            let selectFile = false;
            const selectedFile = {
                id: parseInt(file.fileId),
                basename: file.name,
                extension: file.extension,
                type: file.type
            };

            // Check if there are any existing file selected
            if (this.selectedFiles.length > 0) {
                this.selectedFiles = this.selectedFiles.filter(function(item) {
                    return selectedFile.id !== item.id;
                });
            } else {
                this.selectedFiles = [selectedFile];
                selectFile = true;
            }
            if (selectFile === true) {
                file.previewElement.classList.add("dz-selected");
            } else {
                file.previewElement.classList.remove("dz-selected");
            }
        },
        dropzoneUploaded(file, element) {
            this.$message({ message: file.name + " uploaded!", type: "success" });
        },
        dropzoneRemoved(file) {
            this.startLoading();
            console.log("dropzoneRemoved");
            ApiDeleteFile(file.fileId)
                .then(response => {
                    if (response.data.success === true) {
                        this.$message({ message: file.name + " deleted", type: "success" });
                        this.selectedFiles = this.selectedFiles.filter(function(item) {
                            return file.fileId !== item.id;
                        });
                    } else {
                        console.log(response);
                        this.$message({ message: "Operation failed!", type: "warning" });
                    }
                    this.stopLoading();
                })
                .catch(error => {
                    console.log(error);
                    this.stopLoading();
                    this.$message({ message: "Operation failed!", type: "warning" });
                });
        },
        fetchReadFilesInDirectory(selectedPath) {
            this.startLoading();
            ApiReadFilesInUserDirectory({ selectedDirectory: selectedPath })
                .then(response => {
                    if (response.data.success === true) {
                        const directoryFilesHash = md5String(JSON.stringify(response.data.message));
                        if (this.directoryFilesHash !== directoryFilesHash) {
                            this.totalFiles = response.data.message.length;
                            response.data.message.forEach(item => {
                                this.addFile(item);
                            });
                        }
                    } else {
                        console.log(response);
                    }
                    this.stopLoading();
                })
                .catch(error => {
                    console.log(error);
                    this.stopLoading();
                });
        },
        startLoading() {
            this.loadingInstance = this.$loading({
                lock: true,
                text: this.loadingText,
                spinner: "el-icon-loading",
                fullscreen: true,
                customClass: "loading-api",
                background: "rgba(0, 0, 0, 0.7)"
            });
        },
        stopLoading() {
            this.loadingInstance.close();
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.code-output {
    height: 300px;
    overflow: auto;
    font-size: 11px;
}
.dropzone-container {
    margin-top: 10px;
}
.files-container {
    margin-top: 10px;
}
</style>
