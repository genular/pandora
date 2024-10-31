<template>
    <div class="terminal-container">
        <div class="terminal-header">
            <span>Live Logs Terminal</span>
            <el-button icon="el-icon-close" @click="$emit('close')" class="close-button"></el-button>
        </div>
        <!-- Tabbed Logs Output -->
        <el-tabs v-model="activeTab" type="border-card" class="tab-container-logs">
            <el-tab-pane v-for="(logContent, normalizedLogType) in displayLogs" :key="normalizedLogType" :label="formatLabel(normalizedLogType)" :name="normalizedLogType">
                <!-- Each log output has a unique ref based on the normalizedLogType -->
                <div :ref="`logContainer-${normalizedLogType}`" class="logs-output" @scroll="checkIfUserScrolled">
                    <div v-for="(line, index) in logContent" :key="`${normalizedLogType}-${index}`" class="log-line">
                        {{ line.content }}
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
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
            seenHashes: new Set(),
            fetchInterval: null,
            scrollEnabled: true, // Determines if auto-scroll is enabled
            originalLabels: {} // Maps normalized log types to their original labels
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
        displayLogs(newLogs) {
            if (!this.activeTab && Object.keys(newLogs).length) {
                this.activeTab = Object.keys(newLogs)[0];
            }
        }
    },
    mounted() {
        if (this.isTerminalOpen) {
            this.startFetchingLogs();
        }
    },
    methods: {
        startFetchingLogs() {
            this.fetchLogs(); // Initial fetch
            this.fetchInterval = setInterval(this.fetchLogs, 5000);
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
            Object.keys(newLogs).forEach(logType => {
                const normalizedLogType = this.normalizeLogType(logType);

                // Initialize logs and offsets for new normalized log types if not already initialized
                if (!this.displayLogs[normalizedLogType]) {
                    this.$set(this.displayLogs, normalizedLogType, []);
                    this.$set(this.offsets, normalizedLogType, 0);
                    this.originalLabels[normalizedLogType] = logType;
                }

                newLogs[logType].forEach(logLine => {
                    if (!this.seenHashes.has(logLine.hash)) {
                        this.seenHashes.add(logLine.hash);
                        this.displayLogs[normalizedLogType].push(logLine);
                    }
                });

                // Update offset
                this.offsets[normalizedLogType] = this.displayLogs[normalizedLogType].length;
                if (this.activeTab.length < 2) {
                    this.setActiveTab();
                }
            });

            // Call scrollToBottom if auto-scrolling is enabled
            if (this.scrollEnabled) {
                this.scrollToBottom();
            }
        },
        setActiveTab() {
            console.log('Setting active tab');
            const availableTabs = Object.keys(this.displayLogs);
            console.log('Available Tabs:', availableTabs);
            this.activeTab = availableTabs.length ? availableTabs[0] : '';
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
                this.scrollEnabled = logContainer.scrollTop + logContainer.clientHeight >= logContainer.scrollHeight - 10;
            }
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const logContainers = this.$el.querySelectorAll('.logs-output');
                logContainers.forEach(logContainer => {
                    if (logContainer && typeof logContainer.scrollHeight !== 'undefined') {
                        logContainer.scrollTop = logContainer.scrollHeight;
                        console.log('Scrolled to bottom:', logContainer.scrollHeight);
                    } else {
                        console.warn("Log container or scrollHeight is undefined.", logContainer);
                    }
                });
            });
        }
    },
    beforeDestroy() {
        this.stopFetchingLogs();
    }
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
    height: 50vh;
    background-color: #1e1e1e;
    color: #ffffff;
    border-top: 2px solid #333;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    box-shadow: 0px -2px 10px rgba(0, 0, 0, 0.5);
    overflow: hidden;
    /* Ensure no accidental overflow in main container */
}

.terminal-header {
    background-color: #333;
    padding: 10px 20px;
    font-size: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.close-button {
    color: #aaa;
}

.tab-container-logs {
    border: none;
    box-shadow: none;
    background-color: transparent;
    height: 100%;

    .el-tabs__header {
        background-color: #FFF;

        .el-tabs__item {
            &:is(.is-disabled) {
                opacity: 0.2;
            }

            &:is(.is-active) {
                border-right-color: transparent;
                border-left-color: transparent;
            }
        }
    }
}

.logs-output {
    flex: 1;
    max-height: 40vh;
    /* Set a max height for overflow */
    overflow-y: auto;
    overflow-x: hidden;
    padding: 10px 20px;
    font-family: monospace;
    font-size: 14px;
    line-height: 1.4;
    color: #ddd;
    scroll-behavior: smooth;
    /* Adds smooth scrolling behavior */
}

/* Allow mouse wheel scroll within .logs-output */
.logs-output:hover {
    overflow-y: scroll;
}

/* Ensure that .logs-output remains scrollable when focused */
.logs-output:focus {
    overflow-y: scroll;
}

.log-line {
    white-space: pre-wrap;
}

</style>
