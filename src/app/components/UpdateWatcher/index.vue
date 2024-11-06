<!-- src/app/components/UpdateWatcher/index.vue -->
<template>
    <div>
        <i v-if="updateStatus && updateStatus.behindBy > 0" class="el-icon-warning icon-needs-updating" :title="`${updateStatus.behindBy} commit(s) behind`" @click="navigateToSettings">
        </i>
        <i v-else class="el-icon-success icon-up-to-date" title="Up-to-date with the master branch"></i>
    </div>
</template>
<script>
import { checkUpdates } from "@/api/backend";

export default {
    name: "UpdateWatcher",
    data() {
        return {
            updateStatus: null,
            errorMessage: null,
        };
    },
    methods: {
        async fetchUpdates() {
            try {
                const response = await checkUpdates();
                if (response.success) {
                    const backendUpdate = response.updates.Backend;
                    this.updateStatus = backendUpdate;
                } else {
                    this.errorMessage = "Failed to fetch update status";
                }
            } catch (error) {
                this.errorMessage = "An error occurred while checking for updates";
                console.error(error);
            }
        },
        navigateToSettings() {
            this.$router.push('/settings/index?startIndex=1');
        },
    },
    mounted() {
        this.fetchUpdates();
    },
};

</script>
<style scoped>
.icon-up-to-date {
    vertical-align: middle;
    font-size: 20px;
    text-align: center;
    color: #E4D04D;
}

.icon-needs-updating {
    cursor: pointer;
    vertical-align: middle;
    font-size: 20px;
    cursor: pointer;
    text-align: center;
    color: #ff0000;
    animation: blink-animation 5s linear infinite;
}

@keyframes blink-animation {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0;
    }
}

</style>
