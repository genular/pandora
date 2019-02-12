/*
 * @Author: LogIN-
 * @Date:   2019-01-25 17:05:53
 * @Last Modified by:   LogIN-
 * @Last Modified time: 2019-02-12 10:26:55
 */

export function tutorial() {
	const steps = [
		{
			element: ".sidebar-container",
			stageBackground: "transparent",
			popover: {
				title: this.$t("views.dashboard.admin.tutorial.step_1.title"),
				description: this.$t("views.dashboard.admin.tutorial.step_1.description"),
				// position can be left, left-center, left-bottom, top,
				// top-center, top-right, right, right-center, right-bottom,
				// bottom, bottom-center, bottom-right
				position: "right-center"
			}
		},
		{
			element: ".is-active",
			stageBackground: "transparent",
			popover: {
				title: this.$t("views.dashboard.admin.tutorial.step_2.title"),
				description: this.$t("views.dashboard.admin.tutorial.step_2.description"),
				position: "bottom-left"
			}
		},
		{
			element: ".dashboard-inner-container",
			stageBackground: "#FFFFFF",
			popover: {
				title: this.$t("views.dashboard.admin.tutorial.step_3.title"),
				description: this.$t("views.dashboard.admin.tutorial.step_3.description"),
				position: "bottom-center",
				// Will show it 20 pixels away from the actual position of popover
				// You may also provide the negative values
				offset: 0
			}
		},
		{
			element: ".queue-list-container-table",
			stageBackground: "#FFFFFF",
			popover: {
				title: this.$t("views.dashboard.admin.tutorial.step_4.title"),
				description: this.$t("views.dashboard.admin.tutorial.step_4.description"),
				position: "bottom"
			}
		},
		{
			element: ".filter-container",
			stageBackground: "transparent",
			popover: {
				title: this.$t("views.dashboard.admin.tutorial.step_5.title"),
				description: this.$t("views.dashboard.admin.tutorial.step_5.description"),
				position: "bottom"
			}
		},
		{
			element: ".dashboard-inner-panel-group",
			stageBackground: "transparent",
			popover: {
				title: this.$t("views.dashboard.admin.tutorial.step_6.title"),
				description: this.$t("views.dashboard.admin.tutorial.step_6.description"),
				position: "bottom"
			}
		},
		{
			element: ".tags-view-container",
			stageBackground: "transparent",
			popover: {
				title: this.$t("views.dashboard.admin.tutorial.step_7.title"),
				description: this.$t("views.dashboard.admin.tutorial.step_7.description"),
				position: "bottom"
			}
		},
		{
			element: ".selected-files-container",
			stageBackground: "transparent",
			popover: {
				title: this.$t("views.dashboard.admin.tutorial.step_8.title"),
				description: this.$t("views.dashboard.admin.tutorial.step_8.description"),
				position: "bottom"
			}
		},
		{
			element: ".international",
			stageBackground: "transparent",
			popover: {
				title: this.$t("views.dashboard.admin.tutorial.step_9.title"),
				description: this.$t("views.dashboard.admin.tutorial.step_9.description"),
				position: "left"
			}
		}
	];

	return steps;
}
