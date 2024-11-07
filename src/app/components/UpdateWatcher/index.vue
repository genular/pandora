<!-- src/app/components/UpdateWatcher/index.vue -->

<template>
    <div>
        <div v-if="updateStatus">
            <i v-if="updateStatus.frontend && updateStatus.frontend.behindBy > 0" 
               class="el-icon-warning icon-needs-updating" 
               :title="`Frontend: ${updateStatus.frontend.behindBy} commit(s) behind`" 
               @click="navigateToSettings('frontend')">
            </i>
            <i v-else 
               class="el-icon-success icon-up-to-date" 
               title="Frontend: Up-to-date with the master branch">
            </i>

            <i v-if="updateStatus.backend && updateStatus.backend.behindBy > 0" 
               class="el-icon-warning icon-needs-updating" 
               :title="`Backend: ${updateStatus.backend.behindBy} commit(s) behind`" 
               @click="navigateToSettings('backend')">
            </i>
            <i v-else 
               class="el-icon-success icon-up-to-date" 
               title="Backend: Up-to-date with the master branch">
            </i>
        </div>
        <div v-if="errorMessage" class="error">{{ errorMessage }}</div>
    </div>
</template>

<script>
import { checkUpdates } from "@/api/backend";

export default {
    name: "UpdateWatcher",
    data() {
        return {
            updateStatus: {
                frontend: null,
                backend: null,
            },
            errorMessage: null,
        };
    },
    methods: {
        async fetchUpdates() {
            try {
                const response = await checkUpdates();
                if (response.success) {
                    this.updateStatus = {
                        frontend: response.updates.Frontend,
                        backend: response.updates.Backend,
                    };
                } else {
                    this.errorMessage = "Failed to fetch update status";
                }
            } catch (error) {
                this.errorMessage = "An error occurred while checking for updates";
                console.error(error);
            }
        },
        navigateToSettings(section) {
            this.$router.push(`/settings/index?startIndex=${section === 'frontend' ? 0 : 1}`);
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
