<template>
    <div>
        <el-col :span="split">
            <el-card class="box-card" shadow="hover">
                <div slot="header" class="clearfix">
                    <div class="plan-title">{{plan.invoice_name}}</div>
                    <div class="plan-price">{{plan.price}} {{plan.currency_code}} / {{plan.period_unit}}</div>
                </div>
                <div class="plan-item">
                    <div class="plan-item-title">Parallel processing x{{plan.meta_data.servers_included}}</div>
                </div>
                <div class="plan-item">
                    <div class="plan-item-title">CPU Cores: {{plan.meta_data.servers_included * 8}}</div>
                </div>
                <div class="plan-item">
                    <div class="plan-item-title">Storage {{plan.meta_data.features.storage_quota_gb}} GB</div>
                </div>
                <div class="plan-item">
                    <div class="plan-item-title">{{plan.meta_data.features.private_projects_quota }} private project</div>
                </div>
                <div class="plan-item">
                    <div class="plan-item-title">{{plan.meta_data.features.public_models_quota}} public models</div>
                </div>
                <div class="plan-item">
                    <div class="plan-item-title">Bandwidth</div>
                    <div class="plan-item-value">{{plan.meta_data.features.bandwidth_quota}}</div>
                </div>
                <div class="plan-item">
                    <div class="plan-item-title">Support</div>
                    <div class="plan-item-value">{{plan.meta_data.features.support}}</div>
                </div>
                <div class="plan-item">
                    <div class="plan-item-title">Exploratory analysis</div>
                </div>
                <div class="select-plan">
                    <el-button type="primary" @click="$emit('chage-plan-id', plan.id)">Select</el-button>
                </div>
            </el-card>
        </el-col>
    </div>
</template>
<script>
// Example: http://127.0.0.1:8186/backend/system/plans/list/cHJpdmF0ZQ%3D%3D

export default {
    name: "Private",
    props: ["plandetails", "itemsplit"],
    data() {
        return {
            plan: null,
            split: 8
        };
    },
    created() {
        if (this.plan === null) {
            this.plan = this.plandetails;
            this.split = this.itemsplit;
        }
    },
    mounted() {
        console.log("mounted: plan");
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
.el-card__body {
    padding: 10px;
}

.el-card__header {
    padding: 10px;
}

.plan-title {
    text-align: center;
    font-size: 24px;
}

.plan-price {
    text-align: center;
    font-size: 16px;
    padding-top: 10px;
}

.plan-item {
    width: 100%;
    float: left;
    font-size: 1.4rem;
    text-align: center;
    white-space: nowrap;

    .plan-item-title {
        background-color: rgba(23, 61, 80, 0.06);
        padding: 5px;
        font-size: 14px;
        width: 100%;
        float: left;
    }

    .plan-item-value {
        padding: 5px;
        font-size: 14px;
        width: 100%;
        float: left;
    }
    &:not(:first-child) {
        margin-top: 10px;
    }
}

.select-plan {
    text-align: center;
    button {
        margin-top: 20px;
    }
}
</style>
