/*
 * @Author: LogIN-
 * @Date:   2019-01-25 17:05:53
 * @Last Modified by:   LogIN-
 * @Last Modified time: 2019-01-29 13:36:41
 */

export function tutorial() {
	const steps = [
		{
			element: ".sidebar-container",
			stageBackground: "transparent",
			popover: {
				title: this.$t("Welcome to genular! Lets do some explanation.."),
				description: "Here on the right you will find main navigation menu.",
				// position can be left, left-center, left-bottom, top,
				// top-center, top-right, right, right-center, right-bottom,
				// bottom, bottom-center, bottom-right
				position: "right-center"
			}
		},
		{
			element: ".dashboard-container",
			stageBackground: "#FFFFFF",
			popover: {
				title: "You are currently located in Dashboard",
				description:
					"Thats it the place where you can track your job progresses, and view statistics about your application usage. Most importantly here you can select job items that are already finished and afterwards do additional exploratory analysis on them.",
				position: "bottom-center",
				// Will show it 20 pixels away from the actual position of popover
				// You may also provide the negative values
				offset: 0
			}
		},
		{
			element: ".queue-list-container-table",
			stageBackground: "#ffffff",
			popover: {
				title: "Processing Queue",
				description:
					"Here you can find list of current and future submitted processing jobs. Once item is processed you can find more details about it by clicking on Info button on the right. You can also use search and export functions to easily find specific queue item.",
				position: "bottom"
			}
		},
		{
			element: ".filter-container",
			stageBackground: "transparent",
			popover: {
				title: "Queue filters",
				description: "You can also use search and export functions to easily find specific queue item.",
				position: "bottom"
			}
		},
		{
			element: ".dashboard-inner-panel-group",
			stageBackground: "transparent",
			popover: {
				title: "Main statistics",
				description: "Contains number of total tasks/jobs submitted. Number of datasets generated. Total number of models processed. And overall features extracted.",
				position: "bottom"
			}
		},
		{
			element: ".tags-view-container",
			stageBackground: "transparent",
			popover: {
				title: "Opened pages",
				description: "Each page is opened in its own tab. Here you can easily switch between pages.",
				position: "bottom"
			}
		}
	];

	return steps;
}
