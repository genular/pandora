/*
 * @Author: LogIN-
 * @Date:   2019-01-23 15:04:44
 * @Last Modified by:   LogIN-
 * @Last Modified time: 2019-04-03 09:55:51
 */

/**
 * [downloadItemsTemplate description]
 * @param  {array} items Array containing URLS to download files
 * @return {string}
 */
export function downloadItemsTemplate(items) {
	let template = "";

	items.forEach(function (item) {
		template += '<span class="download_link">';

		template += '<a class="alert_download_item" href="' + item["download_url"] + '" target="_blank" title="' + item["filename"] + '">' + item["filename"] + "</a>";
		if (typeof item["local_download_url"] !== "undefined") {
			template +=
				'<a class="alert_download_item_local" href="' + item["local_download_url"] + '" title="Send to Workspace" target="_blank"><i class="el-icon-s-promotion"></i></a>';
		}

		template += "</span>";
	});

	return template;
}
