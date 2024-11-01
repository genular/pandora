<template>
    <transition name="slide-up">
        <div v-if="isTerminalOpen" class="terminal-container" :style="{ height: terminalHeight + 'px' }">
            <!-- Resize Handle -->
            <div class="resize-handle" @mousedown="startResizing"></div>
            <div class="terminal-header">
                <span>Terminal</span>
                <el-button icon="el-icon-close" @click="$emit('close')" class="close-button"></el-button>
            </div>
            <!-- Tabbed Logs Output -->
            <el-tabs v-model="activeTab" type="border-card" class="tab-container-logs">
                <el-tab-pane
                    v-for="(logContent, normalizedLogType) in displayLogs"
                    :key="normalizedLogType"
                    :label="formatLabel(normalizedLogType)"
                    :name="normalizedLogType"
                >
                    <!-- Each log output has a unique ref based on the normalizedLogType -->
                    <div
                        :ref="`logContainer-${normalizedLogType}`"
                        class="logs-output"
                        @scroll="checkIfUserScrolled"
                    >
                        <div
                            v-for="(line, index) in logContent"
                            :key="`${normalizedLogType}-${index}`"
                            class="log-line"
                        >
                            {{ line.content }}
                        </div>
                        <!-- Blinking cursor -->
                        <div class="blinking-cursor">_</div>
                    </div>
                </el-tab-pane>
            </el-tabs>
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
            activeTab: null, // Default to null until populated
            displayLogs: {}, // Populated dynamically with normalized log types
            offsets: {}, // Tracks offsets for each normalized log type
            seenHashes: {}, // Track hashes separately for each log type
            fetchInterval: null,
            scrollEnabled: true, // Determines if auto-scroll is enabled
            originalLabels: {}, // Maps normalized log types to their original labels,
            terminalHeight: 300, // Initial height in pixels
            isResizing: false,   // Flag to check if resizing is active
            startY: 0,           // Starting Y position of the mouse
            startHeight: 0,      // Starting height of the terminal
        };
    },
    watch: {
        isTerminalOpen(newVal) {
            if (newVal) {
                this.startFetchingLogs();
            } else {
                this.stopFetchingLogs();
            }
        },
        activeTab(newVal) {
            if (newVal) {
                if (this.scrollEnabled) {
                    this.scrollToBottom();
                }
            }
       },
    },
    mounted() {
        if (this.isTerminalOpen) {
            this.startFetchingLogs();
        }
    },
    methods: {
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

                // Initialize logs, offsets, and seenHashes for new log types if not already initialized
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

                // Update offset
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
        // Resizing Methods
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

            // Set minimum and maximum heights
            newHeight = Math.max(100, newHeight); // Minimum height
            newHeight = Math.min(window.innerHeight - 100, newHeight); // Maximum height

            this.terminalHeight = newHeight;

            // logs-output height is calculated based on the terminal header and tabs height
            const logsOutputHeight = newHeight - 100; // Adjust based on header and tabs height
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

.resize-handle:hover {
    background-color: #555;
}

.terminal-header {
    background-color: #111; /* Dark background */
    padding: 10px 20px;
    font-size: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #00ff00; /* Green text */
}

.close-button {
    color: #00ff00;
    background-color: transparent;
    border: none;
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
            background-color: transparent;
            border: none;

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
    max-height: calc(50vh - 100px); /* Adjust based on header and tabs height */
    overflow-y: auto;
    overflow-x: hidden;
    padding: 10px 20px;
    font-family: 'Courier New', Courier, monospace;
    font-size: 14px;
    line-height: 1.4;
    color: #00ff00; /* Green text */
    scroll-behavior: smooth;
    background-color: #000; /* Black background */
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
