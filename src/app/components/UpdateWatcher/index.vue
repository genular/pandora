<!-- src/app/components/UpdateWatcher/index.vue -->
<template>
    <div>
        <i v-if="isBehind" class="el-icon-warning icon-needs-updating" title="Updates available" @click="navigateToSettings">
        </i>
        <i v-else class="el-icon-success icon-up-to-date" title="Up-to-date with the master branch">
        </i>
    </div>
</template>
<script>
import { checkUpdates, checkRegistration } from "@/api/backend";

export default {
    name: "UpdateWatcher",
    data() {
        return {
            updateStatus: {
                frontend: null,
                backend: null,
            },
            errorMessage: null,
            updateInterval: null,
            registrationInterval: null,
        };
    },
    computed: {
        registrationCheckCounter: {
            get() {
                return this.$store.getters.registrationCheckCounter;
            },
            set(value) {
                this.$store.dispatch("setRegistrationCheckCounter", value);
            },
        },
        isBehind() {
            return (
                (this.updateStatus.frontend && this.updateStatus.frontend.behindBy > 0) ||
                (this.updateStatus.backend && this.updateStatus.backend.behindBy > 0)
            );
        }
    },
    methods: {
        async fetchUpdates() {
            try {
                const response = await checkUpdates();

                if (response.data.success) {
                    this.updateStatus = {
                        frontend: response.data.updates.Frontend,
                        backend: response.data.updates.Backend,
                    };
                } else {
                    this.errorMessage = "Failed to fetch update status";
                }
            } catch (error) {
                this.errorMessage = "An error occurred while checking for updates";
                console.error(error);
            }
        },
        async checkRegistrationStatus() {
            try {
                const response = await checkRegistration();

                if (response.data.status === false) {
                    // Display message and prepare to log out the user if registration is invalid
                    this.$message.error("Your registration key is invalid. Please update it in Settings to continue, or you will be logged out in 15 minutes.");
                    this.registrationCheckCounter++;
                    if (this.registrationCheckCounter > 5) {
                        this.logoutUser();
                    }
                } else {
                    // Reset the counter if registration is valid
                    this.registrationCheckCounter = 0;
                }
            } catch (error) {
                console.error("An error occurred while checking registration status", error);
                
                // Increment the counter if the request fails
                this.registrationCheckCounter++;
                if (this.registrationCheckCounter > 5) {
                    this.$message.error("Repeated errors connecting to the registration server.");
                    //this.logoutUser();
                }
            }
        },
        navigateToSettings() {
            this.$router.push('/settings/index?startIndex=1');
        },
        logoutUser() {
            this.$store
                .dispatch("userLogout")
                .then(status => {
                    console.log("userLogout status: " + status);
                    if (status === true) {
                        // In order to re-instantiate the vue-router object to avoid bugs
                        location.reload();
                    }
                })
                .catch(error => {
                    console.log(error);
                });
        },
    },
    mounted() {
        // Initial calls
        this.fetchUpdates();
        this.checkRegistrationStatus();

        // Set interval to call fetchUpdates every hour (3600000 milliseconds)
        this.updateInterval = setInterval(() => {
            this.fetchUpdates();
        }, 3600000);

        // Set interval to call checkRegistrationStatus every 15 minutes (900000 milliseconds)
        this.registrationInterval = setInterval(() => {
            this.checkRegistrationStatus();
        }, 900000);
    },
    beforeDestroy() {
        // Clear the intervals when the component is destroyed to prevent memory leaks
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.registrationInterval) {
            clearInterval(this.registrationInterval);
        }
    }
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
    animation: blink-animation 3s linear infinite;
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
