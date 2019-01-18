<template>
    <div class="app-container dashboard-container">
        <component :is="currentRole"></component>
    </div>
</template>
<script>
import { mapGetters } from "vuex";

import adminDashboard from "./admin";
import editorDashboard from "./editor";

export default {
    name: "dashboard",
    components: {
        adminDashboard,
        editorDashboard
    },
    data() {
        return {
            currentRole: "adminDashboard"
        };
    },
    computed: {
        ...mapGetters(["user_roles", "is_online"])
    },
    created() {
        // if (!this.user_roles.includes(2)) {
        this.currentRole = "adminDashboard";
        // }
    }
};
</script>
