<template>
    <transition name="slide-up">
        <div v-if="isTerminalOpen" class="terminal-container" :style="{ height: terminalHeight + 'px' }">
            <!-- Resize Handle -->
            <div class="resize-handle" @mousedown="startResizing"></div>
            <div class="terminal-header">
                <el-tabs v-model="mainTab" type="border-card" class="tab-container-title">
                    <el-tab-pane label="Logs" name="logs"></el-tab-pane>
                    <el-tab-pane label="Assistant" name="assistant"></el-tab-pane>
                </el-tabs>
                <el-button icon="el-icon-copy-document" @click="copyToClipboard" class="utility-button"></el-button>
                <el-button icon="el-icon-full-screen" @click="maximizeTerminal" v-if="!isMaximized" class="utility-button"></el-button>
                <el-button icon="el-icon-minus" @click="minimizeTerminal" v-else class="utility-button"></el-button>
                <el-button icon="el-icon-close" @click="$emit('close')" class="close-button"></el-button>
            </div>
            <div v-if="mainTab === 'logs'">
                <!-- Tabbed Logs Output -->
                <el-tabs v-model="activeTab" type="border-card" class="tab-container-logs">
                    <el-tab-pane v-for="(logContent, normalizedLogType) in displayLogs" :key="normalizedLogType" :label="formatLabel(normalizedLogType)" :name="normalizedLogType">
                        <div :ref="`logContainer-${normalizedLogType}`" class="logs-output" @scroll="checkIfUserScrolled">
                            <div v-for="(line, index) in logContent" :key="`${normalizedLogType}-${index}`" class="log-line">
                                {{ line.content }}
                            </div>
                            <div class="blinking-cursor">_</div>
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>
            <div v-else-if="mainTab === 'assistant'">
                <!-- Assistant Output Tabs (e.g., Output) -->
                <el-tabs v-model="llmActiveTab" type="border-card" class="tab-container-logs">
                    <el-tab-pane label="Output" name="output">
                        <div class="logs-output">
                            <!-- Content for Assistant Output tab -->
                            <p>...</p>
                            <!-- Add other content here as needed -->
                        </div>
                    </el-tab-pane>
                </el-tabs>
            </div>
        </div>
    </transition>
</template>
<script>
import { fetchLiveLogs } from "@/api/backend";

export default {
    name: 'TerminalComponent',
    props: {
        isTerminalOpen: Boolean,
    },
    data() {
        return {
            mainTab: 'logs', // Active main tab (Logs or Assistant)
            activeTab: null, // Active sub-tab under Logs
            llmActiveTab: 'output', // Active sub-tab under Assistant
            displayLogs: {}, // Populated dynamically with normalized log types
            offsets: {}, // Tracks offsets for each normalized log type
            seenHashes: {}, // Track hashes separately for each log type
            fetchInterval: null,
            scrollEnabled: true, // Determines if auto-scroll is enabled
            originalLabels: {}, // Maps normalized log types to their original labels,
            terminalHeight: 300, // Initial height in pixels
            isResizing: false, // Flag to check if resizing is active
            startY: 0, // Starting Y position of the mouse
            startHeight: 0,
            isMaximized: false, // Track if the terminal is maximized
        };
    },
    watch: {
        isTerminalOpen(newVal) {
            if (newVal && this.mainTab === 'logs') {
                this.startFetchingLogs();
            } else {
                this.stopFetchingLogs();
            }
        },
        mainTab(newVal) {
            if (newVal === 'logs') {
                this.startFetchingLogs();
            } else {
                this.stopFetchingLogs();
            }
        },
        activeTab(newVal) {
            if (newVal && this.scrollEnabled) {
                this.scrollToBottom();
            }
        },
    },
    mounted() {
        if (this.isTerminalOpen && this.mainTab === 'logs') {
            this.startFetchingLogs();
        }
    },
    methods: {
        maximizeTerminal() {
            this.terminalHeight = window.innerHeight;
            this.isMaximized = true;
        },
        minimizeTerminal() {
            this.terminalHeight = 300;
            this.isMaximized = false;
        },
        async copyToClipboard() {
            const activeLogs = this.displayLogs[this.activeTab] ?
                this.displayLogs[this.activeTab].map(line => line.content).join('\n') :
                '';
            try {
                await navigator.clipboard.writeText(activeLogs);
                this.$message.success('Copied to clipboard');
            } catch (error) {
                this.$message.error('Failed to copy');
                console.error("Error copying to clipboard:", error);
            }
        },

        startFetchingLogs() {
            this.fetchLogs(); // Initial fetch
            this.fetchInterval = setInterval(this.fetchLogs, 1000); // Fetch every second
        },
        stopFetchingLogs() {
            clearInterval(this.fetchInterval);
            this.fetchInterval = null;
        },
        async fetchLogs() {
            try {
                const response = await fetchLiveLogs(this.offsets);
                if (response.data.success) {
                    this.updateLogs(response.data.logs);
                }
            } catch (error) {
                console.error("Error fetching logs:", error);
            }
        },
        updateLogs(newLogs) {
            Object.keys(newLogs).forEach((logType) => {
                const normalizedLogType = this.normalizeLogType(logType);

                if (!this.displayLogs[normalizedLogType]) {
                    this.$set(this.displayLogs, normalizedLogType, []);
                    this.$set(this.offsets, normalizedLogType, 0);
                    this.originalLabels[normalizedLogType] = logType;
                    this.$set(this.seenHashes, normalizedLogType, new Set());
                }

                newLogs[logType].forEach((logLine) => {
                    if (!this.seenHashes[normalizedLogType].has(logLine.hash)) {
                        this.seenHashes[normalizedLogType].add(logLine.hash);
                        this.displayLogs[normalizedLogType].push(logLine);
                    }
                });

                this.offsets[normalizedLogType] = this.displayLogs[normalizedLogType].length;
            });

            if (this.activeTab.length === 1) {
                this.setActiveTab();
            }
        },
        setActiveTab() {
            const availableTabs = Object.keys(this.displayLogs);
            const tabWithContent = availableTabs.find(
                (tab) => this.displayLogs[tab].length > 0
            );
            this.activeTab = tabWithContent || (availableTabs.length ? availableTabs[0] : '');
        },
        normalizeLogType(logType) {
            return logType.toLowerCase().replace(/\s+/g, '-');
        },
        formatLabel(normalizedLogType) {
            return this.originalLabels[normalizedLogType] || normalizedLogType;
        },
        checkIfUserScrolled() {
            const logContainer = this.$refs[`logContainer-${this.activeTab}`];
            if (logContainer) {
                this.scrollEnabled =
                    logContainer.scrollTop + logContainer.clientHeight >=
                    logContainer.scrollHeight - 10;
            }
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const logContainers = this.$el.querySelectorAll('.logs-output');
                logContainers.forEach(logContainer => {
                    if (logContainer && typeof logContainer.scrollHeight !== 'undefined') {
                        logContainer.scrollTop = logContainer.scrollHeight;
                    } else {
                        console.warn("Log container or scrollHeight is undefined.", logContainer);
                    }
                });
                
            });
        },
        startResizing(event) {
            this.isResizing = true;
            this.startY = event.clientY;
            this.startHeight = this.terminalHeight;

            document.addEventListener('mousemove', this.resizing);
            document.addEventListener('mouseup', this.stopResizing);
        },
        resizing(event) {
            if (!this.isResizing) return;

            const dy = this.startY - event.clientY;
            let newHeight = this.startHeight + dy;

            newHeight = Math.max(100, newHeight); // Minimum height
            newHeight = Math.min(window.innerHeight - 100, newHeight); // Maximum height

            this.terminalHeight = newHeight;

            const logsOutputHeight = newHeight - 125;
            const logContainers = this.$el.querySelectorAll('.logs-output');
            logContainers.forEach(logContainer => {
                logContainer.style.maxHeight = `${logsOutputHeight}px`;
            });

            this.scrollToBottom();
        },
        stopResizing() {
            this.isResizing = false;
            document.removeEventListener('mousemove', this.resizing);
            document.removeEventListener('mouseup', this.stopResizing);
        },
    },
    beforeDestroy() {
        this.stopFetchingLogs();
        if (this.isResizing) {
            document.removeEventListener('mousemove', this.resizing);
            document.removeEventListener('mouseup', this.stopResizing);
        }
    },
};

</script>
<style scoped>
/* Slide-up transition */
.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform 0.3s ease;
}

.slide-up-enter,
.slide-up-leave-to {
    transform: translateY(100%);
}

.utility-button {
    color: #00ff00;
    background-color: transparent;
    border: none;
    margin-left: 10px;
}

/* Terminal Container Styles */
.terminal-container {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background-color: #000;
    color: #00ff00;
    border-top: 2px solid #333;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.5);
    overflow: hidden;
}

/* Resize Handle */
.resize-handle {
    height: 2px;
    cursor: ns-resize;
    background-color: #333;
    position: fixed;
    width: 100%;
}

.terminal-header {
    background-color: #111;
    padding: 10px 20px;
    font-size: 16px;
    display: flex;
    align-items: center;
    color: #00ff00;
}

.close-button {
    color: #00ff00;
    background-color: transparent;
    border: none;
}

.tab-container-title {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: black;

    .el-tabs__header {
        border: none;
        background-color: #111;

        .el-tabs__item {
            color: #00ff00;

            &:hover {
                color: #ffffff;
            }

            &.is-active {
                color: #ffffff;
                background-color: #333;
            }
        }

        .el-tabs__active-bar {
            background-color: #00ff00;
        }
    }

    .el-tabs__content {
        display: none;
    }
}

.tab-container-logs {
    flex: 1;
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: black;

    .el-tabs__header {
        background-color: #111;
        border-bottom: 1px solid #333;

        .el-tabs__item {
            color: #00ff00;

            &:hover {
                color: #ffffff;
            }

            &.is-active {
                color: #ffffff;
                background-color: #333;
            }
        }

        .el-tabs__active-bar {
            background-color: #00ff00;
        }
    }

    .el-tabs__content {
        flex: 1;
        overflow: hidden;
    }
}

.logs-output {
    flex: 1;
    max-height: calc(50vh - 150px);
    overflow-y: auto;
    padding: 10px 20px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    color: #00ff00;
    background-color: #000;
}

.log-line {
    white-space: pre-wrap;
    text-shadow: 0 0 10px #00ff00;
}

.blinking-cursor {
    display: inline-block;
    width: 10px;
    background-color: #00ff00;
    animation: blink 1s step-start infinite;
    margin-left: 2px;
}

@keyframes blink {
    50% {
        opacity: 0;
    }
}

</style>
