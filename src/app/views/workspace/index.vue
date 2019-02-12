<template>
    <div class="app-container workspace-container" v-loading.fullscreen.lock="loading" :element-loading-text="$t('globals.page_loading')" @click="closeContextMenus">
        <el-row type="flex" align="top">
            <el-col :span="24">
                <public-import style="float:left;" ref="publicImporte" v-on:refresh-items="refreshFilesInDirectory"></public-import>
                <el-button style="float:right;" icon="el-icon-delete" size="mini" type="primary" round @click.prevent.stop="deleteFilesInDirectory">
                    {{ $t('views.workspace.index.buttons.delete_all') }}
                </el-button>
            </el-col>
        </el-row>
        <el-row class="dropzone-container" type="flex" align="top">
            <el-col :span="24">
                <dropzone
                    ref="workspaceDropzone"
                    id="workspaceDropzone"
                    v-on:fileRemoved="dropzoneRemoved"
                    v-on:fileUploaded="dropzoneUploaded"
                    v-on:actionListener="dropzoneFileClick"
                    :showRemoveLink="!$config.isDemoServer"
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
        <div class="dropzone-context-menu">
            <ul class="menu-options">
                <li class="menu-option" @click="contextAction('select')">{{ $t('views.workspace.index.context_menu.select') }}</li>
                <li class="menu-option" @click="contextAction('download')">{{ $t('views.workspace.index.context_menu.download') }}</li>
                <li class="menu-option" @click="contextAction('delete')">{{ $t('views.workspace.index.context_menu.delete') }}</li>
                <li class="menu-option" @click="contextAction('preview')">{{ $t('views.workspace.index.context_menu.preview') }}</li>
                <li class="menu-option" @click="contextAction('stats')">{{ $t('views.workspace.index.context_menu.stats') }}</li>
            </ul>
        </div>
    </div>
</template>
<script>
import { Dropzone, publicImport } from "./components";
import { mapGetters } from "vuex";

import { readFilesInUserDirectory as ApiReadFilesInUserDirectory, deleteFile as ApiDeleteFile } from "@/api/backend";
import { md5String } from "@/utils";

export default {
    name: "workspace",

    components: {
        Dropzone,
        publicImport
    },
    data() {
        return {
            loading: false,
            refreshLoading: false,
            totalFileSize: 0,
            totalFiles: 0,
            directoryFilesHash: "",
            contextmenu: {
                element: null,
                visible: false,
                selectedFile: null
            }
        };
    },
    mounted() {
        this.contextmenu.element = document.querySelector(".dropzone-context-menu");
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
        deleteFilesInDirectory() {
            this.$confirm(this.$t('views.workspace.index.operations.delete_all.dialog.description'), this.$t('views.workspace.index.operations.delete_all.dialog.title'), {
                type: "warning"
            })
                .then(_ => {
                    if (!this.$config.isDemoServer) {
                        this.$refs.workspaceDropzone.removeAllFiles(false);
                    } else {
                        this.$message({
                            type: "warning",
                            message: this.$t('globals.demo_server.function_disabled')
                        });
                    }
                })
                .catch(_ => {
                    this.$message({
                        type: "info",
                        message: this.$t('globals.messages.canceled')
                    });
                });
        },
        manuallyAddFiles(files) {
            if (Array.isArray(files)) {
                files.map((file, i) => {
                    this.totalFileSize += file.size;
                    this.$refs.workspaceDropzone.manuallyAddFile({
                        fileId: parseInt(file.id),
                        size: file.size,
                        name: file.display_filename + file.extension,
                        basename: file.display_filename,
                        extension: file.extension.replace(".", ""),
                        mime_type: file.mime_type || "text/plain",
                        type: file.item_type
                    });
                });
            }
        },
        closeContextMenus(event) {
            if (this.contextmenu.visible) {
                this.toggleMenu("hide");
            }
        },
        toggleMenu(command) {
            this.contextmenu.element.style.display = command === "show" ? "block" : "none";
            this.contextmenu.visible = !this.contextmenu.visible;
        },
        setPosition({ top, left }) {
            this.contextmenu.element.style.left = `${left}px`;
            this.contextmenu.element.style.top = `${top}px`;
            this.toggleMenu("show");
        },
        contextAction(action) {
            console.log(action);
            console.log(this.contextmenu.selectedFile);
            this.$message({
                type: "info",
                message:  this.$t('globals.messages.not_implemented')
            });
        },
        dropzoneFileClick(item) {
            if (this.contextmenu.visible) {
                this.toggleMenu("hide");
            }
            if (item.action === "contextmenu") {
                item.event.preventDefault();
                this.contextmenu.selectedFile = item.file;

                this.setPosition({
                    left: item.event.pageX,
                    top: item.event.pageY
                });
                return false;
            }

            let selectFile = false;
            const selectedFile = {
                id: parseInt(item.file.fileId),
                basename: item.file.name,
                extension: item.file.extension,
                type: item.file.type
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
                item.file.previewElement.classList.add("dz-selected");
            } else {
                item.file.previewElement.classList.remove("dz-selected");
            }
        },
        dropzoneUploaded(file, element) {
            this.$message({ message: file.name + " " + this.$t('globals.messages.upload_sucessfull'), type: "success" });
        },
        dropzoneRemoved(file) {
            console.log("dropzoneRemoved");
            // If loading is already running don't delete files since probably its all about
            // fetchReadFilesInDirectory => removeAllFiles
            if (this.refreshLoading === true) {
                return;
            }

            this.loading = true;
            ApiDeleteFile({ selectedFiles: [file.fileId] })
                .then(response => {
                    if (response.data.success === true) {
                        this.$message({ message: file.name + " " + this.$t('globals.messages.deleted'), type: "success" });
                        this.selectedFiles = this.selectedFiles.filter(function(item) {
                            return file.fileId !== item.id;
                        });
                    } else {
                        console.log(response);
                        this.$message({ message: this.$t('globals.errors.request_general'), type: "warning" });
                    }
                    this.loading = false;
                })
                .catch(error => {
                    console.log(error);
                    this.loading = false;
                    this.$message({ message: this.$t('globals.errors.request_general'), type: "warning" });
                });
        },
        fetchReadFilesInDirectory() {
            this.loading = true;
            ApiReadFilesInUserDirectory({ selectedDirectory: "" })
                .then(response => {
                    if (response.data.success === true) {
                        const directoryFilesHash = md5String(JSON.stringify(response.data.message));
                        if (this.directoryFilesHash !== directoryFilesHash) {
                            this.totalFiles = response.data.message.length;
                            this.manuallyAddFiles(response.data.message);
                        }
                    } else {
                        console.log(response);
                    }
                    this.loading = false;
                })
                .catch(error => {
                    console.log(error);
                    this.loading = false;
                });
        },
        refreshFilesInDirectory() {
            this.refreshLoading = true;
            this.$refs.workspaceDropzone.removeAllFiles(false);
            this.fetchReadFilesInDirectory();
            this.refreshLoading = false;
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.dropzone-container {
    margin-top: 10px;
}
.dropzone-context-menu {
    box-shadow: 0 4px 5px 3px rgb(239, 240, 249);
    position: fixed;
    display: none;
    z-index: 1001;
    background-color: #ffffff;

    .menu-options {
        list-style: none;
        padding: 0;
        margin: 0;

        .menu-option {
            font-size: 14px;
            padding: 10px 40px 10px 20px;
            cursor: pointer;

            &:hover {
                background: rgb(239, 240, 249);
            }
        }
    }
}

.files-container {
    margin-top: 10px;
}
</style>
