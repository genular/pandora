/*
 * @Author: LogIN-
 * @Date:   2019-01-25 17:05:53
 * @Last Modified by:   LogIN-
 * @Last Modified time: 2019-01-25 17:13:46
 */

const steps = [
	{
		element: ".hamburger-container",
		popover: {
			title: "Hamburger",
			description: "Open && Close sidebar",
			position: "bottom"
		}
	},
	{
		element: ".breadcrumb-container",
		popover: {
			title: "Breadcrumb",
			description: "Indicate the current page location",
			position: "bottom"
		}
	},
	{
		element: ".international",
		popover: {
			title: "Switch language",
			description: "Switch the system language",
			position: "left"
		}
	},
	{
		element: ".avatar-container",
		popover: {
			title: "Your account",
			description: "Change account details",
			position: "left"
		}
	},
	{
		element: ".tags-view-container",
		popover: {
			title: "Tags view",
			description: "The history of the page you visited",
			position: "bottom"
		},
		padding: 0
	},
	{
		element: ".panel-group",
		popover: {
			title: "Processing statistics",
			description: "Here you will find information about your processing history",
			position: "bottom"
		}
	}
];

export default steps;
