<template>
    <div class="app-container workspace-container">
        <div class="editor-container">
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
                :url="user_settings_server_address_backend + '/backend/system/filesystem/upload'">
          </dropzone>
          <!-- v-on:dropzone-fileAdded="dropzoneFileAdded" -->
          <div class="dropzone-previews dropzone"></div>
        </div>
    </div>
</template>
<script>
import { Dropzone } from "./components";
import { mapGetters } from "vuex";

import { readFilesInUserDirectory as ApiReadFilesInUserDirectory, deleteFile as ApiDeleteFile } from "@/api/backend";
import { md5String } from "@/utils";

export default {
    name: "workspace",

    components: {
        Dropzone
    },
    data() {
        return {
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
            ApiReadFilesInUserDirectory(selectedPath)
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
</style>
