<template>
    <div class="tags-view-container">
        <scroll-pane class="tags-view-wrapper" ref="scrollPane">
            <router-link
                ref="tag"
                class="tags-view-item"
                :class="isActive(tag) ? 'active' : ''"
                v-for="tag in Array.from(visitedViews)"
                :to="tag.path"
                :key="tag.path"
                @contextmenu.prevent.native="openMenu(tag, $event)"
            >
                {{ generateRouteTitle(tag.title) }}
                <span v-if="visitedViews.length > 1" class="el-icon-close" @click.prevent.stop="closeSelectedTag(tag)"></span>
            </router-link>
        </scroll-pane>

        <div class="context-menu" v-show="visible" :style="{ left: left + 'px', top: top + 'px' }">
            <ul class="menu-options">
                <li class="menu-option" @click="closeSelectedTag(selectedTag)">{{ $t('views.layout.components.TagsView.context_menu.close') }}</li>
                <li class="menu-option" @click="closeOthersTags">{{ $t('views.layout.components.TagsView.context_menu.close_others') }}</li>
                <li class="menu-option" @click="closeAllTags">{{ $t('views.layout.components.TagsView.context_menu.close_all') }}</li>
            </ul>
        </div>
    </div>
</template>
<script>
import ScrollPane from "@/components/ScrollPane";
import { generateRouteTitle } from "@/utils/i18n";

export default {
    components: {
        ScrollPane
    },
    data() {
        return {
            visible: false,
            top: 0,
            left: 0,
            selectedTag: {}
        };
    },
    computed: {
        visitedViews() {
            return this.$store.state.tagsView.visitedViews;
        }
    },
    watch: {
        $route() {
            this.addViewTags();
            this.moveToCurrentTag();
        },
        visible(value) {
            if (value) {
                window.addEventListener("click", this.closeMenu);
            } else {
                window.removeEventListener("click", this.closeMenu);
            }
        }
    },
    mounted() {
        this.addViewTags();
    },
    methods: {
        generateRouteTitle,
        generateRoute() {
            if (this.$route.name) {
                return this.$route;
            }
            return false;
        },
        isActive(route) {
            return route.path === this.$route.path || route.name === this.$route.name;
        },
        addViewTags() {
            const route = this.generateRoute();
            if (!route) {
                return false;
            }
            this.$store.dispatch("addVisitedViews", route);
        },
        moveToCurrentTag() {
            const tags = this.$refs.tag;
            this.$nextTick(() => {
                for (const tag of tags) {
                    if (tag.to === this.$route.path) {
                        this.$refs.scrollPane.moveToTarget(tag.$el);
                        break;
                    }
                }
            });
        },
        closeSelectedTag(view) {
            this.$store.dispatch("delVisitedViews", view).then(views => {
                if (this.isActive(view)) {
                    const latestView = views.slice(-1)[0];
                    if (latestView) {
                        this.$router.push(latestView.path);
                    } else {
                        this.$router.push("/");
                    }
                }
            });
        },
        closeOthersTags() {
            this.$router.push(this.selectedTag.path);
            this.$store.dispatch("delOthersViews", this.selectedTag).then(() => {
                this.moveToCurrentTag();
            });
        },
        closeAllTags() {
            this.$store.dispatch("delAllViews");
            this.$router.push("/");
        },
        openMenu(tag, e) {
            if (this.$store.state.tagsView.visitedViews.length > 1) {
                this.visible = true;
                this.selectedTag = tag;

                this.left = e.clientX;
                this.top = e.clientY;
            }
        },
        closeMenu() {
            this.visible = false;
        }
    }
};
</script>
<style rel="stylesheet/scss" lang="scss" scoped>
@import "~scss_vars";
.tags-view-container {
    width: 100%;
    float: left;
    height: 50px;
    line-height: 50px;
    box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.05);

    .tags-view-wrapper {
        background: #ffffff;
        height: 50px;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 0 3px 0 rgba(0, 0, 0, 0.04);
        .tags-view-item {
            display: inline-block;
            position: relative;
            height: 40px;
            line-height: 40px;
            color: #ffffff;
            background: $ui-background;
            padding: 0 10px;
            font-size: 12px;
            margin-left: 5px;
            &:first-of-type {
                margin-left: 5px;
            }
            &.active {
                background-color: $ui-background;
                color: #ffffff;
                &::before {
                    content: "";
                    display: block;
                    position: absolute;
                    width: 3px;
                    background-color: #e3006e;
                    height: 100%;
                    left: 0;
                }
            }
        }
    }
    .context-menu {
        box-shadow: 0 4px 5px 3px rgb(239, 240, 249);
        position: fixed;
        z-index: 1001;
        background-color: #ffffff;

        .menu-options {
            list-style: none;
            padding: 0;
            margin: 0;

            .menu-option {
                font-size: 14px;
                padding: 10px 40px 10px 20px;
                line-height: 20px;
                cursor: pointer;

                &:hover {
                    background: rgb(239, 240, 249);
                }
            }
        }
    }
}

.tags-view-wrapper {
    .tags-view-item {
        .el-icon-close {
            width: 16px;
            height: 16px;
            vertical-align: 2px;
            border-radius: 50%;
            text-align: center;
            transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
            transform-origin: 100% 50%;
            font-weight: bold;
            &:before {
                transform: scale(0.6);
                display: inline-block;
                vertical-align: -3px;
            }
            &:hover {
                background-color: #e3006e;
                color: #FFFFFF;
            }
        }
    }
}
</style>
