// translate router.meta.title, be used in breadcrumb sidebar tagsview
export function generateTitle(title) {
	const translatedTitle = this.$t("route." + title);

	if (translatedTitle) {
		return translatedTitle;
	}
	return title;
}
