/**
 * This function translates sidebar components from router.meta.title key located in src/app/router/index.js
 * This translations are also used in breadcrumb and tag boxes
 * @param  string title [description]
 * @return string       [description]
 */
export function generateRouteTitle(title) {
	const translatedTitle = this.$t("sidebar." + title);

	if (translatedTitle) {
		return translatedTitle;
	}
	return title;
}