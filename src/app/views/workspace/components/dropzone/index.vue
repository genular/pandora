<template>
    <div :ref="id" :action="url" class="dropzone" :id="id">
        <input type="file" name="file" />
    </div>
</template>
<script>
import Dropzone from "dropzone";
Dropzone.autoDiscover = false;

export default {
    name: "dropzone",
    data() {
        return {
            isDestroyEvent: false,
            dropzone: null,
            initOnce: true
        };
    },
    mounted() {
        const element = document.getElementById(this.id);
        const vm = this;

        this.dropzone = new Dropzone(element, {
            clickable: true,
            previewsContainer: ".dropzone-previews",
            thumbnailWidth: this.thumbnailWidth,
            thumbnailHeight: this.thumbnailHeight,
            maxFiles: this.maxFiles,
            maxFilesize: this.maxFilesize,
            dictRemoveFile: this.$t("views.workspace.components.dropzone.buttons.delete_file"),
            addRemoveLinks: this.showRemoveLink,
            acceptedFiles: this.acceptedFiles,
            ignoreHiddenFiles: true,
            autoProcessQueue: this.autoProcessQueue,
            chunking: true,
            chunkSize: 100 * 1024 * 1024,
            forceChunking: false,
            parallelChunkUploads: false,
            retryChunks: true,
            retryChunksLimit: 3,
            createImageThumbnails: false,
            timeout: 50000,
            dictDefaultMessage:
                '<i style="display: table-cell; vertical-align: middle;" class="el-icon-upload">  ' +
                this.$t("views.workspace.components.dropzone.messages.upload_placeholder") +
                "</i>",
            headers: {
                "X-Token": this.authToken || "failed"
            },
            dictMaxFilesExceeded: "You can not upload any more files.",
            previewTemplate:
                '<div class="dz-preview dz-file-preview">\n  <div class="dz-image" style="width:' +
                this.thumbnailWidth +
                "px;height:" +
                this.thumbnailHeight +
                'px" ><img data-dz-thumbnail style="margin: 0 auto; width:' +
                this.thumbnailWidth +
                "px;height:" +
                this.thumbnailHeight +
                'px" /></div>\n  <div class="dz-details">\n    <div class="dz-size"><span data-dz-size></span></div>\n    <div class="dz-filename"><span data-dz-name></span></div>\n  </div>\n  <div class="dz-progress"><span class="dz-upload" data-dz-uploadprogress></span></div>\n  <div class="dz-error-message"><span data-dz-errormessage></span></div>\n  <div class="dz-success-mark">\n <i class="el-icon-success"></i> \n</div>\n  <div class="dz-error-mark">\n<i class="el-icon-warning"></i>\n</div>\n</div>',

            init() {
                const val = vm.defaultImg;
                if (!val) return;
                if (Array.isArray(val)) {
                    val.map((v, i) => {
                        this.dropzone.options.addedfile.call(this.dropzone, v);
                        this.dropzone.options.thumbnail.call(this.dropzone, v, v.url);
                        v.previewElement.classList.add("dz-success");
                        v.previewElement.classList.add("dz-complete");
                        vm.initOnce = false;
                        return true;
                    });
                }
            },
            accept: (file, done) => {
                done();
            },
            sending: (file, xhr, formData) => {
                vm.initOnce = false;
            }
        });

        if (this.$config.isDemoServer) {
            this.dropzone.disable();
        }

        if (this.couldPaste) {
            document.addEventListener("paste", this.pasteImg);
        }

        this.dropzone.on("success", (file, response) => {
            let addedFile = file;
            if (response.success === true) {
                const remoteFileInfo = response.message;
                addedFile.fileId = remoteFileInfo.id;
                // addedFile.size = remoteFileInfo.size;
                // addedFile.name = remoteFileInfo.filename + remoteFileInfo.extension;
                addedFile.basename = remoteFileInfo.filename + remoteFileInfo.extension;
                addedFile.extension = remoteFileInfo.extension.replace(".", "");
                addedFile.mime_type = remoteFileInfo.mime_type || "text/plain";
                // addedFile.type = "file";
                addedFile.url = "/static/icons/defult.png";
                // Add fileID
            } else {
                addedFile.remote_message = response.message;
            }
            vm.$emit("fileUploaded", addedFile, vm.dropzone.element);
            // Remove file from dropzone if there was error in upload
            if (typeof addedFile.remote_message !== "undefined") {
                this.dropzone.files = this.dropzone.files.filter(({ upload }) => {
                    let removedCheck = true;
                    if (typeof upload != "undefined") {
                        if (upload.uuid === addedFile.upload.uuid) {
                            removedCheck = false;
                        }
                    }
                    return removedCheck;
                });
                this.dropzone.removeFile(file);
            }
        });
        this.dropzone.on("addedfile", item => {
            this.dropzone.emit("thumbnail", item, "/static/icons/defult.png");

            item.previewElement.addEventListener("click", e => {
                vm.$emit("actionListener", { action: "click", file: item, event: e });
            });
            item.previewElement.addEventListener("contextmenu", e => {
                vm.$emit("actionListener", { action: "contextmenu", file: item, event: e });
            });
        });
        this.dropzone.on("removedfile", file => {
            if (this.isDestroyEvent === false) {
                console.log("Event: removedfile");
                // https://github.com/enyo/dropzone/issues/1175#issuecomment-412302917
                if (file.manuallyAdded) {
                    vm.dropzone.options.maxFiles++;
                }
                // Remove file from dropzone if there was error in upload
                if (typeof file.remote_message === "undefined") {
                    vm.$emit("fileRemoved", file);
                } else {
                    vm.dropzone.options.maxFiles--;
                }
            }
        });
        this.dropzone.on("error", (file, error, xhr) => {
            vm.$emit("dropzone-error", file, error, xhr);
        });
        this.dropzone.on("successmultiple", (file, error, xhr) => {
            vm.$emit("dropzone-successmultiple", file, error, xhr);
        });
    },
    methods: {
        filesAvaliable() {
            return this.dropzone.files.length;
        },
        removeAllFiles(bool) {
            console.log("Removing all files from workspace");
            this.dropzone.removeAllFiles(bool);
        },
        processQueue() {
            this.dropzone.processQueue();
        },
        pasteImg(event) {
            const items = (event.clipboardData || event.originalEvent.clipboardData).items;
            if (items[0].kind === "file") {
                this.dropzone.addFile(items[0].getAsFile());
            }
        },
        manuallyAddFile(file) {
            file.manuallyAdded = true;
            this.dropzone.emit("addedfile", file);
            this.dropzone.files.push(file);
            if (this.dropzone.options.maxFiles) this.dropzone.options.maxFiles--;
        },
        preselectFilesByID(selectedFiles) {
            this.dropzone.files.forEach((item, itemIndex) => {
                const isAlreadySelected = selectedFiles.some(file => file.id === item.fileId);

                if (isAlreadySelected) {
                    this.dropzone.files[itemIndex].previewElement.classList.add("dz-selected");
                }
            });
        },
        deselectAllFiles() {
            this.dropzone.files.forEach((item, itemIndex) => {
                this.dropzone.files[itemIndex].previewElement.classList.remove("dz-selected");
            });
        }
    },
    destroyed() {
        this.isDestroyEvent = true;
        document.removeEventListener("paste", this.pasteImg);
        this.dropzone.destroy();
        this.isDestroyEvent = false;
    },
    watch: {
        defaultImg(val) {
            if (val.length === 0) {
                this.initOnce = false;
                return;
            }
            if (!this.initOnce) return;
            this.initFiles(val);
            this.initOnce = false;
        }
    },
    props: {
        id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        },
        authToken: {
            type: String,
            required: true
        },
        clickable: {
            type: Boolean,
            default: true
        },
        acceptedFiles: {
            type: String
        },
        thumbnailHeight: {
            type: Number,
            default: 100
        },
        thumbnailWidth: {
            type: Number,
            default: 100
        },
        showRemoveLink: {
            type: Boolean,
            default: true
        },
        maxFilesize: {
            type: Number,
            default: 2
        },
        maxFiles: {
            type: Number,
            default: 3
        },
        autoProcessQueue: {
            type: Boolean,
            default: true
        },
        useCustomDropzoneOptions: {
            type: Boolean,
            default: false
        },
        defaultImg: {
            default: false
        },
        couldPaste: {
            default: false
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss">
@import "~scss_vars";

.dropzone {
    border: 0 none;

    color: #333;
    min-height: 0;
    padding: 0;

    &:not(:last-child) {
        min-height: 100px;
        border-bottom: 2px dashed #eff0f9;
        padding: 10px;
    }
    &:not(:empty) {
        padding: 10px;
    }

    i {
        color: #ccc;
    }
    input[name="file"] {
        display: none;
    }

    > .dz-default {
        padding: 25px;
        margin: 0;

        > span {
            width: 100%;
            display: table;
            > i {
                font-size: 24px;
                padding: 5px;
                color: #35224a;
            }
        }
    }

    > .dz-selected {
        border-bottom: 1px dashed $ui-background !important;
        background: rgba(239, 240, 249, 0.67) !important;
    }

    > .dz-preview {
        margin: 0;
        vertical-align: middle;
        transition: all 0.3s linear;
        border-bottom: 1px dashed transparent;
        min-height: 120px;
        &:not(:first-child) {
            margin: 0 0 0 5px;
        }
        &:hover {
            .dz-image {
                > img {
                    filter: blur(1px);
                }
            }
        }

        .dz-image {
            border-radius: 0;
            width: 100%;
            height: 100%;

            img[src=""] {
                display: none;
            }
        }
        .dz-details {
            bottom: 0;
            top: 0;
            color: white;
            text-align: left;
            opacity: 1;
            background: transparent;
            padding: 0;
            cursor: pointer;
            .dz-size {
                text-align: center;
                font-size: 13px;
                position: absolute;
                top: 5px;
                background-color: rgba(227, 0, 110, 0.8);
            }
            .dz-filename {
                overflow: visible;
                position: absolute;
                bottom: 5px;
                color: #333;
                text-align: center;
                width: 100%;
            }
            .dz-filename span,
            .dz-size span {
                background-color: transparent;
            }
            .dz-filename:not(:hover) span {
                border: none;
            }
            .dz-filename:hover span {
                background-color: #f8f8f8;
                white-space: nowrap;
                border: none;
            }
        }
        .dz-progress .dz-upload {
            background: #cccccc;
        }
        .dz-remove {
            position: absolute;
            z-index: 1000;
            color: #fff;
            padding: 1px;
            text-decoration: none;
            text-transform: uppercase;
            font-size: 10px;
            font-weight: 800;
            letter-spacing: 1.1px;
            text-align: center;
            top: 45px;
            left: 50%;
            opacity: 0;
            background-color: rgba(227, 0, 110, 0.6);
            margin-left: -50px;
            width: 100px;
        }
        .dz-progress {
            opacity: 0;
            z-index: 1000;
            pointer-events: none;
            position: absolute;
            height: 16px;
            left: 50%;
            margin-top: -15px;
            width: 80px;
            margin-left: -40px;
            background: rgba(255, 255, 255, 0.9);
            -webkit-transform: scale(1);
            border-radius: 0;
            overflow: hidden;
        }
        &:hover {
            .dz-remove {
                opacity: 1;
            }
        }
        .dz-success-mark,
        .dz-error-mark {
            margin-left: auto;
            margin-top: auto;
            width: 100%;
            top: 35%;
            left: 0;
            text-align: center;
            i {
                color: #333333;
            }
        }
        .dz-error-message {
            z-index: 9999;
            top: 100px;
        }
    }
}
</style>
